import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import CustomCursor from '@/components/CustomCursor';
import PagePreloader from '@/components/PagePreloader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShadowStore | Instant Gaming Top-Up & Reseller Portal',
  description: 'Fast, secure, automated Garena Free Fire diamond top-ups, Mobile Legends diamonds, and tiered pricing for resellers.',
  keywords: 'game topup, free fire diamonds, garena shell, reseller pricing, instant topup, shadowstore',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <CustomCursor />
        <Suspense fallback={null}>
          <PagePreloader />
        </Suspense>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
