'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

type EventType = 'store_view' | 'product_click';

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

export function StorefrontTracker({
  organizationId,
  eventType,
  productId,
}: {
  organizationId: string;
  eventType: EventType;
  productId?: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const supabase = createClient();
    const payload = {
      organization_id: organizationId,
      product_id: productId ?? null,
      event_type: eventType,
      session_id: getSessionId(),
      referrer: document.referrer || null,
      device_type: getDeviceType(),
    };

    void supabase.from('analytics_events').insert(payload);
  }, [eventType, organizationId, productId]);

  return null;
}

export function ProductClickTracker({
  organizationId,
  productId,
}: {
  organizationId: string;
  productId: string;
}) {
  const supabase = createClient();

  return async function trackProductClick() {
    await supabase.from('analytics_events').insert({
      organization_id: organizationId,
      product_id: productId,
      event_type: 'product_click',
      session_id: getSessionId(),
      referrer: document.referrer || null,
      device_type: getDeviceType(),
    });
  };
}
