'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Bot, BarChart3, ChevronRight, Lightbulb, MessageCircle, Package, Send, Sparkles, Store, X } from 'lucide-react';

export function HubAssist({ organizationId: _organizationId }: { organizationId?: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Olá. Sou o Hub Assist. Posso ajudar-te a melhorar produtos, promoções, vitrine e decisões com base nos dados reais do teu workspace.' },
  ]);

  const suggestions = useMemo(() => [
    { icon: Package, label: 'Melhorar um produto', prompt: 'Ajuda-me a melhorar a descrição do meu produto mais recente.' },
    { icon: BarChart3, label: 'Analisar vendas', prompt: 'Analisa os meus dados atuais e diz-me o que devo melhorar primeiro.' },
    { icon: Store, label: 'Melhorar a vitrine', prompt: 'Sugere uma melhoria profissional para a minha vitrine com base na configuração atual.' },
    { icon: Lightbulb, label: 'Criar promoção', prompt: 'Cria uma ideia de promoção simples e profissional para este fim de semana.' },
  ], []);

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
    <button className="hub-assist-launcher" onClick={() => setOpen(true)} aria-label="Abrir Hub Assist"><Bot size={17}/><span>Hub Assist</span></button>
    {open && <div className="hub-assist-backdrop" onMouseDown={() => setOpen(false)}>
      <aside className="hub-assist-panel" onMouseDown={e => e.stopPropagation()}>
        <header className="hub-assist-header"><div className="hub-assist-title"><div className="hub-assist-mark"><Bot size={18}/></div><div><strong>Hub Assist</strong><span>O teu assistente de negócio</span></div></div><button className="hub-assist-close" onClick={() => setOpen(false)} aria-label="Fechar"><X size={18}/></button></header>
        <div className="hub-assist-capabilities"><span>Produtos</span><span>Analytics</span><span>Vitrine</span><span>Promoções</span></div>
        <div className="hub-assist-body">
          {messages.length === 1 && <div className="hub-assist-welcome"><div className="hub-assist-welcome-icon"><MessageCircle size={21}/></div><h2>Em que trabalhamos?</h2><p>Fala comigo como falarias com alguém da tua equipa. Eu uso os dados do teu workspace para dar respostas úteis.</p><div className="hub-assist-suggestions">{suggestions.map(({icon: Icon,label,prompt})=><button key={label} onClick={() => void send(prompt)}><Icon size={16}/><span>{label}</span><ChevronRight size={14}/></button>)}</div></div>}
          <div className="hub-assist-messages">{messages.map((m,i)=><div key={i} className={`hub-assist-message ${m.role}`}><div className="hub-assist-bubble">{m.content}</div></div>)}{loading&&<div className="hub-assist-message assistant"><div className="hub-assist-bubble hub-assist-thinking"><i/><i/><i/></div></div>}</div>
        </div>
        <form className="hub-assist-composer" onSubmit={submit}><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Escreve o que precisas…" rows={1} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send()}}}/><button type="submit" disabled={!input.trim()||loading} aria-label="Enviar"><Send size={17}/></button></form>
        <div className="hub-assist-foot"><Sparkles size={12}/> Usa dados reais do workspace. Não inventa métricas.</div>
      </aside>
    </div>}
  </>;
}
