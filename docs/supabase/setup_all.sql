-- Run this file in Supabase SQL Editor to recreate all required tables
-- 1) Activities table + policies
-- Copy from activities_schema.sql below

-- === ACTIVITIES START ===
create table if not exists public.activities (
  id text primary key,
  task_type text not null,
  title text not null,
  subject_id text,
  subject_name text,
  course_id text,
  section_id text,
  created_at timestamptz not null,
  start_at timestamptz,
  open_at timestamptz,
  due_date timestamptz,
  status text,
  assigned_by_id text,
  assigned_by_name text,
  year integer not null
);
alter table public.activities add column if not exists task_type text;
alter table public.activities add column if not exists subject_id text;
alter table public.activities add column if not exists subject_name text;
alter table public.activities add column if not exists course_id text;
alter table public.activities add column if not exists section_id text;
alter table public.activities add column if not exists created_at timestamptz;
alter table public.activities add column if not exists start_at timestamptz;
alter table public.activities add column if not exists open_at timestamptz;
alter table public.activities add column if not exists due_date timestamptz;
alter table public.activities add column if not exists status text;
alter table public.activities add column if not exists assigned_by_id text;
alter table public.activities add column if not exists assigned_by_name text;
alter table public.activities add column if not exists year integer;
create index if not exists idx_activities_year on public.activities (year);
create index if not exists idx_activities_section on public.activities (section_id);
create index if not exists idx_activities_task_type on public.activities (task_type);
alter table public.activities enable row level security;
drop policy if exists activities_select_public on public.activities;
create policy activities_select_public on public.activities for select to anon using (true);
drop policy if exists activities_insert_public on public.activities;
create policy activities_insert_public on public.activities for insert to anon with check (true);
drop policy if exists activities_update_public on public.activities;
create policy activities_update_public on public.activities for update to anon using (true) with check (true);
-- === ACTIVITIES END ===

-- 2) Grades table + policies
-- Copy from grades_schema.sql
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
  updated_at timestamptz
);
create index if not exists idx_grades_year on public.grades (year);
create index if not exists idx_grades_student on public.grades (student_id);
alter table public.grades enable row level security;
drop policy if exists grades_select_public on public.grades;
create policy grades_select_public on public.grades for select to anon using (true);
drop policy if exists grades_upsert_public on public.grades;
create policy grades_upsert_public on public.grades for insert to anon with check (true);
drop policy if exists grades_update_public on public.grades;
create policy grades_update_public on public.grades for update to anon using (true) with check (true);

-- 3) Attendance table + policies
-- Copy from attendance_schema.sql
create table if not exists public.attendance (
  id text primary key,
  date timestamptz not null,
  course_id text,
  section_id text,
  student_id text not null,
  status text not null,
  present boolean,
  comment text,
  created_at timestamptz,
  updated_at timestamptz,
  year integer not null
);
create index if not exists idx_attendance_year on public.attendance (year);
create index if not exists idx_attendance_date on public.attendance (date);
create index if not exists idx_attendance_student on public.attendance (student_id);
alter table public.attendance enable row level security;
drop policy if exists attendance_select_public on public.attendance;
create policy attendance_select_public on public.attendance for select to anon using (true);
drop policy if exists attendance_insert_public on public.attendance;
create policy attendance_insert_public on public.attendance for insert to anon with check (true);
drop policy if exists attendance_update_public on public.attendance;
create policy attendance_update_public on public.attendance for update to anon using (true) with check (true);

-- Finally, reload PostgREST schema cache
select pg_notify('pgrst', 'reload schema');
