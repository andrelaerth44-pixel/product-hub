'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Activity, Sparkles } from 'lucide-react';
import styles from './dashboard-hero.module.css';

const HERO_IMAGE = 'https://cdn.creativeclaw.co/u/14466949/images/b0b66306-8a03-4e42-ba7d-31bcd286d41a.png';

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function DashboardHero({ name, views, clicks, products }: { name?: string | null; views: number; clicks: number; products: number }) {
  const [salutation, setSalutation] = useState('Olá');

  useEffect(() => {
    setSalutation(greeting());
    const timer = window.setInterval(() => setSalutation(greeting()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className={styles.hero} aria-label="Resumo do negócio">
      <div className={styles.copy}>
        <div className={styles.eyebrow}><Sparkles size={13} /> PRODUCT HUB / OVERVIEW</div>
        <h1>{salutation}, {name || 'empreendedor'}.</h1>
        <p>O teu comércio num só lugar. Acompanha produtos, visitas e crescimento com uma visão clara do que está a acontecer.</p>
        <div className={styles.live}><span /> Dados reais do teu storefront</div>
        <div className={styles.stats}>
          <div><strong>{views.toLocaleString('pt-PT')}</strong><span>visitas</span></div>
          <div><strong>{clicks.toLocaleString('pt-PT')}</strong><span>cliques</span></div>
          <div><strong>{products.toLocaleString('pt-PT')}</strong><span>produtos</span></div>
        </div>
      </div>
      <div className={styles.visual}>
        <img className={styles.poster} src={HERO_IMAGE} alt="" loading="eager" />
        <div className={styles.orbit} />
        <div className={styles.dataCard}><div><Activity size={14} /><span>Commerce pulse</span></div><strong>{clicks ? `${((clicks / Math.max(views, 1)) * 100).toFixed(1)}%` : '0.0%'}</strong><small>CTR actual</small></div>
        <div className={styles.action}><ArrowUpRight size={16} /></div>
      </div>
    </section>
  );
}
