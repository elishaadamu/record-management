"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@context/ToastContext';
import { managerService } from '@/services/managerService';
import {
  Wallet,
  Send,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function ManagerWalletPage() {
  const { showToast } = useToast();

  const [walletData, setWalletData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWallet = async () => {
    setIsLoading(true);
    try {
      const res = await managerService.getWalletInfo();
      setWalletData(res?.data || res || {});
    } catch (e: any) {
      // Quiet fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await managerService.placeWithdrawal({ amount: parseFloat(amount) });
      showToast('Withdrawal request placed successfully!', 'success');
      setAmount('');
      fetchWallet();
    } catch (err: any) {
      showToast(err?.message || 'Failed to request withdrawal.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const balance = walletData?.balance ?? walletData?.wallet?.balance ?? 0;
  const transactions = walletData?.transactions || walletData?.wallet?.transactions || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
            <Wallet className="h-3.5 w-3.5" /> Wallet Operations
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Earnings & Withdrawals</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Check your balance, place withdrawals to your bank account, and view transaction history.
          </p>
        </div>
        <button
          onClick={fetchWallet}
          disabled={isLoading}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Wallet Balance Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-5 pointer-events-none">
            <Wallet className="h-40 w-40 text-white" />
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Available Wallet Balance</span>
            {isLoading ? (
              <div className="h-8 bg-slate-800 rounded w-1/2 mt-1.5 animate-pulse"></div>
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">₦{balance.toLocaleString()}</div>
            )}
            <p className="text-[10px] text-slate-500 mt-1">Updates in real-time as agent operational fees are settled.</p>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-md">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Place Withdrawal Claim</h3>
          <form onSubmit={handleWithdraw} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Withdrawal Amount (₦) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter withdrawal amount in Naira"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? 'Placing withdrawal...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white">Wallet Transaction Logs</h3>
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                      <td className="py-2.5 px-3 text-right"><div className="h-3 bg-slate-800 rounded w-1/3 ml-auto"></div></td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No wallet transactions recorded.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any, idx: number) => {
                    const isDebit = tx.type === 'debit' || tx.type === 'withdraw' || tx.type === 'withdrawal';
                    const amountSign = isDebit ? '-' : '+';
                    const amountColor = isDebit ? 'text-rose-400' : 'text-emerald-400';
                    const Icon = isDebit ? ArrowUpRight : ArrowDownLeft;
                    const status = tx.status || 'approved';

                    return (
                      <tr key={tx._id || tx.id || idx} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 select-all">{tx._id || tx.id}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1">
                            <Icon className={`h-3.5 w-3.5 ${amountColor}`} />
                            <span className="capitalize font-semibold text-white">{tx.type}</span>
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 font-bold ${amountColor}`}>
                          {amountSign}₦{Math.abs(tx.amount).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            status === 'approved' || status === 'completed'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                              : status === 'pending'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                              : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                          }`}>
                            {status === 'approved' || status === 'completed' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : status === 'pending' ? (
                              <Clock className="h-3 w-3 animate-pulse" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}</td>
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
