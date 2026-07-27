"use client";

import React from 'react';
import { useAuth } from '@context/AuthContext';
import { Shield, User as UserIcon, Mail, Phone, Calendar, BadgeCheck, Clock, Briefcase, Award } from 'lucide-react';

export default function AdminProfilePage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
        Loading profile details...
      </div>
    );
  }

  const initial = currentUser.name?.[0] || currentUser.email?.[0] || 'A';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
            <Shield className="h-3.5 w-3.5" /> Account Information
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Administrator Profile</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            View your registered administrator credentials and account privileges.
          </p>
        </div>
      </div>

      {/* Main Profile Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar Card */}
        <div className="md:col-span-1 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-indigo-600/20 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-300 font-extrabold text-2xl shadow-lg">
              {initial.toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 h-5 w-5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <h2 className="text-base font-bold text-white mt-4">{currentUser.name}</h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-950/80 text-indigo-300 border-indigo-800/60 mt-1 uppercase tracking-wider">
            {currentUser.role}
          </span>

          <div className="w-full border-t border-slate-850 mt-5 pt-4 text-xs text-slate-400 space-y-2.5 text-left">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-emerald-400 capitalize">{currentUser.status || 'Active'}</span>
            </div>
            <div className="flex justify-between">
              <span>Title:</span>
              <span className="font-semibold text-slate-200">{currentUser.title || 'System Administrator'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Account Details Grid */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md space-y-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-indigo-400" /> Account Attributes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Full Name */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5 flex items-center gap-1">
                <UserIcon className="h-3 w-3 text-indigo-400" /> Full Name
              </span>
              <span className="text-white font-medium">{currentUser.name}</span>
            </div>

            {/* Email Address */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5 flex items-center gap-1">
                <Mail className="h-3 w-3 text-indigo-400" /> Email Address
              </span>
              <span className="text-white font-medium select-all break-all">{currentUser.email}</span>
            </div>

            {/* Phone Number */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5 flex items-center gap-1">
                <Phone className="h-3 w-3 text-indigo-400" /> Phone Number
              </span>
              <span className="text-white font-medium">{currentUser.phone || 'N/A'}</span>
            </div>

            {/* Department */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5 flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-indigo-400" /> Department
              </span>
              <span className="text-white font-medium">{currentUser.department || 'Executive Operations'}</span>
            </div>

            {/* Staff Title */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5 flex items-center gap-1">
                <Award className="h-3 w-3 text-indigo-400" /> Official Title
              </span>
              <span className="text-white font-medium">{currentUser.title || 'System Administrator'}</span>
            </div>

            {/* Last Logged In */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3 text-indigo-400" /> Last Login Session
              </span>
              <span className="text-white font-medium">{currentUser.lastLogin || new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
