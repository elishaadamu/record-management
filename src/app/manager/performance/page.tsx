"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@context/ToastContext';
import { useAuth } from '@context/AuthContext';
import { managerService } from '@/services/managerService';
import { Modal } from '@components/Common/Modal';
import {
  Users,
  PlusCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Award,
  ShieldAlert,
  Search,
  UserCheck
} from 'lucide-react';

export default function ManagerPerformancePage() {
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Agent Creation form state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [agentForm, setAgentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'agent',
    managerId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPerformance = async () => {
    setIsLoading(true);
    setCurrentPage(1);
    try {
      const res = await managerService.getAgentsPerformance();
      let list = res?.data || res?.agents || res;
      if (list && !Array.isArray(list) && typeof list === 'object') {
        const possibleArray = Object.values(list).find(val => Array.isArray(val));
        if (possibleArray) {
          list = possibleArray;
        } else if (Array.isArray(list.data)) {
          list = list.data;
        }
      }
      setAgentsList(Array.isArray(list) ? list : []);
    } catch (e: any) {
      // Quiet fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentForm.firstName || !agentForm.lastName || !agentForm.email || !agentForm.phone || !agentForm.password) {
      showToast('All fields are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...agentForm,
      managerId: agentForm.managerId || currentUser?.id || ''
    };
    console.log('Registering Agent Payload:', payload);
    try {
      const response = await managerService.registerAgent(payload);
      console.log('Registering Agent Response:', response);
      showToast(`Agent "${agentForm.firstName} ${agentForm.lastName}" registered successfully!`, 'success');
      setAgentForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'agent',
        managerId: ''
      });
      setIsRegisterOpen(false);
      fetchPerformance();
    } catch (err: any) {
      console.error('Registering Agent Error:', err);
      showToast(err?.message || 'Failed to register agent.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAgents = agentsList.filter((a: any) => {
    const fullName = `${a.firstName || ''} ${a.lastName || ''} ${a.name || ''}`.toLowerCase();
    const email = (a.email || '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
            <Users className="h-3.5 w-3.5" /> Team Supervision
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Agents Performance Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Register new field agents and monitor operational tasks execution and performance metrics.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="h-3.5 w-3.5" /> Register Agent
        </button>
      </div>

      {/* Agents Search & Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search agent name or email..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchPerformance}
            disabled={isLoading}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold self-end sm:self-auto"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Performance
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
                  <th className="py-2.5 px-3">Active Tasks</th>
                  <th className="py-2.5 px-3 text-right">Performance Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-2/3"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-3/4"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                      <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                      <td className="py-2.5 px-3 text-right"><div className="h-4 bg-slate-800 rounded w-10 ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No agent records found in the directory.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.slice((currentPage - 1) * 10, currentPage * 10).map((agent: any, idx: number) => {
                    const name = agent.firstName ? `${agent.firstName} ${agent.lastName || ''}`.trim() : agent.name || agent.email;
                    const performanceScore = agent.performanceScore ?? agent.score ?? 100;
                    return (
                      <tr key={agent.id || agent._id || idx} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 select-all">{agent._id || agent.id || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-semibold text-white">{name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{agent.email}</td>
                        <td className="py-2.5 px-3 text-slate-300">{agent.phone || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-medium">{agent.activeTasks ?? agent.tasksCount ?? 0}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-0.5 font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded text-[10px]">
                            <Award className="h-3 w-3" /> {performanceScore}%
                          </span>
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

      {/* REGISTER AGENT MODAL */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register Agent Account">
        <form onSubmit={handleRegisterAgent} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">First Name *</label>
              <input
                type="text"
                required
                value={agentForm.firstName}
                onChange={e => setAgentForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={agentForm.lastName}
                onChange={e => setAgentForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={agentForm.email}
              onChange={e => setAgentForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={agentForm.phone}
                onChange={e => setAgentForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={agentForm.password}
                  onChange={e => setAgentForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-3 pr-10 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Manager ID</label>
            <input
              type="text"
              placeholder={currentUser?.id || "e.g. u-102"}
              value={agentForm.managerId}
              onChange={e => setAgentForm(prev => ({ ...prev, managerId: e.target.value }))}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">Defaults to your manager ID ({currentUser?.id || 'current manager'}) if left blank.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Registering...' : 'Register Agent'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
