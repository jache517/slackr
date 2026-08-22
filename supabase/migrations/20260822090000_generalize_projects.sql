begin;

-- Projects are no longer school-specific: a project is a title and a deadline.
alter table public.projects rename column name to title;
alter table public.projects rename constraint projects_name_check to projects_title_check;

alter table public.projects drop column course;
alter table public.projects drop column group_name;

commit;
