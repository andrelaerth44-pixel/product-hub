-- Product Hub image storage.
-- The bucket is public because published storefronts need browser-readable image URLs.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Files are namespaced as {organization_id}/{product_id}/{filename}.
drop policy if exists product_images_insert on storage.objects;
create policy product_images_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.products p
    where p.id::text = (storage.foldername(name))[2]
      and p.organization_id::text = (storage.foldername(name))[1]
      and public.is_org_member(p.organization_id)
  )
);

drop policy if exists product_images_update on storage.objects;
create policy product_images_update on storage.objects
for update to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.products p
    where p.id::text = (storage.foldername(name))[2]
      and p.organization_id::text = (storage.foldername(name))[1]
      and public.is_org_member(p.organization_id)
  )
)
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.products p
    where p.id::text = (storage.foldername(name))[2]
      and p.organization_id::text = (storage.foldername(name))[1]
      and public.is_org_member(p.organization_id)
  )
);

drop policy if exists product_images_delete on storage.objects;
create policy product_images_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.products p
    where p.id::text = (storage.foldername(name))[2]
      and p.organization_id::text = (storage.foldername(name))[1]
      and public.is_org_member(p.organization_id)
  )
);

-- Public storefronts can read images. Upload/update/delete remains authenticated and organization-scoped.
drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
for select to anon, authenticated
using (bucket_id = 'product-images');
