'use client';

import { useEffect, useRef } from 'react';

type ScrollVideoProps = {
  src: string;
  className?: string;
  ariaLabel?: string;
  active?: boolean;
};

export function ScrollVideo({ src, className, ariaLabel, active = true }: ScrollVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    if (active) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }

    return () => video.pause();
  }, [active]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      autoPlay={active}
      muted
      loop
      playsInline
      preload={active ? 'auto' : 'metadata'}
      aria-label={ariaLabel}
      disablePictureInPicture
    />
  );
}
