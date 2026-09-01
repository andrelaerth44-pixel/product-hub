'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

type EventType = 'store_view' | 'product_view' | 'product_click';

function getSessionId() {
  const key = 'product-hub-analytics-session';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(key, id);
  return id;
}

function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function trackStorefrontEvent(organizationId: string, eventType: EventType, productId?: string) {
  if (typeof window === 'undefined') return;
  const supabase = createClient();
  void supabase.rpc('record_analytics_event', {
    event_organization_id: organizationId,
    event_product_id: productId ?? null,
    event_type: eventType,
    event_session_id: getSessionId(),
    event_referrer: document.referrer || null,
    event_device_type: getDeviceType(),
  });
}

export function StorefrontTracker({ organizationId, eventType = 'store_view', productId }: { organizationId: string; eventType?: EventType; productId?: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackStorefrontEvent(organizationId, eventType, productId);
  }, [eventType, organizationId, productId]);
  return null;
}

export function ProductViewTracker({ organizationId, productId }: { organizationId: string; productId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const sent = useRef(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || sent.current) return;
    const send = () => {
      if (sent.current) return;
      sent.current = true;
      trackStorefrontEvent(organizationId, 'product_view', productId);
    };
    if (!('IntersectionObserver' in window)) { send(); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        send();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [organizationId, productId]);
  return <div ref={ref} aria-hidden="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', pointerEvents: 'none' }} />;
}

export function TrackedPurchaseLink({ organizationId, productId, href, children, className }: { organizationId: string; productId: string; href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={() => trackStorefrontEvent(organizationId, 'product_click', productId)}>{children}</a>;
}
