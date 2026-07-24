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

  useEffect(() => {
    if (!currentUser && pathname !== '/login') {
      router.push('/login');
    } else if (currentUser && pathname === '/login') {
      router.push(`/${currentUser.role}`);
    }
  }, [currentUser, pathname, router]);

  useEffect(() => {
    if (pathname === '/login') {
      document.documentElement.classList.remove('dark');
    } else {
      const savedTheme = localStorage.getItem('theme') || 'light';
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [pathname]);

  if (!currentUser && pathname !== '/login') {
    return null; // Avoid flashing protected content before redirect
  }

  // If on login page, don't show navbar and footer
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Broadcast Banner if configured */}
      {settings.broadcastBannerMessage && (
        <div className="bg-gradient-to-r from-amber-950 via-purple-950 to-indigo-950 border-b border-amber-800/50 py-2 px-4 text-xs text-amber-200 flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-semibold">{settings.broadcastBannerMessage}</span>
        </div>
      )}

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
