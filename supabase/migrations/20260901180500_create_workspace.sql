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
  if exists (select 1 from public.organizations where slug = clean_slug) then raise exception 'That username is already taken'; end if;
  insert into public.organizations(name, slug, description) values (clean_name, clean_slug, nullif(trim(workspace_description), '')) returning id into new_org;
  insert into public.organization_members(organization_id, user_id, role) values (new_org, auth.uid(), 'owner');
  insert into public.storefronts(organization_id, status, template, theme_settings) values (new_org, 'draft', 'editorial', '{"mode":"light","accent":"neutral","radius":"medium"}'::jsonb);
  return new_org;
end;
$$;
revoke all on function public.create_workspace(text,text,text) from public;
grant execute on function public.create_workspace(text,text,text) to authenticated;
