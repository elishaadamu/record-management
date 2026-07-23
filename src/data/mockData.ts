import { User, Permission, TaskItem, ApprovalRequest, AuditLog, AppNotification, SystemSettings } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-101',
    name: 'Sarah Connor',
    email: 'admin@ops.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Executive Operations',
    status: 'active',
    title: 'Chief Operations Administrator',
    lastLogin: '2026-07-23 12:15 PM',
    phone: '+1 (555) 019-2834'
  },
  {
    id: 'u-102',
    name: 'David Miller',
    email: 'manager@ops.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    department: 'Regional Operations & Support',
    status: 'active',
    title: 'Senior Operations Manager',
    lastLogin: '2026-07-23 11:40 AM',
    phone: '+1 (555) 014-8890'
  },
  {
    id: 'u-103',
    name: 'Alex Rivera',
    email: 'agent@ops.com',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Client Services & Sales',
    status: 'active',
    title: 'Senior Support & Field Agent',
    lastLogin: '2026-07-23 12:02 PM',
    phone: '+1 (555) 012-4411',
    assignedManagerId: 'u-102'
  },
  {
    id: 'u-104',
    name: 'Elena Rostova',
    email: 'elena.r@ops.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Technical Logistics',
    status: 'active',
    title: 'Logistics Manager',
    lastLogin: '2026-07-23 09:15 AM',
    phone: '+1 (555) 017-9921'
  },
  {
    id: 'u-105',
    name: 'Marcus Vance',
    email: 'marcus.v@ops.com',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Client Services & Sales',
    status: 'active',
    title: 'Support Specialist',
    lastLogin: '2026-07-23 10:30 AM',
    phone: '+1 (555) 018-3322',
    assignedManagerId: 'u-102'
  },
  {
    id: 'u-106',
    name: 'Chloe Bennett',
    email: 'chloe.b@ops.com',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'Technical Logistics',
    status: 'active',
    title: 'Field Logistics Agent',
    lastLogin: '2026-07-22 04:50 PM',
    phone: '+1 (555) 011-7788',
    assignedManagerId: 'u-104'
  }
];

export const SYSTEM_PERMISSIONS: Permission[] = [
  {
    id: 'p1',
    category: 'User Management',
    name: 'Create & Edit Users',
    description: 'Add new user accounts, modify profile info, and reset passwords.',
    admin: true,
    manager: false,
    agent: false
  },
  {
    id: 'p2',
    category: 'User Management',
    name: 'Assign User Roles',
    description: 'Grant or revoke Admin, Manager, and Agent roles across accounts.',
    admin: true,
    manager: false,
    agent: false
  },
  {
    id: 'p3',
    category: 'Team & Tasks',
    name: 'Dispatch & Assign Tasks',
    description: 'Assign operational tickets and deliverables to team agents.',
    admin: true,
    manager: true,
    agent: false
  },
  {
    id: 'p4',
    category: 'Team & Tasks',
    name: 'Execute Assigned Tasks',
    description: 'Work on assigned tasks, log progress comments, and update status.',
    admin: true,
    manager: true,
    agent: true
  },
  {
    id: 'p5',
    category: 'Approvals',
    name: 'Submit Approval Requests',
    description: 'Submit expense claims, discount waivers, and time-off requests.',
    admin: true,
    manager: true,
    agent: true
  },
  {
    id: 'p6',
    category: 'Approvals',
    name: 'Review & Approve Requests',
    description: 'Authorize or reject pending agent claims with audit feedback.',
    admin: true,
    manager: true,
    agent: false
  },
  {
    id: 'p7',
    category: 'System & Security',
    name: 'View Security Audit Logs',
    description: 'Inspect full system access logs, role changes, and auth attempts.',
    admin: true,
    manager: false,
    agent: false
  },
  {
    id: 'p8',
    category: 'System & Security',
    name: 'Manage System Settings',
    description: 'Toggle maintenance mode, set session timeouts, and MFA policies.',
    admin: true,
    manager: false,
    agent: false
  },
  {
    id: 'p9',
    category: 'Reports',
    name: 'Access Global KPI Reports',
    description: 'View cross-departmental financial and productivity analytics.',
    admin: true,
    manager: true,
    agent: false
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-201',
    title: 'Enterprise Onboarding & Infrastructure Setup',
    description: 'Provision secure tenant credentials, configure SSO integration, and verify firewall rules for Acme Corp.',
    assignedAgentId: 'u-103',
    assignedAgentName: 'Alex Rivera',
    managerId: 'u-102',
    managerName: 'David Miller',
    priority: 'urgent',
    status: 'in_progress',
    category: 'Client Onboarding',
    dueDate: '2026-07-25',
    createdAt: '2026-07-22',
    updatedAt: '2026-07-23',
    commentsCount: 4,
    tags: ['Security', 'Acme', 'Priority-1']
  },
  {
    id: 'tsk-202',
    title: 'Quarterly Inventory & Asset Audit',
    description: 'Perform physical count and serial code audit for field hardware inventory in Warehouse B.',
    assignedAgentId: 'u-103',
    assignedAgentName: 'Alex Rivera',
    managerId: 'u-102',
    managerName: 'David Miller',
    priority: 'high',
    status: 'todo',
    category: 'Logistics',
    dueDate: '2026-07-28',
    createdAt: '2026-07-21',
    updatedAt: '2026-07-21',
    commentsCount: 1,
    tags: ['Audit', 'Hardware']
  },
  {
    id: 'tsk-203',
    title: 'Customer Satisfaction Follow-up Survey',
    description: 'Contact top 15 tier-1 accounts regarding the recent service dispatch satisfaction rating.',
    assignedAgentId: 'u-105',
    assignedAgentName: 'Marcus Vance',
    managerId: 'u-102',
    managerName: 'David Miller',
    priority: 'medium',
    status: 'in_progress',
    category: 'Customer Support',
    dueDate: '2026-07-26',
    createdAt: '2026-07-20',
    updatedAt: '2026-07-23',
    commentsCount: 2,
    tags: ['CSAT', 'Outreach']
  },
  {
    id: 'tsk-204',
    title: 'Dispatch Fleet Maintenance Verification',
    description: 'Inspect vehicle diagnostics logs and verify annual inspection permits for West Region vans.',
    assignedAgentId: 'u-106',
    assignedAgentName: 'Chloe Bennett',
    managerId: 'u-104',
    managerName: 'Elena Rostova',
    priority: 'low',
    status: 'completed',
    category: 'Fleet Operations',
    dueDate: '2026-07-22',
    createdAt: '2026-07-18',
    updatedAt: '2026-07-22',
    commentsCount: 3,
    tags: ['Fleet', 'Maintenance']
  },
  {
    id: 'tsk-205',
    title: 'SLA Escalation Review - Ticket #8892',
    description: 'Investigate delay in server replacement response time for Tech Dynamics account.',
    assignedAgentId: 'u-103',
    assignedAgentName: 'Alex Rivera',
    managerId: 'u-102',
    managerName: 'David Miller',
    priority: 'urgent',
    status: 'review',
    category: 'Escalation',
    dueDate: '2026-07-24',
    createdAt: '2026-07-23',
    updatedAt: '2026-07-23',
    commentsCount: 5,
    tags: ['Escalation', 'SLA']
  }
];

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr-301',
    type: 'expense',
    title: 'Client Onboarding Dinner & Travel Expense',
    amount: '$345.50',
    agentId: 'u-103',
    agentName: 'Alex Rivera',
    managerId: 'u-102',
    status: 'pending',
    requestedDate: '2026-07-22 05:30 PM',
    details: 'Dinner meeting with Acme Corp CTO and lead DevOps engineer after successful system deployment.'
  },
  {
    id: 'appr-302',
    type: 'discount',
    title: '15% Volume Renewal Discount for Global Logistics',
    amount: '15% Off ($2,400 value)',
    agentId: 'u-105',
    agentName: 'Marcus Vance',
    managerId: 'u-102',
    status: 'pending',
    requestedDate: '2026-07-23 09:15 AM',
    details: 'Customer requesting multi-year commitment discount in exchange for immediate 3-year contract extension.'
  },
  {
    id: 'appr-303',
    type: 'timeoff',
    title: 'PTO Request - 3 Days Field Duty Leave',
    agentId: 'u-106',
    agentName: 'Chloe Bennett',
    managerId: 'u-104',
    status: 'approved',
    requestedDate: '2026-07-20 10:00 AM',
    details: 'Personal leave from August 10 to August 12. Backup coverage provided by Marcus Vance.',
    responseNote: 'Approved. Enjoy your time off!',
    reviewedAt: '2026-07-21 02:15 PM'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-501',
    timestamp: '2026-07-23 12:15:02',
    actorName: 'Sarah Connor',
    actorRole: 'admin',
    action: 'User Role Update',
    details: 'Updated Marcus Vance role permissions to enable Lead Dispatcher override.',
    type: 'security'
  },
  {
    id: 'log-502',
    timestamp: '2026-07-23 11:40:18',
    actorName: 'David Miller',
    actorRole: 'manager',
    action: 'Task Reassigned',
    details: 'Assigned "Enterprise Onboarding & Infrastructure Setup" to Alex Rivera.',
    type: 'task'
  },
  {
    id: 'log-503',
    timestamp: '2026-07-23 11:05:44',
    actorName: 'Alex Rivera',
    actorRole: 'agent',
    action: 'Authentication Success',
    details: 'Logged into Operations Portal via IP 192.168.1.104.',
    type: 'security'
  },
  {
    id: 'log-504',
    timestamp: '2026-07-23 09:15:30',
    actorName: 'Marcus Vance',
    actorRole: 'agent',
    action: 'Approval Submitted',
    details: 'Submitted 15% Volume Renewal Discount request for Manager review.',
    type: 'approval'
  },
  {
    id: 'log-505',
    timestamp: '2026-07-22 16:20:00',
    actorName: 'Sarah Connor',
    actorRole: 'admin',
    action: 'System Policy Configured',
    details: 'Enforced 30-minute idle session timeout policy across all accounts.',
    type: 'system'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-101',
    title: 'New High Priority Task Assigned',
    message: 'David Miller assigned "SLA Escalation Review - Ticket #8892" to your queue.',
    timestamp: '25m ago',
    read: false,
    targetRole: 'agent',
    type: 'alert'
  },
  {
    id: 'notif-102',
    title: 'Approval Request Pending',
    message: 'Alex Rivera submitted a new $345.50 Expense Claim requiring Manager authorization.',
    timestamp: '1h ago',
    read: false,
    targetRole: 'manager',
    type: 'warning'
  },
  {
    id: 'notif-103',
    title: 'System Audit Alert',
    message: 'Daily security audit completed cleanly. No unauthorized access attempts detected.',
    timestamp: '2h ago',
    read: true,
    targetRole: 'admin',
    type: 'success'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  sessionTimeoutMinutes: 30,
  requireMFA: false,
  allowAgentTaskSelfAssign: true,
  broadcastBannerMessage: 'System Maintenance Scheduled for Saturday 02:00 AM UTC. No downtime anticipated.'
};
