import Link from 'next/link';
import { ArrowRight, BarChart3, Check, MousePointer2, Sparkles, Store } from 'lucide-react';
import styles from './home.module.css';

export default function Home() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}><span className={styles.mark}><Sparkles size={17}/></span><span>Product Hub</span></Link>
        <div className={styles.navlinks}><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#preview">Storefront</a></div>
        <div className={styles.actions}><Link href="/login" className={styles.login}>Log in</Link><Link href="/dashboard" className={styles.cta}>Create your storefront <ArrowRight size={14}/></Link></div>
      </nav>

      <section className={styles.hero} id="preview">
        <div className={styles.copy}>
          <div className={styles.eyebrow}><i/> BUILT FOR PEOPLE WHO SELL ONLINE</div>
          <h1 className={styles.title}>Everything you sell. <em>One place.</em></h1>
          <p className={styles.sub}>Turn your products, offers and services into a storefront that feels like your brand — then send every customer to the checkout you already trust.</p>
          <div className={styles.heroActions}><Link href="/dashboard" className={`${styles.cta} ${styles.large}`}>Create your storefront <ArrowRight size={16}/></Link><a href="#how-it-works" className={`${styles.secondary} ${styles.large}`}>See how it works</a></div>
          <div className={styles.proof}><div className={styles.avatars}><span className={styles.avatar}>A</span><span className={styles.avatar}>M</span><span className={styles.avatar}>J</span></div><span>Courses · Ebooks · Services · Affiliate offers</span></div>
        </div>

        <div className={styles.previewWrap}>
          <div className={styles.glow}/>
          <div className={`${styles.floating} ${styles.one}`}><span><Store size={14}/></span>Your storefront is live</div>
          <div className={`${styles.floating} ${styles.two}`}><span><BarChart3 size={14}/></span>128 views · 24 clicks</div>
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
        <div className={styles.item}><span className={styles.number}>01</span><strong>Build once</strong><p>Add your products, prices, images and purchase links from one clean dashboard.</p></div>
        <div className={styles.item}><span className={styles.number}>02</span><strong>Share everywhere</strong><p>One polished storefront link for Instagram, WhatsApp, TikTok, bio links and more.</p></div>
        <div className={styles.item}><span className={styles.number}>03</span><strong>Know what works</strong><p>See visits, product views and purchase clicks without guessing what your audience wants.</p></div>
      </section>

      <section className={styles.strip} id="features">
        <div className={styles.item}><span className={styles.number}><Check size={13}/></span><strong>Your checkout stays yours</strong><p>Send buyers to Hotmart, Kiwify, Eduzz, Shopify, WhatsApp or any HTTPS purchase page.</p></div>
        <div className={styles.item}><span className={styles.number}><MousePointer2 size={13}/></span><strong>Designed around products</strong><p>Not another generic link page. Your products are the main event, with featured content and categories.</p></div>
        <div className={styles.item}><span className={styles.number}><Sparkles size={13}/></span><strong>Made to feel premium</strong><p>Responsive layouts, subtle motion and real product UI instead of noisy gradients and template clutter.</p></div>
      </section>
    </main>
  );
}
