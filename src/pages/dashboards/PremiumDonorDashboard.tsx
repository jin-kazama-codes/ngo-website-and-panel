import React from 'react';
import { User, Donation } from '../../types';
import { MOCK_DONATIONS } from '../../data/mockData';
import { Award, Sparkles, Download, Heart, TrendingUp, Flame, ShieldCheck, CheckCircle2, Trophy, Star, Gift } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PremiumDonorDashboardProps {
  user: User;
  onOpenDonate: () => void;
  onSelectDonationReceipt: (donation: Donation) => void;
}

const monthlyData = [
  { month: 'Jan', amount: 15000 },
  { month: 'Feb', amount: 18000 },
  { month: 'Mar', amount: 12000 },
  { month: 'Apr', amount: 25000 },
  { month: 'May', amount: 30000 },
  { month: 'Jun', amount: 40000 },
  { month: 'Jul', amount: 45000 },
];

export const PremiumDonorDashboard: React.FC<PremiumDonorDashboardProps> = ({
  user,
  onOpenDonate,
  onSelectDonationReceipt,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Gold Accent Premium Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-amber-500/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Award className="w-4 h-4 text-amber-400" /> Premium Gold Humanitarian Patron
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-amber-100 tracking-tight">
              Honored Welcome, {user.name}! ✨
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl">
              Your extraordinary philanthropy has directly transformed 38 families across Hyderabad, Delhi, and Bareilly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Annual Impact Certificate
            </button>
            <button
              onClick={onOpenDonate}
              className="py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" /> Donate Now
            </button>
          </div>
        </div>
      </div>

      {/* Gold Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 shadow-sm">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Life Impact Score</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-amber-900">{user.lifeImpactScore || 94}</span>
            <span className="text-xs text-amber-700 font-bold">/ 100 (Top 1% Patron)</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Rank #3 in Hyderabad Community</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Families Helped</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{user.familiesHelped || 38}</p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">12 Medical + 18 Food + 8 Education</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hasanat / Good Deeds</span>
          <p className="text-3xl font-black text-emerald-700 mt-1">{(user.hasanatCounter || 14850).toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Calculated via direct beneficiaries</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Giving Streak</span>
          <div className="flex items-center gap-2 mt-1">
            <Flame className="w-6 h-6 text-amber-500 fill-current" />
            <span className="text-2xl font-black text-slate-900">{user.givingStreakMonths || 18} Months</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Unbroken monthly commitment</span>
        </div>
      </div>

      {/* Analytics Chart & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Monthly Giving Trends (INR ₹)</h3>
              <p className="text-xs text-slate-500">Your monthly contributions history</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              Total Donated: ₹{user.totalDonatedINR.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestones & Badges */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">Achievement Badges</h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400 text-slate-900 font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-amber-950">Grand Patron Award 2024</h4>
                <p className="text-[11px] text-amber-800">Contributed over ₹1.5 Lakhs in a year</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-emerald-950">Lifesaver Medical Shield</h4>
                <p className="text-[11px] text-emerald-800">Funded 3 emergency heart/kidney surgeries</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-blue-950">Education Guardian</h4>
                <p className="text-[11px] text-blue-800">Sponsored higher studies for 8 orphan girls</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
