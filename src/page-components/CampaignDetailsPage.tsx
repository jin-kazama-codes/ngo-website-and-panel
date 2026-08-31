'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campaign, Donation } from '../types';
import { getCampaignById } from '../services/campaignService';
import { getCampaignDonations } from '../services/donationService';
import { getUsers } from '../services/userService';
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
  AlertTriangle,
  HeartHandshake,
  Award,
  BadgeCheck
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
import { autoTranslateText, useDynamicTranslatedText } from '../lib/autoTranslate';
import Link from 'next/link';

const CampaignDonorCard: React.FC<{
  d: Donation;
  language: any;
  userAvatars: Record<string, string>;
  tr: (hi: string, ur: string, en: string) => string;
}> = ({ d, language, userAvatars, tr }) => {
  const isAnonymous = !d.donorName || d.donorName.toLowerCase().includes('anonymous') || d.donorName.toLowerCase().includes('गुमनाम');
  const dynamicDonorName = useDynamicTranslatedText(d.donorName, language);
  const displayName = isAnonymous
    ? tr('गुमनाम दानदाता', 'گمنام معاون', 'Anonymous Supporter')
    : (dynamicDonorName || d.donorName);
  const displayCategory = d.category ? translateCategory(d.category, language) : '';
  const initial = (displayName || 'G').trim().charAt(0).toUpperCase();
  const avatarUrl = !isAnonymous ? (d.donorAvatar || userAvatars[d.donorId] || userAvatars[d.donorName?.trim().toLowerCase()]) : null;

  return (
    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all flex items-center justify-between gap-3 group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-2xl object-cover shadow-xs group-hover:scale-105 transition-transform ring-1 ring-emerald-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`avatar-fallback w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform ${avatarUrl ? 'hidden' : 'flex'}`}
          >
            {initial}
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-slate-900 truncate flex items-center gap-1.5">
            <span>{displayName}</span>
            {d.status === 'verified' && (
              <span title="Verified UTR" className="inline-flex items-center shrink-0">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              </span>
            )}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
            <span>{d.date ? new Date(d.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : tr('हाल ही में', 'حال ہی میں', 'Recent')}</span>
            {displayCategory && (
              <>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">{displayCategory}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="text-sm sm:text-base font-extrabold text-emerald-700 block">
          ₹{(d.amountINR || 0).toLocaleString('en-IN')}
        </span>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
          {d.paymentMethod || 'UPI'}
        </span>
      </div>
    </div>
  );
};

export const CampaignDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };
  const { handleOpenDonate } = useAppState();
  const [rawCampaign, setRawCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayStory, setDisplayStory] = useState('');
  const [copied, setCopied] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [donorTab, setDonorTab] = useState<'recent' | 'top'>('recent');
  const [visibleDonorsCount, setVisibleDonorsCount] = useState(6);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    getUsers().then((userList) => {
      const map: Record<string, string> = {};
      (userList || []).forEach((u) => {
        if (u.id && u.avatar) map[u.id] = u.avatar;
        if (u.name && u.avatar) map[u.name.trim().toLowerCase()] = u.avatar;
      });
      setUserAvatars(map);
    }).catch(() => {});
  }, []);

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

      setDonationsLoading(true);
      getCampaignDonations(id)
        .then((data) => {
          setDonations(data || []);
        })
        .catch((err) => {
          console.error('Error fetching campaign donations:', err);
          setDonations([]);
        })
        .finally(() => setDonationsLoading(false));
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

  const displayBeneficiaryName = useDynamicTranslatedText(rawCampaign?.beneficiaryName, language);
  const displayBeneficiaryRelation = useDynamicTranslatedText(rawCampaign?.beneficiaryRelation, language);
  // Must be here (before any early return) per Rules of Hooks
  const displayCommunityName = useDynamicTranslatedText(rawCampaign?.communityName, language);
  const displayCampaignCity = useDynamicTranslatedText(rawCampaign?.city, language);

  useEffect(() => {
    if (!rawCampaign) return;
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
              {campaign.isSadqaEligible && (
                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-900 text-xs font-bold border border-teal-200 shadow-xs flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-100" /> {tr('सदका पात्र', 'صدقہ اہل', 'Sadqa Eligible')}
                </span>
              )}
              {campaign.isFitrahEligible && (
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 text-xs font-bold border border-indigo-200 shadow-xs flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-600" /> {tr('फ़ितरा पात्र', 'فطرہ اہل', 'Fitrah Eligible')}
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
                {t('campaigns.beneficiaryLabel', 'Beneficiary')}: <strong className="text-slate-800">{displayBeneficiaryName || campaign.beneficiaryName}</strong> ({displayBeneficiaryRelation || campaign.beneficiaryRelation})
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

          {/* Donors & Supporters List Section */}
          <div id="donors-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
                  <HeartHandshake className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>{tr('दानदाता एवं समर्थक सूची', 'معاونین اور عطیہ دہندگان', 'Donors & Supporters')}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {donations.length || campaign.donorsCount || 0}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {tr('इस अभियान के लिए सत्यापित पारदर्शी सहयोग रिकॉर्ड', 'اس مہم کے لیے تصدیق شدہ شفاف عطیات کا ریکارڈ', 'Transparent, verified on-chain escrow contribution ledger')}
                  </p>
                </div>
              </div>

              {donations.length > 0 && (
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                  <button
                    onClick={() => setDonorTab('recent')}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all ${
                      donorTab === 'recent'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tr('हालिया दान', 'حالیہ', 'Recent')}
                  </button>
                  <button
                    onClick={() => setDonorTab('top')}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      donorTab === 'top'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{tr('सर्वोच्च दान', 'اعلیٰ', 'Top')}</span>
                  </button>
                </div>
              )}
            </div>

            {donationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                      <div className="space-y-1.5">
                        <div className="w-32 h-4 bg-slate-200 rounded"></div>
                        <div className="w-24 h-3 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                    <div className="w-20 h-6 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : donations.length === 0 ? (
              <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-slate-50 to-teal-50/30 border border-emerald-100/70 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <Heart className="w-6 h-6 fill-current text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">
                    {tr('पहले दानदाता बनें!', 'پہلے معاون بنیں!', 'Be the First Supporter!')}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    {tr(
                      'इस नेक कार्य में पहला सहयोग देकर उम्मीद की किरण जगाएं। आपका हर दान 100% सत्यापित और सुरक्षित है।',
                      'اس مہم میں پہلا عطیہ دے کر مدد کا آغاز کریں۔ آپ کا عطیہ 100 فیصد محفوظ ہے۔',
                      'Make the first contribution to spark hope for this verified cause. Every rupee goes directly to the cause.'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenDonate(rawCampaign)}
                  className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{tr('पहला दान करें', 'پہلا عطیہ دیں', 'Donate to this Cause')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...donations]
                    .sort((a, b) => {
                      if (donorTab === 'top') {
                        return (b.amountINR || 0) - (a.amountINR || 0);
                      }
                      return 0;
                    })
                    .slice(0, visibleDonorsCount)
                    .map((d, idx) => (
                      <CampaignDonorCard
                        key={d.id || idx}
                        d={d}
                        language={language}
                        userAvatars={userAvatars}
                        tr={tr}
                      />
                    ))}
                </div>

                {donations.length > visibleDonorsCount && (
                  <div className="text-center pt-3">
                    <button
                      onClick={() => setVisibleDonorsCount((prev) => prev + 6)}
                      className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      {tr(
                        `और दानदाता देखें (+${donations.length - visibleDonorsCount})`,
                        `مزید معاونین دیکھیں (+${donations.length - visibleDonorsCount})`,
                        `Show More Supporters (+${donations.length - visibleDonorsCount})`
                      )}
                    </button>
                  </div>
                )}

                {donations.length > 6 && visibleDonorsCount > 6 && (
                  <div className="text-center pt-1">
                    <button
                      onClick={() => setVisibleDonorsCount(6)}
                      className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      {tr('कम दिखाएं', 'کم دکھائیں', 'Show Less')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
                <button
                  type="button"
                  onClick={() => document.getElementById('donors-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl flex items-center gap-2.5 text-left transition-colors cursor-pointer border border-transparent hover:border-emerald-100"
                >
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-bold text-sm">
                      {donations.length || campaign.donorsCount || 0}
                    </strong>
                    <span className="text-slate-500 text-[11px] hover:text-emerald-700 font-medium">
                      {t('card.donors', 'Supporters')} ↓
                    </span>
                  </div>
                </button>
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
                <span>{tr('100% सत्यापित एस्क्रो गारंटी', '100% تصدیق شدہ اسکرو گارنٹی', '100% Verified Escrow Guarantee')}</span>
              </div>
              <ul className="space-y-1 text-[11px] text-emerald-800 list-disc list-inside">
                <li>{tr('अस्पताल/विक्रेता को सीधे 0% कमीशन पर भुगतान', 'ہسپتال یا وینڈر کو بلا کمیشن براہ راست ادائیگی', 'Direct zero-commission payout to hospital / vendor')}</li>
                <li>{tr('तत्काल 80G कर छूट रसीद उपलब्ध', 'فوری 80G ٹیکس چھوٹ رسید فراہم کی جاتی ہے', 'Instant 80G tax exemption receipt provided')}</li>
                <li>{tr('पारदर्शी रिकॉर्ड व UTR ऑडिट ट्रेल', 'شفاف کمیونٹی لیجر پر UTR ٹریکنگ', 'UTR tracked on community blockchain ledger')}</li>
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
                <p className="font-bold text-slate-900 text-sm truncate">{displayCommunityName || campaign.communityName}</p>
                <p className="text-xs text-slate-500">{displayCampaignCity || translateCity(campaign.city, language)}, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
