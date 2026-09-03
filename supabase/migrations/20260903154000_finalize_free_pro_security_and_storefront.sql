alter table public.organization_billing drop constraint if exists organization_billing_plan_check;
alter table public.organization_billing add constraint organization_billing_plan_check check (plan in ('free','pro'));

drop policy if exists billing_admin_write on public.organization_billing;
create policy billing_admin_write on public.organization_billing for update to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

insert into public.organization_billing (organization_id)
select o.id from public.organizations o
where not exists (select 1 from public.organization_billing b where b.organization_id=o.id)
on conflict (organization_id) do nothing;

create index if not exists analytics_events_org_created_idx on public.analytics_events (organization_id, created_at desc);
create index if not exists products_org_published_idx on public.products (organization_id, is_published, position);
create index if not exists product_images_product_position_idx on public.product_images (product_id, position);

alter table public.storefronts add column if not exists published_at timestamptz;
update public.storefronts set published_at=coalesce(published_at, updated_at, created_at) where status='published' and published_at is null;

insert into storage.buckets (id,name,public) values ('storefront-assets','storefront-assets',true) on conflict (id) do update set public=true;

drop policy if exists storefront_assets_public_read on storage.objects;
create policy storefront_assets_public_read on storage.objects for select to public using (bucket_id='storefront-assets');
drop policy if exists storefront_assets_member_insert on storage.objects;
create policy storefront_assets_member_insert on storage.objects for insert to authenticated with check (bucket_id='storefront-assets' and public.is_org_member((storage.foldername(name))[1]::uuid));
drop policy if exists storefront_assets_member_update on storage.objects;
create policy storefront_assets_member_update on storage.objects for update to authenticated using (bucket_id='storefront-assets' and public.is_org_member((storage.foldername(name))[1]::uuid)) with check (bucket_id='storefront-assets' and public.is_org_member((storage.foldername(name))[1]::uuid));
drop policy if exists storefront_assets_member_delete on storage.objects;
create policy storefront_assets_member_delete on storage.objects for delete to authenticated using (bucket_id='storefront-assets' and public.is_org_member((storage.foldername(name))[1]::uuid));

revoke all on function public.get_public_storefront(text) from public;
grant execute on function public.get_public_storefront(text) to anon, authenticated;
revoke all on function public.create_workspace(text,text,text) from public;
grant execute on function public.create_workspace(text,text,text) to authenticated;
revoke all on function public.is_org_admin(uuid) from public;
grant execute on function public.is_org_admin(uuid) to authenticated;
revoke all on function public.is_org_member(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated;