'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  poster?: string;
  className?: string;
  ariaLabel?: string;
  priority?: boolean;
};

export function AmbientVideo({ src, poster, className = '', ariaLabel, priority = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(priority);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) { setEnabled(false); return; }
    if (priority) { setEnabled(true); return; }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEnabled(true);
        observer.disconnect();
      }
    }, { rootMargin: '160px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !enabled) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (reduce.matches) video.pause();
      else video.play().catch(() => undefined);
    };
    sync();
    reduce.addEventListener?.('change', sync);
    return () => reduce.removeEventListener?.('change', sync);
  }, [enabled]);

  return (
    <video
      ref={ref}
      className={className}
      src={enabled ? src : undefined}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload={priority ? 'metadata' : 'none'}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      disablePictureInPicture
    />
  );
}
