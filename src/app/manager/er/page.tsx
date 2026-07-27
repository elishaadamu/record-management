"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@context/AuthContext';
import { managerService } from '@/services/managerService';
import {
  Shield,
  BarChart3,
  Clock,
  CheckCircle2,
  RefreshCw,
  Wallet,
  Users,
  Building,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  User as UserIcon
} from 'lucide-react';

export default function ManagerErPage() {
  const { currentUser } = useAuth();

  const [erTotal, setErTotal] = useState<any>(null);
  const [erWeekly, setErWeekly] = useState<any>(null);
  const [erMonthly, setErMonthly] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [erUsersPage, setErUsersPage] = useState(1);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErUsersPage(1);
    try {
      const [totalRes, weeklyRes, monthlyRes, walletRes, propertiesRes] = await Promise.allSettled([
        managerService.getErTotal(),
        managerService.getErWeekly(),
        managerService.getErMonthly(),
        managerService.getWalletInfo(),
        managerService.getAssignedProperties()
      ]);

      if (totalRes.status === 'fulfilled') setErTotal(totalRes.value?.data || totalRes.value);
      if (weeklyRes.status === 'fulfilled') setErWeekly(weeklyRes.value?.data || weeklyRes.value);
      if (monthlyRes.status === 'fulfilled') setErMonthly(monthlyRes.value?.data || monthlyRes.value);
      if (walletRes.status === 'fulfilled') setWalletData(walletRes.value?.data || walletRes.value);
      
      if (propertiesRes.status === 'fulfilled') {
        const pVal = propertiesRes.value?.data || propertiesRes.value;
        let list = pVal?.properties || pVal || [];
        if (list && !Array.isArray(list) && typeof list === 'object') {
          const arr = Object.values(list).find(v => Array.isArray(v));
          if (arr) list = arr;
        }
        setPropertiesList(Array.isArray(list) ? list : []);
      }
    } catch (e: any) {
      // Quiet fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getNumVal = (obj: any) => {
    if (typeof obj === 'number') return obj;
    if (!obj) return 0;
    return obj.totalER ?? obj.weeklyER ?? obj.monthlyER ?? obj.total ?? obj.count ?? obj.value ?? 0;
  };

  const balance = walletData?.balance ?? walletData?.wallet?.balance ?? 0;
  const transactions = walletData?.transactions || walletData?.wallet?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
            <Shield className="h-3.5 w-3.5" /> Operations Manager Hub
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {currentUser?.name || 'Manager'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Access a consolidated summary of ER activity, wallet logs, assigned properties, and quick links.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-white shadow-md border border-slate-750 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Dashboard
        </button>
      </div>

      {/* 4-Column Cards Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md animate-pulse space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                <div className="h-4 bg-slate-800 rounded w-4"></div>
              </div>
              <div className="h-6 bg-slate-800 rounded w-1/2 mt-1"></div>
              <div className="h-2.5 bg-slate-800 rounded w-1/4 mt-0.5"></div>
            </div>
          ))
        ) : (
          <>
            {/* Card 1: Total ER */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total ER Stats</span>
                <BarChart3 className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{getNumVal(erTotal)}</p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Overall ER Records</span>
            </div>

            {/* Card 2: Weekly ER */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Weekly ER Stats</span>
                <Clock className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{getNumVal(erWeekly)}</p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">This Week Activity</span>
            </div>

            {/* Card 3: Monthly ER */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly ER Stats</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{getNumVal(erMonthly)}</p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">This Month Activity</span>
            </div>

            {/* Card 4: Wallet Balance */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Wallet Balance</span>
                <Wallet className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1">₦{balance.toLocaleString()}</p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Earnings Available</span>
            </div>
          </>
        )}
      </div>

      {/* Quick Action Links Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Portal Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/manager/performance" className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-all flex flex-col justify-between h-24 group">
            <Users className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[11px] font-bold text-slate-200">Team Directory</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
            </div>
          </Link>

          <Link href="/manager/wallet" className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-all flex flex-col justify-between h-24 group">
            <Wallet className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[11px] font-bold text-slate-200">Withdraw Funds</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
            </div>
          </Link>

          <Link href="/manager/properties" className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-all flex flex-col justify-between h-24 group">
            <Building className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[11px] font-bold text-slate-200">Properties List</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
            </div>
          </Link>

          <Link href="/manager/profile" className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-all flex flex-col justify-between h-24 group">
            <UserIcon className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[11px] font-bold text-slate-200">My Profile</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
            </div>
          </Link>
        </div>
      </div>

      {/* Grid of Summarized Tables: Recent Properties & Wallet Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Properties Mini-list */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building className="h-4 w-4 text-indigo-400" /> Supervised Properties
            </h3>
            <Link href="/manager/properties" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto text-xs text-left">
            <table className="w-full">
              <thead className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-850">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Unit</th>
                  <th className="pb-2 text-right">Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-200">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-2"><div className="h-3 bg-slate-800 rounded w-2/3"></div></td>
                      <td className="py-2"><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                      <td className="py-2 text-right"><div className="h-3 bg-slate-800 rounded w-1/3 ml-auto"></div></td>
                    </tr>
                  ))
                ) : propertiesList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500">No properties assigned.</td>
                  </tr>
                ) : (
                  propertiesList.slice(0, 3).map((p: any, idx: number) => (
                    <tr key={p.id || p._id || idx}>
                      <td className="py-2 font-semibold text-white">{p.propertyName || p.name}</td>
                      <td className="py-2 text-slate-300">{p.propertyNumber || p.number || 'N/A'}</td>
                      <td className="py-2 text-right text-indigo-300 font-medium">{p.agentName || p.agentId || 'Unassigned'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions Mini-list */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-indigo-400" /> Recent Wallet Logs
            </h3>
            <Link href="/manager/wallet" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto text-xs text-left">
            <table className="w-full">
              <thead className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-850">
                <tr>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-200">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-2"><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                      <td className="py-2"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                      <td className="py-2 text-right"><div className="h-3 bg-slate-800 rounded w-1/4 ml-auto"></div></td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500">No transactions recorded.</td>
                  </tr>
                ) : (
                  transactions.slice(0, 3).map((tx: any, idx: number) => {
                    const isDebit = tx.type === 'debit' || tx.type === 'withdraw' || tx.type === 'withdrawal';
                    const amountColor = isDebit ? 'text-rose-400' : 'text-emerald-400';
                    const amountSign = isDebit ? '-' : '+';
                    const Icon = isDebit ? ArrowUpRight : ArrowDownLeft;

                    return (
                      <tr key={tx._id || tx.id || idx}>
                        <td className="py-2 flex items-center gap-1 font-semibold text-white">
                          <Icon className={`h-3 w-3 ${amountColor}`} />
                          <span className="capitalize">{tx.type}</span>
                        </td>
                        <td className={`py-2 font-bold ${amountColor}`}>{amountSign}₦{Math.abs(tx.amount).toLocaleString()}</td>
                        <td className="py-2 text-right">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            tx.status === 'approved' || tx.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300'
                              : tx.status === 'pending'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-rose-950 text-rose-300'
                          }`}>
                            {(tx.status || 'approved').toUpperCase()}
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

      {/* ER Registered Users / Managers List */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Registered ER Users List</h3>
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
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
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-2/3"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-3/4"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                    </tr>
                  ))
                ) : (!erTotal?.users || erTotal.users.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No registered ER users found in analytics.
                    </td>
                  </tr>
                ) : (
                  erTotal.users.slice((erUsersPage - 1) * 10, erUsersPage * 10).map((usr: any, i: number) => {
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

          {erTotal?.users && erTotal.users.length > 10 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-850 bg-slate-950/40 text-[11px]">
              <button
                type="button"
                disabled={erUsersPage === 1}
                onClick={() => setErUsersPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
              >
                Previous
              </button>
              <span className="text-slate-400">
                Page <span className="font-bold text-white">{erUsersPage}</span> of <span className="font-bold text-white">{Math.ceil(erTotal.users.length / 10)}</span>
              </span>
              <button
                type="button"
                disabled={erUsersPage === Math.ceil(erTotal.users.length / 10)}
                onClick={() => setErUsersPage(prev => Math.min(prev + 1, Math.ceil(erTotal.users.length / 10)))}
                className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
