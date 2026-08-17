import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import CustomCursor from '@/components/CustomCursor';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShadowTopUp | Instant Gaming Top-Up & Reseller Portal',
  description: 'Fast, secure, automated Garena Free Fire diamond top-ups, Mobile Legends diamonds, and tiered pricing for resellers.',
  keywords: 'game topup, free fire diamonds, garena shell, reseller pricing, instant topup',
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
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
