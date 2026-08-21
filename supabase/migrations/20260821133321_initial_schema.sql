begin;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.text_array_has_only_nonempty_values(items text[])
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select not exists (
    select 1
    from unnest(items) as item
    where item is null or char_length(btrim(item)) = 0
  );
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.text_array_has_only_nonempty_values(text[]) from public;
grant execute on function public.set_updated_at() to authenticated;
grant execute on function public.text_array_has_only_nonempty_values(text[]) to authenticated;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) > 0),
  course text not null check (char_length(btrim(course)) > 0),
  group_name text not null check (char_length(btrim(group_name)) > 0),
  deadline date not null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  email text check (email is null or char_length(btrim(email)) > 0),
  github_username text check (
    github_username is null or char_length(btrim(github_username)) > 0
  ),
  google_email text check (
    google_email is null or char_length(btrim(google_email)) > 0
  ),
  auth_user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_project_id_id_key unique (project_id, id)
);

create table public.source_connections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_type text not null check (source_type in ('github', 'google_docs')),
  external_id text not null check (char_length(btrim(external_id)) > 0),
  display_name text not null check (char_length(btrim(display_name)) > 0),
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  constraint source_connections_project_id_id_key unique (project_id, id),
  constraint source_connections_project_source_external_key unique (
    project_id,
    source_type,
    external_id
  )
);

create table public.github_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_connection_id uuid not null,
  member_id uuid,
  commit_sha text not null check (char_length(btrim(commit_sha)) > 0),
  commit_message text not null check (char_length(btrim(commit_message)) > 0),
  author_name text check (
    author_name is null or char_length(btrim(author_name)) > 0
  ),
  author_email text check (
    author_email is null or char_length(btrim(author_email)) > 0
  ),
  authored_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint github_activity_project_source_fk foreign key (
    project_id,
    source_connection_id
  ) references public.source_connections(project_id, id) on delete cascade,
  constraint github_activity_project_member_fk foreign key (
    project_id,
    member_id
  ) references public.members(project_id, id) on delete set null (member_id),
  constraint github_activity_source_commit_key unique (
    source_connection_id,
    commit_sha
  )
);

create table public.docs_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_connection_id uuid not null,
  member_id uuid,
  activity_type text not null check (
    activity_type in ('edit', 'comment', 'suggestion')
  ),
  actor_email text check (
    actor_email is null or char_length(btrim(actor_email)) > 0
  ),
  provider_activity_id text check (
    provider_activity_id is null
    or char_length(btrim(provider_activity_id)) > 0
  ),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint docs_activity_project_source_fk foreign key (
    project_id,
    source_connection_id
  ) references public.source_connections(project_id, id) on delete cascade,
  constraint docs_activity_project_member_fk foreign key (
    project_id,
    member_id
  ) references public.members(project_id, id) on delete set null (member_id)
);

create table public.member_context (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  member_id uuid not null,
  context_text text not null check (char_length(btrim(context_text)) > 0),
  submitted_by_user_id uuid not null default auth.uid() references auth.users(id),
  submission_type text not null default 'project_owner_recorded' check (
    submission_type in ('member_self_reported', 'project_owner_recorded')
  ),
  created_at timestamptz not null default now(),
  constraint member_context_project_member_fk foreign key (
    project_id,
    member_id
  ) references public.members(project_id, id) on delete cascade
);

create table public.member_role_context (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  member_id uuid not null unique,
  primary_role text not null check (char_length(btrim(primary_role)) > 0),
  additional_roles text[] not null default '{}',
  responsibilities text[] not null default '{}',
  additional_context text check (
    additional_context is null or char_length(btrim(additional_context)) > 0
  ),
  submission_type text not null default 'project_owner_recorded' check (
    submission_type in ('member_self_reported', 'project_owner_recorded')
  ),
  submitted_by_user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_role_context_additional_roles_check check (
    public.text_array_has_only_nonempty_values(additional_roles)
  ),
  constraint member_role_context_responsibilities_check check (
    public.text_array_has_only_nonempty_values(responsibilities)
  ),
  constraint member_role_context_project_member_fk foreign key (
    project_id,
    member_id
  ) references public.members(project_id, id) on delete cascade
);

create unique index members_project_email_unique
  on public.members (project_id, lower(email))
  where email is not null;

create unique index members_project_github_username_unique
  on public.members (project_id, lower(github_username))
  where github_username is not null;

create unique index members_project_google_email_unique
  on public.members (project_id, lower(google_email))
  where google_email is not null;

create unique index members_project_auth_user_unique
  on public.members (project_id, auth_user_id)
  where auth_user_id is not null;

create index projects_created_by_idx on public.projects (created_by);
create index members_auth_user_id_idx
  on public.members (auth_user_id)
  where auth_user_id is not null;
create index github_activity_project_authored_at_idx
  on public.github_activity (project_id, authored_at desc);
create index github_activity_project_member_idx
  on public.github_activity (project_id, member_id);
create index github_activity_project_source_idx
  on public.github_activity (project_id, source_connection_id);
create index docs_activity_project_occurred_at_idx
  on public.docs_activity (project_id, occurred_at desc);
create index docs_activity_project_member_idx
  on public.docs_activity (project_id, member_id);
create index docs_activity_project_source_idx
  on public.docs_activity (project_id, source_connection_id);
create unique index docs_activity_source_provider_id_unique
  on public.docs_activity (source_connection_id, provider_activity_id)
  where provider_activity_id is not null;
create index member_context_project_member_idx
  on public.member_context (project_id, member_id);
create index member_context_submitted_by_idx
  on public.member_context (submitted_by_user_id);
create index member_role_context_project_member_idx
  on public.member_role_context (project_id, member_id);
create index member_role_context_submitted_by_idx
  on public.member_role_context (submitted_by_user_id);

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger members_set_updated_at
before update on public.members
for each row execute function public.set_updated_at();

create trigger member_role_context_set_updated_at
before update on public.member_role_context
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.members enable row level security;
alter table public.source_connections enable row level security;
alter table public.github_activity enable row level security;
alter table public.docs_activity enable row level security;
alter table public.member_context enable row level security;
alter table public.member_role_context enable row level security;

create policy projects_select_owner
on public.projects
for select
to authenticated
using (created_by = (select auth.uid()));

create policy projects_insert_owner
on public.projects
for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy projects_update_owner
on public.projects
for update
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

create policy projects_delete_owner
on public.projects
for delete
to authenticated
using (created_by = (select auth.uid()));

create policy members_select_owner
on public.members
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = members.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy members_insert_owner_unlinked
on public.members
for insert
to authenticated
with check (
  auth_user_id is null
  and exists (
    select 1
    from public.projects
    where projects.id = members.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy members_update_owner_unlinked
on public.members
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = members.project_id
      and projects.created_by = (select auth.uid())
  )
)
with check (
  auth_user_id is null
  and exists (
    select 1
    from public.projects
    where projects.id = members.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy members_delete_owner
on public.members
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = members.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy source_connections_select_owner
on public.source_connections
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = source_connections.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy source_connections_insert_owner
on public.source_connections
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where projects.id = source_connections.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy source_connections_update_owner
on public.source_connections
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = source_connections.project_id
      and projects.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = source_connections.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy source_connections_delete_owner
on public.source_connections
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = source_connections.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy github_activity_select_owner
on public.github_activity
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = github_activity.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy github_activity_insert_owner
on public.github_activity
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where projects.id = github_activity.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy github_activity_update_owner
on public.github_activity
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = github_activity.project_id
      and projects.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = github_activity.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy github_activity_delete_owner
on public.github_activity
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = github_activity.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy docs_activity_select_owner
on public.docs_activity
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = docs_activity.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy docs_activity_insert_owner
on public.docs_activity
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where projects.id = docs_activity.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy docs_activity_update_owner
on public.docs_activity
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = docs_activity.project_id
      and projects.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = docs_activity.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy docs_activity_delete_owner
on public.docs_activity
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = docs_activity.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy member_context_select_owner
on public.member_context
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = member_context.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy member_context_insert_owner
on public.member_context
for insert
to authenticated
with check (
  submission_type = 'project_owner_recorded'
  and submitted_by_user_id = (select auth.uid())
  and exists (
    select 1
    from public.projects
    where projects.id = member_context.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy member_context_update_owner
on public.member_context
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = member_context.project_id
      and projects.created_by = (select auth.uid())
  )
)
with check (
  submission_type = 'project_owner_recorded'
  and submitted_by_user_id = (select auth.uid())
  and exists (
    select 1
    from public.projects
    where projects.id = member_context.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy member_context_delete_owner
on public.member_context
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = member_context.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy member_role_context_select_owner
on public.member_role_context
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = member_role_context.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy member_role_context_insert_owner
on public.member_role_context
for insert
to authenticated
with check (
  submission_type = 'project_owner_recorded'
  and submitted_by_user_id = (select auth.uid())
  and exists (
    select 1
    from public.projects
    where projects.id = member_role_context.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy member_role_context_update_owner
on public.member_role_context
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = member_role_context.project_id
      and projects.created_by = (select auth.uid())
  )
)
with check (
  submission_type = 'project_owner_recorded'
  and submitted_by_user_id = (select auth.uid())
  and exists (
    select 1
    from public.projects
    where projects.id = member_role_context.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy member_role_context_delete_owner
on public.member_role_context
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = member_role_context.project_id
      and projects.created_by = (select auth.uid())
  )
);

revoke all on table public.projects from anon;
revoke all on table public.members from anon;
revoke all on table public.source_connections from anon;
revoke all on table public.github_activity from anon;
revoke all on table public.docs_activity from anon;
revoke all on table public.member_context from anon;
revoke all on table public.member_role_context from anon;

grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.members to authenticated;
grant select, insert, update, delete on table public.source_connections to authenticated;
grant select, insert, update, delete on table public.github_activity to authenticated;
grant select, insert, update, delete on table public.docs_activity to authenticated;
grant select, insert, update, delete on table public.member_context to authenticated;
grant select, insert, update, delete on table public.member_role_context to authenticated;

commit;
