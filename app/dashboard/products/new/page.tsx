'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, Link2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const slugify = (value: string) => value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function NewProductPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null); const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('AOA'); const [purchaseUrl, setPurchaseUrl] = useState(''); const [provider, setProvider] = useState('Other');
  const [category, setCategory] = useState(''); const [imageUrl, setImageUrl] = useState(''); const [published, setPublished] = useState(true); const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');

  useEffect(() => { (async () => { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace('/login'); return; } setUserId(user.id); const { data: membership } = await supabase.from('organization_members').select('organization_id').eq('user_id', user.id).limit(1).maybeSingle(); if (membership?.organization_id) setOrganizationId(membership.organization_id); })(); }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!userId || !organizationId) { setError('Your workspace is not ready yet. Complete onboarding first.'); return; }
    if (!purchaseUrl.startsWith('https://')) { setError('Use a secure HTTPS purchase link.'); return; }
    setSaving(true); const supabase = createClient(); const slug = slugify(name) || `product-${Date.now()}`;
    const { data: existing } = await supabase.from('products').select('id').eq('organization_id', organizationId).eq('slug', slug).maybeSingle();
    if (existing) { setError('A product with this name already exists.'); setSaving(false); return; }

    let categoryId: string | null = null;
    if (category) {
      const categorySlug = slugify(category);
      const { data: cat, error: catError } = await supabase.from('categories').upsert({ organization_id: organizationId, name: category, slug: categorySlug }, { onConflict: 'organization_id,slug' }).select('id').single();
      if (catError) { setError(catError.message); setSaving(false); return; }
      categoryId = cat.id;
    }

    const { data: product, error: insertError } = await supabase.from('products').insert({ organization_id: organizationId, category_id: categoryId, name, slug, description: description || null, price: price ? Number(price) : null, currency, purchase_url: purchaseUrl, provider, is_featured: featured, is_published: published, position: 0 }).select('id').single();
    if (insertError || !product) { setError(insertError?.message || 'Unable to create product.'); setSaving(false); return; }

    if (imageUrl) {
      const { error: imageError } = await supabase.from('product_images').insert({ product_id: product.id, storage_path: imageUrl, position: 0 });
      if (imageError) { await supabase.from('products').delete().eq('id', product.id); setError(imageError.message); setSaving(false); return; }
    }
    router.push('/dashboard'); router.refresh();
  }

  return <main className="form-page"><div className="form-page-header"><Link href="/dashboard" className="back-link"><ArrowLeft size={17}/> Back to products</Link><div><h1>Add product</h1><p>Create a polished product card for your storefront.</p></div></div><form className="product-form" onSubmit={submit}>
    <section className="form-panel"><div className="form-section-title"><div><h2>Product details</h2><p>Keep it clear and focused on what you are offering.</p></div></div><label>Product name<span>*</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Curso Completo de Marketing Digital" required/></label><label>Description <em>Optional</em><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Tell people what they will get..." rows={5}/></label><div className="two-col"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Select category</option><option>Curso</option><option>Ebook</option><option>Mentoria</option><option>Serviço</option><option>Outro</option></select></label><label>Provider<select value={provider} onChange={e=>setProvider(e.target.value)}><option>Hotmart</option><option>Kiwify</option><option>Eduzz</option><option>Shopify</option><option>WhatsApp</option><option>Other</option></select></label></div></section>
    <section className="form-panel"><div className="form-section-title"><div><h2>Purchase</h2><p>Where should customers go when they click Buy?</p></div></div><label>Purchase link<span>*</span><div className="input-icon"><Link2 size={17}/><input type="url" value={purchaseUrl} onChange={e=>setPurchaseUrl(e.target.value)} placeholder="https://..." required/></div></label><div className="two-col"><label>Price <em>Optional</em><input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00"/></label><label>Currency<select value={currency} onChange={e=>setCurrency(e.target.value)}><option>AOA</option><option>USD</option><option>EUR</option><option>BRL</option></select></label></div></section>
    <section className="form-panel"><div className="form-section-title"><div><h2>Product image</h2><p>Use an image URL now; the storage upload flow will replace this with direct uploads.</p></div></div><label>Image URL <em>Optional</em><div className="input-icon"><ImagePlus size={17}/><input type="url" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://images.example.com/product.jpg"/></div></label>{imageUrl&&<div className="image-preview"><img src={imageUrl} alt="Product preview"/><button type="button" onClick={()=>setImageUrl('')}><X size={15}/></button></div>}</section>
    <section className="form-panel options"><label className="check"><input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)}/><span><strong>Feature this product</strong><small>Show it prominently in your storefront.</small></span></label><label className="check"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/><span><strong>Publish immediately</strong><small>Make this product visible when your storefront is published.</small></span></label></section>
    {error&&<div className={`form-error ${error.startsWith('✓')?'success':''}`}>{error}</div>}<div className="form-actions"><Link href="/dashboard">Cancel</Link><button className="primary" disabled={saving}><Save size={17}/>{saving?'Saving…':'Save product'}</button></div>
  </form></main>;
}
