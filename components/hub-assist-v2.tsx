'use client';

import { FormEvent, KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, ChevronRight, Lightbulb, MessageCircle, Package, Send, Store, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const suggestions = [
  { icon: Package, label: 'Melhorar um produto', prompt: 'Ajuda-me a melhorar a descrição do meu produto mais recente.' },
  { icon: BarChart3, label: 'Analisar dados', prompt: 'Analisa os meus dados atuais e diz-me o que devo melhorar primeiro.' },
  { icon: Store, label: 'Melhorar a vitrine', prompt: 'Sugere uma melhoria profissional para a minha vitrine com base na configuração atual.' },
  { icon: Lightbulb, label: 'Criar promoção', prompt: 'Cria uma ideia de promoção simples e profissional para este fim de semana.' },
];

function inlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*\n]+\*(?!\*)|(?<!_)_[^_\n]+_(?!_))/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) return <em key={index}>{part.slice(1, -1)}</em>;
    return <span key={index}>{part}</span>;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let list: 'ul' | 'ol' | null = null;
  let items: ReactNode[] = [];
  let code = false;
  let codeLines: string[] = [];

  const flushList = () => {
    if (!list) return;
    nodes.push(list === 'ul' ? <ul key={`ul-${nodes.length}`}>{items}</ul> : <ol key={`ol-${nodes.length}`}>{items}</ol>);
    list = null;
    items = [];
  };

  const flushCode = () => {
    if (!code) return;
    nodes.push(<pre key={`code-${nodes.length}`}><code>{codeLines.join('\n')}</code></pre>);
    codeLines = [];
    code = false;
  };

  lines.forEach((raw, index) => {
    const line = raw.trimEnd();
    if (line.startsWith('```')) {
      flushList();
      if (code) flushCode(); else code = true;
      return;
    }
    if (code) { codeLines.push(raw); return; }
    if (!line.trim()) { flushList(); return; }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const C = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
      nodes.push(<C key={`h-${index}`}>{inlineMarkdown(heading[2])}</C>);
      return;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
    if (bullet) {
      if (list === 'ol') flushList();
      if (!list) list = 'ul';
      items.push(<li key={`li-${index}`}>{inlineMarkdown(bullet[1])}</li>);
      return;
    }

    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ordered) {
      if (list === 'ul') flushList();
      if (!list) list = 'ol';
      items.push(<li key={`li-${index}`}>{inlineMarkdown(ordered[1])}</li>);
      return;
    }

    const quote = line.match(/^\s*>\s?(.+)$/);
    if (quote) {
      flushList();
      nodes.push(<blockquote key={`q-${index}`}>{inlineMarkdown(quote[1])}</blockquote>);
      return;
    }

    flushList();
    nodes.push(<p key={`p-${index}`}>{inlineMarkdown(line)}</p>);
  });

  flushList();
  if (code) flushCode();
  return <>{nodes}</>;
}

export function HubAssistV2() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Olá. Sou o Assistente de Produtos. Posso ajudar-te a melhorar produtos, promoções, vitrine e decisões com base nos dados reais do teu workspace.' },
  ]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hidden = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth');

  useEffect(() => {
    document.body.classList.toggle('hub-assist-open', open);
    return () => document.body.classList.remove('hub-assist-open');
  }, [open]);

  useEffect(() => {
    if (open) window.setTimeout(() => textareaRef.current?.focus(), 120);
  }, [open]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function send(text = input) {
    const message = text.trim();
    if (!message || loading) return;
    const history = messages.slice(-8);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Não foi possível responder agora.');
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Não recebi uma resposta válida.' }]);
    } catch (error: any) {
      const text = error?.name === 'AbortError' ? 'A resposta demorou demasiado. Tenta novamente.' : (error?.message || 'Não consegui responder agora.');
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void send();
  }

  function keyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  if (hidden) return null;

  return (
    <>
      {!open && (
        <button type="button" className="hub-assist-launcher-v2" onClick={() => setOpen(true)} aria-label="Abrir Assistente de Produtos">
          <img src="/hub-assist-silhouette.svg" alt="" aria-hidden="true" />
        </button>
      )}

      {open && (
        <div className="hub-assist-backdrop-v2" role="presentation" onMouseDown={() => setOpen(false)}>
          <aside className="hub-assist-panel-v2" role="dialog" aria-modal="true" aria-label="Assistente de Produtos" onMouseDown={e => e.stopPropagation()}>
            <header className="hub-assist-header-v2">
              <div className="hub-assist-title-v2">
                <div className="hub-assist-mark-v2"><img src="/hub-assist-silhouette.svg" alt="" aria-hidden="true" /></div>
                <strong>Assistente de Produtos</strong>
              </div>
              <button type="button" className="hub-assist-close-v2" onClick={() => setOpen(false)} aria-label="Fechar"><X size={18} /></button>
            </header>

            <div className="hub-assist-content-v2">
              {messages.length === 1 && (
                <div className="hub-assist-suggestions-v2">
                  {suggestions.map(({ icon: Icon, label, prompt }) => (
                    <button type="button" key={label} onClick={() => void send(prompt)} disabled={loading}>
                      <Icon size={15} /><span>{label}</span><ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              )}

              <div className="hub-assist-messages-v2" aria-live="polite">
                {messages.map((m, index) => (
                  <div key={`${m.role}-${index}`} className={`hub-assist-message-v2 ${m.role}`}>
                    <div className="hub-assist-bubble-v2"><MarkdownMessage content={m.content} /></div>
                  </div>
                ))}
                {loading && <div className="hub-assist-message-v2 assistant"><div className="hub-assist-bubble-v2 hub-assist-thinking-v2"><i /><i /><i /></div></div>}
              </div>
            </div>

            <form className="hub-assist-composer-v2" onSubmit={submit}>
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={keyDown} placeholder="Escreve o que precisas…" rows={1} aria-label="Mensagem" />
              <button type="submit" disabled={!canSend} aria-label="Enviar"><Send size={17} /></button>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
