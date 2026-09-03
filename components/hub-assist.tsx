'use client';

import { FormEvent, useMemo, useState } from 'react';
import { BarChart3, Bot, ChevronRight, Lightbulb, MessageCircle, Package, Send, Store, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function HubAssist({ organizationId: _organizationId }: { organizationId?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Olá. Sou o Hub Assist. Posso ajudar-te a melhorar produtos, promoções, vitrine e decisões com base nos dados reais do teu workspace.' },
  ]);
  const suggestions = useMemo(() => [
    { icon: Package, label: 'Melhorar um produto', prompt: 'Ajuda-me a melhorar a descrição do meu produto mais recente.' },
    { icon: BarChart3, label: 'Analisar dados', prompt: 'Analisa os meus dados atuais e diz-me o que devo melhorar primeiro.' },
    { icon: Store, label: 'Melhorar a vitrine', prompt: 'Sugere uma melhoria profissional para a minha vitrine com base na configuração atual.' },
    { icon: Lightbulb, label: 'Criar promoção', prompt: 'Cria uma ideia de promoção simples e profissional para este fim de semana.' },
  ], []);

  const hidden = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth');
  if (hidden) return null;

  async function send(text = input) {
    const message = text.trim();
    if (!message || loading) return;
    const next = [...messages, { role: 'user' as const, content: message }];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history: messages.slice(-8) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Não foi possível responder.');
      setMessages([...next, { role: 'assistant', content: data.answer }]);
    } catch (error: any) {
      setMessages([...next, { role: 'assistant', content: error?.message || 'Não consegui responder agora. Tenta novamente.' }]);
    } finally { setLoading(false); }
  }

  function submit(e: FormEvent) { e.preventDefault(); void send(); }

  return <>
    <button type="button" className="hub-assist-launcher" onPointerDown={(e) => e.stopPropagation()} onClick={() => setOpen(true)} aria-label="Abrir Hub Assist" aria-expanded={open}>
      <Bot size={22} strokeWidth={1.9}/>
    </button>
    {open && <div className="hub-assist-backdrop" onMouseDown={() => setOpen(false)}>
      <aside className="hub-assist-panel" onMouseDown={e => e.stopPropagation()}>
        <header className="hub-assist-header"><div className="hub-assist-title"><div className="hub-assist-mark"><Bot size={18}/></div><div><strong>Hub Assist</strong><span>O teu assistente de negócio</span></div></div><button type="button" className="hub-assist-close" onClick={() => setOpen(false)} aria-label="Fechar"><X size={18}/></button></header>
        <div className="hub-assist-capabilities"><span>Produtos</span><span>Analytics</span><span>Vitrine</span><span>Promoções</span></div>
        <div className="hub-assist-body">
          {messages.length === 1 && <div className="hub-assist-welcome"><div className="hub-assist-welcome-icon"><MessageCircle size={21}/></div><h2>Em que trabalhamos?</h2><p>Fala comigo como falarias com alguém da tua equipa. Eu uso os dados do teu workspace para dar respostas úteis.</p><div className="hub-assist-suggestions">{suggestions.map(({icon: Icon,label,prompt})=><button type="button" key={label} onClick={() => void send(prompt)}><Icon size={16}/><span>{label}</span><ChevronRight size={14}/></button>)}</div></div>}
          <div className="hub-assist-messages">{messages.map((m,i)=><div key={i} className={`hub-assist-message ${m.role}`}><div className="hub-assist-bubble">{m.content}</div></div>)}{loading&&<div className="hub-assist-message assistant"><div className="hub-assist-bubble hub-assist-thinking"><i/><i/><i/></div></div>}</div>
        </div>
        <form className="hub-assist-composer" onSubmit={submit}><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Escreve o que precisas…" rows={1} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send()}}}/><button type="submit" disabled={!input.trim()||loading} aria-label="Enviar"><Send size={17}/></button></form>
        <div className="hub-assist-foot">Dados reais do workspace · sem métricas inventadas</div>
      </aside>
    </div>}
    <style jsx global>{`\n.hub-assist-launcher{position:fixed;right:22px;bottom:22px;z-index:9999;width:52px;height:52px;display:grid;place-items:center;border:1px solid rgba(23,105,255,.28);border-radius:50%;padding:0;background:#1769ff;color:#fff;box-shadow:0 8px 24px rgba(23,105,255,.24);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}.hub-assist-launcher:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 12px 30px rgba(23,105,255,.30)}.hub-assist-launcher:focus-visible{outline:3px solid rgba(23,105,255,.24);outline-offset:3px}.hub-assist-launcher:after{content:"";position:absolute;inset:-4px;border:1px solid rgba(23,105,255,.16);border-radius:50%;animation:hubAssistFloat 2.8s ease-in-out infinite;pointer-events:none}@keyframes hubAssistFloat{0%,100%{transform:scale(.98);opacity:.5}50%{transform:scale(1.06);opacity:1}}\n.hub-assist-backdrop{position:fixed;inset:0;z-index:10000;background:rgba(23,32,51,.16);display:flex;justify-content:flex-end;align-items:stretch}.hub-assist-panel{width:min(480px,100vw);height:100%;background:#f8fafc;border-left:1px solid #d7dee8;box-shadow:-20px 0 55px rgba(23,32,51,.14);display:flex;flex-direction:column;font-family:system-ui,sans-serif}.hub-assist-header{height:72px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #d7dee8;background:#fff}.hub-assist-title{display:flex;align-items:center;gap:11px}.hub-assist-title>div:last-child{display:grid;gap:3px}.hub-assist-title strong{font-size:16px}.hub-assist-title span{font-size:11px;color:#657085}.hub-assist-mark{width:38px;height:38px;border-radius:11px;background:#eaf1ff;color:#1769ff;display:grid;place-items:center}.hub-assist-close{border:0;background:#eef1f5;color:#5d6b80;border-radius:9px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer}.hub-assist-capabilities{display:flex;gap:7px;padding:12px 20px;border-bottom:1px solid #e0e5ed;overflow:auto}.hub-assist-capabilities span{white-space:nowrap;font-size:10px;font-weight:750;color:#1769ff;background:#eef4ff;border:1px solid #d3e0fb;border-radius:999px;padding:6px 9px}.hub-assist-body{flex:1;overflow:auto;padding:20px}.hub-assist-welcome{padding:6px 0 18px}.hub-assist-welcome-icon{width:42px;height:42px;border-radius:12px;background:#eaf8f2;color:#16a56a;display:grid;place-items:center;margin-bottom:12px}.hub-assist-welcome h2{font-size:22px;letter-spacing:-.6px;margin:0 0 7px}.hub-assist-welcome p{font-size:13px;line-height:1.55;color:#657085;margin:0 0 16px}.hub-assist-suggestions{display:grid;gap:8px}.hub-assist-suggestions button{display:grid;grid-template-columns:24px 1fr auto;align-items:center;gap:9px;text-align:left;border:1px solid #d7dee8;background:#fff;border-radius:11px;padding:11px 12px;color:#344159;cursor:pointer}.hub-assist-suggestions button:hover{border-color:#9db9ec;background:#fbfdff}.hub-assist-suggestions span{font-size:12px;font-weight:650}.hub-assist-messages{display:grid;gap:12px}.hub-assist-message{display:flex}.hub-assist-message.user{justify-content:flex-end}.hub-assist-bubble{max-width:88%;padding:11px 13px;border-radius:13px;background:#fff;border:1px solid #d7dee8;color:#27344a;font-size:13px;line-height:1.55;white-space:pre-wrap}.hub-assist-message.user .hub-assist-bubble{background:#1769ff;border-color:#1769ff;color:#fff}.hub-assist-thinking{display:flex;gap:4px;padding:14px 15px}.hub-assist-thinking i{width:5px;height:5px;border-radius:50%;background:#8da1bd;animation:hubAssistPulse 1s infinite}.hub-assist-thinking i:nth-child(2){animation-delay:.15s}.hub-assist-thinking i:nth-child(3){animation-delay:.3s}@keyframes hubAssistPulse{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}.hub-assist-composer{display:flex;gap:8px;padding:13px 16px;border-top:1px solid #d7dee8;background:#fff}.hub-assist-composer textarea{flex:1;resize:none;min-height:42px;max-height:120px;border:1px solid #cfd8e5;border-radius:11px;padding:11px 12px;font:13px/1.35 system-ui,sans-serif;color:#172033;outline:none}.hub-assist-composer textarea:focus{border-color:#1769ff;box-shadow:0 0 0 3px rgba(23,105,255,.08)}.hub-assist-composer button{width:43px;height:43px;border:0;border-radius:11px;background:#1769ff;color:#fff;display:grid;place-items:center;cursor:pointer}.hub-assist-composer button:disabled{opacity:.45;cursor:not-allowed}.hub-assist-foot{padding:0 16px 12px;background:#fff;color:#7a8799;font-size:10px;text-align:center}@media(max-width:620px){.hub-assist-launcher{right:14px;bottom:84px;width:50px;height:50px}.hub-assist-panel{width:100%}}\n`}</style>
  </>;
}
