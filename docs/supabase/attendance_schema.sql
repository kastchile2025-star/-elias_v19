-- Schema for 'attendance' table expected by the app
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

select pg_notify('pgrst', 'reload schema');
