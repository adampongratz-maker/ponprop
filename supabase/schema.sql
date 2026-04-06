create extension if not exists pgcrypto;

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  units integer not null default 1,
  status text not null default 'Active',
  created_at timestamp with time zone default now()
);

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,
  rent numeric not null default 0,
  status text not null default 'Active',
  created_at timestamp with time zone default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  description text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null default 0,
  category text not null,
  created_at timestamp with time zone default now()
);