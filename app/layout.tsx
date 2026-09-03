import type { Metadata } from 'next';
import './globals.css';
import './product-hub-theme.css';
import './analytics-premium.css';
import './dashboard-finish.css';
import './product-hub-overrides.css';
import '../dashboard-overrides.css';
import './auth-overrides.css';
import { HubAssist } from '@/components/hub-assist';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://product-hub-git-main-amatch-737.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Product Hub — A tua loja online, num só lugar', template: '%s | Product Hub' },
  description: 'Cria e gere a tua vitrine online, produtos e workspace num só lugar com o Product Hub.',
  applicationName: 'Product Hub', keywords: ['Product Hub','vitrine online','loja online','catálogo de produtos','gestão de produtos','workspace'],
  authors: [{ name: 'Product Hub' }], creator: 'Product Hub', publisher: 'Product Hub', alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: { type: 'website', locale: 'pt_PT', siteName: 'Product Hub', title: 'Product Hub — A tua loja online, num só lugar', description: 'Cria e gere a tua vitrine online, produtos e workspace num só lugar.', url: '/' },
  twitter: { card: 'summary_large_image', title: 'Product Hub — A tua loja online, num só lugar', description: 'Cria e gere a tua vitrine online, produtos e workspace num só lugar.' },
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt"><body>{children}<HubAssist /></body></html>;
}
