'use client';

import { useEffect, useRef } from 'react';

type Props = {
  src: string;
  poster?: string;
  className?: string;
  ariaLabel?: string;
  priority?: boolean;
};

/**
 * AmbientVideo is intentionally continuous: every Product Hub video uses
 * native looping and is kept playing whenever the browser allows autoplay.
 * The browser may still pause media for its own policies or resource-saving,
 * so visibility changes are used to resume playback when the element returns.
 */
export function AmbientVideo({ src, poster, className = '', ariaLabel }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const play = () => {
      if (document.hidden) return;
      video.play().catch(() => undefined);
    };

    video.addEventListener('loadeddata', play);
    video.addEventListener('canplay', play);
    document.addEventListener('visibilitychange', play);
    window.addEventListener('pageshow', play);

    play();

    return () => {
      video.removeEventListener('loadeddata', play);
      video.removeEventListener('canplay', play);
      document.removeEventListener('visibilitychange', play);
      window.removeEventListener('pageshow', play);
    };
  }, [src]);

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
      preload="auto"
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      disablePictureInPicture
    />
  );
}
