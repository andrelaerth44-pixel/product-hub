create table if not exists public.organization_billing (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','pro','business')),
  subscription_status text not null default 'inactive' check (subscription_status in ('inactive','trialing','active','past_due','cancelled')),
  provider text check (provider in ('lemonsqueezy','stripe')),
  external_customer_id text,
  external_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organization_billing enable row level security;
create policy if not exists billing_member_read on public.organization_billing for select to authenticated using (public.is_org_member(organization_id));
create policy if not exists billing_admin_write on public.organization_billing for all to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

insert into public.organization_billing (organization_id)
select o.id from public.organizations o
where not exists (select 1 from public.organization_billing b where b.organization_id=o.id)
on conflict (organization_id) do nothing;

insert into storage.buckets (id, name, public) values ('storefront-assets','storefront-assets',true) on conflict (id) do update set public=true;
