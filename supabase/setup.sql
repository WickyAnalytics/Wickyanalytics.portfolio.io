-- Run this ONCE in Supabase → SQL Editor (paste everything, click Run).
-- Admin login email is already set to Georgeayad3021@gmail.com.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in
              ('profile','project','experience','education','certification','skill','service')),
  data        jsonb not null default '{}'::jsonb,
  sort_order  int  not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index if not exists one_profile on public.items(kind) where kind = 'profile';
create index if not exists items_kind_sort on public.items(kind, sort_order);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists items_touch on public.items;
create trigger items_touch before update on public.items
  for each row execute function public.touch_updated_at();

-- Who is the admin? Only this email can change content, upload files and read requests.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email','')) = lower('Georgeayad3021@gmail.com')
$$;

alter table public.items enable row level security;
drop policy if exists "public read visible" on public.items;
drop policy if exists "admin insert" on public.items;
drop policy if exists "admin update" on public.items;
drop policy if exists "admin delete" on public.items;
create policy "public read visible" on public.items for select using (visible or public.is_admin());
create policy "admin insert" on public.items for insert with check (public.is_admin());
create policy "admin update" on public.items for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.items for delete using (public.is_admin());

-- Image / file storage (public read, admin write)
insert into storage.buckets (id, name, public) values ('portfolio','portfolio', true)
  on conflict (id) do update set public = true;
drop policy if exists "portfolio admin insert" on storage.objects;
drop policy if exists "portfolio admin update" on storage.objects;
drop policy if exists "portfolio admin delete" on storage.objects;
create policy "portfolio admin insert" on storage.objects for insert
  with check (bucket_id = 'portfolio' and public.is_admin());
create policy "portfolio admin update" on storage.objects for update
  using (bucket_id = 'portfolio' and public.is_admin());
create policy "portfolio admin delete" on storage.objects for delete
  using (bucket_id = 'portfolio' and public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Service requests from the website's contact form.
-- Anyone can SEND one (insert); only the admin can read, update or delete them.
create table if not exists public.requests (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 160),
  phone      text check (char_length(phone) <= 40),
  service    text check (char_length(service) <= 200),
  category   text check (char_length(category) <= 100),
  budget     text check (char_length(budget) <= 60),
  timeline   text check (char_length(timeline) <= 60),
  tools      text check (char_length(tools) <= 200),
  message    text not null check (char_length(message) between 1 and 5000),
  status     text not null default 'new' check (status in ('new','in progress','done'))
);
alter table public.requests enable row level security;
drop policy if exists "anyone can send request" on public.requests;
drop policy if exists "admin read requests" on public.requests;
drop policy if exists "admin update requests" on public.requests;
drop policy if exists "admin delete requests" on public.requests;
create policy "anyone can send request" on public.requests for insert with check (status = 'new');
create policy "admin read requests"   on public.requests for select using (public.is_admin());
create policy "admin update requests" on public.requests for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete requests" on public.requests for delete using (public.is_admin());
