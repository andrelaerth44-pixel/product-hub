create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  description text, logo_url text, website_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(), unique (organization_id, user_id)
);
create table if not exists public.storefronts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null unique references public.organizations(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','published','unpublished')), template text not null default 'editorial',
  theme_settings jsonb not null default '{}'::jsonb, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, slug text not null, position integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, slug)
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null, name text not null, slug text not null, description text,
  price numeric(12,2), currency text not null default 'AOA', purchase_url text not null, provider text,
  is_featured boolean not null default false, is_published boolean not null default false, position integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, slug)
);
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null, position integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, event_type text not null check (event_type in ('store_view','product_view','product_click')),
  session_id text, referrer text, device_type text, created_at timestamptz not null default now()
);
create index if not exists products_org_position_idx on public.products(organization_id, position);
create index if not exists products_org_published_idx on public.products(organization_id, is_published);
create index if not exists analytics_org_created_idx on public.analytics_events(organization_id, created_at desc);
create index if not exists analytics_product_created_idx on public.analytics_events(product_id, created_at desc);

create or replace function public.is_org_member(target_org uuid) returns boolean language sql security definer stable set search_path = public
as $$ select exists (select 1 from public.organization_members where organization_id = target_org and user_id = auth.uid()); $$;
create or replace function public.is_org_admin(target_org uuid) returns boolean language sql security definer stable set search_path = public
as $$ select exists (select 1 from public.organization_members where organization_id = target_org and user_id = auth.uid() and role in ('owner','admin')); $$;

alter table public.profiles enable row level security; alter table public.organizations enable row level security; alter table public.organization_members enable row level security;
alter table public.storefronts enable row level security; alter table public.categories enable row level security; alter table public.products enable row level security;
alter table public.product_images enable row level security; alter table public.analytics_events enable row level security;

create policy "profiles own read" on public.profiles for select using (id = auth.uid());
create policy "profiles own update" on public.profiles for update using (id = auth.uid());
create policy "members read organizations" on public.organizations for select using (public.is_org_member(id));
create policy "members update organizations" on public.organizations for update using (public.is_org_admin(id));
create policy "members read membership" on public.organization_members for select using (user_id = auth.uid() or public.is_org_member(organization_id));
create policy "admins manage storefront" on public.storefronts for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy "members read categories" on public.categories for select using (public.is_org_member(organization_id));
create policy "admins manage categories" on public.categories for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy "members read products" on public.products for select using (public.is_org_member(organization_id));
create policy "admins manage products" on public.products for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy "members read images" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and public.is_org_member(p.organization_id)));
create policy "admins manage images" on public.product_images for all using (exists (select 1 from public.products p where p.id = product_id and public.is_org_admin(p.organization_id))) with check (exists (select 1 from public.products p where p.id = product_id and public.is_org_admin(p.organization_id)));
create policy "members read analytics" on public.analytics_events for select using (public.is_org_member(organization_id));
create policy "public insert analytics" on public.analytics_events for insert with check (true);

create or replace function public.get_public_storefront(store_slug text)
returns jsonb language sql security definer stable set search_path = public
as $$
  select coalesce(jsonb_build_object(
    'organization', jsonb_build_object('id', o.id, 'name', o.name, 'slug', o.slug, 'description', o.description, 'logo_url', o.logo_url, 'website_url', o.website_url),
    'storefront', jsonb_build_object('status', s.status, 'template', s.template, 'theme_settings', s.theme_settings, 'published_at', s.published_at),
    'products', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'slug', p.slug, 'description', p.description, 'price', p.price, 'currency', p.currency, 'purchase_url', p.purchase_url, 'provider', p.provider, 'is_featured', p.is_featured, 'position', p.position,
      'images', coalesce((select jsonb_agg(jsonb_build_object('id', pi.id, 'storage_path', pi.storage_path, 'position', pi.position) order by pi.position) from public.product_images pi where pi.product_id = p.id), '[]'::jsonb)) order by p.position)
      from public.products p where p.organization_id = o.id and p.is_published = true), '[]'::jsonb)
  ), '{}'::jsonb)
  from public.organizations o join public.storefronts s on s.organization_id = o.id
  where o.slug = store_slug and s.status = 'published';
$$;
grant execute on function public.get_public_storefront(text) to anon, authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles(id, full_name) values (new.id, new.raw_user_meta_data->>'full_name'); return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Secure, atomic first-run workspace creation. The client never receives permission to
-- insert organizations or memberships directly; this function performs both writes
-- only for the currently authenticated user.
create or replace function public.create_workspace(
  workspace_name text,
  workspace_slug text,
  workspace_description text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org uuid;
  clean_name text := trim(workspace_name);
  clean_slug text := lower(trim(workspace_slug));
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if length(clean_name) < 2 or length(clean_name) > 80 then raise exception 'Workspace name must be between 2 and 80 characters'; end if;
  if clean_slug !~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$' then raise exception 'Username must use 3-40 lowercase letters, numbers or hyphens'; end if;
  if exists (select 1 from organizations where slug = clean_slug) then raise exception 'That username is already taken'; end if;

  insert into organizations(name, slug, description) values (clean_name, clean_slug, nullif(trim(workspace_description), '')) returning id into new_org;
  insert into organization_members(organization_id, user_id, role) values (new_org, auth.uid(), 'owner');
  insert into storefronts(organization_id, status, template, theme_settings) values (new_org, 'draft', 'editorial', '{"mode":"light","accent":"neutral","radius":"medium"}'::jsonb);
  return new_org;
end;
$$;
revoke all on function public.create_workspace(text,text,text) from public;
grant execute on function public.create_workspace(text,text,text) to authenticated;
