import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-800/70 rounded-lg ${className}`} />
);

export const StatCardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 shadow-md animate-pulse">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
    <Skeleton className="h-7 w-36" />
    <Skeleton className="h-3 w-48" />
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="animate-pulse border-b border-slate-800/60">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-3 px-4">
        <Skeleton className={`h-3.5 ${i === 0 ? 'w-20' : i === 1 ? 'w-36' : i === cols - 1 ? 'w-16 ml-auto' : 'w-24'}`} />
      </td>
    ))}
  </tr>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} cols={cols} />
    ))}
  </>
);
