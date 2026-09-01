'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw signInError;
      if (!data.user) throw new Error('Your account could not be loaded. Please sign in again.');
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', data.user.id)
        .limit(1)
        .maybeSingle();
      if (membershipError) throw membershipError;
      router.replace(searchParams.get('next') || (membership?.organization_id ? '/dashboard' : '/onboarding'));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-brand"><span className="hub-logo">P</span><strong>Product Hub</strong></div>
      <h1>Welcome back</h1>
      <p>Sign in to manage your storefront and products.</p>
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" /></label>
        <div className="auth-row"><label className="check"><input type="checkbox" /> Remember me</label><a href="#">Forgot password?</a></div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="primary auth-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div className="auth-divider"><span>or</span></div>
      <button className="social-login" type="button">Continue with Google</button>
      <small>Don&apos;t have an account? <Link href="/signup">Create one</Link></small>
    </div>
  );
}

export default function Login() {
  return <main className="auth-page"><Suspense fallback={<div className="auth-card"><p>Loading…</p></div>}><LoginForm /></Suspense></main>;
}
