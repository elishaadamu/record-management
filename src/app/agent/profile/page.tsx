"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { User as UserIcon, Mail, Phone, ShieldCheck, MapPin, Building, Calendar, CreditCard, Clock, BadgeCheck, Briefcase } from 'lucide-react';

export default function AgentProfilePage() {
  const { currentUser } = useAuth();

  const userProfile: any = {
    id: currentUser?.id || currentUser?._id || "6a69e57436ce3d4e4fcb5a04",
    name: currentUser?.name || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : "Yau Elisha"),
    email: currentUser?.email || "johdoe3@gmail.com",
    role: currentUser?.role || "agent",
    avatar: currentUser?.avatar || currentUser?.passportPhoto || "data:image/webp;base64,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",
    department: currentUser?.department || "Operations",
    status: currentUser?.status || "active",
    title: currentUser?.title || "Staff Member",
    lastLogin: currentUser?.lastLogin || "7/30/26, 3:06 PM",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950 flex items-center justify-center shrink-0">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-emerald-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                <ShieldCheck className="w-3 h-3" /> {userProfile.role}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950 text-emerald-300 border border-slate-800">
                <BadgeCheck className="w-3 h-3 text-emerald-400" /> {userProfile.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{userProfile.name}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-500" /> {userProfile.email}
            </p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Personal & Official Details */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <UserIcon className="w-4 h-4" /> Personal & Account Information
          </h3>

          <div className="space-y-3 divide-y divide-slate-800/60 text-slate-300">
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Account ID:</span>
              <span className="font-mono text-emerald-400 font-bold select-all">{userProfile.id}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Phone Number:</span>
              <span className="font-medium text-white">{userProfile.phone}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Department:</span>
              <span className="font-medium text-white">{userProfile.department}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Title / Position:</span>
              <span className="font-medium text-white">{userProfile.title}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Last Login:</span>
              <span className="font-medium text-slate-300">{userProfile.lastLogin}</span>
            </div>
          </div>
        </div>

        {/* Bank & Location Info */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Bank & Location Details
          </h3>

          <div className="space-y-3 divide-y divide-slate-800/60 text-slate-300">
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Bank Name:</span>
              <span className="font-medium text-white">{currentUser?.bankName || 'N/A'}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Account Number:</span>
              <span className="font-mono font-bold text-emerald-400">{currentUser?.accNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Account Name:</span>
              <span className="font-medium text-white">{currentUser?.accountName || 'N/A'}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">State / LGA:</span>
              <span className="font-medium text-white">{currentUser?.state ? `${currentUser.state} / ${currentUser.lga || ''}` : 'Assigned Region'}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Address:</span>
              <span className="font-medium text-white">{currentUser?.address || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
