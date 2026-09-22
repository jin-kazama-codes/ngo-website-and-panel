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

// --- UNIVERSAL TABLE SKELETON (Light & Dark Theme) ---
export const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs animate-pulse">
    {/* Header Row */}
    <div className="bg-slate-50 dark:bg-slate-800/70 h-12 border-b border-slate-200 dark:border-slate-700/80 flex items-center px-6 gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md"
          style={{ width: `${Math.max(15, 100 / cols - 4)}%` }}
        />
      ))}
    </div>
    {/* Body Rows */}
    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="h-16 flex items-center px-6 gap-4 hover:bg-slate-50/50">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex-1 space-y-1.5">
              <div
                className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded"
                style={{ width: c === 0 ? '75%' : c === 1 ? '90%' : '60%' }}
              />
              {c === 0 && <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// --- ADMIN COMMUNITY CARD SKELETON ---
export const AdminCommunityCardSkeleton = () => (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs animate-pulse space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800/70 rounded w-24" />
        </div>
      </div>
      <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
    </div>

    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800">
      <div className="space-y-1 text-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 mx-auto" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800/70 rounded w-14 mx-auto" />
      </div>
      <div className="space-y-1 text-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 mx-auto" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800/70 rounded w-14 mx-auto" />
      </div>
      <div className="space-y-1 text-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 mx-auto" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800/70 rounded w-14 mx-auto" />
      </div>
    </div>

    <div className="flex items-center justify-between gap-2 pt-1">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-24" />
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  </div>
);

// --- ACCOUNT CARD SKELETON ---
export const AccountCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse space-y-6">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="space-y-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-44" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-28" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>

    {/* Body fields */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-32 font-mono" />
      </div>
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-28 font-mono" />
      </div>
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-14" />
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-36 font-mono" />
      </div>
    </div>

    {/* QR preview block */}
    <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  </div>
);

// --- MEETING CARD SKELETON ---
export const MeetingCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-pulse space-y-3">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="h-4 bg-slate-100 dark:bg-slate-800/80 rounded w-full" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800/80 rounded w-full" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800/80 rounded w-full" />
    </div>

    <div className="h-10 bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-800" />
  </div>
);

// --- DISTRICT COMMITTEE BOARD SKELETON ---
export const DistrictCommitteeBoardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-12 bg-slate-200 dark:bg-slate-800/90" />
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-28 rounded-full bg-slate-100 dark:bg-slate-800/70" />
              </div>
              <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-3.5 w-4/5 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

