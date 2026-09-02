'use client';

import { useEffect, useRef } from 'react';

type Props = {
  src: string;
  poster?: string;
  className?: string;
  ariaLabel?: string;
};

export function AmbientVideo({ src, poster, className = '', ariaLabel }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (reduce.matches) video.pause();
      else video.play().catch(() => undefined);
    };
    sync();
    reduce.addEventListener?.('change', sync);
    return () => reduce.removeEventListener?.('change', sync);
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={ariaLabel}
    />
  );
}
