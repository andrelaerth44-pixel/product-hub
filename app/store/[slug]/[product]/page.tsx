import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ProductPage({ params }: { params: Promise<{ slug: string; product: string }> }) {
  const { slug, product } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_storefront', { store_slug: slug });
  if (error || !data?.organization) notFound();
  const item = (data.products || []).find((p: { slug: string }) => p.slug === product);
  if (!item) notFound();
  const image = item.images?.[0]?.storage_path?.startsWith('http') ? item.images[0].storage_path : null;
  const price = item.price == null ? 'Sob consulta' : new Intl.NumberFormat('pt-PT', { style: 'currency', currency: item.currency || 'AOA' }).format(item.price);

  return <main className="product-detail-page">
    <Link href={`/store/${slug}`} className="back-link"><ArrowLeft size={17}/> Voltar para a vitrine</Link>
    <div className="product-detail">
      <div className="product-detail-image">{image ? <img src={image} alt={item.name}/> : <div className="image-placeholder">{item.name.slice(0, 1)}</div>}</div>
      <div className="product-detail-copy"><span className="category-label">{item.provider || 'PRODUTO'}</span><h1>{item.name}</h1><p>{item.description || 'Conheça este produto e veja todos os detalhes antes de comprar.'}</p><strong className="detail-price">{price}</strong><a className="primary" href={item.purchase_url} target="_blank" rel="noreferrer">Comprar agora <ArrowRight size={18}/></a><small>Você será direcionado para o site oficial de compra.</small></div>
    </div>
  </main>;
}
