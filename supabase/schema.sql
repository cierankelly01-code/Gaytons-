-- Kelly's Deli — Supabase schema. Run in the Supabase SQL editor.
-- One table: orders. RLS ON, no public access. All reads/writes go through the
-- server (service role key), never the browser.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('fixed', 'custom')),
  board_id text,                          -- fixed boards only
  board_name text not null,
  serves text,
  items jsonb,                            -- custom: [{ name, price }]
  total numeric not null check (total >= 0),
  collection_date date not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  notes text,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'collected', 'cancelled'))
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- Row Level Security ON. No policies are created, so the anon/auth roles have
-- NO access at all. The service role bypasses RLS, which is exactly what the
-- server uses. This means: no public read, no public write, no data leakage
-- even if the anon key is exposed (it is, by design, in the browser bundle).
alter table public.orders enable row level security;

-- (Intentionally no policies. Do NOT add a public insert/select policy.)
