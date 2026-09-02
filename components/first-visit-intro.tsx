'use client';

import { useEffect, useState } from 'react';
import AmbientVideo from './ambient-video';

const SEEN_KEY = 'product-hub:intro-seen:v1';

export default function FirstVisitIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    sessionStorage.setItem(SEEN_KEY, '1');
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 6500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="first-visit-intro" role="dialog" aria-label="Introdução ao Product Hub">
      <AmbientVideo
        src="/videos/abertura-do-product-hub.mp4"
        poster="/videos/abertura-do-product-hub.jpg"
        className="first-visit-video"
        priority
        ariaLabel="Animação de abertura do Product Hub"
      />
      <div className="first-visit-overlay" />
      <div className="first-visit-content">
        <span>PRODUCT HUB</span>
        <h1>O teu negócio,<br />mais simples.</h1>
        <p>Um espaço para organizar produtos, criar a tua vitrine e acompanhar o que está a acontecer.</p>
        <button type="button" onClick={() => setVisible(false)}>Entrar</button>
      </div>
      <button className="first-visit-skip" type="button" onClick={() => setVisible(false)}>Saltar</button>
    </div>
  );
}
