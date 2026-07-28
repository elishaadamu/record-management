import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { Modal } from '@components/Common/Modal';
import { adminService } from '@/services/adminService';
import { NIGERIAN_STATES, NIGERIA_STATES_AND_LGAS, getLgasForState } from '@/data/nigeriaStatesLga';
import {
  Shield,
  BarChart3,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  CheckCircle2,
  PlusCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  UserCheck,
  Send,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  User as UserIcon,
  CreditCard,
  MapPin,
  FileText,
  UserPlus,
  Briefcase
} from 'lucide-react';

interface AdminDashboardProps {
  activeSection?: 'er' | 'managers' | 'wallet' | 'withdrawals' | 'properties';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeSection = 'er' }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'er' | 'managers' | 'wallet' | 'withdrawals' | 'properties'>(activeSection);

  useEffect(() => {
    setActiveTab(activeSection);
  }, [activeSection]);

  // 1. ER Stats State
  const [erTotal, setErTotal] = useState<any>(null);
  const [erWeekly, setErWeekly] = useState<any>(null);
  const [erMonthly, setErMonthly] = useState<any>(null);
  const [isLoadingEr, setIsLoadingEr] = useState(false);

  // 2. Managers State
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false);
  const [selectedManagerDetails, setSelectedManagerDetails] = useState<any>(null);
  const [isLoadingManagerDetails, setIsLoadingManagerDetails] = useState(false);
  const STORAGE_KEY_CREATE_MANAGER_FORM = 'admin_create_manager_form_draft';
  const STORAGE_KEY_CREATE_MANAGER_TAB = 'admin_create_manager_tab_draft';

  const [createManagerTab, setCreateManagerTab] = useState<'account' | 'personal' | 'bank' | 'guarantor' | 'nextOfKin' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(STORAGE_KEY_CREATE_MANAGER_TAB) as any;
      if (['account', 'personal', 'bank', 'guarantor', 'nextOfKin', 'system'].includes(savedTab)) {
        return savedTab;
      }
    }
    return 'account';
  });

  // Nigerian States and LGAs (Initialized with complete static dataset for immediate rendering)
  const [statesList, setStatesList] = useState<string[]>(NIGERIAN_STATES);
  const [lgasMap, setLgasMap] = useState<Record<string, string[]>>(NIGERIA_STATES_AND_LGAS);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [loadingLgasFor, setLoadingLgasFor] = useState<Record<string, boolean>>({});

  // Create Manager Form State (All 21 fields with localStorage persistence)
  const [managerForm, setManagerForm] = useState(() => {
    const defaultData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'manager',
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
        const saved = localStorage.getItem(STORAGE_KEY_CREATE_MANAGER_FORM);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaultData, ...parsed, password: '', role: 'manager' };
        }
      } catch (e) {
        // Quiet fail
      }
    }
    return defaultData;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { password, ...safeDraft } = managerForm;
      localStorage.setItem(STORAGE_KEY_CREATE_MANAGER_FORM, JSON.stringify(safeDraft));
    }
  }, [managerForm]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CREATE_MANAGER_TAB, createManagerTab);
    }
  }, [createManagerTab]);

  const [isSubmittingManager, setIsSubmittingManager] = useState(false);
  const [showManagerPassword, setShowManagerPassword] = useState(false);

  // 3. Wallet Operations State
  const [walletForm, setWalletForm] = useState({
    userId: '',
    amount: '',
    description: '',
    type: 'credit' as 'credit' | 'debit'
  });
  const [isSubmittingWallet, setIsSubmittingWallet] = useState(false);

  // 4. Pending Withdrawals State
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
  const [approvingWithdrawalId, setApprovingWithdrawalId] = useState<string | null>(null);

  // 5. Properties State
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [assignForm, setAssignForm] = useState({
    agentId: '',
    propertyName: '',
    propertyNumber: ''
  });
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Pagination states (10 per page)
  const [erUsersPage, setErUsersPage] = useState(1);
  const [managersPage, setManagersPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [propertiesPage, setPropertiesPage] = useState(1);

  // Data Fetchers
  const fetchErStats = async () => {
    setIsLoadingEr(true);
    setErUsersPage(1);
    try {
      const [totalRes, weeklyRes, monthlyRes] = await Promise.allSettled([
        adminService.getErTotal(),
        adminService.getErWeekly(),
        adminService.getErMonthly()
      ]);
      if (totalRes.status === 'fulfilled') {
        const totalVal = totalRes.value?.data || totalRes.value;
        setErTotal(totalVal);
      }
      if (weeklyRes.status === 'fulfilled') {
        const weeklyVal = weeklyRes.value?.data || weeklyRes.value;
        setErWeekly(weeklyVal);
      }
      if (monthlyRes.status === 'fulfilled') {
        const monthlyVal = monthlyRes.value?.data || monthlyRes.value;
        setErMonthly(monthlyVal);
      }
    } catch (e: any) {
      // Quiet fail 
    } finally {
      setIsLoadingEr(false);
    }
  };

  const fetchManagers = async () => {
    setIsLoadingManagers(true);
    setManagersPage(1);
    try {
      const res = await adminService.getManagers();
      const list = res?.data || res?.managers || (Array.isArray(res) ? res : []);
      setManagers(list);
    } catch (e: any) {
      // Quiet fail
    } finally {
      setIsLoadingManagers(false);
    }
  };

  const fetchPendingWithdrawals = async () => {
    setIsLoadingWithdrawals(true);
    setWithdrawalsPage(1);
    try {
      const res = await adminService.getPendingWithdrawals();
      const list = res?.data || res?.withdrawals || (Array.isArray(res) ? res : []);
      setPendingWithdrawals(list);
    } catch (e: any) {
      // Quiet fail
    } finally {
      setIsLoadingWithdrawals(false);
    }
  };

  const fetchProperties = async () => {
    setIsLoadingProperties(true);
    setPropertiesPage(1);
    try {
      const res = await adminService.getProperties();
      const list = res?.data || res?.properties || (Array.isArray(res) ? res : []);
      setProperties(list);
    } catch (e: any) {
      // Quiet fail
    } finally {
      setIsLoadingProperties(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchStates = async () => {
      setIsLoadingStates(true);
      try {
        const response = await axios.get('https://nga-states-lga.onrender.com/fetch');
        let data = response.data;
        if (!Array.isArray(data) && data?.states) {
          data = data.states;
        }
        if (isMounted && Array.isArray(data)) {
          setStatesList(data);
        }
      } catch (err) {
        // Quiet fail
      } finally {
        if (isMounted) setIsLoadingStates(false);
      }
    };
    fetchStates();
    return () => { isMounted = false; };
  }, []);

  const loadLgasForState = async (stateName: string) => {
    if (!stateName || lgasMap[stateName]) return;
    setLoadingLgasFor(prev => ({ ...prev, [stateName]: true }));
    try {
      const response = await axios.get(`https://nga-states-lga.onrender.com/?state=${encodeURIComponent(stateName)}`);
      let data = response.data;
      if (!Array.isArray(data)) {
        data = data?.lgas || data?.lga || [];
      }
      if (Array.isArray(data)) {
        setLgasMap(prev => ({ ...prev, [stateName]: data }));
      }
    } catch (err) {
      // Quiet fail
    } finally {
      setLoadingLgasFor(prev => ({ ...prev, [stateName]: false }));
    }
  };

  useEffect(() => {
    if (managerForm.state) loadLgasForState(managerForm.state);
  }, [managerForm.state]);

  useEffect(() => {
    const gState = managerForm.guarantors?.[0]?.state;
    if (gState) loadLgasForState(gState);
  }, [managerForm.guarantors?.[0]?.state]);

  useEffect(() => {
    const nokState = managerForm.nextOfKin?.state;
    if (nokState) loadLgasForState(nokState);
  }, [managerForm.nextOfKin?.state]);

  useEffect(() => {
    fetchErStats();
    fetchManagers();
    fetchPendingWithdrawals();
    fetchProperties();
  }, []);

  // Handlers
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
      setManagerForm(prev => ({ ...prev, passportPhoto: base64String }));
      showToast('Passport photo uploaded successfully', 'success');
    };
    reader.onerror = () => {
      showToast('Failed to process passport photo file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerForm.firstName || !managerForm.lastName || !managerForm.email || !managerForm.phone || !managerForm.password) {
      showToast('Please fill in required fields (First Name, Last Name, Email, Phone, Password).', 'error');
      return;
    }
    setIsSubmittingManager(true);
    try {
      const payload: any = {
        ...managerForm,
        role: managerForm.role || 'manager',
        createdBy: managerForm.createdBy || currentUser?.id || currentUser?.name || currentUser?.email || 'admin'
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
          setCreateManagerTab('guarantor');
          setIsSubmittingManager(false);
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

      console.log('=== [AdminDashboard] Manager Creation Payload ===', payload);
      const res = await adminService.createManager(payload);
      console.log('=== [AdminDashboard] Manager Creation Success Response ===', res);
      showToast('Manager account created successfully!', 'success');
      setIsCreateManagerOpen(false);

      // Open manager details modal with the newly created manager object
      const createdObj = res?.data || res;
      setSelectedManagerDetails(createdObj);

      setManagerForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'manager',
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
      setCreateManagerTab('account');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_CREATE_MANAGER_FORM);
        localStorage.removeItem(STORAGE_KEY_CREATE_MANAGER_TAB);
      }
      fetchManagers();
    } catch (err: any) {
      console.error('=== [AdminDashboard] Manager Creation Error ===', err);
      console.error('=== [AdminDashboard] Manager Creation Error Details ===', err?.response?.data || err?.response || err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to create manager account', 'error');
    } finally {
      setIsSubmittingManager(false);
    }
  };

  const handleViewManagerDetails = async (id: string) => {
    setIsLoadingManagerDetails(true);
    setSelectedManagerDetails(null);
    try {
      const res = await adminService.getManagerDetails(id);
      setSelectedManagerDetails(res?.data || res);
    } catch (err: any) {
      showToast(err?.message || 'Failed to fetch manager details', 'error');
    } finally {
      setIsLoadingManagerDetails(false);
    }
  };

  const handleWalletOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletForm.userId || !walletForm.amount || !walletForm.description) {
      showToast('Please specify User ID, Amount, and Description.', 'error');
      return;
    }
    setIsSubmittingWallet(true);
    try {
      const payload = {
        userId: walletForm.userId,
        amount: Number(walletForm.amount) || walletForm.amount,
        description: walletForm.description
      };
      if (walletForm.type === 'credit') {
        await adminService.creditWallet(payload);
        showToast(`Successfully credited ₦${walletForm.amount} to user ${walletForm.userId}`, 'success');
      } else {
        await adminService.debitWallet(payload);
        showToast(`Successfully debited ₦${walletForm.amount} from user ${walletForm.userId}`, 'success');
      }
      setWalletForm(prev => ({
        userId: '',
        amount: '',
        description: '',
        type: prev.type
      }));
    } catch (err: any) {
      showToast(err?.message || 'Wallet operation failed', 'error');
    } finally {
      setIsSubmittingWallet(false);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    setApprovingWithdrawalId(id);
    try {
      await adminService.approveWithdrawal(id);
      showToast('Withdrawal approved successfully!', 'success');
      fetchPendingWithdrawals();
    } catch (err: any) {
      showToast(err?.message || 'Failed to approve withdrawal', 'error');
    } finally {
      setApprovingWithdrawalId(null);
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
      setAssignForm({ agentId: '', propertyName: '', propertyNumber: '' });
      fetchProperties();
    } catch (err: any) {
      showToast(err?.message || 'Failed to assign property to agent', 'error');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Extract count numbers safely
  const getNumVal = (obj: any) => {
    if (typeof obj === 'number') return obj;
    if (!obj) return 0;
    return obj.totalER ?? obj.weeklyER ?? obj.monthlyER ?? obj.total ?? obj.count ?? obj.value ?? 0;
  };

  const getUserName = (w: any) => {
    if (!w) return 'N/A';
    if (typeof w.userName === 'string' && w.userName) return w.userName;
    const userObj = w.userId || w.user;
    if (userObj && typeof userObj === 'object') {
      if (userObj.firstName || userObj.lastName) {
        return `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim();
      }
      return userObj.email || userObj.name || 'N/A';
    }
    if (typeof w.email === 'string' && w.email) return w.email;
    if (typeof w.userId === 'string') return w.userId;
    return 'N/A';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
            <Shield className="h-3.5 w-3.5" /> System Administrator Dashboard
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome, {currentUser?.name || 'Admin'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage ER Analytics, Managers, Wallet Funds, Pending Withdrawals, and Property Assignments.
          </p>
        </div>

        <button
          onClick={() => setIsCreateManagerOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="h-3.5 w-3.5" /> Create Manager
        </button>
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



      {/* TAB 1: ER OVERVIEW */}
      {activeTab === 'er' && (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total ER Stats</span>
              <p className="text-xl font-bold text-white mt-1">{getNumVal(erTotal)}</p>
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between"><span>Total Count:</span> <span className="font-semibold text-white">{getNumVal(erTotal)}</span></div>
                <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-400 font-semibold">Active</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Weekly ER Stats</span>
              <p className="text-xl font-bold text-white mt-1">{getNumVal(erWeekly)}</p>
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between"><span>Weekly Count:</span> <span className="font-semibold text-white">{getNumVal(erWeekly)}</span></div>
                <div className="flex justify-between"><span>Status:</span> <span className="text-indigo-400 font-semibold">Updated</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly ER Stats</span>
              <p className="text-xl font-bold text-white mt-1">{getNumVal(erMonthly)}</p>
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between"><span>Monthly Count:</span> <span className="font-semibold text-white">{getNumVal(erMonthly)}</span></div>
                <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-400 font-semibold">Updated</span></div>
              </div>
            </div>
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

          {/* Quick Portal Navigation */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Portal Navigation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => { setActiveTab('managers'); window.scrollTo(0, 0); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-all flex flex-col justify-between text-left h-24 group cursor-pointer"
              >
                <Users className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div className="flex items-center justify-between w-full mt-auto">
                  <span className="text-[11px] font-bold text-slate-200">Managers Directory</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('wallet'); window.scrollTo(0, 0); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-all flex flex-col justify-between text-left h-24 group cursor-pointer"
              >
                <Wallet className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div className="flex items-center justify-between w-full mt-auto">
                  <span className="text-[11px] font-bold text-slate-200">Wallet Operations</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('withdrawals'); window.scrollTo(0, 0); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-all flex flex-col justify-between text-left h-24 group cursor-pointer"
              >
                <Clock className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div className="flex items-center justify-between w-full mt-auto">
                  <span className="text-[11px] font-bold text-slate-200">Withdrawals Queue</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('properties'); window.scrollTo(0, 0); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-all flex flex-col justify-between text-left h-24 group cursor-pointer"
              >
                <Building className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div className="flex items-center justify-between w-full mt-auto">
                  <span className="text-[11px] font-bold text-slate-200">Assign Properties</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
                </div>
              </button>
            </div>
          </div>

          {/* Grid of Summarized Tables: Recent Properties & Pending Withdrawals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Withdrawals Summary table */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-400" /> Pending Withdrawals
                </h3>
                <button
                  type="button"
                  onClick={() => { setActiveTab('withdrawals'); window.scrollTo(0, 0); }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  View All Queue <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="overflow-x-auto text-xs text-left">
                <table className="w-full">
                  <thead className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-850">
                    <tr>
                      <th className="pb-2">User</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-200">
                    {isLoadingWithdrawals ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-2"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                          <td className="py-2"><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                          <td className="py-2 text-right"><div className="h-4 bg-slate-800 rounded w-10 ml-auto"></div></td>
                        </tr>
                      ))
                    ) : pendingWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-500">No pending withdrawals.</td>
                      </tr>
                    ) : (
                      pendingWithdrawals.slice(0, 3).map((w: any, idx: number) => (
                        <tr key={w.id || w._id || idx}>
                          <td className="py-2 text-slate-300">{getUserName(w)}</td>
                          <td className="py-2 text-emerald-400 font-bold">₦{w.amount}</td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleApproveWithdrawal(w.id || w._id)}
                              disabled={approvingWithdrawalId === (w.id || w._id)}
                              className="text-[10px] text-emerald-300 bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Properties Summary table */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-indigo-400" /> Assigned Properties
                </h3>
                <button
                  type="button"
                  onClick={() => { setActiveTab('properties'); window.scrollTo(0, 0); }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="overflow-x-auto text-xs text-left">
                <table className="w-full">
                  <thead className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-850">
                    <tr>
                      <th className="pb-2">Property Name</th>
                      <th className="pb-2">Unit</th>
                      <th className="pb-2 text-right">Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-200">
                    {isLoadingProperties ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-2"><div className="h-3 bg-slate-800 rounded w-2/3"></div></td>
                          <td className="py-2"><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                          <td className="py-2 text-right"><div className="h-3 bg-slate-800 rounded w-1/3 ml-auto"></div></td>
                        </tr>
                      ))
                    ) : properties.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-500">No properties assigned.</td>
                      </tr>
                    ) : (
                      properties.slice(0, 3).map((p: any, idx: number) => (
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
          </div>
        </div>
      )}

      {/* TAB 2: MANAGERS MANAGEMENT */}
      {activeTab === 'managers' && (
        <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-indigo-400" /> Managers Directory
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchManagers}
                disabled={isLoadingManagers}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingManagers ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button
                onClick={() => setIsCreateManagerOpen(true)}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Create Manager
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Manager ID</th>
                    <th className="py-2.5 px-3">Manager Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {isLoadingManagers ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-2/3"></div></td>
                        <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                        <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-3/4"></div></td>
                        <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                        <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                        <td className="py-2.5 px-3 text-right"><div className="h-5 bg-slate-800 rounded w-12 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : managers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        {isLoadingManagers ? 'Loading managers...' : 'No manager records found. Click "Create Manager" to add one.'}
                      </td>
                    </tr>
                  ) : (
                    managers.slice((managersPage - 1) * 10, managersPage * 10).map((m: any, idx: number) => (
                      <tr key={m.id || m._id || idx} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 select-all break-all">
                          {m._id || m.id || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {m.firstName ? `${m.firstName} ${m.lastName || ''}` : m.name || m.email}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{m.email}</td>
                        <td className="py-2.5 px-3 text-slate-300">{m.phone || 'N/A'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[10px] font-semibold uppercase">
                            {m.role || 'manager'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleViewManagerDetails(m.id || m._id)}
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-md cursor-pointer"
                          >
                            <Eye className="h-3 w-3" /> Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {managers.length > 10 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-805 bg-slate-950/40 text-[11px]">
                <button
                  type="button"
                  disabled={managersPage === 1}
                  onClick={() => setManagersPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-slate-400">
                  Page <span className="font-bold text-white">{managersPage}</span> of <span className="font-bold text-white">{Math.ceil(managers.length / 10)}</span>
                </span>
                <button
                  type="button"
                  disabled={managersPage === Math.ceil(managers.length / 10)}
                  onClick={() => setManagersPage(prev => Math.min(prev + 1, Math.ceil(managers.length / 10)))}
                  className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WALLET OPERATIONS */}
      {activeTab === 'wallet' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-indigo-400" /> Wallet Credit / Debit Operations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-md">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 mb-3">
                <ArrowUpRight className="h-3.5 w-3.5 text-indigo-400" /> Transaction Execution
              </h3>

              <form onSubmit={handleWalletOperation} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Operation Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWalletForm(prev => ({ ...prev, type: 'credit' }))}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${walletForm.type === 'credit'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                    >
                      Credit User
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletForm(prev => ({ ...prev, type: 'debit' }))}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${walletForm.type === 'debit'
                        ? 'bg-rose-950 text-rose-300 border-rose-700'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                    >
                      Debit User
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Select User / Manager *</label>
                  <select
                    required
                    value={walletForm.userId}
                    onChange={e => setWalletForm(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="" className="bg-slate-950 text-slate-500">-- Choose a Manager --</option>
                    {managers.map((m: any) => {
                      const name = m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : m.name || m.email;
                      const id = m._id || m.id;
                      return (
                        <option key={id} value={id} className="bg-slate-950 text-white">
                          {name} — ID: {id}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Amount (₦) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={walletForm.amount}
                    onChange={e => setWalletForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="e.g. 500"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Description *</label>
                  <input
                    type="text"
                    required
                    value={walletForm.description}
                    onChange={e => setWalletForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Reason for transaction"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingWallet}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${walletForm.type === 'credit'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmittingWallet ? 'Processing...' : walletForm.type === 'credit' ? 'Credit Wallet' : 'Debit Wallet'}
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white mb-2">Wallet Guidelines</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Admin authority allows direct adjustments to user wallet balances. Input the exact user ID and transaction amount.
                </p>
                <div className="space-y-2 text-[11px]">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-emerald-400">Credit Wallet</span>
                    <p className="text-slate-400 text-[10px] mt-0.5">Adds funds directly to target user wallet.</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-rose-400">Debit Wallet</span>
                    <p className="text-slate-400 text-[10px] mt-0.5">Deducts specified funds from user wallet balance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PENDING WITHDRAWALS */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-400" /> Pending Withdrawal Requests
            </h2>
            <button
              onClick={fetchPendingWithdrawals}
              disabled={isLoadingWithdrawals}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingWithdrawals ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Withdrawal ID</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Requested Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {isLoadingWithdrawals ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                        <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                        <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                        <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                        <td className="py-2.5 px-3 text-right"><div className="h-5 bg-slate-800 rounded w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : pendingWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        {isLoadingWithdrawals ? 'Loading pending withdrawals...' : 'No pending withdrawals at this time.'}
                      </td>
                    </tr>
                  ) : (
                    pendingWithdrawals.slice((withdrawalsPage - 1) * 10, withdrawalsPage * 10).map((w: any, idx: number) => (
                      <tr key={w.id || w._id || idx} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-white">{w.id || w._id}</td>
                        <td className="py-2.5 px-3 text-slate-300">{getUserName(w)}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">₦{w.amount}</td>
                        <td className="py-2.5 px-3 text-slate-400">{w.createdAt || w.date || 'Pending'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleApproveWithdrawal(w.id || w._id)}
                            disabled={approvingWithdrawalId === (w.id || w._id)}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950 border border-emerald-800/60 px-2.5 py-1 rounded-md hover:bg-emerald-900 font-bold cursor-pointer"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {approvingWithdrawalId === (w.id || w._id) ? 'Approving...' : 'Approve'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pendingWithdrawals.length > 10 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/40 text-[11px]">
                <button
                  type="button"
                  disabled={withdrawalsPage === 1}
                  onClick={() => setWithdrawalsPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-slate-400">
                  Page <span className="font-bold text-white">{withdrawalsPage}</span> of <span className="font-bold text-white">{Math.ceil(pendingWithdrawals.length / 10)}</span>
                </span>
                <button
                  type="button"
                  disabled={withdrawalsPage === Math.ceil(pendingWithdrawals.length / 10)}
                  onClick={() => setWithdrawalsPage(prev => Math.min(prev + 1, Math.ceil(pendingWithdrawals.length / 10)))}
                  className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PROPERTIES & ASSIGNMENT */}
      {activeTab === 'properties' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Building className="h-4 w-4 text-indigo-400" /> Properties & Agent Direct Assignment
            </h2>
            <button
              onClick={fetchProperties}
              disabled={isLoadingProperties}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingProperties ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Assign Form */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-md h-fit">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 mb-3">
                <PlusCircle className="h-3.5 w-3.5 text-indigo-400" /> Assign Property to Agent
              </h3>

              <form onSubmit={handleAssignProperty} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Agent ID *</label>
                  <input
                    type="text"
                    required
                    value={assignForm.agentId}
                    onChange={e => setAssignForm(prev => ({ ...prev, agentId: e.target.value }))}
                    placeholder="Enter Agent ID"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Property Name *</label>
                  <input
                    type="text"
                    required
                    value={assignForm.propertyName}
                    onChange={e => setAssignForm(prev => ({ ...prev, propertyName: e.target.value }))}
                    placeholder="e.g. Oakridge Estate Phase 2"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Property Number *</label>
                  <input
                    type="text"
                    required
                    value={assignForm.propertyNumber}
                    onChange={e => setAssignForm(prev => ({ ...prev, propertyNumber: e.target.value }))}
                    placeholder="e.g. BLK-402"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAssign}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmittingAssign ? 'Assigning...' : 'Assign Property'}
                </button>
              </form>
            </div>

            {/* Properties List Table */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
              <div className="p-3 border-b border-slate-800 font-bold text-[11px] text-slate-300 uppercase tracking-wider">
                Properties Overview
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Property Name</th>
                      <th className="py-2.5 px-3">Property Number</th>
                      <th className="py-2.5 px-3">Assigned Agent</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {isLoadingProperties ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-2/3"></div></td>
                          <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                          <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                          <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                        </tr>
                      ))
                    ) : properties.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-500">
                          {isLoadingProperties ? 'Loading properties...' : 'No properties found. Use the form to assign a property.'}
                        </td>
                      </tr>
                    ) : (
                      properties.slice((propertiesPage - 1) * 10, propertiesPage * 10).map((p: any, idx: number) => (
                        <tr key={p.id || p._id || idx} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-white">{p.propertyName || p.name}</td>
                          <td className="py-2.5 px-3 text-slate-300">{p.propertyNumber || p.number || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-indigo-300 font-medium">{p.agentName || p.agentId || 'Unassigned'}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-semibold">
                              {p.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {properties.length > 10 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/40 text-[11px]">
                  <button
                    type="button"
                    disabled={propertiesPage === 1}
                    onClick={() => setPropertiesPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-slate-400">
                    Page <span className="font-bold text-white">{propertiesPage}</span> of <span className="font-bold text-white">{Math.ceil(properties.length / 10)}</span>
                  </span>
                  <button
                    type="button"
                    disabled={propertiesPage === Math.ceil(properties.length / 10)}
                    onClick={() => setPropertiesPage(prev => Math.min(prev + 1, Math.ceil(properties.length / 10)))}
                    className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANAGER MODAL */}
      <Modal isOpen={isCreateManagerOpen} onClose={() => setIsCreateManagerOpen(false)} title="Create Manager Account">
        <div className="space-y-4 text-xs">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setCreateManagerTab('account')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${createManagerTab === 'account'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Account Credentials
            </button>
            <button
              type="button"
              onClick={() => setCreateManagerTab('personal')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${createManagerTab === 'personal'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Personal & Address
            </button>
            <button
              type="button"
              onClick={() => setCreateManagerTab('bank')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${createManagerTab === 'bank'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Bank Account
            </button>
            <button
              type="button"
              onClick={() => setCreateManagerTab('guarantor')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${createManagerTab === 'guarantor'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Guarantor
            </button>
            <button
              type="button"
              onClick={() => setCreateManagerTab('nextOfKin')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${createManagerTab === 'nextOfKin'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Next of Kin
            </button>
            <button
              type="button"
              onClick={() => setCreateManagerTab('system')}
              className={`px-3 py-1.5 rounded-t-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${createManagerTab === 'system'
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              System Info
            </button>
          </div>

          <form onSubmit={handleCreateManager} className="space-y-4">
            {/* TAB 1: Account Credentials */}
            {createManagerTab === 'account' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={managerForm.firstName}
                      onChange={e => setManagerForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="e.g. John"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={managerForm.lastName}
                      onChange={e => setManagerForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="e.g. Doe"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={managerForm.email}
                    onChange={e => setManagerForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="manager@example.com"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={managerForm.phone}
                      onChange={e => setManagerForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="08012345678"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showManagerPassword ? 'text' : 'password'}
                        required
                        value={managerForm.password}
                        onChange={e => setManagerForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-3 pr-10 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowManagerPassword(!showManagerPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-200"
                      >
                        {showManagerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                      value={managerForm.role}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 px-3 text-xs text-slate-400 cursor-not-allowed capitalize"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Passport Photo (JPG, PNG, WEBP — Max 50KB)
                    </label>
                    <div className="flex items-center gap-3 mt-1">
                      {managerForm.passportPhoto ? (
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                          <img src={managerForm.passportPhoto} alt="Passport Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setManagerForm(prev => ({ ...prev, passportPhoto: '' }))}
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
                          {managerForm.passportPhoto ? 'Photo selected. Choose another file to replace.' : 'Max size: 50KB'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Personal Details & Location */}
            {createManagerTab === 'personal' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Gender</label>
                    <select
                      value={managerForm.gender}
                      onChange={e => setManagerForm(prev => ({ ...prev, gender: e.target.value }))}
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
                      value={managerForm.dob}
                      onChange={e => setManagerForm(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Marital Status</label>
                    <select
                      value={managerForm.maritalStatus}
                      onChange={e => setManagerForm(prev => ({ ...prev, maritalStatus: e.target.value }))}
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
                    value={managerForm.nin}
                    onChange={e => setManagerForm(prev => ({ ...prev, nin: e.target.value }))}
                    placeholder="11-digit NIN"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    value={managerForm.address}
                    onChange={e => setManagerForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Residential address"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">State</label>
                    <select
                      value={managerForm.state}
                      onChange={e => setManagerForm(prev => ({ ...prev, state: e.target.value, lga: '' }))}
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
                      value={managerForm.lga}
                      onChange={e => setManagerForm(prev => ({ ...prev, lga: e.target.value }))}
                      disabled={!managerForm.state}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="">-- Select LGA --</option>
                      {(managerForm.state && lgasMap[managerForm.state] ? lgasMap[managerForm.state] : []).map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Financial & Bank Details */}
            {createManagerTab === 'bank' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={managerForm.bankName}
                    onChange={e => setManagerForm(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="e.g. Access Bank, Zenith Bank"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Account Number</label>
                    <input
                      type="text"
                      value={managerForm.accNumber}
                      onChange={e => setManagerForm(prev => ({ ...prev, accNumber: e.target.value }))}
                      placeholder="10-digit account number"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Account Name</label>
                    <input
                      type="text"
                      value={managerForm.accountName}
                      onChange={e => setManagerForm(prev => ({ ...prev, accountName: e.target.value }))}
                      placeholder="Account holder name"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Guarantor Details */}
            {createManagerTab === 'guarantor' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                  <h4 className="text-[11px] font-bold text-indigo-400 uppercase">Guarantor Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Guarantor Name *</label>
                      <input
                        type="text"
                        value={managerForm.guarantors[0]?.name || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => {
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
                        value={managerForm.guarantors[0]?.phone || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => {
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
                        value={managerForm.guarantors[0]?.relationship || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => {
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
                        value={managerForm.guarantors[0]?.address || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => {
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
                        value={managerForm.guarantors[0]?.state || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => {
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
                        value={managerForm.guarantors[0]?.lga || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => {
                            const g = [...prev.guarantors];
                            g[0] = { ...g[0], lga: val };
                            return { ...prev, guarantors: g };
                          });
                        }}
                        disabled={!managerForm.guarantors[0]?.state}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">-- Select LGA --</option>
                        {(managerForm.guarantors[0]?.state && lgasMap[managerForm.guarantors[0].state] ? lgasMap[managerForm.guarantors[0].state] : []).map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Next of Kin Details */}
            {createManagerTab === 'nextOfKin' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                  <h4 className="text-[11px] font-bold text-indigo-400 uppercase">Next of Kin Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        value={managerForm.nextOfKin?.name || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => ({
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
                        value={managerForm.nextOfKin?.phone || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => ({
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
                        value={managerForm.nextOfKin?.relationship || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => ({
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
                        value={managerForm.nextOfKin?.address || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => ({
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
                        value={managerForm.nextOfKin?.state || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => ({
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
                        value={managerForm.nextOfKin?.lga || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setManagerForm(prev => ({
                            ...prev,
                            nextOfKin: { ...prev.nextOfKin, lga: val }
                          }));
                        }}
                        disabled={!managerForm.nextOfKin?.state}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">-- Select LGA --</option>
                        {(managerForm.nextOfKin?.state && lgasMap[managerForm.nextOfKin.state] ? lgasMap[managerForm.nextOfKin.state] : []).map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: System & Administration */}
            {createManagerTab === 'system' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Created By / Provisioned By</label>
                  <input
                    type="text"
                    value={managerForm.createdBy || currentUser?.name || currentUser?.id || 'Admin'}
                    onChange={e => setManagerForm(prev => ({ ...prev, createdBy: e.target.value }))}
                    placeholder="Admin Identifier"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Custom Manager ID (Optional)</label>
                  <input
                    type="text"
                    value={managerForm.managerId}
                    onChange={e => setManagerForm(prev => ({ ...prev, managerId: e.target.value }))}
                    placeholder="Leave empty for auto-generated ID"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-2">
              <div>
                {createManagerTab !== 'account' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs: ('account' | 'personal' | 'bank' | 'guarantor' | 'nextOfKin' | 'system')[] = ['account', 'personal', 'bank', 'guarantor', 'nextOfKin', 'system'];
                      const idx = tabs.indexOf(createManagerTab);
                      if (idx > 0) setCreateManagerTab(tabs[idx - 1]);
                    }}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreateManagerOpen(false)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white border border-slate-800/80 bg-slate-950/60 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {createManagerTab !== 'system' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs: ('account' | 'personal' | 'bank' | 'guarantor' | 'nextOfKin' | 'system')[] = ['account', 'personal', 'bank', 'guarantor', 'nextOfKin', 'system'];
                      const idx = tabs.indexOf(createManagerTab);
                      if (idx < tabs.length - 1) setCreateManagerTab(tabs[idx + 1]);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    Next Step
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmittingManager}
                    className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {isSubmittingManager ? 'Creating Manager...' : 'Create Manager'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* VIEW MANAGER PROFILE & CREATION DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedManagerDetails || isLoadingManagerDetails)}
        onClose={() => setSelectedManagerDetails(null)}
        title="Manager Profile Details"
      >
        {isLoadingManagerDetails ? (
          <div className="space-y-4 animate-pulse">
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800"></div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-slate-800 rounded w-24"></div>
                  <div className="h-2 bg-slate-800 rounded w-32"></div>
                </div>
              </div>
              <div className="h-4 bg-slate-800 rounded w-16"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2">
                  <div className="h-2 bg-slate-850 rounded w-1/3"></div>
                  <div className="h-3.5 bg-slate-850 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedManagerDetails ? (
          (() => {
            const item = selectedManagerDetails?.data?.manager ||
              selectedManagerDetails?.manager ||
              selectedManagerDetails?.data?.user ||
              selectedManagerDetails?.user ||
              selectedManagerDetails?.data ||
              selectedManagerDetails;

            const fName = item?.firstName || item?.name?.split(' ')[0] || '';
            const lName = item?.lastName || item?.name?.split(' ').slice(1).join(' ') || '';
            const fullName = item?.name || `${fName} ${lName}`.trim() || item?.email || 'Manager';
            const initial = fName[0] || lName[0] || fullName[0] || 'M';
            const isApproved = item?.isApproved ?? (item?.status === 'active' || item?.status === 'Approved');

            const guarantorObj = Array.isArray(item?.guarantors) ? item.guarantors[0] : item?.guarantors;
            const nokObj = item?.nextOfKin;

            return (
              <div className="space-y-3.5 text-xs max-h-[80vh] overflow-y-auto pr-1">
                {/* Header Profile Box */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    {item?.passportPhoto ? (
                      <img src={item.passportPhoto} alt={fullName} className="h-10 w-10 shrink-0 rounded-full object-cover border border-indigo-500/40" />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
                        {initial.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">{fullName}</h4>
                      <p className="text-[11px] text-slate-400">{item?.email || 'No email specified'}</p>
                    </div>
                  </div>
                  <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isApproved
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                    }`}>
                    {isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>

                {/* Account & Personal Information */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Personal & Identity</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Phone</span>
                      <span className="text-slate-200 font-medium">{item?.phone || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Gender</span>
                      <span className="text-slate-200 font-medium capitalize">{item?.gender || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Date of Birth</span>
                      <span className="text-slate-200 font-medium">{item?.dob || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Marital Status</span>
                      <span className="text-slate-200 font-medium">{item?.maritalStatus || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">NIN</span>
                      <span className="text-slate-200 font-mono text-[11px]">{item?.nin || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Manager ID</span>
                      <span className="text-slate-300 font-mono text-[11px] select-all break-all">{item?.managerId || item?._id || item?.id || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Address & Location */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Address & Location</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 sm:col-span-3">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Residential Address</span>
                      <span className="text-slate-200 font-medium">{item?.address || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">State</span>
                      <span className="text-slate-200 font-medium">{item?.state || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">LGA</span>
                      <span className="text-slate-200 font-medium">{item?.lga || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Financial & Banking Information */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank Account Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Bank Name</span>
                      <span className="text-slate-200 font-medium">{item?.bankName || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Account Number</span>
                      <span className="text-emerald-400 font-mono font-bold text-[11px]">{item?.accNumber || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Account Name</span>
                      <span className="text-slate-200 font-medium">{item?.accountName || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Guarantor Details */}
                {guarantorObj && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-indigo-400 uppercase font-semibold block">Guarantor Information</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Name</span>
                        <span className="text-slate-200 font-medium">{guarantorObj.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Phone</span>
                        <span className="text-slate-200 font-medium">{guarantorObj.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Relationship</span>
                        <span className="text-slate-200 font-medium">{guarantorObj.relationship || 'N/A'}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-[10px] text-slate-400 block">Address</span>
                        <span className="text-slate-200">{guarantorObj.address || 'N/A'} {guarantorObj.lga ? `, ${guarantorObj.lga}` : ''} {guarantorObj.state ? `, ${guarantorObj.state}` : ''}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next of Kin Details */}
                {nokObj && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-indigo-400 uppercase font-semibold block">Next of Kin Information</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Name</span>
                        <span className="text-slate-200 font-medium">{nokObj.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Phone</span>
                        <span className="text-slate-200 font-medium">{nokObj.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Relationship</span>
                        <span className="text-slate-200 font-medium">{nokObj.relationship || 'N/A'}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-[10px] text-slate-400 block">Address</span>
                        <span className="text-slate-200">{nokObj.address || 'N/A'} {nokObj.lga ? `, ${nokObj.lga}` : ''} {nokObj.state ? `, ${nokObj.state}` : ''}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Created By Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Provisioned By</span>
                    <div className="text-slate-200 text-[11px] font-medium">
                      {typeof item?.createdBy === 'object'
                        ? `${item.createdBy.firstName || ''} ${item.createdBy.lastName || ''}`.trim() + ` (${item.createdBy.email || ''})`
                        : item?.createdBy || 'Admin'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Creation Date</span>
                    <span className="text-slate-300 text-[11px]">
                      {item?.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedManagerDetails(null)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            );
          })()
        ) : null}
      </Modal>
    </div>
  );
};
