import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientProviders from '@/components/ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Trading Platform - Intelligent Crypto Trading',
  description: 'Advanced AI-powered cryptocurrency trading platform with real-time analytics, smart contract integration, and automated trading signals.',
  keywords: ['crypto trading', 'AI trading', 'DeFi', 'blockchain', 'cryptocurrency'],
  authors: [{ name: 'AI Trading Platform Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
