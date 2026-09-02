'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AmbientVideo } from '@/components/ambient-video';

function withTimeout<T>(promise: PromiseLike<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    const supabase = createClient();

    try {
      const { data, error: signInError } = await withTimeout(
        supabase.auth.signInWithPassword({ email: email.trim(), password }),
        10000,
        'O servidor demorou demasiado a responder. Verifique a ligação e tente novamente.'
      );
      if (signInError) throw signInError;
      if (!data.user) throw new Error('A sua conta não pôde ser carregada. Tente entrar novamente.');

      let destination = searchParams.get('next') || '/dashboard';
      if (!searchParams.get('next')) {
        try {
          const { data: membership, error: membershipError } = await withTimeout(
            supabase.from('organization_members').select('organization_id').eq('user_id', data.user.id).limit(1).maybeSingle(),
            5000,
            'A sessão entrou, mas a configuração do workspace demorou demasiado.'
          );
          if (!membershipError && !membership?.organization_id) destination = '/onboarding';
        } catch {
          // Do not trap the user on “A verificar”. A valid Supabase session is enough to continue.
          destination = '/dashboard';
        }
      }

      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Verifique os seus dados e tente novamente.');
      setLoading(false);
    }
  }

  return (
    <main className="auth-page-premium">
      <section className="auth-visual" aria-hidden="true">
        {loading ? (
          <AmbientVideo src="/videos/login-de-processamento.mp4" poster="/videos/login-de-processamento.jpg" className="auth-video" priority ariaLabel="Processamento seguro do login" />
        ) : (
          <div className="auth-static-visual"><div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" /><div className="auth-grid" /><div className="auth-product-mark"><span className="hub-logo">P</span></div></div>
        )}
        <div className="auth-visual-copy"><span className="auth-kicker">PRODUCT HUB / WORKSPACE</span><strong>O teu catálogo.<br />Num só lugar.</strong><p>Cria, organiza e apresenta os teus produtos numa experiência pensada para vender melhor.</p><div className="auth-trust"><ShieldCheck size={15} /> Ambiente protegido para o teu negócio</div></div>
      </section>

      <section className="auth-panel">
        <div className="auth-card-premium">
          <div className="auth-brand-premium"><span className="hub-logo">P</span><strong>Product Hub</strong></div>
          <div className="auth-heading"><span>Bem-vindo de volta</span><h1>{loading ? 'A preparar o teu espaço…' : 'Entra no teu workspace.'}</h1><p>{loading ? 'Estamos a validar a tua sessão com segurança.' : 'Continua exatamente de onde paraste.'}</p></div>
          <form onSubmit={submit}>
            <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@empresa.com" required autoComplete="email" disabled={loading} /></label>
            <label>Palavra-passe<div className="auth-password"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" disabled={loading} /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'} disabled={loading}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            <div className="auth-row"><label className="check"><input type="checkbox" disabled={loading} /> Lembrar-me</label><Link href="/forgot-password">Esqueci-me da palavra-passe</Link></div>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="primary auth-submit" disabled={loading}>{loading ? <><LockKeyhole size={16} /> A verificar…</> : <>Entrar no Product Hub <ArrowRight size={16} /></>}</button>
          </form>
          <div className="auth-divider"><span>ou</span></div><button className="social-login" type="button" disabled={loading}>Continuar com Google</button><small>Ainda não tens conta? <Link href="/signup">Criar conta</Link></small>
        </div>
      </section>
    </main>
  );
}

export default function Login() {
  return <Suspense fallback={<main className="auth-page-premium"><section className="auth-panel"><div className="auth-card-premium"><p>A carregar o Product Hub…</p></div></section></main>}><LoginForm /></Suspense>;
}
