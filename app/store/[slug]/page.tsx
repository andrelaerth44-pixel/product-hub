import { ArrowRight, Instagram, Play, ShoppingBag, Youtube } from 'lucide-react';

const items = [
  { type: 'CURSO', title: 'Estratégias de Conteúdo que Vendem', desc: 'Crie conteúdo estratégico que atrai, engaja e converte seu público ideal.', price: 'R$ 297,00', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85' },
  { type: 'EBOOK', title: 'Tráfego Pago do Zero ao Avançado', desc: 'Aprenda a criar campanhas rentáveis no Google e Meta Ads.', price: 'R$ 67,00', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85' },
  { type: 'MENTORIA', title: 'Mentoria em Performance Digital', desc: 'Acompanhamento personalizado para alavancar seus resultados.', price: 'R$ 1.997,00', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85' },
  { type: 'SERVIÇO', title: 'Gestão de Tráfego Pago', desc: 'Estratégia, criação e gestão completa das suas campanhas.', price: 'Sob consulta', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85' },
];

export default function Storefront() {
  return <main className="storefront-page">
    <header className="store-header"><div className="store-identity"><div className="signature">JS</div><div><h1>JOÃO SILVA</h1><p>Especialista em Marketing Digital</p></div></div><div className="socials"><Instagram size={22}/><span>♪</span><Youtube size={22}/></div></header>
    <section className="featured"><div className="featured-copy"><span>• DESTAQUE</span><h2>Curso Completo de<br/>Marketing Digital</h2><p>Aprenda do zero ao avançado as estratégias comprovadas para atrair, converter e escalar qualquer negócio online.</p><div className="feature-points"><span>◉ +60 aulas práticas</span><span>♧ Materiais e templates</span><span>⌁ Certificado incluso</span></div><div className="buy-line"><a href="https://example.com" target="_blank" rel="noreferrer">Comprar agora <ArrowRight size={18}/></a><div><del>De R$ 997,00</del><strong>R$ 497,00</strong></div></div></div><div className="featured-art"><div className="book">MARKETING<br/>DIGITAL<small>ESTRATÉGIAS • TRÁFEGO • CONVERSÃO</small><b>JS</b></div><div className="laptop"><div className="screen"><i/><i/><i/><i/></div></div><div className="mug">S</div></div></section>
    <div className="category-nav"><button className="selected">Todos</button><button>↓　Cursos</button><button>◉　Ebooks</button><button>⌄　Mentorias</button><button>◯　Serviços</button></div>
    <section className="product-grid">{items.map((item)=><article className="store-card" key={item.title}><img src={item.image} alt=""/><span className="category-label">{item.type}</span><h3>{item.title}</h3><p>{item.desc}</p><div className="card-footer"><a href="https://example.com" target="_blank" rel="noreferrer">Comprar <ArrowRight size={16}/></a><strong>{item.price}</strong><ArrowRight size={16}/></div></article>)}</section>
    <footer className="store-footer"><span>Product Hub</span><span>Todos os produtos em um só lugar.</span></footer>
  </main>;
}
