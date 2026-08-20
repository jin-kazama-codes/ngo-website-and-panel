import React from 'react';

export const CampaignSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group animate-pulse">
      {/* Card Image Banner Skeleton */}
      <div className="relative h-52 bg-slate-200">
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="w-20 h-6 rounded-full bg-slate-300"></div>
          <div className="w-16 h-6 rounded-full bg-slate-300"></div>
        </div>
        <div className="absolute bottom-3 left-3 w-32 h-4 rounded-md bg-slate-300"></div>
      </div>

      {/* Card Body Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="w-3/4 h-6 rounded-md bg-slate-200 mb-2"></div>
          <div className="w-full h-4 rounded-md bg-slate-100 mb-1"></div>
          <div className="w-5/6 h-4 rounded-md bg-slate-100"></div>
        </div>

        {/* Progress Section Skeleton */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between">
            <div className="w-1/3 h-5 rounded-md bg-slate-200"></div>
            <div className="w-1/4 h-4 rounded-md bg-slate-200"></div>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"></div>
          <div className="flex items-center justify-between pt-1">
            <div className="w-16 h-3 rounded-md bg-slate-200"></div>
            <div className="w-16 h-3 rounded-md bg-slate-200"></div>
            <div className="w-8 h-3 rounded-md bg-slate-200"></div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="pt-2 flex items-center gap-2">
          <div className="h-10 rounded-xl bg-slate-200 flex-1"></div>
          <div className="h-10 rounded-xl bg-slate-200 flex-[0.7]"></div>
        </div>
      </div>
    </div>
  );
};
