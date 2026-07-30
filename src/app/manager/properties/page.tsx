"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@context/ToastContext';
import { TableSkeleton } from '@components/Common/Skeleton';
import { managerService } from '@/services/managerService';
import {
  Building,
  RefreshCw,
  CheckCircle2,
  XCircle,
  UserCheck,
  Building2
} from 'lucide-react';

export default function ManagerPropertiesPage() {
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProperties = async () => {
    setIsLoading(true);
    setCurrentPage(1);
    try {
      const res = await managerService.getAssignedProperties();
      // Parse stats
      const parsedStats = res?.stats || res?.data?.stats || null;
      setStats(parsedStats);

      // Parse properties list
      let list: any = [];
      if (Array.isArray(res?.data?.all)) {
        list = res.data.all;
      } else if (Array.isArray(res?.data?.properties)) {
        list = res.data.properties;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.properties)) {
        list = res.properties;
      } else if (Array.isArray(res)) {
        list = res;
      } else if (res?.data && typeof res.data === 'object') {
        const possibleArray = Object.values(res.data).find(val => Array.isArray(val));
        if (possibleArray) list = possibleArray;
      }

      setPropertiesList(Array.isArray(list) ? list : []);
    } catch (e: any) {
      console.error('Failed to fetch manager properties', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const getAgentDisplayName = (p: any) => {
    if (p.agentName) return p.agentName;
    if (p.assignedTo && typeof p.assignedTo === 'object') {
      const fullName = `${p.assignedTo.firstName || ''} ${p.assignedTo.lastName || ''}`.trim();
      if (fullName) return fullName;
      if (p.assignedTo.name) return p.assignedTo.name;
      if (p.assignedTo.email) return p.assignedTo.email;
    }
    if (typeof p.assignedTo === 'string') return p.assignedTo;
    if (p.agentId) return p.agentId;
    return 'Unassigned';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
            <Building className="h-3.5 w-3.5" /> Properties Overview
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Supervised Agents Properties</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real estate properties and units assigned to your supervised field agents.
          </p>
        </div>

        <button
          onClick={fetchProperties}
          disabled={isLoading}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Properties
        </button>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Properties</div>
              <div className="text-lg font-extrabold text-white">{stats.total ?? propertiesList.length}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available</div>
              <div className="text-lg font-extrabold text-emerald-400">{stats.available ?? 0}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-800/50 text-blue-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned</div>
              <div className="text-lg font-extrabold text-blue-400">{stats.assigned ?? 0}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unavailable</div>
              <div className="text-lg font-extrabold text-slate-300">{stats.unavailable ?? 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Properties List Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
        <div className="p-3 border-b border-slate-800 font-bold text-[11px] text-slate-300 uppercase tracking-wider">
          Supervised Properties Directory
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Property Name</th>
                <th className="py-2.5 px-3">Property Code</th>
                <th className="py-2.5 px-3">Assigned Agent</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {isLoading ? (
                <TableSkeleton rows={4} cols={4} />
              ) : propertiesList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No properties are currently assigned to your supervised agents.
                  </td>
                </tr>
              ) : (
                propertiesList.slice((currentPage - 1) * 10, currentPage * 10).map((p: any, idx: number) => (
                  <tr key={p.id || p._id || idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{p.propertyName || p.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{p.propertyNumber || p.number || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-indigo-300 font-medium">{getAgentDisplayName(p)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${(p.status === 'available' || p.status === 'active')
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}>
                        {p.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {propertiesList.length > 10 && (
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
              Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{Math.ceil(propertiesList.length / 10)}</span>
            </span>
            <button
              type="button"
              disabled={currentPage === Math.ceil(propertiesList.length / 10)}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(propertiesList.length / 10)))}
              className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

