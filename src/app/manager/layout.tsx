"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
import {
  Shield,
  BarChart3,
  Users,
  Wallet,
  Building,
  Menu,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, currentUser } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      name: 'ER Overview',
      path: '/manager/er',
      icon: BarChart3,
    },
    {
      name: 'Agents & Performance',
      path: '/manager/performance',
      icon: Users,
    },
    {
      name: 'Wallet & Withdrawals',
      path: '/manager/wallet',
      icon: Wallet,
    },
    {
      name: 'Properties',
      path: '/manager/properties',
      icon: Building,
    },
    {
      name: 'My Profile',
      path: '/manager/profile',
      icon: UserIcon,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          <span className="font-extrabold text-sm tracking-wider text-white">MANAGER PORTAL</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-full md:h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 transition-transform duration-200 md:transform-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2.5 px-2 py-1.5">
            <Shield className="h-6 w-6 text-indigo-400" />
            <span className="font-black text-base tracking-wider text-white">MANAGER PORTAL</span>
          </div>

          {/* Company Brand Logo and Name */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-900 flex items-center justify-center">
              <img src="/logo.jpg" alt="MK360 Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">MK360</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Portal System</div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.path || (item.path === '/manager/er' && pathname === '/manager');
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 py-6 md:h-screen">
        {children}
      </main>
    </div>
  );
}
