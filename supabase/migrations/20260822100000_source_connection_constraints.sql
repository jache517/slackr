begin;

alter table public.source_connections
  add constraint source_connections_project_source_type_unique
  unique (project_id, source_type);

create table public.google_oauth_intents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  requested_by_user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null default 'google_docs'
    check (source_type = 'google_docs'),
  external_id text not null check (char_length(btrim(external_id)) > 0),
  state_hash text not null unique check (char_length(state_hash) = 64),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index google_oauth_intents_project_user_idx
  on public.google_oauth_intents (project_id, requested_by_user_id);

create index google_oauth_intents_expiry_idx
  on public.google_oauth_intents (expires_at)
  where consumed_at is null;

alter table public.google_oauth_intents enable row level security;

revoke all on table public.google_oauth_intents from anon, authenticated;

create function public.create_google_oauth_intent(
  p_project_id uuid,
  p_external_id text,
  p_state_hash text,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_external_id text;
  locked_project_id uuid;
  new_id uuid;
begin
  if p_external_id is null
    or p_external_id !~ '^[A-Za-z0-9_-]+$'
    or p_state_hash is null
    or p_state_hash !~ '^[a-f0-9]{64}$'
    or p_expires_at <= now()
    or p_expires_at > now() + interval '10 minutes'
  then
    raise exception using message = 'invalid_intent';
  end if;

  select projects.id
    into locked_project_id
  from public.projects
  where projects.id = p_project_id
    and projects.created_by = (select auth.uid())
  for update;

  if locked_project_id is null then
    raise exception using message = 'project_not_found';
  end if;

  select source_connections.external_id
    into existing_external_id
  from public.source_connections
  where source_connections.project_id = p_project_id
    and source_connections.source_type = 'google_docs'
  limit 1;

  if existing_external_id is not null then
    if existing_external_id = p_external_id then
      raise exception using message = 'source_already_connected';
    end if;

    raise exception using message = 'source_type_already_connected';
  end if;

  update public.google_oauth_intents
  set consumed_at = now()
  where google_oauth_intents.project_id = p_project_id
    and google_oauth_intents.requested_by_user_id = (select auth.uid())
    and google_oauth_intents.source_type = 'google_docs'
    and google_oauth_intents.consumed_at is null;

  insert into public.google_oauth_intents (
    project_id,
    requested_by_user_id,
    source_type,
    external_id,
    state_hash,
    expires_at
  )
  values (
    p_project_id,
    (select auth.uid()),
    'google_docs',
    p_external_id,
    p_state_hash,
    p_expires_at
  )
  returning id into new_id;

  return new_id;
exception
  when unique_violation then
    raise exception using message = 'intent_conflict';
end;
$$;

create function public.consume_google_oauth_intent(p_state_hash text)
returns table (
  project_id uuid,
  requested_by_user_id uuid,
  external_id text,
  expires_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  update public.google_oauth_intents
  set consumed_at = now()
  where google_oauth_intents.id = (
    select intent.id
    from public.google_oauth_intents as intent
    join public.projects
      on projects.id = intent.project_id
     and projects.created_by = (select auth.uid())
    where intent.state_hash = p_state_hash
      and intent.requested_by_user_id = (select auth.uid())
      and intent.source_type = 'google_docs'
      and intent.consumed_at is null
      and intent.expires_at > now()
  )
    and google_oauth_intents.consumed_at is null
    and google_oauth_intents.expires_at > now()
  returning
    google_oauth_intents.project_id,
    google_oauth_intents.requested_by_user_id,
    google_oauth_intents.external_id,
    google_oauth_intents.expires_at;
$$;

revoke all on function public.create_google_oauth_intent(uuid, text, text, timestamptz)
  from public;
revoke all on function public.consume_google_oauth_intent(text)
  from public;
grant execute on function public.create_google_oauth_intent(uuid, text, text, timestamptz)
  to authenticated;
grant execute on function public.consume_google_oauth_intent(text)
  to authenticated;

commit;
