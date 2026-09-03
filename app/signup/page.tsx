'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function getPublicSiteUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (configured) return configured.startsWith('http') ? configured : `https://${configured}`;
  return 'http://localhost:3000';
}

const slugify = (value: string) => value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,40);

function GoogleIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" role="img"><path fill="#4285F4" d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"/><path fill="#34A853" d="M12 21.8c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.8Z"/><path fill="#FBBC05" d="M6.54 13.9A5.85 5.85 0 0 1 6.24 12c0-.66.11-1.3.3-1.9V7.57H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.43l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.07c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.08 14.63 2.2 12 2.2a9.74 9.74 0 0 0-8.7 5.37l3.24 2.53C7.31 7.79 9.46 6.07 12 6.07Z"/></svg>;
}

export default function Signup(){
 const router=useRouter();
 const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
 const [orgName,setOrgName]=useState(''); const [orgDescription,setOrgDescription]=useState(''); const [username,setUsername]=useState('');
 const [loading,setLoading]=useState(false); const [message,setMessage]=useState(''); const [success,setSuccess]=useState(false); const [showPassword,setShowPassword]=useState(false);
 const setBrandName=(value:string)=>{setOrgName(value);if(!username||username===slugify(orgName))setUsername(slugify(value));};
 async function submit(e:React.FormEvent){e.preventDefault();if(loading)return;setLoading(true);setMessage('');setSuccess(false);try{
   if(password.length<8)throw new Error('A palavra-passe deve ter pelo menos 8 caracteres.');
   if(orgName.trim().length<2)throw new Error('Indica o nome da tua organização.');
   if(slugify(username).length<3)throw new Error('Escolhe um nome de utilizador com pelo menos 3 caracteres.');
   const supabase=createClient(); const siteUrl=getPublicSiteUrl();
   const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim(),organization_name:orgName.trim(),organization_description:orgDescription.trim(),organization_slug:slugify(username)},emailRedirectTo:`${siteUrl}/auth/callback?next=/onboarding`}});
   if(error)throw error;
   if(data.session){
     const {error:workspaceError}=await supabase.rpc('create_workspace',{workspace_name:orgName.trim(),workspace_slug:slugify(username),workspace_description:orgDescription.trim()||null});
     if(workspaceError)throw workspaceError;
     setSuccess(true);setMessage('Conta criada. A preparar a tua organização…');router.replace('/dashboard');router.refresh();
   }else{setSuccess(true);setMessage('Conta criada. Enviámos o link de verificação. Depois de confirmares o email, poderás concluir a criação da organização.');}
 }catch(err){setMessage(err instanceof Error?err.message:'Não foi possível criar a conta. Tenta novamente.');}finally{setLoading(false)}}
 async function signUpWithGoogle(){if(loading)return;setLoading(true);setMessage('');try{const {error}=await createClient().auth.signInWithOAuth({provider:'google',options:{redirectTo:`${getPublicSiteUrl()}/auth/callback?next=/onboarding`}});if(error)throw error;}catch(err){setMessage(err instanceof Error?err.message:'O registo com Google não está disponível neste momento.');setLoading(false)}}
 return <main className="auth-page-premium auth-single"><video className="auth-video-full" autoPlay muted loop playsInline preload="auto" src="https://cdn.creativeclaw.co/u/51a597e8/videos/3effe537-1f62-440a-a12d-5c4d3cb12197.mp4" aria-hidden="true"/><section className="auth-panel-single"><div className="auth-card-premium"><div className="auth-brand-premium"><span className="hub-logo">P</span><strong>Product Hub</strong></div><div className="auth-heading"><span>PRODUCT HUB / NOVA CONTA</span><h1>Criar conta</h1><p>Cria a tua conta e configura a organização que vai dar vida à tua vitrine.</p></div><form onSubmit={submit}><label>Nome completo<input value={name} onChange={e=>setName(e.target.value)} placeholder="João Silva" required autoComplete="name" disabled={loading}/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com" required autoComplete="email" disabled={loading}/></label><label>Palavra-passe<div className="auth-password"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Pelo menos 8 caracteres" minLength={8} required autoComplete="new-password" disabled={loading}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Esconder palavra-passe':'Mostrar palavra-passe'} disabled={loading}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label><label><span>Nome da organização</span><input value={orgName} onChange={e=>setBrandName(e.target.value)} placeholder="Minha organização" required minLength={2} disabled={loading}/></label><label><span>Nome de utilizador da vitrine</span><input value={username} onChange={e=>setUsername(slugify(e.target.value))} placeholder="minha-organizacao" required minLength={3} maxLength={40} disabled={loading}/></label><label className="signup-description-field"><span>Descrição <em>Opcional</em></span><textarea value={orgDescription} onChange={e=>setOrgDescription(e.target.value)} placeholder="Conta-nos brevemente o que fazes…" rows={4} disabled={loading} style={{display:'block',width:'100%',minHeight:96,resize:'vertical',padding:'12px 13px',marginTop:7,border:'1px solid var(--line)',borderRadius:10,background:'#fff',color:'var(--ink)',outline:'none',lineHeight:1.45}} /></label>{message&&<div className={`auth-error ${success?'auth-success':''}`} role="status">{message}</div>}<button className="primary auth-submit" disabled={loading}>{loading?<><UserPlus size={16}/> A criar…</>:<>Criar conta <ArrowRight size={16}/></>}</button></form><div className="auth-or"><span>ou</span></div><button className="social-login" type="button" onClick={signUpWithGoogle} disabled={loading}><GoogleIcon/> Criar conta com Google</button><p className="auth-signup-prompt">Já tens uma conta? <Link href="/login">Iniciar sessão</Link></p></div></section></main>;
}
