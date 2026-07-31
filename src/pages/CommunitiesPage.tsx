import React from 'react';
import { MOCK_COMMUNITIES } from '../data/mockData';
import { Building2, Users, ShieldCheck, Heart, MapPin, CheckCircle2 } from 'lucide-react';

interface CommunitiesPageProps {
  onOpenRegister: () => void;
}

export const CommunitiesPage: React.FC<CommunitiesPageProps> = ({ onOpenRegister }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Local Community Network</h1>
        <p className="text-sm text-slate-500 mt-1">
          Each community is managed by a trusted local administrator and backed by our national solidarity escrow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_COMMUNITIES.map((comm) => (
          <div key={comm.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="relative h-40 overflow-hidden bg-slate-100">
              <img src={comm.coverImage} alt={comm.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {comm.city}, {comm.state}
                </span>
                <h3 className="font-bold text-base text-white">{comm.name}</h3>
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed">{comm.description}</p>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Administrator:</span>
                  <span className="font-bold text-slate-800">{comm.adminName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Members:</span>
                  <span className="font-bold text-slate-900">{comm.totalMembers.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Funds Disbursed:</span>
                  <span className="font-bold text-emerald-700">₹{comm.totalRaisedINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Community Health:</span>
                  <span className="font-bold text-emerald-600">{comm.healthScore}% Grade A</span>
                </div>
              </div>

              <button
                onClick={onOpenRegister}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-emerald-400" /> Join Community (₹50)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
