-- Optional Supabase Schema for Cloud Sync with Row-Level Security (RLS)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(14,2) not null check (amount > 0),
  merchant text not null,
  tx_date date not null,
  tx_time text,
  tx_type text not null,
  payment_method text,
  account_name text,
  reference_id text,
  category_id text not null,
  subcategory text,
  scope text default 'personal',
  notes text,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users manage own transactions"
  on public.transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
