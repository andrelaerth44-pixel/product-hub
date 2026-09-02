import type { Metadata } from 'next';
import './globals.css';
import './product-hub-theme.css';
import FirstVisitIntro from '@/components/first-visit-intro';

export const metadata: Metadata = {
  title: 'Product Hub — All your products. One place.',
  description: 'Create a beautiful storefront for everything you sell and share it with one simple link.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body>{children}<FirstVisitIntro /></body>
    </html>
  );
}
