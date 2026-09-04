import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, LayoutDashboard, Package, Settings, Store, Users, LogOut } from 'lucide-react';
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
    supabase.from('organizations').select('id,name,slug').eq('id', membership.organization_id).single(),
    supabase.from('storefronts').select('slug').eq('organization_id', membership.organization_id).limit(1).maybeSingle(),
  ]);
  if (!organization?.id) redirect('/dashboard');

  const storefrontSlug = storefront?.slug || organization.slug;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><div className="hub-logo" /><div><strong>Product Hub</strong><small>Commerce workspace</small></div></div>
        <div className="org-switch"><div className="org-avatar">{(organization.name?.[0] || 'W').toUpperCase()}</div><div><strong>{organization.name || 'Workspace'}</strong><small>Workspace ativo</small></div><Users size={15}/></div>
        <div className="side-label">Workspace</div>
        <nav className="side-nav">
          <Link href="/dashboard"><LayoutDashboard size={17}/><span>Visão geral</span></Link>
          <Link href="/dashboard"><Package size={17}/><span>Produtos</span></Link>
          <Link href="/dashboard" className="active"><Store size={17}/><span>Vitrine</span></Link>
          <Link href="/dashboard"><BarChart3 size={17}/><span>Analytics</span></Link>
          <Link href="/dashboard/settings"><Settings size={17}/><span>Definições</span></Link>
        </nav>
        <div className="sidebar-spacer"/>
        <Link className="help" href="/dashboard"><span>↪</span><span>Voltar ao workspace</span><LogOut size={14}/></Link>
        <div className="user-row"><div className="avatar">{(user.email?.[0] || 'U').toUpperCase()}</div><div><strong>{user.email?.split('@')[0] || 'Utilizador'}</strong><small>{user.email || ''}</small></div></div>
      </aside>
      <main className="main-shell">
        <header className="topbar"><div><span className="topbar-kicker">VITRINE</span><span className="topbar-title">Personalizar vitrine</span></div><div className="topbar-actions"><Link className="view-store" href={`/store/${storefrontSlug}`} target="_blank">Abrir vitrine</Link></div></header>
        <div className="page-content">
          <DashboardCustomizer organizationId={organization.id} storefrontPath={`/store/${storefrontSlug}`} />
        </div>
      </main>
    </div>
  );
}
