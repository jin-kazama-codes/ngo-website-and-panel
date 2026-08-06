'use client';

import React from 'react';
import { Campaign } from '../types';
import { X, ShieldCheck, Sparkles, FileText, CheckCircle2, Clock, Users, Building2, Heart, QrCode, Share2 } from 'lucide-react';

interface CampaignDetailModalProps {
  campaign: Campaign;
  onClose: () => void;
  onDonate: (campaign: Campaign) => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({ campaign, onClose, onDonate }) => {
  const percentRaised = Math.min(100, Math.round((campaign.raisedINR / campaign.goalINR) * 100));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: `Support this verified campaign on SevaSangam: ${campaign.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Campaign link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image & Tags */}
        <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden mb-6 bg-slate-100 shadow-md">
          <img
            src={campaign.mainImage}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/90 text-slate-900 font-bold text-xs shadow-sm">
              {campaign.category}
            </span>
            {campaign.isZakatEligible && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Zakat Eligible
              </span>
            )}
            {campaign.isVerified && (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> On-site Verified
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs text-emerald-300 font-medium flex items-center gap-1">
              <Building2 className="w-4 h-4 shrink-0" /> {campaign.communityName} • {campaign.city}
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mt-1">
              {campaign.title}
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
                raised of ₹{campaign.goalINR.toLocaleString('en-IN')}
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
              <Users className="w-4 h-4 text-slate-400" /> {campaign.donorsCount} Supporters
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-500" /> {campaign.daysLeft} Days Remaining
            </span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onDonate(campaign)}
              className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Heart className="w-4 h-4 fill-current" /> Donate Now
            </button>
            <button
              onClick={handleShare}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              title="Share Campaign"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Section */}
        <div className="space-y-6 text-slate-800 text-sm leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Beneficiary Background & Story
            </h3>
            <p className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-medium text-slate-700">
              <strong className="text-slate-900 block mb-1">Beneficiary: {campaign.beneficiaryName}</strong>
              <span className="text-xs text-slate-500 block mb-3">{campaign.beneficiaryRelation}</span>
              {campaign.story}
            </p>
          </div>

          {/* Need Breakdown Table */}
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Itemized Financial Breakdown
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Expense Item</th>
                    <th className="p-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaign.needBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">{item.item}</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        ₹{item.amountINR.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/60 font-bold text-emerald-900">
                    <td className="p-3">Total Verified Goal</td>
                    <td className="p-3 text-right text-sm">
                      ₹{campaign.goalINR.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Documents */}
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Verified Documents & Proofs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaign.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{doc.title}</p>
                      <p className="text-[10px] text-slate-500">Verified by: {doc.verifiedBy}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Audit Timeline */}
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Audit & Verification Progress
            </h3>
            <div className="space-y-3">
              {campaign.verificationTimeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{step.step}</p>
                    <p className="text-[11px] text-slate-400">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors text-xs"
          >
            Close Window
          </button>
          <button
            onClick={() => onDonate(campaign)}
            className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Heart className="w-4 h-4 fill-current" /> Donate to This Cause
          </button>
        </div>
      </div>
    </div>
  );
};
