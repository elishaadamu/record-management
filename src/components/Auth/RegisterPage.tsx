import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth, RegisterPayload } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Calendar,
  Building2,
  CreditCard,
  FileText,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

const STORAGE_KEY_REGISTER_FORM = 'ops_portal_register_draft';
const STORAGE_KEY_REGISTER_STEP = 'ops_portal_register_step';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem(STORAGE_KEY_REGISTER_STEP);
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (stepNum >= 1 && stepNum <= 3) return stepNum;
      }
    }
    return 1;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State with localStorage persistence
  const [formData, setFormData] = useState<RegisterPayload>(() => {
    const defaultData: RegisterPayload = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: '',
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
        const saved = localStorage.getItem(STORAGE_KEY_REGISTER_FORM);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.gender) {
            const lower = parsed.gender.toLowerCase();
            if (lower === 'male') parsed.gender = 'Male';
            else if (lower === 'female') parsed.gender = 'Female';
            else if (lower === 'other') parsed.gender = 'Other';
          }
          if (parsed.maritalStatus) {
            const lowerMS = parsed.maritalStatus.toLowerCase();
            if (lowerMS === 'single') parsed.maritalStatus = 'Single';
            else if (lowerMS === 'married') parsed.maritalStatus = 'Married';
            else if (lowerMS === 'divorced') parsed.maritalStatus = 'Divorced';
            else if (lowerMS === 'widowed') parsed.maritalStatus = 'Widowed';
          }
          return { ...defaultData, ...parsed, password: '' };
        }
      } catch (e) {
        // Quiet fail
      }
    }
    return defaultData;
  });

  useEffect(() => {
    const { password, ...safeDraft } = formData;
    localStorage.setItem(STORAGE_KEY_REGISTER_FORM, JSON.stringify(safeDraft));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REGISTER_STEP, currentStep.toString());
  }, [currentStep]);

  // States & LGAs API Integration using axios
  const [statesList, setStatesList] = useState<string[]>([]);
  const [lgasMap, setLgasMap] = useState<Record<string, string[]>>({});
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [loadingLgasFor, setLoadingLgasFor] = useState<Record<string, boolean>>({});

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
    if (formData.state) {
      loadLgasForState(formData.state);
    }
  }, [formData.state]);

  useEffect(() => {
    const guarantorState = formData.guarantors?.[0]?.state;
    if (guarantorState) {
      loadLgasForState(guarantorState);
    }
  }, [formData.guarantors?.[0]?.state]);

  useEffect(() => {
    const nokState = formData.nextOfKin?.state;
    if (nokState) {
      loadLgasForState(nokState);
    }
  }, [formData.nextOfKin?.state]);

  const handleChange = (field: keyof RegisterPayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuarantorChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const guarantors = [...(prev.guarantors || [])];
      guarantors[index] = { ...guarantors[index], [field]: value };
      return { ...prev, guarantors };
    });
  };

  const handleNextOfKinChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      nextOfKin: { ...(prev.nextOfKin || {}), [field]: value }
    }));
  };

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
      handleChange('passportPhoto', base64String);
      showToast('Passport photo uploaded successfully', 'success');
    };
    reader.onerror = () => {
      showToast('Failed to process passport photo file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (targetStep: number): boolean => {
    if (targetStep <= currentStep) return true;

    if (currentStep === 1 || targetStep > 1) {
      if (!formData.firstName?.trim()) {
        showToast('First Name is required before proceeding', 'error');
        return false;
      }
      if (!formData.lastName?.trim()) {
        showToast('Last Name is required before proceeding', 'error');
        return false;
      }
      if (!formData.email?.trim()) {
        showToast('Email Address is required before proceeding', 'error');
        return false;
      }
      if (!formData.password) {
        showToast('Password is required before proceeding', 'error');
        return false;
      }
      if (!formData.phone?.trim()) {
        showToast('Phone Number is required before proceeding', 'error');
        return false;
      }
      if (!formData.role) {
        showToast('Please select a Role before proceeding', 'error');
        return false;
      }
      if (!formData.gender || !['Male', 'Female', 'Other'].includes(formData.gender)) {
        showToast('Gender must be Male, Female, or Other', 'error');
        return false;
      }
    }

    return true;
  };

  const handleStepChange = (targetStep: number) => {
    if (validateStep(targetStep)) {
      setCurrentStep(targetStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.role
    ) {
      showToast('Please fill in all required fields (First Name, Last Name, Email, Phone, Password, Role)', 'error');
      return;
    }

    if (!formData.gender || !['Male', 'Female', 'Other'].includes(formData.gender)) {
      showToast('Gender must be Male, Female, or Other', 'error');
      return;
    }

    const formatCap = (str?: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;
    const payload = {
      ...formData,
      role: formData.role || 'user',
      gender: formData.gender ? formatCap(formData.gender) : 'Male',
      maritalStatus: formData.maritalStatus ? formatCap(formData.maritalStatus) : 'Single'
    };

    setIsLoading(true);
    try {
      const res = await register(payload);
      setIsLoading(false);
      if (res.success) {
        localStorage.removeItem(STORAGE_KEY_REGISTER_FORM);
        localStorage.removeItem(STORAGE_KEY_REGISTER_STEP);
        showToast('Registration successful! Please log in.', 'success');
        router.push('/login');
      } else {
        showToast(res.message || 'Registration failed', 'error');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err?.message || 'Registration failed', 'error');
    }
  };

  const steps = [
    { id: 1, title: 'Personal Info' },
    { id: 2, title: 'Location & Banking' },
    { id: 3, title: 'Guarantor & Next of Kin' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 text-center flex flex-col items-center">
          <div className="h-16 w-16 mb-3 rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-50 flex items-center justify-center">
            <img src="/logo.jpg" alt="MK360 Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-500 mt-1">Register a new user in the MK360 operations network</p>
        </div>

        {/* Multi-step progress bar */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => handleStepChange(step.id)}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isActive
                        ? 'bg-indigo-600 ring-4 ring-indigo-500/20 text-white'
                        : isCompleted
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold ${isActive
                        ? 'text-indigo-600 font-bold'
                        : isCompleted
                          ? 'text-slate-800 font-semibold'
                          : 'text-slate-500'
                      }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => handleChange('firstName', e.target.value)}
                    placeholder="John"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => handleChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="john.doe@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+234..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role || ''}
                    onChange={e => handleChange('role', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select Role</option>
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => handleChange('dob', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    Marital Status
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={e => handleChange('maritalStatus', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Financial Details */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="Street address, building, suite"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    State
                  </label>
                  <select
                    value={formData.state || ''}
                    onChange={e => {
                      const selectedState = e.target.value;
                      handleChange('state', selectedState);
                      handleChange('lga', '');
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">{isLoadingStates ? 'Loading states...' : 'Select State'}</option>
                    {statesList.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                    LGA
                  </label>
                  <select
                    value={formData.lga || ''}
                    onChange={e => handleChange('lga', e.target.value)}
                    disabled={!formData.state || !!loadingLgasFor[formData.state || '']}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">
                      {!formData.state
                        ? 'Select State first'
                        : loadingLgasFor[formData.state || '']
                          ? 'Loading LGAs...'
                          : 'Select LGA'}
                    </option>
                    {(formData.state && lgasMap[formData.state] ? lgasMap[formData.state] : []).map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Financial & Identity Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={e => handleChange('bankName', e.target.value)}
                      placeholder="e.g. Access Bank"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.accNumber}
                      onChange={e => handleChange('accNumber', e.target.value)}
                      placeholder="10 digits"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={formData.accountName}
                      onChange={e => handleChange('accountName', e.target.value)}
                      placeholder="Full Account Name"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      NIN (National Identity Number)
                    </label>
                    <input
                      type="text"
                      value={formData.nin}
                      onChange={e => handleChange('nin', e.target.value)}
                      placeholder="11 digits NIN"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Passport Photo (JPG, PNG, WEBP — Max 50KB)
                    </label>
                    <div className="flex items-center gap-3 mt-1">
                      {formData.passportPhoto ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                          <img src={formData.passportPhoto} alt="Passport Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleChange('passportPhoto', '')}
                            className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-bl hover:bg-red-700"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                          <UserIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handlePassportUpload}
                          className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          {formData.passportPhoto ? 'Photo selected. Choose another file to replace.' : 'Supported: JPG, PNG, WEBP (Max 50KB)'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Guarantors & Next of Kin */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Guarantors */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Guarantor Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">Guarantor Name</label>
                    <input
                      type="text"
                      value={formData.guarantors?.[0]?.name || ''}
                      onChange={e => handleGuarantorChange(0, 'name', e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.guarantors?.[0]?.phone || ''}
                      onChange={e => handleGuarantorChange(0, 'phone', e.target.value)}
                      placeholder="Phone"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">Relationship</label>
                    <input
                      type="text"
                      value={formData.guarantors?.[0]?.relationship || ''}
                      onChange={e => handleGuarantorChange(0, 'relationship', e.target.value)}
                      placeholder="e.g. Employer, Uncle"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">Address</label>
                    <input
                      type="text"
                      value={formData.guarantors?.[0]?.address || ''}
                      onChange={e => handleGuarantorChange(0, 'address', e.target.value)}
                      placeholder="Address"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">State</label>
                    <select
                      value={formData.guarantors?.[0]?.state || ''}
                      onChange={e => {
                        handleGuarantorChange(0, 'state', e.target.value);
                        handleGuarantorChange(0, 'lga', '');
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">{isLoadingStates ? 'Loading states...' : 'Select State'}</option>
                      {statesList.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">LGA</label>
                    <select
                      value={formData.guarantors?.[0]?.lga || ''}
                      onChange={e => handleGuarantorChange(0, 'lga', e.target.value)}
                      disabled={!formData.guarantors?.[0]?.state || !!loadingLgasFor[formData.guarantors?.[0]?.state || '']}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="">
                        {!formData.guarantors?.[0]?.state
                          ? 'Select State first'
                          : loadingLgasFor[formData.guarantors?.[0]?.state || '']
                            ? 'Loading LGAs...'
                            : 'Select LGA'}
                      </option>
                      {(formData.guarantors?.[0]?.state && lgasMap[formData.guarantors[0].state] ? lgasMap[formData.guarantors[0].state] : []).map(lga => (
                        <option key={lga} value={lga}>{lga}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Next of Kin Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={formData.nextOfKin?.name || ''}
                      onChange={e => handleNextOfKinChange('name', e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.nextOfKin?.phone || ''}
                      onChange={e => handleNextOfKinChange('phone', e.target.value)}
                      placeholder="Phone"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">Relationship</label>
                    <input
                      type="text"
                      value={formData.nextOfKin?.relationship || ''}
                      onChange={e => handleNextOfKinChange('relationship', e.target.value)}
                      placeholder="e.g. Spouse, Sibling"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">Address</label>
                    <input
                      type="text"
                      value={formData.nextOfKin?.address || ''}
                      onChange={e => handleNextOfKinChange('address', e.target.value)}
                      placeholder="Address"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">State</label>
                    <select
                      value={formData.nextOfKin?.state || ''}
                      onChange={e => {
                        handleNextOfKinChange('state', e.target.value);
                        handleNextOfKinChange('lga', '');
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">{isLoadingStates ? 'Loading states...' : 'Select State'}</option>
                      {statesList.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">LGA</label>
                    <select
                      value={formData.nextOfKin?.lga || ''}
                      onChange={e => handleNextOfKinChange('lga', e.target.value)}
                      disabled={!formData.nextOfKin?.state || !!loadingLgasFor[formData.nextOfKin?.state || '']}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="">
                        {!formData.nextOfKin?.state
                          ? 'Select State first'
                          : loadingLgasFor[formData.nextOfKin?.state || '']
                            ? 'Loading LGAs...'
                            : 'Select LGA'}
                      </option>
                      {(formData.nextOfKin?.state && lgasMap[formData.nextOfKin.state] ? lgasMap[formData.nextOfKin.state] : []).map(lga => (
                        <option key={lga} value={lga}>{lga}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => handleStepChange(currentStep - 1)}
                className="rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 text-slate-800" />
                <span className="font-bold text-slate-800">Previous</span>
              </button>
            ) : <div />}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => handleStepChange(currentStep + 1)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
              >
                <span className="font-bold text-white">Next Step</span>
                <ArrowRight className="h-4 w-4 text-white" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 ml-auto cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="font-bold text-white">Registering...</span>
                ) : (
                  <>
                    <span className="font-bold text-white">Submit Registration</span>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Link back to Login page */}
        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-200 pt-4">
          Already have an account?{' '}
          <Link href="/register" onClick={(e) => { e.preventDefault(); window.location.href = '/login'; }} className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
