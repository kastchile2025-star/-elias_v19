-- Supabase migration for 'activities' table expected by the app
-- Use in Supabase SQL Editor. After applying, reset PostgREST cache.

-- 1) Create table if not exists
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

-- 2) Ensure missing columns (safe to re-run)
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

-- 3) Helpful indexes
create index if not exists idx_activities_year on public.activities (year);
create index if not exists idx_activities_section on public.activities (section_id);
create index if not exists idx_activities_task_type on public.activities (task_type);

-- 4) (Optional) RLS policies for development (adjust for production)
alter table public.activities enable row level security;
-- PostgreSQL no soporta "CREATE POLICY IF NOT EXISTS". Usar DROP IF EXISTS + CREATE
drop policy if exists activities_select_public on public.activities;
create policy activities_select_public on public.activities for select to anon using (true);

drop policy if exists activities_insert_public on public.activities;
create policy activities_insert_public on public.activities for insert to anon with check (true);

drop policy if exists activities_update_public on public.activities;
create policy activities_update_public on public.activities for update to anon using (true) with check (true);

-- 5) Reset PostgREST schema cache so the REST API sees the new columns
-- If you cannot find the "Reset API cache" button in UI, run:
select pg_notify('pgrst', 'reload schema');
