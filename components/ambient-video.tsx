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
 * Continuous Product Hub video.
 *
 * The video is deliberately not lazy-loaded, paused off-screen, or disabled
 * by prefers-reduced-motion. Native looping handles the normal cycle while
 * the recovery handlers restart playback if a browser unexpectedly reaches
 * the end, pauses, or temporarily stalls the element.
 */
export function AmbientVideo({ src, poster, className = '', ariaLabel }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const resume = () => {
      if (document.hidden || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      video.play().catch(() => undefined);
    };

    const restart = () => {
      if (document.hidden) return;
      try {
        video.currentTime = 0;
      } catch {
        // Ignore seek errors while the media is changing source.
      }
      video.play().catch(() => undefined);
    };

    const handlePause = () => resume();
    const handleEnded = () => restart();
    const handleStalled = () => resume();
    const handleCanPlay = () => resume();

    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('pageshow', resume);
    window.addEventListener('focus', resume);

    resume();

    return () => {
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('pageshow', resume);
      window.removeEventListener('focus', resume);
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
