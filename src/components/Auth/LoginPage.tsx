import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, Eye, EyeOff, UserCheck, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, loginAsRole, users } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);
      if (!result.success && result.message) {
        setErrorMessage(result.message);
      }
    }, 400);
  };

  const demoUsers: { role: UserRole; title: string; email: string; pass: string; desc: string; icon: any; color: string; bg: string; border: string }[] = [
    {
      role: 'admin',
      title: 'Administrator',
      email: 'admin@ops.com',
      pass: 'admin123',
      desc: 'System oversight, user management, permissions matrix, security logs & settings.',
      icon: Shield,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 hover:bg-purple-900/50',
      border: 'border-purple-800/60'
    },
    {
      role: 'manager',
      title: 'Manager',
      email: 'manager@ops.com',
      pass: 'manager123',
      desc: 'Team overview, task dispatching, expense/discount approvals & regional analytics.',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-950/40 hover:bg-blue-900/50',
      border: 'border-blue-800/60'
    },
    {
      role: 'agent',
      title: 'Agent',
      email: 'agent@ops.com',
      pass: 'agent123',
      desc: 'Personal workspace, assigned task execution, request submissions & daily stats.',
      icon: UserCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
      border: 'border-emerald-800/60'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Direct Custom Login Form */}
        <div className="lg:col-span-5 flex flex-col justify-center rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-950/80 px-3 py-1.5 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-3">
              <Shield className="h-4 w-4" /> Secure Enterprise Auth
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Operations Portal</h1>
            <p className="text-sm text-slate-400 mt-1">
              Sign in with your credentials or select a quick demo profile.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-rose-800/80 bg-rose-950/80 p-3 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@ops.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
                />
                <span>Remember session</span>
              </label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert("Demo mode: Use the 1-click profiles on the right to log in as Admin, Manager, or Agent instantly!"); }} className="text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
            Protected by Role-Based Access Control (RBAC) & Audit Tracking.
          </div>
        </div>

        {/* Right Side: Quick 1-Click Role Profiles */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Select User Role Profile</h2>
                <p className="text-xs text-slate-400">
                  Instant 1-click authentication for 3 primary roles requested.
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-mono text-indigo-300 border border-slate-700">
                3 Pre-Configured Users
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 mt-4">
              {demoUsers.map(item => {
                const IconComponent = item.icon;
                const matchedUser = users.find(u => u.role === item.role);
                return (
                  <div
                    key={item.role}
                    onClick={() => loginAsRole(item.role)}
                    className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 ${item.bg} ${item.border} hover:scale-[1.01]`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg border p-3 bg-slate-950/80 ${item.border}`}>
                        <IconComponent className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{item.title} Account</h3>
                            <span className="text-[10px] font-mono bg-slate-950/60 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                              {item.email}
                            </span>
                          </div>
                          <span className={`text-xs font-semibold ${item.color} group-hover:translate-x-1 transition-transform flex items-center gap-1`}>
                            Login as {item.title} <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-300">{item.desc}</p>

                        {matchedUser && (
                          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                            <img
                              src={matchedUser.avatar}
                              alt={matchedUser.name}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                            <span className="font-medium text-slate-200">{matchedUser.name}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{matchedUser.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-950/60 border border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Role Authorization Summary
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400 text-center">
              <div className="rounded bg-purple-950/30 p-2 border border-purple-900/40">
                <div className="font-bold text-purple-300">Admin</div>
                <div>User CRUD & Audit</div>
              </div>
              <div className="rounded bg-blue-950/30 p-2 border border-blue-900/40">
                <div className="font-bold text-blue-300">Managers</div>
                <div>Dispatch & Approvals</div>
              </div>
              <div className="rounded bg-emerald-950/30 p-2 border border-emerald-900/40">
                <div className="font-bold text-emerald-300">Agents</div>
                <div>Tasks & Requests</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
