-- Schema for 'grades' table expected by the app
create table if not exists public.grades (
  id text primary key,
  test_id text not null,
  student_id text not null,
  student_name text,
  score numeric,
  course_id text,
  section_id text,
  subject_id text,
  title text,
  graded_at timestamptz,
  year integer not null,
  type text,
  created_at timestamptz,
  updated_at timestamptz,
  topic text  -- Campo opcional: tema o descripción pedagógica de la actividad
);

create index if not exists idx_grades_year on public.grades (year);
create index if not exists idx_grades_student on public.grades (student_id);
create index if not exists idx_grades_topic on public.grades (topic) where topic is not null;

alter table public.grades enable row level security;
drop policy if exists grades_select_public on public.grades;
create policy grades_select_public on public.grades for select to anon using (true);
drop policy if exists grades_upsert_public on public.grades;
create policy grades_upsert_public on public.grades for insert to anon with check (true);
drop policy if exists grades_update_public on public.grades;
create policy grades_update_public on public.grades for update to anon using (true) with check (true);

select pg_notify('pgrst', 'reload schema');
