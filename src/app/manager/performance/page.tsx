"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@context/ToastContext';
import { useAuth } from '@context/AuthContext';
import { managerService } from '@/services/managerService';
import { Modal } from '@components/Common/Modal';
import { NIGERIAN_STATES, NIGERIA_STATES_AND_LGAS, getLgasForState } from '@/data/nigeriaStatesLga';
import {
  Users,
  PlusCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Award,
  ShieldAlert,
  Search,
  UserCheck,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  UserPlus
} from 'lucide-react';

export default function ManagerPerformancePage() {
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // LocalStorage keys for agent registration draft
  const STORAGE_KEY_REGISTER_AGENT_FORM = 'manager_register_agent_form_draft';
  const STORAGE_KEY_REGISTER_AGENT_TAB = 'manager_register_agent_tab_draft';

  // Agent Creation Tab step state
  const [registerAgentTab, setRegisterAgentTab] = useState<'account' | 'personal' | 'bank' | 'guarantor' | 'nextOfKin' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(STORAGE_KEY_REGISTER_AGENT_TAB) as any;
      if (['account', 'personal', 'bank', 'guarantor', 'nextOfKin', 'system'].includes(savedTab)) {
        return savedTab;
      }
    }
    return 'account';
  });

  // Nigerian States & LGAs
  const [statesList, setStatesList] = useState<string[]>(NIGERIAN_STATES);
  const [lgasMap, setLgasMap] = useState<Record<string, string[]>>(NIGERIA_STATES_AND_LGAS);

  // Agent Creation form state (All 21 fields with localStorage persistence)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [agentForm, setAgentForm] = useState(() => {
    const defaultData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'agent',
      gender: 'Male',
      dob: '',
      maritalStatus: 'Single',
      address: '',
      state: '',
      lga: '',
      bankName: '',
      accNumber: '',
      accountName: '',
      nin: '',
      passportPhoto: '',
      guarantors: [
        { name: '', phone: '', address: '', state: '', lga: '', relationship: '' }
      ],
      nextOfKin: { name: '', phone: '', address: '', state: '', lga: '', relationship: '' },
      createdBy: '',
      managerId: ''
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_REGISTER_AGENT_FORM);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaultData, ...parsed, password: '', role: 'agent' };
        }
      } catch (e) {
        // Quiet fail
      }
    }
    return defaultData;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save form draft to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { password, ...safeDraft } = agentForm;
      localStorage.setItem(STORAGE_KEY_REGISTER_AGENT_FORM, JSON.stringify(safeDraft));
    }
  }, [agentForm]);

  // Save current step tab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_REGISTER_AGENT_TAB, registerAgentTab);
    }
  }, [registerAgentTab]);

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

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 50KB = 50 * 1024 bytes)
    const maxSizeBytes = 50 * 1024;
    if (file.size > maxSizeBytes) {
      showToast(`Image size (${(file.size / 1024).toFixed(1)}KB) exceeds 50KB limit. Please choose a smaller photo.`, 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setAgentForm(prev => ({ ...prev, passportPhoto: base64String }));
      showToast('Passport photo uploaded successfully', 'success');
    };
    reader.onerror = () => {
      showToast('Failed to process passport photo file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentForm.firstName || !agentForm.lastName || !agentForm.email || !agentForm.phone || !agentForm.password) {
      showToast('Please fill in required fields (First Name, Last Name, Email, Phone, Password).', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload: any = {
      ...agentForm,
      role: 'agent',
      managerId: agentForm.managerId || currentUser?.id || '',
      createdBy: agentForm.createdBy || currentUser?.id || currentUser?.name || currentUser?.email || 'manager'
    };

    // Remove empty string managerId so MongoDB Mongoose does not attempt Cast to ObjectId
    if (!payload.managerId || (typeof payload.managerId === 'string' && !payload.managerId.trim())) {
      delete payload.managerId;
    }

    // Check Guarantor Name requirement
    if (payload.guarantors && Array.isArray(payload.guarantors) && payload.guarantors.length > 0) {
      const g = payload.guarantors[0];
      const hasAnyGuarantorData = g.name || g.phone || g.address || g.state || g.lga || g.relationship;
      if (hasAnyGuarantorData && !g.name?.trim()) {
        showToast('Guarantor Name is required in the Guarantor tab.', 'error');
        setRegisterAgentTab('guarantor');
        setIsSubmitting(false);
        return;
      }
      if (!hasAnyGuarantorData) {
        delete payload.guarantors;
      }
    }

    // Remove empty nextOfKin object if no fields were provided
    if (payload.nextOfKin) {
      const nok = payload.nextOfKin;
      if (!nok.name && !nok.phone && !nok.address && !nok.state && !nok.lga && !nok.relationship) {
        delete payload.nextOfKin;
      }
    }

    console.log('=== [ManagerPerformancePage] Register Agent Payload ===', payload);
    try {
      const response = await managerService.registerAgent(payload);
      console.log('=== [ManagerPerformancePage] Register Agent Response ===', response);
      showToast(`Agent "${agentForm.firstName} ${agentForm.lastName}" registered successfully!`, 'success');
      setAgentForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'agent',
        gender: 'Male',
        dob: '',
        maritalStatus: 'Single',
        address: '',
        state: '',
        lga: '',
        bankName: '',
        accNumber: '',
        accountName: '',
        nin: '',
        passportPhoto: '',
        guarantors: [
          { name: '', phone: '', address: '', state: '', lga: '', relationship: '' }
        ],
        nextOfKin: { name: '', phone: '', address: '', state: '', lga: '', relationship: '' },
        createdBy: '',
        managerId: ''
      });
      setRegisterAgentTab('account');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_REGISTER_AGENT_FORM);
        localStorage.removeItem(STORAGE_KEY_REGISTER_AGENT_TAB);
      }
      setIsRegisterOpen(false);
      fetchPerformance();
    } catch (err: any) {
      console.error('=== [ManagerPerformancePage] Register Agent Error ===', err);
      console.error('=== [ManagerPerformancePage] Register Agent Error Details ===', err?.response?.data || err?.response || err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to register agent.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAgents = agentsList.filter((a: any) => {
    const fullName = `${a.firstName || ''} ${a.lastName || ''} ${a.name || ''}`.toLowerCase();
    const email = (a.email || '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const AGENT_TABS: ('account' | 'personal' | 'bank' | 'guarantor' | 'nextOfKin' | 'system')[] = [
    'account', 'personal', 'bank', 'guarantor', 'nextOfKin', 'system'
  ];

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
        <div className="space-y-4 text-xs">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setRegisterAgentTab('account')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${registerAgentTab === 'account'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Account Credentials
            </button>
            <button
              type="button"
              onClick={() => setRegisterAgentTab('personal')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${registerAgentTab === 'personal'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Personal & Address
            </button>
            <button
              type="button"
              onClick={() => setRegisterAgentTab('bank')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${registerAgentTab === 'bank'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Bank Account
            </button>
            <button
              type="button"
              onClick={() => setRegisterAgentTab('guarantor')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${registerAgentTab === 'guarantor'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Guarantor
            </button>
            <button
              type="button"
              onClick={() => setRegisterAgentTab('nextOfKin')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${registerAgentTab === 'nextOfKin'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Next of Kin
            </button>
            <button
              type="button"
              onClick={() => setRegisterAgentTab('system')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${registerAgentTab === 'system'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              System Info
            </button>
          </div>

          <form onSubmit={handleRegisterAgent} className="space-y-4">
            {/* TAB 1: Account Credentials */}
            {registerAgentTab === 'account' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={agentForm.firstName}
                      onChange={e => setAgentForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="e.g. Jane"
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
                      placeholder="e.g. Smith"
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
                    placeholder="agent@example.com"
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
                      placeholder="08012345678"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Role</label>
                    <input
                      type="text"
                      disabled
                      value={agentForm.role}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 px-3 text-xs text-slate-400 cursor-not-allowed capitalize"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Passport Photo (JPG, PNG, WEBP — Max 50KB)
                    </label>
                    <div className="flex items-center gap-3 mt-1">
                      {agentForm.passportPhoto ? (
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                          <img src={agentForm.passportPhoto} alt="Passport Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setAgentForm(prev => ({ ...prev, passportPhoto: '' }))}
                            className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-bl hover:bg-red-700 cursor-pointer"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg border border-dashed border-slate-800 bg-slate-950 flex items-center justify-center text-slate-500 shrink-0">
                          <UserIcon className="w-5 h-5 text-slate-500" />
                        </div>
                      )}

                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handlePassportUpload}
                          className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          {agentForm.passportPhoto ? 'Photo selected. Choose another file to replace.' : 'Max size: 50KB'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Personal Details & Location */}
            {registerAgentTab === 'personal' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Gender</label>
                    <select
                      value={agentForm.gender}
                      onChange={e => setAgentForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={agentForm.dob}
                      onChange={e => setAgentForm(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Marital Status</label>
                    <select
                      value={agentForm.maritalStatus}
                      onChange={e => setAgentForm(prev => ({ ...prev, maritalStatus: e.target.value }))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">NIN (National Identity Number)</label>
                  <input
                    type="text"
                    value={agentForm.nin}
                    onChange={e => setAgentForm(prev => ({ ...prev, nin: e.target.value }))}
                    placeholder="11-digit NIN"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    value={agentForm.address}
                    onChange={e => setAgentForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Residential address"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">State</label>
                    <select
                      value={agentForm.state}
                      onChange={e => setAgentForm(prev => ({ ...prev, state: e.target.value, lga: '' }))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">-- Select State --</option>
                      {statesList.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">LGA</label>
                    <select
                      value={agentForm.lga}
                      onChange={e => setAgentForm(prev => ({ ...prev, lga: e.target.value }))}
                      disabled={!agentForm.state}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="">-- Select LGA --</option>
                      {(agentForm.state && lgasMap[agentForm.state] ? lgasMap[agentForm.state] : getLgasForState(agentForm.state)).map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Financial & Bank Details */}
            {registerAgentTab === 'bank' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={agentForm.bankName}
                    onChange={e => setAgentForm(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="e.g. Access Bank, Zenith Bank"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Account Number</label>
                    <input
                      type="text"
                      value={agentForm.accNumber}
                      onChange={e => setAgentForm(prev => ({ ...prev, accNumber: e.target.value }))}
                      placeholder="10-digit account number"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Account Name</label>
                    <input
                      type="text"
                      value={agentForm.accountName}
                      onChange={e => setAgentForm(prev => ({ ...prev, accountName: e.target.value }))}
                      placeholder="Account holder name"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Guarantor Details */}
            {registerAgentTab === 'guarantor' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                  <h4 className="text-[11px] font-bold text-indigo-400 uppercase">Guarantor Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Guarantor Name *</label>
                      <input
                        type="text"
                        value={agentForm.guarantors[0]?.name || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => {
                            const g = [...prev.guarantors];
                            g[0] = { ...g[0], name: val };
                            return { ...prev, guarantors: g };
                          });
                        }}
                        placeholder="Full name"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Guarantor Phone</label>
                      <input
                        type="tel"
                        value={agentForm.guarantors[0]?.phone || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => {
                            const g = [...prev.guarantors];
                            g[0] = { ...g[0], phone: val };
                            return { ...prev, guarantors: g };
                          });
                        }}
                        placeholder="Phone number"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Relationship</label>
                      <input
                        type="text"
                        value={agentForm.guarantors[0]?.relationship || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => {
                            const g = [...prev.guarantors];
                            g[0] = { ...g[0], relationship: val };
                            return { ...prev, guarantors: g };
                          });
                        }}
                        placeholder="e.g. Brother, Employer"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Address</label>
                      <input
                        type="text"
                        value={agentForm.guarantors[0]?.address || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => {
                            const g = [...prev.guarantors];
                            g[0] = { ...g[0], address: val };
                            return { ...prev, guarantors: g };
                          });
                        }}
                        placeholder="Guarantor address"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">State</label>
                      <select
                        value={agentForm.guarantors[0]?.state || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => {
                            const g = [...prev.guarantors];
                            g[0] = { ...g[0], state: val, lga: '' };
                            return { ...prev, guarantors: g };
                          });
                        }}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">-- Select State --</option>
                        {statesList.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">LGA</label>
                      <select
                        value={agentForm.guarantors[0]?.lga || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => {
                            const g = [...prev.guarantors];
                            g[0] = { ...g[0], lga: val };
                            return { ...prev, guarantors: g };
                          });
                        }}
                        disabled={!agentForm.guarantors[0]?.state}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">-- Select LGA --</option>
                        {(agentForm.guarantors[0]?.state && lgasMap[agentForm.guarantors[0].state] ? lgasMap[agentForm.guarantors[0].state] : getLgasForState(agentForm.guarantors[0]?.state || '')).map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Next of Kin Details */}
            {registerAgentTab === 'nextOfKin' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                  <h4 className="text-[11px] font-bold text-indigo-400 uppercase">Next of Kin Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        value={agentForm.nextOfKin?.name || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => ({
                            ...prev,
                            nextOfKin: { ...prev.nextOfKin, name: val }
                          }));
                        }}
                        placeholder="Next of Kin Name"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={agentForm.nextOfKin?.phone || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => ({
                            ...prev,
                            nextOfKin: { ...prev.nextOfKin, phone: val }
                          }));
                        }}
                        placeholder="Phone Number"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Relationship</label>
                      <input
                        type="text"
                        value={agentForm.nextOfKin?.relationship || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => ({
                            ...prev,
                            nextOfKin: { ...prev.nextOfKin, relationship: val }
                          }));
                        }}
                        placeholder="e.g. Spouse, Sister"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Address</label>
                      <input
                        type="text"
                        value={agentForm.nextOfKin?.address || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => ({
                            ...prev,
                            nextOfKin: { ...prev.nextOfKin, address: val }
                          }));
                        }}
                        placeholder="Residential Address"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">State</label>
                      <select
                        value={agentForm.nextOfKin?.state || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => ({
                            ...prev,
                            nextOfKin: { ...prev.nextOfKin, state: val, lga: '' }
                          }));
                        }}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">-- Select State --</option>
                        {statesList.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">LGA</label>
                      <select
                        value={agentForm.nextOfKin?.lga || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setAgentForm(prev => ({
                            ...prev,
                            nextOfKin: { ...prev.nextOfKin, lga: val }
                          }));
                        }}
                        disabled={!agentForm.nextOfKin?.state}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">-- Select LGA --</option>
                        {(agentForm.nextOfKin?.state && lgasMap[agentForm.nextOfKin.state] ? lgasMap[agentForm.nextOfKin.state] : getLgasForState(agentForm.nextOfKin?.state || '')).map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: System & Administration */}
            {registerAgentTab === 'system' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Assigned Manager ID</label>
                  <input
                    type="text"
                    value={agentForm.managerId || currentUser?.id || ''}
                    onChange={e => setAgentForm(prev => ({ ...prev, managerId: e.target.value }))}
                    placeholder={currentUser?.id || "e.g. u-102"}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Defaults to your manager ID ({currentUser?.id || 'current manager'}) if left blank.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Created By / Registered By</label>
                  <input
                    type="text"
                    value={agentForm.createdBy || currentUser?.name || currentUser?.id || 'Manager'}
                    onChange={e => setAgentForm(prev => ({ ...prev, createdBy: e.target.value }))}
                    placeholder="Manager Identifier"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-2">
              <div>
                {registerAgentTab !== 'account' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = AGENT_TABS.indexOf(registerAgentTab);
                      if (idx > 0) setRegisterAgentTab(AGENT_TABS[idx - 1]);
                    }}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(false)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white border border-slate-800/80 bg-slate-950/60 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {registerAgentTab !== 'system' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = AGENT_TABS.indexOf(registerAgentTab);
                      if (idx < AGENT_TABS.length - 1) setRegisterAgentTab(AGENT_TABS[idx + 1]);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    Next Step
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Registering Agent...' : 'Register Agent'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
