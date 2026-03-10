-- SUPABASE SCHEMA FOR TEOLA
-- Run this in your Supabase SQL Editor

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  username text unique,
  email text,
  subscription_tier text default 'Free',
  avatar text,
  gender text,
  nationality text,
  location text,
  state_or_city text,
  style_preferences text[],
  is_notifications_enabled boolean default true,
  notify_email boolean default true,
  notify_alerts boolean default true,
  auto_sync_outfits boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. WARDROBE ITEMS
create table public.wardrobe_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  image text not null,
  category text not null,
  color text,
  brand text,
  tags text[],
  usage_categories text[],
  is_starred boolean default false,
  wear_count int default 0,
  last_worn_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SAVED OUTFITS
create table public.saved_outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text,
  description text,
  justification text,
  items uuid[], -- Array of wardrobe_item IDs
  occasion text,
  visual_url text,
  feedback text, -- 'like' | 'dislike'
  saved_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CHATS
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text default 'New Session',
  messages jsonb default '[]'::jsonb,
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ROTATION SESSIONS (PLANNER)
create table public.rotation_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  start_date date not null,
  duration_weeks int default 1,
  plan jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.wardrobe_items enable row level security;
alter table public.saved_outfits enable row level security;
alter table public.chats enable row level security;
alter table public.rotation_sessions enable row level security;

-- RLS POLICIES
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own wardrobe" on public.wardrobe_items for select using (auth.uid() = user_id);
create policy "Users can insert own wardrobe" on public.wardrobe_items for insert with check (auth.uid() = user_id);
create policy "Users can update own wardrobe" on public.wardrobe_items for update using (auth.uid() = user_id);
create policy "Users can delete own wardrobe" on public.wardrobe_items for delete using (auth.uid() = user_id);

create policy "Users can view own outfits" on public.saved_outfits for select using (auth.uid() = user_id);
create policy "Users can insert own outfits" on public.saved_outfits for insert with check (auth.uid() = user_id);
create policy "Users can update own outfits" on public.saved_outfits for update using (auth.uid() = user_id);
create policy "Users can delete own outfits" on public.saved_outfits for delete using (auth.uid() = user_id);

create policy "Users can view own chats" on public.chats for select using (auth.uid() = user_id);
create policy "Users can insert own chats" on public.chats for insert with check (auth.uid() = user_id);
create policy "Users can update own chats" on public.chats for update using (auth.uid() = user_id);
create policy "Users can delete own chats" on public.chats for delete using (auth.uid() = user_id);

create policy "Users can view own rotations" on public.rotation_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own rotations" on public.rotation_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own rotations" on public.rotation_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own rotations" on public.rotation_sessions for delete using (auth.uid() = user_id);
