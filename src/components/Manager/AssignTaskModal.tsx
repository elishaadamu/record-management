import React, { useState } from 'react';
import { Modal } from '@components/Common/Modal';
import { useAuth } from '@context/AuthContext';
import { useData } from '@context/DataContext';
import { TaskPriority } from '@types';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser } = useAuth();
  const { createTask, addAuditLog } = useData();

  const agents = users.filter(u => u.role === 'agent');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState(agents[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Client Services');
  const [dueDate, setDueDate] = useState('2026-07-28');
  const [tagsInput, setTagsInput] = useState('Priority, Support');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedAgentId) return;

    const agent = agents.find(a => a.id === assignedAgentId);
    if (!agent || !currentUser) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    createTask({
      title,
      description,
      assignedAgentId: agent.id,
      assignedAgentName: agent.name,
      managerId: currentUser.id,
      managerName: currentUser.name,
      priority,
      status: 'todo',
      category,
      dueDate,
      tags
    });

    addAuditLog(
      currentUser.name,
      currentUser.role,
      'Task Dispatched',
      `Dispatched task "${title}" to Agent ${agent.name}`,
      'task'
    );

    // Reset and close
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dispatch New Task / Ticket">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Task Deliverable Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Enterprise Onboarding & Infrastructure Setup"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Instructions</label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide clear steps, target client details, and expected outputs..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee (Agent)</label>
            <select
              value={assignedAgentId}
              onChange={e => setAssignedAgentId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="urgent">Urgent (SLA Priority 1)</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Client Services / Escalation"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="e.g. Security, Acme, Audit"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-pure-white hover:bg-blue-500 shadow-md"
          >
            Dispatch Task
          </button>
        </div>
      </form>
    </Modal>
  );
};
