'use client';

import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { ShieldCheck, Sparkles, Clock, Heart, Users, Building2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'next/navigation';
import { translateCampaign, translateCampaignTitle, translateCampaignStory, translateCategory } from '../lib/translateEntity';
import { autoTranslateText } from '../lib/autoTranslate';

interface CampaignCardProps {
  campaign: Campaign;
  onDonate: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign: rawCampaign, onDonate }) => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const campaign = translateCampaign(rawCampaign, language);
  const percentRaised = Math.min(100, Math.round((campaign.raisedINR / campaign.goalINR) * 100));

  const [displayTitle, setDisplayTitle] = useState(campaign.title);
  const [displayStory, setDisplayStory] = useState(campaign.story);

  useEffect(() => {
    const isPureAscii = /^[\x00-\x7F]*$/.test(rawCampaign.title || '');
    if (language === 'en' && isPureAscii) {
      setDisplayTitle(rawCampaign.title);
      setDisplayStory(rawCampaign.story);
      return;
    }

    const tTitle = translateCampaignTitle(rawCampaign.title, language);
    const tStory = translateCampaignStory(rawCampaign.story, language);
    setDisplayTitle(tTitle);
    setDisplayStory(tStory);

    if (tTitle === rawCampaign.title && rawCampaign.title) {
      autoTranslateText(rawCampaign.title, language).then(setDisplayTitle);
    }
    if (tStory === rawCampaign.story && rawCampaign.story) {
      autoTranslateText(rawCampaign.story, language).then(setDisplayStory);
    }
  }, [rawCampaign.title, rawCampaign.story, language]);

  const categoryTranslations: Record<string, string> = {
    Medical: t('cat.medical', 'Medical Aid'),
    Education: t('cat.education', 'Education'),
    Marriage: t('cat.marriage', 'Marriage Aid'),
    Food: t('cat.food', 'Food Relief'),
    Community: t('cat.community', 'Community'),
    Janazah: t('cat.janazah', 'Janazah Aid'),
    Zakat: t('cat.zakat', 'Zakat'),
  };

  const displayCategory = translateCategory(rawCampaign.category, language) || categoryTranslations[rawCampaign.category] || campaign.category;

  return (
    <div
      className="rounded-2xl transition-all duration-300 overflow-hidden flex flex-col group"
      style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Card Image Banner */}
      <div className="relative h-52 overflow-hidden" style={{ background: 'var(--mfct-warm-bg-2)' }}>
        <img
          src={campaign.mainImage}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

        {/* Badges Overlay Top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm"
              style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--mfct-dark-green)' }}
            >
              {displayCategory}
            </span>
            {campaign.isZakatEligible && (
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1"
                style={{ background: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)' }}
              >
                <Sparkles className="w-3 h-3" /> {language === 'hi' ? 'ज़कात' : language === 'ur' ? 'زکوٰۃ' : 'Zakat Eligible'}
              </span>
            )}
            {campaign.isSadqaEligible && (
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1 bg-teal-600 text-white"
              >
                <Heart className="w-3 h-3 fill-current" /> {language === 'hi' ? 'सदका' : language === 'ur' ? 'صدقہ' : 'Sadqa'}
              </span>
            )}
            {campaign.isFitrahEligible && (
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1 bg-indigo-600 text-white"
              >
                {language === 'hi' ? 'फ़ितरा' : language === 'ur' ? 'فطرہ' : 'Fitrah'}
              </span>
            )}
            {campaign.isUrgent && (
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-sm animate-pulse">
                {t('card.urgent', 'Urgent Need')}
              </span>
            )}
          </div>

          {campaign.isVerified && (
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1"
              style={{ background: 'var(--mfct-dark-green)', color: 'var(--mfct-gold)', border: '1px solid rgba(200,168,75,0.4)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} /> {t('card.verified', 'Verified')}
            </span>
          )}
        </div>

        {/* Community Title Bottom Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--mfct-gold)' }}>
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{campaign.communityName} • {campaign.city}</span>
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            onClick={() => router.push(`/campaigns/${campaign.id}`)}
            className="font-bold text-base leading-snug transition-colors cursor-pointer line-clamp-2"
            style={{ color: 'var(--mfct-dark-green)' }}
          >
            {displayTitle}
          </h3>
          <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--mfct-text-muted)' }}>
            {displayStory}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--mfct-border)' }}>
          <div className="flex items-baseline justify-between text-xs font-semibold">
            <span className="font-bold text-sm" style={{ color: 'var(--mfct-dark-green)' }}>
              ₹{campaign.raisedINR.toLocaleString('en-IN')}{' '}
              <span className="font-normal text-xs" style={{ color: 'var(--mfct-text-muted)' }}>{t('card.raised', 'raised')}</span>
            </span>
            <span style={{ color: 'var(--mfct-text-muted)' }}>
              {t('card.ofGoal', 'Goal')}: ₹{campaign.goalINR.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--mfct-warm-bg-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentRaised}%`,
                background: 'linear-gradient(90deg, var(--mfct-dark-green) 0%, var(--mfct-gold) 100%)'
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-medium pt-1" style={{ color: 'var(--mfct-text-muted)' }}>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} /> {campaign.donorsCount} {t('card.donors', 'Donors')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} /> {campaign.daysLeft} {t('card.daysLeft', 'Days Left')}
            </span>
            <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>{percentRaised}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => router.push(`/campaigns/${campaign.id}`)}
            className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex-1 cursor-pointer"
            style={{ background: 'var(--mfct-warm-bg-2)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-border)' }}
          >
            {t('card.viewDetail', 'Read Story & Docs')}
          </button>
          <button
            onClick={() => onDonate(rawCampaign)}
            className="mfct-btn-gold py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-current" /> {t('card.donateNow', 'Donate')}
          </button>
        </div>
      </div>
    </div>
  );
};
