import type { Metadata } from 'next';
import './globals.css';
import './product-hub-theme.css';
import './analytics-premium.css';
import './dashboard-finish.css';
import '../dashboard-overrides.css';
import './auth-overrides.css';

export const metadata: Metadata = {
  title: 'Product Hub — Todos os teus produtos. Num só lugar.',
  description: 'Cria uma vitrine profissional para tudo o que vendes e partilha com um único link.',
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
