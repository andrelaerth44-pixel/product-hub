'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, UserPlus, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function getPublicSiteUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (configured) return configured.startsWith('http') ? configured : `https://${configured}`;
  return 'http://localhost:3000';
}

const slugify = (value: string) => value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,40);

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
 return <main className="auth-page-premium auth-single"><video className="auth-video-full" autoPlay muted loop playsInline preload="auto" src="https://cdn.creativeclaw.co/u/51a597e8/videos/3effe537-1f62-440a-a12d-5c4d3cb12197.mp4" aria-hidden="true"/><section className="auth-panel-single"><div className="auth-card-premium"><div className="auth-brand-premium"><span className="hub-logo">P</span><strong>Product Hub</strong></div><div className="auth-heading"><span>PRODUCT HUB / NOVA CONTA</span><h1>Criar conta</h1><p>Cria a tua conta e configura a organização que vai dar vida à tua vitrine.</p></div><form onSubmit={submit}><label>Nome completo<input value={name} onChange={e=>setName(e.target.value)} placeholder="João Silva" required autoComplete="name" disabled={loading}/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com" required autoComplete="email" disabled={loading}/></label><label>Palavra-passe<div className="auth-password"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Pelo menos 8 caracteres" minLength={8} required autoComplete="new-password" disabled={loading}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Esconder palavra-passe':'Mostrar palavra-passe'} disabled={loading}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label><label><span>Nome da organização</span><input value={orgName} onChange={e=>setBrandName(e.target.value)} placeholder="Minha organização" required minLength={2} disabled={loading}/></label><label><span>Nome de utilizador da vitrine</span><input value={username} onChange={e=>setUsername(slugify(e.target.value))} placeholder="minha-organizacao" required minLength={3} maxLength={40} disabled={loading}/></label><label><span>Descrição <em>Opcional</em></span><textarea value={orgDescription} onChange={e=>setOrgDescription(e.target.value)} placeholder="Conta-nos brevemente o que fazes…" rows={3} disabled={loading}/></label>{message&&<div className={`auth-error ${success?'auth-success':''}`} role="status">{message}</div>}<button className="primary auth-submit" disabled={loading}>{loading?<><UserPlus size={16}/> A criar…</>:<>Criar conta <ArrowRight size={16}/></>}</button></form><div className="auth-or"><span>ou</span></div><button className="social-login" type="button" onClick={signUpWithGoogle} disabled={loading}><Building2 size={16}/> Criar conta com Google</button><p className="auth-signup-prompt">Já tens uma conta? <Link href="/login">Iniciar sessão</Link></p></div></section></main>;
}
