'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, Testimonial, CommunityStory, Donation, Community, AccountDetails } from '../types';
import { getCampaigns, sortCampaignsByLatest } from '../services/campaignService';
import { getTestimonials } from '../services/testimonialService';
import { getCommunityStories } from '../services/storiesService';
import { getRecentDonations } from '../services/donationService';
import { getCommunities } from '../services/communityService';
import { subscribeNewsletter, submitContactMessage } from '../services/contactService';
import { getUsers } from '../services/userService';
import { getAccountDetails } from '../services/adminService';
import { CampaignCard } from '../components/CampaignCard';
import { CampaignSkeleton } from '../components/CampaignSkeleton';
import { MembershipBanner } from '../components/MembershipBanner';
import {
  Heart,
  UserPlus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Building2,
  Phone,
  HelpCircle,
  ChevronDown,
  Activity,
  BookOpen,
  Church,
  Send,
  MessageSquare,
  MapPin,
  Flame,
  Calculator
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useAppState } from '../providers/AppStateProvider';
import Link from 'next/link';
import {
  translateTestimonial,
  translateDonorName,
  translateCampaignTitle,
  translateCommunityName,
  translateCity,
  translateRole,
  translateQuote,
} from '../lib/translateEntity';
import { autoTranslateText, useDynamicTranslatedText } from '../lib/autoTranslate';

const RecentDonationRow: React.FC<{ don: Donation; language: any; t: any }> = ({ don, language, t }) => {
  const donorName = useDynamicTranslatedText(don.donorName, language);
  const campaignTitle = useDynamicTranslatedText(don.campaignTitle, language);
  const communityName = translateCommunityName(don.communityName, language);

  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0 text-xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
          {(donorName || 'D').charAt(0)}
        </div>
        <div>
          <p className="font-bold text-slate-900">
            {donorName} <span className="text-slate-400 font-normal">{t('home.donated_label', 'donated')}</span> ₹{don.amountINR.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400">
            {campaignTitle} • {communityName}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-100 block mb-0.5">
          ✓ {t('home.utr_verified', 'UTR Verified')}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">{don.date}</span>
      </div>
    </div>
  );
};

const HomeTestimonialCard: React.FC<{ rawTestimonial: Testimonial; language: any }> = ({ rawTestimonial, language }) => {
  const displayName = useDynamicTranslatedText(rawTestimonial.name, language);
  const displayCity = useDynamicTranslatedText(rawTestimonial.city, language);
  const displayQuote = useDynamicTranslatedText(rawTestimonial.quote, language);
  const displayRole = translateRole(rawTestimonial.role, language);

  return (
    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
      <p className="text-xs text-slate-300 italic leading-relaxed">
        &ldquo;{displayQuote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-3 border-t border-slate-700/60">
        {rawTestimonial.avatar ? (
          <img src={rawTestimonial.avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-400" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-emerald-900/60 text-emerald-300 font-bold flex items-center justify-center ring-1 ring-emerald-400 text-xs">
            {(displayName || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="font-bold text-xs text-white truncate">{displayName}</h4>
          <p className="text-[10px] text-slate-400 truncate">{displayRole} • {displayCity}</p>
        </div>
      </div>
    </div>
  );
};

interface HomePageProps {
  onDonate: (campaign?: Campaign) => void;
  onOpenRegister: () => void;
  onNavigatePage: (page: string) => void;
  onOpenZakatCalc?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onDonate,
  onOpenRegister,
  onNavigatePage,
  onOpenZakatCalc,
}) => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated, activeUser } = useAppState();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Live DB data states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [realTotalMembers, setRealTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      getCampaigns({ status: 'active' }),
      getTestimonials(),
      getCommunityStories(),
      getRecentDonations(5),
      getCommunities(),
      getUsers(),
      getAccountDetails(),
    ])
      .then(([cData, tData, sData, dData, commData, uData, accData]) => {
        setCampaigns(sortCampaignsByLatest(cData));
        setTestimonials(tData);
        setStories(sData);
        setRecentDonations(dData);
        setCommunities(commData);
        setRealTotalMembers(uData.length);
        if (accData && accData.length > 0) {
          setAccountDetails(accData[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalMembers = realTotalMembers > 0 ? realTotalMembers : communities.reduce((sum, c) => sum + c.totalMembers, 0);
  const totalRaised = communities.reduce((sum, c) => sum + c.totalRaisedINR, 0);
  const avgHealth = communities.length
    ? Math.round(communities.reduce((sum, c) => sum + c.healthScore, 0) / communities.length)
    : 0;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await subscribeNewsletter(newsletterEmail);
      setNewsletterSubscribed(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactMsg) return;
    try {
      await submitContactMessage({
        name: contactName,
        phone: contactPhone,
        message: contactMsg,
      });
      setContactSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Filters
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' ||
      c.category === selectedCategory ||
      (selectedCategory === 'Zakat' && c.isZakatEligible) ||
      (selectedCategory === 'Urgent' && c.isUrgent);
    return matchesSearch && matchesCat;
  });

  const myCommunityCampaigns = isAuthenticated && activeUser?.communityId
    ? campaigns.filter(c => c.communityId === activeUser.communityId)
    : [];

  const categoriesList = [
    { id: 'Medical', label: t('cat.medical', 'Medical Aid'), icon: Activity, count: campaigns.filter(c => c.category === 'Medical').length, desc: t('home.cat_medical_desc', 'Hospital & Surgery') },
    { id: 'Education', label: t('cat.education', 'Education'), icon: BookOpen, count: campaigns.filter(c => c.category === 'Education').length, desc: t('home.cat_education_desc', 'Orphans & Students') },
    { id: 'Marriage', label: t('cat.marriage', 'Marriage'), icon: Heart, count: campaigns.filter(c => c.category === 'Marriage').length, desc: t('home.cat_marriage_desc', 'Dowry-free Nikah') },
    { id: 'Janazah', label: t('cat.janazah', 'Janazah'), icon: Church, count: campaigns.filter(c => c.category === 'Janazah').length, desc: t('home.cat_janazah_desc', 'Ambulance & Shroud') },
    { id: 'Food', label: t('cat.food', 'Food'), icon: Flame, count: campaigns.filter(c => c.category === 'Food').length, desc: t('home.cat_food_desc', 'Monthly Ration Kits') },
    { id: 'Zakat', label: t('cat.zakat', 'Zakat'), icon: ShieldCheck, count: campaigns.filter(c => c.isZakatEligible).length, desc: t('home.cat_zakat_desc', '100% Zakat Eligible') },
  ];

  const faqs = [
    {
      q: t('home.faq1_q', 'How does the ₹50 membership model work?'),
      a: t('home.faq1_a', 'When you pay the nominal ₹50 annual fee, you become a verified member of your local community. This fee builds our solidarity emergency fund.'),
    },
    {
      q: t('home.faq2_q', 'Are Zakat donations strictly Zakat-compliant?'),
      a: t('home.faq2_a', 'Yes! Our platform enforces a system-level rule where Zakat funds can only be transferred to Zakat-eligible causes.'),
    },
    {
      q: t('home.faq3_q', 'How are campaigns verified before publishing?'),
      a: t('home.faq3_a', 'Each campaign goes through 3-level verification: 1) On-site visit by local admin, 2) Hospital/medical bill audit by our executive team, and 3) Direct payment escrow to hospital or vendor accounts.'),
    },
    {
      q: t('home.faq4_q', 'Can I donate to campaigns outside my local community?'),
      a: t('home.faq4_a', 'Absolutely! By using the "Help Outside Community" toggle during donation, you can support verified cases across India.'),
    },
  ];

  return (
    <div className="space-y-16 pb-12 animate-fade-in text-[#1A1A1A]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-14 pb-16 overflow-hidden">
        {/* Background decoration orbs */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* ── Left Column ── */}
            <div className="lg:col-span-7 space-y-6">

              {/* Location badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-200 shadow-sm text-emerald-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('home.headquartered', 'Headquartered in Bareilly, Uttar Pradesh')}</span>
              </div>

              {/* Headline — uses fresh keys to avoid DB clash */}
              <h1 className="text-4xl sm:text-[3.4rem] font-black text-slate-900 tracking-tight leading-[1.1]">
                {t('home.hero_line1', 'Transparent Direct')}{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-emerald-600">
                    {t('home.hero_line2_giving', 'Giving')}
                  </span>
                  <span className="absolute bottom-1 left-0 w-full h-2.5 bg-emerald-100 rounded-full" style={{ zIndex: 0 }} />
                </span>
                {' '}{t('home.hero_line3_to_local', 'to Local')}{' '}
                <span className="text-emerald-700">{t('home.hero_line4_nbhood', 'Neighbourhoods,')}</span>
                <br />
                <span className="text-slate-700 font-extrabold">{t('home.hero_line5_help', 'helping those in need.')}</span>
              </h1>

              {/* Sub-description */}
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed font-normal max-w-lg">
                {t('home.hero_desc', '100% verified direct relief for hospital care, orphan education, dignified Nikah support, Janazah burial services, and food rations.')}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: ShieldCheck, label: t('home.trust_zakat', 'Zakat Compliant') },
                  { icon: CheckCircle2, label: t('home.trust_verified', 'UTR Verified Receipts') },
                  { icon: Building2,   label: t('home.trust_registered', 'Govt. Registered NGO') },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
                    <Icon className="w-3.5 h-3.5 text-emerald-500" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenRegister}
                  className="group py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm transition-all duration-200 shadow-lg hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {t('home.become_member', 'Become a Member')}
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-bold">₹50</span>
                </button>

                <button
                  onClick={() => onDonate()}
                  className="group py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                  {t('home.donate_now', 'Donate Now')}
                </button>

                {onOpenZakatCalc && (
                  <button
                    onClick={onOpenZakatCalc}
                    className="group py-3.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm transition-all duration-200 shadow-lg hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer border border-amber-300"
                  >
                    <Calculator className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    {t('home.zakat_calc', 'Zakat Calculator')}
                  </button>
                )}
              </div>

              {/* Live Stats */}
              <div className="pt-4 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-2.5 sm:p-4 hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-center overflow-hidden">
                    {loading ? (
                      <div className="h-6 sm:h-8 w-12 sm:w-16 bg-slate-100 rounded animate-pulse mb-1" />
                    ) : (
                      <span className="text-base sm:text-2xl lg:text-3xl font-black text-slate-900 block tabular-nums leading-tight truncate">
                        {totalMembers > 0 ? totalMembers.toLocaleString('en-IN') : '0'}+
                      </span>
                    )}
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-0.5 block leading-tight truncate">{t('home.verified_members', 'Verified Members')}</span>
                  </div>

                  <div className="rounded-2xl bg-emerald-600 border border-emerald-500 shadow-md shadow-emerald-200/60 p-2.5 sm:p-4 hover:shadow-lg transition-all flex flex-col justify-center overflow-hidden">
                    {loading ? (
                      <div className="h-6 sm:h-8 w-16 sm:w-20 bg-emerald-500/50 rounded animate-pulse mb-1" />
                    ) : (
                      <span className="text-[11px] xs:text-xs sm:text-lg lg:text-2xl font-black text-white block tabular-nums leading-tight tracking-tight truncate">
                        ₹{totalRaised > 0 ? totalRaised.toLocaleString('en-IN') : '0'}+
                      </span>
                    )}
                    <span className="text-[10px] sm:text-[11px] text-emerald-100 font-semibold mt-0.5 block leading-tight truncate">{t('home.funds_disbursed', 'Relief Disbursed')}</span>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-2.5 sm:p-4 hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-center overflow-hidden">
                    {loading ? (
                      <div className="h-6 sm:h-8 w-10 sm:w-12 bg-slate-100 rounded animate-pulse mb-1" />
                    ) : (
                      <span className="text-base sm:text-2xl lg:text-3xl font-black text-slate-900 block leading-tight truncate">100%</span>
                    )}
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-0.5 block leading-tight truncate">{t('home.audit_receipts', 'Audit Receipts')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-4 bg-emerald-400/10 rounded-[2.5rem] blur-2xl pointer-events-none" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200 group">
                <img
                  src="https://images.unsplash.com/photo-1644726270363-e746b37b482b?q=80&w=465&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="MFCT Food Ration Distribution Drive"
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-transparent" />

                {/* Live badge – top left */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {t('home.live_verified', 'Live & Verified')}
                  </span>
                </div>

                {/* QR + UPI panel – bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 flex items-center gap-4">
                    {/* QR code */}
                    <div className="bg-white p-2.5 rounded-xl shadow-lg shrink-0">
                      {accountDetails?.qr_code_url ? (
                        <img src={accountDetails.qr_code_url} alt="QR Code" className="w-20 h-20 object-contain" />
                      ) : (
                        <QrCode className="w-20 h-20 text-slate-900" />
                      )}
                    </div>

                    {/* UPI details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-1">
                        {t('home.scan_donate', 'Scan QR or Copy UPI ID to Donate')}
                      </p>
                      <p className="font-mono text-white font-bold text-lg select-all tracking-wide truncate">
                        {accountDetails?.upi_id || 'nsns@oksbi'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {['GPay', 'PhonePe', 'Paytm'].map(app => (
                          <span key={app} className="px-2 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold border border-white/20">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {t('home.live_verified', 'Live & Verified')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CATEGORY CAROUSEL & CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">{t('home.targeted_giving', 'Targeted Giving')}</span>
            <h2 className="text-2xl font-extrabold text-slate-900">{t('home.explore_categories', 'Explore Aid Categories')}</h2>
          </div>
          <p className="text-xs text-slate-500">{t('home.category_subtitle', 'Direct aid channels reaching those who need it most')}</p>
        </div>

        {/* Category Pill Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoriesList.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {cat.count}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs">{cat.label}</h4>
                  <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* YOUR COMMUNITY CAMPAIGNS (LOGGED IN) */}
      {isAuthenticated && activeUser && (loading || myCommunityCampaigns.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">{t('home.your_community', 'Your Community')}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('home.community_campaigns_title', 'Campaigns in {{community}}').replace('{{community}}', activeUser.communityName || '')}</h2>
              <p className="text-xs text-slate-500 mt-1">{t('home.community_campaigns_desc', 'Active relief campaigns running in your local neighbourhood.')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((i) => <CampaignSkeleton key={i} />)
            ) : myCommunityCampaigns.length > 0 ? (
              myCommunityCampaigns.slice(0, 3).map((camp) => (
                <CampaignCard
                  key={camp.id}
                  campaign={camp}
                  onDonate={onDonate}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                {t('home.no_campaigns', 'No active campaigns found in this category.')}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ZAKAT CALCULATOR HIGHLIGHT BANNER */}
      {onOpenZakatCalc && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/80 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative z-10 space-y-2 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-extrabold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> 100% Shariah Compliant Calculator
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {t('home.zakat_modal_title', 'Calculate Your Zakat (2.5%)')}
              </h3>
              <p className="text-emerald-100/90 text-xs sm:text-sm">
                {t('home.faq2_a', 'Enter gold, silver, savings and investments to instantly know your Zakat due and donate directly.')}
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={onOpenZakatCalc}
                className="py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 group cursor-pointer"
              >
                <Calculator className="w-5 h-5 text-amber-950" />
                <span>{t('home.zakat_calc', 'Free Zakat Calculator')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURED CAMPAIGNS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">{t('home.how_tag', 'On-site Verified Causes')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('home.featured_title', 'Featured Active Campaigns')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('home.featured_desc', 'High-impact relief campaigns verified at the grassroots level')}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['All', 'Urgent', 'Zakat', 'Medical', 'Education', 'Food', 'Marriage', 'Janazah'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {cat === 'All' ? t('home.cat_all', 'All') :
                 cat === 'Urgent' ? t('home.cat_urgent', 'Urgent') :
                 cat === 'Zakat' ? t('cat.zakat', 'Zakat') :
                 cat === 'Medical' ? t('cat.medical', 'Medical') :
                 cat === 'Education' ? t('cat.education', 'Education') :
                 cat === 'Food' ? t('cat.food', 'Food') :
                 cat === 'Marriage' ? t('cat.marriage', 'Marriage') :
                 cat === 'Janazah' ? t('cat.janazah', 'Janazah') : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map((i) => <CampaignSkeleton key={i} />)
          ) : filteredCampaigns.length > 0 ? (
            filteredCampaigns.slice(0, 6).map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onDonate={onDonate}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
              {t('home.no_campaigns', 'No active campaigns found in this category.')}
            </div>
          )}
        </div>

        {campaigns.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/campaigns"
              onClick={(e) => {
                e.preventDefault();
                router.push('/campaigns');
              }}
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {t('home.view_all_campaigns', 'View All Campaigns')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 5. BECOME A MEMBER (₹50) HIGHLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MembershipBanner />
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-12 bg-white rounded-2xl border border-slate-200 max-w-7xl mx-auto px-6 sm:px-12 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{t('home.how_tag', 'Simple & Trustworthy')}</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{t('home.how_title', 'How Does It Work?')}</h2>
          <p className="text-xs text-slate-500">{t('home.how_desc', 'A simple 4-step model for transparent and direct aid')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{t('home.step1_title', '1. Grassroots Identification & Verification')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('home.step1_desc', 'Mohalla elders and field volunteers personally verify every case.')}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{t('home.step2_title', '2. Direct Bank & Hospital Payments')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('home.step2_desc', 'Funds go directly to hospitals, vendors, or beneficiaries.')}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{t('home.step3_title', '3. 100% Audit & Receipts')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('home.step3_desc', 'Every transaction\'s bill and audit report is publicly available on the app.')}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{t('home.step4_title', '4. Video & Photo Updates')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('home.step4_desc', 'Proof is shared with donors immediately after relief is delivered.')}
            </p>
          </div>
        </div>
      </section>

      {/* 9. LIFE IMPACT & MEMBERS JOINED COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Life Impact Counter Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">{t('home.impact_counter_tag', 'Impact')}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">{t('home.impact_realtime', 'Live')}</span>
              </div>
              <p className="text-4xl font-extrabold">{testimonials.length} </p>
              <p className="text-xs text-emerald-100 mt-1">{t('home.impact_counter_desc', 'Lives changed and successful relief stories')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('home.members_counter_tag', 'Network')}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">{t('home.today_badge', 'Active')} +14</span>
              </div>
              {loading ? (
                <div className="h-10 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-4xl font-extrabold text-slate-900">{totalMembers > 0 ? totalMembers.toLocaleString('en-IN') : '0'}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">{t('home.members_counter_desc', 'Registered volunteers and donor members')}</p>
            </div>
          </div>

          {/* Communities Joined Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('home.communities_tag', 'Mohalla Hub')}</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                  {loading ? '...' : (communities.length > 0 ? communities.length : '0')} {t('home.active_hubs', 'Active Hubs')}
                </span>
              </div>
              {loading ? (
                <div className="h-10 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-4xl font-extrabold text-slate-900">{avgHealth}%</p>
              )}
              <p className="text-xs text-slate-500 mt-1">{t('home.communities_desc', 'Average community health and verification score')}</p>
            </div>

            <button
              onClick={() => onNavigatePage('communities')}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> {t('home.explore_communities', 'Explore Community Network')}
            </button>
          </div>
        </div>
      </section>

      {/* 10. RECENT DONATIONS LIVE FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">{t('home.donations_feed_title', 'Recent Donations')}</h3>
            </div>
            <span className="text-xs text-slate-400">{t('home.donations_feed_subtitle', 'Transparent Live Feed')}</span>
          </div>

          <div className="space-y-3">
            {recentDonations.map((don) => (
              <RecentDonationRow key={don.id} don={don} language={language} t={t} />
            ))}
            {recentDonations.length === 0 && !loading && (
              <p className="text-xs text-slate-400 text-center py-4">{t('home.no_donations', 'No donation records yet')}</p>
            )}
          </div>
        </div>
      </section>

      {/* 11. COMMUNITY STORIES & TESTIMONIALS */}
      <section className="bg-slate-900 text-white py-12 rounded-2xl max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t('home.testimonials_tag', 'Stories')}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('home.testimonials_title', 'Grassroots Impact Stories')}</h2>
          <p className="text-xs text-slate-400">{t('home.testimonials_desc', 'Experiences of beneficiaries and field volunteers')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 9).map((rawTestimonial) => (
            <HomeTestimonialCard key={rawTestimonial.id} rawTestimonial={rawTestimonial} language={language} />
          ))}
        </div>

        {testimonials.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/impact-stories"
              onClick={(e) => {
                e.preventDefault();
                router.push('/impact-stories');
              }}
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {t('home.view_all_stories', 'View All Stories')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 15. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{t('home.faq_tag', 'Frequently Asked Questions')}</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{t('home.faq_title', 'FAQ')}</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm transition-all cursor-pointer"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" /> {faq.q}
                </h3>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </div>
              {activeFaq === idx && (
                <p className="mt-2 text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 17. CONTACT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{t('home.contact_tag', 'Contact')}</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{t('home.contact_title', 'Need Help or Have a Question?')}</h2>
          <p className="text-xs text-slate-500">{t('home.contact_desc', 'Our team is available 24/7 to assist you')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">{t('home.send_message', 'Send Message')}</h3>

            {contactSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-center space-y-1 border border-emerald-200 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-900">{t('home.msg_received', 'Your message has been received!')}</p>
                <p className="text-slate-600">{t('home.msg_received_desc', 'Our team will contact you soon.')}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t('home.your_name', 'Your Name')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('home.name_placeholder', 'Enter your full name')}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t('home.phone_number', 'Phone Number')}</label>
                    <input
                      type="number"
                      required
                      placeholder={t('home.phone_placeholder', '10-digit mobile number')}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('home.help_label', 'Your Need / Message')}</label>
                  <textarea
                    rows={3}
                    required
                    placeholder={t('home.help_placeholder', 'Describe in detail how we can help you...')}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> {t('home.send_request', 'Send Message')}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 shadow-md">
              <h4 className="font-bold text-sm text-white">{t('home.emergency_desks', 'Emergency Helpline')}</h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">{t('home.helpline_247', '24/7 Emergency Support')}</span>
                    <span className="font-bold text-white text-xs">{t('home.helpline_num', '+91 1800 200 MFCT (6328)')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950 border border-emerald-500/30">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-emerald-300 block uppercase font-bold">{t('home.whatsapp_desk', 'WhatsApp Support Desk')}</span>
                    <span className="font-bold text-white text-xs">{t('home.whatsapp_num', '+91 98100 12345')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
