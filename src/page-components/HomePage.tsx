'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, Testimonial, CommunityStory, Donation, Community, AccountDetails } from '../types';
import { getCampaigns, getEmergencyCampaigns } from '../services/campaignService';
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
  const { t, isHindi } = useLanguage();
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
        setCampaigns(cData);
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
    { id: 'Medical', label: isHindi ? 'चिकित्सा' : 'Medical', icon: Activity, count: campaigns.filter(c => c.category === 'Medical').length, desc: isHindi ? 'गंभीर सर्जरी और डायलिसिस' : 'Critical surgeries & dialysis' },
    { id: 'Education', label: isHindi ? 'शिक्षा' : 'Education', icon: BookOpen, count: campaigns.filter(c => c.category === 'Education').length, desc: isHindi ? 'अनाथ और बालिका शिक्षा फीस' : 'Orphan & girl child fees' },
    { id: 'Marriage', label: isHindi ? 'विवाह' : 'Marriage', icon: Heart, count: campaigns.filter(c => c.category === 'Marriage').length, desc: isHindi ? 'निकाह सहायता' : 'Nikah & bridal dignity aid' },
    { id: 'Janazah', label: isHindi ? 'जनाज़ा' : 'Janazah', icon: Church, count: campaigns.filter(c => c.category === 'Janazah').length, desc: isHindi ? 'अंतिम संस्कार सहायता' : 'Funeral & cemetery support' },
    { id: 'Food', label: isHindi ? 'भोजन' : 'Food', icon: Flame, count: campaigns.filter(c => c.category === 'Food').length, desc: isHindi ? 'मासिक राशन और राहत' : 'Monthly ration & flood relief' },
    { id: 'Zakat', label: isHindi ? 'ज़कात' : 'Zakat', icon: ShieldCheck, count: campaigns.filter(c => c.isZakatEligible).length, desc: isHindi ? '100% ज़कात-पात्र कारण' : '100% Zakat-compliant causes' },
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
      q: isHindi ? '₹50 सदस्यता शुल्क मॉडल कैसे काम करता है?' : 'How does the ₹50 membership fee model work?',
      a: isHindi ? 'जब आप नाममात्र ₹50 वार्षिक शुल्क का भुगतान करते हैं, तो आप अपने स्थानीय समुदाय के एक सत्यापित सदस्य बन जाते हैं। यह शुल्क हमारा एकजुटता आपातकालीन कोष बनाता है। सत्यापित होने के बाद, आप किसी भी कारण के लिए दान कर सकते हैं और यदि आप या आपका परिवार कभी वास्तविक आपात स्थिति का सामना करते हैं तो सामुदायिक सहायता के लिए भी आवेदन कर सकते हैं।' : 'When you pay a nominal ₹50 annual fee, you become a verified member of your local community. This fee builds our solidarity emergency escrow. Once verified, you can donate to any cause and also apply for community aid if you or your family ever face a genuine emergency.',
    },
    {
      q: isHindi ? 'क्या ज़कात दान कड़ाई से ज़कात-अनुरूप हैं?' : 'Are Zakat donations strictly Zakat compliant?',
      a: isHindi ? 'हाँ! हमारा मंच एक प्रणाली-स्तरीय नियम लागू करता है जहाँ ज़कात निधि को केवल ज़कात-पात्र कारणों (जैसे गरीब अनाथ शिक्षा, विधवा सहायता, या जरूरतमंद रोगियों के लिए आपातकालीन डायलिसिस) में स्थानांतरित किया जा सकता है।' : 'Yes! Our platform enforces a system-level rule where Zakat funds can ONLY be transferred to Zakat-Eligible causes (such as poor orphan education, widow support, or emergency dialysis for needy patients). Zakat funds are never mixed with non-eligible causes.',
    },
    {
      q: isHindi ? 'प्रकाशन से पहले अभियानों का सत्यापन कैसे किया जाता है?' : 'How are campaigns verified before publication?',
      a: isHindi ? 'प्रत्येक अभियान 3-स्तरीय सत्यापन से गुजरता है: 1) स्थानीय सामुदायिक व्यवस्थापक द्वारा ऑन-साइट विज़िट, 2) हमारी कार्यकारी टीम द्वारा अस्पताल/मेडिकल बिल अनुमान ऑडिट, और 3) अस्पताल या विक्रेता खातों में सीधा भुगतान एस्क्रो।' : 'Every campaign undergoes a 3-tier verification: 1) On-site visit by the local Community Admin, 2) Hospital/Medical bill estimate audit by our Executive Team, and 3) Direct payment escrow into hospital or vendor accounts.',
    },
    {
      q: isHindi ? 'क्या मैं अपने स्थानीय समुदाय के बाहर के अभियानों में दान कर सकता हूँ?' : 'Can I donate to campaigns outside my local community?',
      a: isHindi ? 'बिल्कुल! दान के दौरान "समुदाय के बाहर मदद करें" टॉगल का उपयोग करके, आप पूरे भारत में सत्यापित मामलों का समर्थन कर सकते हैं।' : 'Absolutely! By using the "Help Outside Community" toggle during donation, you can support verified cases anywhere across India.',
    },
  ];



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
                <span>{isHindi ? 'बरेली, उत्तर प्रदेश — मुख्यालय सामुदायिक कल्याण नेटवर्क' : 'Bareilly, Uttar Pradesh — Headquartered Community Welfare Network'}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                {isHindi ? (
                  <>समुदायों को <span className="text-emerald-700 underline decoration-emerald-300">बरेली</span> और उत्तर भारत में जोड़ना।</>
                ) : (
                  <>Uniting Communities Across <span className="text-emerald-700 underline decoration-emerald-300">Bareilly</span> & North India.</>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                {isHindi ? 'बरेली, उत्तर प्रदेश में मुख्यालय — एक 100% पारदर्शी, सदस्य-संचालित क्राउडफंडिंग इकोसिस्टम। सिविल लाइंस, कुतुबखाना, रोहिलखंड और इज्जतनगर जैसे मुहल्लों को मात्र ₹50 वार्षिक सदस्यता के माध्यम से जोड़ना।' : 'Headquartered in Bareilly, Uttar Pradesh — A 100% transparent, member-driven crowdfunding ecosystem. Connecting neighborhoods across Civil Lines, Qutubkhana, Rohilkhand, and Izatnagar through nominal ₹50 annual memberships.'}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenRegister}
                  className="py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> {isHindi ? 'सदस्य बनें (₹50)' : 'Become a Member (₹50)'}
                </button>
                <button
                  onClick={() => onDonate()}
                  className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-current" /> {isHindi ? 'अभी दान करें' : 'Donate Now'}
                </button>
                {onOpenZakatCalc && (
                  <button
                    onClick={onOpenZakatCalc}
                    className="py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-sm transition-all shadow-md shadow-amber-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Calculator className="w-4.5 h-4.5" />
                    <span>{isHindi ? '2.5% ज़कात कैलकुलेटर' : '2.5% Zakat Calculator'}</span>
                  </button>
                )}

              </div>

              {/* Live Impact Stats Summary */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-left">
                <div>
                  {loading ? (
                    <div className="h-9 w-20 bg-slate-200 rounded animate-pulse mb-1"></div>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 block">{totalMembers > 0 ? totalMembers.toLocaleString('en-IN') : '0'}+</span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">{isHindi ? 'सत्यापित सदस्य' : 'Verified Members'}</span>
                </div>
                <div>
                  {loading ? (
                    <div className="h-9 w-32 bg-slate-200 rounded animate-pulse mb-1"></div>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">₹{totalRaised > 0 ? (totalRaised).toLocaleString('en-IN') : '0'} +</span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">{isHindi ? 'वितरित राशि' : 'Funds Disbursed'}</span>
                </div>
                <div>
                  {loading ? (
                    <div className="h-9 w-16 bg-slate-200 rounded animate-pulse mb-1"></div>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 block">100%</span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">{isHindi ? 'ऑडिट और यूटीआर रसीदें' : 'Audit & UTR Receipts'}</span>
                </div>
              </div>
            </div>

            {/* Right Column Hero Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white group">
                <img
                  src="https://images.unsplash.com/photo-1644726270363-e746b37b482b?q=80&w=465&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Bareilly Food Ration Distribution Drive"
                  className="w-full h-[520px] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Gradient Overlay for Text and QR Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-slate-900/20"></div>

                {/* Bottom-Aligned QR Code Section */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-6 pb-6">
                  <div className="flex flex-col items-center gap-5 w-full max-w-xs mx-auto pb-4">
                    <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0">
                      {accountDetails?.qr_code_url ? (
                        <img src={accountDetails.qr_code_url} alt="QR Code" className="w-32 h-32 object-contain" />
                      ) : (
                        <QrCode className="w-32 h-32 text-slate-900" />
                      )}
                    </div>
                    <div className="text-center flex flex-col items-center gap-1.5 w-full">

                      <p className="font-mono text-white font-bold text-2xl select-all tracking-wider py-1">
                        {accountDetails?.upi_id || 'mfct@okicici'}
                      </p>
                      <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                        Scan using Google Pay, PhonePe, Paytm
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Impact Banner */}
                {/* <div className="absolute bottom-5 left-5 right-5 text-white p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                  <div className="flex items-center gap-2 mb-1.5 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> Live Bareilly Impact
                  </div>
                  <p className="font-bold text-sm text-white leading-tight">
                    300 Food Ration Kits & Warm Blankets Distributed at CB Ganj, Bareilly (UP).
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY CAROUSEL & CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">{isHindi ? 'लक्षित दान' : 'Targeted Giving'}</span>
            <h2 className="text-2xl font-extrabold text-slate-900">{isHindi ? 'दान श्रेणियां देखें' : 'Explore Donation Categories'}</h2>
          </div>
          <p className="text-xs text-slate-500">{isHindi ? 'अपनी ज़कात या सदका के लिए एक विशिष्ट कारण चुनें' : 'Choose a specific cause to direct your Zakat or Sadakah'}</p>
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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">{isHindi ? 'आपका समुदाय' : 'Your Community'}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{isHindi ? 'आपके क्षेत्र के अभियान' : `Campaigns in ${activeUser.communityName || 'Your Area'}`}</h2>
              <p className="text-xs text-slate-500 mt-1">{isHindi ? 'अपने समुदाय के सत्यापित कारणों का समर्थन करें।' : 'Support verified causes from your own community.'}</p>
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
                {isHindi ? 'अभी आपके समुदाय में कोई सक्रिय अभियान नहीं मिला।' : 'No active campaigns found in your community right now.'}
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
                {isHindi ? 'क्या आप अपनी इस वर्ष की ज़कात की गणना करना चाहते हैं?' : 'Calculate Your 2.5% Zakat Easily & Accurately'}
              </h3>
              <p className="text-emerald-100/90 text-xs sm:text-sm">
                {isHindi
                  ? 'सोना, चांदी, बचत, स्टॉक व देनदारियों के आधार पर अपनी सही देय ज़कात तुरंत जानें और 100% पारदर्शी अभियानों में दान करें।'
                  : 'Enter your gold, silver, bank savings, cash & liabilities to compute your exact Zakat obligation. Direct 1-click donation to verified causes.'}
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={onOpenZakatCalc}
                className="py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 group cursor-pointer"
              >
                <Calculator className="w-5 h-5 text-amber-950" />
                <span>{isHindi ? 'मुफ़्त ज़कात कैलकुलेटर खोलें' : 'Open Instant Zakat Calculator'}</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">{isHindi ? 'ऑन-साइट सत्यापित कारण' : 'On-site Verified Causes'}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{isHindi ? 'विशेष अभियान' : 'Featured Campaigns'}</h2>
            <p className="text-xs text-slate-500 mt-1">{isHindi ? 'दान का 100% सीधे लाभार्थी अस्पताल खातों में जाता है।' : '100% of donations go directly to beneficiary hospital accounts.'}</p>
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
                {cat}
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
              {isHindi ? 'चयनित श्रेणी से मेल खाने वाला कोई अभियान नहीं मिला।' : 'No campaigns found matching the selected category.'}
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
              {isHindi ? 'सभी अभियान देखें' : 'View All Campaigns'} <ArrowRight className="w-4 h-4" />
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{isHindi ? 'सरल और विश्वसनीय' : 'Simple & Trustworthy'}</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{isHindi ? 'MFCT कैसे काम करता है' : 'How MFCT Works'}</h2>
          <p className="text-xs text-slate-500">{isHindi ? 'स्थानीय सामुदायिक एकजुटता को सशक्त बनाने के लिए चार सरल कदम।' : 'Four simple steps to empower local community solidarity.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isHindi ? 'स्थानीय समुदाय से जुड़ें' : 'Join Local Community'}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHindi ? 'अपने स्थानीय प्रशासक के सामुदायिक नेटवर्क में शामिल होने के लिए ₹50 सदस्यता शुल्क का भुगतान करें।' : "Pay ₹50 membership fee to join your local administrator's community network."}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isHindi ? 'KYC सत्यापन' : 'KYC Verification'}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHindi ? 'हमारी कार्यकारी टीम एक विश्वसनीय धोखाधड़ी-मुक्त नेटवर्क बनाए रखने के लिए आधार विवरण सत्यापित करती है।' : 'Our Executive team verifies Aadhaar details to maintain a trusted fraud-free network.'}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isHindi ? 'सहायता करें या अनुरोध करें' : 'Support or Request Aid'}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHindi ? 'समुदाय के अंदर/बाहर सत्यापित कारणों के लिए दान करें, या आपात स्थिति के दौरान सहायता का अनुरोध करें।' : 'Donate to verified causes inside/outside community, or request aid during emergencies.'}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isHindi ? 'प्रत्यक्ष एस्क्रो और रसीद' : 'Direct Escrow & Receipt'}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHindi ? 'धन सीधे अस्पतालों या विक्रेताओं को वितरित किया जाता है। तुरंत 80G कर रसीद डाउनलोड करें।' : 'Funds are disbursed directly to hospitals or vendors. Instantly download 80G tax receipt.'}
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">{isHindi ? 'जीवन प्रभाव काउंटर' : 'Life Impact Counter'}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">{isHindi ? 'वास्तविक समय' : 'Real-time'}</span>
              </div>
              <p className="text-4xl font-extrabold">{testimonials.length} </p>
              <p className="text-xs text-emerald-100 mt-1">{isHindi ? 'पूरे भारत में लाभार्थियों के जीवन पर सीधा प्रभाव पड़ा' : 'Beneficiary lives directly impacted across India'}</p>
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

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isHindi ? 'शामिल हुए सदस्य' : 'Members Joined Counter'}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">{isHindi ? 'आज +14' : '+14 Today'}</span>
              </div>
              {loading ? (
                <div className="h-10 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-4xl font-extrabold text-slate-900">{totalMembers > 0 ? totalMembers.toLocaleString('en-IN') : '0'}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">{isHindi ? '₹50 वार्षिक शुल्क का भुगतान करने वाले सत्यापित सदस्य' : 'Verified members paying ₹50 annual solidarity fees'}</p>
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
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isHindi ? 'जुड़े हुए समुदाय' : 'Communities Joined'}</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                  {loading ? '...' : (communities.length > 0 ? communities.length : '0')} {isHindi ? 'सक्रिय हब' : 'Active Hubs'}
                </span>
              </div>
              {loading ? (
                <div className="h-10 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-4xl font-extrabold text-slate-900">{avgHealth}%</p>
              )}
              <p className="text-xs text-slate-500 mt-1">{isHindi ? 'सत्यापित स्थानीय प्रशासक की निगरानी' : 'Verified local administrator supervision'}</p>
            </div>

            <button
              onClick={() => onNavigatePage('communities')}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> {isHindi ? 'समुदायों का अन्वेषण करें' : 'Explore Communities'}
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">{isHindi ? 'हालिया दान लाइव फीड' : 'Recent Donations Live Feed'}</h3>
            </div>
            <span className="text-xs text-slate-400">{isHindi ? 'वास्तविक समय में अपडेट किया गया' : 'Updated in real time'}</span>
          </div>

          <div className="space-y-3">
            {recentDonations.map((don) => (
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{isHindi ? 'सत्यापित प्रभाव' : 'Verified Impact'}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{isHindi ? 'सामुदायिक सफलता की कहानियाँ और प्रशंसापत्र' : 'Community Success Stories & Testimonials'}</h2>
          <p className="text-xs text-slate-400">{isHindi ? 'सीधे परिवारों, स्थानीय प्रशासकों और संरक्षकों से सुनें।' : 'Hear directly from families, local administrators, and patrons.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 9).map((t) => (
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
              {isHindi ? 'सभी प्रभाव कहानियाँ देखें' : 'View All Impact Stories'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>



      {/* 15. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{isHindi ? 'कोई प्रश्न हैं?' : 'Got Questions?'}</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{isHindi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}</h2>
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{isHindi ? '24/7 सहायता' : '24/7 Assistance'}</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{isHindi ? 'सामुदायिक सहायता से संपर्क करें' : 'Contact Community Support'}</h2>
          <p className="text-xs text-slate-500">{isHindi ? 'अभियान सत्यापन, ज़कात मार्गदर्शन, या नया अध्याय शुरू करने के लिए संपर्क करें।' : 'Reach out for campaign verification, Zakat guidance, or starting a new chapter.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">{isHindi ? 'सीधा संदेश भेजें' : 'Send Direct Message'}</h3>

            {contactSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-center space-y-1 border border-emerald-200 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-900">{isHindi ? 'संदेश प्राप्त हुआ!' : 'Message Received!'}</p>
                <p className="text-slate-600">{isHindi ? 'हमारी कार्यकारी टीम 2 घंटे के भीतर आपसे संपर्क करेगी।' : 'Our executive team will get back to you within 2 hours.'}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isHindi ? 'आपका नाम' : 'Your Name'}</label>
                    <input
                      type="text"
                      required
                      placeholder={isHindi ? 'उदा. मोहम्मद तारिक' : 'e.g. Mohd. Tariq'}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isHindi ? 'फ़ोन नंबर' : 'Phone Number'}</label>
                    <input
                      type="number"
                      required
                      placeholder={isHindi ? 'उदा. 1234567890' : 'e.g. 1234567890'}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isHindi ? 'हम कैसे मदद कर सकते हैं?' : 'How can we help?'}</label>
                  <textarea
                    rows={3}
                    required
                    placeholder={isHindi ? 'सदस्यता, अभियान सत्यापन या ज़कात दिशानिर्देशों के बारे में पूछें...' : 'Ask about membership, campaign verification or Zakat guidelines...'}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> {isHindi ? 'सहायता अनुरोध भेजें' : 'Send Support Request'}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 shadow-md">
              <h4 className="font-bold text-sm text-white">{isHindi ? 'आपातकालीन सहायता डेस्क' : 'Emergency Support Desks'}</h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">{isHindi ? '24/7 हेल्पलाइन' : '24/7 Helpline'}</span>
                    <span className="font-bold text-white text-xs">+91 1800 200 MFCT (6328)</span>
                  </div>
                </div>

                {/* <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Support Mail</span>
                    <span className="font-bold text-white text-xs">help@mfct.org</span>
                  </div>
                </div> */}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950 border border-emerald-500/30">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-emerald-300 block uppercase font-bold">{isHindi ? 'व्हाट्सएप डेस्क' : 'WhatsApp Desk'}</span>
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
