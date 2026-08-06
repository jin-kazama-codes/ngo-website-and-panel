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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Verified Community Member
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{user.communityName} • {user.city}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenMembershipCard}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" /> View Digital ID Card
            </button>
            <button
              onClick={onOpenDonate}
              className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" /> Donate Now
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Donated</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{user.totalDonatedINR.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">100% Tax Exempt (80G)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contributions Made</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{user.donationsCount} Donations</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Across Verified Causes</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Member ID</span>
          <p className="text-lg font-mono font-bold text-emerald-700 mt-1">{user.membershipId}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Joined: {user.joinDate}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Emergency Aid Status</span>
          <p className="text-sm font-bold text-emerald-800 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fully Eligible for Aid
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Community Escrow Backed</span>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Your Donation History &amp; Receipts</h3>
            <p className="text-xs text-slate-500">Download official tax receipts for any contribution</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : userDonations.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-8">No donations yet. Make your first donation today!</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Cause / Campaign</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {userDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{d.receiptNumber}</td>
                    <td className="p-3 font-semibold text-slate-800 max-w-xs truncate">{d.campaignTitle}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {d.category}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-emerald-700">₹{d.amountINR.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-slate-500">{d.date}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectDonationReceipt(d)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" /> Download Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
