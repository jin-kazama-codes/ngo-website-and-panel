'use client';

import React from 'react';
import { Campaign } from '../types';
import { X, ShieldCheck, Sparkles, FileText, CheckCircle2, Clock, Users, Building2, Heart, QrCode, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDynamicTranslatedText } from '../lib/autoTranslate';
import { translateCategory, translateCity } from '../lib/translateEntity';

interface CampaignDetailModalProps {
  campaign: Campaign;
  onClose: () => void;
  onDonate: (campaign: Campaign) => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({ campaign, onClose, onDonate }) => {
  const { t, language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayTitle = useDynamicTranslatedText(campaign.title, language);
  const displayStory = useDynamicTranslatedText(campaign.story, language);
  const displayBeneficiaryName = useDynamicTranslatedText(campaign.beneficiaryName, language);
  const displayBeneficiaryRelation = useDynamicTranslatedText(campaign.beneficiaryRelation, language);
  const displayCommunityName = useDynamicTranslatedText(campaign.communityName, language);
  const displayCity = useDynamicTranslatedText(campaign.city, language) || translateCity(campaign.city, language);
  const displayCategory = translateCategory(campaign.category, language);

  const percentRaised = Math.min(100, Math.round((campaign.raisedINR / campaign.goalINR) * 100));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayTitle,
        text: `${displayTitle} - MFCT Foundation`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(tr('अभियान लिंक क्लिपबोर्ड पर कॉपी हो गया!', 'مہم کا لنک کاپی ہو گیا!', 'Campaign link copied to clipboard!'));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow-sm transition-colors z-20 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image & Tags */}
        <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden mb-6 bg-slate-100 shadow-md mt-8">
          <img
            src={campaign.mainImage}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=60' }}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/90 text-slate-900 font-bold text-xs shadow-sm">
              {displayCategory}
            </span>
            {campaign.isZakatEligible && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {tr('ज़कात पात्र', 'زکوٰۃ اہل', 'Zakat Eligible')}
              </span>
            )}
            {campaign.isVerified && (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {tr('सत्यापित', 'تصدیق شدہ', 'On-site Verified')}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs text-emerald-300 font-medium flex items-center gap-1">
              <Building2 className="w-4 h-4 shrink-0" /> {displayCommunityName} • {displayCity}
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mt-1">
              {displayTitle}
            </h2>
          </div>
        </div>

        {/* Progress Bar & CTA Bar */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 mb-6 space-y-3">
          <div className="flex items-baseline justify-between text-sm">
            <div>
              <span className="text-2xl font-extrabold text-emerald-700">
                ₹{campaign.raisedINR.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 ml-1.5 font-normal">
                {t('home.raised_of', 'raised of')} ₹{campaign.goalINR.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="font-extrabold text-emerald-600 text-lg">{percentRaised}%</span>
          </div>

          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentRaised}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-400" /> {campaign.donorsCount} {t('card.donors', 'Supporters')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-500" /> {campaign.daysLeft} {t('card.daysLeft', 'Days Remaining')}
            </span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onDonate(campaign)}
              className="cursor-pointer flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Heart className="w-4 h-4 fill-current" /> {t('card.donateNow', 'Donate Now')}
            </button>
            <button
              onClick={handleShare}
              className="cursor-pointer p-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              title={tr('अभियान साझा करें', 'مہم شیئر کریں', 'Share Campaign')}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Section */}
        <div className="space-y-6 text-slate-800 text-sm leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              {tr('लाभार्थी का विवरण एवं कहानी', 'مستفید کی تفصیل اور کہانی', 'Beneficiary Background & Story')}
            </h3>
            <p className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-medium text-slate-700">
              <strong className="text-slate-900 block mb-1">
                {tr('लाभार्थी', 'مستفید', 'Beneficiary')}: {displayBeneficiaryName}
              </strong>
              <span className="text-xs text-slate-500 block mb-3">{displayBeneficiaryRelation}</span>
              {displayStory}
            </p>
          </div>

          {/* Need Breakdown Table */}
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              {tr('वित्तीय आवश्यकता विवरण', 'مالی ضروریات کی تفصیل', 'Itemized Financial Breakdown')}
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">{tr('मद विवरण', 'مد', 'Expense Item')}</th>
                    <th className="p-3 text-right">{tr('राशि (INR)', 'رقم (INR)', 'Amount (INR)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-emerald-50/60 font-bold text-emerald-900">
                    <td className="p-3">{tr('कुल सत्यापित लक्ष्य', 'کل تصدیق شدہ ہدف', 'Total Verified Goal')}</td>
                    <td className="p-3 text-right text-sm">
                      ₹{campaign.goalINR.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Documents */}
          {campaign.documents && campaign.documents.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                {tr('सत्यापित दस्तावेज एवं प्रमाण', 'تصدیق شدہ دستاویزات و ثبوت', 'Verified Documents & Proofs')}
              </h3>
              <div className="space-y-6">
                {campaign.documents.map((doc, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{doc.title}</p>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        {tr('सत्यापित कर्ता', 'تصدیق کنندہ', 'Verified by')} {doc.verifiedBy}
                      </span>
                    </div>
                    {doc.url && (
                      <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                        <img 
                          src={doc.url} 
                          alt={doc.title}
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=60' }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer py-3 px-5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors text-xs"
          >
            {tr('बंद करें', 'بند کریں', 'Close Window')}
          </button>
          <button
            onClick={() => onDonate(campaign)}
            className="cursor-pointer py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Heart className="w-4 h-4 fill-current" /> {t('card.donateNow', 'Donate to This Cause')}
          </button>
        </div>
      </div>
    </div>
  );
};
