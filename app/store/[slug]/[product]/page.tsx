import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductViewTracker, TrackedPurchaseLink } from '@/components/storefront-tracker';

type ProductImage={storage_path:string};
type Product={id:string;name:string;slug:string;description?:string|null;price?:number|null;currency?:string|null;purchase_url:string;provider?:string|null;images?:ProductImage[]};
type StoreData={organization:{id:string;name:string;slug:string};products:Product[]};
export default async function ProductPage({params}:{params:Promise<{slug:string;product:string}>}){
 const {slug,product:productSlug}=await params;const supabase=await createClient();const {data,error}=await supabase.rpc('get_public_storefront',{store_slug:slug});if(error||!data?.organization)notFound();const store=data as StoreData;const item=(store.products||[]).find(p=>p.slug===productSlug);if(!item)notFound();
 const path=item.images?.[0]?.storage_path;const image=path?.startsWith('http')?path:path?supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl:null;let price:string|null=null;if(item.price!=null){try{price=new Intl.NumberFormat('pt-PT',{style:'currency',currency:item.currency||'AOA'}).format(item.price)}catch{price=`${item.currency||''} ${item.price}`.trim()}}
 return <main className="product-detail-page"><ProductViewTracker organizationId={store.organization.id} productId={item.id}/><Link href={`/store/${slug}`} className="back-link"><ArrowLeft size={17}/> Voltar para a vitrine</Link><div className="product-detail"><div className="product-detail-image">{image?<img src={image} alt={item.name}/>:<div className="image-placeholder">{item.name.slice(0,1)}</div>}</div><div className="product-detail-copy"><span className="category-label">{item.provider||'PRODUTO'}</span><h1>{item.name}</h1>{item.description&&<p>{item.description}</p>}{price&&<strong className="detail-price">{price}</strong>}<TrackedPurchaseLink organizationId={store.organization.id} productId={item.id} href={item.purchase_url} className="primary">Comprar agora <ArrowRight size={18}/></TrackedPurchaseLink><small>Você será direcionado para o site oficial de compra.</small></div></div></main>;
}
