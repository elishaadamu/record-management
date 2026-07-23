import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../Common/StatCard';
import { PriorityBadge, StatusBadge, ApprovalBadge } from '../Common/Badge';
import { SubmitRequestModal } from './SubmitRequestModal';
import {
  UserCheck,
  CheckSquare,
  Clock,
  FilePlus,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck2,
  Send,
  MessageSquare
} from 'lucide-react';
import { TaskStatus } from '../../types';

export const AgentDashboard: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { tasks, approvals, updateTaskStatus, addAuditLog } = useData();

  const [activeTab, setActiveTab] = useState<'tasks' | 'requests' | 'scorecard'>('tasks');
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  if (!currentUser) return null;

  // Filter tasks assigned to current agent
  const myTasks = tasks.filter(
    t => t.assignedAgentId === currentUser.id || t.assignedAgentName === currentUser.name
  );

  const myApprovals = approvals.filter(a => a.agentId === currentUser.id || a.agentName === currentUser.name);

  const completedCount = myTasks.filter(t => t.status === 'completed').length;
  const inProgressCount = myTasks.filter(t => t.status === 'in_progress').length;
  const inReviewCount = myTasks.filter(t => t.status === 'review').length;
  const todoCount = myTasks.filter(t => t.status === 'todo').length;

  const manager = users.find(u => u.id === currentUser.assignedManagerId || u.role === 'manager');

  const filteredMyTasks = myTasks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    addAuditLog(
      currentUser.name,
      currentUser.role,
      'Task Status Updated',
      `Agent ${currentUser.name} moved task #${taskId} status to "${newStatus.toUpperCase()}"`,
      'task'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-6 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
            <UserCheck className="h-4 w-4" /> Agent Personal Workspace
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome, {currentUser.name}</h1>
          <p className="text-sm text-slate-300 mt-1">
            Execute assigned field tasks, submit expense & discount requests, and monitor your personal daily quota.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all"
          >
            <FilePlus className="h-4 w-4" /> Submit Request / Claim
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Queue Items"
          value={myTasks.length}
          subtitle={`${todoCount} To Do • ${inProgressCount} In Progress`}
          icon={CheckSquare}
          accentColor="emerald"
        />
        <StatCard
          title="Completed Deliverables"
          value={completedCount}
          subtitle="Successfully executed SLA tasks"
          icon={CheckCircle2}
          accentColor="blue"
        />
        <StatCard
          title="Submitted Claim Requests"
          value={myApprovals.length}
          subtitle={`${myApprovals.filter(a => a.status === 'pending').length} pending manager review`}
          icon={FileCheck2}
          accentColor="amber"
        />
        <StatCard
          title="My Supervisor"
          value={manager?.name || 'David Miller'}
          subtitle={manager?.title || 'Senior Operations Manager'}
          icon={UserCheck}
          accentColor="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'tasks'
              ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CheckSquare className="h-4 w-4" /> My Assigned Queue ({myTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileCheck2 className="h-4 w-4" /> My Submitted Requests ({myApprovals.length})
        </button>

        <button
          onClick={() => setActiveTab('scorecard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'scorecard'
              ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="h-4 w-4" /> Daily Scorecard & Quotas
        </button>
      </div>

      {/* Tab 1: My Tasks */}
      {activeTab === 'tasks' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={taskSearch}
                onChange={e => setTaskSearch(e.target.value)}
                placeholder="Search assigned tasks by title or category..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All Tasks</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredMyTasks.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-slate-800 bg-slate-950/40">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500/60 mb-2" />
                <p className="text-sm font-semibold text-white">No active tasks in queue</p>
                <p className="text-xs text-slate-500 mt-1">All assigned tickets have been cleared!</p>
              </div>
            ) : (
              filteredMyTasks.map(t => (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                      <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                        {t.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>Target Due: <strong className="text-emerald-400">{t.dueDate}</strong></span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{t.title}</h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{t.description}</p>
                  </div>

                  {t.tags && t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {t.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="text-slate-400">
                      Manager: <strong className="text-slate-200">{t.managerName}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Update My Status:</span>
                      <button
                        onClick={() => handleStatusChange(t.id, 'todo')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                          t.status === 'todo'
                            ? 'bg-slate-800 text-white border border-slate-600'
                            : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        To Do
                      </button>
                      <button
                        onClick={() => handleStatusChange(t.id, 'in_progress')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                          t.status === 'in_progress'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleStatusChange(t.id, 'review')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                          t.status === 'review'
                            ? 'bg-purple-950 text-purple-300 border border-purple-700'
                            : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        Submit Review
                      </button>
                      <button
                        onClick={() => handleStatusChange(t.id, 'completed')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                          t.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: My Submitted Requests */}
      {activeTab === 'requests' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-emerald-400" /> My Reimbursements & Approval Requests
              </h3>
              <p className="text-xs text-slate-400">
                Track status of expense claims, volume discounts, and PTO leave submitted to your Manager.
              </p>
            </div>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow"
            >
              + Submit New Claim
            </button>
          </div>

          <div className="space-y-3">
            {myApprovals.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">No claims or request applications submitted yet.</p>
            ) : (
              myApprovals.map(a => (
                <div
                  key={a.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ApprovalBadge status={a.status} />
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                        {a.type}
                      </span>
                      {a.amount && (
                        <span className="text-xs font-mono text-emerald-400 font-semibold">{a.amount}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{a.requestedDate}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{a.title}</h4>
                  <p className="text-xs text-slate-300">{a.details}</p>

                  {a.responseNote && (
                    <div className="mt-2 rounded bg-slate-900 p-2 text-xs text-slate-400 border border-slate-800">
                      <strong>Manager Response Note:</strong> {a.responseNote}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Daily Scorecard */}
      {activeTab === 'scorecard' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-400" /> Personal KPI & Daily Performance Scorecard
            </h3>
            <p className="text-xs text-slate-400">
              Live tracking of your ticket throughput, customer feedback ratings, and response times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">Quarterly Target Quota</div>
              <div className="text-2xl font-bold text-emerald-400">88% Completed</div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[88%]" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">Client Feedback Rating</div>
              <div className="text-2xl font-bold text-amber-400">4.9 / 5.0</div>
              <p className="text-[11px] text-slate-500">Top 5% agent in West Region</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">Avg Response Speed</div>
              <div className="text-2xl font-bold text-blue-400">12.5 Minutes</div>
              <p className="text-[11px] text-slate-500">Exceeds team SLA expectation</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Claim Modal */}
      <SubmitRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
};
