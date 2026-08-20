'use client';

import React, { useState, useEffect } from 'react';
import { User, Donation } from '../../types';
import { getDonations } from '../../services/donationService';
import { ShieldCheck, Heart, Download, Building2, CheckCircle2, QrCode, FileText } from 'lucide-react';

interface MemberDashboardProps {
  user: User;
  onOpenDonate: () => void;
  onOpenMembershipCard: () => void;
  onSelectDonationReceipt: (donation: Donation) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  user,
  onOpenDonate,
  onOpenMembershipCard,
  onSelectDonationReceipt,
}) => {
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDonations(user.id)
      .then(setUserDonations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const totalDonatedAmount = userDonations.reduce((sum, donation) => sum + donation.amountINR, 0);
  const totalDonationsCount = userDonations.length;


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/20 dark:bg-emerald-500/20 text-emerald-100 dark:text-emerald-300 text-xs font-bold border border-emerald-100/30 dark:border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-100 dark:text-emerald-400" /> Active Verified Community Member
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50 dark:text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-200 dark:text-emerald-400 shrink-0" />
              <span>{user.communityName} • {user.city}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* <button
              onClick={onOpenMembershipCard}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 shadow-sm"
            >
              <QrCode className="w-4 h-4" /> View Digital ID Card
            </button> */}
            <button
              onClick={onOpenDonate}
              className="py-3 px-5 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white text-xs font-bold transition-all shadow-lg shadow-black/10 dark:shadow-emerald-600/30 flex items-center gap-2 cursor-pointer cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current" /> Donate Now
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Donated</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹ {totalDonatedAmount.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">100% Tax Exempt (80G)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Contributions Made</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalDonationsCount} {totalDonationsCount === 1 ? 'Donation' : 'Donations'}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Across Verified Causes</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Member ID</span>
          <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-500 mt-1">{user.membershipId}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Joined: {user.joinDate}</span>
        </div>


      </div>
    </div>
  );
};
