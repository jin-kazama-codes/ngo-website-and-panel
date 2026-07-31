import React, { useState } from 'react';
import { Campaign } from '../types';
import { MOCK_CAMPAIGNS, MOCK_TESTIMONIALS, MOCK_STORIES, MOCK_COMMUNITIES, MOCK_DONATIONS } from '../data/mockData';
import { CampaignCard } from '../components/CampaignCard';
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
  Clock,
  ThumbsUp,
  Share2
} from 'lucide-react';

interface HomePageProps {
  onDonate: (campaign?: Campaign) => void;
  onViewCampaignDetail: (campaign: Campaign) => void;
  onOpenRegister: () => void;
  onNavigatePage: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onDonate,
  onViewCampaignDetail,
  onOpenRegister,
  onNavigatePage,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Filters
  const filteredCampaigns = MOCK_CAMPAIGNS.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' ||
      c.category === selectedCategory ||
      (selectedCategory === 'Zakat' && c.isZakatEligible);
    return matchesSearch && matchesCat;
  });

  const janazahCampaigns = MOCK_CAMPAIGNS.filter((c) => c.category === 'Janazah' || c.title.toLowerCase().includes('janazah'));
  const marriageCampaigns = MOCK_CAMPAIGNS.filter((c) => c.category === 'Marriage');

  const categoriesList = [
    { name: 'Medical', icon: Activity, count: 24, desc: 'Critical surgeries & dialysis' },
    { name: 'Education', icon: BookOpen, count: 18, desc: 'Orphan & girl child fees' },
    { name: 'Marriage', icon: Heart, count: 12, desc: 'Nikah & bridal dignity aid' },
    { name: 'Janazah', icon: Church, count: 8, desc: 'Funeral & cemetery support' },
    { name: 'Food', icon: Flame, count: 32, desc: 'Monthly ration & flood relief' },
    { name: 'Zakat', icon: ShieldCheck, count: 45, desc: '100% Zakat-compliant causes' },
    { name: 'Community', icon: Building2, count: 15, desc: 'Solar water & public utility' },
  ];

  const partnerLogos = [
    { name: 'AIIMS Delhi', type: 'Medical Audit Partner' },
    { name: 'HDFC Bank Escrow', type: 'Escrow Trustee' },
    { name: 'KPMG Audit', type: 'Third-party Auditor' },
    { name: 'Razorpay', type: 'UPI Payment Gateway' },
    { name: 'Apollo Hospitals', type: 'Healthcare Verification' },
  ];

  const faqs = [
    {
      q: 'How does the ₹50 membership fee model work?',
      a: 'When you pay a nominal ₹50 annual fee, you become a verified member of your local community. This fee builds our solidarity emergency escrow. Once verified, you can donate to any cause and also apply for community aid if you or your family ever face a genuine emergency.',
    },
    {
      q: 'Are Zakat donations strictly Zakat compliant?',
      a: 'Yes! Our platform enforces a system-level rule where Zakat funds can ONLY be transferred to Zakat-Eligible causes (such as poor orphan education, widow support, or emergency dialysis for needy patients). Zakat funds are never mixed with non-eligible causes.',
    },
    {
      q: 'How are campaigns verified before publication?',
      a: 'Every campaign undergoes a 3-tier verification: 1) On-site visit by the local Community Admin, 2) Hospital/Medical bill estimate audit by our Executive Team, and 3) Direct payment escrow into hospital or vendor accounts.',
    },
    {
      q: 'Can I donate to campaigns outside my local community?',
      a: 'Absolutely! By using the "Help Outside Community" toggle during donation, you can support verified cases anywhere across India.',
    },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) setNewsletterSubscribed(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactMsg) setContactSubmitted(true);
  };

  return (
    <div className="space-y-16 pb-12 animate-fade-in text-[#1A1A1A]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-12 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-sm">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Bareilly, Uttar Pradesh — Headquartered Community Welfare Network</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Uniting Communities Across <span className="text-emerald-700 underline decoration-emerald-300">Bareilly</span> & North India.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                Headquartered in Bareilly, Uttar Pradesh — A 100% transparent, member-driven crowdfunding ecosystem. Connecting neighborhoods across Civil Lines, Qutubkhana, Rohilkhand, and Izatnagar through nominal ₹50 annual memberships.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenRegister}
                  className="py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Become a Bareilly Member (₹50)
                </button>
                <button
                  onClick={() => onDonate()}
                  className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-200 flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-current" /> Donate Now
                </button>
                <button
                  onClick={() => onNavigatePage('campaigns')}
                  className="py-3.5 px-5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-colors"
                >
                  Bareilly & UP Causes
                </button>
              </div>

              {/* Live Impact Stats Summary */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-left">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 block">3,450+</span>
                  <span className="text-xs text-slate-500 font-medium">Bareilly Verified Members</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">₹98.5 Lakhs</span>
                  <span className="text-xs text-slate-500 font-medium">Bareilly Funds Disbursed</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 block">100%</span>
                  <span className="text-xs text-slate-500 font-medium">Audit & UTR Receipts</span>
                </div>
              </div>
            </div>

            {/* Right Column Hero Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"
                  alt="Bareilly Food Ration Distribution Drive"
                  className="w-full h-[380px] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                <div className="absolute bottom-5 left-5 right-5 text-white p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div className="flex items-center gap-2 mb-1 text-emerald-300 text-xs font-bold">
                    <Sparkles className="w-4 h-4" /> Live Bareilly On-Ground Impact
                  </div>
                  <p className="font-bold text-sm text-white">
                    300 Food Ration Kits & Warm Blankets Distributed at CB Ganj & Civil Lines, Bareilly (UP).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATISTICS COUNTER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-2 lg:grid-cols-5 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="pt-2 lg:pt-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Disbursed</span>
            <p className="text-2xl font-black text-emerald-700">₹2,38,90,000</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">100% Escrow Audited</span>
          </div>
          <div className="pt-2 lg:pt-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Active Members</span>
            <p className="text-2xl font-black text-slate-900">6,680</p>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Across 5 Indian Cities</span>
          </div>
          <div className="pt-2 lg:pt-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Active Communities</span>
            <p className="text-2xl font-black text-slate-900">5 Managed</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">Avg Health: 96%</span>
          </div>
          <div className="pt-2 lg:pt-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Zakat Compliance</span>
            <p className="text-2xl font-black text-slate-900">100%</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Strict System Rules</span>
          </div>
          <div className="col-span-2 lg:col-span-1 pt-2 lg:pt-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Fraud Risk Rate</span>
            <p className="text-2xl font-black text-emerald-700">0.00%</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Verified UTR Receipts</span>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY CAROUSEL & CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">Targeted Giving</span>
            <h2 className="text-2xl font-extrabold text-slate-900">Explore Donation Categories</h2>
          </div>
          <p className="text-xs text-slate-500">Choose a specific cause to direct your Zakat or Sadakah</p>
        </div>

        {/* Category Pill Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {categoriesList.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
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
                  <h4 className="font-bold text-xs">{cat.name}</h4>
                  <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED CAMPAIGNS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">On-site Verified Causes</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Urgent Campaigns</h2>
            <p className="text-xs text-slate-500 mt-1">100% of donations go directly to beneficiary hospital accounts.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['All', 'Zakat', 'Medical', 'Education', 'Food', 'Marriage', 'Janazah'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.slice(0, 6).map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onDonate={onDonate}
              onViewDetail={onViewCampaignDetail}
            />
          ))}
        </div>
      </section>

      {/* 5. BECOME A MEMBER (₹50) HIGHLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 inline-block">
                ₹50 Annual Solidarity Membership
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Join Your Local Community Network
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Become a verified member of your city’s local community hub. Paying the ₹50 annual membership fee builds our solidarity emergency escrow, grants you a Digital Member ID, and qualifies you for priority emergency community aid.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Digital Member ID Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Emergency Aid Eligibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Aadhaar KYC Badge</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-3">
              <button
                onClick={onOpenRegister}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Become a Member Now (₹50)
              </button>
              <span className="text-[11px] text-slate-400 text-center lg:text-right">
                Instant digital card generation upon registration
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-12 bg-white rounded-2xl border border-slate-200 max-w-7xl mx-auto px-6 sm:px-12 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Simple & Trustworthy</span>
          <h2 className="text-2xl font-extrabold text-slate-900">How MFCT Works</h2>
          <p className="text-xs text-slate-500">Four simple steps to empower local community solidarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Join Local Community</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pay ₹50 membership fee to join your local administrator's community network.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">KYC Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our Executive team verifies Aadhaar details to maintain a trusted fraud-free network.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Support or Request Aid</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Donate to verified causes inside/outside community, or request aid during emergencies.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Direct Escrow & Receipt</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Funds are disbursed directly to hospitals or vendors. Instantly download 80G tax receipt.
            </p>
          </div>
        </div>
      </section>

      {/* 7. JANAZAH CAMPAIGNS SECTION */}
      {janazahCampaigns.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold mb-1">
                <Church className="w-3 h-3 text-emerald-400" /> Janazah Funeral Emergency Services
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Janazah Support Campaigns</h2>
              <p className="text-xs text-slate-500">Providing funeral expenses, Kafan cloth, mortuary vans & grave preparation for needy families.</p>
            </div>
            <button onClick={() => onNavigatePage('campaigns')} className="text-xs font-bold text-emerald-700 hover:underline">
              View All Janazah Cases
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {janazahCampaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onDonate={onDonate}
                onViewDetail={onViewCampaignDetail}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. MARRIAGE CAMPAIGNS SECTION */}
      {marriageCampaigns.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold mb-1">
                <Heart className="w-3 h-3 text-amber-600 fill-current" /> Bridal Dignity Aid
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Marriage & Nikah Support</h2>
              <p className="text-xs text-slate-500">Supporting orphan brides and impoverished families with simple household essentials.</p>
            </div>
            <button onClick={() => onNavigatePage('campaigns')} className="text-xs font-bold text-emerald-700 hover:underline">
              View All Marriage Cases
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marriageCampaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onDonate={onDonate}
                onViewDetail={onViewCampaignDetail}
              />
            ))}
          </div>
        </section>
      )}

      {/* 9. LIFE IMPACT & MEMBERS JOINED COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Life Impact Counter Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">Life Impact Counter</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">Real-time</span>
              </div>
              <p className="text-4xl font-extrabold">8,450</p>
              <p className="text-xs text-emerald-100 mt-1">Beneficiary lives directly impacted across India</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 text-xs">
              <div>
                <span className="text-emerald-200 text-[10px]">Families Helped</span>
                <p className="font-bold text-lg">1,420</p>
              </div>
              <div>
                <span className="text-emerald-200 text-[10px]">Avg Giving Streak</span>
                <p className="font-bold text-lg">12 Months</p>
              </div>
            </div>
          </div>

          {/* Members Joined Counter Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Members Joined Counter</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">+14 Today</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-900">6,680</p>
              <p className="text-xs text-slate-500 mt-1">Verified members paying ₹50 annual solidarity fees</p>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
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
            </div>
          </div>

          {/* Communities Joined Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Communities Joined</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">5 Active Hubs</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-900">100%</p>
              <p className="text-xs text-slate-500 mt-1">Verified local administrator supervision</p>
            </div>

            <button
              onClick={() => onNavigatePage('communities')}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Explore All 5 Communities
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Recent Donations Live Feed</h3>
            </div>
            <span className="text-xs text-slate-400">Updated in real time</span>
          </div>

          <div className="space-y-3">
            {MOCK_DONATIONS.map((don) => (
              <div key={don.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    {don.donorName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {don.donorName} <span className="text-slate-400 font-normal">donated</span> ₹{don.amountINR.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {don.campaignTitle} • {don.communityName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-100 block mb-0.5">
                    ✓ UTR Verified
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{don.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. COMMUNITY STORIES & TESTIMONIALS */}
      <section className="bg-slate-900 text-white py-12 rounded-2xl max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Verified Impact</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Community Success Stories & Testimonials</h2>
          <p className="text-xs text-slate-400">Hear directly from families, local administrators, and patrons.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TESTIMONIALS.map((t) => (
            <div key={t.id} className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3 flex flex-col justify-between">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-700/60">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-400" />
                <div>
                  <h4 className="font-bold text-xs text-white">{t.name}</h4>
                  <p className="text-[10px] text-slate-400">{t.role} • {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. RELIEF WORK GALLERY & INSTAGRAM / FACEBOOK FEEDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">On-Ground Drives • Bareilly (UP)</span>
            <h2 className="text-2xl font-extrabold text-slate-900">Bareilly Field Drives & Live Feeds</h2>
          </div>
          <p className="text-xs text-slate-500">Tag #BareillyRelief #SevaSangam on Instagram & Facebook</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Instagram Feed Tile */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram Live (@sevasangam_bareilly)</span>
              </div>
              <span className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded font-bold">18.2k Community Followers</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Instagram Post 1 - Nikah Bridal Support Bareilly */}
              <div className="relative rounded-xl overflow-hidden group bg-slate-100 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"
                  alt="Nikah Bridal Support Bareilly"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-2.5 flex flex-col justify-end text-white">
                  <p className="text-[10px] font-bold line-clamp-2 leading-tight">Bridal Essentials & Nikah Gift Trunk Delivered at Qutubkhana Bareilly #BareillyNikah</p>
                  <div className="flex items-center gap-2 text-[9px] text-pink-300 font-semibold mt-1">
                    <span>❤️ 842 likes</span>
                    <span>💬 64 comments</span>
                  </div>
                </div>
              </div>

              {/* Instagram Post 2 - Child Education Bareilly */}
              <div className="relative rounded-xl overflow-hidden group bg-slate-100 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80"
                  alt="Child Education Bareilly UP"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-2.5 flex flex-col justify-end text-white">
                  <p className="text-[10px] font-bold line-clamp-2 leading-tight">School Kits & Books Distributed to 25 Girls at Bareilly Public School #BareillyEducation</p>
                  <div className="flex items-center gap-2 text-[9px] text-pink-300 font-semibold mt-1">
                    <span>❤️ 915 likes</span>
                    <span>💬 88 comments</span>
                  </div>
                </div>
              </div>

              {/* Instagram Post 3 - Janazah Ambulance Bareilly */}
              <div className="relative rounded-xl overflow-hidden group bg-slate-100 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=400&q=80"
                  alt="Janazah Ambulance Bareilly"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-2.5 flex flex-col justify-end text-white">
                  <p className="text-[10px] font-bold line-clamp-2 leading-tight">24/7 Free Mortuary Van Service Serving Bareilly District Graveyards #BareillyJanazah</p>
                  <div className="flex items-center gap-2 text-[9px] text-pink-300 font-semibold mt-1">
                    <span>❤️ 1,240 likes</span>
                    <span>💬 112 comments</span>
                  </div>
                </div>
              </div>

              {/* Instagram Post 4 - Food Ration Drive CB Ganj Bareilly */}
              <div className="relative rounded-xl overflow-hidden group bg-slate-100 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=80"
                  alt="Ration Drive CB Ganj Bareilly"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-2.5 flex flex-col justify-end text-white">
                  <p className="text-[10px] font-bold line-clamp-2 leading-tight">300 Monthly Food Ration Kits Handed Over at CB Ganj Bareilly #BareillyRelief</p>
                  <div className="flex items-center gap-2 text-[9px] text-pink-300 font-semibold mt-1">
                    <span>❤️ 760 likes</span>
                    <span>💬 54 comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Feed Tile */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook Bareilly & UP Chapter Updates</span>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">Official Bareilly Group</span>
            </div>

            <div className="space-y-3">
              {/* Facebook Post 1 - Bareilly HQ */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">B</div>
                    <span className="font-bold text-slate-900">Bareilly Central Chapter (Civil Lines, UP)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">1 hour ago</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Alhamdulillah! Nikah support items and household starter trunks delivered for Shabana and 4 other orphan brides at Qutubkhana Bareilly today. Thanks to all donors!
                </p>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 font-semibold"><ThumbsUp className="w-3 h-3 text-blue-600" /> 284 Likes</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-slate-400" /> 42 Shares</span>
                </div>
              </div>

              {/* Facebook Post 2 - Izatnagar Bareilly */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[10px]">I</div>
                    <span className="font-bold text-slate-900">Izatnagar & CB Ganj Bareilly Chapter</span>
                  </div>
                  <span className="text-[10px] text-slate-400">4 hours ago</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Bareilly Free Janazah Mortuary Van conducted 3 emergency transfers across Bareilly district today. Full fuel and UTR log attached for audit.
                </p>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 font-semibold"><ThumbsUp className="w-3 h-3 text-blue-600" /> 310 Likes</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-slate-400" /> 58 Shares</span>
                </div>
              </div>

              {/* Facebook Post 3 - Rohilkhand Bareilly */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-[10px]">R</div>
                    <span className="font-bold text-slate-900">Rohilkhand Educational Chapter (Bareilly)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">1 day ago</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Annual scholarship disbursal completed for 15 orphan girl students pursuing Nursing & B.Sc in Bareilly degree colleges!
                </p>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 font-semibold"><ThumbsUp className="w-3 h-3 text-blue-600" /> 425 Likes</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-slate-400" /> 89 Shares</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. PARTNER LOGOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Audited & Backed By Trusted Institutions</span>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
            {partnerLogos.map((p, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="font-extrabold text-slate-800 text-sm">{p.name}</span>
                <span className="text-[10px] text-slate-400">{p.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. MOBILE APP & QR CODE DOWNLOAD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 inline-block">
                MFCT Mobile App (Android & iOS)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Download the MFCT App for Instant UTR Receipts
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Track live campaign status updates, view audit receipts, manage your ₹50 digital membership card, and receive instant push notifications for emergency local campaigns.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-slate-100">
                  <Download className="w-4 h-4 text-emerald-600" /> Google Play Store
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 hover:bg-slate-700">
                  <Download className="w-4 h-4 text-emerald-400" /> Apple App Store
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-20 h-20 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Scan QR Code</h4>
                <p className="text-xs text-slate-300 mt-1">Point camera to instantly download app build</p>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Version 2.4.0 (Latest)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Got Questions?</span>
          <h2 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
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

      {/* 16. NEWSLETTER SUBSCRIBE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-200 text-center space-y-4">
          <div className="max-w-lg mx-auto space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">Weekly Audit & Transparency Newsletter</h3>
            <p className="text-xs text-slate-600">Receive weekly PDF audit summaries, new verified campaigns, and community health reports.</p>
          </div>

          {newsletterSubscribed ? (
            <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Thank you for subscribing to weekly transparency logs!
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 17. CONTACT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">24/7 Assistance</span>
          <h2 className="text-2xl font-extrabold text-slate-900">Contact Community Support</h2>
          <p className="text-xs text-slate-500">Reach out for campaign verification, Zakat guidance, or starting a new chapter.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Send Direct Message</h3>

            {contactSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-center space-y-1 border border-emerald-200 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-900">Message Received!</p>
                <p className="text-slate-600">Our executive team will get back to you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mohd. Tariq"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email / Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. tariq@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">How can we help?</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ask about membership, campaign verification or Zakat guidelines..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send Support Request
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 shadow-md">
              <h4 className="font-bold text-sm text-white">Emergency Support Desks</h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">24/7 Helpline</span>
                    <span className="font-bold text-white text-xs">+91 1800 200 MFCT (6328)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Support Mail</span>
                    <span className="font-bold text-white text-xs">help@mfct.org</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950 border border-emerald-500/30">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-emerald-300 block uppercase font-bold">WhatsApp Desk</span>
                    <span className="font-bold text-white text-xs">+91 98100 12345</span>
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
