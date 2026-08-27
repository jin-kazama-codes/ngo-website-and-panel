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
  Users,
  Building2,
  Search,
  Filter,
  Phone,
  Mail,
  Play,
  HelpCircle,
  ChevronDown,
  Activity,
  Layers,
  Award,
  BookOpen,
  Church,
  TrendingUp,
  Instagram,
  Facebook,
  Download,
  Send,
  MessageSquare,
  Check,
  MapPin,
  Flame,
  Shield,
  Share2,
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
    <div className="flex items-center justify-between gap-4 py-2 last:border-0 text-xs" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0" style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}>
          {(donorName || 'D').charAt(0)}
        </div>
        <div>
          <p className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>
            {donorName} <span style={{ color: 'var(--mfct-text-muted)', fontWeight: 400 }}>{t('home.donated_label', 'donated')}</span> ₹{don.amountINR.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--mfct-text-muted)' }}>
            {campaignTitle} • {communityName}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="px-2 py-0.5 rounded font-bold text-[10px] block mb-0.5" style={{ background: 'rgba(200,168,75,0.1)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}>
          ✓ {t('home.utr_verified', 'UTR Verified')}
        </span>
        <span className="text-[10px] font-mono" style={{ color: 'var(--mfct-text-muted)' }}>{don.date}</span>
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
    <div className="p-5 rounded-xl space-y-3 flex flex-col justify-between transition-all" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(200,168,75,0.2)' }}>
      <p className="text-xs italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
        &ldquo;{displayQuote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(200,168,75,0.15)' }}>
        {rawTestimonial.avatar ? (
          <img src={rawTestimonial.avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover" style={{ border: '2px solid var(--mfct-gold)' }} />
        ) : (
          <div className="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs" style={{ background: 'rgba(200,168,75,0.2)', color: 'var(--mfct-gold)', border: '2px solid var(--mfct-gold)' }}>
            {(displayName || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="font-bold text-xs text-white truncate">{displayName}</h4>
          <p className="text-[10px] truncate" style={{ color: 'rgba(200,168,75,0.7)' }}>{displayRole} • {displayCity}</p>
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
    <div className="space-y-16 pb-12 animate-fade-in" style={{ color: 'var(--mfct-text-dark)' }}>
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-14 pb-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.06)' }} />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(26,60,44,0.08)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* ── Left Column ── */}
            <div className="lg:col-span-7 space-y-6">

              {/* Location badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(200,168,75,0.10)', border: '1px solid rgba(200,168,75,0.3)', color: 'var(--mfct-dark-green)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: 'var(--mfct-gold)' }} />
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
                <span>{t('home.headquartered', 'Headquartered in Bareilly, Uttar Pradesh')}</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-[3.4rem] font-black tracking-tight leading-[1.1]" style={{ color: 'var(--mfct-dark-green)', fontFamily: 'Playfair Display, Noto Sans Devanagari, serif' }}>
                {t('home.hero_line1', 'Together For A')}{' '}
                <span className="relative inline-block">
                  <span className="relative z-10" style={{ color: 'var(--mfct-gold)' }}>
                    {t('home.hero_line2_giving', 'Better Tomorrow')}
                  </span>
                  <span className="absolute bottom-1 left-0 w-full h-2.5 rounded-full" style={{ zIndex: 0, background: 'rgba(200,168,75,0.15)' }} />
                </span>
              </h1>

              {/* Sub-description */}
              <p className="text-base sm:text-lg leading-relaxed font-normal max-w-lg" style={{ color: 'var(--mfct-text-muted)' }}>
                {t('home.hero_desc', 'MFCT का संकल्प – समाज सेवा, मानवता और एकता के लिए हम हमेशा आपके साथ हैं।')}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: ShieldCheck, label: t('home.trust_zakat', 'Zakat Compliant') },
                  { icon: CheckCircle2, label: t('home.trust_verified', 'UTR Verified Receipts') },
                  { icon: Building2, label: t('home.trust_registered', 'Govt. Registered NGO') },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(200,168,75,0.10)', border: '1px solid rgba(200,168,75,0.25)', color: 'var(--mfct-dark-green)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenRegister}
                  className="mfct-btn-outline group py-3.5 px-6 rounded-xl font-extrabold text-sm hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('home.become_member', 'Become a Member')}
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'rgba(200,168,75,0.2)' }}>₹100</span>
                </button>

                <button
                  onClick={() => onDonate()}
                  className="mfct-btn-gold group py-3.5 px-6 rounded-xl font-extrabold text-sm hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  {t('home.donate_now', 'Donate Now')}
                </button>

                {onOpenZakatCalc && (
                  <button
                    onClick={onOpenZakatCalc}
                    className="mfct-btn-dark group py-3.5 px-5 rounded-xl font-black text-sm hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Calculator className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                    {t('home.zakat_calc', 'Zakat Calculator')}
                  </button>
                )}

              </div>

              {/* Live Stats */}
              <div className="pt-4" style={{ borderTop: '1px solid rgba(200,168,75,0.2)' }}>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-xl p-2.5 sm:p-4 flex flex-col justify-center overflow-hidden transition-all" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}>
                    {loading ? (
                      <div className="h-6 sm:h-8 w-12 sm:w-16 rounded animate-pulse mb-1 skeleton-mfct" />
                    ) : (
                      <span className="text-base sm:text-2xl lg:text-3xl font-black block tabular-nums leading-tight truncate" style={{ color: 'var(--mfct-dark-green)' }}>
                        {totalMembers > 0 ? totalMembers.toLocaleString('en-IN') : '0'}+
                      </span>
                    )}
                    <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 block leading-tight truncate" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.verified_members', 'Verified Members')}</span>
                  </div>

                  <div className="rounded-xl p-2.5 sm:p-4 flex flex-col justify-center overflow-hidden transition-all" style={{ background: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-mid-green)' }}>
                    {loading ? (
                      <div className="h-6 sm:h-8 w-16 sm:w-20 rounded animate-pulse mb-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    ) : (
                      <span className="text-[11px] xs:text-xs sm:text-lg lg:text-2xl font-black text-white block tabular-nums leading-tight tracking-tight truncate">
                        ₹{totalRaised > 0 ? totalRaised.toLocaleString('en-IN') : '0'}+
                      </span>
                    )}
                    <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 block leading-tight truncate" style={{ color: 'var(--mfct-gold)' }}>{t('home.funds_disbursed', 'Relief Disbursed')}</span>
                  </div>

                  <div className="rounded-xl p-2.5 sm:p-4 flex flex-col justify-center overflow-hidden transition-all" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}>
                    {loading ? (
                      <div className="h-6 sm:h-8 w-10 sm:w-12 rounded animate-pulse mb-1 skeleton-mfct" />
                    ) : (
                      <span className="text-base sm:text-2xl lg:text-3xl font-black block leading-tight truncate" style={{ color: 'var(--mfct-dark-green)' }}>100%</span>
                    )}
                    <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 block leading-tight truncate" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.audit_receipts', 'Audit Receipts')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-4 rounded-[2.5rem] blur-2xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.08)' }} />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl group" style={{ border: '2px solid rgba(200,168,75,0.25)' }}>
                <img
                  src="https://images.unsplash.com/photo-1644726270363-e746b37b482b?q=80&w=465&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="MFCT Food Ration Distribution Drive"
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,60,44,0.96) 0%, rgba(26,60,44,0.45) 50%, transparent 100%)' }} />

                {/* Live badge – top left */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg" style={{ background: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--mfct-dark-green)' }} />
                    {t('home.live_verified', 'Live & Verified')}
                  </span>
                </div>

                {/* QR + UPI panel – bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(26,60,44,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200,168,75,0.25)' }}>
                    {/* QR code */}
                    <div className="bg-white p-2.5 rounded-xl shadow-lg shrink-0">
                      {accountDetails?.qr_code_url ? (
                        <img src={accountDetails.qr_code_url} alt="QR Code" className="w-20 h-20 object-contain" />
                      ) : (
                        <QrCode className="w-20 h-20" style={{ color: 'var(--mfct-dark-green)' }} />
                      )}
                    </div>

                    {/* UPI details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--mfct-gold)' }}>
                        {t('home.scan_donate', 'Scan QR or Copy UPI ID to Donate')}
                      </p>
                      <p className="font-mono text-white font-bold text-lg select-all tracking-wide truncate">
                        {accountDetails?.upi_id || 'nsns@oksbi'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {['GPay', 'PhonePe', 'Paytm'].map(app => (
                          <span key={app} className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(200,168,75,0.2)', color: 'var(--mfct-gold)', border: '1px solid rgba(200,168,75,0.3)' }}>
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
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
            <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--mfct-gold)' }}>{t('home.targeted_giving', 'Targeted Giving')}</span>
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.explore_categories', 'Explore Aid Categories')}</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.category_subtitle', 'Direct aid channels reaching those who need it most')}</p>
        </div>

        {/* Category Pill Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {categoriesList.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="p-4 rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer"
                style={isSelected ? {
                  background: 'var(--mfct-dark-green)', color: '#fff', border: '2px solid var(--mfct-gold)', boxShadow: 'var(--shadow-card)'
                } : {
                  background: 'var(--mfct-white)', color: 'var(--mfct-text-dark)', border: '1px solid var(--mfct-border)'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={isSelected ? { background: 'rgba(200,168,75,0.2)', color: 'var(--mfct-gold)' } : { background: 'rgba(200,168,75,0.1)', color: 'var(--mfct-dark-green)' }}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={isSelected ? { background: 'rgba(200,168,75,0.2)', color: 'var(--mfct-gold)' } : { background: 'rgba(26,60,44,0.08)', color: 'var(--mfct-text-muted)' }}>
                    {cat.count}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs">{cat.label}</h4>
                  <p className="text-[10px] line-clamp-1 mt-0.5" style={{ color: isSelected ? 'rgba(200,168,75,0.75)' : 'var(--mfct-text-muted)' }}>{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* YOUR COMMUNITY CAMPAIGNS (LOGGED IN) */}
      {isAuthenticated && activeUser && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--mfct-gold)' }}>{t('home.your_community', 'Your Community')}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.community_campaigns_title', 'Campaigns in {{community}}').replace('{{community}}', activeUser.communityName || '')}</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.community_campaigns_desc', 'Active relief campaigns running in your local neighbourhood.')}</p>
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
              <div className="col-span-full text-center py-10 rounded-2xl" style={{ color: 'var(--mfct-text-muted)', background: 'var(--mfct-warm-bg-2)', border: '1px solid var(--mfct-border)' }}>
                {t('home.no_campaigns', 'No active campaigns found in this category.')}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ZAKAT CALCULATOR HIGHLIGHT BANNER */}
      {onOpenZakatCalc && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, var(--mfct-mid-green) 100%)', border: '1px solid rgba(200,168,75,0.3)' }}>
            <div className="relative z-10 space-y-2 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-[11px] uppercase tracking-wider" style={{ background: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)' }}>
                <Sparkles className="w-3.5 h-3.5" /> 100% Shariah Compliant Calculator
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {t('home.zakat_modal_title', 'Calculate Your Zakat (2.5%)')}
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: 'rgba(200,168,75,0.8)' }}>
                {t('home.faq2_a', 'Enter gold, silver, savings and investments to instantly know your Zakat due and donate directly.')}
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={onOpenZakatCalc}
                className="mfct-btn-gold py-3.5 px-6 rounded-2xl font-black text-sm flex items-center gap-2 group cursor-pointer"
              >
                <Calculator className="w-5 h-5" />
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
            <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--mfct-gold)' }}>{t('home.how_tag', 'On-site Verified Causes')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.featured_title', 'Featured Active Campaigns')}</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.featured_desc', 'High-impact relief campaigns verified at the grassroots level')}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['All', 'Urgent', 'Zakat', 'Medical', 'Education', 'Food', 'Marriage', 'Janazah'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={selectedCategory === cat ? {
                  background: 'var(--mfct-dark-green)', color: '#fff', border: '1px solid var(--mfct-mid-green)'
                } : {
                  background: 'var(--mfct-white)', color: 'var(--mfct-text-muted)', border: '1px solid var(--mfct-border)'
                }}
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
            <div className="col-span-full text-center py-10 rounded-2xl" style={{ color: 'var(--mfct-text-muted)', background: 'var(--mfct-warm-bg-2)', border: '1px solid var(--mfct-border)' }}>
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
              className="mfct-btn-dark py-3 px-6 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
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
      <section className="py-12 rounded-2xl max-w-7xl mx-auto px-6 sm:px-12" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}>
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-gold)' }}>{t('home.how_tag', 'Simple & Trustworthy')}</span>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.how_title', 'How Does It Work?')}</h2>
          <p className="text-xs" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.how_desc', 'A simple 4-step model for transparent and direct aid')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[{
            step: 1, title: t('home.step1_title', '1. Grassroots Identification'), desc: t('home.step1_desc', 'Mohalla elders and field volunteers personally verify every case.')
          }, {
            step: 2, title: t('home.step2_title', '2. Direct Bank & Hospital Payments'), desc: t('home.step2_desc', 'Funds go directly to hospitals, vendors, or beneficiaries.')
          }, {
            step: 3, title: t('home.step3_title', '3. 100% Audit & Receipts'), desc: t('home.step3_desc', "Every transaction's bill and audit report is publicly available.")
          }, {
            step: 4, title: t('home.step4_title', '4. Video & Photo Updates'), desc: t('home.step4_desc', 'Proof is shared with donors immediately after relief is delivered.')
          }].map(({ step, title, desc }) => (
            <div key={step} className="p-5 rounded-xl text-center space-y-2" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
              <div className="w-10 h-10 rounded-xl font-extrabold flex items-center justify-center text-base mx-auto" style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '2px solid rgba(200,168,75,0.3)' }}>
                {step}
              </div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--mfct-dark-green)' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--mfct-text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>



      {/* 9. LIFE IMPACT & MEMBERS JOINED COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Life Impact Counter Card */}
          <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between space-y-6" style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, var(--mfct-mid-green) 100%)', border: '1px solid rgba(200,168,75,0.2)' }}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(200,168,75,0.7)' }}>{t('home.impact_counter_tag', 'Impact')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(200,168,75,0.2)', color: 'var(--mfct-gold)' }}>{t('home.impact_realtime', 'Live')}</span>
              </div>
              <p className="text-4xl font-extrabold" style={{ color: 'var(--mfct-gold)' }}>{testimonials.length}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(200,168,75,0.7)' }}>{t('home.impact_counter_desc', 'Lives changed and successful relief stories')}</p>
            </div>

            {/* <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 text-xs">
              <div>
                <span className="text-emerald-200 text-[10px]">Families Helped</span>
                <p className="font-bold text-lg">1,420</p>
              </div>
              <div>
                <span className="text-emerald-200 text-[10px]">Avg Giving Streak</span>
                <p className="font-bold text-lg">12 Months</p>
              </div>
            </div> */}
          </div>

          <div className="rounded-2xl p-6 flex flex-col justify-between space-y-4" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.members_counter_tag', 'Network')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(200,168,75,0.1)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.2)' }}>{t('home.today_badge', 'Active')} +14</span>
              </div>
              {loading ? (
                <div className="h-10 w-24 rounded animate-pulse mt-1 skeleton-mfct"></div>
              ) : (
                <p className="text-4xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>{totalMembers > 0 ? totalMembers.toLocaleString('en-IN') : '0'}</p>
              )}
              <p className="text-xs mt-1" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.members_counter_desc', 'Registered volunteers and donor members')}</p>
            </div>

            {/* <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              {communities.slice(0, 3).map(c => (
                <div key={c.id} className="flex justify-between items-center text-slate-600">
                  <span>{c.city} Chapter</span>
                  <span className="font-bold text-slate-900">{c.totalMembers.toLocaleString('en-IN')} members</span>
                </div>
              ))}
              {communities.length === 0 && (
                <>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Delhi Chapter</span>
                    <span className="font-bold text-slate-900">1,240 members</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Hyderabad Old City</span>
                    <span className="font-bold text-slate-900">2,150 members</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Mumbai Kurla</span>
                    <span className="font-bold text-slate-900">1,780 members</span>
                  </div>
                </>
              )}
            </div> */}
          </div>

          {/* Communities Joined Card */}
          <div className="rounded-2xl p-6 flex flex-col justify-between space-y-4" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.communities_tag', 'Mohalla Hub')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(26,60,44,0.08)', color: 'var(--mfct-dark-green)' }}>
                  {loading ? '...' : (communities.length > 0 ? communities.length : '0')} {t('home.active_hubs', 'Active Hubs')}
                </span>
              </div>
              {loading ? (
                <div className="h-10 w-24 rounded animate-pulse mt-1 skeleton-mfct"></div>
              ) : (
                <p className="text-4xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>{avgHealth}%</p>
              )}
              <p className="text-xs mt-1" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.communities_desc', 'Average community health and verification score')}</p>
            </div>

            <button
              onClick={() => onNavigatePage('communities')}
              className="mfct-btn-dark w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} /> {t('home.explore_communities', 'Explore Community Network')}
            </button>
          </div>
        </div>
      </section>

      {/* 10. RECENT DONATIONS LIVE FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--mfct-gold)' }}></div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.donations_feed_title', 'Recent Donations')}</h3>
            </div>
            <span className="text-xs" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.donations_feed_subtitle', 'Transparent Live Feed')}</span>
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
      <section className="text-white py-12 rounded-2xl max-w-7xl mx-auto px-6 sm:px-12" style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, var(--mfct-mid-green) 100%)' }}>
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-gold)' }}>{t('home.testimonials_tag', 'Stories')}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('home.testimonials_title', 'Grassroots Impact Stories')}</h2>
          <p className="text-xs" style={{ color: 'rgba(200,168,75,0.7)' }}>{t('home.testimonials_desc', 'Experiences of beneficiaries and field volunteers')}</p>
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
              className="mfct-btn-gold py-3 px-6 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {t('home.view_all_stories', 'View All Stories')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>



      {/* 15. FAQ ACCORDION (2-COLUMN CONTACT-STYLE LAYOUT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-gold)' }}>{t('home.faq_tag', 'Frequently Asked Questions')}</span>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.faq_title', 'FAQ')}</h2>
          <p className="text-xs" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.faq_desc', 'Everything you need to know about MFCT, donations, and 100% transparency.')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: FAQ Accordion */}
          <div className="lg:col-span-7 space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl transition-all cursor-pointer"
                style={{ background: 'var(--mfct-white)', border: activeFaq === idx ? '1.5px solid var(--mfct-gold)' : '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2.5" style={{ color: 'var(--mfct-dark-green)' }}>
                    <HelpCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} /> {faq.q}
                  </h3>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} style={{ color: 'var(--mfct-gold)' }} />
                </div>
                {activeFaq === idx && (
                  <p className="mt-2.5 text-xs leading-relaxed pt-2.5" style={{ color: 'var(--mfct-text-muted)', borderTop: '1px solid var(--mfct-border)' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Right: Featured Image & Trust Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div
              className="relative rounded-2xl overflow-hidden shadow-lg border flex-1 flex flex-col justify-between p-6 min-h-[340px]"
              style={{
                background: 'linear-gradient(135deg, rgba(14,43,26,0.92) 0%, rgba(20,59,36,0.85) 100%)',
                borderColor: 'rgba(200,168,75,0.3)'
              }}
            >
              {/* Background Image */}
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80"
                alt="Community Support and Charity"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-35"
              />

              {/* Top badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                  style={{
                    background: 'rgba(200,168,75,0.2)',
                    color: 'var(--mfct-gold)',
                    border: '1px solid var(--mfct-gold)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> {t('home.verified_trust', '100% Verified Impact')}
                </span>
                <span className="text-[11px] font-semibold text-white/70">
                  MFCT Care
                </span>
              </div>

              {/* Center Content */}
              <div className="relative z-10 my-4 space-y-2">
                <h3 className="text-xl font-extrabold text-white leading-snug" style={{ fontFamily: 'serif' }}>
                  {t('home.faq_card_title', 'Transparent & Direct Giving')}
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  {t('home.faq_card_desc', 'Every donation is tracked with UTR verification and delivered directly to the needy without middle-agent commission.')}
                </p>
              </div>

              {/* Bottom Trust Highlights */}
              <div className="relative z-10 grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/25 backdrop-blur-sm border border-white/10">
                  <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <span className="text-[11px] font-bold text-white leading-tight">Shariah Compliant</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/25 backdrop-blur-sm border border-white/10">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <span className="text-[11px] font-bold text-white leading-tight">Direct Transfer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 17. CONTACT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-gold)' }}>{t('home.contact_tag', 'Contact')}</span>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.contact_title', 'Need Help or Have a Question?')}</h2>
          <p className="text-xs" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.contact_desc', 'Our team is available 24/7 to assist you')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 rounded-2xl space-y-4" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.send_message', 'Send Message')}</h3>

            {contactSubmitted ? (
              <div className="p-4 rounded-xl text-center space-y-1 text-xs" style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.25)' }}>
                <CheckCircle2 className="w-8 h-8 mx-auto" style={{ color: 'var(--mfct-gold)' }} />
                <p className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.msg_received', 'Your message has been received!')}</p>
                <p style={{ color: 'var(--mfct-text-muted)' }}>{t('home.msg_received_desc', 'Our team will contact you soon.')}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.your_name', 'Your Name')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('home.name_placeholder', 'Enter your full name')}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-2.5 rounded-lg text-xs outline-none"
                      style={{ border: '1px solid var(--mfct-border)', background: 'var(--mfct-warm-bg)' }}
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.phone_number', 'Phone Number')}</label>
                    <input
                      type="number"
                      required
                      placeholder={t('home.phone_placeholder', '10-digit mobile number')}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg text-xs outline-none"
                      style={{ border: '1px solid var(--mfct-border)', background: 'var(--mfct-warm-bg)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--mfct-dark-green)' }}>{t('home.help_label', 'Your Need / Message')}</label>
                  <textarea
                    rows={3}
                    required
                    placeholder={t('home.help_placeholder', 'Describe in detail how we can help you...')}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs outline-none"
                    style={{ border: '1px solid var(--mfct-border)', background: 'var(--mfct-warm-bg)' }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="mfct-btn-gold w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> {t('home.send_request', 'Send Message')}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl space-y-4 shadow-md" style={{ background: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.2)' }}>
              <h4 className="font-bold text-sm text-white">{t('home.emergency_desks', 'Emergency Helpline')}</h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <div>
                    <span className="text-[10px] block uppercase" style={{ color: 'rgba(200,168,75,0.6)' }}>{t('home.helpline_247', '24/7 Emergency Support')}</span>
                    <span className="font-bold text-white text-xs">+91 82180 17226</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)' }}>
                  <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <div>
                    <span className="text-[10px] block uppercase" style={{ color: 'rgba(200,168,75,0.6)' }}>{t('home.helpline_247', '24/7 Emergency Support')}</span>
                    <span className="font-bold text-white text-xs">+91 97569 19430</span>
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
