'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, Testimonial, CommunityStory, Donation, Community, AccountDetails } from '../types';
import { getCampaigns } from '../services/campaignService';
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
    { id: 'Medical', label: isHindi ? 'चिकित्सा' : 'طبی امداد', icon: Activity, count: campaigns.filter(c => c.category === 'Medical').length, desc: isHindi ? 'गंभीर सर्जरी और डायलिसिस' : 'ہسپتال علاج اور سرجری' },
    { id: 'Education', label: isHindi ? 'शिक्षा' : 'تعلیم', icon: BookOpen, count: campaigns.filter(c => c.category === 'Education').length, desc: isHindi ? 'अनाथ और बालिका शिक्षा फीस' : 'یتیم اور طلباء تعلیمی فیس' },
    { id: 'Marriage', label: isHindi ? 'विवाह' : 'نکاح', icon: Heart, count: campaigns.filter(c => c.category === 'Marriage').length, desc: isHindi ? 'निकाह सहायता' : 'باعزت نکاح و جہیز امداد' },
    { id: 'Janazah', label: isHindi ? 'जनाज़ा' : 'جنازہ', icon: Church, count: campaigns.filter(c => c.category === 'Janazah').length, desc: isHindi ? 'अंतिम संस्कार सहायता' : 'ایمبولینس، کفن اور قبرستان امداد' },
    { id: 'Food', label: isHindi ? 'भोजन' : 'راشن', icon: Flame, count: campaigns.filter(c => c.category === 'Food').length, desc: isHindi ? 'मासिक राशन और राहत' : 'ماہانہ راشن اور امدادی کٹ' },
    { id: 'Zakat', label: isHindi ? 'ज़कात' : 'زکوٰۃ', icon: ShieldCheck, count: campaigns.filter(c => c.isZakatEligible).length, desc: isHindi ? '100% ज़कात-पात्र कारण' : '100% مستحقین زکوٰۃ' },
  ];

  const faqs = [
    {
      q: isHindi ? '₹50 सदस्यता शुल्क मॉडल कैसे काम करता है?' : '₹50 ممبرشپ ماڈل کیسے کام کرتا ہے؟',
      a: isHindi
        ? 'जब आप नाममात्र ₹50 वार्षिक शुल्क का भुगतान करते हैं, तो आप अपने स्थानीय समुदाय के एक सत्यापित सदस्य बन जाते हैं। यह शुल्क हमारा एकजुटता आपातकालीन कोष बनाता है। सत्यापित होने के बाद, आप किसी भी कारण के लिए दान कर सकते हैं और यदि आप या आपका परिवार कभी वास्तविक आपात स्थिति का सामना करते हैं तो सामुदायिक सहायता के लिए भी आवेदन कर सकते हैं।'
        : 'جب آپ ₹50 سالانہ فیس ادا کرتے ہیں، تو آپ اپنے مقامی محلے کے تصدیق شدہ ممبر بن جاتے ہیں۔ یہ فیس ہنگامی امدادی فنڈ بناتی ہے۔ تصدیق کے بعد، آپ کسی بھی مہم میں عطیہ دے سکتے ہیں اور ہنگامی صورتحال میں امداد کی درخواست بھی کر سکتے ہیں۔',
    },
    {
      q: isHindi ? 'क्या ज़कात दान कड़ाई से ज़कात-अनुरूप हैं?' : 'کیا زکوٰۃ کا عطیہ شرعی طور پر زکوٰۃ کے مطابق ہے؟',
      a: isHindi
        ? 'हाँ! हमारा मंच एक प्रणाली-स्तरीय नियम लागू करता है जहाँ ज़कात निधि को केवल ज़कात-पात्र कारणों (जैसे गरीब अनाथ शिक्षा, विधवा सहायता, या जरूरतमंद रोगियों के लिए आपातकालीन डायलिसिस) में स्थानांतरित किया जा सकता है।'
        : 'جی ہاں! ہمارا پلیٹ فارم یقینی بناتا ہے کہ زکوٰۃ فنڈ صرف شرعی طور پر مستحق زکوٰۃ افراد (جیسے یتیموں، بیواؤں اور غریب مریضوں) کو ہی دیا جائے۔',
    },
    {
      q: isHindi ? 'प्रकाशन से पहले अभियानों का सत्यापन कैसे किया जाता है?' : 'مہمات کو لائیو کرنے سے پہلے تصدیق کیسے کی جاتی ہے؟',
      a: isHindi
        ? 'प्रत्येक अभियान 3-स्तरीय सत्यापन से गुजरता है: 1) स्थानीय सामुदायिक व्यवस्थापक द्वारा ऑन-साइट विज़िट, 2) हमारी कार्यकारी टीम द्वारा अस्पताल/मेडिकल बिल अनुमान ऑडिट, और 3) अस्पताल या विक्रेता खातों में सीधा भुगतान एस्क्रो।'
        : 'ہر مہم 3 مراحل کی تصدیق سے گزرتی ہے: 1) مقامی ایڈمن کی زمینی جانچ، 2) ہسپتال اور میڈیکل بلوں کی تصدیق، اور 3) ہسپتال یا وینڈر کو براہ راست ادائیگی۔',
    },
    {
      q: isHindi ? 'क्या मैं अपने स्थानीय समुदाय के बाहर के अभियानों में दान कर सकता हूँ?' : 'کیا میں اپنی کمیونٹی سے باہر کی مہمات میں بھی عطیہ دے سکتا ہوں؟',
      a: isHindi
        ? 'बिल्कुल! दान के दौरान "समुदाय के बाहर मदद करें" टॉगल का उपयोग करके, आप पूरे भारत में सत्यापित मामलों का समर्थन कर सकते हैं।'
        : 'بالکل! آپ کسی بھی تصدیق شدہ مہم میں بلا جھجھک عطیہ دے سکتے ہیں۔',
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
                <span>{isHindi ? 'बरेली, उत्तर प्रदेश — मुख्यालय सामुदायिक कल्याण नेटवर्क' : 'مرکزی دفتر بریلی، اتر پردیش — فلاحی کمیونٹی نیٹ ورک'}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                {isHindi ? (
                  <>समुदायों को <span className="text-emerald-700 underline decoration-emerald-300">बरेली</span> और उत्तर भारत में जोड़ना।</>
                ) : (
                  <>کمیونٹیز کو <span className="text-emerald-700 underline decoration-emerald-300">بریلی</span> اور شمالی ہندوستان میں بااختیار بنانا۔</>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                {isHindi
                  ? 'बरेली, उत्तर प्रदेश में मुख्यालय — एक 100% पारदर्शी, सदस्य-संचालित क्राउडफंडिंग इकोसिस्टम। सिविल लाइंस, कुतुबखाना, रोहिलखंड और इज्जतनगर जैसे मुहल्लों को मात्र ₹50 वार्षिक सदस्यता के माध्यम से जोड़ना।'
                  : 'مرکزی دفتر بریلی، اتر پردیش — 100% شفاف، عوامی فلاحی نیٹ ورک۔ سول لائنز، قطب خانہ، روہیل کھنڈ اور عزت نگر جیسے محلوں کو صرف ₹50 سالانہ رکنیت کے ذریعے جوڑنا۔'}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenRegister}
                  className="py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> {isHindi ? 'सदस्य बनें (₹50)' : 'ممبر بنیں (₹50)'}
                </button>
                <button
                  onClick={() => onDonate()}
                  className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-current" /> {isHindi ? 'अभी दान करें' : 'ابھی عطیہ دیں'}
                </button>
                {onOpenZakatCalc && (
                  <button
                    onClick={onOpenZakatCalc}
                    className="py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-sm transition-all shadow-md shadow-amber-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Calculator className="w-4.5 h-4.5" />
                    <span>{isHindi ? '2.5% ज़कात कैलकुलेटर' : '2.5% زکوٰۃ کیلکولیٹر'}</span>
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
                  <span className="text-xs text-slate-500 font-medium">{isHindi ? 'सत्यापित सदस्य' : 'تصدیق شدہ ممبران'}</span>
                </div>
                <div>
                  {loading ? (
                    <div className="h-9 w-32 bg-slate-200 rounded animate-pulse mb-1"></div>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">₹{totalRaised > 0 ? (totalRaised).toLocaleString('en-IN') : '0'} +</span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">{isHindi ? 'वितरित राशि' : 'تقسیم شدہ رقم'}</span>
                </div>
                <div>
                  {loading ? (
                    <div className="h-9 w-16 bg-slate-200 rounded animate-pulse mb-1"></div>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 block">100%</span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">{isHindi ? 'ऑडिट और यूटीआर रसीदें' : 'آڈٹ اور رسیدیں'}</span>
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
                        {isHindi ? 'Google Pay, PhonePe, Paytm द्वारा स्कैन करें' : 'Google Pay, PhonePe, Paytm کے ذریعے اسکین کریں'}
                      </p>
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">{isHindi ? 'लक्षित दान' : 'امدادی شعبے'}</span>
            <h2 className="text-2xl font-extrabold text-slate-900">{isHindi ? 'दान श्रेणियां देखें' : 'امداد کی کیٹیگریز دیکھیں'}</h2>
          </div>
          <p className="text-xs text-slate-500">{isHindi ? 'अपनी ज़कात या सदका के लिए एक विशिष्ट कारण चुनें' : 'اپنی زکوٰۃ یا صدقہ کے لیے مخصوص شعبہ منتخب کریں'}</p>
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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">{isHindi ? 'आपका समुदाय' : 'آپ کی کمیونٹی'}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{isHindi ? 'आपके क्षेत्र के अभियान' : `${activeUser.communityName || 'آپ کے علاقے'} کی مہمات`}</h2>
              <p className="text-xs text-slate-500 mt-1">{isHindi ? 'अपने समुदाय के सत्यापित कारणों का समर्थन करें।' : 'اپنے محلے کی تصدیق شدہ مہمات میں حصہ لیں۔'}</p>
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
                {isHindi ? 'अभी आपके समुदाय में कोई सक्रिय अभियान नहीं मिला।' : 'فی الحال آپ کی کمیونٹی میں کوئی مہم نہیں ہے۔'}
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
                {isHindi ? 'क्या आप अपनी इस वर्ष की ज़कात की गणना करना चाहते हैं?' : 'کیا آپ اس سال کی اپنی زکوٰۃ کا صحیح حساب لگانا چاہتے ہیں؟'}
              </h3>
              <p className="text-emerald-100/90 text-xs sm:text-sm">
                {isHindi
                  ? 'सोना, चांदी, बचत, स्टॉक व देनदारियों के आधार पर अपनी सही देय ज़कात तुरंत जानें और 100% पारदर्शी अभियानों में दान करें।'
                  : 'سونا، چاندی، نقدی اور سرمایہ کاری درج کر کے فوری واجب الادا زکوٰۃ معلوم کریں اور براہ راست عطیہ دیں۔'}
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={onOpenZakatCalc}
                className="py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 group cursor-pointer"
              >
                <Calculator className="w-5 h-5 text-amber-950" />
                <span>{isHindi ? 'मुफ़्त ज़कात कैलकुलेटर खोलें' : 'مفت زکوٰۃ کیلکولیٹر کھولیں'}</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">{isHindi ? 'ऑन-साइट सत्यापित कारण' : 'تصدیق شدہ فلاحی مہمات'}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{isHindi ? 'विशेष अभियान' : 'نمایاں مہمات'}</h2>
            <p className="text-xs text-slate-500 mt-1">{isHindi ? 'दान का 100% सीधे लाभार्थी अस्पताल खातों में जाता है।' : 'عطیہ کی 100% رقم براہ راست ہسپتال اور مستحقین کے کھاتے میں جاتی ہے۔'}</p>
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
                {cat === 'All' ? (isHindi ? 'सभी' : 'تمام') :
                 cat === 'Urgent' ? (isHindi ? 'अति आवश्यक' : 'انتہائی ضروری') :
                 cat === 'Zakat' ? (isHindi ? 'ज़कात' : 'زکوٰۃ') :
                 cat === 'Medical' ? (isHindi ? 'चिकित्सा' : 'طبی امداد') :
                 cat === 'Education' ? (isHindi ? 'शिक्षा' : 'تعلیم') :
                 cat === 'Food' ? (isHindi ? 'भोजन' : 'راشن') :
                 cat === 'Marriage' ? (isHindi ? 'विवाह' : 'نکاح') :
                 cat === 'Janazah' ? (isHindi ? 'जनाज़ा' : 'جنازہ') : cat}
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
              {isHindi ? 'चयनित श्रेणी से मेल खाने वाला कोई अभियान नहीं मिला।' : 'اس کیٹیگری میں کوئی مہم دستیاب نہیں ہے۔'}
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
              {isHindi ? 'सभी अभियान देखें' : 'تمام مہمات دیکھیں'} <ArrowRight className="w-4 h-4" />
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{isHindi ? 'सरल और विश्वसनीय' : 'آسان اور شفاف طریقہ کار'}</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{isHindi ? 'MFCT कैसे काम करता है' : 'یہ کیسے کام کرتا ہے'}</h2>
          <p className="text-xs text-slate-500">{isHindi ? 'स्थानीय सामुदायिक एकजुटता को सशक्त बनाने के लिए चार सरल कदम।' : 'مقامی فلاحی نیٹ ورک کے 4 آسان مراحل'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isHindi ? 'स्थानीय समुदाय से जुड़ें' : 'مقامی کمیونٹی سے جڑیں'}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHindi ? 'अपने स्थानीय प्रशासक के सामुदायिक नेटवर्क में शामिल होने के लिए ₹50 सदस्यता शुल्क का भुगतान करें।' : 'صرف ₹50 کی فیس ادا کر کے اپنے محلے کے نیٹ ورک میں شامل ہوں۔'}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isHindi ? 'KYC सत्यापन' : 'KYC تصدیق'}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHindi ? 'हमारी कार्यकारी टीम एक विश्वसनीय धोखाधड़ी-मुक्त नेटवर्क बनाए रखने के लिए आधार विवरण सत्यापित करती है।' : 'ہماری ٹیم شفافیت کے لیے آدھار کی مکمل جانچ کرتی ہے۔'}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isHindi ? 'सहायता करें या अनुरोध करें' : 'امداد دیں یا درخواست کریں'}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHindi ? 'समुदाय के अंदर/बाहर सत्यापित कारणों के लिए दान करें, या आपात स्थिति के दौरान सहायता का अनुरोध करें।' : 'تصدیق شدہ مہمات میں عطیہ دیں یا ضرورت کے وقت مدد مانگیں۔'}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mx-auto">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isHindi ? 'प्रत्यक्ष एस्क्रो और रसीद' : 'براہ راست ادائیگی اور رسید'}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHindi ? 'धन सीधे अस्पतालों या विक्रेताओं को वितरित किया जाता है। तुरंत 80G कर रसीद डाउनलोड करें।' : 'فنڈز براہ راست ہسپتال کو جاتے ہیں اور فوری رسید حاصل کریں۔'}
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">{isHindi ? 'जीवन प्रभाव काउंटर' : 'اثرات کا جائزہ'}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">{isHindi ? 'वास्तविक समय' : 'لائیو'}</span>
              </div>
              <p className="text-4xl font-extrabold">{testimonials.length} </p>
              <p className="text-xs text-emerald-100 mt-1">{isHindi ? 'पूरे भारत में लाभार्थियों के जीवन पर सीधा प्रभाव पड़ा' : 'ہندوستان بھر میں بدلی ہوئی زندگیاں'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isHindi ? 'शामिल हुए सदस्य' : 'شامل ممبران'}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">{isHindi ? 'आज +14' : 'آج +14'}</span>
              </div>
              {loading ? (
                <div className="h-10 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-4xl font-extrabold text-slate-900">{totalMembers > 0 ? totalMembers.toLocaleString('en-IN') : '0'}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">{isHindi ? '₹50 वार्षिक शुल्क का भुगतान करने वाले सत्यापित सदस्य' : '₹50 فیس ادا کرنے والے تصدیق شدہ ممبران'}</p>
            </div>
          </div>

          {/* Communities Joined Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isHindi ? 'जुड़े हुए समुदाय' : 'کمیونٹی ہب'}</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                  {loading ? '...' : (communities.length > 0 ? communities.length : '0')} {isHindi ? 'सक्रिय हब' : 'فعال ہب'}
                </span>
              </div>
              {loading ? (
                <div className="h-10 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-4xl font-extrabold text-slate-900">{avgHealth}%</p>
              )}
              <p className="text-xs text-slate-500 mt-1">{isHindi ? 'सत्यापित स्थानीय प्रशासक की निगरानी' : 'اوسط کمیونٹی ہیلتھ اور تصدیقی اسکور'}</p>
            </div>

            <button
              onClick={() => onNavigatePage('communities')}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> {isHindi ? 'समुदायों का अन्वेषण करें' : 'تمام کمیونٹیز دیکھیں'}
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">{isHindi ? 'हालिया दान लाइव फीड' : 'حالیہ عطیات'}</h3>
            </div>
            <span className="text-xs text-slate-400">{isHindi ? 'वास्तविक समय में अपडेट किया गया' : 'شفاف لائیو فیڈ'}</span>
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
                      {don.donorName} <span className="text-slate-400 font-normal">{isHindi ? 'ने दान दिया' : 'نے عطیہ دیا'}</span> ₹{don.amountINR.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {don.campaignTitle} • {don.communityName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-100 block mb-0.5">
                    ✓ {isHindi ? 'UTR सत्यापित' : 'UTR تصدیق شدہ'}
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{isHindi ? 'सत्यापित प्रभाव' : 'زمینی اثرات'}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{isHindi ? 'सामुदायिक सफलता की कहानियाँ और प्रशंसापत्र' : 'زمینی اثرات اور کامیابی کی کہانیاں'}</h2>
          <p className="text-xs text-slate-400">{isHindi ? 'सीधे परिवारों, स्थानीय प्रशासकों और संरक्षकों से सुनें।' : 'مستحقین اور فیلڈ رضاکاروں کے تاثرات'}</p>
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
              {isHindi ? 'सभी प्रभाव कहानियाँ देखें' : 'تمام کہانیاں دیکھیں'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 15. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{isHindi ? 'कोई प्रश्न हैं?' : 'عام سوالات'}</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{isHindi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'اکثر پوچھے جانے والے سوالات'}</h2>
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{isHindi ? '24/7 सहायता' : '24/7 مدد'}</span>
          <h2 className="text-2xl font-extrabold text-slate-900">{isHindi ? 'सामुदायिक सहायता से संपर्क करें' : 'مدد چاہیے یا کوئی سوال ہے؟'}</h2>
          <p className="text-xs text-slate-500">{isHindi ? 'अभियान सत्यापन, ज़कात मार्गदर्शन, या नया अध्याय शुरू करने के लिए संपर्क करें।' : 'ہماری ٹیم 24/7 آپ کی مدد کے لیے حاضر ہے'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">{isHindi ? 'सीधा संदेश भेजें' : 'پیغام بھیجیں'}</h3>

            {contactSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-center space-y-1 border border-emerald-200 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-900">{isHindi ? 'संदेश प्राप्त हुआ!' : '!آپ کا پیغام موصول ہو گیا ہے'}</p>
                <p className="text-slate-600">{isHindi ? 'हमारी कार्यकारी टीम 2 घंटे के भीतर आपसे संपर्क करेगी।' : 'ہماری ٹیم جلد آپ سے رابطہ کرے گی۔'}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isHindi ? 'आपका नाम' : 'آپ کا نام'}</label>
                    <input
                      type="text"
                      required
                      placeholder={isHindi ? 'उदा. मोहम्मद तारिक' : 'مکمل نام درج کریں'}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isHindi ? 'फ़ोन नंबर' : 'فون نمبر'}</label>
                    <input
                      type="number"
                      required
                      placeholder={isHindi ? 'उदा. 1234567890' : '10 ہندسوں کا موبائل نمبر'}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isHindi ? 'हम कैसे मदद कर सकते हैं?' : 'آپ کی ضرورت / پیغام'}</label>
                  <textarea
                    rows={3}
                    required
                    placeholder={isHindi ? 'सदस्यता, अभियान सत्यापन या ज़कात दिशानिर्देशों के बारे में पूछें...' : '...تفصیل سے بتائیں کہ ہم کیسے مدد کر سکتے ہیں'}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> {isHindi ? 'सहायता अनुरोध भेजें' : 'پیغام ارسال کریں'}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 shadow-md">
              <h4 className="font-bold text-sm text-white">{isHindi ? 'आपातकालीन सहायता डेस्क' : 'ہنگامی ہیلپ لائنز'}</h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">{isHindi ? '24/7 हेल्पलाइन' : '24/7 ہنگامی مدد'}</span>
                    <span className="font-bold text-white text-xs">+91 1800 200 MFCT (6328)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950 border border-emerald-500/30">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-emerald-300 block uppercase font-bold">{isHindi ? 'व्हाट्सएप डेस्क' : 'واٹس ایپ سپورٹ ڈیسک'}</span>
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
