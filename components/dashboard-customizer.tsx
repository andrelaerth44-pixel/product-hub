'use client';

import { useEffect, useState } from 'react';
import { Check, Eye, LayoutGrid, Save, Type } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Theme = { mode: 'light' | 'soft' | 'dark'; accent: string; radius: 'small' | 'medium' | 'large'; layout: 'grid' | 'list'; showPrices: boolean };
const defaults: Theme = { mode: 'light', accent: '#1f1f1f', radius: 'medium', layout: 'grid', showPrices: true };

export function DashboardCustomizer({ organizationId, storefrontPath }: { organizationId: string; storefrontPath: string }) {
  const [theme, setTheme] = useState<Theme>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { (async () => {
    const s = createClient();
    const { data } = await s.from('storefronts').select('theme_settings,status').eq('organization_id', organizationId).maybeSingle();
    const incoming = (data?.theme_settings || {}) as Partial<Theme>;
    setTheme({ ...defaults, ...incoming });
    setPublished(data?.status === 'published');
    setLoading(false);
  })(); }, [organizationId]);

  const update = <K extends keyof Theme>(key: K, value: Theme[K]) => setTheme(t => ({ ...t, [key]: value }));
  async function save() {
    setSaving(true); setSaved(false); setError('');
    const s = createClient();
    const { error: e } = await s.from('storefronts').update({ theme_settings: theme }).eq('organization_id', organizationId);
    if (e) setError(e.message); else { setSaved(true); setTimeout(() => setSaved(false), 1800); }
    setSaving(false);
  }
  async function togglePublish() {
    setSaving(true); setError('');
    const next = !published;
    const s = createClient();
    const { error: e } = await s.from('storefronts').update({ status: next ? 'published' : 'draft' }).eq('organization_id', organizationId);
    if (e) setError(e.message); else setPublished(next);
    setSaving(false);
  }

  if (loading) return <div className="panel empty">Loading customizer…</div>;
  const previewBg = theme.mode === 'dark' ? '#202020' : theme.mode === 'soft' ? '#f2eee7' : '#fbfaf8';
  const previewText = theme.mode === 'dark' ? '#fff' : '#171717';
  const cardBg = theme.mode === 'dark' ? '#2b2b2b' : '#fff';
  return <div>
    <div className="page-heading"><div><h1>Storefront</h1><p>Customize your public page and publish it when it is ready.</p></div><div style={{display:'flex',gap:8}}><a className="view-store" href={storefrontPath}><Eye size={16}/> Preview</a><button className="primary" onClick={togglePublish} disabled={saving}>{published ? 'Unpublish' : 'Publish'}</button></div></div>
    {error && <div className="panel empty" style={{color:'#9a2f2f'}}>{error}</div>}
    <div className="editor">
      <aside>
        <h3>Customize</h3>
        <div className="editor-section expanded"><div className="editor-section-head"><span>Theme</span><Type size={14}/></div><div className="editor-section-body">
          <label>Mode <select value={theme.mode} onChange={e=>update('mode',e.target.value as Theme['mode'])}><option value="light">Light</option><option value="soft">Soft</option><option value="dark">Dark</option></select></label>
          <label>Accent <input type="color" value={theme.accent} onChange={e=>update('accent',e.target.value)} /></label>
          <label>Corner radius <select value={theme.radius} onChange={e=>update('radius',e.target.value as Theme['radius'])}><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label>
        </div></div>
        <div className="editor-section expanded"><div className="editor-section-head"><span>Layout</span><LayoutGrid size={14}/></div><div className="editor-section-body">
          <div className="seg"><button className={theme.layout==='grid'?'on':''} onClick={()=>update('layout','grid')}>Grid</button><button className={theme.layout==='list'?'on':''} onClick={()=>update('layout','list')}>List</button></div>
          <label>Show prices <input type="checkbox" checked={theme.showPrices} onChange={e=>update('showPrices',e.target.checked)} /></label>
        </div></div>
        <button className="primary" onClick={save} disabled={saving} style={{width:'100%',justifyContent:'center'}}>{saved ? <><Check size={16}/> Saved</> : <><Save size={16}/> {saving?'Saving…':'Save changes'}</>}</button>
      </aside>
      <div className="editor-preview"><div className="preview-toolbar"><span>Live preview</span><span style={{marginLeft:'auto'}}>{published?'Published':'Draft'}</span></div>
        <div className="store-mini" style={{background:previewBg,color:previewText,borderRadius:theme.radius==='small'?8:theme.radius==='large'?24:16}}>
          <div style={{padding:'34px 28px',textAlign:'center',borderBottom:'1px solid #0001'}}><div className="monogram" style={{margin:'0 auto 10px',background:theme.accent,color:'#fff'}}>P</div><h2 style={{margin:0,fontFamily:'Playfair Display,serif'}}>Your storefront</h2><p style={{opacity:.65,fontSize:12}}>Your published products appear here.</p></div>
          <div style={{display:theme.layout==='grid'?'grid':'block',gridTemplateColumns:'repeat(2,1fr)',gap:12,padding:18}}>{[1,2,3].map(i=><div key={i} style={{background:cardBg,border:'1px solid #0001',borderRadius:theme.radius==='small'?8:theme.radius==='large'?20:14,padding:16,marginBottom:theme.layout==='list'?10:0}}><div style={{height:100,borderRadius:10,background:`linear-gradient(135deg, ${theme.accent}22, #0000000d)`,marginBottom:12}}/><strong>Product {i}</strong>{theme.showPrices&&<div style={{marginTop:6,fontWeight:700}}>Price</div>}</div>)}</div>
        </div>
      </div>
    </div>
  </div>;
}
