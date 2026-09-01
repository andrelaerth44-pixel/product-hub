import { ArrowRight, Instagram, Music2, Youtube } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const fallbackImages = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85',
];

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
  if (product.price == null) return 'Sob consulta';
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: product.currency || 'AOA' }).format(product.price);
}

function imageFor(product: Product, index: number) {
  const path = product.images?.[0]?.storage_path;
  return path?.startsWith('http') ? path : fallbackImages[index % fallbackImages.length];
}

export default async function Storefront({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_storefront', { store_slug: slug });
  if (error || !data?.organization) notFound();
  const store = data as StoreData;
  const products = [...(store.products || [])].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  const featured = products.find(p => p.is_featured) || products[0];
  const rest = products.filter(p => p.id !== featured?.id);

  return <main className="storefront-page">
    <header className="store-header">
      <div className="store-identity">
        <div className="signature">{store.organization.name.slice(0, 1).toUpperCase()}</div>
        <div><h1>{store.organization.name}</h1><p>{store.organization.description || 'Explore our products and offers.'}</p></div>
      </div>
      <div className="socials" aria-label="Social links"><Instagram size={21}/><Music2 size={21}/><Youtube size={22}/></div>
    </header>

    {featured && <section className="featured">
      <div className="featured-copy"><span>• DESTAQUE</span><h2>{featured.name}</h2><p>{featured.description || 'Descubra todos os detalhes deste produto e veja como ele pode ajudar você.'}</p><div className="feature-points"><span>✓ Acesso direto</span><span>✓ Oferta oficial</span><span>✓ Compra segura</span></div><div className="buy-line"><a href={featured.purchase_url} target="_blank" rel="noreferrer">Comprar agora <ArrowRight size={18}/></a><div><strong>{money(featured)}</strong></div></div></div>
      <div className="featured-art"><img src={imageFor(featured, 0)} alt={featured.name}/></div>
    </section>}

    <div className="category-nav"><button className="selected">Todos</button><button>Cursos</button><button>Ebooks</button><button>Mentorias</button><button>Serviços</button></div>

    <section className="product-grid">{(rest.length ? rest : products).map((item, index) => <article className="store-card" key={item.id}>
      <a className="store-card-image" href={`/store/${store.organization.slug}/${item.slug}`}><img src={imageFor(item, index + 1)} alt={item.name}/></a>
      <span className="category-label">{item.provider || 'PRODUTO'}</span><h3>{item.name}</h3><p>{item.description || 'Saiba mais sobre este produto.'}</p>
      <div className="card-footer"><a href={item.purchase_url} target="_blank" rel="noreferrer">Comprar <ArrowRight size={16}/></a><strong>{money(item)}</strong></div>
    </article>)}</section>

    {!products.length && <div className="store-empty"><h2>A vitrine está sendo preparada.</h2><p>Novos produtos aparecerão aqui em breve.</p></div>}
    <footer className="store-footer"><span>Product Hub</span><span>Todos os produtos em um só lugar.</span></footer>
  </main>;
}
