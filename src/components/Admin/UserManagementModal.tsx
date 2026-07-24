import React, { useState, useEffect } from 'react';
import { Modal } from '@components/Common/Modal';
import { User, UserRole } from '@types';
import { useAuth } from '@context/AuthContext';
import { useData } from '@context/DataContext';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  userToEdit
}) => {
  const { addUser, updateUser, users, currentUser } = useAuth();
  const { addAuditLog } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('agent');
  const [department, setDepartment] = useState('Client Services');
  const [title, setTitle] = useState('Operations Specialist');
  const [status, setStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  const [phone, setPhone] = useState('+1 (555) 019-0000');
  const [assignedManagerId, setAssignedManagerId] = useState('');

  const managers = users.filter(u => u.role === 'manager');

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setDepartment(userToEdit.department);
      setTitle(userToEdit.title);
      setStatus(userToEdit.status);
      setPhone(userToEdit.phone || '');
      setAssignedManagerId(userToEdit.assignedManagerId || '');
    } else {
      setName('');
      setEmail('');
      setRole('agent');
      setDepartment('Client Services');
      setTitle('Operations Specialist');
      setStatus('active');
      setPhone('+1 (555) 019-0000');
      setAssignedManagerId(managers[0]?.id || '');
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const avatar = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 10000000)}?w=150&auto=format&fit=crop&q=80`;

    if (userToEdit) {
      updateUser(userToEdit.id, {
        name,
        email,
        role,
        department,
        title,
        status,
        phone,
        assignedManagerId: role === 'agent' ? assignedManagerId : undefined
      });

      if (currentUser) {
        addAuditLog(
          currentUser.name,
          currentUser.role,
          'User Profile Updated',
          `Updated account profile for ${name} (${role.toUpperCase()})`,
          'user'
        );
      }
    } else {
      const created = addUser({
        name,
        email,
        role,
        department,
        title,
        status,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone,
        assignedManagerId: role === 'agent' ? assignedManagerId : undefined
      });

      if (currentUser) {
        addAuditLog(
          currentUser.name,
          currentUser.role,
          'New User Provisioned',
          `Provisioned new user ${created.name} (${created.email}) with ${created.role.toUpperCase()} role.`,
          'user'
        );
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? `Edit User Profile: ${userToEdit.name}` : 'Provision New Portal User'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane.doe@ops.com"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">User Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="admin">Admin (System Director)</option>
              <option value="manager">Manager (Operations Supervisor)</option>
              <option value="agent">Agent (Field & Support Specialist)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Regional Support"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Lead Dispatcher"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {role === 'agent' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Manager</label>
            <select
              value={assignedManagerId}
              onChange={e => setAssignedManagerId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">-- Select Assigned Manager --</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
          </div>
        )}

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
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-pure-white hover:bg-indigo-500 shadow-md"
          >
            {userToEdit ? 'Save Changes' : 'Provision User Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
