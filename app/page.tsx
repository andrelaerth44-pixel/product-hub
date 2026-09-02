import Link from 'next/link';
import { ArrowRight, BarChart3, Check, MousePointer2, Sparkles } from 'lucide-react';
import styles from './home.module.css';
import { ScrollVideo } from '@/components/scroll-video';

const videos = [
  { src: 'https://dnznrvs05pmza.cloudfront.net/e78d6f68-9376-4aad-9728-c95b912ce055.mp4?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzI2YjE2ZmNiYmUwMmM5MyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc4ODUwNTM0MH0.j-OtzTqhNjEpRQ6SkWotIIsSs1UyNQEvnglddu0TAsE', index: '01 / ABERTURA', title: 'O teu negócio começa aqui.', text: 'Uma entrada cinematográfica para o Product Hub, com o produto no centro e sem ruído visual.' },
  { src: 'https://cdn.creativeclaw.co/u/14466949/videos/8ecd2354-e0e4-4cb3-8820-d52cbf4fab89.mp4', index: '02 / ACESSO', title: 'Entra. Continua. Está tudo no lugar.', text: 'O acesso acontece sem tirar o utilizador da experiência.' },
  { src: 'https://cdn.creativeclaw.co/u/14466949/videos/c3ac8ca4-44dd-4881-8ccb-fd490f92b4d0.mp4', index: '03 / WORKSPACE', title: 'O teu workspace ganha vida.', text: 'Organiza produtos, categorias e a tua presença digital num só espaço.' },
  { src: 'https://cdn.creativeclaw.co/u/14466949/videos/5c0e25e5-cbbd-4542-87eb-90a0656402b2.mp4', index: '04 / VITRINE', title: 'Uma vitrine que parece tua.', text: 'Apresenta os teus produtos com uma experiência premium, responsiva e pronta para partilhar.' },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}><span className={styles.mark}><Sparkles size={17}/></span><span>Product Hub</span></Link>
        <div className={styles.navlinks}><a href="#how-it-works">Como funciona</a><a href="#features">Recursos</a><a href="#videos">Experiência</a></div>
        <div className={styles.actions}><Link href="/login" className={styles.login}>Entrar</Link><Link href="/dashboard" className={styles.cta}>Criar a minha vitrine <ArrowRight size={14}/></Link></div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <div className={styles.eyebrow}>PRODUCT HUB / O TEU NEGÓCIO, NUM SÓ LUGAR</div>
          <h1 className={styles.title}>Tudo o que vendes. <em>Num só lugar.</em></h1>
          <p className={styles.sub}>Produtos, ofertas e serviços numa vitrine que tem a tua cara — com o checkout que já usas e analytics para saber o que está a funcionar.</p>
          <div className={styles.heroActions}><Link href="/dashboard" className={`${styles.cta} ${styles.large}`}>Criar a minha vitrine <ArrowRight size={16}/></Link><a href="#videos" className={`${styles.secondary} ${styles.large}`}>Ver experiência</a></div>
          <div className={styles.proof}>Cursos · Ebooks · Serviços · Produtos digitais · Ofertas afiliadas</div>
        </div>

        <div className={styles.previewWrap}>
          <div className={styles.preview}>
            <div className={styles.browser}><i className={styles.dot}/><i className={styles.dot}/><i className={styles.dot}/><div className={styles.url}>producthub.store/@joao-silva</div></div>
            <div className={styles.store}>
              <div className={styles.storeTop}><div className={styles.storeAvatar}>JS</div><div className={styles.storeName}>JOÃO SILVA</div><div className={styles.storeBio}>Especialista em Marketing Digital</div><div className={styles.social}>◎　in　▶</div></div>
              <div className={styles.featured}>
                <div className={styles.featuredCopy}><span className={styles.tag}>DESTAQUE</span><h3>Curso Completo de Marketing Digital</h3><p>Estratégias práticas para atrair, converter e escalar.</p><b className={styles.buy}>Ver produto <ArrowRight size={10}/></b></div>
                <div className={styles.visual}><div className={styles.card}><b>PRODUCT HUB</b><strong>MARKETING<br/>DIGITAL</strong></div><div className={styles.phone}><div/><div/><div/><div/><div/></div></div>
              </div>
              <div className={styles.products}><div className={styles.product}/><div className={styles.product}/><div className={styles.product}/></div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.strip} id="how-it-works">
        <div className={styles.item}><span className={styles.number}>01</span><strong>Cria uma vez</strong><p>Adiciona produtos, preços, imagens e links de compra a partir de um dashboard limpo.</p></div>
        <div className={styles.item}><span className={styles.number}>02</span><strong>Partilha em todo o lado</strong><p>Um único link de vitrine para Instagram, WhatsApp, TikTok, bio links e mais.</p></div>
        <div className={styles.item}><span className={styles.number}>03</span><strong>Percebe o que funciona</strong><p>Vê visitas, visualizações de produto e cliques de compra sem adivinhar.</p></div>
      </section>

      <section className={styles.strip} id="features">
        <div className={styles.item}><span className={styles.number}><Check size={13}/></span><strong>O checkout continua a ser teu</strong><p>Envia compradores para Hotmart, Kiwify, Eduzz, Shopify, WhatsApp ou qualquer página HTTPS.</p></div>
        <div className={styles.item}><span className={styles.number}><MousePointer2 size={13}/></span><strong>Feito à volta dos produtos</strong><p>Não é mais uma página genérica de links. Os teus produtos são o centro da experiência.</p></div>
        <div className={styles.item}><span className={styles.number}><BarChart3 size={13}/></span><strong>Dados que ajudam</strong><p>Analytics reais para entender onde as pessoas entram, exploram e clicam.</p></div>
      </section>

      <section className={styles.videoRail} id="videos">
        {videos.map((video) => (
          <section className={styles.videoSection} key={video.src}>
            <ScrollVideo src={video.src} className={styles.videoBackground} ariaLabel={`${video.index}: ${video.title}`} />
            <div className={styles.videoCopy}>
              <span className={styles.videoIndex}>{video.index}</span>
              <h2>{video.title}</h2>
              <p>{video.text}</p>
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
