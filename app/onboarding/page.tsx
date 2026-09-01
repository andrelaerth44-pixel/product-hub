'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Check, Globe2, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './onboarding.module.css';

const slugify = (value: string) => value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);

export default function OnboardingPage() {
  const router = useRouter(); const [name, setName] = useState(''); const [username, setUsername] = useState(''); const [description, setDescription] = useState('');
  const [checking, setChecking] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => { (async () => { const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) router.replace('/login'); })(); }, [router]);
  const setBrandName=(value:string)=>{setName(value);if(!username||username===slugify(name))setUsername(slugify(value));};
  async function submit(e:FormEvent){e.preventDefault();setError('');setSaving(true);const supabase=createClient();const {error:rpcError}=await supabase.rpc('create_workspace',{workspace_name:name,workspace_slug:slugify(username),workspace_description:description||null});if(rpcError){setError(rpcError.message);setSaving(false);return;}router.replace('/dashboard');}
  async function checkUsername(){const slug=slugify(username);if(!slug)return;setChecking(true);setError('');const supabase=createClient();const {data}=await supabase.from('organizations').select('id').eq('slug',slug).maybeSingle();setChecking(false);if(data)setError('That username is already taken.');else setError('✓ Username available');}
  return <main className={styles['onboarding-page']}><div className={styles['onboarding-card']}>
    <div className={styles['onboarding-brand']}><span className="hub-logo"><Store size={18}/></span><strong>Product Hub</strong></div>
    <div className={styles['onboarding-progress']}><span className={styles.done}><Check size={13}/></span><i/><span className={styles.current}>2</span><i/><span>3</span></div>
    <div className={styles['onboarding-heading']}><span className={styles.eyebrow}>YOUR STOREFRONT</span><h1>Tell us about your brand.</h1><p>This becomes the identity people see when they discover your products.</p></div>
    <form><label>Brand or creator name<span>*</span><input value={name} onChange={e=>setBrandName(e.target.value)} placeholder="João Silva" required minLength={2}/></label>
      <label>Storefront username<span>*</span><div className={styles['username-input']}><span>producthub.store/@</span><input value={username} onChange={e=>setUsername(slugify(e.target.value))} placeholder="joao-silva" required minLength={3} maxLength={40}/><button type="button" onClick={checkUsername}>{checking?'…':'Check'}</button></div></label>
      <label>Description <em>Optional</em><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Especialista em Marketing Digital" rows={3}/></label>
      <div className={styles['onboarding-preview']}><div className={styles['preview-icon']}><Globe2 size={18}/></div><div><strong>Your storefront</strong><span>producthub.store/@{slugify(username)||'your-name'}</span></div></div>
      {error&&<div className={`${styles['onboarding-message']} ${error.startsWith('✓')?styles.success:''}`}>{error}</div>}
      <button type="submit" className={`primary ${styles['onboarding-submit']}`} disabled={saving} onClick={submit}>{saving?'Creating your storefront…':'Continue'} <ArrowRight size={17}/></button>
    </form><small>You can change these details later in Settings.</small>
  </div></main>;
}
