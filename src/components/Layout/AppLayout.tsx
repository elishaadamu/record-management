"use client";

import React from 'react';
import { useAuth } from '@context/AuthContext';
import { useData } from '@context/DataContext';
import { Navbar } from '@components/Header/Navbar';
import { AlertCircle, Shield } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { settings } = useData();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ops_portal_token') : null;
    if (!isPublicRoute && (!currentUser || !token)) {
      router.push('/login');
    } else if (currentUser && token && isPublicRoute) {
      router.push(`/${currentUser.role}`);
    }
  }, [currentUser, pathname, router, isPublicRoute]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, [pathname]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('ops_portal_token') : null;
  if (!isPublicRoute && (!currentUser || !token)) {
    return null; // Avoid flashing protected content before redirect
  }

  const isBypassedRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/manager') || pathname?.startsWith('/agent');

  // If on public pages or role-based sub-routes, bypass global Navbar/Footer chrome
  if (isPublicRoute || isBypassedRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Main Dashboard Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span className="font-bold text-slate-300">MK360</span>
            <span>— Role-Based Security Portal</span>
          </div>
          {currentUser && (
            <div className="text-[11px] text-slate-500">
              Current Session: <strong className="text-slate-300">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
