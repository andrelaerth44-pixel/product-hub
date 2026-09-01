'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="app-loading"><div className="app-loading-card"><div className="hub-logo"><AlertTriangle size={18}/></div><strong>Something went wrong</strong><p>{error.message || 'The dashboard could not be loaded.'}</p><button className="primary" type="button" onClick={() => reset()}><RefreshCw size={15}/> Try again</button></div></main>;
}
