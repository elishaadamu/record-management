"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { managerService } from '@/services/managerService';
import {
  Shield,
  BarChart3,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function ManagerErPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [erTotal, setErTotal] = useState<any>(null);
  const [erWeekly, setErWeekly] = useState<any>(null);
  const [erMonthly, setErMonthly] = useState<any>(null);
  const [isLoadingEr, setIsLoadingEr] = useState(false);

  const fetchErStats = async () => {
    setIsLoadingEr(true);
    try {
      const [totalRes, weeklyRes, monthlyRes] = await Promise.allSettled([
        managerService.getErTotal(),
        managerService.getErWeekly(),
        managerService.getErMonthly()
      ]);
      if (totalRes.status === 'fulfilled') setErTotal(totalRes.value?.data || totalRes.value);
      if (weeklyRes.status === 'fulfilled') setErWeekly(weeklyRes.value?.data || weeklyRes.value);
      if (monthlyRes.status === 'fulfilled') setErMonthly(monthlyRes.value?.data || monthlyRes.value);
    } catch (e: any) {
      // Quiet fail
    } finally {
      setIsLoadingEr(false);
    }
  };

  useEffect(() => {
    fetchErStats();
  }, []);

  const getNumVal = (obj: any) => {
    if (typeof obj === 'number') return obj;
    if (!obj) return 0;
    return obj.totalER ?? obj.weeklyER ?? obj.monthlyER ?? obj.total ?? obj.count ?? obj.value ?? 0;
  };

  const erUsers = erTotal?.users || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
            <Shield className="h-3.5 w-3.5" /> Operations Manager Dashboard
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome, {currentUser?.name || 'Manager'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Overview ER analytics and statistics for your supervised agents.
          </p>
        </div>
      </div>

      {/* ER Statistics Overview Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {isLoadingEr ? (
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 shadow-md animate-pulse space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                <div className="h-4 bg-slate-800 rounded w-4"></div>
              </div>
              <div className="h-6 bg-slate-800 rounded w-1/2 mt-1"></div>
              <div className="h-2.5 bg-slate-800 rounded w-1/4 mt-0.5"></div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 shadow-md animate-pulse space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                <div className="h-4 bg-slate-800 rounded w-4"></div>
              </div>
              <div className="h-6 bg-slate-800 rounded w-1/2 mt-1"></div>
              <div className="h-2.5 bg-slate-800 rounded w-1/4 mt-0.5"></div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 shadow-md animate-pulse space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                <div className="h-4 bg-slate-800 rounded w-4"></div>
              </div>
              <div className="h-6 bg-slate-800 rounded w-1/2 mt-1"></div>
              <div className="h-2.5 bg-slate-800 rounded w-1/4 mt-0.5"></div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total ER Stats</span>
                <BarChart3 className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{getNumVal(erTotal)}</p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Overall ER Records</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Weekly ER Stats</span>
                <Clock className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{getNumVal(erWeekly)}</p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">This Week Activity</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly ER Stats</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{getNumVal(erMonthly)}</p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">This Month Activity</span>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-indigo-400" /> ER Analytics Details
          </h2>
          <button
            onClick={fetchErStats}
            disabled={isLoadingEr}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            <RefreshCw className={`h-3 w-3 ${isLoadingEr ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* ER Registered Users / Managers List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Registered ER Users ({erTotal?.users?.length || 0})</h3>
          </div>
          <div className="overflow-x-auto text-xs text-left">
            <table className="w-full">
              <thead className="border-b border-slate-850 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3 font-right">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-200">
                {isLoadingEr ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-2/3"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-3/4"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                    </tr>
                  ))
                ) : erUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No registered ER users found in analytics.
                    </td>
                  </tr>
                ) : (
                  erUsers.map((usr: any, i: number) => {
                    const name = usr.firstName ? `${usr.firstName} ${usr.lastName || ''}`.trim() : usr.name || usr.email;
                    return (
                      <tr key={usr._id || usr.id || i} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 select-all">{usr._id || usr.id || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-semibold text-white">{name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{usr.email}</td>
                        <td className="py-2.5 px-3 text-slate-300">{usr.phone || 'N/A'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[10px] font-semibold uppercase">
                            {usr.role || 'user'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
