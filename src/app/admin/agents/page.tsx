"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@context/ToastContext';
import { adminService } from '@/services/adminService';
import { Modal } from '@components/Common/Modal';
import { TableSkeleton } from '@components/Common/Skeleton';
import {
  Users,
  UserCheck,
  Search,
  RefreshCw,
  Award,
  Trash2,
  CheckCircle,
  Building,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  Wallet
} from 'lucide-react';

export default function AdminAgentsPage() {
  const { showToast } = useToast();
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Property Assignment Modal State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    agentId: '',
    propertyName: '',
    propertyNumber: ''
  });
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Credit Agent Wallet Modal State
  const [isCreditOpen, setIsCreditOpen] = useState(false);
  const [creditTarget, setCreditTarget] = useState<{ agentId: string; name: string } | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [isSubmittingCredit, setIsSubmittingCredit] = useState(false);

  const fetchAgents = async () => {
    setIsLoading(true);
    setCurrentPage(1);
    try {
      const res = await adminService.getAgents();

      const rawData = res?.data || res;
      const list = Array.isArray(rawData?.agents)
        ? rawData.agents
        : Array.isArray(res?.agents)
        ? res.agents
        : Array.isArray(rawData)
        ? rawData
        : Array.isArray(res)
        ? res
        : [];

      setAgentsList(list);
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to load agents list.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleApproveAgent = async (id: string, name: string) => {
    try {
      await adminService.approveAgent(id);
      showToast(`Agent "${name}" approved successfully!`, 'success');
      fetchAgents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to approve agent.', 'error');
    }
  };

  const handleDeleteAgent = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete agent "${name}"?`)) return;
    try {
      await adminService.deleteAgent(id);
      showToast(`Agent "${name}" deleted successfully!`, 'success');
      fetchAgents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete agent.', 'error');
    }
  };

  const handleAssignProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.agentId || !assignForm.propertyName || !assignForm.propertyNumber) {
      showToast('Please fill in Agent ID, Property Name, and Property Number.', 'error');
      return;
    }
    setIsSubmittingAssign(true);
    try {
      await adminService.assignPropertyToAgent(assignForm);
      showToast(`Property "${assignForm.propertyName}" assigned successfully!`, 'success');
      setIsAssignOpen(false);
      setAssignForm({ agentId: '', propertyName: '', propertyNumber: '' });
      fetchAgents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to assign property to agent.', 'error');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const handleCreditAgentWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(creditAmount);
    if (!creditTarget?.agentId || isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid numeric credit amount.', 'error');
      return;
    }
    setIsSubmittingCredit(true);
    try {
      const payload = {
        agentId: creditTarget.agentId,
        managerId: creditTarget.agentId,
        amount: amountNum,
        type: 'credit'
      };
      await adminService.creditWallet(payload);
      showToast(`Successfully credited ₦${amountNum.toLocaleString()} to ${creditTarget.name}'s wallet!`, 'success');
      setIsCreditOpen(false);
      setCreditAmount('');
      setCreditTarget(null);
      fetchAgents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to credit agent wallet.', 'error');
    } finally {
      setIsSubmittingCredit(false);
    }
  };

  const filteredAgents = agentsList.filter((item: any) => {
    const agentObj = item?.agent || item;
    const fullName = `${agentObj?.firstName || ''} ${agentObj?.lastName || ''} ${agentObj?.name || ''}`.toLowerCase();
    const email = (agentObj?.email || '').toLowerCase();
    const phone = (agentObj?.phone || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || email.includes(query) || phone.includes(query);
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
            <UserCheck className="h-3.5 w-3.5" /> Field Workforce Administration
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Agents Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, approve, assign assets, and monitor all registered field agents across the system.
          </p>
        </div>

        <button
          onClick={() => setIsAssignOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Building className="h-3.5 w-3.5" /> Assign Property to Agent
        </button>
      </div>

      {/* Directory Search & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search agent name, email, or phone..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchAgents}
            disabled={isLoading}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold self-end sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Directory
          </button>
        </div>

        {/* Directory Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Agent ID</th>
                  <th className="py-2.5 px-3">Agent Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {isLoading ? (
                  <TableSkeleton rows={4} cols={6} />
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No agent records found in the directory.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.slice((currentPage - 1) * 10, currentPage * 10).map((item: any, idx: number) => {
                    const agentObj = item?.agent || item;
                    const name = agentObj?.firstName ? `${agentObj.firstName} ${agentObj.lastName || ''}`.trim() : agentObj?.name || agentObj?.email || 'Unknown Agent';
                    const email = agentObj?.email || 'N/A';
                    const phone = agentObj?.phone || 'N/A';
                    const isApproved = agentObj?.isApproved ?? item?.isApproved ?? false;
                    const agentId = agentObj?._id || agentObj?.id || item?._id || item?.id || 'N/A';

                    return (
                      <tr key={agentId !== 'N/A' ? agentId : idx} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 select-all">{agentId}</td>
                        <td className="py-2.5 px-3 font-semibold text-white">{name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{email}</td>
                        <td className="py-2.5 px-3 text-slate-300">{phone}</td>
                        <td className="py-2.5 px-3">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                              <ShieldCheck className="h-3 w-3" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded">
                              <ShieldAlert className="h-3 w-3" /> Pending Approval
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            {!isApproved && (
                              <button
                                onClick={() => handleApproveAgent(agentId, name)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap shrink-0"
                                title="Approve Agent"
                              >
                                <CheckCircle className="h-3 w-3 shrink-0" /> Approve
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setCreditTarget({ agentId, name });
                                setIsCreditOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap shrink-0"
                              title="Add Funds to Agent Wallet"
                            >
                              <Wallet className="h-3 w-3 shrink-0 text-emerald-400" /> Add Funds
                            </button>
                            <button
                              onClick={() => {
                                setAssignForm(prev => ({ ...prev, agentId }));
                                setIsAssignOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap shrink-0"
                              title="Assign Property"
                            >
                              <Building className="h-3 w-3 shrink-0" /> Assign Property
                            </button>
                            <button
                              onClick={() => handleDeleteAgent(agentId, name)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-200 bg-rose-950/40 border border-rose-800/50 px-2 py-1 rounded-md cursor-pointer whitespace-nowrap shrink-0"
                              title="Delete Agent"
                            >
                              <Trash2 className="h-3 w-3 shrink-0" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredAgents.length > 10 && (
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
                Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{Math.ceil(filteredAgents.length / 10)}</span>
              </span>
              <button
                type="button"
                disabled={currentPage === Math.ceil(filteredAgents.length / 10)}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAgents.length / 10)))}
                className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN PROPERTY MODAL */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Property directly to Agent">
        <form onSubmit={handleAssignProperty} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Target Agent *</label>
            <select
              required
              value={assignForm.agentId}
              onChange={e => setAssignForm(prev => ({ ...prev, agentId: e.target.value }))}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="" className="bg-slate-950 text-slate-500">-- Select Agent --</option>
              {agentsList.map((item: any) => {
                const agentObj = item?.agent || item;
                const name = agentObj?.firstName ? `${agentObj.firstName} ${agentObj.lastName || ''}`.trim() : agentObj?.name || agentObj?.email;
                const id = agentObj?._id || agentObj?.id || item?._id || item?.id;
                return (
                  <option key={id} value={id} className="bg-slate-950 text-white">
                    {name} — ID: {id}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Property Name *</label>
            <input
              type="text"
              required
              value={assignForm.propertyName}
              onChange={e => setAssignForm(prev => ({ ...prev, propertyName: e.target.value }))}
              placeholder="e.g. Royal Palm Estate Plaza"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Property Number *</label>
            <input
              type="text"
              required
              value={assignForm.propertyNumber}
              onChange={e => setAssignForm(prev => ({ ...prev, propertyNumber: e.target.value }))}
              placeholder="e.g. PR-8902"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingAssign}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingAssign ? 'Assigning...' : 'Assign Property'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREDIT AGENT WALLET MODAL */}
      <Modal
        isOpen={isCreditOpen}
        onClose={() => {
          setIsCreditOpen(false);
          setCreditTarget(null);
        }}
        title={`Add Funds to ${creditTarget?.name || 'Agent'}`}
      >
        <form onSubmit={handleCreditAgentWallet} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Target Agent ID</label>
            <input
              type="text"
              readOnly
              disabled
              value={creditTarget?.agentId || ''}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Credit Amount (₦) *</label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={creditAmount}
              onChange={e => setCreditAmount(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none font-bold"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsCreditOpen(false);
                setCreditTarget(null);
              }}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingCredit}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Wallet className="h-3.5 w-3.5" />
              {isSubmittingCredit ? 'Crediting...' : 'Add Funds'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
