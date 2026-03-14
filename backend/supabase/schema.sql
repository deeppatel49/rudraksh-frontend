create extension if not exists pgcrypto;

create table if not exists products (
  -- Basic Info
  SrNo int primary key,
  item_Name text not null,
  Company text,
  Generic text,
  Itemtype text,
  Category text,
  Pack text,
  Mrp numeric(10,2) not null default 0
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'category'
  ) then
    execute 'create index if not exists products_category_idx on products (category)';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'name'
  ) then
    execute 'create index if not exists products_name_idx on products using gin (to_tsvector(''english'', coalesce(name, '''')))';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'item_name'
  ) then
    execute 'create index if not exists products_name_idx on products using gin (to_tsvector(''english'', coalesce(item_name, '''')))';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'in_stock'
  ) then
    execute 'create index if not exists products_in_stock_idx on products (in_stock)';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'price'
  ) then
    execute 'create index if not exists products_price_idx on products (price)';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'mrp'
  ) then
    execute 'create index if not exists products_price_idx on products (mrp)';
  end if;
end
$$;

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text not null,
  file_type text not null,
  file_size bigint,
  mime_type text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists banners_is_active_idx on banners (is_active);
create index if not exists banners_created_at_idx on banners (created_at desc);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  reviewer_name text not null,
  rating int not null check (rating between 1 and 5),
  title text not null,
  description text not null,
  image_data_url text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on reviews (product_id, created_at desc);

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  inquiry_type text not null,
  message text not null,
  source text default 'website',
  created_at timestamptz not null default now()
);

create index if not exists contact_created_at_idx on contact_submissions (created_at desc);

create table if not exists home_content (
  id int primary key default 1 check (id = 1),
  title text,
  description text,
  sections jsonb default '{}'::jsonb,
  seo_meta jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists about_content (
  id int primary key default 1 check (id = 1),
  title text,
  description text,
  sections jsonb default '{}'::jsonb,
  seo_meta jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists page_content (
  slug text primary key,
  title text,
  description text,
  sections jsonb default '{}'::jsonb,
  seo_meta jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

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

create table if not exists admin_user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references admin_users(id) on delete cascade,
  full_name text not null,
  mobile_number text not null,
  gender text not null,
  address text not null,
  city text not null,
  pincode text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_user_profiles_user_id_unique unique (user_id)
);

create index if not exists admin_user_profiles_user_id_idx on admin_user_profiles (user_id);

create table if not exists message_statuses (
  message_id text primary key,
  status text not null default 'not-read' check (status in ('read', 'not-read')),
  source text not null default 'contact_submissions',
  updated_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists message_statuses_source_idx on message_statuses (source);
create index if not exists message_statuses_updated_at_idx on message_statuses (updated_at desc);

insert into home_content (id, title, description, sections, seo_meta)
values
  (
    1,
    'Home',
    'Rudraksh Pharmacy homepage content',
    jsonb_build_object(
      'heroStats', jsonb_build_array(
        jsonb_build_object('value', '25,000+', 'label', 'Families Supported'),
        jsonb_build_object('value', '2,500+', 'label', 'Products in Stock'),
        jsonb_build_object('value', '4.9/5', 'label', 'Customer Rating')
      )
    ),
    jsonb_build_object(
      'title', 'Home | Rudraksh Pharmacy',
      'description', 'Shop medicines and wellness essentials online.'
    )
  )
on conflict (id) do nothing;

insert into about_content (id, title, description, sections, seo_meta)
values
  (
    1,
    'About',
    'Rudraksh Pharmacy about page content',
    jsonb_build_object(
      'trustStats', jsonb_build_array(
        jsonb_build_object('label', 'Happy Customers', 'value', '25,000+'),
        jsonb_build_object('label', 'Products Available', 'value', '2,500+')
      )
    ),
    jsonb_build_object(
      'title', 'About | Rudraksh Pharmacy',
      'description', 'Learn about Rudraksh Pharmacy mission and values.'
    )
  )
on conflict (id) do nothing;

insert into page_content (slug, title, description, sections, seo_meta)
values
  (
    'home',
    'Home',
    'Rudraksh Pharmacy homepage content',
    jsonb_build_object(
      'heroStats', jsonb_build_array(
        jsonb_build_object('value', '25,000+', 'label', 'Families Supported'),
        jsonb_build_object('value', '2,500+', 'label', 'Products in Stock'),
        jsonb_build_object('value', '4.9/5', 'label', 'Customer Rating')
      )
    ),
    jsonb_build_object(
      'title', 'Home | Rudraksh Pharmacy',
      'description', 'Shop medicines and wellness essentials online.'
    )
  ),
  (
    'about',
    'About',
    'Rudraksh Pharmacy about page content',
    jsonb_build_object(
      'trustStats', jsonb_build_array(
        jsonb_build_object('label', 'Happy Customers', 'value', '25,000+'),
        jsonb_build_object('label', 'Products Available', 'value', '2,500+')
      )
    ),
    jsonb_build_object(
      'title', 'About | Rudraksh Pharmacy',
      'description', 'Learn about Rudraksh Pharmacy mission and values.'
    )
  )
on conflict (slug) do nothing;

-- Chat box schema
create table if not exists customer_chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  name text,
  email text,
  phone text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_chat_threads_has_identifier check (
    coalesce(nullif(trim(user_id), ''), nullif(trim(email), ''), nullif(trim(phone), '')) is not null
  )
);

create table if not exists customer_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references customer_chat_threads(id) on delete cascade,
  user_id text,
  name text,
  email text,
  phone text,
  sender_role text not null default 'seller' check (sender_role in ('customer', 'seller', 'system')),
  sender_name text not null default 'Seller',
  message text not null default '(no text)',
  attachment jsonb,
  status text not null default 'sent' check (status in ('sent', 'received', 'read')),
  created_at timestamptz not null default now()
);

create index if not exists customer_chat_threads_user_id_idx on customer_chat_threads (user_id);
create index if not exists customer_chat_threads_email_idx on customer_chat_threads (lower(email));
create index if not exists customer_chat_threads_phone_idx on customer_chat_threads (phone);
create index if not exists customer_chat_threads_last_message_at_idx on customer_chat_threads (last_message_at desc);

create index if not exists customer_chat_messages_thread_id_idx on customer_chat_messages (thread_id, created_at desc);
create index if not exists customer_chat_messages_user_id_idx on customer_chat_messages (user_id);
create index if not exists customer_chat_messages_email_idx on customer_chat_messages (lower(email));
create index if not exists customer_chat_messages_phone_idx on customer_chat_messages (phone);
create index if not exists customer_chat_messages_sender_role_idx on customer_chat_messages (sender_role);
create index if not exists customer_chat_messages_status_idx on customer_chat_messages (status);

-- Customer authentication and login data schema
create table if not exists customer_auth_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  full_name text not null,
  email text not null,
  phone text,
  password_hash text,
  password_salt text,
  provider text not null default 'manual' check (provider in ('manual', 'google')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_auth_accounts_user_id_unique unique (user_id)
);

create unique index if not exists customer_auth_accounts_email_unique_idx on customer_auth_accounts (lower(email));
create index if not exists customer_auth_accounts_phone_idx on customer_auth_accounts (phone);
create index if not exists customer_auth_accounts_provider_idx on customer_auth_accounts (provider);

create table if not exists customer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  full_name text,
  gender text,
  mobile_number text,
  whatsapp_number text,
  email text,
  address text,
  city text,
  pincode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_profiles_user_id_unique unique (user_id)
);

create index if not exists customer_profiles_email_idx on customer_profiles (lower(email));
create index if not exists customer_profiles_mobile_number_idx on customer_profiles (mobile_number);
create index if not exists customer_profiles_whatsapp_number_idx on customer_profiles (whatsapp_number);

create table if not exists customer_login_activities (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  login_method text not null default 'manual' check (login_method in ('manual', 'google')),
  name text,
  email text,
  identifier text,
  phone text,
  address text,
  city text,
  pincode text,
  image_url text,
  provider_image_url text,
  user_agent text,
  ip_address text,
  logged_in_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_login_activities_user_id_unique unique (user_id)
);

create index if not exists customer_login_activities_email_idx on customer_login_activities (lower(email));
create index if not exists customer_login_activities_logged_in_at_idx on customer_login_activities (logged_in_at desc);

-- Prescriptions: uploaded prescription images and metadata
-- Run in Supabase SQL editor. Also create a Storage bucket named "prescriptions".
create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null,
  customer_name text not null,
  mobile_number text not null,
  file_name text not null,
  file_url text,
  file_path text,
  mime_type text,
  processing_mode text not null default 'everything' check (processing_mode in ('everything', 'call')),
  call_for_selections boolean not null default false,
  processing_updated_at timestamptz not null default now(),
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prescriptions_reference_id_unique unique (reference_id)
);

create index if not exists prescriptions_reference_id_idx on prescriptions (reference_id);
create index if not exists prescriptions_mobile_number_idx on prescriptions (mobile_number);
create index if not exists prescriptions_uploaded_at_idx on prescriptions (uploaded_at desc);
