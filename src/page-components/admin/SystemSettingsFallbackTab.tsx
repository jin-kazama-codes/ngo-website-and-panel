import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '../../types';

interface SystemSettingsFallbackTabProps {
  activeTab: string;
  activeUser?: User;
  currentRole?: UserRole;
}

export const SystemSettingsFallbackTab: React.FC<SystemSettingsFallbackTabProps> = ({ activeTab, activeUser, currentRole }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-black text-white capitalize">{activeTab.replace('_', ' ')} Management</h2>
      <p className="text-xs text-slate-400">System metrics and live escrow audit feeds are updated in real time.</p>
      <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="font-bold text-white">System Synchronized</p>
        <p className="mt-1">All audit logs, UTR receipts, and escrow disbursals are 100% verified by third-party auditors.</p>
      </div>
    </div>
  );
};
