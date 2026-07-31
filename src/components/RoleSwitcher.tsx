import React from 'react';
import { UserRole } from '../types';
import { Shield, Users, UserCheck, Heart, Award, Sparkles } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const roles: { id: UserRole; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      id: 'member',
      label: 'Member',
      icon: <Heart className="w-4 h-4" />,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Regular community donor & aid recipient',
    },
    {
      id: 'premium_donor',
      label: 'Premium Donor',
      icon: <Award className="w-4 h-4 text-amber-500" />,
      color: 'bg-amber-50 text-amber-700 border-amber-300',
      desc: 'High-impact donor with Hasanat counter & certificate',
    },
    {
      id: 'community_admin',
      label: 'Community Admin',
      icon: <Users className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Local leader managing community members & campaigns',
    },
    {
      id: 'executive',
      label: 'Executive',
      icon: <UserCheck className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      desc: 'KYC & UTR verification officer',
    },
    {
      id: 'super_admin',
      label: 'Super Admin',
      icon: <Shield className="w-4 h-4 text-slate-700" />,
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      desc: 'Full platform oversight & financial analytics',
    },
  ];

  return (
    <div className="bg-slate-900 text-white py-2 px-4 shadow-inner text-xs border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Switch Role View:
          </span>
          <span className="text-slate-400 hidden lg:inline">
            (Select a role to preview the customized experience & dashboard)
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {roles.map((r) => {
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                title={r.desc}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all duration-200 border ${
                  isActive
                    ? `${r.color} shadow-sm ring-2 ring-white/20 font-semibold scale-105`
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
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
