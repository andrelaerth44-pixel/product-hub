'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, Package, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './home.module.css';

const screens = [
  { eyebrow: 'PRODUCT HUB', title: 'O teu negócio começa aqui.', text: 'Uma base simples para organizar produtos, vitrine e decisões num só lugar.', icon: null },
  { eyebrow: 'CATÁLOGO', title: 'Os teus produtos, no lugar certo.', text: 'Cria, organiza e apresenta o teu catálogo sem complicação.', icon: Package },
  { eyebrow: 'VITRINE', title: 'Uma vitrine que parece tua.', text: 'Personaliza identidade, layout e experiência enquanto acompanhas o resultado.', icon: Store },
  { eyebrow: 'WORKSPACE', title: 'Tudo pronto para continuares.', text: 'Entra no teu workspace e começa a trabalhar com dados reais.', icon: BarChart3 },
];

export default function Home() {
  const router = useRouter();
  const railRef = useRef<HTMLElement>(null);
  const activeIndex = useRef(0);
  const locked = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const moveToStep = (next: number) => {
    if (locked.current || leaving) return;
    if (next < 0) return;
    if (next >= screens.length) {
      locked.current = true;
      setLeaving(true);
      window.setTimeout(() => router.replace('/login'), 520);
      return;
    }
    locked.current = true;
    activeIndex.current = next;
    setCurrentStep(next);
    window.setTimeout(() => { locked.current = false; }, 650);
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 8 || locked.current) return;
      moveToStep(activeIndex.current + (event.deltaY > 0 ? 1 : -1));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const forward = ['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key);
      const backward = ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key);
      const enter = event.key === 'Enter' && activeIndex.current === screens.length - 1;
      if (!forward && !backward && !enter) return;
      event.preventDefault();
      moveToStep(activeIndex.current + ((forward || enter) ? 1 : -1));
    };
    const onTouchStart = (event: TouchEvent) => { touchStartY.current = event.touches[0]?.clientY ?? null; };
    const onTouchEnd = (event: TouchEvent) => {
      if (!touch || touchStartY.current === null || locked.current) return;
      const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - endY;
      touchStartY.current = null;
      if (Math.abs(delta) >= 45) moveToStep(activeIndex.current + (delta > 0 ? 1 : -1));
    };
    rail.addEventListener('wheel', onWheel, { passive: false });
    rail.addEventListener('keydown', onKeyDown);
    rail.addEventListener('touchstart', onTouchStart, { passive: true });
    rail.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      rail.removeEventListener('wheel', onWheel);
      rail.removeEventListener('keydown', onKeyDown);
      rail.removeEventListener('touchstart', onTouchStart);
      rail.removeEventListener('touchend', onTouchEnd);
    };
  }, [router, leaving]);

  return (
    <main className={`${styles.sequence} ${leaving ? styles.leaving : ''}`} ref={railRef} tabIndex={0} aria-label="Introdução do Product Hub">
      <div className={styles.depthStage}>
        {screens.map((screen, index) => {
          const relative = index - currentStep;
          if (Math.abs(relative) > 1) return null;
          const state = relative === 0 ? 'active' : relative < 0 ? 'previous' : 'next';
          const Icon = screen.icon;
          return (
            <section className={`${styles.welcomeSection} ${styles[state]}`} key={screen.eyebrow} aria-hidden={relative !== 0}>
              <div className={styles.welcomeGlow} />
              <div className={styles.welcomeCard}>
                <div className={styles.brandRow}><img src="/icon.svg" alt="Product Hub" /><span>{screen.eyebrow}</span></div>
                {Icon ? <div className={styles.featureIcon}><Icon size={26} /></div> : <div className={styles.brandMark}><img src="/icon.svg" alt="" /></div>}
                <h1>{screen.title}</h1>
                <p>{screen.text}</p>
                {index === screens.length - 1 && <button className={styles.continueButton} type="button" onClick={() => moveToStep(screens.length)}><span>Entrar no Product Hub</span><ArrowRight size={17} /></button>}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
