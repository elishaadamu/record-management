import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useData } from '@context/DataContext';
import { StatCard } from '@components/Common/StatCard';
import { RoleBadge } from '@components/Common/Badge';
import { UserManagementModal } from './UserManagementModal';
import { RolePermissionsTable } from '@components/Common/RolePermissionsTable';
import {
  Users,
  Shield,
  Activity,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Search,
  Filter,
  Sliders,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { User, UserRole } from '@types';

export const AdminDashboard: React.FC = () => {
  const { users, currentUser, deleteUser } = useAuth();
  const { auditLogs, settings, updateSettings, addAuditLog } = useData();

  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'audit' | 'settings'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [logFilter, setLogFilter] = useState<string>('all');

  // KPI Calculations
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const managerCount = users.filter(u => u.role === 'manager').length;
  const agentCount = users.filter(u => u.role === 'agent').length;

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredLogs = auditLogs.filter(log => {
    if (logFilter === 'all') return true;
    return log.type === logFilter;
  });

  const handleOpenAddModal = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setUserToEdit(u);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (currentUser && currentUser.id === id) {
      alert("You cannot delete your own active Admin account!");
      return;
    }
    if (confirm(`Are you sure you want to revoke and delete account for "${name}"?`)) {
      deleteUser(id);
      if (currentUser) {
        addAuditLog(
          currentUser.name,
          currentUser.role,
          'Account Deleted',
          `Revoked access and deleted account for user "${name}"`,
          'user'
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-purple-800/40 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 p-6 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
            <Shield className="h-4 w-4" /> System Administrator Control Center
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome back, {currentUser?.name}</h1>
          <p className="text-sm text-slate-300 mt-1">
            Full authority over user accounts, role definitions, security logs, and operational controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all"
          >
            <UserPlus className="h-4 w-4" /> Provision New User
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Registered Accounts"
          value={totalUsers}
          subtitle={`${adminCount} Admins • ${managerCount} Managers • ${agentCount} Agents`}
          icon={Users}
          accentColor="purple"
        />
        <StatCard
          title="Active Field & Support Agents"
          value={agentCount}
          subtitle="Handling live task dispatches"
          icon={Users}
          accentColor="emerald"
        />
        <StatCard
          title="Security Events Logged"
          value={auditLogs.length}
          subtitle="Real-time access audit trail"
          icon={Activity}
          accentColor="blue"
        />
        <StatCard
          title="System Status"
          value={settings.maintenanceMode ? 'Maintenance Mode' : 'Optimal'}
          subtitle={settings.maintenanceMode ? 'Restricted agent login' : 'All services operational'}
          icon={Shield}
          accentColor={settings.maintenanceMode ? 'rose' : 'emerald'}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="h-4 w-4" /> User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'matrix'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Lock className="h-4 w-4" /> Role Permissions Matrix
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="h-4 w-4" /> Security Audit Log ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-700/60 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" /> System Policy Settings
        </button>
      </div>

      {/* Tab 1: Users Table */}
      {activeTab === 'users' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
          {/* Filters & Search */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or department..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-xs text-slate-400 font-medium">Role:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="manager">Managers</option>
                <option value="agent">Agents</option>
              </select>

              <button
                onClick={handleOpenAddModal}
                className="ml-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-3 py-2 text-xs font-bold text-white shadow"
              >
                + Add User
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department & Title</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          <div className="text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <RoleBadge role={u.role} />
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{u.title}</div>
                      <div className="text-slate-500">{u.department}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          u.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : u.status === 'suspended'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {u.lastLogin || 'Never'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Edit User"
                        >
                          <Edit2 className="h-4 w-4 text-blue-400" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950 hover:text-rose-300"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4 text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Permissions Matrix */}
      {activeTab === 'matrix' && <RolePermissionsTable />}

      {/* Tab 3: Security & Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" /> Real-time System Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Immutable security logs tracking authentication, role updates, and system policy changes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Log Type:</span>
              <select
                value={logFilter}
                onChange={e => setLogFilter(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-3 text-xs text-white"
              >
                <option value="all">All Events</option>
                <option value="security">Security & Auth</option>
                <option value="user">User Account Changes</option>
                <option value="task">Task Dispatches</option>
                <option value="system">System Policies</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg border border-slate-800 bg-slate-900 p-2">
                    <FileText className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{log.action}</span>
                      <RoleBadge role={log.actorRole} size="sm" />
                    </div>
                    <p className="mt-1 text-slate-300">{log.details}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Actor: <strong className="text-slate-300">{log.actorName}</strong></span>
                      <span>•</span>
                      <span className="capitalize">Type: {log.type}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 text-slate-500 font-mono text-[11px] sm:text-right">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: System Policy Settings */}
      {activeTab === 'settings' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-purple-400" /> System Governance & Access Policy
            </h3>
            <p className="text-xs text-slate-400">
              Configure global system controls, authentication timeouts, and system notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">System Maintenance Mode</h4>
                  <p className="text-xs text-slate-400">Restrict logins to Admin accounts only for upgrades.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={e => {
                    updateSettings({ maintenanceMode: e.target.checked });
                    if (currentUser) {
                      addAuditLog(
                        currentUser.name,
                        currentUser.role,
                        'Maintenance Mode Changed',
                        `Toggled system maintenance mode to ${e.target.checked}`,
                        'system'
                      );
                    }
                  }}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">Require Multi-Factor Authentication (MFA)</h4>
                  <p className="text-xs text-slate-400">Mandate secondary authenticator for Manager & Admin roles.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireMFA}
                  onChange={e => updateSettings({ requireMFA: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">Allow Agent Task Self-Assignment</h4>
                  <p className="text-xs text-slate-400">Permit Agents to claim open unassigned pool tasks.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowAgentTaskSelfAssign}
                  onChange={e => updateSettings({ allowAgentTaskSelfAssign: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Idle Session Timeout ({settings.sessionTimeoutMinutes} Minutes)
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={settings.sessionTimeoutMinutes}
                  onChange={e => updateSettings({ sessionTimeoutMinutes: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>5 mins</span>
                  <span>30 mins</span>
                  <span>120 mins</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Global System Broadcast Banner
                </label>
                <textarea
                  rows={3}
                  value={settings.broadcastBannerMessage}
                  onChange={e => updateSettings({ broadcastBannerMessage: e.target.value })}
                  placeholder="System wide alert message displayed to all users..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      <UserManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
      />
    </div>
  );
};
