import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/dashboard';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  if (!code) return NextResponse.redirect(new URL('/login?error=missing_auth_code', url.origin));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/login?error=auth_callback', url.origin));

  const response = NextResponse.redirect(new URL(safeNext, url.origin));
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
