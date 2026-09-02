'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, Check, Copy, ExternalLink, LayoutDashboard, LogOut, Package, Plus, Search, Settings, Store, Users, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DashboardCustomizer } from '@/components/dashboard-customizer';
import { DashboardHero } from '@/components/dashboard-hero';

const nav = [
  ['overview', 'Visão geral', LayoutDashboard],
  ['products', 'Produtos', Package],
  ['storefront', 'Vitrine', Store],
  ['analytics', 'Analytics', BarChart3],
  ['settings', 'Definições', Settings],
] as const;

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [storefront, setStorefront] = useState<any>(null);
  const [active, setActive] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [range, setRange] = useState(30);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        const { data: member } = await supabase.from('organization_members').select('organization_id').eq('user_id', auth.user.id).limit(1).maybeSingle();
        if (!member?.organization_id) { setError('Ainda não tens uma organização configurada.'); return; }
        const [{ data: organization }, { data: items }, { data: shop }] = await Promise.all([
          supabase.from('organizations').select('*').eq('id', member.organization_id).single(),
          supabase.from('products').select('*').eq('organization_id', member.organization_id).order('created_at', { ascending: false }),
          supabase.from('storefronts').select('*').eq('organization_id', member.organization_id).limit(1).maybeSingle(),
        ]);
        const since = new Date(Date.now() - 90 * 86400000).toISOString();
        const { data: analytics } = await supabase.from('analytics_events').select('*').eq('organization_id', member.organization_id).gte('created_at', since).order('created_at', { ascending: true });
        if (!mounted) return;
        setUser(auth.user); setOrg(organization); setProducts(items || []); setStorefront(shop); setEvents(analytics || []);
      } catch (e: any) { if (mounted) setError(e?.message || 'Não foi possível carregar o dashboard.'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [supabase]);

  const filteredEvents = useMemo(() => events.filter(e => Date.now() - new Date(e.created_at).getTime() <= range * 86400000), [events, range]);
  const views = filteredEvents.filter(e => e.event_type === 'view' || e.event_type === 'page_view').length;
  const clicks = filteredEvents.filter(e => e.event_type === 'click' || e.event_type === 'product_click').length;
  const productViews = filteredEvents.filter(e => e.event_type === 'product_view').length;
  const ctr = views ? (clicks / views) * 100 : 0;

  function copyStoreUrl() {
    if (!storefront?.slug) return;
    navigator.clipboard?.writeText(`${window.location.origin}/store/${storefront.slug}`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  if (loading) return <div className="app-shell"><main className="main-shell"><div className="page-content"><div className="dashboard-loading"><div className="loading-orb"><Package size={22} /></div><strong>A preparar o teu espaço</strong><span>Estamos a organizar os teus dados…</span></div></div></main></div>;
  if (error) return <div className="app-shell"><main className="main-shell"><div className="page-content"><div className="empty">{error}</div></div></main></div>;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-brand"><div className="hub-logo">P</div><div><strong>Product Hub</strong><small>Commerce workspace</small></div></div>
      <div className="org-switch"><div className="org-avatar">{(org?.name?.[0] || 'W').toUpperCase()}</div><div><strong>{org?.name || 'Workspace'}</strong><small>Workspace ativo</small></div><Users size={15} /></div>
      <div className="side-label">Workspace</div>
      <nav className="side-nav">{nav.map(([key, label, Icon]) => <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}><Icon size={17} /><span>{label}</span>{key === 'analytics' && <i />}</button>)}</nav>
      <div className="sidebar-spacer" />
      <div className="plan-card"><div className="plan-icon"><Zap size={15} /></div><div><strong>O teu hub está ativo</strong><span>Catálogo, vitrine e dados num só lugar.</span></div></div>
      <button className="help"><span>?</span><span>Ajuda</span><LogOut size={14} /></button>
      <div className="user-row"><div className="avatar">{(user?.email?.[0] || 'U').toUpperCase()}</div><div><strong>{user?.email?.split('@')[0] || 'Utilizador'}</strong><small>{user?.email || ''}</small></div></div>
    </aside>

    <main className="main-shell">
      <header className="topbar"><div><span className="topbar-kicker">PRODUCT HUB</span><span className="topbar-title">{active === 'overview' ? 'Visão geral' : nav.find(n => n[0] === active)?.[1]}</span></div><div className="topbar-actions">{storefront?.slug && <a className="view-store" href={`/store/${storefront.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Abrir vitrine</a>}<div className="topbar-avatar">{(user?.email?.[0] || 'U').toUpperCase()}</div></div></header>

      <div className="page-content">
        {active === 'overview' && <>
          <DashboardHero name={user?.user_metadata?.name || user?.email?.split('@')[0]} views={views} clicks={clicks} products={products.length} />
          {storefront?.slug && <div className="store-url"><div><span className="live-dot" /><Store size={15} /><span>{window.location.origin}/store/{storefront.slug}</span></div><div><button onClick={copyStoreUrl}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar link'}</button><a href={`/store/${storefront.slug}`} target="_blank" rel="noreferrer"><ArrowUpRight size={14} /> Visualizar</a></div></div>}
          <section className="dashboard-section"><div className="section-heading"><div><h2>O teu negócio hoje</h2><p>Uma leitura rápida do que está a acontecer.</p></div><div className="range-control">{[7, 30, 90].map(n => <button key={n} className={range === n ? 'selected' : ''} onClick={() => setRange(n)}>{n}d</button>)}</div></div>
            <div className="metric-grid four"><Metric icon={<Activity size={17} />} label="Visitas" value={views.toLocaleString('pt-PT')} hint={`últimos ${range} dias`} trend={views ? 'Ativo' : 'Sem dados'} /><Metric icon={<BarChart3 size={17} />} label="Cliques" value={clicks.toLocaleString('pt-PT')} hint="interações" trend={clicks ? 'A acontecer' : 'Sem dados'} /><Metric icon={<Package size={17} />} label="Produtos" value={products.length.toLocaleString('pt-PT')} hint="no catálogo" trend={products.length ? 'Catálogo ativo' : 'Começa agora'} /><Metric icon={<Zap size={17} />} label="CTR" value={`${ctr.toFixed(1)}%`} hint="cliques / visitas" trend={views ? 'Conversão' : 'Aguardando'} /></div>
          </section>
          <div className="overview-grid"><section className="panel product-panel"><div className="panel-head"><div><h2>Produtos recentes</h2><span>Últimos itens adicionados</span></div><button onClick={() => setActive('products')}>Ver catálogo <ArrowUpRight size={14} /></button></div><div className="table">{products.slice(0, 6).map(p => <div className="tr" key={p.id}><div className="product-cell"><div className="product-thumb"><Package size={16} /></div><div><strong>{p.name}</strong><small>{p.category || 'Sem categoria'} · {p.sku || 'Sem SKU'}</small></div></div><strong>{p.price != null ? `${Number(p.price).toLocaleString('pt-PT')} ${p.currency || 'AOA'}` : '—'}</strong><span>{p.stock ?? 0} em stock</span><span className={`status ${p.status === 'published' ? 'published' : 'draft'}`}>{p.status === 'published' ? 'Publicado' : 'Rascunho'}</span></div>)}{products.length === 0 && <div className="empty">Ainda não tens produtos. Adiciona o primeiro e começa a construir o teu catálogo.</div>}</div></section><section className="panel signal-panel"><div className="signal-top"><div className="signal-icon"><BarChart3 size={18} /></div><span>ATIVIDADE</span></div><h3>{views ? 'A tua vitrine já está a gerar sinais.' : 'O teu próximo passo começa aqui.'}</h3><p>{views ? `${views.toLocaleString('pt-PT')} visitas registadas nos últimos ${range} dias.` : 'Publica produtos e partilha a tua vitrine para começar a recolher dados.'}</p><button onClick={() => setActive(views ? 'analytics' : 'products')}>{views ? 'Explorar analytics' : 'Adicionar produto'} <ArrowUpRight size={14} /></button></section></div>
        </>}
        {active === 'products' && <Products products={products} />}
        {active === 'storefront' && storefront?.slug && org?.id && <DashboardCustomizer organizationId={org.id} storefrontPath={`/store/${storefront.slug}`} />}
        {active === 'analytics' && <Analytics events={events} range={range} setRange={setRange} views={views} productViews={productViews} clicks={clicks} ctr={ctr} />}
        {active === 'settings' && <SettingsPanel org={org} supabase={supabase} />}
      </div>
    </main>
  </div>;
}

function Metric({ icon, label, value, hint, trend }: { icon: ReactNode; label: string; value: string; hint: string; trend: string }) { return <div className="metric"><div className="metric-top"><div className="metric-icon">{icon}</div><span>{trend}</span></div><small>{label}</small><strong>{value}</strong><em>{hint}</em></div>; }

function Products({ products }: { products: any[] }) { const [q, setQ] = useState(''); const list = products.filter(p => String(p.name || '').toLowerCase().includes(q.toLowerCase())); return <><div className="page-heading product-heading"><div><span className="section-kicker">CATÁLOGO</span><h1>Produtos</h1><p>O teu catálogo, organizado e pronto para vender.</p></div><a className="primary" href="/dashboard/products/new"><Plus size={15} /> Adicionar produto</a></div><div className="search"><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Pesquisar produto…" /></div><div className="panel" style={{ marginTop: 16 }}><div className="product-list"><div className="list-header"><span>Produto</span><span>Preço</span><span>Stock</span><span>Estado</span><span>SKU</span><span>Atualizado</span><span /></div>{list.map(p => <div className="product-row" key={p.id}><div className="product-cell"><div className="product-thumb"><Package size={15} /></div><div><strong>{p.name}</strong><small>{p.category || 'Sem categoria'}</small></div></div><span>{p.price != null ? Number(p.price).toLocaleString('pt-PT') : '—'} {p.currency || 'AOA'}</span><span>{p.stock ?? 0}</span><span className={`status ${p.status === 'published' ? 'published' : 'draft'}`}>{p.status === 'published' ? 'Publicado' : 'Rascunho'}</span><span>{p.sku || '—'}</span><span>{p.updated_at ? new Date(p.updated_at).toLocaleDateString('pt-PT') : '—'}</span><button className="more">•••</button></div>)}{list.length === 0 && <div className="empty">Nenhum produto encontrado.</div>}</div></div></>; }

function Analytics({ events, range, setRange, views, productViews, clicks, ctr }: any) { const buckets = Array.from({ length: 7 }, (_, i) => { const end = Date.now() - (6 - i) * Math.ceil(range / 7) * 86400000; const start = end - Math.ceil(range / 7) * 86400000; return { label: new Date(end).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }), value: events.filter((e: any) => { const t = new Date(e.created_at).getTime(); return t >= start && t < end; }).length }; }); const max = Math.max(1, ...buckets.map(b => b.value)); return <><div className="page-heading"><div><span className="section-kicker">INSIGHTS</span><h1>Analytics</h1><p>Comportamento real da tua vitrine.</p></div><div className="range-control">{[7, 30, 90].map(n => <button key={n} className={range === n ? 'selected' : ''} onClick={() => setRange(n)}>{n} dias</button>)}</div></div><div className="metric-grid four"><Metric icon={<Activity size={16} />} label="Visitas" value={String(views)} hint="page views" trend="Tráfego" /><Metric icon={<Package size={16} />} label="Visualizações de produto" value={String(productViews)} hint="produtos vistos" trend="Interesse" /><Metric icon={<BarChart3 size={16} />} label="Cliques" value={String(clicks)} hint="interações" trend="Ação" /><Metric icon={<Zap size={16} />} label="CTR" value={`${ctr.toFixed(1)}%`} hint="cliques / visitas" trend="Eficiência" /></div><div className="panel chart-panel"><div className="panel-head"><div><h2>Atividade</h2><span>Eventos registados por período</span></div></div><div className="chart-area">{buckets.map((b, i) => <div className="chart-column" key={i}><div className="chart-bar" style={{ height: `${Math.max(7, (b.value / max) * 100)}%` }} title={`${b.value} eventos`} /><small>{b.label}</small></div>)}</div></div></>; }

function SettingsPanel({ org, supabase }: any) { const [name, setName] = useState(org?.name || ''); const [description, setDescription] = useState(org?.description || ''); const [saved, setSaved] = useState(false); async function save() { await supabase.from('organizations').update({ name, description }).eq('id', org.id); setSaved(true); setTimeout(() => setSaved(false), 1500); } return <><div className="page-heading"><div><span className="section-kicker">WORKSPACE</span><h1>Definições</h1><p>Identidade e informação do teu workspace.</p></div></div><div className="panel settings-panel"><label>Nome do workspace<input value={name} onChange={e => setName(e.target.value)} /></label><label>Descrição<textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} /></label><button className="primary" onClick={save}>{saved ? 'Guardado ✓' : 'Guardar alterações'}</button></div></>; }
