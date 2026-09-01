import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StorefrontTracker, TrackedPurchaseLink } from '@/components/storefront-tracker';

type Product = {
  id: string; name: string; slug: string; description?: string | null; price?: number | null;
  currency?: string; purchase_url: string; provider?: string | null; is_featured: boolean;
  images?: { storage_path: string }[];
};
type StoreData = {
  organization: { id: string; name: string; slug: string; description?: string | null; logo_url?: string | null };
  storefront: { status: string; template: string; theme_settings: Record<string, unknown> };
  products: Product[];
};

function money(product: Product) {
  if (product.price == null) return null;
  try { return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: product.currency || 'AOA' }).format(product.price); }
  catch { return `${product.currency || ''} ${product.price}`.trim(); }
}

function imageFor(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = createClient().storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export default async function Storefront({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_storefront', { store_slug: slug });
  if (error || !data?.organization) notFound();
  const store = data as StoreData;
  const products = store.products || [];
  const featured = products.find(p => p.is_featured) || products[0];
  const rest = products.filter(p => p.id !== featured?.id);
  const categories = Array.from(new Set(products.map(p => p.provider).filter(Boolean))) as string[];
  const theme = store.storefront.theme_settings || {};
  const accent = typeof theme.accent === 'string' ? theme.accent : undefined;

  return <main className="storefront-page" style={accent ? { ['--store-accent' as string]: accent } : undefined}>
    <StorefrontTracker organizationId={store.organization.id} />
    <header className="store-header">
      <div className="store-identity">
        {store.organization.logo_url ? <img className="store-logo" src={store.organization.logo_url} alt={store.organization.name}/> : <div className="signature">{store.organization.name.slice(0, 1).toUpperCase()}</div>}
        <div><h1>{store.organization.name}</h1>{store.organization.description && <p>{store.organization.description}</p>}</div>
      </div>
    </header>

    {featured && <section className="featured">
      <div className="featured-copy"><span>• DESTAQUE</span><h2>{featured.name}</h2>{featured.description && <p>{featured.description}</p>}<div className="buy-line"><TrackedPurchaseLink organizationId={store.organization.id} productId={featured.id} href={featured.purchase_url}>Comprar agora <ArrowRight size={18}/></TrackedPurchaseLink>{money(featured) && <div><strong>{money(featured)}</strong></div>}</div></div>
      {imageFor(featured.images?.[0]?.storage_path) && <div className="featured-art"><img src={imageFor(featured.images?.[0]?.storage_path)!} alt={featured.name}/></div>}
    </section>}

    {products.length > 0 && <div className="category-nav"><button className="selected">Todos</button>{categories.map(category => <button key={category}>{category}</button>)}</div>}

    {rest.length > 0 && <section className="product-grid">{rest.map((item) => {
      const image = imageFor(item.images?.[0]?.storage_path); const price = money(item);
      return <article className="store-card" key={item.id}>
        {image ? <a className="store-card-image" href={`/store/${store.organization.slug}/${item.slug}`}><img src={image} alt={item.name}/></a> : <a className="store-card-image no-image" href={`/store/${store.organization.slug}/${item.slug}`} aria-label={`View ${item.name}`}><span>Product Hub</span></a>}
        {item.provider && <span className="category-label">{item.provider}</span>}<h3>{item.name}</h3>{item.description && <p>{item.description}</p>}
        <div className="card-footer"><TrackedPurchaseLink organizationId={store.organization.id} productId={item.id} href={item.purchase_url}>Comprar <ArrowRight size={16}/></TrackedPurchaseLink>{price && <strong>{price}</strong>}</div>
      </article>;
    })}</section>}

    {!products.length && <div className="store-empty"><h2>Nenhum produto publicado.</h2><p>Esta vitrine ainda não tem produtos disponíveis.</p></div>}
    <footer className="store-footer"><span>Product Hub</span><span>{store.organization.name}</span></footer>
  </main>;
}
