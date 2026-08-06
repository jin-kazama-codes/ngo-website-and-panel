'use client';

import React from 'react';
import { UserRole } from '../types';
import { Shield, Users, UserCheck, Heart, Award, Sparkles, LogIn } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const roles: { id: UserRole; label: string; email: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      id: 'super_admin',
      label: 'Super Admin',
      email: 'superadmin@sevasangam.org',
      icon: <Shield className="w-3.5 h-3.5 text-amber-400" />,
      color: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      desc: 'Full platform financial oversight & system audit logs',
    },
    {
      id: 'executive',
      label: 'Executive Admin',
      email: 'executive@sevasangam.org',
      icon: <UserCheck className="w-3.5 h-3.5 text-purple-400" />,
      color: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
      desc: 'KYC, Aadhaar, hospital bills & UTR verification officer',
    },
    {
      id: 'community_admin',
      label: 'Community Admin',
      email: 'communityadmin@sevasangam.org',
      icon: <Users className="w-3.5 h-3.5 text-blue-400" />,
      color: 'bg-blue-950/80 text-blue-300 border-blue-500/50',
      desc: 'Bareilly chapter admin managing local causes & broadcasts',
    },
    {
      id: 'member',
      label: 'Member / Volunteer',
      email: 'member@sevasangam.org',
      icon: <Heart className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
      desc: 'Verified ₹50 member eligible for aid & tax receipts',
    },
    {
      id: 'premium_donor',
      label: 'Premium Donor',
      email: 'ayesha.fatima@example.com',
      icon: <Award className="w-3.5 h-3.5 text-amber-400" />,
      color: 'bg-amber-900/40 text-amber-200 border-amber-500/30',
      desc: 'VIP donor with Hasanat counter & certificate',
    },
  ];

  return (
    <div className="bg-slate-950 text-white py-2 px-4 shadow-inner text-xs border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white flex items-center gap-1.5">
            <LogIn className="w-3.5 h-3.5 text-emerald-400" /> Active Role Session:
          </span>
          <span className="text-slate-400 hidden lg:inline">
            (Switch roles below to access customized dashboards &amp; privileges)
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {roles.map((r) => {
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                title={`${r.desc} — Login Email: ${r.email}`}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all duration-200 border ${
                  isActive
                    ? `${r.color} shadow-md ring-2 ring-emerald-500/40 scale-105`
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
