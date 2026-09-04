import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardCustomizer } from '@/components/dashboard-customizer';

export default async function StorefrontCustomizerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.organization_id) redirect('/dashboard');

  const [{ data: organization }, { data: storefront }] = await Promise.all([
    supabase.from('organizations').select('id,slug').eq('id', membership.organization_id).single(),
    supabase.from('storefronts').select('slug').eq('organization_id', membership.organization_id).maybeSingle(),
  ]);

  if (!organization?.id || !storefront?.slug) redirect('/dashboard');

  return (
    <div className="app-shell">
      <main className="main-shell">
        <div className="page-content">
          <DashboardCustomizer
            organizationId={organization.id}
            storefrontPath={`/store/${storefront.slug}`}
          />
        </div>
      </main>
    </div>
  );
}
