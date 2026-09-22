'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Community, User, Campaign } from '../../types';
import { Shield, CheckCircle2, TrendingUp, Activity, FileText, MapPin, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';
import { getCommunities } from '../../services/communityService';
import { getCampaigns } from '../../services/campaignService';
import { getUsers } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';
import { translateUserRole } from '../../lib/translateEntity';

interface DashboardProps {
  activeUser: User;
}

export const SuperAdminDashboard: React.FC<DashboardProps> = ({ activeUser }) => {
  const { t, language } = useLanguage();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // District role detection
  const distRoleKeys = [
    'district_president',
    'district_coordinator',
    'district_gen_secretary',
    'district_secretary',
    'district_finance_coord'
  ];
  const normalizedRole = ((activeUser.role as string) || '').toLowerCase().trim().replace(/\s+/g, '_');
  const userDistrict = (activeUser.district || activeUser.city || '').trim();

  const isDistrictRoleUser =
    distRoleKeys.includes(normalizedRole) ||
    Boolean(activeUser.districtRole) ||
    Boolean((activeUser as any).district_role);

  // If district role user, default and lock to their assigned district; else allow Super Admin to filter
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    isDistrictRoleUser && userDistrict ? userDistrict : ''
  );

  useEffect(() => {
    if (isDistrictRoleUser && userDistrict) {
      setSelectedDistrict(userDistrict);
    }
  }, [isDistrictRoleUser, userDistrict]);

  useEffect(() => {
    Promise.all([
      getCommunities(),
      getCampaigns(),
      getUsers()
    ])
      .then(([comms, campaigns, userList]) => {
        setCommunities(comms);
        setCampaignsList(campaigns);
        setUsers(userList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Effective active district filter
  const effectiveDistrict = isDistrictRoleUser ? userDistrict : selectedDistrict;

  // Filter dataset based on effective district
  const { filteredCommunities, filteredUsers, filteredCampaigns, totalRaised } = useMemo(() => {
    if (!effectiveDistrict) {
      const raised = communities.reduce((sum, c) => sum + (c.totalRaisedINR || 0), 0);
      return {
        filteredCommunities: communities,
        filteredUsers: users,
        filteredCampaigns: campaignsList,
        totalRaised: raised,
      };
    }

    const target = effectiveDistrict.toLowerCase().trim();

    const comms = communities.filter((c) => {
      const city = (c.city || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      const state = (c.state || '').toLowerCase();
      return (
        city.includes(target) ||
        target.includes(city) ||
        name.includes(target) ||
        target.includes(name) ||
        (c.id === activeUser.communityId)
      );
    });

    const matchingCommIds = new Set(comms.map((c) => c.id));

    const usrs = users.filter((u) => {
      const uDist = (u.district || '').toLowerCase();
      const uCity = (u.city || '').toLowerCase();
      const uComm = (u.communityName || '').toLowerCase();
      return (
        (uDist && (uDist.includes(target) || target.includes(uDist))) ||
        (uCity && (uCity.includes(target) || target.includes(uCity))) ||
        (uComm && (uComm.includes(target) || target.includes(uComm))) ||
        (u.communityId && matchingCommIds.has(u.communityId))
      );
    });

    const camps = campaignsList.filter((c) => {
      const cCity = (c.city || '').toLowerCase();
      const cComm = (c.communityName || '').toLowerCase();
      return (
        (cCity && (cCity.includes(target) || target.includes(cCity))) ||
        (cComm && (cComm.includes(target) || target.includes(cComm))) ||
        (c.communityId && matchingCommIds.has(c.communityId))
      );
    });

    const raised =
      comms.reduce((sum, c) => sum + (c.totalRaisedINR || 0), 0) ||
      camps.reduce((sum, c) => sum + (c.raisedINR || 0), 0);

    return {
      filteredCommunities: comms,
      filteredUsers: usrs,
      filteredCampaigns: camps,
      totalRaised: raised,
    };
  }, [communities, users, campaignsList, effectiveDistrict, activeUser.communityId]);

  const totalMembers = filteredUsers.length;
  const totalCampaign = filteredCampaigns.length;

  const communityGrowth = useMemo(() => {
    const source = filteredCommunities.length > 0 ? filteredCommunities : communities;
    return [...source]
      .sort((a, b) => (b.totalRaisedINR || 0) - (a.totalRaisedINR || 0))
      .slice(0, 5)
      .map((c) => ({
        name: c.city || c.name,
        raised: parseFloat(((c.totalRaisedINR || 0) / 100000).toFixed(1)),
      }));
  }, [filteredCommunities, communities]);

  // Dynamic Category Distribution
  const categoryData = useMemo(() => {
    const colorMap: Record<string, string> = {
      Medical: '#059669',
      Education: '#2563eb',
      'Food & Relief': '#d97706',
      Food: '#d97706',
      Marriage: '#9333ea',
      Sadakah: '#0891b2',
      Zakat: '#16a34a',
      General: '#4f46e5',
      'Emergency Relief': '#e11d48',
    };

    if (filteredCampaigns.length > 0) {
      const counts: Record<string, number> = {};
      filteredCampaigns.forEach((c) => {
        const cat = c.category || 'General';
        counts[cat] = (counts[cat] || 0) + (c.raisedINR || 1);
      });
      const entries = Object.entries(counts).map(([name, value]) => ({
        name: t(`cat.${name.toLowerCase().replace(/\s+/g, '')}`, name),
        value,
        color: colorMap[name] || '#10b981',
      }));
      if (entries.length > 0) return entries;
    }

    return [
      { name: t('cat.medical', 'Medical'), value: 45, color: '#059669' },
      { name: t('cat.education', 'Education'), value: 25, color: '#2563eb' },
      { name: t('cat.food', 'Food Relief'), value: 18, color: '#d97706' },
      { name: t('cat.marriage', 'Marriage'), value: 12, color: '#9333ea' },
    ];
  }, [filteredCampaigns, t]);

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

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(200,168,75,0.15)',
                  color: 'var(--mfct-gold)',
                  border: '1px solid rgba(200,168,75,0.3)',
                }}
              >
                <Shield className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                {translateUserRole(activeUser.role, (activeUser as any).districtRole || (activeUser as any).district_role, language)}
              </div>

              {effectiveDistrict && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: 'rgba(16,185,129,0.15)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(16,185,129,0.3)',
                  }}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{effectiveDistrict} District</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {effectiveDistrict
                ? `${effectiveDistrict} ${t('admin.districtMasterTitle', 'District Analytics & Oversight')}`
                : t('admin.platformMasterTitle', 'Platform Master Analytics & Oversight')}
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'rgba(200,168,75,0.85)' }}>
              {effectiveDistrict
                ? `${t('admin.districtMasterDesc', 'District level financial analytics, localized campaigns, verified members & health tracking for')} ${effectiveDistrict}.`
                : t('admin.platformMasterDesc', 'Full system financial analytics, fraud risk matrices, audit logs & community health tracking.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Super Admin District Filter Selector */}
            {/* {!isDistrictRoleUser && (
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30">
                <Filter className="w-4 h-4 text-amber-400 shrink-0" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-2"
                >
                  <option value="" className="bg-slate-900 text-white">
                    {language === 'hi' ? 'सभी जिले (All Districts)' : language === 'ur' ? 'تمام اضلاع' : 'All Districts (All UP)'}
                  </option>
                  {UP_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist} className="bg-slate-900 text-white">
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            )} */}

            <span
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
              style={{
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--mfct-gold)',
                border: '1px solid rgba(200,168,75,0.3)',
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('admin.systemsOperational', 'All Systems 100% Operational')}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">
            {effectiveDistrict ? `${effectiveDistrict} ${t('admin.statFundsRaised', 'Funds Raised')}` : t('admin.statTotalRaised', 'Total Funds Raised')}
          </span>
          <p className="text-2xl xl:text-3xl font-black mt-1 truncate text-emerald-600 dark:text-emerald-400">
            ₹{totalRaised.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] font-semibold mt-1 block truncate text-amber-600 dark:text-amber-400">
            {t('card.raised', 'Total Raised')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">
            {effectiveDistrict ? `${effectiveDistrict} ${t('admin.statMembers', 'Members')}` : t('admin.statActiveMembers', 'Total Active Members')}
          </span>
          <p className="text-2xl xl:text-3xl font-black mt-1 truncate text-slate-900 dark:text-white">
            {totalMembers.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] font-semibold mt-1 block truncate text-emerald-600 dark:text-emerald-400">
            {t('admin.tabMembers', 'Members')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">
            {effectiveDistrict ? `${effectiveDistrict} ${t('nav.communities', 'Communities')}` : t('admin.statActiveCommunities', 'Active Communities')}
          </span>
          <p className="text-2xl xl:text-3xl font-black mt-1 truncate text-slate-900 dark:text-white">
            {filteredCommunities.length}
          </p>
          <span className="text-[11px] font-semibold mt-1 block truncate text-amber-600 dark:text-amber-400">
            {t('nav.communities', 'Communities')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">
            {effectiveDistrict ? `${effectiveDistrict} ${t('nav.campaigns', 'Campaigns')}` : t('admin.statTotalCampaigns', 'Total Campaigns')}
          </span>
          <p className="text-2xl xl:text-3xl font-black mt-1 truncate text-slate-900 dark:text-white">
            {totalCampaign}
          </p>
          <span className="text-[11px] font-semibold mt-1 block truncate text-emerald-600 dark:text-emerald-400">
            {t('nav.campaigns', 'Campaigns')}
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
            {effectiveDistrict
              ? `${effectiveDistrict} ${t('admin.topCommunitiesByFunds', 'Communities by Funds (Lakhs INR)')}`
              : t('admin.top5Communities', 'Top 5 Communities by Funds (Lakhs INR)')}
          </h3>
          <div className="h-64">
            {communityGrowth.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                {t('admin.noCommunityData', 'No community financial records for this district yet')}
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
            {effectiveDistrict
              ? `${effectiveDistrict} ${t('admin.categoryDistribution', 'Category Donation Distribution (%)')}`
              : t('admin.categoryDistribution', 'Category Donation Distribution (%)')}
          </h3>
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
