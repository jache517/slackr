begin;

-- An optional note about the project, written at creation and shown back on
-- review. It carries no meaning for evidence collection: nothing reads it to
-- decide what to collect or how to attribute it.
alter table public.projects add column description text;

alter table public.projects
  add constraint projects_description_check
  check (description is null or char_length(description) <= 2000);

commit;
