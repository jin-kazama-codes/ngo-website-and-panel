'use client';

import React from 'react';
import { ShieldCheck, Heart, Users, Building2, CheckCircle2, Award, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in text-slate-800">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          Our Vision & Transparency Model
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
          Reimagining Community Solidarity Across India
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          MFCT was founded on a simple humanitarian belief: every local neighborhood can become self-sustaining when members unite under a transparent, religion-neutral crowdfunding framework.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">100% Escrow Transparency</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Donations are never transferred to unverified personal bank accounts. All funds are paid directly to hospitals, medical suppliers, or college accounts.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Mutual Member Benefit</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            A small ₹50 membership fee grants members dual status: the opportunity to give back and guaranteed priority support during personal emergencies.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Zakat & Tax Exemption</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Strict system rules ensure Zakat reaches only eligible beneficiaries, while all contributors receive instant 80G tax benefit receipts.
          </p>
        </div>
      </div>
    </div>
  );
};
