'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Signup(){
 const router=useRouter(); const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false); const [message,setMessage]=useState(''); const [success,setSuccess]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();if(loading)return;setLoading(true);setMessage('');setSuccess(false);try{if(password.length<8)throw new Error('Password must be at least 8 characters.');const supabase=createClient();const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()}}});if(error)throw error;if(data.session){setSuccess(true);setMessage('Account created. Taking you to your storefront setup…');router.replace('/onboarding');router.refresh();}else{setSuccess(true);setMessage('Account created. Check your email to confirm your account, then sign in.');}}catch(err){setMessage(err instanceof Error?err.message:'Unable to create your account. Please try again.');}finally{setLoading(false)}}
 return <main className="auth-page"><div className="auth-card"><div className="auth-brand"><span className="hub-logo">P</span><strong>Product Hub</strong></div><h1>Create your account</h1><p>Build your storefront and put every product behind one link.</p><form onSubmit={submit}><label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="João Silva" required/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required autoComplete="new-password"/></label>{message&&<div className={`auth-error ${success?'auth-success':''}`}>{message}</div>}<button className="primary auth-submit" disabled={loading}>{loading?'Creating account…':'Create account'}</button></form><small>Already have an account? <Link href="/login">Sign in</Link></small></div></main>;
}
