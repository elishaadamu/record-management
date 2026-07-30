"use client";

import React, { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { useToast } from '@context/ToastContext';
import { Modal } from '@components/Common/Modal';
import { TableSkeleton } from '@components/Common/Skeleton';
import {
  Building,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  MapPin,
  Tag
} from 'lucide-react';

export default function AgentPropertiesPage() {
  const { showToast } = useToast();
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Status update modal state
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<'available' | 'unavailable'>('available');
  const [statusNotes, setStatusNotes] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const [stats, setStats] = useState<{ total: number; available: number; unavailable: number }>({
    total: 0,
    available: 0,
    unavailable: 0
  });

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const res = await agentService.getProperties();

      if (res?.stats) {
        setStats({
          total: Number(res.stats.total || 0),
          available: Number(res.stats.available || 0),
          unavailable: Number(res.stats.unavailable || 0)
        });
      }

      let list = res?.data?.properties || res?.properties || res?.data || res;
      if (list && !Array.isArray(list) && typeof list === 'object') {
        const arrayVal = Object.values(list).find(v => Array.isArray(v));
        if (arrayVal) list = arrayVal;
      }
      const parsedList = Array.isArray(list) ? list : [];
      setPropertiesList(parsedList);

      if (!res?.stats) {
        const avail = parsedList.filter((p: any) => (p.status || '').toLowerCase() === 'available').length;
        const unavail = parsedList.filter((p: any) => (p.status || '').toLowerCase() === 'unavailable').length;
        setStats({ total: parsedList.length, available: avail, unavailable: unavail });
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to fetch assigned properties', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setIsSubmittingStatus(true);
    const propId = selectedProperty.id || selectedProperty._id;
    const payload = {
      status: newStatus,
      notes: statusNotes
    };

    try {
      const res = await agentService.updatePropertyStatus(propId, payload);
      showToast(res?.message || `Property status updated to "${newStatus}"!`, 'success');
      setSelectedProperty(null);
      setStatusNotes('');
      fetchProperties();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update property status.', 'error');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const filteredProperties = propertiesList.filter((p: any) => {
    const name = (p.propertyName || p.name || p.title || '').toLowerCase();
    const num = (p.propertyNumber || p.number || p.code || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || num.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (p.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-6 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Building className="h-4 w-4" /> Property Management
          </div>
          <h1 className="text-2xl font-extrabold text-white">Agent Assigned Properties</h1>
          <p className="text-xs text-slate-300 mt-1">
            Inspect your assigned property assets and update status (available / unavailable).
          </p>
        </div>

        <button
          onClick={fetchProperties}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Properties
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Assigned Properties</span>
          <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 shadow-md">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase">Available</span>
          <p className="text-xl font-bold text-emerald-300 mt-1">{stats.available}</p>
        </div>
        <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 shadow-md">
          <span className="text-[11px] font-semibold text-rose-400 uppercase">Unavailable</span>
          <p className="text-xl font-bold text-rose-300 mt-1">{stats.unavailable}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search property name or number..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Property Number</th>
                <th className="py-3 px-4">Property Name</th>
                <th className="py-3 px-4">Category / Location</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {isLoading ? (
                <TableSkeleton rows={4} cols={5} />
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No assigned properties found.
                  </td>
                </tr>
              ) : (
                filteredProperties.slice((currentPage - 1) * 10, currentPage * 10).map((p: any, idx: number) => {
                  const propId = p.id || p._id || idx;
                  const name = p.propertyName || p.name || p.title || 'Property Asset';
                  const num = p.propertyNumber || p.number || p.code || 'N/A';
                  const status = (p.status || 'available').toLowerCase();

                  return (
                    <tr key={propId} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-emerald-400 select-all">{num}</td>
                      <td className="py-3 px-4 font-semibold text-white">{name}</td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{p.location || p.address || p.state || 'Assigned Territory'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          status === 'available'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProperty(p);
                            setNewStatus((p.status || '').toLowerCase() === 'unavailable' ? 'unavailable' : 'available');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow transition-all cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" /> Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredProperties.length > 10 && (
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
              Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{Math.ceil(filteredProperties.length / 10)}</span>
            </span>
            <button
              type="button"
              disabled={currentPage === Math.ceil(filteredProperties.length / 10)}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProperties.length / 10)))}
              className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* UPDATE PROPERTY STATUS MODAL */}
      <Modal
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        title="Update Property Status"
      >
        {selectedProperty && (
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Target Property</div>
              <div className="font-bold text-white text-sm">
                {selectedProperty.propertyName || selectedProperty.name || 'Property'} (#{selectedProperty.propertyNumber || selectedProperty.number || selectedProperty.id})
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">New Property Status *</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as 'available' | 'unavailable')}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="available">available</option>
                <option value="unavailable">unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Status Notes / Remarks (Optional)</label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={e => setStatusNotes(e.target.value)}
                placeholder="Optional remarks regarding this property status update..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingStatus}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isSubmittingStatus ? 'Updating...' : 'Save Property Status'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
