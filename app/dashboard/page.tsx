'use client';

import { useMemo, useState } from 'react';
import { BarChart3, Box, ChevronDown, Copy, ExternalLink, Eye, Globe2, LayoutTemplate, Link2, Menu, MousePointer2, Plus, Settings, ShoppingBag, Sparkles, Store, X } from 'lucide-react';

const products = [
  { name: 'Curso Completo de Marketing Digital', category: 'Curso', provider: 'Hotmart', price: 'R$ 497,00', views: '4,592', clicks: '1,243', status: 'Published', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=500&q=80' },
  { name: 'Tráfego Pago do Zero ao Avançado', category: 'Ebook', provider: 'Kiwify', price: 'R$ 67,00', views: '3,201', clicks: '872', status: 'Published', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80' },
  { name: 'Mentoria em Performance Digital', category: 'Mentoria', provider: 'WhatsApp', price: 'R$ 1.997,00', views: '2,184', clicks: '612', status: 'Published', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=80' },
  { name: 'Gestão de Tráfego Pago', category: 'Serviço', provider: 'WhatsApp', price: 'Sob consulta', views: '1,562', clicks: '421', status: 'Published', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80' },
  { name: 'Pacote de Templates', category: 'Ebook', provider: 'Hotmart', price: 'R$ 97,00', views: '0', clicks: '0', status: 'Draft', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=500&q=80' },
];

const nav = [
  ['Overview', Eye], ['Products', Box], ['Storefront', Store], ['Analytics', BarChart3], ['Settings', Settings],
] as const;

export default function Dashboard() {
  const [active, setActive] = useState('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())), [query]);
  const go = (item: string) => { setActive(item); setMobileOpen(false); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-brand"><span className="hub-logo"><Sparkles size={17}/></span><span>Product Hub</span><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={20}/></button></div>
      <div className="org-switch"><span>Acme Corp</span><ChevronDown size={15}/></div>
      <nav className="side-nav">{nav.map(([label, Icon]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => go(label)}><Icon size={20}/><span>{label}</span></button>)}</nav>
      <div className="plan-card"><div><Sparkles size={17}/><strong>Pro Plan</strong></div><span>Renews on Jun 18, 2026</span><button>Manage plan <ExternalLink size={13}/></button></div>
      <div className="help"><span>?</span> Need help? <span>→</span></div>
      <div className="user-row"><span className="avatar">JS</span><div><strong>João Silva</strong><small>Admin</small></div><ChevronDown size={16}/></div>
    </aside>
    {mobileOpen && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setMobileOpen(false)}/>}
    <main className="main-shell">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={22}/></button><div className="topbar-title">{active}</div><div className="topbar-actions"><a href="/store/joao-silva" className="view-store"><Eye size={17}/> View storefront</a><span className="avatar small">JS</span><span className="user-name">João Silva</span><ChevronDown size={15}/></div></header>
      <section className="page-content">
        {active === 'Overview' && <Overview copied={copied} onCopy={() => {setCopied(true); setTimeout(() => setCopied(false), 1400)}} onNavigate={go} />}
        {active === 'Products' && <Products query={query} setQuery={setQuery} filtered={filtered} onNavigate={go}/>} 
        {active === 'Storefront' && <StorefrontEditor/>}
        {active === 'Analytics' && <Analytics/>}
        {active === 'Settings' && <SettingsView/>}
      </section>
    </main>
  </div>;
}

function Overview({copied,onCopy,onNavigate}:{copied:boolean;onCopy:()=>void;onNavigate:(x:string)=>void}) {
 return <><div className="page-heading"><div><h1>Good morning, João <span>👋</span></h1><p>Here&apos;s what&apos;s happening with your storefront today.</p></div></div>
 <div className="store-url"><div><Globe2 size={20}/><span>https://producthub.store/@joao-silva</span></div><button onClick={onCopy}><Copy size={16}/>{copied ? 'Copied' : 'Copy'}</button><a href="/store/joao-silva"><ExternalLink size={16}/> View</a></div>
 <div className="metric-grid"><Metric icon={<Eye/>} label="Views" value="12,482" delta="+18.4%"/><Metric icon={<MousePointer2/>} label="Product clicks" value="3,821" delta="+12.1%"/><Metric icon={<BarChart3/>} label="CTR" value="30.6%" delta="+3.7%"/></div>
 <div className="panel top-products"><div className="panel-head"><h2>Top products</h2><button onClick={()=>onNavigate('Products')}>View all products <span>→</span></button></div><div className="table"><div className="tr th"><span>Rank</span><span>Product</span><span>Views</span><span>Clicks</span><span>CTR</span></div>{products.slice(0,5).map((p,i)=><div className="tr" key={p.name}><span>{i+1}</span><div className="product-cell"><img src={p.image} alt=""/><div><strong>{p.name}</strong><small>{p.category}</small></div></div><span>{p.views}</span><span>{p.clicks}</span><span>{((Number(p.clicks.replace(',',''))/Math.max(Number(p.views.replace(',','')),1))*100).toFixed(1)}%</span></div>)}</div></div>
 </>;
}
function Metric({icon,label,value,delta}:{icon:React.ReactNode;label:string;value:string;delta:string}){return <div className="metric"><div className="metric-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small><b>{delta}</b> vs last 7 days</small><div className="spark"><i/><i/><i/><i/><i/><i/><i/></div></div>}
function Products({query,setQuery,filtered,onNavigate}:{query:string;setQuery:(v:string)=>void;filtered:typeof products;onNavigate:(x:string)=>void}){return <><div className="page-heading product-heading"><div><h1>Products</h1><p>Manage everything that appears in your storefront.</p></div><button className="primary"><Plus size={18}/> Add product</button></div><div className="product-toolbar"><div className="search"><Link2 size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..."/></div><div className="tabs"><button className="selected">All <em>24</em></button><button>Published <em>18</em></button><button>Draft <em>6</em></button></div></div><div className="panel product-list"><div className="list-header"><span>Product</span><span>Category</span><span>Provider</span><span>Status</span><span>Views</span><span>Clicks</span><span/></div>{filtered.map(p=><div className="product-row" key={p.name}><div className="product-cell"><img src={p.image} alt=""/><div><strong>{p.name}</strong><small>Product Hub</small></div></div><span>{p.category}</span><span>{p.provider}</span><span><b className={`status ${p.status.toLowerCase()}`}>{p.status}</b></span><span>{p.views}</span><span>{p.clicks}</span><button className="more">•••</button></div>)}{filtered.length===0&&<div className="empty">No products match your search.</div>}</div></>}
function StorefrontEditor(){return <><div className="page-heading"><div><h1>Storefront</h1><p>Customize the experience your audience sees.</p></div><a className="primary" href="/store/joao-silva"><Eye size={18}/> Preview</a></div><div className="editor"><aside><h3>Settings</h3><EditorSection title="Theme" active><div className="swatches"><i/><i/><i/><i/></div><div className="seg"><button className="on">Light</button><button>Dark</button></div></EditorSection><EditorSection title="Layout"><label>Container width <b>1200px</b></label><label>Content alignment <b>Center</b></label></EditorSection><EditorSection title="Typography"><label>Font family <b>Playfair / Inter</b></label><label>Base font size <b>16px</b></label></EditorSection><EditorSection title="Buttons"><label>Button style <b>Soft rounded</b></label><label>Shadow <b>Low</b></label></EditorSection><EditorSection title="Products"><label>Product grid, cards, image ratio</label></EditorSection></aside><div className="editor-preview"><div className="preview-toolbar"><span>Desktop</span><span>Mobile</span><button>Save</button><button className="dark-btn">Publish</button></div><div className="store-mini"><div className="store-mini-nav"><strong>Product Hub</strong><span>Courses　 Ebooks　 Mentorias　 Serviços</span><span>⌕　♙</span></div><div className="store-mini-hero"><div><small>DESTAQUE</small><h2>Curso Completo de<br/>Marketing Digital</h2><p>Estratégias comprovadas para atrair, converter e escalar.</p><b>Comprar agora　→</b></div><div className="hero-art"><div>MARKETING<br/>DIGITAL</div></div></div><h3>Todos os produtos <small>Ver todos →</small></h3><div className="mini-products">{products.slice(0,4).map(p=><div key={p.name}><img src={p.image} alt=""/><strong>{p.name}</strong><span>{p.price}</span></div>)}</div></div></div></div></>}
function EditorSection({title,children,active}:{title:string;children:React.ReactNode;active?:boolean}){return <div className={`editor-section ${active?'expanded':''}`}><div className="editor-section-head"><span>{title}</span><ChevronDown size={15}/></div>{active&&<div className="editor-section-body">{children}</div>}</div>}
function Analytics(){return <><div className="page-heading"><div><h1>Analytics</h1><p>Track performance and discover growth opportunities.</p></div><select><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option></select></div><div className="metric-grid four"><Metric icon={<Eye/>} label="Store views" value="24,842" delta="+12.4%"/><Metric icon={<ShoppingBag/>} label="Product views" value="78,631" delta="+15.7%"/><Metric icon={<MousePointer2/>} label="Product clicks" value="5,629" delta="+10.3%"/><Metric icon={<BarChart3/>} label="CTR" value="7.16%" delta="+8.6%"/></div><div className="analytics-grid"><div className="panel chart-panel"><div className="panel-head"><h2>Traffic over time</h2><select><option>Daily</option><option>Weekly</option></select></div><div className="chart"><div className="gridlines"/><svg viewBox="0 0 800 260" preserveAspectRatio="none"><path d="M0 190 C70 110, 80 180, 150 175 S220 70, 280 105 S340 180, 400 160 S470 85, 530 130 S600 185, 660 120 S730 175, 800 90" fill="none" stroke="currentColor" strokeWidth="3"/></svg><div className="chart-labels"><span>May 20</span><span>May 27</span><span>Jun 3</span><span>Jun 10</span><span>Jun 18</span></div></div></div><div className="panel top-list"><h2>Top products</h2>{products.slice(0,5).map((p,i)=><div key={p.name}><b>{i+1}</b><img src={p.image} alt=""/><span><strong>{p.name}</strong><small>{p.views} views</small></span><em>+{12-i*1.7}%</em></div>)}</div></div></>}
function SettingsView(){return <><div className="page-heading"><div><h1>Settings</h1><p>Manage your brand, account and storefront preferences.</p></div></div><div className="settings-grid"><div className="panel setting-card"><h2>Brand profile</h2><label>Brand name<input defaultValue="João Silva"/></label><label>Username<input defaultValue="joao-silva"/></label><label>Bio<textarea defaultValue="Especialista em Marketing Digital"/></label><button className="primary">Save changes</button></div><div className="panel setting-card"><h2>Storefront link</h2><p>Share this link everywhere you want people to discover your products.</p><div className="copy-field"><Link2 size={16}/><span>producthub.store/@joao-silva</span><button>Copy</button></div><h3>Social links</h3><label>Instagram<input defaultValue="instagram.com/joaosilva"/></label><label>TikTok<input defaultValue="tiktok.com/@joaosilva"/></label></div></div></>}
