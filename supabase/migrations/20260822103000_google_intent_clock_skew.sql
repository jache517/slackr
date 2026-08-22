begin;

create or replace function public.create_google_oauth_intent(
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
    or p_expires_at > now() + interval '11 minutes'
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

revoke all on function public.create_google_oauth_intent(uuid, text, text, timestamptz)
  from public;
grant execute on function public.create_google_oauth_intent(uuid, text, text, timestamptz)
  to authenticated;

commit;
