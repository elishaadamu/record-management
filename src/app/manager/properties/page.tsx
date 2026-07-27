"use client";

import React, { useState, useEffect } from 'react';
import { managerService } from '@/services/managerService';
import {
  Building,
  RefreshCw
} from 'lucide-react';

export default function ManagerPropertiesPage() {
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProperties = async () => {
    setIsLoading(true);
    setCurrentPage(1);
    try {
      const res = await managerService.getAssignedProperties();
      let list = res?.data || res?.properties || res;
      if (list && !Array.isArray(list) && typeof list === 'object') {
        const possibleArray = Object.values(list).find(val => Array.isArray(val));
        if (possibleArray) {
          list = possibleArray;
        } else if (Array.isArray(list.data)) {
          list = list.data;
        }
      }
      setPropertiesList(Array.isArray(list) ? list : []);
    } catch (e: any) {
      // Quiet fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

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
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Properties
        </button>
      </div>

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
                <th className="py-2.5 px-3">Property Number</th>
                <th className="py-2.5 px-3">Assigned Agent</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-2/3"></div></td>
                    <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                    <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/2"></div></td>
                    <td className="py-2.5 px-3"><div className="h-3 bg-slate-800 rounded w-1/4"></div></td>
                  </tr>
                ))
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
