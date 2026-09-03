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
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0c2016 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.15)' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--mfct-gold)',
                border: '1px solid rgba(200,168,75,0.3)',
              }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> Active Verified Community Member
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm flex items-center gap-2" style={{ color: 'rgba(200,168,75,0.85)' }}>
              <Building2 className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
              <span>{user.communityName} • {user.city}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenDonate}
              className="mfct-btn-gold py-3 px-5 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
            >
              <Heart className="w-4 h-4 fill-current" /> Donate Now
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">Total Donated</span>
          <p className="text-2xl font-extrabold mt-1 truncate text-emerald-600 dark:text-emerald-400">₹ {totalDonatedAmount.toLocaleString('en-IN')}</p>
          <span className="text-[11px] font-semibold mt-1 block truncate text-amber-600 dark:text-amber-400">100% Tax Exempt (80G)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">Contributions Made</span>
          <p className="text-2xl font-extrabold mt-1 truncate text-slate-900 dark:text-white">{totalDonationsCount} {totalDonationsCount === 1 ? 'Donation' : 'Donations'}</p>
          <span className="text-[11px] mt-1 block truncate text-slate-500 dark:text-slate-400">Across Verified Causes</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">Member ID</span>
          <p className="text-base font-mono font-bold mt-1.5 truncate text-emerald-600 dark:text-emerald-400">{user.membershipId}</p>
          <span className="text-[11px] mt-1 block truncate text-slate-500 dark:text-slate-400">Joined: {user.joinDate}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">Community Status</span>
          <p className="text-sm font-bold mt-1.5 flex items-center gap-1.5 truncate text-slate-900 dark:text-white">
            {user.religion === 'Muslim' ? (
              user.isMalikENisab ? 'Muslim • Sahib-e-Nisab' : `Muslim • ${user.helpType || 'Aid'} Eligible`
            ) : user.religion ? (
              `${user.religion} Member`
            ) : (
              'Verified Member'
            )}
          </p>
          <span className="text-[11px] mt-1 block truncate text-slate-500 dark:text-slate-400">
            {user.religion === 'Muslim' && !user.isMalikENisab && user.helpDetails ? user.helpDetails : `${user.city || 'Verified'} Chapter`}
          </span>
        </div>
      </div>
    </div>
  );
};
