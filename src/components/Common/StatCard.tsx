import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue'
}) => {
  const accentClasses = {
    purple: 'bg-purple-900/30 text-purple-400 border-purple-700/50',
    blue: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
    emerald: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50',
    amber: 'bg-amber-900/30 text-amber-400 border-amber-700/50',
    rose: 'bg-rose-900/30 text-rose-400 border-rose-700/50'
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`rounded-lg border p-3 ${accentClasses[accentColor]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          <span className={trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-500">vs previous period</span>
        </div>
      )}
    </div>
  );
};
