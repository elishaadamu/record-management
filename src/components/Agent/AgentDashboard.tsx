"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@context/AuthContext';
import { StatCard } from '@components/Common/StatCard';
import { StatCardSkeleton, TableSkeleton } from '@components/Common/Skeleton';
import { agentService } from '@/services/agentService';
import {
  UserCheck,
  Building,
  Wallet,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  MapPin,
  Calendar,
  CalendarDays,
  Sparkles
} from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const [walletData, setWalletData] = useState<any>(null);
  const [propertiesData, setPropertiesData] = useState<any>(null);
  const [erTotalData, setErTotalData] = useState<any>(null);
  const [erWeeklyData, setErWeeklyData] = useState<any>(null);
  const [erMonthlyData, setErMonthlyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, propRes, totalRes, weeklyRes, monthlyRes] = await Promise.allSettled([
        agentService.getWalletInfo(),
        agentService.getProperties(),
        agentService.getErTotal(),
        agentService.getErWeekly(),
        agentService.getErMonthly()
      ]);

      if (walletRes.status === 'fulfilled') setWalletData(walletRes.value?.data || walletRes.value);
      if (propRes.status === 'fulfilled') setPropertiesData(propRes.value);
      if (totalRes.status === 'fulfilled') setErTotalData(totalRes.value?.data || totalRes.value);
      if (weeklyRes.status === 'fulfilled') setErWeeklyData(weeklyRes.value?.data || weeklyRes.value);
      if (monthlyRes.status === 'fulfilled') setErMonthlyData(monthlyRes.value?.data || monthlyRes.value);
    } catch (e: any) {
      // Quiet fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!currentUser) return null;

  // Parsed Wallet
  const walletBalance = walletData?.balance ?? walletData?.wallet?.balance ?? walletData?.amount ?? 0;
  const historyList = Array.isArray(walletData?.history)
    ? walletData.history
    : Array.isArray(walletData?.transactions)
    ? walletData.transactions
    : [];

  // Parsed Properties
  let rawPropertyList = propertiesData?.data?.properties || propertiesData?.properties || propertiesData?.data || propertiesData;
  if (rawPropertyList && !Array.isArray(rawPropertyList) && typeof rawPropertyList === 'object') {
    const arrayVal = Object.values(rawPropertyList).find(v => Array.isArray(v));
    if (arrayVal) rawPropertyList = arrayVal;
  }
  const propertiesList: any[] = Array.isArray(rawPropertyList) ? rawPropertyList : [];
  const propertyStats = propertiesData?.stats || {
    total: propertiesList.length,
    available: propertiesList.filter((p: any) => (p.status || '').toLowerCase() === 'available').length,
    unavailable: propertiesList.filter((p: any) => (p.status || '').toLowerCase() === 'unavailable').length
  };

  // Parsed ER Counts
  const erTotalCount = erTotalData?.totalCount ?? erTotalData?.count ?? erTotalData?.total ?? erTotalData?.val ?? 0;
  const erWeeklyCount = erWeeklyData?.weeklyCount ?? erWeeklyData?.count ?? erWeeklyData?.total ?? erWeeklyData?.val ?? 0;
  const erMonthlyCount = erMonthlyData?.monthlyCount ?? erMonthlyData?.count ?? erMonthlyData?.total ?? erMonthlyData?.val ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-6 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
            <UserCheck className="h-4 w-4 text-emerald-400" /> Agent Operations Portal
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome, {currentUser.name}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Overview of your execution records, operational wallet balance, and assigned property assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link
            href="/agent/wallet"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Wallet className="h-4 w-4 text-white" />
            <span>Wallet: {isLoading ? '...' : `₦${Number(walletBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}</span>
          </Link>
        </div>
      </div>

      {/* ER Analytics & Performance Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Grand Total ER Count"
              value={erTotalCount}
              subtitle="Cumulative execution logs recorded"
              icon={TrendingUp}
              accentColor="emerald"
            />
            <StatCard
              title="Weekly ER Output"
              value={erWeeklyCount}
              subtitle="Executions completed this calendar week"
              icon={Calendar}
              accentColor="blue"
            />
            <StatCard
              title="Monthly ER Output"
              value={erMonthlyCount}
              subtitle="Executions completed this month"
              icon={CalendarDays}
              accentColor="purple"
            />
          </>
        )}
      </div>

      {/* Financial & Property KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Wallet Balance"
              value={`₦${Number(walletBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
              subtitle="Available balance for payout withdrawal"
              icon={Wallet}
              accentColor="emerald"
            />
            <StatCard
              title="Assigned Properties"
              value={propertyStats.total}
              subtitle={`${propertyStats.available} Available • ${propertyStats.unavailable} Unavailable`}
              icon={Building}
              accentColor="blue"
            />
          </>
        )}
      </div>

      {/* TABLE 1: ASSIGNED PROPERTIES OVERVIEW (Show 5) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="h-4 w-4 text-emerald-400" /> Assigned Properties Overview
            </h3>
            <p className="text-[11px] text-slate-400">Top assigned real estate property assets</p>
          </div>
          <Link
            href="/agent/properties"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View All Properties <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Property Number</th>
                <th className="py-2.5 px-3">Property Name</th>
                <th className="py-2.5 px-3">Location / Territory</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {isLoading ? (
                <TableSkeleton rows={3} cols={5} />
              ) : propertiesList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No assigned properties found.
                  </td>
                </tr>
              ) : (
                propertiesList.slice(0, 5).map((p: any, idx: number) => {
                  const propId = p.id || p._id || idx;
                  const name = p.propertyName || p.name || p.title || 'Property Asset';
                  const num = p.propertyNumber || p.number || p.code || 'N/A';
                  const status = (p.status || 'available').toLowerCase();

                  return (
                    <tr key={propId} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-emerald-400 select-all">{num}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{name}</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{p.location || p.address || p.state || 'Assigned Territory'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          status === 'available'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href="/agent/properties"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded-md transition-all cursor-pointer"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: RECENT WALLET TRANSACTIONS OVERVIEW (Show 5) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400" /> Recent Wallet Transactions & Payouts
            </h3>
            <p className="text-[11px] text-slate-400">Top operational wallet records logged</p>
          </div>
          <Link
            href="/agent/wallet"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View All Transactions <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {isLoading ? (
                <TableSkeleton rows={3} cols={5} />
              ) : historyList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No wallet transaction records logged yet.
                  </td>
                </tr>
              ) : (
                historyList.slice(0, 5).map((tx: any, idx: number) => {
                  const isCredit = (tx.type || '').toLowerCase() === 'credit';
                  const statusLower = (tx.status || 'pending').toLowerCase();
                  let statusBadgeStyle = 'text-amber-400 bg-amber-950/40 border-amber-800/40';
                  if (['completed', 'approved', 'success', 'successful'].includes(statusLower)) {
                    statusBadgeStyle = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
                  } else if (['failed', 'rejected', 'declined', 'cancelled'].includes(statusLower)) {
                    statusBadgeStyle = 'text-rose-400 bg-rose-950/40 border-rose-800/40';
                  }

                  return (
                    <tr key={tx.id || tx._id || idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold">
                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                          isCredit
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                        }`}>
                          {isCredit ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {tx.type || 'Withdrawal'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-300">{tx.description || tx.memo || 'Agent Wallet Operation'}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : tx.date || 'N/A'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded ${statusBadgeStyle}`}>
                          {tx.status || 'Pending'}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isCredit ? '+' : '-'}₦{Number(tx.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
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
  );
};
