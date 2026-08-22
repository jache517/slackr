begin;

-- A GitHub account the owner has looked at and decided belongs to nobody in
-- this project: a bot, a tutor, someone's second account.
--
-- Without this there is nowhere to put that decision, so the "matched to
-- nobody" warning came back on every load no matter how many times it was
-- answered. Recording the decision is what lets the warning close.
create table public.unattributed_github_accounts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_username text not null,
  decided_by_user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  constraint unattributed_github_accounts_username_check
    check (char_length(btrim(author_username)) > 0)
);

-- GitHub handles are case insensitive, and the activity rows are already
-- indexed on lower(author_username), so the decision is keyed the same way.
create unique index unattributed_github_accounts_project_username_idx
  on public.unattributed_github_accounts (project_id, lower(author_username));

alter table public.unattributed_github_accounts enable row level security;

create policy unattributed_github_accounts_select_owner
on public.unattributed_github_accounts
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = unattributed_github_accounts.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy unattributed_github_accounts_insert_owner
on public.unattributed_github_accounts
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where projects.id = unattributed_github_accounts.project_id
      and projects.created_by = (select auth.uid())
  )
);

create policy unattributed_github_accounts_delete_owner
on public.unattributed_github_accounts
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = unattributed_github_accounts.project_id
      and projects.created_by = (select auth.uid())
  )
);

commit;
