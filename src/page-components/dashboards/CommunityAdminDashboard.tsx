'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, Community, User } from '../../types';
import { Users, Plus, Megaphone, CheckCircle2, Heart, ShieldCheck as ShieldCheckIcon, IndianRupee, Activity, UserCheck, PlusCircle, Banknote } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { broadcastAnnouncement, getPendingVerifications, approveVerification, rejectVerification } from '../../services/adminService';
import { getCommunities } from '../../services/communityService';
import { getUnverifiedUsers } from '../../services/userService';
import { getDonations } from '../../services/donationService';

interface CommunityAdminDashboardProps {
  activeUser: User;
  onOpenCreateCampaign: () => void;
  campaignsList: Campaign[];
}

const pieData = [
  { name: 'Medical', value: 45, color: '#059669' },
  { name: 'Education', value: 25, color: '#2563eb' },
  { name: 'Food', value: 18, color: '#d97706' },
  { name: 'Marriage', value: 12, color: '#9333ea' },
];

export const CommunityAdminDashboard: React.FC<CommunityAdminDashboardProps> = ({
  activeUser,
  onOpenCreateCampaign,
  campaignsList,
}) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [pendingKycCount, setPendingKycCount] = useState(0);
  const [pendingUtrCount, setPendingUtrCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCommunities()
        .then((comms) => {
          if (comms.length > 0) {
            const userCommunity = comms.find(c => c.id === activeUser.communityId);
            setCommunity(userCommunity || null);
          }
        })
        .catch(console.error),
      getUnverifiedUsers()
        .then((users) => {
          const communityUsers = users.filter(u => u.communityId === activeUser.communityId || u.communityName === activeUser.communityName);
          setPendingKycCount(communityUsers.length);
        })
        .catch(console.error),
      getDonations()
        .then((donations) => {
          const communityDonations = donations.filter(d =>
            d.status === 'pending_verification' &&
            (d.communityName === activeUser.communityName)
          );
          setPendingUtrCount(communityDonations.length);
        })
        .catch(console.error)
    ]).finally(() => setLoading(false));
  }, [activeUser.communityId, activeUser.communityName]);

  const pendingCampaignsCount = campaignsList.filter(c => c.status === 'pending' || c.status === 'pending_approval').length;



  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText || !community) return;
    setBroadcasting(true);
    try {
      await broadcastAnnouncement({
        communityId: community.id,
        communityName: community.name,
        sentBy: community.adminName,
        message: announcementText,
      });
      setAnnouncementSent(true);
      setTimeout(() => {
        setAnnouncementSent(false);
        setAnnouncementText('');
      }, 3000);
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Top Banner Skeleton */}
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800" />
          ))}
        </div>

        {/* Pending Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
          ))}
        </div>

        {/* Charts & Actions Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800" />
          <div className="h-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0c2016 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.15)' }} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2"
              style={{
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--mfct-gold)',
                border: '1px solid rgba(200,168,75,0.3)',
              }}
            >
              <ShieldCheckIcon className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> Community Admin
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {community?.name || 'Community Admin Hub'}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(200,168,75,0.85)' }}>
              Admin: <strong className="text-white">{community?.adminName || 'Admin'}</strong> • {community?.city || 'City'} Chapter
            </p>
          </div>

          <div className="flex items-center shrink-0 mt-2 sm:mt-0">
            <button
              onClick={onOpenCreateCampaign}
              className="mfct-btn-gold px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Create Campaign
            </button>
          </div>
        </div>
      </div>
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div
          className="rounded-2xl p-5 transition-all flex items-center justify-between group"
          style={{
            background: 'var(--mfct-white)',
            border: '1px solid var(--mfct-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-text-muted)' }}>Total Members</p>
            <h3 className="text-2xl font-black mt-1 mb-1" style={{ color: 'var(--mfct-dark-green)' }}>{community?.totalMembers || 0}</h3>
            <p className="text-xs font-semibold" style={{ color: 'var(--mfct-mid-green)' }}>Active Registered</p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
            style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.25)', color: 'var(--mfct-dark-green)' }}
          >
            <Users className="w-6 h-6" style={{ color: 'var(--mfct-dark-green)' }} />
          </div>
        </div>

        {/* Active Campaigns */}
        <div
          className="rounded-2xl p-5 transition-all flex items-center justify-between group"
          style={{
            background: 'var(--mfct-white)',
            border: '1px solid var(--mfct-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-text-muted)' }}>Active Causes</p>
            <h3 className="text-2xl font-black mt-1 mb-1" style={{ color: 'var(--mfct-dark-green)' }}>{community?.activeCampaigns || 0}</h3>
            <p className="text-xs font-semibold" style={{ color: 'var(--mfct-gold-dark)' }}>Live Campaign Causes</p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
            style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.25)', color: 'var(--mfct-gold-dark)' }}
          >
            <Heart className="w-6 h-6" style={{ color: 'var(--mfct-gold-dark)' }} />
          </div>
        </div>

        {/* Total Funds Raised */}
        <div
          className="rounded-2xl p-5 transition-all flex items-center justify-between group"
          style={{
            background: 'var(--mfct-white)',
            border: '1px solid var(--mfct-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-text-muted)' }}>Total Funds Raised</p>
            <h3 className="text-2xl font-black mt-1 mb-1" style={{ color: 'var(--mfct-dark-green)' }}>₹{(community?.totalRaisedINR || 0).toLocaleString('en-IN')}</h3>
            <p className="text-xs font-semibold" style={{ color: 'var(--mfct-mid-green)' }}>Escrow Audited</p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
            style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.25)', color: 'var(--mfct-dark-green)' }}
          >
            <IndianRupee className="w-6 h-6" style={{ color: 'var(--mfct-dark-green)' }} />
          </div>
        </div>

        {/* Health Score */}
        <div
          className="rounded-2xl p-5 transition-all flex items-center justify-between group"
          style={{
            background: 'var(--mfct-white)',
            border: '1px solid var(--mfct-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-text-muted)' }}>Community Health</p>
            <h3 className="text-2xl font-black mt-1 mb-1" style={{ color: 'var(--mfct-dark-green)' }}>{community?.healthScore || 100}%</h3>
            <p className="text-xs font-semibold" style={{ color: 'var(--mfct-gold-dark)' }}>Grade A Transparency</p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
            style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.25)', color: 'var(--mfct-dark-green)' }}
          >
            <Activity className="w-6 h-6" style={{ color: 'var(--mfct-dark-green)' }} />
          </div>
        </div>
      </div>

      {/* Pending Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending KYC Approvals</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{pendingKycCount}</h4>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">Requires admin review</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Campaigns</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{pendingCampaignsCount}</h4>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">Awaiting approval</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending UTR Verification</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{pendingUtrCount}</h4>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">Manual bank transfers</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Banknote className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Announcement */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Broadcast Announcement</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Send an alert to all members of your community</p>
            </div>
          </div>

          {announcementSent ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="font-bold text-xs text-emerald-800 dark:text-emerald-400">Broadcast Dispatched!</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500/80">Sent via WhatsApp &amp; SMS gateway.</p>
            </div>
          ) : (
            <form onSubmit={handleBroadcast} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Type urgent community broadcast message..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {broadcasting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Dispatch Broadcast Alert'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

