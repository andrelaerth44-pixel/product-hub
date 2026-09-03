'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const sections = Array.from(rail.querySelectorAll<HTMLElement>('[data-intro-index]'));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          activeIndex.current = Number((entry.target as HTMLElement).dataset.introIndex || 0);
        }
      }
    }, { threshold: [0.7] });
    sections.forEach((section) => observer.observe(section));

    const onWheel = (event: WheelEvent) => {
      if (locked.current || Math.abs(event.deltaY) < 8) return;
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      const next = activeIndex.current + direction;
      if (next >= sections.length) {
        locked.current = true;
        router.replace('/login');
        return;
      }
      if (next < 0) return;
      locked.current = true;
      activeIndex.current = next;
      sections[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => { locked.current = false; }, 850);
    };
    rail.addEventListener('wheel', onWheel, { passive: false });
    return () => { observer.disconnect(); rail.removeEventListener('wheel', onWheel); };
  }, [router]);

  return (
    <main className={styles.sequence} ref={railRef} aria-label="Introdução do Product Hub">
      {videos.map((video, index) => (
        <section className={styles.videoSection} data-intro-index={index} key={video.src}>
          <ScrollVideo src={video.src} className={styles.videoBackground} ariaLabel={`${video.index}: ${video.title}`} />
          <div className={styles.videoCopy}>
            <span className={styles.videoIndex}>{video.index}</span>
            <h1>{video.title}</h1>
          </div>
        </section>
      ))}
    </main>
  );
}
