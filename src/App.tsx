import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { LoginPage } from './components/Auth/LoginPage';
import { Navbar } from './components/Header/Navbar';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ManagerDashboard } from './components/Manager/ManagerDashboard';
import { AgentDashboard } from './components/Agent/AgentDashboard';
import { AlertCircle, Shield } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings } = useData();

  if (!currentUser) {
    return <LoginPage />;
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
        {currentUser.role === 'admin' && <AdminDashboard />}
        {currentUser.role === 'manager' && <ManagerDashboard />}
        {currentUser.role === 'agent' && <AgentDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span className="font-bold text-slate-300">Operations Hub</span>
            <span>— Role-Based Security Portal</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Current Session: <strong className="text-slate-300">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
