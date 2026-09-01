import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StorefrontTracker, TrackedPurchaseLink } from '@/components/storefront-tracker';
import styles from '../storefront.module.css';

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

async function imageFor(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const supabase = await createClient();
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
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
  const accent = typeof theme.accent === 'string' ? theme.accent : '#1f1f1f';
  const featuredImage = await imageFor(featured?.images?.[0]?.storage_path);
  const restWithImages = await Promise.all(rest.map(async item => ({ item, image: await imageFor(item.images?.[0]?.storage_path) })));

  return <main className={styles.page} style={{ ['--accent' as string]: accent }}><div className={styles.inner}>
    <StorefrontTracker organizationId={store.organization.id} />
    <header className={styles.header}><div className={styles.identity}>
      {store.organization.logo_url ? <img className={styles.logo} src={store.organization.logo_url} alt={store.organization.name}/> : <div className={styles.monogram}>{store.organization.name.slice(0,1).toUpperCase()}</div>}
      <h1 className={styles.name}>{store.organization.name}</h1>{store.organization.description && <p className={styles.bio}>{store.organization.description}</p>}
    </div></header>

    {featured && <section className={styles.featured}><div className={styles.featuredCopy}>
      <span className={styles.eyebrow}>DESTAQUE</span><h2 className={styles.title}>{featured.name}</h2>{featured.description && <p className={styles.description}>{featured.description}</p>}
      <div className={styles.buyLine}><TrackedPurchaseLink organizationId={store.organization.id} productId={featured.id} href={featured.purchase_url} className={styles.buy}>Comprar agora <ArrowRight size={17}/></TrackedPurchaseLink>{money(featured) && <strong className={styles.price}>{money(featured)}</strong>}</div>
    </div>{featuredImage && <div className={styles.featuredArt}><img src={featuredImage} alt={featured.name}/></div>}</section>}

    {products.length > 0 && <nav className={styles.nav} aria-label="Produtos"><button className={`${styles.filter} ${styles.filterActive}`}>Todos</button>{categories.map(category => <button className={styles.filter} key={category}>{category}</button>)}</nav>}

    {rest.length > 0 && <section className={styles.grid}>{restWithImages.map(({ item, image }) => { const price=money(item); return <article className={styles.card} key={item.id}>
      {image ? <a className={styles.cardImage} href={`/store/${store.organization.slug}/${item.slug}`}><img src={image} alt={item.name}/></a> : <a className={`${styles.cardImage} ${styles.noImage}`} href={`/store/${store.organization.slug}/${item.slug}`}>Product Hub</a>}
      <div className={styles.cardBody}>{item.provider && <span className={styles.label}>{item.provider}</span>}<h3 className={styles.cardTitle}>{item.name}</h3>{item.description && <p className={styles.cardDescription}>{item.description}</p>}
        <div className={styles.cardFooter}><TrackedPurchaseLink organizationId={store.organization.id} productId={item.id} href={item.purchase_url} className={styles.cardBuy}>Comprar <ArrowRight size={14}/></TrackedPurchaseLink>{price && <strong className={styles.cardPrice}>{price}</strong>}</div>
      </div></article>; })}</section>}

    {!products.length && <div className={styles.empty}><h2>Nenhum produto publicado.</h2><p>Esta vitrine ainda não tem produtos disponíveis.</p></div>}
    <footer className={styles.footer}><span>Product Hub</span><strong>{store.organization.name}</strong></footer>
  </div></main>;
}
