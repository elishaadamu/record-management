import React, { useState } from 'react';
import { Modal } from '@components/Common/Modal';
import { useAuth } from '@context/AuthContext';
import { useData } from '@context/DataContext';
import { ApprovalType } from '@types';

interface SubmitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitRequestModal: React.FC<SubmitRequestModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { createApprovalRequest, addAuditLog } = useData();

  const [type, setType] = useState<ApprovalType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !currentUser) return;

    createApprovalRequest({
      type,
      title,
      amount: amount || undefined,
      agentId: currentUser.id,
      agentName: currentUser.name,
      managerId: currentUser.assignedManagerId,
      details
    });

    addAuditLog(
      currentUser.name,
      currentUser.role,
      'Approval Request Submitted',
      `Agent ${currentUser.name} submitted a ${type.toUpperCase()} claim: "${title}"`,
      'approval'
    );

    setTitle('');
    setAmount('');
    setDetails('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Request for Manager Approval">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Request Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as ApprovalType)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="expense">Expense Reimbursement Claim</option>
            <option value="discount">Special Client Volume Discount</option>
            <option value="timeoff">PTO / Time-Off Leave</option>
            <option value="contract">Custom Contract Exception</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Request Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Client Onboarding Dinner & Travel Expense"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {(type === 'expense' || type === 'discount') && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Amount / Monetary Value
            </label>
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. $345.50 or 15% Discount"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Justification & Details</label>
          <textarea
            rows={3}
            required
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder="Explain why this approval is required and provide itemized receipts/contract background..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md"
          >
            Submit for Review
          </button>
        </div>
      </form>
    </Modal>
  );
};
