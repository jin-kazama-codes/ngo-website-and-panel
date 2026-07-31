import React from 'react';
import { MOCK_AUDIT_LOGS, MOCK_COMMUNITIES } from '../../data/mockData';
import { Shield, TrendingUp, Users, AlertTriangle, Building2, BarChart3, Lock, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const categoryData = [
  { name: 'Medical', value: 45, color: '#059669' },
  { name: 'Education', value: 25, color: '#2563eb' },
  { name: 'Food & Relief', value: 18, color: '#d97706' },
  { name: 'Marriage', value: 12, color: '#9333ea' },
];

const communityGrowth = [
  { name: 'Delhi', raised: 42.5 },
  { name: 'Lucknow', raised: 28.9 },
  { name: 'Hyderabad', raised: 89.0 },
  { name: 'Bareilly', raised: 14.5 },
  { name: 'Mumbai', raised: 64.0 },
];

export const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Super Administrator Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Platform Master Analytics & Oversight
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Full system financial analytics, fraud risk matrices, audit logs & community health tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Systems 100% Operational
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Platform Funds Raised</span>
          <p className="text-3xl font-black text-emerald-700 mt-1">₹2,38,90,000</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Escrow Escrow Audited</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Active Members</span>
          <p className="text-3xl font-black text-slate-900 mt-1">6,680</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Across 5 Indian Cities</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Communities</span>
          <p className="text-3xl font-black text-slate-900 mt-1">5 Managed</p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Average Health: 96%</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Fraud & Risk Score</span>
          <p className="text-3xl font-black text-slate-900 mt-1">0.02%</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Zero Unmatched UTRs</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">Funds Raised by Community (Lakhs INR)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={communityGrowth}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="raised" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">Category Donation Distribution (%)</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900">Live Immutable System Audit Logs</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Performed By</th>
                <th className="p-3">Role</th>
                <th className="p-3">Details</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="p-3 font-bold text-slate-900">{log.action}</td>
                  <td className="p-3 text-slate-800">{log.performedBy}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                  <td className="p-3 font-mono text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
