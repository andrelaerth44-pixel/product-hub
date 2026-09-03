import { HubAssist } from '@/components/hub-assist';

export default function HubAssistPage() {
  return <main style={{ minHeight: '100vh', background: '#eef1f5', padding: 32, color: '#172033' }}><div style={{ maxWidth: 900, margin: '0 auto' }}><h1 style={{ fontSize: 34, marginBottom: 8 }}>Hub Assist</h1><p style={{ color: '#657085', marginBottom: 24 }}>O assistente de negócio do Product Hub.</p><HubAssist /></div></main>;
}
