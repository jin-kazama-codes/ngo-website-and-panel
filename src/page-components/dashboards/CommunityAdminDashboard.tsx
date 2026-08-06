'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, Community } from '../../types';
import { Users, Plus, Megaphone, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { broadcastAnnouncement, getPendingVerifications, approveVerification, rejectVerification } from '../../services/adminService';
import { getCommunities } from '../../services/communityService';
import { PendingVerificationItem } from '../../types';

interface CommunityAdminDashboardProps {
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
  onOpenCreateCampaign,
  campaignsList,
}) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [pendingMembers, setPendingMembers] = useState<PendingVerificationItem[]>([]);

  useEffect(() => {
    getCommunities()
      .then((comms) => {
        if (comms.length > 0) setCommunity(comms[0]);
      })
      .catch(console.error);

    getPendingVerifications()
      .then((items) => {
        setPendingMembers(items.filter((i) => i.type === 'kyc'));
      })
      .catch(console.error);
  }, []);

  const handleApproveMember = async (id: string) => {
    try {
      await approveVerification(id, community?.adminName || 'Community Admin');
      setPendingMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectMember = async (id: string) => {
    try {
      await rejectVerification(id, community?.adminName || 'Community Admin');
      setPendingMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-900/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" /> Community Administrator
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {community?.name || 'Community Admin Hub'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Admin: <strong className="text-emerald-400">{community?.adminName || 'Admin'}</strong> • {community?.city || 'City'} Chapter
            </p>
          </div>

          <button
            onClick={onOpenCreateCampaign}
            className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Cause Campaign
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Members</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{community?.totalMembers.toLocaleString('en-IN') || 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Active Registered</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Causes</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{campaignsList.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Live Campaign Causes</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Funds Raised</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">₹{(community?.totalRaisedINR || 0).toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Escrow Audited</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Community Health</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{community?.healthScore || 100}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Grade A Transparency</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">Pending Member KYC Approvals</h3>
          {pendingMembers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No Pending KYC Verification Requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMembers.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{m.title}</h4>
                    <p className="text-slate-500">{m.details} • {m.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveMember(m.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectMember(m.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Broadcast Announcement Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">Broadcast Announcement</h3>
          </div>
          <p className="text-xs text-slate-500">Send an urgent SMS / WhatsApp alert to all active members in your chapter.</p>

          {announcementSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="font-bold text-xs text-emerald-950">Broadcast Dispatched!</p>
              <p className="text-[10px] text-emerald-800">Sent via WhatsApp &amp; SMS gateway.</p>
            </div>
          ) : (
            <form onSubmit={handleBroadcast} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Type urgent community broadcast message..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                {broadcasting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Dispatch Broadcast Alert'}
              </button>
            </form>
          )}

          {/* Pie Chart breakdown */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs text-slate-700 mb-2">Category Funds Breakdown</h4>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
