"use client";

import React, { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { useToast } from '@context/ToastContext';
import { Modal } from '@components/Common/Modal';
import { TableSkeleton } from '@components/Common/Skeleton';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AgentWalletPage() {
  const { showToast } = useToast();
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Withdrawal modal state
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWallet = async () => {
    setIsLoading(true);
    try {
      const res = await agentService.getWalletInfo();
      setWalletData(res?.data || res);
    } catch (err: any) {
      showToast(err?.message || 'Failed to fetch agent wallet details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(withdrawAmount);
    if (!withdrawAmount || isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { amount: numAmount };
      const res = await agentService.placeWithdrawal(payload);
      showToast(res?.message || 'Withdrawal request submitted successfully!', 'success');
      setWithdrawAmount('');
      setIsWithdrawOpen(false);
      fetchWallet();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to submit withdrawal request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const balance = walletData?.balance ?? walletData?.wallet?.balance ?? walletData?.amount ?? 0;
  const history = Array.isArray(walletData?.history)
    ? walletData.history
    : Array.isArray(walletData?.transactions)
    ? walletData.transactions
    : [];

  const calculatedPending = history
    .filter((tx: any) => (tx.status || '').toLowerCase() === 'pending')
    .reduce((sum: number, tx: any) => sum + Math.abs(Number(tx.amount) || 0), 0);

  const pending = walletData?.pendingBalance ?? walletData?.pendingWithdrawals ?? calculatedPending;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-6 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Wallet className="h-4 w-4" /> Agent Financial Operations
          </div>
          <h1 className="text-2xl font-extrabold text-white">Agent Wallet & Payouts</h1>
          <p className="text-xs text-slate-300 mt-1">
            View your operational wallet balance, track history, and request fund payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWallet}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" /> Request Payout / Withdraw
          </button>
        </div>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-emerald-800/50 bg-slate-900/90 p-6 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <span>Available Balance</span>
          </div>
          <div className="text-3xl font-black text-white mt-3">
            {isLoading ? '...' : `₦${Number(balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
          </div>
          <p className="text-xs text-slate-400 mt-1">Ready for withdrawal to registered bank account</p>
        </div>

        <div className="rounded-2xl border border-amber-800/50 bg-slate-900/90 p-6 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
            <span>Pending Payout Requests</span>
          </div>
          <div className="text-3xl font-black text-white mt-3">
            {isLoading ? '...' : `₦${Number(pending).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
          </div>
          <p className="text-xs text-slate-400 mt-1">Withdrawals awaiting supervisor approval</p>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Agent Transaction & Payout History</h2>
          <span className="text-xs text-slate-400">{history.length} Record(s)</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {isLoading ? (
                  <TableSkeleton rows={4} cols={5} />
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No transaction records logged in your agent wallet yet.
                    </td>
                  </tr>
                ) : (
                  history.slice((currentPage - 1) * 10, currentPage * 10).map((tx: any, idx: number) => {
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
                        <td className="py-3 px-4 font-bold">
                          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                            isCredit
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                          }`}>
                            {isCredit ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {tx.type || 'Withdrawal'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-300">{tx.description || tx.memo || 'Agent Withdrawal Request'}</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : tx.date || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded ${statusBadgeStyle}`}>
                            {tx.status || 'Pending'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {isCredit ? '+' : '-'}₦{Number(tx.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {history.length > 10 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/40 text-[11px]">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
              >
                Previous
              </button>
              <span className="text-slate-400">
                Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{Math.ceil(history.length / 10)}</span>
              </span>
              <button
                type="button"
                disabled={currentPage === Math.ceil(history.length / 10)}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(history.length / 10)))}
                className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      <Modal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} title="Place Agent Withdrawal Request">
        <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Available Wallet Balance</div>
            <div className="text-xl font-bold text-emerald-400">
              ₦{Number(balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Withdrawal Amount (₦) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(false)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {isSubmitting ? 'Submitting...' : 'Submit Withdrawal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
