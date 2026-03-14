create extension if not exists pgcrypto;

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  password_hash text not null,
  password_salt text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists admin_users_email_unique_idx on admin_users (lower(email));

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references admin_users(id) on delete cascade,
  token_hash text not null,
  user_agent text,
  ip_address text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create unique index if not exists admin_sessions_token_hash_unique_idx on admin_sessions (token_hash);
create index if not exists admin_sessions_user_id_idx on admin_sessions (user_id);
create index if not exists admin_sessions_expires_at_idx on admin_sessions (expires_at);
