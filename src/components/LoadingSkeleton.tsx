import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md mb-3"></div>
      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded-md mb-2"></div>
      <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded-md mb-4"></div>
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-3"></div>
            <div className="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
          </div>
        ))}
      </div>

      {/* Projects Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
