'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campaign } from '../types';
import { getCampaignById } from '../services/campaignService';
import {
  ShieldCheck,
  Sparkles,
  Clock,
  Users,
  Building2,
  Heart,
  Share2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAppState } from '../providers/AppStateProvider';
import { useLanguage } from '../context/LanguageContext';
import {
  translateCampaign,
  translateCategory,
  translateCampaignTitle,
  translateCampaignStory,
  translateCity,
  translateCommunityName
} from '../lib/translateEntity';
import { autoTranslateText } from '../lib/autoTranslate';
import Link from 'next/link';

export const CampaignDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { handleOpenDonate } = useAppState();
  const [rawCampaign, setRawCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayStory, setDisplayStory] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      getCampaignById(id)
        .then((data) => {
          setRawCampaign(data);
          if (data) {
            setDisplayTitle(data.title);
            setDisplayStory(data.story);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  useEffect(() => {
    if (!rawCampaign) return;
    const allImages = [rawCampaign.mainImage, ...(rawCampaign.galleryImages || [])].filter(Boolean);
    if (allImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [rawCampaign]);

  useEffect(() => {
    if (!rawCampaign) return;
    if (language === 'en') {
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
  }, [rawCampaign, language]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-32 h-6 bg-slate-200 rounded-lg animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-10 bg-slate-200 rounded-xl animate-pulse w-3/4"></div>
            <div className="h-[400px] bg-slate-200 rounded-3xl animate-pulse"></div>
            <div className="h-40 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
          <div className="lg:col-span-4">
            <div className="h-[450px] bg-slate-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rawCampaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {t('campaigns.not_found', 'Campaign Not Found')}
        </h2>
        <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
          {t('campaigns.not_found_desc', 'The campaign you are looking for does not exist or has been completed.')}
        </p>
        <button
          onClick={() => router.push('/campaigns')}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          {t('home.view_all_campaigns', 'View All Campaigns')}
        </button>
      </div>
    );
  }

  const campaign = translateCampaign(rawCampaign, language);
  const displayCat = translateCategory(rawCampaign.category, language);
  const percentRaised = Math.min(100, Math.round((campaign.raisedINR / campaign.goalINR) * 100));
  const allImages = [campaign.mainImage, ...(campaign.galleryImages || [])].filter(Boolean);
  const currentImg = allImages[currentImageIdx] || allImages[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: displayTitle,
          text: `Support this verified campaign on MFCT: ${displayTitle}`,
          url: window.location.href,
        })
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">
          {t('nav.home', 'Home')}
        </Link>
        <span>/</span>
        <Link href="/campaigns" className="hover:text-emerald-600 transition-colors">
          {t('nav.campaigns', 'All Campaigns')}
        </Link>
        <span>/</span>
        <span className="text-slate-800 truncate max-w-[200px] sm:max-w-xs">{displayTitle}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media, Story, Proofs, Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Title Section (Outside & Above Image for High Readability) */}
          <div className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200 shadow-xs">
                {displayCat}
              </span>
              {campaign.isZakatEligible && (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> {t('card.zakat', 'Zakat Eligible')}
                </span>
              )}
              {campaign.isUrgent && (
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 animate-pulse">
                  ⚡ {t('card.urgent', 'Urgent Need')}
                </span>
              )}
              {campaign.isVerified && (
                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> {t('card.verified', '100% On-Site Verified')}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {displayTitle}
            </h1>

            {/* Community & Location Badge */}
            <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600 flex-wrap">
              <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-100">
                <Building2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">{campaign.communityName}</span>
                <span className="text-slate-400">•</span>
                <span>{translateCity(campaign.city, language)}</span>
              </div>
              <span className="text-slate-400">
                {t('campaigns.beneficiaryLabel', 'Beneficiary')}: <strong className="text-slate-800">{campaign.beneficiaryName}</strong> ({campaign.beneficiaryRelation})
              </span>
            </div>
          </div>

          {/* Hero Image Showcase / Gallery Carousel */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-md border border-slate-200/80 group aspect-[16/10] sm:max-h-[460px] w-full">
            <img
              key={currentImg}
              src={currentImg}
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=60';
              }}
              alt={displayTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>

            {/* Controls if multiple images */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all shadow-md z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all shadow-md z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Thumbnails Navigation at Bottom */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 p-1.5 bg-black/50 backdrop-blur-md rounded-2xl border border-white/20">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIdx(idx);
                      }}
                      className={`cursor-pointer w-10 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIdx ? 'border-emerald-400 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Story & Background Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {t('modal.story', 'Beneficiary Background & Cause Details')}
              </h2>
            </div>

            {/* Beneficiary Highlight Box */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 rounded-2xl border border-emerald-100/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                {campaign.beneficiaryName.charAt(0) || 'B'}
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900 text-sm">{campaign.beneficiaryName}</p>
                <p className="text-emerald-800 font-medium">
                  {campaign.beneficiaryRelation} • {campaign.communityName} ({translateCity(campaign.city, language)})
                </p>
                <p className="text-slate-500 pt-1 text-[11px]">
                  {t('campaigns.verifiedNotice', 'Verified through local field volunteer visit & hospital / wedding documentation check.')}
                </p>
              </div>
            </div>

            {/* Story Paragraphs */}
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {displayStory}
            </div>
          </div>

          {/* Itemized Financial Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {t('admin.tabAudit', 'Itemized Financial Breakdown')}
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                100% Direct Escrow
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden text-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                  <tr>
                    <th className="p-4">{t('modal.campCategory', 'Expense Description')}</th>
                    <th className="p-4 text-right">{t('modal.goalAmount', 'Target Goal')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-4 font-medium text-slate-800">
                      {displayTitle} ({displayCat})
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-700">
                      ₹{campaign.goalINR.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/70 font-extrabold text-emerald-950 text-base">
                    <td className="p-4">{t('admin.statTotalRaised', 'Total Verified Amount Needed')}</td>
                    <td className="p-4 text-right text-emerald-700">
                      ₹{campaign.goalINR.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Verified KYC Documents & Proofs */}
          {campaign.documents && campaign.documents.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {t('sec.impactTitle', 'Verified Documents & Proofs')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {campaign.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-slate-900 truncate">{doc.title}</p>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> {doc.verifiedBy || 'Field Admin'}
                      </span>
                    </div>

                    {doc.url && doc.url !== '#' ? (
                      <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={doc.url}
                          alt={doc.title}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=60';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Aadhaar & Medical verification audited on-site.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Action Donation Box & Security Guarantees */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          {/* Main Donation Action Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
            {/* Top Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

            {/* Progress Metrics */}
            <div className="space-y-3 pt-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    ₹{campaign.raisedINR.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {t('home.raised_of', 'raised of')} <strong className="text-slate-800">₹{campaign.goalINR.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">{percentRaised}%</span>
                  <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">funded</span>
                </div>
              </div>

              {/* Progress Bar with Glow */}
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${percentRaised}%` }}
                ></div>
              </div>

              {/* Supporter Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-bold text-sm">{campaign.donorsCount}</strong>
                    <span className="text-slate-500 text-[11px]">{t('card.donors', 'Supporters')}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-bold text-sm">{campaign.daysLeft}</strong>
                    <span className="text-slate-500 text-[11px]">{t('card.daysLeft', 'Days Left')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct CTA Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleOpenDonate(rawCampaign)}
                className="cursor-pointer w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Heart className="w-5 h-5 fill-current" />
                <span>{t('card.donateNow', 'Donate to This Cause')}</span>
              </button>

              <button
                onClick={handleShare}
                className="cursor-pointer w-full py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">{t('campaigns.link_copied', 'Link Copied!')}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span>{t('card.share', 'Share Campaign With Friends')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust & Transparency Guarantee */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>100% Verified Escrow Guarantee</span>
              </div>
              <ul className="space-y-1 text-[11px] text-emerald-800 list-disc list-inside">
                <li>Direct zero-commission payout to hospital / vendor</li>
                <li>Instant 80G tax exemption receipt provided</li>
                <li>UTR tracked on community blockchain ledger</li>
              </ul>
            </div>
          </div>

          {/* Quick Contact & Community Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('nav.communities', 'Managing Community')}
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {campaign.communityName.charAt(0) || 'M'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{campaign.communityName}</p>
                <p className="text-xs text-slate-500">{translateCity(campaign.city, language)}, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
