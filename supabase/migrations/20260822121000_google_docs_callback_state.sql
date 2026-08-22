begin;

alter table public.source_connections
  add column if not exists sync_error_code text,
  add column if not exists sync_error_message text,
  add column if not exists sync_error_at timestamptz;

drop index if exists public.docs_activity_source_provider_id_unique;

create unique index if not exists docs_activity_source_provider_id_key
  on public.docs_activity (source_connection_id, provider_activity_id)
  where provider_activity_id is not null;

create or replace function public.inspect_google_oauth_intent(p_state_hash text)
returns table (
  project_id uuid,
  requested_by_user_id uuid,
  external_id text,
  expires_at timestamptz,
  consumed_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select
    google_oauth_intents.project_id,
    google_oauth_intents.requested_by_user_id,
    google_oauth_intents.external_id,
    google_oauth_intents.expires_at,
    google_oauth_intents.consumed_at
  from public.google_oauth_intents
  join public.projects
    on projects.id = google_oauth_intents.project_id
   and projects.created_by = (select auth.uid())
  where google_oauth_intents.state_hash = p_state_hash
    and google_oauth_intents.requested_by_user_id = (select auth.uid())
    and google_oauth_intents.source_type = 'google_docs'
  limit 1;
$$;

revoke all on function public.inspect_google_oauth_intent(text) from public;
grant execute on function public.inspect_google_oauth_intent(text) to authenticated;

commit;
