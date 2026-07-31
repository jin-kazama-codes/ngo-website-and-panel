import React, { useState } from 'react';
import { MOCK_COMMUNITIES, MOCK_CAMPAIGNS } from '../../data/mockData';
import { Campaign } from '../../types';
import { Users, Plus, ShieldCheck, Check, X, Megaphone, Activity, BarChart2, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
  const comm = MOCK_COMMUNITIES[0]; // Hazrat Nizamuddin Welfare Community
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  const [pendingMembers, setPendingMembers] = useState([
    { id: 'p_1', name: 'Vikram Malhotra', city: 'Delhi', phone: '+91 98123 77665', date: 'Today, 02:30 PM' },
    { id: 'p_2', name: 'Sneha Gupta', city: 'Delhi', phone: '+91 98765 11223', date: 'Today, 01:15 PM' },
  ]);

  const handleApproveMember = (id: string) => {
    setPendingMembers(pendingMembers.filter((m) => m.id !== id));
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (announcementText) {
      setAnnouncementSent(true);
      setTimeout(() => {
        setAnnouncementSent(false);
        setAnnouncementText('');
      }, 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 mb-2">
              <Users className="w-4 h-4 text-blue-400" /> Community Administrator View
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {comm.name} Management
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Admin: <span className="font-bold text-blue-300">{comm.adminName}</span> • Health Score: {comm.healthScore}%
            </p>
          </div>

          <button
            onClick={onOpenCreateCampaign}
            className="py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Verified Campaign
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Community Members</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{comm.totalMembers.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">2 Pending Approvals</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Campaigns</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{campaignsList.length}</p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">All Executive Verified</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Funds Raised</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">₹{comm.totalRaisedINR.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Direct Bank Escrow</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Health & Trust Score</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{comm.healthScore}%</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Excellent Audit Grade</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Member Requests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">Pending Member KYC Approvals</h3>
          <p className="text-xs text-slate-500">Approve local applicants after identity check</p>

          <div className="space-y-3">
            {pendingMembers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No pending membership requests!</p>
            ) : (
              pendingMembers.map((m) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-slate-500 text-[11px]">{m.phone} • Paid ₹50</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleApproveMember(m.id)}
                      className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      title="Approve Member"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleApproveMember(m.id)}
                      className="p-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300"
                      title="Reject"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Broadcast Announcement */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-lg text-slate-900">Broadcast Announcement to {comm.totalMembers} Members</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-3">
            <textarea
              rows={3}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Type urgent community update, meeting notice or campaign push..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>

            <div className="flex items-center justify-between">
              {announcementSent && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Broadcast sent via SMS & WhatsApp!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md"
              >
                Send Broadcast Notification
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
