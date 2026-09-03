'use client';

import { useEffect, useState } from 'react';
import styles from './dashboard-hero.module.css';

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function DashboardHero({ name }: { name?: string | null; views?: number; clicks?: number; products?: number }) {
  const [salutation, setSalutation] = useState('Olá');

  useEffect(() => {
    setSalutation(greeting());
    const timer = window.setInterval(() => setSalutation(greeting()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className={styles.hero} aria-label="Resumo do negócio">
      <div className={styles.copy}>
        <h1>{salutation}, {name || 'empreendedor'}.</h1>
        <p>O teu comércio num só lugar. Acompanha o que está a acontecer e gere a tua operação com clareza.</p>
        <div className={styles.live}><span /> Dados reais do teu storefront</div>
      </div>
      <div className={styles.visual} aria-hidden="true" />
    </section>
  );
}
