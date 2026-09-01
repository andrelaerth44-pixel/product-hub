import Link from 'next/link';

export default function Login() {
  return <main className="auth-page"><div className="auth-card"><div className="auth-brand"><span className="hub-logo">P</span><strong>Product Hub</strong></div><h1>Welcome back</h1><p>Sign in to manage your storefront and products.</p><form><label>Email<input type="email" placeholder="you@example.com" required/></label><label>Password<input type="password" placeholder="••••••••" required/></label><div className="auth-row"><label className="check"><input type="checkbox"/> Remember me</label><a href="#">Forgot password?</a></div><button className="primary auth-submit">Sign in</button></form><div className="auth-divider"><span>or</span></div><button className="social-login">Continue with Google</button><small>Don&apos;t have an account? <Link href="/dashboard">Create one</Link></small></div></main>;
}
