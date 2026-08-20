import React from 'react';
import { User } from '../../types';
import { Award } from 'lucide-react';

interface HasanatCertificateTabProps {
  activeUser: User;
}

export const HasanatCertificateTab: React.FC<HasanatCertificateTabProps> = ({ activeUser }) => {
  return (
    <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-8 text-center space-y-6 max-w-xl mx-auto shadow-xl">
      <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-amber-500/10">
        <Award className="w-8 h-8" />
      </div>
      <div>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Official Award Certificate</span>
        <h2 className="text-2xl font-black text-white mt-1">Hasanat High-Impact Patron</h2>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Awarded to <strong className="text-amber-300">{activeUser.name}</strong> for extraordinary philanthropic contributions exceeding ₹5,00,000 towards orphan care, emergency medical dialysers & community welfare in India.
        </p>
      </div>

      <div className="p-4 bg-slate-950/80 rounded-xl border border-amber-500/20 text-xs text-left space-y-2">
        <div className="flex justify-between text-slate-300">
          <span>Hasanat Points Accumulated:</span>
          <strong className="text-amber-400">4,850 pts</strong>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Verified Lives Impacted:</span>
          <strong className="text-emerald-400">142 Beneficiaries</strong>
        </div>
      </div>

      <button className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg">
        Download Official Signed PDF Certificate
      </button>
    </div>
  );
};
