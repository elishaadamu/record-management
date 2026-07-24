import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useData } from '@context/DataContext';
import { StatCard } from '@components/Common/StatCard';
import { RoleBadge, PriorityBadge, StatusBadge, ApprovalBadge } from '@components/Common/Badge';
import { AssignTaskModal } from './AssignTaskModal';
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  BarChart3,
  FileCheck2,
  Send,
  AlertCircle,
  Trash2,
  Calendar
} from 'lucide-react';
import { TaskStatus, ApprovalStatus } from '@types';

export const ManagerDashboard: React.FC = () => {
  const { users, currentUser } = useAuth();
  const { tasks, approvals, respondToApproval, updateTaskStatus, deleteTask, addAuditLog } = useData();

  const [activeTab, setActiveTab] = useState<'team' | 'tasks' | 'approvals' | 'analytics'>('team');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskAgentFilter, setTaskAgentFilter] = useState<string>('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState<Record<string, string>>({});

  const agents = users.filter(u => u.role === 'agent');
  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 100;

  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.assignedAgentName.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;
    const matchesAgent = taskAgentFilter === 'all' || t.assignedAgentId === taskAgentFilter;
    return matchesSearch && matchesStatus && matchesAgent;
  });

  const handleApprovalResponse = (id: string, status: 'approved' | 'rejected') => {
    const note = approvalNote[id] || (status === 'approved' ? 'Authorized by Manager.' : 'Declined by Manager.');
    respondToApproval(id, status, note);

    if (currentUser) {
      addAuditLog(
        currentUser.name,
        currentUser.role,
        `Approval Request ${status.toUpperCase()}`,
        `Manager ${currentUser.name} ${status} request #${id} with note: "${note}"`,
        'approval'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-blue-800/40 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 p-6 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
            <Users className="h-4 w-4" /> Operations Manager Hub
          </div>
          <h1 className="text-2xl font-extrabold text-white">Manager Portal — {currentUser?.name}</h1>
          <p className="text-sm text-slate-300 mt-1">
            Dispatch operational workloads, approve agent financial/time-off requests, and monitor team CSAT.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="h-4 w-4" /> Dispatch New Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Supervised Agents"
          value={agents.length}
          subtitle="Field & Support Specialists"
          icon={Users}
          accentColor="blue"
        />
        <StatCard
          title="Pending Approval Claims"
          value={pendingApprovals.length}
          subtitle={pendingApprovals.length > 0 ? 'Requires immediate action' : 'All clear'}
          icon={Clock}
          accentColor={pendingApprovals.length > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Active Dispatched Deliverables"
          value={tasks.length}
          subtitle={`${completedTasksCount} Completed Tasks`}
          icon={CheckSquare}
          accentColor="purple"
        />
        <StatCard
          title="Team SLA Completion Rate"
          value={`${completionRate}%`}
          subtitle="Target threshold > 85%"
          icon={BarChart3}
          accentColor="emerald"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'team'
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="h-4 w-4" /> Managed Agents ({agents.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'tasks'
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CheckSquare className="h-4 w-4" /> Task Dispatcher ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'approvals'
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileCheck2 className="h-4 w-4" /> Approvals Queue ({pendingApprovals.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Team Analytics
        </button>
      </div>

      {/* Tab 1: Managed Agents */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => {
            const agentTasks = tasks.filter(t => t.assignedAgentId === agent.id);
            const activeAgentTasks = agentTasks.filter(t => t.status !== 'completed');
            const agentPendingApprovals = approvals.filter(
              a => a.agentId === agent.id && a.status === 'pending'
            );

            return (
              <div
                key={agent.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                      <p className="text-xs text-slate-400">{agent.title}</p>
                    </div>
                  </div>
                  <RoleBadge role="agent" size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase">Active Tasks</div>
                    <div className="text-lg font-bold text-amber-400">{activeAgentTasks.length}</div>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase">Pending Claims</div>
                    <div className="text-lg font-bold text-purple-400">{agentPendingApprovals.length}</div>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-400">
                  <div><strong>Email:</strong> {agent.email}</div>
                  <div><strong>Phone:</strong> {agent.phone || 'N/A'}</div>
                  <div><strong>Department:</strong> {agent.department}</div>
                </div>

                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" /> Dispatch Task to {agent.name.split(' ')[0]}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Task Dispatcher */}
      {activeTab === 'tasks' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={taskSearch}
                onChange={e => setTaskSearch(e.target.value)}
                placeholder="Search tasks, agents, category..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={taskAgentFilter}
                onChange={e => setTaskAgentFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white"
              >
                <option value="all">All Agents</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>

              <select
                value={taskStatusFilter}
                onChange={e => setTaskStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-bold text-white shadow"
              >
                + Dispatch Task
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.map(t => (
              <div
                key={t.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Due: <strong>{t.dueDate}</strong></span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">{t.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{t.description}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span>Assigned Agent: <strong className="text-indigo-300">{t.assignedAgentName}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Change Status:</span>
                    <select
                      value={t.status}
                      onChange={e => updateTaskStatus(t.id, e.target.value as TaskStatus)}
                      className="rounded bg-slate-900 border border-slate-700 py-1 px-2 text-xs text-white"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      onClick={() => deleteTask(t.id)}
                      className="rounded p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Approvals Queue */}
      {activeTab === 'approvals' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-amber-400" /> Agent Approval Requests Queue
            </h3>
            <p className="text-xs text-slate-400">
              Review expense reimbursement claims, special volume discounts, and PTO leave authorization.
            </p>
          </div>

          <div className="space-y-4">
            {approvals.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">No approval requests submitted yet.</p>
            ) : (
              approvals.map(req => (
                <div
                  key={req.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ApprovalBadge status={req.status} />
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider bg-amber-950/50 px-2.5 py-0.5 rounded border border-amber-800/40">
                        {req.type} Claim
                      </span>
                      {req.amount && (
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                          {req.amount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{req.requestedDate}</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{req.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{req.details}</p>
                    <p className="text-xs text-slate-400 mt-1">Submitted by: <strong className="text-white">{req.agentName}</strong></p>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <input
                        type="text"
                        placeholder="Add decision feedback note for agent..."
                        value={approvalNote[req.id] || ''}
                        onChange={e =>
                          setApprovalNote({ ...approvalNote, [req.id]: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />

                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleApprovalResponse(req.id, 'rejected')}
                          className="flex items-center gap-1.5 rounded-lg border border-rose-800/80 bg-rose-950/60 hover:bg-rose-900 px-4 py-2 text-xs font-bold text-rose-300 transition-colors"
                        >
                          <XCircle className="h-4 w-4" /> Reject Request
                        </button>
                        <button
                          onClick={() => handleApprovalResponse(req.id, 'approved')}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" /> Authorize & Approve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                      <div>
                        <strong>Manager Feedback:</strong> {req.responseNote || 'No notes left.'}
                      </div>
                      <div>Reviewed: {req.reviewedAt}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Team Analytics */}
      {activeTab === 'analytics' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" /> Operational Team SLA & Performance Metrics
            </h3>
            <p className="text-xs text-slate-400">
              Response time trends, CSAT feedback distribution, and monthly agent throughput.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">Average First Contact Resolution</div>
              <div className="text-2xl font-bold text-emerald-400">92.4%</div>
              <p className="text-[11px] text-slate-500">+3.1% compared to last month</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">Customer CSAT Score</div>
              <div className="text-2xl font-bold text-amber-400">4.8 / 5.0</div>
              <p className="text-[11px] text-slate-500">Based on 142 client reviews</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">Avg SLA Dispatch Time</div>
              <div className="text-2xl font-bold text-blue-400">18 Minutes</div>
              <p className="text-[11px] text-slate-500">Target SLA limit: 30 mins</p>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Task Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  );
};
