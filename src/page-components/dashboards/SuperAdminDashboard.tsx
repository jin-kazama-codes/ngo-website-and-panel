'use client';

import React, { useState, useEffect } from 'react';
import { AuditLog, Community, User, Campaign } from '../../types';
import { Shield, CheckCircle2, TrendingUp, Activity, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';
import { getAuditLogs } from '../../services/adminService';
import { getCommunities } from '../../services/communityService';
import { getCampaigns } from '../../services/campaignService';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardProps {
  activeUser: User;
}


const categoryData = [
  { name: 'Medical', value: 45, color: '#059669' },
  { name: 'Education', value: 25, color: '#2563eb' },
  { name: 'Food & Relief', value: 18, color: '#d97706' },
  { name: 'Marriage', value: 12, color: '#9333ea' },
];

export const SuperAdminDashboard: React.FC<DashboardProps> = ({ activeUser }) => {
  const { t, language } = useLanguage();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCommunities(),
      getCampaigns(),
      getAuditLogs()
    ])
      .then(([comms, campaigns, logs]) => {
        setCommunities(comms);
        setCampaignsList(campaigns);
        setAuditLogs(logs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalMembers = communities.reduce((sum, c) => sum + c.totalMembers, 0);
  const totalRaised = communities.reduce((sum, c) => sum + c.totalRaisedINR, 0);
  const totalCampaign = campaignsList.length;

  const communityGrowth = [...communities]
    .sort((a, b) => b.totalRaisedINR - a.totalRaisedINR)
    .slice(0, 5)
    .map((c) => ({
      name: c.city,
      raised: parseFloat((c.totalRaisedINR / 100000).toFixed(1)),
    }));

  const categoryData = [
    { name: t('cat.medical', 'Medical'), value: 45, color: '#059669' },
    { name: t('cat.education', 'Education'), value: 25, color: '#2563eb' },
    { name: t('cat.food', 'Food Relief'), value: 18, color: '#d97706' },
    { name: t('cat.marriage', 'Marriage'), value: 12, color: '#9333ea' },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Super Admin Top Banner Skeleton */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="w-24 h-6 bg-slate-800 rounded-full mb-2"></div>
              <div className="w-64 sm:w-96 h-8 bg-slate-800 rounded mb-2"></div>
              <div className="w-48 h-4 bg-slate-800 rounded mt-1"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-48 h-8 rounded-xl bg-slate-800"></div>
            </div>
          </div>
        </div>

        {/* Analytics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm animate-pulse flex flex-col items-center justify-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-6 self-start"></div>
            <div className="h-64 w-64 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Super Admin Top Banner */}
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
              <Shield className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> {t('admin.superAdmin', 'Super Admin')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: 'serif' }}>
              {t('admin.platformMasterTitle', 'Platform Master Analytics & Oversight')}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(200,168,75,0.85)' }}>
              {t('admin.platformMasterDesc', 'Full system financial analytics, fraud risk matrices, audit logs & community health tracking.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
              style={{
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--mfct-gold)',
                border: '1px solid rgba(200,168,75,0.3)',
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('admin.systemsOperational', 'All Systems 100% Operational')}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl transition-all overflow-hidden"
          style={{
            background: 'var(--mfct-white)',
            border: '1px solid var(--mfct-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider block truncate" style={{ color: 'var(--mfct-text-muted)' }}>{t('admin.statTotalRaised', 'Total Funds Raised')}</span>
          <p className="text-2xl xl:text-3xl font-black mt-1 truncate" style={{ color: 'var(--mfct-dark-green)' }}>₹{totalRaised.toLocaleString('en-IN')}</p>
          <span className="text-[11px] font-semibold mt-1 block truncate" style={{ color: 'var(--mfct-gold-dark)' }}>{t('card.raised', 'Total Raised')}</span>
        </div>

        <div
          className="p-5 rounded-2xl transition-all overflow-hidden"
          style={{
            background: 'var(--mfct-white)',
            border: '1px solid var(--mfct-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider block truncate" style={{ color: 'var(--mfct-text-muted)' }}>{t('admin.statActiveMembers', 'Total Active Members')}</span>
          <p className="text-2xl xl:text-3xl font-black mt-1 truncate text-slate-900 dark:text-white">{totalMembers.toLocaleString('en-IN')}</p>
          <span className="text-[11px] font-semibold mt-1 block truncate" style={{ color: 'var(--mfct-mid-green)' }}>{t('admin.tabMembers', 'Members')}</span>
        </div>

        <div
          className="p-5 rounded-2xl transition-all overflow-hidden"
          style={{
            background: 'var(--mfct-white)',
            border: '1px solid var(--mfct-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider block truncate" style={{ color: 'var(--mfct-text-muted)' }}>{t('admin.statActiveCommunities', 'Active Communities')}</span>
          <p className="text-2xl xl:text-3xl font-black mt-1 truncate text-slate-900 dark:text-white">{communities.length}</p>
          <span className="text-[11px] font-semibold mt-1 block truncate" style={{ color: 'var(--mfct-gold-dark)' }}>{t('nav.communities', 'Communities')}</span>
        </div>

        <div
          className="p-5 rounded-2xl transition-all overflow-hidden"
          style={{
            background: 'var(--mfct-white)',
            border: '1px solid var(--mfct-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider block truncate" style={{ color: 'var(--mfct-text-muted)' }}>{t('admin.statTotalCampaigns', 'Total Campaigns')}</span>
          <p className="text-2xl xl:text-3xl font-black mt-1 truncate text-slate-900 dark:text-white">{totalCampaign}</p>
          <span className="text-[11px] font-semibold mt-1 block truncate" style={{ color: 'var(--mfct-mid-green)' }}>{t('nav.campaigns', 'Campaigns')}</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">{t('admin.top5Communities', 'Top 5 Communities by Funds (Lakhs INR)')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={communityGrowth} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderColor: 'rgb(30 41 59)', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="raised" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">{t('admin.categoryDistribution', 'Category Donation Distribution (%)')}</h3>
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderColor: 'rgb(30 41 59)', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
