import React from 'react';

// --- LIGHT THEME SKELETONS (Website) ---
export const CardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between animate-pulse">
    <div className="h-40 bg-slate-200 w-full" />
    <div className="p-5 space-y-4 flex-1">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="h-4 bg-slate-200 rounded w-4/6" />
      </div>
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-1/3" />
      </div>
    </div>
  </div>
);

export const TestimonialSkeleton = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 animate-pulse">
    <div className="space-y-3">
      <div className="w-8 h-8 rounded bg-slate-200" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
    </div>
    <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-slate-200" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
  </div>
);

// --- DARK THEME SKELETONS (Admin / Dashboards) ---
export const DarkCardSkeleton = () => (
  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 animate-pulse">
    <div className="h-10 w-10 bg-slate-800 rounded-full" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-800 rounded w-full" />
      <div className="h-4 bg-slate-800 rounded w-5/6" />
    </div>
    <div className="h-3 bg-slate-800 rounded w-1/2 mt-4" />
  </div>
);

export const DarkTableSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-pulse">
    <div className="bg-slate-800/50 h-10 border-b border-slate-800" />
    <div className="divide-y divide-slate-800/50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 flex items-center px-4 gap-4">
          <div className="h-4 bg-slate-800 rounded flex-1" />
          <div className="h-4 bg-slate-800 rounded flex-1" />
          <div className="h-4 bg-slate-800 rounded flex-1" />
        </div>
      ))}
    </div>
  </div>
);

export const DarkListSkeleton = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="bg-slate-800/50 rounded-xl p-4 flex gap-4 items-center">
        <div className="w-10 h-10 bg-slate-700 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-700 rounded w-1/3" />
          <div className="h-3 bg-slate-700 rounded w-1/4" />
        </div>
      </div>
    ))}
  </div>
);
