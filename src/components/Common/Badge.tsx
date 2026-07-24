import React from 'react';
import { UserRole, TaskPriority, TaskStatus, ApprovalStatus } from '@types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  const roleStyles: Record<UserRole, { bg: string; text: string; border: string; label: string }> = {
    admin: {
      bg: 'bg-purple-950/80',
      text: 'text-purple-300',
      border: 'border-purple-700/60',
      label: 'Admin'
    },
    manager: {
      bg: 'bg-blue-950/80',
      text: 'text-blue-300',
      border: 'border-blue-700/60',
      label: 'Manager'
    },
    agent: {
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-300',
      border: 'border-emerald-700/60',
      label: 'Agent'
    }
  };

  const style = roleStyles[role];

  return (
    <span
      className={`inline-flex items-center rounded-md border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]} tracking-wide`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${role === 'admin' ? 'bg-purple-400' : role === 'manager' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
      {style.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const styles: Record<TaskPriority, string> = {
    urgent: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    high: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    medium: 'bg-sky-950/80 text-sky-300 border-sky-800/60',
    low: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const styles: Record<TaskStatus, { label: string; class: string }> = {
    todo: { label: 'To Do', class: 'bg-slate-800 text-slate-300 border-slate-700' },
    in_progress: { label: 'In Progress', class: 'bg-amber-950/80 text-amber-300 border-amber-700/60' },
    review: { label: 'In Review', class: 'bg-purple-950/80 text-purple-300 border-purple-700/60' },
    completed: { label: 'Completed', class: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' }
  };

  const item = styles[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.class}`}>
      {item.label}
    </span>
  );
};

export const ApprovalBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  const styles: Record<ApprovalStatus, { label: string; class: string }> = {
    pending: { label: 'Pending Review', class: 'bg-amber-950/80 text-amber-300 border-amber-800/60' },
    approved: { label: 'Approved', class: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' },
    rejected: { label: 'Rejected', class: 'bg-rose-950/80 text-rose-300 border-rose-800/60' }
  };

  const item = styles[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.class}`}>
      {item.label}
    </span>
  );
};
