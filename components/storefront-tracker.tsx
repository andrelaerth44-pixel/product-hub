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

export function trackStorefrontEvent(
  organizationId: string,
  eventType: EventType,
  productId?: string,
) {
  if (typeof window === 'undefined') return;
  const supabase = createClient();
  void supabase.from('analytics_events').insert({
    organization_id: organizationId,
    product_id: productId ?? null,
    event_type: eventType,
    session_id: getSessionId(),
    referrer: document.referrer || null,
    device_type: getDeviceType(),
  });
}

export function StorefrontTracker({
  organizationId,
  eventType = 'store_view',
  productId,
}: {
  organizationId: string;
  eventType?: EventType;
  productId?: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackStorefrontEvent(organizationId, eventType, productId);
  }, [eventType, organizationId, productId]);

  return null;
}

export function TrackedPurchaseLink({
  organizationId,
  productId,
  href,
  children,
  className,
}: {
  organizationId: string;
  productId: string;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackStorefrontEvent(organizationId, 'product_click', productId)}
    >
      {children}
    </a>
  );
}
