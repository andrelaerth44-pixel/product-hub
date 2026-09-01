import Link from 'next/link';

export default function Home() {
  return (
    <main className="marketing-page">
      <nav className="marketing-nav">
        <div className="brand"><span className="brand-mark">P</span><span>Product Hub</span></div>
        <div className="nav-actions"><Link href="/login" className="text-link">Log in</Link><Link href="/dashboard" className="button dark">Create your storefront</Link></div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">YOUR PRODUCTS, ONE PLACE</p>
          <h1>Turn everything you sell into one beautiful storefront.</h1>
          <p className="hero-sub">Create a professional product page, share one link everywhere, and send customers straight to the checkout or provider you already use.</p>
          <div className="hero-actions"><Link href="/dashboard" className="button dark large">Create your storefront <span>→</span></Link><Link href="/store/joao-silva" className="button light large">View example</Link></div>
          <div className="trust-row"><span>Courses</span><span>Ebooks</span><span>Mentorships</span><span>Services</span><span>Affiliate offers</span></div>
        </div>
        <div className="hero-preview">
          <div className="preview-top"><span className="dot"/><span className="dot"/><span className="dot"/><span className="preview-url">producthub.store/@joao-silva</span></div>
          <div className="preview-brand"><span className="signature">JS</span><strong>JOÃO SILVA</strong><small>Especialista em Marketing Digital</small><div>◎　♪　▶</div></div>
          <div className="preview-feature"><div><span>DESTAQUE</span><h3>Curso Completo de<br/>Marketing Digital</h3><p>Estratégias comprovadas para atrair, converter e escalar.</p><b>Comprar agora　→</b></div><div className="fake-product"><div className="fake-book">MARKETING<br/>DIGITAL</div><div className="fake-laptop"/></div></div>
          <div className="mini-grid"><div/><div/><div/></div>
        </div>
      </section>
      <section className="feature-strip"><div><b>01</b><strong>One link</strong><span>Everything your audience needs in one place.</span></div><div><b>02</b><strong>External checkout</strong><span>Keep selling through Hotmart, Kiwify, WhatsApp and more.</span></div><div><b>03</b><strong>Analytics</strong><span>See views, clicks and your best-performing products.</span></div></section>
    </main>
  );
}
