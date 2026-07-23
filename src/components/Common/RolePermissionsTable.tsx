import React from 'react';
import { SYSTEM_PERMISSIONS } from '../../data/mockData';
import { Check, X, Shield, Users, UserCheck } from 'lucide-react';

export const RolePermissionsTable: React.FC = () => {
  const categories = Array.from(new Set(SYSTEM_PERMISSIONS.map(p => p.category)));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" /> Role Access & Security Matrix
          </h3>
          <p className="text-sm text-slate-400">
            System permissions defined across Admin, Manager, and Agent user roles.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-4 font-semibold">Capability / Permission</th>
              <th className="py-3 px-4 text-center font-semibold text-purple-400">
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> Admin
                </span>
              </th>
              <th className="py-3 px-4 text-center font-semibold text-blue-400">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Manager
                </span>
              </th>
              <th className="py-3 px-4 text-center font-semibold text-emerald-400">
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" /> Agent
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {categories.map(category => (
              <React.Fragment key={category}>
                <tr className="bg-slate-950/30">
                  <td colSpan={4} className="py-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {category}
                  </td>
                </tr>
                {SYSTEM_PERMISSIONS.filter(p => p.category === category).map(perm => (
                  <tr key={perm.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{perm.name}</div>
                      <div className="text-xs text-slate-500">{perm.description}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm.admin ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-950 text-purple-400 border border-purple-800/50">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/40 text-slate-600">
                          <X className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm.manager ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-950 text-blue-400 border border-blue-800/50">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/40 text-slate-600">
                          <X className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm.agent ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/40 text-slate-600">
                          <X className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
