-- Aurelia Finance — Supabase Cloud Sync Schema with Row-Level Security (RLS)
-- Paste this into your Supabase Project -> SQL Editor -> Run

create table if not exists public.user_finance_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_finance_state enable row level security;

drop policy if exists "Users can read own finance state" on public.user_finance_state;
create policy "Users can read own finance state"
  on public.user_finance_state
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own finance state" on public.user_finance_state;
create policy "Users can insert own finance state"
  on public.user_finance_state
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own finance state" on public.user_finance_state;
create policy "Users can update own finance state"
  on public.user_finance_state
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.user_finance_state to authenticated;

-- Enable live cross-device Realtime updates
alter publication supabase_realtime add table public.user_finance_state;
