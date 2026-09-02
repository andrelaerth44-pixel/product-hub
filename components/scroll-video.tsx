'use client';

import { useEffect, useRef } from 'react';

type ScrollVideoProps = {
  src: string;
  className?: string;
  ariaLabel?: string;
};

export function ScrollVideo({ src, className, ariaLabel }: ScrollVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.55, 0.8] }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={ariaLabel}
    />
  );
}
