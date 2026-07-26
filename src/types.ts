export type UserRole = 'admin' | 'manager' | 'agent' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  title: string;
  lastLogin?: string;
  phone?: string;
  assignedManagerId?: string;
}

export interface Permission {
  id: string;
  category: 'User Management' | 'Team & Tasks' | 'Approvals' | 'System & Security' | 'Reports';
  name: string;
  description: string;
  admin: boolean;
  manager: boolean;
  agent: boolean;
  user?: boolean;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedAgentId: string;
  assignedAgentName: string;
  managerId: string;
  managerName: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  tags: string[];
}

export type ApprovalType = 'expense' | 'discount' | 'timeoff' | 'contract';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  amount?: string;
  agentId: string;
  agentName: string;
  managerId?: string;
  status: ApprovalStatus;
  requestedDate: string;
  details: string;
  responseNote?: string;
  reviewedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  type: 'security' | 'user' | 'task' | 'approval' | 'system';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRole?: UserRole | 'all';
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface SystemSettings {
  maintenanceMode: boolean;
  sessionTimeoutMinutes: number;
  requireMFA: boolean;
  allowAgentTaskSelfAssign: boolean;
  broadcastBannerMessage: string;
}
