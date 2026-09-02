'use client';

import { useEffect, useState } from 'react';

const SEEN_KEY = 'product-hub:intro-seen:v1';
const OPENING_VIDEO = 'https://cdn.creativeclaw.co/u/14466949/videos/7df8835e-2d90-4480-86fe-b2a59a2a45fa.mp4';

export default function FirstVisitIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (localStorage.getItem(SEEN_KEY)) return;
    localStorage.setItem(SEEN_KEY, '1');
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 6500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="first-visit-intro" role="dialog" aria-label="Introdução ao Product Hub">
      <video className="first-visit-video" autoPlay muted loop playsInline preload="auto" src={OPENING_VIDEO} aria-hidden="true" />
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
