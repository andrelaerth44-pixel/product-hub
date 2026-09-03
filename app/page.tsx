'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { ScrollVideo } from '@/components/scroll-video';
import styles from './home.module.css';

const videos = [
  { src: 'https://cdn.creativeclaw.co/u/51a597e8/videos/dba67c43-dd48-4edf-b5f9-aa489c0e41e1.mp4', index: '01 / ABERTURA', title: 'O teu negócio começa aqui.' },
  { src: 'https://cdn.creativeclaw.co/u/51a597e8/videos/3effe537-1f62-440a-a12d-5c4d3cb12197.mp4', index: '02 / ACESSO', title: 'Entra. Continua. Está tudo no lugar.' },
  { src: 'https://cdn.creativeclaw.co/u/51a597e8/videos/79ba29f5-88cd-4a18-8b58-8a9e2abd9d95.mp4', index: '03 / WORKSPACE', title: 'O teu workspace ganha vida.' },
  { src: 'https://cdn.creativeclaw.co/u/51a597e8/videos/6a27daea-d3a9-4f1f-b979-837d7be27f51.mp4', index: '04 / VITRINE', title: 'Uma vitrine que parece tua.' },
];

export default function Home() {
  const router = useRouter();
  const railRef = useRef<HTMLElement>(null);
  const activeIndex = useRef(0);
  const locked = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const pointerFrame = useRef<number | null>(null);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerCurrent = useRef({ x: 0, y: 0 });
  const [currentStep, setCurrentStep] = useState(0);
  const [touchDevice, setTouchDevice] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const moveToStep = (next: number) => {
    if (locked.current || leaving) return;
    if (next < 0) return;
    if (next >= videos.length) {
      locked.current = true;
      setLeaving(true);
      window.setTimeout(() => router.replace('/login'), 760);
      return;
    }

    locked.current = true;
    activeIndex.current = next;
    setCurrentStep(next);
    window.setTimeout(() => {
      locked.current = false;
    }, 900);
  };

  const goToLogin = () => moveToStep(videos.length);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isTouchDevice = hasTouch && !hasFinePointer;
    setTouchDevice(isTouchDevice);

    const renderPointer = () => {
      pointerCurrent.current.x += (pointerTarget.current.x - pointerCurrent.current.x) * 0.075;
      pointerCurrent.current.y += (pointerTarget.current.y - pointerCurrent.current.y) * 0.075;
      rail.style.setProperty('--mouse-x', pointerCurrent.current.x.toFixed(3));
      rail.style.setProperty('--mouse-y', pointerCurrent.current.y.toFixed(3));
      pointerFrame.current = window.requestAnimationFrame(renderPointer);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches || event.pointerType === 'touch' || isTouchDevice) return;
      const rect = rail.getBoundingClientRect();
      pointerTarget.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerTarget.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const resetPointer = () => {
      pointerTarget.current.x = 0;
      pointerTarget.current.y = 0;
    };

    const onWheel = (event: WheelEvent) => {
      if (isTouchDevice) return;
      event.preventDefault();
      if (Math.abs(event.deltaY) < 8 || locked.current) return;

      // Roda do mouse para a frente (para longe do utilizador) = deltaY negativo.
      const forward = event.deltaY < 0;
      moveToStep(activeIndex.current + (forward ? 1 : -1));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (locked.current || leaving) return;
      const forward = ['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key);
      const backward = ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key);
      const enterFinal = event.key === 'Enter' && activeIndex.current === videos.length - 1;
      if (!forward && !backward && !enterFinal) return;
      event.preventDefault();
      moveToStep(activeIndex.current + ((forward || enterFinal) ? 1 : -1));
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!isTouchDevice || touchStartY.current === null || locked.current) return;
      const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - endY;
      touchStartY.current = null;
      if (Math.abs(delta) < 45) return;
      moveToStep(activeIndex.current + (delta > 0 ? 1 : -1));
    };

    rail.addEventListener('pointermove', onPointerMove, { passive: true });
    rail.addEventListener('pointerleave', resetPointer, { passive: true });
    rail.addEventListener('wheel', onWheel, { passive: false });
    rail.addEventListener('keydown', onKeyDown);
    rail.addEventListener('touchstart', onTouchStart, { passive: true });
    rail.addEventListener('touchend', onTouchEnd, { passive: true });

    if (!reducedMotion.matches && hasFinePointer) pointerFrame.current = window.requestAnimationFrame(renderPointer);

    return () => {
      rail.removeEventListener('pointermove', onPointerMove);
      rail.removeEventListener('pointerleave', resetPointer);
      rail.removeEventListener('wheel', onWheel);
      rail.removeEventListener('keydown', onKeyDown);
      rail.removeEventListener('touchstart', onTouchStart);
      rail.removeEventListener('touchend', onTouchEnd);
      if (pointerFrame.current !== null) window.cancelAnimationFrame(pointerFrame.current);
    };
  }, [router, leaving]);

  return (
    <main
      className={`${styles.sequence} ${leaving ? styles.leaving : ''}`}
      ref={railRef}
      tabIndex={0}
      aria-label="Introdução do Product Hub"
      data-step={currentStep}
    >
      <div className={styles.depthStage}>
        {videos.map((video, index) => {
          const relative = index - currentStep;
          if (Math.abs(relative) > 1) return null;

          const state = relative === 0 ? 'active' : relative < 0 ? 'previous' : 'next';

          return (
            <section
              className={`${styles.videoSection} ${styles[state]}`}
              data-intro-index={index}
              aria-hidden={relative !== 0}
              key={video.src}
            >
              <ScrollVideo src={video.src} active={relative === 0} className={styles.videoBackground} ariaLabel={`${video.index}: ${video.title}`} />
              <div className={styles.videoCopy}>
                <span className={styles.videoIndex}>{video.index}</span>
                <h1>{video.title}</h1>
                {touchDevice && index === videos.length - 1 && (
                  <button className={styles.continueButton} type="button" onClick={goToLogin} disabled={leaving}>
                    Continuar para entrar <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
