'use client';

import React from 'react';
import { Campaign } from '../types';
import { ShieldCheck, Sparkles, Clock, Heart, Users, Building2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CampaignCardProps {
  campaign: Campaign;
  onDonate: (campaign: Campaign) => void;
  onViewDetail: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDonate, onViewDetail }) => {
  const { t, isHindi } = useLanguage();
  const percentRaised = Math.min(100, Math.round((campaign.raisedINR / campaign.goalINR) * 100));

  const categoryTranslations: Record<string, string> = {
    Medical: t('cat.medical', 'Medical Aid'),
    Education: t('cat.education', 'Education'),
    Marriage: t('cat.marriage', 'Marriage Aid'),
    Food: t('cat.food', 'Food Relief'),
    Community: t('cat.community', 'Community'),
    Janazah: t('cat.janazah', 'Janazah Aid'),
    Zakat: t('cat.zakat', 'Zakat'),
  };

  const displayCategory = categoryTranslations[campaign.category] || campaign.category;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Card Image Banner */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={campaign.mainImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

        {/* Badges Overlay Top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-sm">
              {displayCategory}
            </span>
            {campaign.isZakatEligible && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {t('card.zakat', 'Zakat Eligible')}
              </span>
            )}
            {campaign.isUrgent && (
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-sm animate-pulse">
                {t('card.urgent', 'Urgent Need')}
              </span>
            )}
          </div>

          {campaign.isVerified && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {t('card.verified', 'Verified')}
            </span>
          )}
        </div>

        {/* Community Title Bottom Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{campaign.communityName} • {campaign.city}</span>
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            onClick={() => onViewDetail(campaign)}
            className="font-bold text-slate-900 text-base leading-snug hover:text-emerald-600 transition-colors cursor-pointer line-clamp-2"
          >
            {campaign.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {campaign.story}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="text-emerald-700 font-bold text-sm">
              ₹{campaign.raisedINR.toLocaleString('en-IN')}{' '}
              <span className="text-slate-400 font-normal text-xs">{t('card.raised', 'raised')}</span>
            </span>
            <span className="text-slate-500">
              {isHindi ? 'लक्ष्य' : 'Goal'}: ₹{campaign.goalINR.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentRaised}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
            <span className="flex items-center gap-1 text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-400" /> {campaign.donorsCount} {t('card.donors', 'Donors')}
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> {campaign.daysLeft} {t('card.daysLeft', 'Days Left')}
            </span>
            <span className="font-bold text-emerald-600">{percentRaised}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onViewDetail(campaign)}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex-1"
          >
            {t('card.viewDetail', 'Read Story & Docs')}
          </button>
          <button
            onClick={() => onDonate(campaign)}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-current" /> {t('card.donateNow', 'Donate')}
          </button>
        </div>
      </div>
    </div>
  );
};
