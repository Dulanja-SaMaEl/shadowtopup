'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function OrdersRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams?.toString();
    const target = qs ? `/dashboard?${qs}` : '/dashboard';
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#070510] flex flex-col items-center justify-center text-white px-4">
      <div className="flex items-center gap-3 bg-[#110e24]/90 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 shadow-lg">
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        <span className="text-sm font-medium text-slate-300">Loading order details...</span>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersRedirectContent />
    </Suspense>
  );
}
