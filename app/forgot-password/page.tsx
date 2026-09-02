'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setMessage(''); setSuccess(false);
    try {
      const origin = window.location.origin;
      const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
      setMessage('Enviámos as instruções para o teu email. Verifica também a pasta de spam.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Não foi possível enviar o email de recuperação.');
    } finally { setLoading(false); }
  }

  return <main className="auth-page-premium"><section className="auth-panel" style={{ width: '100%' }}><div className="auth-card-premium">
    <div className="auth-brand-premium"><span className="hub-logo">P</span><strong>Product Hub</strong></div>
    <div className="auth-heading"><span>Recuperação segura</span><h1>Esqueceste a palavra-passe?</h1><p>Introduz o email da tua conta e enviaremos um link para definires uma nova palavra-passe.</p></div>
    <form onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com" required autoComplete="email" disabled={loading}/></label>
      {message && <div className={`auth-error ${success ? 'auth-success' : ''}`} role="status">{message}</div>}
      <button className="primary auth-submit" disabled={loading}>{loading ? 'A enviar…' : 'Enviar link de recuperação'}</button>
    </form>
    <small><Link href="/login">Voltar para entrar</Link></small>
  </div></section></main>;
}
