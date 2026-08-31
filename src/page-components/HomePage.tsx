'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  UserCheck,
  FileCheck,
  Video,
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
  Calculator,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Copy,
  HeartHandshake,
  GraduationCap,
  Headphones,
  Clock,
  User,
  Quote,
  HandHeart,
  Scale,
} from 'lucide-react';
import { FaHandsHoldingChild, FaHandHoldingHeart, FaPeopleGroup } from 'react-icons/fa6';
import { TbShieldCheck } from 'react-icons/tb';
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

  // ─── Hero Carousel Background Images ─────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyUpi = () => {
    const upi = accountDetails?.upi_id || 'nsns@oksbi';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const heroImages = [
    '/hero-slide-1.webp',
    '/hero-slide-2.webp',
    '/hero-slide-3.webp',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

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

  const myCommunityCampaigns = isAuthenticated && (activeUser?.communityId || activeUser?.communityName)
    ? campaigns.filter(c =>
      (activeUser.communityId && c.communityId === activeUser.communityId) ||
      (activeUser.communityName && c.communityName && c.communityName.trim().toLowerCase() === activeUser.communityName.trim().toLowerCase())
    )
    : [];

  const translatedUserCommunity = useDynamicTranslatedText(activeUser?.communityName, language);


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
      {/* 1. HERO CAROUSEL SECTION */}
      <section className="relative w-full overflow-hidden bg-[#0a1c14] min-h-[500px] lg:min-h-[calc(100vh-175px)] flex items-center">
        {/* Background Slide Images with Cross-Fade */}
        {heroImages.map((imgSrc, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            <img
              src={imgSrc}
              alt={`Hero Background ${idx + 1}`}
              className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out ${idx === currentSlide ? 'scale-105' : 'scale-100'
                }`}
            />
          </div>
        ))}

        {/* Cinematic Gradient Overlays */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(8,24,16,0.96) 0%, rgba(8,24,16,0.90) 45%, rgba(8,24,16,0.52) 75%, rgba(8,24,16,0.20) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(8,24,16,0.85) 0%, transparent 35%)',
          }}
        />

        {/* Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 w-full">
          <div className="max-w-3xl space-y-3.5 sm:space-y-4">

            {/* Tagline / Pre-heading badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest" style={{ background: 'rgba(26,60,44,0.9)', border: '1px solid rgba(200,168,75,0.4)', color: 'var(--mfct-gold)' }}>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
              <span>{t('home.hero_tagline', 'Together for a Better Tomorrow')}</span>
            </div>

            {/* Headline */}
            <h1
              className="text-3xl sm:text-4xl lg:text-[2.85rem] xl:text-[3.25rem] font-black text-white tracking-tight leading-[1.12]"
            >
              {t('home.hero_line1', 'Yaad Unki,')}{' '}
              <span className="block sm:inline" style={{ color: 'var(--mfct-gold)' }}>
                {t('home.hero_line2_giving', 'Seva Hamari')}
              </span>
            </h1>

            {/* Sub-description */}
            <p className="text-sm sm:text-[15px] lg:text-base leading-snug sm:leading-relaxed font-normal text-white/90 max-w-xl">
              {t('home.hero_desc', 'MFCT का संकल्प – समाज सेवा, मानवता और एकता के लिए हम हमेशा आपके साथ हैं।')}
            </p>

            {/* Trust Badges (Original) */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: t('home.trust_zakat', 'Zakat Compliant') },
                { icon: CheckCircle2, label: t('home.trust_verified', 'UTR Verified Receipts') },
                { icon: Building2, label: t('home.trust_registered', 'Govt. Registered NGO') },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold"
                  style={{
                    background: 'rgba(200,168,75,0.15)',
                    border: '1px solid rgba(200,168,75,0.35)',
                    color: '#ffffff',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
                  {label}
                </span>
              ))}
            </div>

            {/* CTA Buttons (Exact Original Buttons) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={onOpenRegister}
                className="mfct-btn-outline group py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl font-extrabold text-xs sm:text-sm hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer transition-all shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                {t('home.become_member', 'Become a Member')}
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'rgba(200,168,75,0.2)' }}>₹100</span>
              </button>

              <button
                onClick={() => onDonate()}
                className="mfct-btn-gold group py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl font-extrabold text-xs sm:text-sm hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer transition-all shadow-lg"
              >
                <Heart className="w-4 h-4 fill-current" />
                {t('home.donate_now', 'Donate Now')}
              </button>

              {onOpenZakatCalc && (
                <button
                  onClick={onOpenZakatCalc}
                  className="mfct-btn-dark group py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl font-black text-xs sm:text-sm hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer transition-all shadow-lg"
                >
                  <Calculator className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                  {t('home.zakat_calc', 'Zakat Calculator')}
                </button>
              )}
            </div>

            {/* Live Stats (3 Original Cards) */}
            <div className="pt-1.5">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg">
                <div
                  className="rounded-xl p-2.5 sm:p-3 flex flex-col justify-center overflow-hidden transition-all shadow-lg"
                  style={{ background: '#ffffff', border: '1px solid rgba(200,168,75,0.3)' }}
                >
                  {loading ? (
                    <div className="h-5 sm:h-7 w-12 sm:w-16 rounded animate-pulse mb-0.5 skeleton-mfct" />
                  ) : (
                    <span className="text-sm sm:text-xl lg:text-2xl font-black block tabular-nums leading-tight truncate" style={{ color: 'var(--mfct-dark-green)' }}>
                      {totalMembers > 0 ? totalMembers.toLocaleString('en-IN') : '0'}+
                    </span>
                  )}
                  <span className="text-[9.5px] sm:text-[10.5px] font-semibold mt-0.5 block leading-tight truncate" style={{ color: 'var(--mfct-text-muted)' }}>
                    {t('home.verified_members', 'Verified Members')}
                  </span>
                </div>

                <div
                  className="rounded-xl p-2.5 sm:p-3 flex flex-col justify-center overflow-hidden transition-all shadow-lg"
                  style={{ background: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-mid-green)' }}
                >
                  {loading ? (
                    <div className="h-5 sm:h-7 w-16 sm:w-20 rounded animate-pulse mb-0.5" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  ) : (
                    <span className="text-[10px] xs:text-xs sm:text-base lg:text-xl font-black text-white block tabular-nums leading-tight tracking-tight truncate">
                      ₹{totalRaised > 0 ? totalRaised.toLocaleString('en-IN') : '0'}+
                    </span>
                  )}
                  <span className="text-[9.5px] sm:text-[10.5px] font-semibold mt-0.5 block leading-tight truncate" style={{ color: 'var(--mfct-gold)' }}>
                    {t('home.funds_disbursed', 'Relief Disbursed')}
                  </span>
                </div>

                <div
                  className="rounded-xl p-2.5 sm:p-3 flex flex-col justify-center overflow-hidden transition-all shadow-lg"
                  style={{ background: '#ffffff', border: '1px solid rgba(200,168,75,0.3)' }}
                >
                  {loading ? (
                    <div className="h-5 sm:h-7 w-10 sm:w-12 rounded animate-pulse mb-0.5 skeleton-mfct" />
                  ) : (
                    <span className="text-sm sm:text-xl lg:text-2xl font-black block leading-tight truncate" style={{ color: 'var(--mfct-dark-green)' }}>
                      100%
                    </span>
                  )}
                  <span className="text-[9.5px] sm:text-[10.5px] font-semibold mt-0.5 block leading-tight truncate" style={{ color: 'var(--mfct-text-muted)' }}>
                    {t('home.audit_receipts', 'Audit Receipts')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Right Side Bottom Corner: Compact QR Widget (Click to Enlarge) ── */}
        <div className="absolute bottom-4 sm:bottom-5 right-4 sm:right-6 lg:right-8 z-30 hidden sm:block">
          <div
            onClick={() => setIsQrModalOpen(true)}
            className="group relative cursor-pointer rounded-2xl p-2 sm:p-2.5 max-w-[155px] sm:max-w-[170px] w-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-amber-500/20 active:scale-95"
            style={{
              background: 'rgba(10, 28, 20, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(200,168,75,0.45)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            }}
            title="Click to Enlarge QR Code"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow" style={{ background: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)' }}>
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--mfct-dark-green)' }} />
                Live & Verified
              </span>
              <div className="p-0.5 rounded bg-white/10 text-white/70 group-hover:text-amber-300 group-hover:bg-white/20 transition-all">
                <Maximize2 className="w-3 h-3" />
              </div>
            </div>

            {/* QR Thumbnail */}
            <div className="bg-white p-1 rounded-lg shadow-md flex justify-center items-center relative overflow-hidden group-hover:ring-2 ring-amber-400 transition-all">
              {accountDetails?.qr_code_url ? (
                <img src={accountDetails.qr_code_url} alt="QR Code" className="w-14 h-14 sm:w-16 sm:h-16 object-contain transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <QrCode className="w-14 h-14 sm:w-16 sm:h-16" style={{ color: 'var(--mfct-dark-green)' }} />
              )}
              {/* Tap to zoom hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white bg-black/80 backdrop-blur-sm">
                  Tap to Zoom
                </span>
              </div>
            </div>

            {/* Footer text */}
            <div className="text-center mt-1 space-y-0.5">
              <p className="text-[8px] uppercase tracking-wider font-bold truncate" style={{ color: 'var(--mfct-gold)' }}>
                {t('home.scan_donate', 'UPI Direct Donate')}
              </p>
              <p className="font-mono text-white font-bold text-[9px] select-all tracking-wide truncate">
                {accountDetails?.upi_id || 'nsns@oksbi'}
              </p>
            </div>
          </div>
        </div>

        {/* Carousel Bottom Dots */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-0 right-0 z-30 flex items-center justify-center gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${currentSlide === i
                ? 'w-6 h-2 bg-amber-400 shadow-lg shadow-amber-400/50'
                : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
              title={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── Enlarged QR Code Modal (Mounted via Portal to sit above all page elements) ── */}
      {isQrModalOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
          style={{ zIndex: 99999 }}
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl p-5 sm:p-6 text-center space-y-3.5 shadow-2xl transition-all my-auto max-h-[90vh] overflow-y-auto animate-scale-up"
            style={{
              background: '#0a1c14',
              border: '2px solid rgba(200,168,75,0.6)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(200,168,75,0.18)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-10"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 pr-6 pl-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow" style={{ background: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--mfct-dark-green)' }} />
                Live & Verified Account
              </span>
              <h3 className="text-xl font-black text-white pt-1">
                Scan to Donate
              </h3>
              <p className="text-[11px] text-white/70">
                Direct bank transfer via any UPI app with 100% audit transparency
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-3 rounded-2xl shadow-xl mx-auto w-fit max-w-full">
              {accountDetails?.qr_code_url ? (
                <img
                  src={accountDetails.qr_code_url}
                  alt="Enlarged QR Code"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain mx-auto"
                />
              ) : (
                <QrCode className="w-44 h-44 sm:w-48 sm:h-48" style={{ color: 'var(--mfct-dark-green)' }} />
              )}
            </div>

            {/* UPI ID Box with 1-Click Copy */}
            <div className="rounded-xl p-3 flex items-center justify-between gap-2 text-left" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(200,168,75,0.35)' }}>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--mfct-gold)' }}>
                  Official UPI ID
                </p>
                <p className="font-mono text-white font-bold text-xs sm:text-sm select-all truncate">
                  {accountDetails?.upi_id || 'nsns@oksbi'}
                </p>
              </div>

              <button
                onClick={handleCopyUpi}
                className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow"
                style={{
                  background: copiedUpi ? '#10b981' : 'var(--mfct-gold)',
                  color: copiedUpi ? '#ffffff' : 'var(--mfct-dark-green)',
                }}
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Accepted Apps */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
              {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay'].map((app) => (
                <span
                  key={app}
                  className="px-2 py-0.5 rounded text-[9px] font-bold"
                  style={{
                    background: 'rgba(200,168,75,0.15)',
                    color: 'var(--mfct-gold)',
                    border: '1px solid rgba(200,168,75,0.3)',
                  }}
                >
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. OUR MISSION SECTION (हमारा उद्देश्य) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span
            className="text-xs sm:text-sm font-black uppercase tracking-widest block"
            style={{ color: 'var(--mfct-gold-dark)' }}
          >
            {language === 'hi' ? 'हमारा मिशन' : language === 'ur' ? 'ہمارا مشن' : 'OUR MISSION'}
          </span>
          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{
              color: 'var(--mfct-dark-green)',
            }}
          >
            {language === 'hi' ? 'हमारा उद्देश्य' : language === 'ur' ? 'ہمارا مقصد' : 'Our Mission'}
          </h2>
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="w-8 h-0.5 rounded-full" style={{ background: 'var(--mfct-gold)' }} />
            <Heart className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--mfct-gold)' }} />
            <span className="w-8 h-0.5 rounded-full" style={{ background: 'var(--mfct-gold)' }} />
          </div>
          <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: 'var(--mfct-text-muted)' }}>
            {language === 'hi'
              ? 'समाज के हर वर्ग तक सहायता, सहयोग और सेवा पहुँचाना ही हमारा लक्ष्य है।'
              : language === 'ur'
                ? 'معاشرے کے ہر طبقے تک مدد، تعاون اور خدمت پہنچانا ہی ہمارا مقصد ہے۔'
                : 'Our goal is to deliver aid, support, and selfless service to every section of society.'}
          </p>
        </div>

        {/* 4 Mission Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: We Care Every Life */}
          <div
            className="rounded-2xl p-6 sm:p-7 text-center space-y-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group cursor-pointer"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(26,60,44,0.12)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{
                background: 'radial-gradient(circle, #1a4230 0%, #0d281a 100%)',
                border: '2px solid rgba(200,168,75,0.4)',
              }}
            >
              <FaHandsHoldingChild className="w-8 h-8 text-white" />
            </div>
            <h3
              className="text-base sm:text-[1.05rem] font-bold leading-snug"
              style={{
                color: 'var(--mfct-dark-green)',
                letterSpacing: '0.015em',
              }}
            >
              {language === 'hi' ? 'हर जीवन की परवाह' : language === 'ur' ? 'ہر زندگی کی حفاظت' : 'We Care Every Life'}
            </h3>
            <div
              className="space-y-1 text-xs sm:text-[13px] font-semibold leading-relaxed"
              style={{ color: 'var(--mfct-text-muted)', letterSpacing: '0.01em' }}
            >
              <p>{language === 'hi' ? 'आकस्मिक निधन सहायता' : language === 'ur' ? 'ہنگامی و کفالت امداد' : 'Emergency Bereavement Aid'}</p>
              <p>{language === 'hi' ? 'हर मुश्किल में हम आपके साथ' : language === 'ur' ? 'ہر مشکل में हम आपके साथ' : 'Standing by you in every crisis'}</p>
            </div>
          </div>

          {/* Card 2: We Stand Together */}
          <div
            className="rounded-2xl p-6 sm:p-7 text-center space-y-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group cursor-pointer"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(26,60,44,0.12)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{
                background: 'radial-gradient(circle, #1a4230 0%, #0d281a 100%)',
                border: '2px solid rgba(200,168,75,0.4)',
              }}
            >
              <TbShieldCheck className="w-8 h-8 text-white stroke-[2.2]" />
            </div>
            <h3
              className="text-base sm:text-[1.05rem] font-bold leading-snug"
              style={{
                color: 'var(--mfct-dark-green)',
                letterSpacing: '0.015em',
              }}
            >
              {language === 'hi' ? 'हम सब एक साथ' : language === 'ur' ? 'ہم سب ایک ساتھ' : 'We Stand Together'}
            </h3>
            <div
              className="space-y-1 text-xs sm:text-[13px] font-semibold leading-relaxed"
              style={{ color: 'var(--mfct-text-muted)', letterSpacing: '0.01em' }}
            >
              <p>{language === 'hi' ? 'सहयोग, एकता और मानवता' : language === 'ur' ? 'تعاون، اتحاد اور انسانیت' : 'Cooperation, Unity & Humanity'}</p>
              <p>{language === 'hi' ? 'के लिए समर्पित' : language === 'ur' ? 'کے لیے وقف' : 'Dedicated to All'}</p>
            </div>
          </div>

          {/* Card 3: We Serve Selflessly */}
          <div
            className="rounded-2xl p-6 sm:p-7 text-center space-y-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group cursor-pointer"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(26,60,44,0.12)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{
                background: 'radial-gradient(circle, #1a4230 0%, #0d281a 100%)',
                border: '2px solid rgba(200,168,75,0.4)',
              }}
            >
              <FaHandHoldingHeart className="w-8 h-8 text-white" />
            </div>
            <h3
              className="text-base sm:text-[1.05rem] font-bold leading-snug"
              style={{
                color: 'var(--mfct-dark-green)',
                letterSpacing: '0.015em',
              }}
            >
              {language === 'hi' ? 'निःस्वार्थ सेवा' : language === 'ur' ? 'بے لوث خدمت' : 'We Serve Selflessly'}
            </h3>
            <div
              className="space-y-1 text-xs sm:text-[13px] font-semibold leading-relaxed"
              style={{ color: 'var(--mfct-text-muted)', letterSpacing: '0.01em' }}
            >
              <p>{language === 'hi' ? 'बेटी विवाह शगुन योजना,' : language === 'ur' ? 'بیٹی شادی شگن اسکیم،' : 'Daughter Marriage Shagun Aid,'}</p>
              <p>{language === 'hi' ? 'बेटी हमारी, ज़िम्मेदारी हमारी' : language === 'ur' ? 'بیٹی ہماری، ذمہ داری ہماری' : 'Our Daughter, Our Responsibility'}</p>
            </div>
          </div>

          {/* Card 4: We Build Better Society */}
          <div
            className="rounded-2xl p-6 sm:p-7 text-center space-y-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group cursor-pointer"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(26,60,44,0.12)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{
                background: 'radial-gradient(circle, #1a4230 0%, #0d281a 100%)',
                border: '2px solid rgba(200,168,75,0.4)',
              }}
            >
              <FaPeopleGroup className="w-8 h-8 text-white" />
            </div>
            <h3
              className="text-base sm:text-[1.05rem] font-bold leading-snug"
              style={{
                color: 'var(--mfct-dark-green)',
                letterSpacing: '0.015em',
              }}
            >
              {language === 'hi' ? 'सशक्त समाज निर्माण' : language === 'ur' ? 'بہتر معاشرے کی تعمیر' : 'We Build Better Society'}
            </h3>
            <div
              className="space-y-1 text-xs sm:text-[13px] font-semibold leading-relaxed"
              style={{ color: 'var(--mfct-text-muted)', letterSpacing: '0.01em' }}
            >
              <p>{language === 'hi' ? 'शिक्षा, स्वास्थ्य, चिकित्सा सहायता' : language === 'ur' ? 'تعلیم، صحت، طبی امداد' : 'Education, Health & Medical Aid'}</p>
              <p>{language === 'hi' ? 'और सामाजिक उत्थान' : language === 'ur' ? 'اور سماجی ترقی' : 'and Social Upliftment'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 ABOUT MFCT BANNER SECTION (Document 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className="rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #091f15 0%, #0e2a1d 50%, #06160e 100%)',
            border: '1.5px solid rgba(200,168,75,0.4)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200,168,75,0.2)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Side: Unity Hands Image */}
            <div className="lg:col-span-5">
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer aspect-[4/3] max-h-[340px]"
                style={{ border: '2px solid rgba(200,168,75,0.45)' }}
                onClick={() => onNavigatePage('about')}
              >
                <img
                  src="/about-mfct-indian-hands.jpg"
                  alt="Mohammad Faeem Charitable Trust (MFCT)"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right Side: Header, Story Description, Impact Stats & CTA */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">

              {/* Preheading */}
              <div className="space-y-1">
                <span
                  className="text-xs sm:text-sm font-black uppercase tracking-widest block"
                  style={{ color: 'var(--mfct-gold)' }}
                >
                  {language === 'hi' ? 'MFCT के बारे में' : language === 'ur' ? 'ایم ایف سی ٹی کے بارے में' : 'ABOUT MFCT'}
                </span>

                {/* Headline */}
                <h2
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                >
                  {language === 'hi'
                    ? 'मोहम्मद फहीम चैरिटेबल ट्रस्ट (MFCT)'
                    : language === 'ur'
                      ? 'محمد فہیم چیریٹیبل ٹرسٹ (MFCT)'
                      : 'Mohammad Faeem Charitable Trust (MFCT)'}
                </h2>

                {/* Gold Heart Arrow Divider */}
                <div className="flex items-center gap-2 pt-1 pb-1">
                  <span className="w-12 h-0.5" style={{ background: 'var(--mfct-gold)' }} />
                  <Heart className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--mfct-gold)' }} />
                  <span className="flex-1 max-w-[120px] h-0.5" style={{ background: 'linear-gradient(to right, var(--mfct-gold), transparent)' }} />
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
                </div>
              </div>

              {/* Description paragraph (Multilingual: Hindi / English / Urdu) */}
              <p
                className="text-xs sm:text-sm leading-relaxed text-white/90 font-normal"
              >
                {language === 'hi'
                  ? 'MFCT की स्थापना समाज में भाईचारा, एकता और इंसानियत को मजबूत करने के लिए की गई है। हमारा विश्वास है कि सेवा और सहयोग से ही एक बेहतर और सशक्त समाज का निर्माण किया जा सकता है। हम शिक्षा, स्वास्थ्य, आकस्मिक सहायता, बेटी विवाह शगुन योजना, चिकित्सा सहायता, आपदा राहत और अन्य सामाजिक कार्यों के माध्यम से समाज के हर वर्ग तक सहायता पहुँचाने के लिए प्रतिबद्ध हैं।'
                  : language === 'ur'
                    ? 'ایم ایف سی ٹی کا قیام معاشرے میں بھائی چارے، اتحاد اور انسانیت کو فروغ دینے کے لیے کیا گیا ہے۔ ہمارا پختہ یقین ہے کہ بے لوث خدمت اور باہمی تعاون سے ہی ایک بہتر اور باوقار معاشرہ تشکیل پاتا ہے۔ ہم تعلیم، صحت، ہنگامی کفالت، بیٹی شادی امداد اور سماجی فلاح کے ذریعے ہر طبقے کی خدمت کے لیے پرعزم ہیں۔'
                    : 'MFCT was established to strengthen brotherhood, unity, and humanity across society. We firmly believe that selfless service and collective cooperation build a stronger, more compassionate society. Through education, health, emergency bereavement aid, daughter marriage support, medical assistance, disaster relief, and welfare programs, we are dedicated to reaching every section of society.'}
              </p>

              {/* 4 Impact Stat Badges */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl"
                style={{
                  background: 'rgba(0, 0, 0, 0.28)',
                  border: '1px solid rgba(200, 168, 75, 0.3)',
                }}
              >
                {/* Stat 1 */}
                <div className="flex items-center gap-2.5 p-1.5">
                  <FaPeopleGroup className="w-7 h-7 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-black text-white leading-tight">1000+</p>
                    <p className="text-[10px] sm:text-[11px] font-semibold truncate leading-tight" style={{ color: 'var(--mfct-gold-light)' }}>
                      {language === 'hi' ? 'परिवारों की सहायता' : language === 'ur' ? 'خاندانوں کی مدد' : 'Families Assisted'}
                    </p>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-2.5 p-1.5">
                  <FaHandHoldingHeart className="w-7 h-7 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-black text-white leading-tight">500+</p>
                    <p className="text-[10px] sm:text-[11px] font-semibold truncate leading-tight" style={{ color: 'var(--mfct-gold-light)' }}>
                      {language === 'hi' ? 'बेटी विवाह सहायता' : language === 'ur' ? 'شادی شگن امداد' : 'Marriage Aid'}
                    </p>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-2.5 p-1.5">
                  <FaHandsHoldingChild className="w-7 h-7 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-black text-white leading-tight">200+</p>
                    <p className="text-[10px] sm:text-[11px] font-semibold truncate leading-tight" style={{ color: 'var(--mfct-gold-light)' }}>
                      {language === 'hi' ? 'आकस्मिक सहायता' : language === 'ur' ? 'ہنگامی امداد' : 'Emergency Aid'}
                    </p>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="flex items-center gap-2.5 p-1.5">
                  <Users className="w-7 h-7 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-black text-white leading-tight">50+</p>
                    <p className="text-[10px] sm:text-[11px] font-semibold truncate leading-tight" style={{ color: 'var(--mfct-gold-light)' }}>
                      {language === 'hi' ? 'स्थायी सहयोगी' : language === 'ur' ? 'مستقل رضاکار' : 'Key Volunteers'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Read More Button */}
              <div className="pt-1">
                <button
                  onClick={() => onNavigatePage('about')}
                  className="mfct-btn-gold px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <span>
                    {language === 'hi'
                      ? 'हमारे बारे में और जानें'
                      : language === 'ur'
                        ? 'ہمارے بارے میں مزید جانیں'
                        : 'READ MORE ABOUT US'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. OUR PROGRAMS / हमारे प्रमुख कार्यक्रम */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span
            className="text-xs font-black uppercase tracking-widest block"
            style={{ color: 'var(--mfct-gold)' }}
          >
            {language === 'hi' ? 'हमारे कार्यक्रम' : language === 'ur' ? 'ہمارے پروگرامز' : 'OUR PROGRAMS'}
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--mfct-dark-green)' }}
          >
            {language === 'hi' ? 'हमारे प्रमुख कार्यक्रम' : language === 'ur' ? 'ہمارے اہم پروگرامز' : 'Our Key Programs'}
          </h2>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="w-12 h-0.5" style={{ background: 'var(--mfct-gold)' }} />
            <Heart className="w-4 h-4 fill-current" style={{ color: 'var(--mfct-gold)' }} />
            <span className="w-12 h-0.5" style={{ background: 'var(--mfct-gold)' }} />
          </div>
        </div>

        {/* 6 Category Image Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              id: 'medical',
              label: language === 'hi' ? 'चिकित्सा सहायता' : language === 'ur' ? 'طبی امداد' : 'Medical Aid',
              desc: language === 'hi' ? 'अस्पताल व सर्जरी' : language === 'ur' ? 'ہسپتال و سرجری' : 'Hospital & Surgery',
              image: '/program-medical.jpg',
              icon: Activity,
              count: campaigns.filter(c => (c.category as string).toLowerCase() === 'medical').length,
            },
            {
              id: 'education',
              label: language === 'hi' ? 'शिक्षा एवं पुस्तकें' : language === 'ur' ? 'تعلیم اور کتب' : 'Education & Books',
              desc: language === 'hi' ? 'अनाथ व छात्र' : language === 'ur' ? 'یتیم اور طلباء' : 'Orphans & Students',
              image: '/program-education.jpg',
              icon: BookOpen,
              count: campaigns.filter(c => (c.category as string).toLowerCase() === 'education').length,
            },
            {
              id: 'marriage',
              label: language === 'hi' ? 'विवाह एवं निकाह सहायता' : language === 'ur' ? 'شادی اور نکاح امداد' : 'Marriage & Nikah Support',
              desc: language === 'hi' ? 'दहेज मुक्त निकाह' : language === 'ur' ? 'جہیز سے پاک نکاح' : 'Dowry-free Nikah',
              image: '/program-marriage.jpg',
              icon: Heart,
              count: campaigns.filter(c => (c.category as string).toLowerCase() === 'marriage').length,
            },
            {
              id: 'janazah',
              label: language === 'hi' ? 'जनाज़ा एवं क़ब्रिस्तान' : language === 'ur' ? 'جنازہ اور قبرستان' : 'Janazah & Cemetery',
              desc: language === 'hi' ? 'एम्बुलेंस व कफ़न' : language === 'ur' ? 'ایمبولینس اور کفن' : 'Ambulance & Shroud',
              image: '/program-janazah.jpg',
              icon: FaHandsHoldingChild,
              count: campaigns.filter(c => (c.category as string).toLowerCase() === 'janazah').length,
            },
            {
              id: 'food',
              label: language === 'hi' ? 'भोजन एवं राशन किट' : language === 'ur' ? 'خوراک اور راشن کٹ' : 'Food & Ration Kit',
              desc: language === 'hi' ? 'मासिक राशन किट' : language === 'ur' ? 'ماہانہ راشن کٹ' : 'Monthly Ration Kits',
              image: '/program-relief.jpg',
              icon: Flame,
              count: campaigns.filter(c => (c.category as string).toLowerCase() === 'food').length,
            },
            {
              id: 'zakat',
              label: language === 'hi' ? 'ज़कात योग्य' : language === 'ur' ? 'زکوٰۃ کے مستحق' : 'Zakat Eligible',
              desc: language === 'hi' ? '100% ज़कात पात्र' : language === 'ur' ? '100% زکوٰۃ کے مستحق' : '100% Zakat Eligible',
              image: '/program-zakat.jpg',
              icon: ShieldCheck,
              count: campaigns.filter(c => c.isZakatEligible || (c.category as string).toLowerCase() === 'zakat').length,
            },
          ].map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                className="bg-white rounded-2xl overflow-visible shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer"
                style={{
                  border: isSelected ? '2px solid var(--mfct-gold)' : '1px solid rgba(26,60,44,0.12)',
                  boxShadow: isSelected ? '0 10px 25px rgba(200,168,75,0.25)' : undefined,
                }}
              >
                {/* Photo & Overlapping Badge */}
                <div className="relative">
                  <div className="h-32 sm:h-36 overflow-hidden rounded-t-2xl relative">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />

                    {/* Category Count Badge */}
                    <span
                      className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md backdrop-blur-md"
                      style={isSelected ? {
                        background: 'var(--mfct-gold)',
                        color: '#0d281a',
                      } : {
                        background: 'rgba(255,255,255,0.92)',
                        color: '#1a4230',
                      }}
                    >
                      {cat.count}
                    </span>
                  </div>

                  {/* Overlapping Round Badge - 100% Full Unclipped Circle */}
                  <div
                    className="absolute -bottom-4.5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-20 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: 'radial-gradient(circle, #1a4230 0%, #0d281a 100%)',
                      border: '2px solid rgba(200, 168, 75, 0.85)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    <IconComp className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Bottom Content with Exact Titles */}
                <div className="pt-6 pb-4 px-3 text-center flex flex-col justify-between flex-1 space-y-1">
                  <h4
                    className="text-xs sm:text-[13px] font-bold leading-snug truncate"
                    style={{
                      color: isSelected ? 'var(--mfct-gold-darker, #1a4230)' : 'var(--mfct-dark-green)',
                    }}
                  >
                    {cat.label}
                  </h4>
                  <p
                    className="text-[10px] sm:text-[11px] leading-tight truncate"
                    style={{ color: 'var(--mfct-text-muted)' }}
                  >
                    {cat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* YOUR COMMUNITY CAMPAIGNS (LOGGED IN - ONLY SHOWN WHEN USER COMMUNITY HAS AT LEAST 1 CAMPAIGN) */}
      {isAuthenticated && activeUser && !loading && myCommunityCampaigns.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--mfct-gold)' }}>{t('home.your_community', 'Your Community')}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>
                {t('home.community_campaigns_title', 'Campaigns in {{community}}').replace('{{community}}', translatedUserCommunity || activeUser.communityName || '')}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--mfct-text-muted)' }}>{t('home.community_campaigns_desc', 'Active relief campaigns running in your local neighbourhood.')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCommunityCampaigns.slice(0, 3).map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onDonate={onDonate}
              />
            ))}
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
      <section
        className="relative py-14 sm:py-16 rounded-3xl max-w-7xl mx-auto px-5 sm:px-10 lg:px-12 overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fdfbf7 50%, #f7f1e4 100%)',
          border: '1px solid rgba(200, 168, 75, 0.28)',
          boxShadow: '0 10px 30px -5px rgba(26, 60, 44, 0.08), 0 4px 12px rgba(200, 168, 75, 0.06)',
        }}
      >
        {/* Ambient Decorative Background Glows */}
        <div
          className="absolute -top-24 left-1/4 w-80 h-80 rounded-full pointer-events-none opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--mfct-gold) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--mfct-light-green) 0%, transparent 70%)' }}
        />

        {/* Section Header */}
        <div className="relative text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-2">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-sm mb-1"
            style={{
              background: 'rgba(200, 168, 75, 0.12)',
              color: 'var(--mfct-gold-dark)',
              border: '1px solid rgba(200, 168, 75, 0.35)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold-dark)' }} />
            <span>{t('home.how_tag', 'HOW IT WORKS')}</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--mfct-dark-green)' }}
          >
            {t('home.how_title', 'How Does It Work?')}
          </h2>
          <p
            className="text-xs sm:text-sm font-medium leading-relaxed"
            style={{ color: 'var(--mfct-text-muted)' }}
          >
            {t('home.how_desc', 'A simple 4-step model for transparent and direct aid')}
          </p>
        </div>

        {/* Steps Grid with Horizontal Connection Line on Large Screens */}
        <div className="relative">
          {/* Subtle Connecting Line across steps on Desktop */}
          <div
            className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed pointer-events-none z-0"
            style={{ borderColor: 'rgba(200, 168, 75, 0.35)' }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 relative z-10">
            {[
              {
                step: 1,
                stepNum: '01',
                icon: UserCheck,
                title: t('home.step1_title', 'Grassroots Identification & Verification'),
                desc: t('home.step1_desc', 'Mohalla elders and field volunteers personally verify every case.'),
                gradient: 'linear-gradient(135deg, #1a3c2c 0%, #2e5e42 100%)',
                accentColor: '#1a3c2c',
                stepBg: 'rgba(26, 60, 44, 0.08)',
                stepText: '#1a3c2c',
              },
              {
                step: 2,
                stepNum: '02',
                icon: Building2,
                title: t('home.step2_title', 'Direct Bank & Hospital Payments'),
                desc: t('home.step2_desc', 'Funds go directly to hospitals, vendors, or beneficiaries.'),
                gradient: 'linear-gradient(135deg, #c8a84b 0%, #a0832e 100%)',
                accentColor: '#c8a84b',
                stepBg: 'rgba(200, 168, 75, 0.16)',
                stepText: '#8a6e1a',
              },
              {
                step: 3,
                stepNum: '03',
                icon: FileCheck,
                title: t('home.step3_title', '100% Audit & Receipts'),
                desc: t('home.step3_desc', "Every transaction's bill and audit report is publicly available on the app."),
                gradient: 'linear-gradient(135deg, #2e5e42 0%, #3d7a55 100%)',
                accentColor: '#2e5e42',
                stepBg: 'rgba(46, 94, 66, 0.1)',
                stepText: '#2e5e42',
              },
              {
                step: 4,
                stepNum: '04',
                icon: Video,
                title: t('home.step4_title', 'Video & Photo Updates'),
                desc: t('home.step4_desc', 'Proof is shared with donors immediately after relief is delivered.'),
                gradient: 'linear-gradient(135deg, #1a3c2c 0%, #c8a84b 100%)',
                accentColor: '#c8a84b',
                stepBg: 'rgba(200, 168, 75, 0.16)',
                stepText: '#8a6e1a',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(200, 168, 75, 0.28)',
                  boxShadow: '0 4px 20px -2px rgba(26, 60, 44, 0.05)',
                }}
              >
                {/* Step Pill Top Badge */}
                <div className="flex items-center justify-center w-full mb-4">
                  <span
                    className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs"
                    style={{
                      background: item.stepBg,
                      color: item.stepText,
                      border: '1px solid rgba(200, 168, 75, 0.25)',
                    }}
                  >
                    STEP {item.stepNum}
                  </span>
                </div>

                {/* Glowing Icon Container */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-5 relative transform transition-all duration-300 group-hover:scale-110 shadow-lg"
                  style={{
                    background: item.gradient,
                    boxShadow: '0 8px 18px -4px rgba(26, 60, 44, 0.25)',
                  }}
                >
                  <item.icon className="w-7 h-7 stroke-[2.2]" />
                </div>

                {/* Title */}
                <h3
                  className="font-bold text-[15px] sm:text-[16px] leading-snug mb-2.5 transition-colors group-hover:text-[var(--mfct-mid-green)]"
                  style={{ color: 'var(--mfct-dark-green)' }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  className="text-xs sm:text-[13px] leading-relaxed flex-grow"
                  style={{ color: 'var(--mfct-text-muted)' }}
                >
                  {item.desc}
                </p>

                {/* Hover Accent Underline */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(90deg, transparent, var(--mfct-gold), transparent)',
                  }}
                />
              </div>
            ))}
          </div>
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
                <h3 className="text-xl font-extrabold text-white leading-snug">
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
      <section
        className="relative py-14 sm:py-16 rounded-3xl max-w-7xl mx-auto px-5 sm:px-10 lg:px-12 overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fdfbf7 50%, #f7f1e4 100%)',
          border: '1px solid rgba(200, 168, 75, 0.28)',
          boxShadow: '0 10px 30px -5px rgba(26, 60, 44, 0.08), 0 4px 12px rgba(200, 168, 75, 0.06)',
        }}
      >
        {/* Ambient Decorative Background Glows */}
        <div
          className="absolute -top-24 right-1/4 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--mfct-gold) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--mfct-light-green) 0%, transparent 70%)' }}
        />

        {/* Section Header */}
        <div className="relative text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-sm mb-1"
            style={{
              background: 'rgba(200, 168, 75, 0.12)',
              color: 'var(--mfct-gold-dark)',
              border: '1px solid rgba(200, 168, 75, 0.35)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold-dark)' }} />
            <span>{t('home.contact_tag', 'CONTACT')}</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--mfct-dark-green)' }}
          >
            {t('home.contact_title', 'Need Help or Have a Question?')}
          </h2>
          <p
            className="text-xs sm:text-sm font-medium leading-relaxed"
            style={{ color: 'var(--mfct-text-muted)' }}
          >
            {t('home.contact_desc', 'Our team is available 24/7 to assist you')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative z-10">
          {/* Left Column: Send Message Form */}
          <div
            className="lg:col-span-7 p-6 sm:p-8 rounded-3xl space-y-6 flex flex-col justify-between"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(200, 168, 75, 0.28)',
              boxShadow: '0 4px 20px -2px rgba(26, 60, 44, 0.06)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(200,168,75,0.2)]">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg" style={{ color: 'var(--mfct-dark-green)' }}>
                  {t('home.send_message', 'Send Message')}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--mfct-text-muted)' }}>
                  {t('home.form_subtitle', 'Fill out the form below and our team will get back to you promptly.')}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(200, 168, 75, 0.15)', color: 'var(--mfct-dark-green)' }}
              >
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            {contactSubmitted ? (
              <div
                className="p-8 rounded-2xl text-center space-y-3"
                style={{ background: 'rgba(200,168,75,0.08)', border: '1.5px solid rgba(200,168,75,0.3)' }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-md"
                  style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, var(--mfct-mid-green) 100%)', color: 'var(--mfct-gold)' }}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-base sm:text-lg" style={{ color: 'var(--mfct-dark-green)' }}>
                  {t('home.msg_received', 'Your message has been received!')}
                </h4>
                <p className="text-xs sm:text-sm max-w-sm mx-auto" style={{ color: 'var(--mfct-text-muted)' }}>
                  {t('home.msg_received_desc', 'Our support team will contact you shortly on your provided phone number.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--mfct-dark-green)' }}>
                      {t('home.your_name', 'Your Name')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--mfct-text-muted)]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder={t('home.name_placeholder', 'Enter your full name')}
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl text-xs sm:text-sm outline-none transition-all duration-200"
                        style={{
                          border: '1px solid var(--mfct-border)',
                          background: 'var(--mfct-warm-bg)',
                          color: 'var(--mfct-text-dark)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--mfct-gold-dark)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(200, 168, 75, 0.2)';
                          e.target.style.background = '#ffffff';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--mfct-border)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = 'var(--mfct-warm-bg)';
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--mfct-dark-green)' }}>
                      {t('home.phone_number', 'Phone Number')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--mfct-text-muted)]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder={t('home.phone_placeholder', '10-digit mobile number')}
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl text-xs sm:text-sm outline-none transition-all duration-200"
                        style={{
                          border: '1px solid var(--mfct-border)',
                          background: 'var(--mfct-warm-bg)',
                          color: 'var(--mfct-text-dark)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--mfct-gold-dark)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(200, 168, 75, 0.2)';
                          e.target.style.background = '#ffffff';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--mfct-border)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = 'var(--mfct-warm-bg)';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--mfct-dark-green)' }}>
                    {t('home.help_label', 'Your Need / Message')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      required
                      placeholder={t('home.help_placeholder', 'Describe in detail how we can help you...')}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full p-3.5 rounded-xl text-xs sm:text-sm outline-none transition-all duration-200 resize-none"
                      style={{
                        border: '1px solid var(--mfct-border)',
                        background: 'var(--mfct-warm-bg)',
                        color: 'var(--mfct-text-dark)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--mfct-gold-dark)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(200, 168, 75, 0.2)';
                        e.target.style.background = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--mfct-border)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = 'var(--mfct-warm-bg)';
                      }}
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mfct-btn-gold w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" /> {t('home.send_request', 'Send Message')}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Emergency Helpline */}
          <div
            className="lg:col-span-5 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden space-y-6"
            style={{
              background: 'linear-gradient(145deg, #10291e 0%, #1a3c2c 55%, #0d2017 100%)',
              border: '1px solid rgba(200, 168, 75, 0.35)',
            }}
          >
            {/* Top decorative ambient glow */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-2xl"
              style={{ background: 'var(--mfct-gold)' }}
            />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: 'rgba(200, 168, 75, 0.18)', border: '1px solid rgba(200, 168, 75, 0.35)' }}
                  >
                    <Headphones className="w-5 h-5" style={{ color: 'var(--mfct-gold)' }} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base sm:text-lg text-white">
                      {t('home.emergency_desks', 'Emergency Helpline')}
                    </h4>
                    <span className="text-[11px] block" style={{ color: 'rgba(200, 168, 75, 0.8)' }}>
                      {t('home.instant_assistance', 'Direct Voice Support')}
                    </span>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{ background: 'rgba(200, 168, 75, 0.2)', color: 'var(--mfct-gold)', border: '1px solid rgba(200, 168, 75, 0.3)' }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live 24/7
                </span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                {t('home.helpline_lead', 'For urgent medical cases, emergency food support, or immediate verification assistance, call our coordinators directly.')}
              </p>

              {/* Helpline Phone Cards */}
              <div className="space-y-3 pt-2">
                <a
                  href="tel:+918218017226"
                  className="group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(200, 168, 75, 0.25)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: 'rgba(200, 168, 75, 0.2)', color: 'var(--mfct-gold)' }}
                    >
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: 'rgba(200, 168, 75, 0.75)' }}>
                        {t('home.helpline_247', '24/7 Emergency Support')}
                      </span>
                      <span className="font-extrabold text-white text-sm sm:text-base tracking-wide">
                        +91 82180 17226
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-bold px-3 py-1 rounded-lg transition-colors group-hover:bg-[var(--mfct-gold)] group-hover:text-[var(--mfct-dark-green)]"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--mfct-gold-light)' }}
                  >
                    Call Now ↗
                  </span>
                </a>

                <a
                  href="tel:+919756919430"
                  className="group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: 'rgba(200, 168, 75, 0.12)',
                    border: '1px solid rgba(200, 168, 75, 0.35)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: 'rgba(200, 168, 75, 0.25)', color: 'var(--mfct-gold)' }}
                    >
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: 'rgba(200, 168, 75, 0.75)' }}>
                        {t('home.helpline_247', '24/7 Emergency Support')}
                      </span>
                      <span className="font-extrabold text-white text-sm sm:text-base tracking-wide">
                        +91 97569 19430
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-bold px-3 py-1 rounded-lg transition-colors group-hover:bg-[var(--mfct-gold)] group-hover:text-[var(--mfct-dark-green)]"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--mfct-gold-light)' }}
                  >
                    Call Now ↗
                  </span>
                </a>
              </div>
            </div>

            {/* Bottom trust footer */}
            <div
              className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-medium"
              style={{ color: 'rgba(200, 168, 75, 0.85)' }}
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Callback Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Confidential</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDERS' MESSAGE SECTION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        {/* Section Heading */}
        <div className="text-center space-y-2 mb-10">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              background: 'rgba(26, 60, 44, 0.08)',
              color: 'var(--mfct-dark-green)',
              border: '1px solid rgba(26, 60, 44, 0.15)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('about.founders_section_title', 'संस्थापकों का संदेश | Founders\u2019 Messages')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('about.founders_section_subtitle', 'Guiding thoughts and resolute principles that form the bedrock of every decision at MFCT')}
          </h2>
        </div>

        {/* Two-Column Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── LEFT: Founder & Chairman ── */}
          <div
            className="bg-white rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col"
            style={{
              borderColor: 'rgba(200, 168, 75, 0.35)',
              boxShadow: '0 10px 30px -5px rgba(26, 60, 44, 0.08)',
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3 border-b flex items-center justify-between gap-3 text-xs font-bold"
              style={{
                background: 'linear-gradient(90deg, #0f3322 0%, #1a3c2c 100%)',
                color: '#f0c868',
                borderColor: 'rgba(200, 168, 75, 0.25)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🔷</span>
                <span className="tracking-wide uppercase text-[11px]">
                  {t('about.zahid_role', 'Founder & Chairman — Founder’s Message')}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] shrink-0">
                MFCT Founder
              </span>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-7 flex flex-col gap-6 flex-1">
              {/* Top: Portrait + Name */}
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  <div
                    className="absolute -inset-1.5 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition duration-300"
                    style={{ background: 'linear-gradient(135deg, #c8a84b 0%, #1a3c2c 100%)' }}
                  />
                  <div
                    className="relative w-36 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden shadow-xl bg-slate-100"
                    style={{ border: '2.5px solid var(--mfct-gold)' }}
                  >
                    <img
                      src="/Mr Mohammad Zahid.jpeg"
                      alt="Er. Mohammad Zahid - Founder & Chairman, MFCT"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/Mr%20Mohammad%20Zahid.jpeg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-md text-white text-[10px] font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Founder & Chairman</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{t('about.zahid_title', 'Er. Mohammad Zahid')}</h3>
                  <p className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--mfct-mid-green)' }}>Founder & Chairman, MFCT</p>
                  <p className="text-[11px] text-slate-500">Mohammad Faeem Charitable Trust</p>
                </div>
              </div>

              {/* Quote */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(26, 60, 44, 0.04) 100%)',
                  borderColor: 'rgba(200, 168, 75, 0.4)',
                }}
              >
                <Quote
                  className="w-8 h-8 absolute -right-1 -bottom-1 opacity-10 pointer-events-none"
                  style={{ color: 'var(--mfct-gold-dark)' }}
                />
                <p
                  className="text-sm sm:text-[15px] font-bold leading-relaxed italic"
                  style={{ color: 'var(--mfct-dark-green)' }}
                >
                  {t(
                    'about.zahid_quote',
                    '“मेरे लिए MFCT केवल एक संस्था नहीं, बल्कि एक विचार है—एक ऐसा विचार जिसमें मुश्किल समय में कोई परिवार खुद को अकेला महसूस न करे।”'
                  )}
                </p>
              </div>

              {/* Message paragraphs */}
              <div className="space-y-3 text-sm leading-relaxed text-slate-600 flex-1">
                <p>{t('about.zahid_p1', 'मरहूम मोहम्मद फ़ईम साहब की याद को समाज की सेवा से जोड़ने की प्रेरणा से हमने MFCT की शुरुआत की। मेरा विश्वास है कि यदि समाज के लोग एक-दूसरे के साथ खड़े हों, तो छोटी-छोटी कोशिशें मिलकर किसी जरूरतमंद परिवार के लिए बहुत बड़ा सहारा बन सकती हैं।')}</p>
                <p>{t('about.zahid_p2', 'मेरा सपना है कि MFCT केवल एक शहर या जिले तक सीमित न रहे, बल्कि हर उस व्यक्ति तक पहुँचे जिसे समाज के सहयोग की आवश्यकता है।')}</p>
              </div>

              {/* Sign-off */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-extrabold text-slate-900">- {t('about.zahid_title', 'Er. Mohammad Zahid')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Founder & Chairman, MFCT</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Co-Founder & Secretary–Treasurer ── */}
          <div
            className="bg-white rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col"
            style={{
              borderColor: 'rgba(200, 168, 75, 0.35)',
              boxShadow: '0 10px 30px -5px rgba(26, 60, 44, 0.08)',
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3 border-b flex items-center justify-between gap-3 text-xs font-bold"
              style={{
                background: 'linear-gradient(90deg, #1a3c2c 0%, #2e5e42 100%)',
                color: '#f0c868',
                borderColor: 'rgba(200, 168, 75, 0.25)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🔶</span>
                <span className="tracking-wide uppercase text-[11px]">
                  {t('about.amreen_role', 'Co-Founder & Secretary–Treasurer — Founder’s Message')}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] shrink-0">
                MFCT Co-Founder
              </span>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-7 flex flex-col gap-6 flex-1">
              {/* Top: Portrait + Name */}
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  <div
                    className="absolute -inset-1.5 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition duration-300"
                    style={{ background: 'linear-gradient(135deg, #c8a84b 0%, #2e5e42 100%)' }}
                  />
                  <div
                    className="relative w-36 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden shadow-xl bg-slate-100"
                    style={{ border: '2.5px solid var(--mfct-gold)' }}
                  >
                    <img
                      src="/Mrs. Amreen.jpeg"
                      alt="Mrs. Amreen - Co-Founder & Secretary-Treasurer, MFCT"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/Mrs.%20Amreen.jpeg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-md text-white text-[10px] font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-400" />
                      <span>Co-Founder & Sec–Treasurer</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{t('about.amreen_title', 'Mrs. Amreen')}</h3>
                  <p className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--mfct-mid-green)' }}>Co-Founder & Secretary–Treasurer, MFCT</p>
                  <p className="text-[11px] text-slate-500">Mohammad Faeem Charitable Trust</p>
                </div>
              </div>

              {/* Quote */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(46, 94, 66, 0.05) 100%)',
                  borderColor: 'rgba(200, 168, 75, 0.4)',
                }}
              >
                <Quote
                  className="w-8 h-8 absolute -right-1 -bottom-1 opacity-10 pointer-events-none"
                  style={{ color: 'var(--mfct-gold-dark)' }}
                />
                <p
                  className="text-sm sm:text-[15px] font-bold leading-relaxed italic"
                  style={{ color: 'var(--mfct-dark-green)' }}
                >
                  {t(
                    'about.amreen_quote',
                    '“मेरे लिए सेवा का अर्थ केवल किसी की मदद करना नहीं, बल्कि जरूरत के समय उसके साथ खड़े होने का एहसास देना है।”'
                  )}
                </p>
              </div>

              {/* Message paragraphs */}
              <div className="space-y-3 text-sm leading-relaxed text-slate-600 flex-1">
                <p>{t('about.amreen_p1', 'MFCT से जुड़ने का मेरा उद्देश्य है कि समाज में आपसी सहयोग, संवेदना और इंसानियत की भावना को और मजबूत किया जाए।')}</p>
                <p>{t('about.amreen_p2', 'हम चाहते हैं कि MFCT ऐसा मंच बने जहाँ हर सदस्य यह महसूस करे कि वह केवल एक संस्था का हिस्सा नहीं, बल्कि एक बड़े परिवार का हिस्सा है।')}</p>
              </div>

              {/* Sign-off */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-extrabold text-slate-900">- {t('about.amreen_title', 'Mrs. Amreen')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Co-Founder & Secretary–Treasurer, MFCT</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

