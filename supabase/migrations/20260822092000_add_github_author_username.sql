begin;

-- The Members screen names unmatched GitHub accounts by handle. A commit
-- carries only a name and an email, so the login has to be stored alongside.
alter table public.github_activity
  add column author_username text check (
    author_username is null or char_length(btrim(author_username)) > 0
  );

create index github_activity_project_author_username_idx
  on public.github_activity (project_id, lower(author_username))
  where author_username is not null;

commit;
