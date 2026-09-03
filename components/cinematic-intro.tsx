'use client';

import { useEffect, useRef } from 'react';

export function CinematicIntro() {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-intro-index]'));

    const render = () => {
      current.current.x += (target.current.x - current.current.x) * 0.075;
      current.current.y += (target.current.y - current.current.y) * 0.075;
      root.style.setProperty('--mouse-x', `${current.current.x.toFixed(3)}`);
      root.style.setProperty('--mouse-y', `${current.current.y.toFixed(3)}`);
      frameRef.current = window.requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reduceMotion.matches || event.pointerType === 'touch') return;
      const rect = root.getBoundingClientRect();
      target.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const resetPointer = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    const onScroll = () => {
      if (reduceMotion.matches) return;
      const viewport = window.innerHeight || 1;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, -rect.top / viewport));
        section.style.setProperty('--scroll-progress', progress.toFixed(3));
      });
    };

    root.addEventListener('pointermove', onPointerMove, { passive: true });
    root.addEventListener('pointerleave', resetPointer, { passive: true });
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', resetPointer);
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return null;
}
