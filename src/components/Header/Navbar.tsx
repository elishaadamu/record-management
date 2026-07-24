import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useData } from '@context/DataContext';
import { RoleBadge } from '@components/Common/Badge';
import { useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  ChevronDown,
  CheckCheck,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const { notifications, markNotificationRead, clearNotifications } = useData();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  React.useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!currentUser) return null;

  // Filter notifications for this role or all
  const filteredNotifs = notifications.filter(
    n => !n.targetRole || n.targetRole === 'all' || n.targetRole === currentUser.role
  );
  const unreadCount = filteredNotifs.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-slate-800 shadow-lg border border-slate-700/50">
            <img src="/logo.jpg" alt="MK360 Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">MK360</span>
              <RoleBadge role={currentUser.role} size="sm" />
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Portal System</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-pure-white ring-2 ring-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-400" /> Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                  {filteredNotifs.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-6">No notifications found.</p>
                  ) : (
                    filteredNotifs.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`rounded-lg p-3 text-xs border transition-colors cursor-pointer ${
                          n.read
                            ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                            : 'bg-slate-800/60 border-slate-700 text-slate-200 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{n.title}</span>
                          <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="mt-1 text-slate-300">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/80 p-1.5 pr-3 hover:bg-slate-800 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-700"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 leading-tight capitalize">{currentUser.role}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
                <div className="p-3 border-b border-slate-800">
                  <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                  <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                  <div className="mt-2">
                    <RoleBadge role={currentUser.role} size="sm" />
                  </div>
                </div>

                {/* Mobile quick role switcher removed for distinct user sessions */}

                <button
                  onClick={() => { logout(); router.push('/login'); }}
                  className="mt-1 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
