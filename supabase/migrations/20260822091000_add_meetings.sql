begin;

-- Meetings are a third activity source alongside GitHub commits and doc edits.
alter table public.source_connections
  drop constraint source_connections_source_type_check;

alter table public.source_connections
  add constraint source_connections_source_type_check check (
    source_type in ('github', 'google_docs', 'google_meet')
  );

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_connection_id uuid not null,
  title text not null check (char_length(btrim(title)) > 0),
  provider_meeting_id text check (
    provider_meeting_id is null or char_length(btrim(provider_meeting_id)) > 0
  ),
  held_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint meetings_project_id_id_key unique (project_id, id),
  constraint meetings_project_source_fk foreign key (
    project_id,
    source_connection_id
  ) references public.source_connections(project_id, id) on delete cascade
);

create table public.meeting_attendance (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  meeting_id uuid not null,
  member_id uuid,
  attendee_name text check (
    attendee_name is null or char_length(btrim(attendee_name)) > 0
  ),
  attendee_email text check (
    attendee_email is null or char_length(btrim(attendee_email)) > 0
  ),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  constraint meeting_attendance_project_meeting_fk foreign key (
    project_id,
    meeting_id
  ) references public.meetings(project_id, id) on delete cascade,
  constraint meeting_attendance_project_member_fk foreign key (
    project_id,
    member_id
  ) references public.members(project_id, id) on delete set null (member_id)
);

create unique index meetings_source_provider_id_unique
  on public.meetings (source_connection_id, provider_meeting_id)
  where provider_meeting_id is not null;

-- One attendance row per member per meeting. Unmatched attendees leave
-- member_id null and are deduplicated on the email the provider reported.
create unique index meeting_attendance_meeting_member_unique
  on public.meeting_attendance (meeting_id, member_id)
  where member_id is not null;

create unique index meeting_attendance_meeting_email_unique
  on public.meeting_attendance (meeting_id, lower(attendee_email))
  where attendee_email is not null;

create index meetings_project_held_at_idx
  on public.meetings (project_id, held_at desc);
create index meetings_project_source_idx
  on public.meetings (project_id, source_connection_id);
create index meeting_attendance_project_member_idx
  on public.meeting_attendance (project_id, member_id);
create index meeting_attendance_project_meeting_idx
  on public.meeting_attendance (project_id, meeting_id);

alter table public.meetings enable row level security;
alter table public.meeting_attendance enable row level security;

create policy meetings_select_owner
on public.meetings
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = meetings.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy meetings_insert_owner
on public.meetings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where projects.id = meetings.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy meetings_update_owner
on public.meetings
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = meetings.project_id
      and projects.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = meetings.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy meetings_delete_owner
on public.meetings
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = meetings.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy meeting_attendance_select_owner
on public.meeting_attendance
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = meeting_attendance.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy meeting_attendance_insert_owner
on public.meeting_attendance
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where projects.id = meeting_attendance.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy meeting_attendance_update_owner
on public.meeting_attendance
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = meeting_attendance.project_id
      and projects.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = meeting_attendance.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy meeting_attendance_delete_owner
on public.meeting_attendance
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = meeting_attendance.project_id
      and projects.created_by = (select auth.uid())
  )
);

revoke all on table public.meetings from anon;
revoke all on table public.meeting_attendance from anon;

grant select, insert, update, delete on table public.meetings to authenticated;
grant select, insert, update, delete on table public.meeting_attendance to authenticated;

commit;
