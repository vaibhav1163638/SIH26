'use client';

import Sidebar from './Sidebar';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!session && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
        router.push('/login');
      }
      if (session && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard');
      }
    }
  }, [session, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        {children}
      </main>
    );
  }

  if (pathname === '/') {
    return (
      <main className="min-h-screen w-full overflow-x-hidden">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      {session && <Sidebar />}
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
