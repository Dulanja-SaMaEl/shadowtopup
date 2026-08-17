'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="min-h-screen bg-[#0a0814]">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
