'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Signup(){
 const router=useRouter(); const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false); const [message,setMessage]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setMessage('');try{const supabase=createClient();const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)throw error;setMessage('Account created. Check your email if confirmation is enabled, then sign in.');setTimeout(()=>router.replace('/login'),1000)}catch(err){setMessage(err instanceof Error?err.message:'Unable to create your account.')}finally{setLoading(false)}}
 return <main className="auth-page"><div className="auth-card"><div className="auth-brand"><span className="hub-logo">P</span><strong>Product Hub</strong></div><h1>Create your account</h1><p>Build your storefront and put every product behind one link.</p><form onSubmit={submit}><label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="João Silva" required/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required/></label>{message&&<div className="auth-error">{message}</div>}<button className="primary auth-submit" disabled={loading}>{loading?'Creating…':'Create account'}</button></form><small>Already have an account? <Link href="/login">Sign in</Link></small></div></main>;
}
