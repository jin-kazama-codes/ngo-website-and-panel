import React from 'react';
import { CheckCircle2, UserPlus } from 'lucide-react';
import { useAppState } from '../providers/AppStateProvider';

export const MembershipBanner: React.FC = () => {
  const { handleOpenRegister } = useAppState();

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden mt-8 mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-8 space-y-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 inline-block">
            ₹50 Annual Solidarity Membership
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Join Your Local Community Network
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Become a verified member of your city’s local community hub. Paying the ₹50 annual membership fee builds our solidarity emergency escrow, grants you a Digital Member ID, and qualifies you for priority emergency community aid.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Digital Member ID Card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Emergency Aid Eligibility</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Aadhaar KYC Badge</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-3">
          <button
            onClick={handleOpenRegister}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Become a Member Now (₹50)
          </button>
          <span className="text-[11px] text-slate-400 text-center lg:text-right">
            Instant digital card generation upon registration
          </span>
        </div>
      </div>
    </div>
  );
};
