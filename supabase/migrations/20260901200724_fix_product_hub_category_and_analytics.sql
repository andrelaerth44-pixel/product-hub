create or replace function public.get_public_storefront(store_slug text)
returns jsonb language sql security definer stable set search_path = public
as $$
  select coalesce(jsonb_build_object(
    'organization', jsonb_build_object('id', o.id, 'name', o.name, 'slug', o.slug, 'description', o.description, 'logo_url', o.logo_url, 'website_url', o.website_url),
    'storefront', jsonb_build_object('status', s.status, 'template', s.template, 'theme_settings', s.theme_settings, 'published_at', s.published_at),
    'products', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'slug', p.slug, 'description', p.description, 'price', p.price, 'currency', p.currency, 'purchase_url', p.purchase_url, 'provider', p.provider, 'category', c.name, 'is_featured', p.is_featured, 'position', p.position,
      'images', coalesce((select jsonb_agg(jsonb_build_object('id', pi.id, 'storage_path', pi.storage_path, 'position', pi.position) order by pi.position) from public.product_images pi where pi.product_id = p.id), '[]'::jsonb)) order by p.position)
      from public.products p left join public.categories c on c.id = p.category_id
      where p.organization_id = o.id and p.is_published = true), '[]'::jsonb)
  ), '{}'::jsonb)
  from public.organizations o join public.storefronts s on s.organization_id = o.id
  where o.slug = store_slug and s.status = 'published';
$$;
grant execute on function public.get_public_storefront(text) to anon, authenticated;

create or replace function public.record_analytics_event(
  event_organization_id uuid,
  event_product_id uuid default null,
  event_type text default 'store_view',
  event_session_id text default null,
  event_referrer text default null,
  event_device_type text default null
) returns bigint
language plpgsql security definer set search_path = public
as $$
declare new_id bigint;
begin
  if event_type not in ('store_view','product_view','product_click') then raise exception 'Invalid event type'; end if;
  if event_type <> 'store_view' and event_product_id is null then raise exception 'Product is required for this event'; end if;
  if event_product_id is not null and not exists (select 1 from public.products where id = event_product_id and organization_id = event_organization_id and is_published = true) then raise exception 'Invalid published product'; end if;
  if not exists (select 1 from public.storefronts where organization_id = event_organization_id and status = 'published') then raise exception 'Storefront is not published'; end if;
  insert into public.analytics_events(organization_id,product_id,event_type,session_id,referrer,device_type) values (event_organization_id,event_product_id,event_type,event_session_id,event_referrer,event_device_type) returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.record_analytics_event(uuid,uuid,text,text,text,text) from public;
grant execute on function public.record_analytics_event(uuid,uuid,text,text,text,text) to anon, authenticated;
drop policy if exists "public insert analytics" on public.analytics_events;
