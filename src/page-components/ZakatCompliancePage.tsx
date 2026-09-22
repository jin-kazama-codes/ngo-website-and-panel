'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Heart,
  Banknote,
  FileCheck,
  AlertTriangle,
  Search,
  Printer,
  Share2,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  BookOpen,
  Layers,
  Scale,
  FileText,
  Check,
  X,
  ShieldAlert,
  Award,
  Building2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ZakatCompliancePage: React.FC = () => {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'principles' | 'undertakings' | 'accounting' | 'hadith'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ── Searchable Data Items for live filtering ─────────────────────────────
  const sectionsData = useMemo(() => [
    {
      id: 'part-a',
      partCode: 'A',
      category: 'principles',
      badgeHi: 'भाग–A : मूल शरीअती सिद्धांत',
      badgeEn: 'Part A: Core Shariah Principles',
      titleHi: 'मूल शरीअती सिद्धांत एवं ज़कात का वैधानिक उद्देश्य',
      titleEn: 'Fundamental Shariah Principles & The Purpose of Zakat',
      summaryHi: 'MFCT द्वारा प्राप्त ज़कात की राशि केवल शरीअत के अनुसार पात्र व्यक्तियों/मदों तक पहुँचाई जाएगी। MFCT केवल वकील/अमीन के रूप में कार्य करता है।',
      summaryEn: 'Zakat collected by MFCT is strictly disbursed to Shariah-compliant beneficiaries. MFCT acts solely as a Wakīl/Amīn (agent/trustee).',
    },
    {
      id: 'part-b',
      partCode: 'B',
      category: 'undertakings',
      badgeHi: 'भाग–B : ज़कात के लिए MFCT Undertaking',
      badgeEn: 'Part B: Zakat Authorisation & Wakalah Undertaking',
      titleHi: 'Zakat Authorisation & Wakalah Undertaking (10 अनिवार्य शर्तें)',
      titleEn: 'Zakat Authorisation & Wakalah Undertaking (10 Compulsory Clauses)',
      summaryHi: 'दाता द्वारा MFCT को अपनी ज़कात का वकील नियुक्त करने का कानूनी एवं शरीअती प्रारूप तथा 10 महत्वपूर्ण नियम।',
      summaryEn: 'Legal & Shariah undertaking signed by the donor authorizing MFCT as Wakīl, with 10 strict operational conditions.',
    },
    {
      id: 'part-c',
      partCode: 'C',
      category: 'accounting',
      badgeHi: 'भाग–C : ज़कात फंड की Accounting व्यवस्था',
      badgeEn: 'Part C: Zakat Fund Accounting & Ledger Framework',
      titleHi: 'MFCT Zakat Fund का अलग Ledger व Audit व्यवस्था',
      titleEn: 'MFCT Zakat Fund Ledger & Transparent Audit Record Keeping',
      summaryHi: 'Donor ID से लेकर Beneficiary ID, पात्रता सत्यापन, माध्यम और शेष राशि तक 12-बिंदु लेखा प्रणाली। सहीह बुखारी 1500 की मिसाल।',
      summaryEn: '12-point tracking audit from Donor ID to Beneficiary verification, payout medium and balance. Bukhari 1500 model.',
    },
    {
      id: 'part-d',
      partCode: 'D',
      category: 'undertakings',
      badgeHi: 'भाग–D : ज़कात के लाभार्थी की घोषणा',
      badgeEn: 'Part D: Zakat Beneficiary Declaration',
      titleHi: 'Zakat Beneficiary Declaration (पात्रता सत्यापन एवं घोषणा)',
      titleEn: 'Zakat Beneficiary Declaration (Eligibility KYC & Self-Attestation)',
      summaryHi: 'लाभार्थी द्वारा आय, आवश्यक खर्च, आवास और परिवार संख्या की लिखित घोषणा एवं सत्यापन प्रक्रिया।',
      summaryEn: 'Beneficiary attestation of household income, essential living costs, housing condition and distress verification.',
    },
    {
      id: 'part-e',
      partCode: 'E',
      category: 'principles',
      badgeHi: 'भाग–E : फ़ितरा / सदक़ा-ए-फ़ित्र',
      badgeEn: 'Part E: Fitra / Sadaqah-e-Fitr Policy',
      titleHi: 'सदक़ा-ए-फ़ित्र की अनिवार्यता एवं MFCT Fitra Fund',
      titleEn: 'Compulsory Nature of Sadaqah-e-Fitr & The Dedicated MFCT Fitra Fund',
      summaryHi: 'ईद की नमाज़ से पहले अदा करने की नीति (सहीह बुखारी 1503) और फ़ितरा को सामान्य दान से पूर्णतः अलग रखने का नियम।',
      summaryEn: 'Disbursement prior to Eid prayer (Sahih al-Bukhari 1503) and strict segregation of Fitra from general donations.',
    },
    {
      id: 'part-f',
      partCode: 'F',
      category: 'principles',
      badgeHi: 'भाग–F : सामान्य सदक़ा',
      badgeEn: 'Part F: General Nafl Sadaqah Policy',
      titleHi: 'सामान्य नफ़्ल सदक़ा एवं उद्देश्य-आधारित सामाजिक कार्य',
      titleEn: 'General Voluntary Sadaqah & Cause-Specific Community Aid',
      summaryHi: 'भोजन, शिक्षा, चिकित्सा और आपदा राहत में सदक़ा का उपयोग। दाता के विशिष्ट उद्देश्य का पूर्ण सम्मान।',
      summaryEn: 'Application of voluntary charity in food, healthcare, education and disaster relief, honoring donor specifications.',
    },
    {
      id: 'part-g',
      partCode: 'G',
      category: 'undertakings',
      badgeHi: 'भाग–G : सामान्य Donation Undertaking',
      badgeEn: 'Part G: General Donation Authorisation',
      titleHi: 'General Donation Authorisation एवं 11 अनुमत सेवा क्षेत्र',
      titleEn: 'General Donation Authorisation & 11 Permissible Welfare Domains',
      summaryHi: 'गरीब परिवार, शिक्षा, चिकित्सा, विधवा सहायता, अनाथ बच्चे, बेटी निकाह और अंतिम संस्कार सहायता के लिए प्रारूप।',
      summaryEn: 'Authorized format covering poor families, education, healthcare, widows, orphans, daughter nikah, and janazah aid.',
    },
    {
      id: 'part-h',
      partCode: 'H',
      category: 'accounting',
      badgeHi: 'भाग–H : फंड पृथक्करण नियम',
      badgeEn: 'Part H: Fund Segregation & Transfer Rules',
      titleHi: 'चार स्वतंत्र श्रेणियां (Zakat, Fitra, Sadaqah, General Donation)',
      titleEn: 'Four Segregated Financial Ledgers & Zero Unauthorized Inter-Fund Transfers',
      summaryHi: 'चार अलग-अलग बैंक/लेखा खाते। एक फंड से दूसरे फंड में बिना शरीअती आधार के हस्तांतरण पर पूर्ण प्रतिबंध।',
      summaryEn: 'Four completely distinct bank/ledger categories. Complete prohibition on cross-fund transfers without Shariah basis.',
    },
    {
      id: 'part-i',
      partCode: 'I',
      category: 'principles',
      badgeHi: 'भाग–I : कर्मचारियों एवं ट्रस्टियों के लिए विशेष नियम',
      badgeEn: 'Part I: Special Rules for Employees & Trustees',
      titleHi: 'ट्रस्टी व कर्मचारियों के खर्चों पर प्रतिबंध एवं “आमिलीन” की स्थिति',
      titleEn: 'Prohibition of Administrative Usage & Shariah Status of "Amilīn"',
      summaryHi: 'ज़कात से ट्रस्टी, कर्मचारी, प्रचार, वेबसाइट व कार्यालय खर्च पूर्णतः प्रतिबंधित। मुफ्ती की लिखित शरीअती राय अनिवार्य।',
      summaryEn: 'Zero Zakat funds for trustees, staff salaries, advertisement, websites or rent. Written fatwa required regarding Amilīn.',
    },
    {
      id: 'part-j',
      partCode: 'J',
      category: 'principles',
      badgeHi: 'भाग–J : भाषा एवं शब्दावली में सावधानियां',
      badgeEn: 'Part J: Precise Language & Jurisprudential Precautions',
      titleHi: 'दाता की घोषणा में “मालिकाना हक़” बनाम “वकील/अमीन” का अंतर',
      titleEn: 'Prohibited "Ownership Transfer" vs. Prescribed "Wakalah" Terminology',
      summaryHi: '❌ पूर्ण मालिकाना हक़ वाली भाषा का निषेध। ✅ वकील/अमीन की अधिकृत शरीअती भाषा। सहीह मुस्लिम 1074a (बरीरा رضي الله عنها)।',
      summaryEn: '❌ Prohibition of unrestricted proprietary terms. ✅ Correct Wakīl authorization. Sahih Muslim 1074a precedence.',
    },
    {
      id: 'part-k',
      partCode: 'K',
      category: 'undertakings',
      badgeHi: 'भाग–K : MFCT Zakat Receipt Format',
      badgeEn: 'Part K: Official Zakat Receipt Format',
      titleHi: 'आधिकारिक Zakat Receipt प्रारूप (Reg. No. 258/2026 & 301/2026)',
      titleEn: 'Official Zakat Receipt Format with Donor Declaration & Authentication',
      summaryHi: 'UPI, बैंक ट्रांसफर, चेक व नकद के लिए शरीअती डिक्लेरेशन युक्त आधिकारिक रसीद प्रारूप।',
      summaryEn: 'Standardized receipt with purpose declaration, multi-mode payment checkboxes, and authorized signatory.',
    },
    {
      id: 'hadith-citations',
      partCode: 'REF',
      category: 'hadith',
      badgeHi: 'शरीअती आधार : हदीस संदर्भ',
      badgeEn: 'Shariah Foundation: Hadith Citations',
      titleHi: 'नीति का निर्माण करने वाली 6 सबसे महत्वपूर्ण हदीसें',
      titleEn: 'The 6 Primary Prophetic Hadiths Governing MFCT Policy',
      summaryHi: 'सहीह बुखारी 1395, 1500, 1503, 1490, सहीह मुस्लिम 1074a, सुनन अबी दाऊद 1635।',
      summaryEn: 'Sahih al-Bukhari 1395, 1500, 1503, 1490; Sahih Muslim 1074a; Sunan Abi Dawood 1635.',
    },
  ], []);

  // Filtered sections by Tab, Category, and Search
  const filteredSections = useMemo(() => {
    return sectionsData.filter((item) => {
      // Tab filter
      if (activeTab === 'principles' && item.category !== 'principles') return false;
      if (activeTab === 'undertakings' && item.category !== 'undertakings') return false;
      if (activeTab === 'accounting' && item.category !== 'accounting') return false;
      if (activeTab === 'hadith' && item.category !== 'hadith') return false;

      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.titleHi.toLowerCase().includes(q) || item.titleEn.toLowerCase().includes(q);
        const matchSummary = item.summaryHi.toLowerCase().includes(q) || item.summaryEn.toLowerCase().includes(q);
        const matchBadge = item.badgeHi.toLowerCase().includes(q) || item.badgeEn.toLowerCase().includes(q);
        return matchTitle || matchSummary || matchBadge;
      }

      return true;
    });
  }, [sectionsData, activeTab, activeCategory, searchQuery]);

  const categories = [
    { id: 'all', labelHi: 'सभी (All Sections)', labelEn: 'All Sections' },
    { id: 'principles', labelHi: 'मूल शरीअत सिद्धांत', labelEn: 'Shariah Principles' },
    { id: 'undertakings', labelHi: 'फॉर्म व Undertakings', labelEn: 'Forms & Undertakings' },
    { id: 'accounting', labelHi: 'लेखा व फंड विभाजन', labelEn: 'Accounting & Ledgers' },
    { id: 'hadith', labelHi: 'हदीस संदर्भ', labelEn: 'Hadith References' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MFCT Zakat and Sadaqah Compliance Policy',
          text: 'MOHAMMAD FAEEM CHARITABLE TRUST (MFCT) — Zakat, Sadaqah-e-Fitr & Sadaqah Collection & Distribution Policy',
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isHindi ? 'लिंक कॉपी कर लिया गया है!' : 'Policy link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 pb-24">

      {/* ── 1. Grand Luxury Hero Header ── */}
      <section
        className="relative overflow-hidden text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 print:bg-white print:text-black print:pb-6"
        style={{ background: 'radial-gradient(ellipse at top, #0f3322 0%, #061910 100%)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:24px_24px] print:hidden" />

        <div className="relative max-w-7xl mx-auto text-center space-y-4">

          {/* Trust Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest shadow-md print:border-slate-800 print:text-black"
            style={{
              background: 'rgba(200,168,75,0.12)',
              border: '1.5px solid #c8a84b',
              color: '#f0c868',
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-300 print:hidden" />
            <span>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</span>
          </div>

          {/* Tagline */}
          <p className="text-base sm:text-xl font-extrabold tracking-wide" style={{ color: '#e0c068' }}>
            {isHindi ? '“याद उनकी, सेवा हमारी”' : '“In Their Memory, In Our Service”'}
          </p>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white pt-1 max-w-5xl mx-auto leading-tight print:text-black">
            {isHindi
              ? 'ज़कात, सदक़ा-ए-फ़ित्र एवं सदक़ात/दान संग्रह एवं वितरण नीति'
              : 'Zakat, Sadaqah-e-Fitr & Sadaqah/Donation Collection Policy'}
          </h1>

          {/* Subtitle / Registration Numbers */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-300 font-semibold pt-1">
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-amber-200">
              Reg. No.: 301/2026 &amp; 258/2026
            </span>
            <span className="hidden sm:inline text-amber-400">•</span>
            <span className="text-slate-200">
              {isHindi ? 'शरीअती अनुपालन एवं पारदर्शिता नीति' : 'Shariah Compliance & Transparency Framework'}
            </span>
          </div>

          <p className="max-w-3xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-normal print:text-slate-700">
            {isHindi
              ? 'कुरआन व सुन्नत के मूल सिद्धांतों, सहीह बुखारी व मुस्लिम की प्रामाणिक हदीसों पर आधारित—MFCT को ज़कात का वकील/अमीन नियुक्त करने, पारदर्शी लेखा-जोखा और पृथक फंड प्रबंधन की आधिकारिक नियमावली।'
              : 'Grounded in Quranic and Prophetic jurisprudence (Sahih al-Bukhari & Muslim)—The official regulatory framework for Wakalah appointment, segregated ledgers, and Shariah-compliant disbursement.'}
          </p>

          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-6xl mx-auto pt-6 text-left print:hidden">
            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'ज़कात फंड' : 'Zakat Fund'}
              </span>
              <span className="text-lg sm:text-xl font-black text-white block mt-0.5">
                {isHindi ? '100% शरीअती मद' : '100% Shariah Compliant'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? 'केवल योग्य मुस्तहिक़ीन तक' : 'Eligible Beneficiaries Only'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'वकील / अमीन व्यवस्था' : 'Wakalah Model'}
              </span>
              <span className="text-lg sm:text-xl font-black text-white block mt-0.5">
                {isHindi ? 'अमानत का सिद्धांत' : 'Trustee Agency'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? 'लिखित डिक्लेरेशन व ऑडिट' : 'Written Authorization & KYC'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? '4 स्वतंत्र खाते' : '4 Independent Ledgers'}
              </span>
              <span className="text-lg sm:text-xl font-black text-white block mt-0.5">
                {isHindi ? 'शून्य इंटर-ट्रांसफर' : 'Zero Cross-Mixing'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? 'Zakat, Fitra, Sadaqah, Gen' : 'Zakat, Fitra, Sadaqah, General'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'प्रशासनिक खर्च' : 'Admin Expenses'}
              </span>
              <span className="text-lg sm:text-xl font-black text-white block mt-0.5">
                {isHindi ? '0% ज़कात से व्यय' : '0% Zakat on Overhead'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? 'ट्रस्टी/स्टाफ/विज्ञापन पर रोक' : 'No Trustees / Ads / Office Rent'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Print, Share, Helpline */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/15 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHindi ? 'नीति प्रिंट करें (Print Policy)' : 'Print Compliance Policy'}</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/15 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'शेयर करें (Share)' : 'Share Policy'}</span>
            </button>
            <a
              href="tel:+918218017226"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-emerald-500/30"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
              <span>+91 82180 17226</span>
            </a>
          </div>

        </div>
      </section>

      {/* ── 2. Tab Navigation & Search Filter ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 print:hidden">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200/80 space-y-4">

          {/* Primary View Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'all', labelHi: '🌟 संपूर्ण नीति (All A–K)', labelEn: '🌟 Full Policy (A–K)' },
              { id: 'principles', labelHi: '📜 शरीअत सिद्धांत', labelEn: '📜 Shariah Principles' },
              { id: 'undertakings', labelHi: '📋 फॉर्म व डिक्लेरेशन', labelEn: '📋 Forms & Undertakings' },
              { id: 'accounting', labelHi: '⚖️ लेजर व फंड विभाजन', labelEn: '⚖️ Ledger & Accounts' },
              { id: 'hadith', labelHi: '📖 हदीस संदर्भ', labelEn: '📖 Hadith Citations' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center text-center cursor-pointer border ${activeTab === tab.id
                    ? 'bg-[#0a2e1d] text-[#e0c068] border-[#c8a84b] shadow-md scale-[1.02]'
                    : 'bg-[#f8faf9] text-slate-700 border-slate-200 hover:bg-[#ebf3ef]'
                  }`}
              >
                <span>{isHindi ? tab.labelHi : tab.labelEn}</span>
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Live Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? 'खोजें (उदा. 1395, वकील, आमिल, Undertaking, बरीरा)...' : 'Search policy (e.g. 1395, Wakalah, Amil, Ledger)...'}
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a2e1d] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${activeCategory === cat.id
                      ? 'bg-[#0a2e1d] text-[#e0c068] shadow-sm'
                      : 'bg-[#ebf3ef] text-[#2c4035] hover:bg-[#deede5]'
                    }`}
                >
                  {isHindi ? cat.labelHi : cat.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Status Badge */}
          {(searchQuery || activeCategory !== 'all' || activeTab !== 'all') && (
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-1">
              <span>
                {isHindi
                  ? `कुल ${filteredSections.length} अनुभाग प्रदर्शित हो रहे हैं`
                  : `Showing ${filteredSections.length} matching sections`}
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setActiveTab('all');
                }}
                className="text-emerald-700 hover:underline text-[11px] font-bold cursor-pointer"
              >
                {isHindi ? 'फ़िल्टर हटाएं (Reset)' : 'Reset Filters'}
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ── 3. Main Policy Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">

        {/* ══════════════════════════════════════════════════════════════
            PART A : मूल शरीअती सिद्धांत
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-a')) && (
          <section id="part-a" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? 'भाग–A : मूल शरीअती सिद्धांत' : 'Part A: Core Shariah Principles'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Clause A.1 &amp; A.2</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
              {isHindi ? 'मूल शरीअती सिद्धांत एवं MFCT की भूमिका' : 'Core Shariah Principles & The Role of MFCT'}
            </h2>

            {/* A.1 Purpose */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#0a2e1d] text-[#e0c068] font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {isHindi ? 'ज़कात का उद्देश्य (Purpose of Zakat)' : 'Purpose of Zakat'}
                </h3>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed space-y-2 pl-9">
                <p>
                  {isHindi
                    ? 'MFCT द्वारा प्राप्त ज़कात की राशि केवल उन व्यक्तियों/मदों तक पहुँचाई जाएगी जो शरीअत के अनुसार ज़कात के हकदार हों।'
                    : 'All Zakat funds received by MFCT shall be disbursed exclusively to individuals and categories entitled to Zakat under Islamic Shariah.'}
                </p>

                {/* Hadith Callout Box */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs sm:text-sm font-medium space-y-1.5 my-2">
                  <div className="font-bold flex items-center gap-2 text-amber-900">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>{isHindi ? 'हदीस शरीफ़ — सहीह अल-बुखारी 1395' : 'Prophetic Hadith — Sahih al-Bukhari 1395'}</span>
                  </div>
                  <p className="italic">
                    {isHindi
                      ? 'नबी ﷺ ने हज़रत मुआज़ رضي الله عنه को यमन भेजते हुए फरमाया: “यह उनके मालदारों से ली जाएगी और उनके गरीबों को दी जाएगी।”'
                      : 'The Prophet ﷺ instructed Hazrat Mu’adh ibn Jabal رضي الله عنه when sending him to Yemen: “It shall be taken from their wealthy and given to their poor.”'}
                  </p>
                </div>

                <p className="font-bold text-emerald-900">
                  {isHindi
                    ? '⚠️ इसलिए MFCT की सामान्य सामाजिक गतिविधियों और ज़कात फंड को एक ही अर्थ में नहीं माना जाएगा।'
                    : '⚠️ Therefore, MFCT’s general social/welfare activities and the Zakat Fund shall never be construed or administered as identical.'}
                </p>
              </div>
            </div>

            {/* A.2 MFCT Role */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#0a2e1d] text-[#e0c068] font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {isHindi ? 'MFCT की भूमिका (Role of MFCT as Wakīl/Amīn)' : 'MFCT’s Role as Wakīl/Amīn (Agent/Trustee)'}
                </h3>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed space-y-2 pl-9">
                <p>
                  {isHindi
                    ? 'ज़कात देने वाला व्यक्ति MFCT को अपनी ज़कात का वकील/अमीन नियुक्त कर सकता है, ताकि MFCT उसकी ओर से ज़कात की रकम को योग्य लाभार्थी तक पहुँचाए।'
                    : 'A Zakat donor may appoint MFCT as their authorized Wakīl/Amīn (agent/trustee) so that MFCT delivers the Zakat amount to Shariah-verified beneficiaries on the donor’s behalf.'}
                </p>

                {/* Hadith Callout Box */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs sm:text-sm font-medium space-y-1.5 my-2">
                  <div className="font-bold flex items-center gap-2 text-amber-900">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>{isHindi ? 'हदीस शरीफ़ — सहीह अल-बुखारी 1500' : 'Prophetic Hadith — Sahih al-Bukhari 1500'}</span>
                  </div>
                  <p className="italic">
                    {isHindi
                      ? 'नबी ﷺ ने ज़कात संग्रह के लिए कर्मचारी नियुक्त किए थे। हज़रत इब्न अल-लुत्बिया को ज़कात संग्रह का कार्य दिया गया और वापस आने पर उनका हिसाब लिया गया।'
                      : 'The Prophet ﷺ appointed personnel for Zakat collection. Hazrat Ibn al-Lutbiyyah was assigned the responsibility of collection, and an audit of account was conducted upon his return.'}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600">
                  {isHindi
                    ? 'इससे ज़कात के संग्रह और उसके हिसाब-किताब की व्यवस्था की मूल मिसाल मिलती है।'
                    : 'This sets the foundational legal precedence for structured Zakat collection, agency delegation, and strict accounting verification.'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART B : ज़कात के लिए MFCT Undertaking
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-b')) && (
          <section id="part-b" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>{isHindi ? 'भाग–B : ज़कात के लिए MFCT Undertaking' : 'Part B: Zakat Authorisation & Wakalah Undertaking'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">10 Compulsory Conditions</span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
                ZAKAT AUTHORISATION &amp; WAKALAH UNDERTAKING
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {isHindi ? 'दाता द्वारा भरा जाने वाला अधिकृत शरीअती एवं वैधानिक घोषणा पत्र' : 'Official Legal & Shariah Undertaking Executed by the Zakat Donor'}
              </p>
            </div>

            {/* Interactive Undertaking Template Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#faf8f2] to-[#f4efe4] border-2 border-[#d9c496] space-y-6 shadow-sm">

              <div className="text-center border-b border-[#d9c496]/60 pb-4 space-y-1">
                <span className="text-xs font-black text-[#855f1e] uppercase tracking-widest block">
                  MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)
                </span>
                <span className="text-sm font-black text-slate-900 block">
                  {isHindi ? 'ज़कात वकील/अमीन नियुक्ति घोषणा पत्र' : 'Official Zakat Wakalah Appointment Document'}
                </span>
              </div>

              {/* Sample Donor Details Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white/80 rounded-xl border border-[#d9c496]/50">
                  <span className="font-bold text-slate-600 block">{isHindi ? 'नाम (Donor Name):' : 'Donor Name:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-[#d9c496]/50">
                  <span className="font-bold text-slate-600 block">{isHindi ? 'पिता / पति का नाम:' : 'Father / Husband Name:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-[#d9c496]/50">
                  <span className="font-bold text-slate-600 block">{isHindi ? 'पता (Complete Address):' : 'Complete Address:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-[#d9c496]/50">
                  <span className="font-bold text-slate-600 block">{isHindi ? 'मोबाइल नंबर (Mobile No):' : 'Mobile Number:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-[#d9c496]/50">
                  <span className="font-bold text-slate-600 block">{isHindi ? 'राशि (Amount in ₹):' : 'Zakat Amount (₹):'}</span>
                  <span className="font-mono text-slate-400">₹ ________________________________________</span>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-[#d9c496]/50">
                  <span className="font-bold text-slate-600 block">{isHindi ? 'राशि शब्दों में (In Words):' : 'Amount in Words:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
              </div>

              {/* Preamble */}
              <div className="p-4 bg-white rounded-xl border border-[#d9c496]/70 text-xs sm:text-sm text-slate-800 leading-relaxed">
                <p>
                  {isHindi
                    ? '“यह घोषित करता/करती हूँ कि उपरोक्त राशि मेरी ज़कात की राशि है। मैं MOHAMMAD FAEEM CHARITABLE TRUST (MFCT) को अपनी ओर से इस राशि को वकील/अमीन के रूप में प्राप्त करने तथा शरीअत के अनुसार योग्य ज़कात लाभार्थियों तक पहुँचाने के लिए अधिकृत करता/करती हूँ।”'
                    : '“I hereby solemnly declare that the aforementioned sum constitutes my due Zakat funds. I officially authorize MOHAMMAD FAEEM CHARITABLE TRUST (MFCT) as my Wakīl/Amīn (agent/trustee) to receive this sum on my behalf and disburse it strictly to Shariah-eligible Zakat beneficiaries.”'}
                </p>
              </div>

              {/* 10 Clauses Grid */}
              <div className="space-y-2.5">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">
                  {isHindi ? 'दाता द्वारा स्वीकृत 10 अनिवार्य शर्तें (Understood & Agreed Clauses):' : 'The 10 Mandatory Undertaking Clauses:'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {[
                    {
                      num: '1',
                      hi: 'यह राशि सामान्य unrestricted donation नहीं है।',
                      en: 'This sum is not an unrestricted general donation.',
                    },
                    {
                      num: '2',
                      hi: 'MFCT इस राशि को अपनी व्यक्तिगत या सामान्य व्यावसायिक संपत्ति के रूप में उपयोग नहीं करेगा।',
                      en: 'MFCT shall never treat or utilize this sum as personal or commercial asset.',
                    },
                    {
                      num: '3',
                      hi: 'राशि का उपयोग केवल शरीअत के अनुसार योग्य ज़कात लाभार्थियों/मदों के लिए किया जाएगा।',
                      en: 'Disbursement shall strictly be confined to Shariah-verified Zakat beneficiaries.',
                    },
                    {
                      num: '4',
                      hi: 'MFCT लाभार्थी की पात्रता की निष्पक्ष जाँच कर सकता है।',
                      en: 'MFCT reserves the full mandate to verify the eligibility of each applicant.',
                    },
                    {
                      num: '5',
                      hi: 'आवश्यकता होने पर MFCT पहचान, आर्थिक स्थिति और पात्रता से संबंधित दस्तावेज माँग सकता है।',
                      en: 'MFCT may demand identity proofs, income metrics, and verification documentation.',
                    },
                    {
                      num: '6',
                      hi: 'MFCT ज़कात फंड का अलग रिकॉर्ड/लेखा (Dedicated Ledger) रखेगा।',
                      en: 'MFCT shall maintain an independent, dedicated ledger for the Zakat Fund.',
                    },
                    {
                      num: '7',
                      hi: 'मेरी ओर से MFCT को यह अधिकार होगा कि वह मेरी ज़कात को किसी उपयुक्त पात्र लाभार्थी तक पहुँचाए।',
                      en: 'MFCT is delegated full authority to select and deliver aid to deserving eligible persons.',
                    },
                    {
                      num: '8',
                      hi: 'किसी व्यक्ति को केवल “गरीब दिखने” के आधार पर ज़कात नहीं दी जाएगी; उपलब्ध जानकारी से जाँच होगी।',
                      en: 'No aid is given merely based on appearances; tangible verification is mandatory.',
                    },
                    {
                      num: '9',
                      hi: 'यदि कोई व्यक्ति ज़कात के लिए पात्र नहीं पाया जाता है तो MFCT उसे ज़कात फंड से भुगतान नहीं करेगा।',
                      en: 'If an applicant is found ineligible under Shariah, zero payment shall be made from Zakat.',
                    },
                    {
                      num: '10',
                      hi: 'प्रशासनिक/प्रचार में ज़कात तभी उपयोग होगी जब शरीअत के अनुसार स्पष्ट आधार हो और सक्षम शरीअती सलाहकार की लिखित अनुमति हो।',
                      en: 'Overheads/publicity are strictly prohibited unless authorized under written Shariah fatwa.',
                    },
                  ].map((item) => (
                    <div key={item.num} className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#0a2e1d] text-[#e0c068] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {item.num}
                      </span>
                      <p className="text-xs text-slate-700 leading-snug">
                        {isHindi ? item.hi : item.en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donor Declaration & Sign Box */}
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#c8a84b] space-y-4">
                <p className="text-xs font-semibold text-slate-800 italic">
                  {isHindi
                    ? 'दाता की घोषणा: “मैंने उपरोक्त राशि अपनी ज़कात के रूप में MFCT को बतौर वकील/अमीन सौंपने की अनुमति दी है और MFCT से अपेक्षा करता/करती हूँ कि इसे शरीअत के अनुसार हकदार तक पहुँचाया जाए।”'
                    : 'Donor Declaration: “I have entrusted the aforementioned sum as Zakat to MFCT acting as my Wakīl/Amīn, with the explicit trust that it shall be delivered strictly to entitled recipients under Shariah.”'}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-600 border-t border-slate-100">
                  <div>
                    <span>{isHindi ? 'दाता के हस्ताक्षर: ' : 'Donor Signature: '}</span>
                    <span className="border-b border-slate-400 pb-0.5 font-sans">________________________</span>
                  </div>
                  <div>
                    <span>{isHindi ? 'दिनांक: ' : 'Date: '}</span>
                    <span className="border-b border-slate-400 pb-0.5 font-sans">____ / ____ / 202___</span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART C : ज़कात फंड की Accounting व्यवस्था
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-c')) && (
          <section id="part-c" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200">
                <Banknote className="w-3.5 h-3.5 text-blue-600" />
                <span>{isHindi ? 'भाग–C : ज़कात फंड की Accounting व्यवस्था' : 'Part C: Zakat Fund Accounting & Ledger Framework'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">12 Tracking Parameters</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
                MFCT ZAKAT FUND — {isHindi ? 'अलग Ledger व पारदर्शी ऑडिट' : 'Dedicated Ledger & Audit Accountability'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {isHindi
                  ? 'MFCT में ज़कात की राशि का अलग ledger रखा जाएगा। प्रत्येक प्राप्ति (Receipt) और वितरण (Disbursement) के लिए निम्नलिखित 12 प्रविष्टियाँ दर्ज की जाती हैं:'
                  : 'An independent, segregated ledger is maintained for the MFCT Zakat Fund. Every incoming receipt and outgoing disbursement tracks 12 mandatory parameters:'}
              </p>
            </div>

            {/* 12-Point Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { labelHi: '1. Donor ID', labelEn: '1. Donor ID', descHi: 'दाता का विशिष्ट कोड', descEn: 'Unique donor identifier' },
                { labelHi: '2. प्राप्ति की तारीख', labelEn: '2. Receipt Date', descHi: 'जमा की प्रामाणिक तिथि', descEn: 'Date of receipt' },
                { labelHi: '3. प्राप्त राशि', labelEn: '3. Amount Received', descHi: 'वैध INR रकम', descEn: 'Verified amount in INR' },
                { labelHi: '4. भुगतान माध्यम', labelEn: '4. Payment Mode', descHi: 'UPI / Bank / Cheque', descEn: 'UPI / Bank / Cheque' },
                { labelHi: '5. Zakat Declaration', labelEn: '5. Zakat Declaration', descHi: 'लिखित शरीअती सहमति', descEn: 'Signed Wakalah declaration' },
                { labelHi: '6. Txn / Receipt No.', labelEn: '6. Receipt & Txn No.', descHi: 'यूनीक रसीद संख्या', descEn: 'Unique transaction number' },
                { labelHi: '7. लाभार्थी ID', labelEn: '7. Beneficiary ID', descHi: 'सत्यापित मुस्तहिक़ कोड', descEn: 'Verified beneficiary ID' },
                { labelHi: '8. पात्रता Verification', labelEn: '8. Eligibility Verification', descHi: 'शरीअती जांच रिकॉर्ड', descEn: 'Shariah compliance check' },
                { labelHi: '9. भुगतान तारीख', labelEn: '9. Disbursement Date', descHi: 'वितरण की तिथि', descEn: 'Date of disbursement' },
                { labelHi: '10. भुगतान राशि', labelEn: '10. Disbursement Amount', descHi: 'सौंपी गई रकम', descEn: 'Actual transferred amount' },
                { labelHi: '11. वितरण माध्यम', labelEn: '11. Disbursement Mode', descHi: 'सीधा बैंक / प्रत्यक्ष', descEn: 'Direct transfer / Cash with sign' },
                { labelHi: '12. शेष राशि', labelEn: '12. Fund Balance', descHi: 'पारदर्शी क्लोजिंग बैलेंस', descEn: 'Audited running balance' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors">
                  <span className="text-xs font-black text-slate-900 block">
                    {isHindi ? item.labelHi : item.labelEn}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    {isHindi ? item.descHi : item.descEn}
                  </span>
                </div>
              ))}
            </div>

            {/* Hadith Citation on Record Keeping */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-950 space-y-1">
                <span className="font-black text-amber-900 block">
                  {isHindi ? 'शरीअती मिसाल — सहीह अल-बुखारी 1500:' : 'Shariah Precedence — Sahih al-Bukhari 1500:'}
                </span>
                <p>
                  {isHindi
                    ? '“नबी ﷺ द्वारा नियुक्त ज़कात संग्रहकर्ता से वापस आने पर पाई-पाई का हिसाब लिया गया था। इससे accountability और record keeping की महत्वपूर्ण मिसाल मिलती है।”'
                    : '“The Prophet ﷺ took a strict, line-by-line accounting from the appointed Zakat collector upon his return. This establishes the profound importance of absolute accountability, transparency, and audit record-keeping.”'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART D : ज़कात के लाभार्थी की घोषणा
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-d')) && (
          <section id="part-d" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-900 border border-rose-200">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>{isHindi ? 'भाग–D : ज़कात के लाभार्थी की घोषणा' : 'Part D: Zakat Beneficiary Declaration'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Beneficiary KYC Form</span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
                ZAKAT BENEFICIARY DECLARATION
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {isHindi ? 'सहायता प्राप्त करने वाले लाभार्थी का सत्यापन एवं स्व-घोषणा पत्र' : 'Verification and Self-Declaration Undertaken by the Zakat Recipient'}
              </p>
            </div>

            {/* Official Beneficiary Form Template Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#fbfdfc] to-[#f2f7f4] border-2 border-[#b5d6c5] space-y-6 shadow-sm">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">{isHindi ? 'नाम (Beneficiary Name):' : 'Beneficiary Name:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">{isHindi ? 'पिता / पति का नाम:' : 'Father / Husband Name:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">{isHindi ? 'पता (Full Residential Address):' : 'Residential Address:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">{isHindi ? 'परिवार के सदस्यों की संख्या:' : 'Family Members Count:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">{isHindi ? 'मासिक अनुमानित आय (Monthly Income):' : 'Estimated Monthly Income:'}</span>
                  <span className="font-mono text-slate-400">₹ ________________________________________</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">{isHindi ? 'मासिक आवश्यक खर्च (Essential Expenses):' : 'Monthly Essential Living Expenses:'}</span>
                  <span className="font-mono text-slate-400">₹ ________________________________________</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">{isHindi ? 'आवास स्थिति (Housing):' : 'Housing Status:'}</span>
                  <span className="text-slate-600 font-semibold">{isHindi ? 'किराये का ☐ / स्वयं का ☐ / अन्य ☐' : 'Rented ☐ / Owned ☐ / Other ☐'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">{isHindi ? 'कोई विशेष आर्थिक समस्या / बीमारी:' : 'Special Economic Distress / Chronic Ailment:'}</span>
                  <span className="font-mono text-slate-400">__________________________________________</span>
                </div>
              </div>

              {/* Beneficiary Attestation */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2">
                <p className="font-medium">
                  {isHindi
                    ? '“यह घोषणा करता/करती हूँ कि मैं आर्थिक रूप से जरूरतमंद हूँ और MFCT द्वारा माँगी गई जानकारी मेरे ज्ञान के अनुसार सही है। मैं समझता/समझती हूँ कि MFCT मेरी जानकारी की निष्पक्ष जाँच कर सकता है।”'
                    : '“I solemnly attest that I am genuinely in financial distress and qualified under Shariah for Zakat relief. The information supplied to MFCT is accurate to the best of my knowledge. I fully acknowledge that MFCT reserves the right to verify my eligibility.”'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-600 border-t border-slate-200">
                <div>
                  <span>{isHindi ? 'लाभार्थी हस्ताक्षर / अंगूठा: ' : 'Beneficiary Signature / Thumb Impression: '}</span>
                  <span className="border-b border-slate-400 pb-0.5 font-sans">________________________</span>
                </div>
                <div>
                  <span>{isHindi ? 'दिनांक: ' : 'Date: '}</span>
                  <span className="border-b border-slate-400 pb-0.5 font-sans">____ / ____ / 202___</span>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART E : फ़ितरा / सदक़ा-ए-फ़ित्र
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-e')) && (
          <section id="part-e" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-900 border border-purple-200">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>{isHindi ? 'भाग–E : फ़ितरा / सदक़ा-ए-फ़ित्र' : 'Part E: Fitra / Sadaqah-e-Fitr Policy'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">MFCT Fitra Fund</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
              {isHindi ? 'सदक़ा-ए-फ़ित्र की अनिवार्यता एवं MFCT Fitra Fund' : 'Mandatory Sadaqah-e-Fitr & Dedicated Fitra Fund'}
            </h2>

            <div className="text-sm text-slate-700 leading-relaxed space-y-3">
              <p>
                {isHindi
                  ? 'MFCT फ़ितरा को भी पूर्णतः अलग रिकॉर्ड और अलग बैंक/लेजर खाते में रखेगा।'
                  : 'MFCT shall maintain Fitra collections in a completely segregated record and dedicated ledger.'}
              </p>

              {/* Hadith Box */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs sm:text-sm font-medium space-y-1.5 my-2">
                <div className="font-bold flex items-center gap-2 text-amber-900">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>{isHindi ? 'हदीस शरीफ़ — सहीह अल-बुखारी 1503' : 'Prophetic Hadith — Sahih al-Bukhari 1503'}</span>
                </div>
                <p className="italic">
                  {isHindi
                    ? '“नबी ﷺ ने सदक़ा-ए-फ़ित्र को मुसलमानों पर अनिवार्य किया और उसे ईद की नमाज़ से पहले अदा करने का आदेश दिया।” — किताबुज़-ज़कात, बाब सदक़तुल-फ़ित्र।'
                    : '“The Prophet ﷺ enjoined the payment of Sadaqah-e-Fitr upon Muslims and ordered that it be paid before the people proceed to perform the Eid prayer.” — Book of Zakat, Chapter on Sadaqat-ul-Fitr.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-purple-950 text-xs sm:text-sm space-y-2">
                <p className="font-bold text-purple-900">
                  {isHindi ? 'MFCT की आधिकारिक नीति:' : 'Official MFCT Fitra Policy:'}
                </p>
                <p>
                  {isHindi
                    ? 'फ़ितरा प्राप्त होने पर उसे सामान्य donation में मिलाकर unrestricted fund नहीं माना जाएगा। इसके लिए अलग “MFCT FITRA FUND” बनाया गया है, जिसकी राशि को ईद से पूर्व पात्र जरूरतमंदों तक पहुँचाया जाना सुनिश्चित किया जाता है।'
                    : 'Fitra funds collected shall never be pooled into general donations or unrestricted reserves. It is maintained exclusively under the “MFCT FITRA FUND”, strictly targeted for disbursement to eligible needy souls before the Eid prayer.'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART F : सामान्य सदक़ा
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-f')) && (
          <section id="part-f" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-50 text-teal-900 border border-teal-200">
                <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                <span>{isHindi ? 'भाग–F : सामान्य सदक़ा (Voluntary Sadaqah)' : 'Part F: General Voluntary Sadaqah'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">MFCT Sadaqah Fund</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
              {isHindi ? 'सामान्य नफ़्ल सदक़ा एवं उद्देश्य-आधारित उपयोग' : 'Voluntary Nafl Sadaqah & Purpose-Based Execution'}
            </h2>

            <div className="text-sm text-slate-700 leading-relaxed space-y-3">
              <p>
                {isHindi
                  ? 'सामान्य नफ़्ल सदक़ा के लिए अलग व्यवस्था होगी। दाता लिख सकता है:'
                  : 'A dedicated operational mechanism governs general voluntary (Nafl) Sadaqah. A donor may execute the following undertaking:'}
              </p>

              {/* Donor Authorisation Quote */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 text-xs sm:text-sm font-medium italic">
                {isHindi
                  ? '“मैं यह राशि अपनी स्वेच्छा से MFCT को सदक़ा के रूप में देता/देती हूँ और Trust को अधिकृत करता/करती हूँ कि इसे अपने निर्धारित सामाजिक एवं मानवीय उद्देश्यों के अनुसार जरूरतमंदों की सहायता, भोजन, शिक्षा, चिकित्सा, आपदा राहत तथा अन्य जायज़ सामाजिक कार्यों में उपयोग करे।”'
                  : '“I voluntarily grant this sum to MFCT as Sadaqah and authorize the Trust to disburse it across its prescribed social and humanitarian objectives, including aid for the poor, food distribution, education, healthcare, disaster relief, and other legitimate welfare initiatives.”'}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600">
                <span className="font-bold text-slate-900 block mb-1">
                  {isHindi ? 'विशिष्ट उद्देश्य का सम्मान:' : 'Honoring Donor Earmarks:'}
                </span>
                <p>
                  {isHindi
                    ? 'इसमें ज़कात जैसी विशिष्ट पाबंदी नहीं होगी, लेकिन दाता ने यदि कोई विशेष उद्देश्य निर्धारित किया है (जैसे विशेष चिकित्सा या भोजन), तो Trust उस उद्देश्य का पूर्ण सम्मान करेगा।'
                    : 'While free from the strict technical exclusions of obligatory Zakat, whenever a donor stipulates an earmarked cause (e.g., medical surgery or food packets), MFCT strictly honors and executes that specific intent.'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART G : सामान्य Donation Undertaking
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-g')) && (
          <section id="part-g" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200">
                <Heart className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? 'भाग–G : सामान्य Donation Undertaking' : 'Part G: General Donation Authorisation'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">11 Charitable Domains</span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
                GENERAL DONATION AUTHORISATION
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {isHindi ? 'ट्रस्ट के सामाजिक एवं मानवीय कार्यों के लिए सामान्य दान प्राधिकरण' : 'General Donation Authorization Form for Trust Humanitarian Works'}
              </p>
            </div>

            {/* Template Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#fbfdfc] to-[#f3f9f6] border-2 border-emerald-200 space-y-6">

              <div className="p-4 bg-white rounded-xl border border-emerald-100 text-xs sm:text-sm text-slate-800 leading-relaxed">
                <p>
                  {isHindi
                    ? 'मैं, नाम: __________________________, MFCT को ₹________________ की राशि सामान्य donation के रूप में स्वेच्छा से प्रदान करता/करती हूँ। मैं MFCT को यह अधिकार देता/देती हूँ कि Trust की नीतियों, Trust Deed और लागू कानून के अनुसार इस राशि को सामाजिक एवं मानवीय कार्यों में उपयोग करे।'
                    : 'I, Name: __________________________, voluntarily contribute the sum of ₹________________ to MFCT as general donation. I authorize MFCT to utilize this sum for humanitarian and community welfare purposes in accordance with Trust Policies, Trust Deed, and prevailing laws.'}
                </p>
              </div>

              {/* 11 Permissible Domains */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  {isHindi ? 'संभावित कार्य एवं अनुमत सेवा क्षेत्र (11 Permissible Welfare Heads):' : '11 Permissible Welfare Areas:'}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                  {[
                    { hi: 'गरीब एवं जरूरतमंद परिवार', en: 'Poor & Destitute Families' },
                    { hi: 'शिक्षा एवं छात्रवृत्ति', en: 'Education & Scholarships' },
                    { hi: 'चिकित्सा व दवाई सहायता', en: 'Medical & Hospital Aid' },
                    { hi: 'भोजन व राशन वितरण', en: 'Food & Ration Relief' },
                    { hi: 'आपदा राहत एवं बचाव', en: 'Disaster Relief & Rescue' },
                    { hi: 'विधवा व असहाय सहायता', en: 'Widows & Vulnerable Women' },
                    { hi: 'अनाथ बच्चों की सहायता', en: 'Orphan Child Welfare' },
                    { hi: 'बेटी निकाह सहायता', en: 'Daughter Marriage Support' },
                    { hi: 'आकस्मिक पारिवारिक सहायता', en: 'Emergency Bereavement Aid' },
                    { hi: 'अंतिम संस्कार/जनाज़ा सहायता', en: 'Janazah & Funeral Logistics' },
                    { hi: 'अन्य वैध सामाजिक कार्य', en: 'Other Lawful Social Works' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center gap-2 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800">{isHindi ? item.hi : item.en}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-600 border-t border-emerald-100">
                <div>
                  <span>{isHindi ? 'दाता के हस्ताक्षर: ' : 'Donor Signature: '}</span>
                  <span className="border-b border-slate-400 pb-0.5 font-sans">________________________</span>
                </div>
                <div>
                  <span>{isHindi ? 'दिनांक: ' : 'Date: '}</span>
                  <span className="border-b border-slate-400 pb-0.5 font-sans">____ / ____ / 202___</span>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART H : ज़कात और सामान्य Donation को मिलाने का नियम
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-h')) && (
          <section id="part-h" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-900 border border-indigo-200">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isHindi ? 'भाग–H : फंड पृथक्करण नियम' : 'Part H: Fund Segregation & Transfer Rules'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">4 Distinct Categories</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
              {isHindi ? 'MFCT Accounting में चार अलग-अलग Categories' : 'Four Segregated Financial Categories in MFCT Accounting'}
            </h2>

            {/* 4 Categories Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#0a2e1d] text-[#e0c068]">
                    <th className="p-4 font-black uppercase tracking-wider w-1/3">Fund Category</th>
                    <th className="p-4 font-black uppercase tracking-wider">
                      {isHindi ? 'अधिकृत उपयोग (Authorised Application)' : 'Authorized Application'}
                    </th>
                    <th className="p-4 font-black uppercase tracking-wider w-1/4">Shariah Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-black text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      Zakat Fund
                    </td>
                    <td className="p-4">
                      {isHindi ? 'शरीअत के अनुसार ज़कात के पात्र लाभार्थी (मसा़रिफ़-ए-ज़कात)' : 'Strictly Shariah-verified Zakat beneficiaries (Masaarif-uz-Zakat)'}
                    </td>
                    <td className="p-4 text-xs text-emerald-800 font-bold">100% Restricted</td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-black text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                      Fitra Fund
                    </td>
                    <td className="p-4">
                      {isHindi ? 'शरीअत के अनुसार फ़ितरा के पात्र लाभार्थी (ईद से पूर्व वितरण)' : 'Eligible Fitra beneficiaries (Distributed before Eid Salah)'}
                    </td>
                    <td className="p-4 text-xs text-purple-800 font-bold">Time &amp; Recipient Restricted</td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-black text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                      Sadaqah Fund
                    </td>
                    <td className="p-4">
                      {isHindi ? 'सामान्य सदक़ा के निर्धारित सामाजिक व राहत कार्य' : 'Prescribed social relief & voluntary charity programs'}
                    </td>
                    <td className="p-4 text-xs text-teal-800 font-bold">Cause-Specific Allocation</td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-black text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      General Donation Fund
                    </td>
                    <td className="p-4">
                      {isHindi ? 'Trust Deed के अनुमत सामाजिक, मानवीय व संचालन कार्य' : 'Trust permitted social, humanitarian and operational works'}
                    </td>
                    <td className="p-4 text-xs text-blue-800 font-bold">General Permissible Pool</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Zero Inter-fund Transfer Golden Rule */}
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-900 text-sm sm:text-base">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <span>{isHindi ? 'महत्वपूर्ण शरीअती नियम (Strict Segregation Rule):' : 'Golden Rule of Fund Separation:'}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold">
                {isHindi
                  ? '“एक Fund की राशि को दूसरे Fund में बिना उचित शरीअती/प्रशासनिक आधार के transfer नहीं किया जाएगा।”'
                  : '“Funds belonging to one category shall NEVER be transferred or inter-mixed with another fund category without valid Shariah justification and audited administrative approval.”'}
              </p>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART I : MFCT के कर्मचारियों/ट्रस्टियों के लिए विशेष नियम
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-i')) && (
          <section id="part-i" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-900 border border-red-200">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>{isHindi ? 'भाग–I : कर्मचारियों व ट्रस्टियों के नियम' : 'Part I: Rules for Employees & Trustees'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Strict Overhead Protection</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
              {isHindi ? 'ज़कात राशि के उपयोग पर पूर्ण प्रतिबंध' : 'Absolute Restrictions on Administrative Consumption of Zakat'}
            </h2>

            <div className="text-sm text-slate-700 leading-relaxed space-y-3">
              <p className="font-bold text-slate-900">
                {isHindi
                  ? 'ज़कात की रकम को MFCT के निम्नलिखित मदों में स्वतः खर्च नहीं किया जाएगा:'
                  : 'Zakat funds shall strictly NEVER be consumed for the following administrative or promotional heads:'}
              </p>

              {/* Badges of prohibited expenses */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Founder',
                  'Trustee',
                  'Chairman',
                  'Secretary',
                  'Treasurer',
                  isHindi ? 'सामान्य कर्मचारी वेतन' : 'General Staff Salary',
                  isHindi ? 'Office Expenses / किराया' : 'Office Expenses / Rent',
                  isHindi ? 'विज्ञापन (Advertisement)' : 'Advertisement & Publicity',
                  isHindi ? 'वेबसाइट विकास' : 'Website Development',
                  isHindi ? 'मोबाइल ऐप विकास' : 'Mobile App Development',
                  isHindi ? 'सामान्य प्रचार' : 'General Promotion',
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200"
                  >
                    <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>

              {/* Shariah Analysis on Amileen */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <BookOpen className="w-4 h-4 text-[#0a2e1d]" />
                  <span>
                    {isHindi ? '“आमिलीन अलैहा” (Zakat Administrators) के संबंध में शरीअती स्थिति:' : 'Shariah Jurisprudence on "Amilīn \'Alayhā" (Zakat Collectors):'}
                  </span>
                </div>

                <p className="text-slate-700">
                  {isHindi
                    ? 'हालाँकि शरीअत में “आमिलीन अलैहा” अर्थात ज़कात संग्रह/प्रबंधन से संबंधित एक श्रेणी का उल्लेख मिलता है; हदीस में भी ज़कात संग्रह करने वाले कर्मचारी का उल्लेख है (सहीह बुखारी 1500 और सुनन अबी दाऊद 1635 में ज़कात संग्रहकर्ता के संबंध में चर्चा मिलती है)।'
                    : 'While Islamic jurisprudence recognizes “Amilīn \'Alayhā” (the category of designated Zakat administrators/collectors) and Prophetic Hadiths document collectors (Sahih al-Bukhari 1500 and Sunan Abi Dawood 1635):'}
                </p>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold">
                  {isHindi
                    ? '⚠️ लेकिन MFCT के निजी कर्मचारी या ट्रस्टी अपने-आप “आमिलीन” नहीं बन जाते। इसलिए इस हिस्से को स्थानीय मुफ़्ती से लिखित शरीअती राय लेकर ही लागू करना अनिवार्य होगा।'
                    : '⚠️ Private employees or Trustees of MFCT do NOT automatically qualify as “Amilīn”. Any allocation under this head is completely suspended unless explicit written fatwa is granted by qualified local Muftis.'}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART J : दाता को “मालिकाना हक़” वाली भाषा में क्या नहीं लिखना चाहिए
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-j')) && (
          <section id="part-j" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                <span>{isHindi ? 'भाग–J : भाषा एवं शब्दावली में सावधानियां' : 'Part J: Precise Language & Precautions'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Wakalah vs. Ownership</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
              {isHindi ? 'दाता को “मालिकाना हक़” वाली भाषा में क्या नहीं लिखना चाहिए' : 'Prohibited vs. Prescribed Language for Zakat Donors'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prohibited */}
              <div className="p-5 rounded-2xl bg-red-50/70 border-2 border-red-200 space-y-3">
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <X className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{isHindi ? '❌ यह वाक्य कदापि न लिखें:' : '❌ Strictly Prohibited Phrase:'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-red-200 text-xs sm:text-sm text-red-950 italic">
                  {isHindi
                    ? '“मैं अपनी ज़कात MFCT को पूर्ण मालिकाना हक़ से देता हूँ और अब Trust इसे अपनी मर्जी से किसी भी कार्य में खर्च कर सकता है।”'
                    : '“I give my Zakat to MFCT with complete proprietary ownership, and the Trust is free to spend it on any work at its sole discretion.”'}
                </div>
                <p className="text-xs text-red-700 font-medium">
                  {isHindi
                    ? 'कारण: ऐसा लिखने से ज़कात की विशिष्ट शरीअती पाबंदी समाप्त होने का भ्रम होता है, जो कि नाजायज़ है।'
                    : 'Reason: Absolute ownership phrases violate the restricted nature of Zakat and undermine Wakalah.'}
                </p>
              </div>

              {/* Prescribed */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{isHindi ? '✅ इसके बजाय यह अधिकृत वाक्य लिखें:' : '✅ Prescribed Authentic Wakalah Formulation:'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-medium">
                  {isHindi
                    ? '“मैं MFCT को अपनी ज़कात का वकील/अमीन नियुक्त करता/करती हूँ ताकि मेरी ओर से यह राशि शरीअत के अनुसार उसके हकदारों तक पहुँचाई जाए।”'
                    : '“I appoint MFCT as the Wakīl/Amīn (agent/trustee) of my Zakat so that this sum is delivered to its entitled beneficiaries under Shariah on my behalf.”'}
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  {isHindi
                    ? 'लाभ: यह वाक्य शरीअती और वैधानिक दोनों दृष्टिकोणों से पूर्णतः प्रामाणिक और दोषमुक्त है।'
                    : 'Benefit: This strictly preserves the fiduciary agency relationship under Islamic jurisprudence.'}
                </p>
              </div>
            </div>

            {/* Precedence of Barirah Hadith */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-[#0a2e1d] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">
                  {isHindi ? 'शरीअती उदाहरण — सहीह मुस्लिम 1074a (हज़रत बरीरा رضي الله عنها):' : 'Precedent from Sahih Muslim 1074a (Hazrat Barirah رضي الله عنها):'}
                </span>
                <p>
                  {isHindi
                    ? '“सहीह मुस्लिम की हदीस में यह बात सामने आती है कि जब सदक़ा किसी पात्र व्यक्ति के कब्ज़े (Tamleek) में पहुँच गया तो उसकी स्थिति बदल गई—हज़रत बरीरा رضي الله عنها को दी गई सदक़े की चीज़ के बारे में नबी ﷺ ने फरमाया कि वह उसके लिए सदक़ा और दूसरे के लिए हदिया (उपहार) है।”'
                    : '“The Hadith in Sahih Muslim illustrates that when charity takes possession in the hands of an eligible beneficiary (Tamleek), its legal character transforms—regarding meat given as charity to Barirah رضي الله عنها, the Prophet ﷺ stated: ‘It is charity for her and a gift for us.’”'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PART K : MFCT का Zakat Receipt Format
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'part-k')) && (
          <section id="part-k" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>{isHindi ? 'भाग–K : MFCT Zakat Receipt Format' : 'Part K: Official Zakat Receipt Template'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Reg. No. 258/2026 &amp; 301/2026</span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
                MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)
              </h2>
              <p className="text-xs font-extrabold text-[#c8a84b]">
                {isHindi ? 'याद उनकी, सेवा हमारी' : 'Yaad Unki, Seva Hamari'} • Reg. No. 258/2026 / 301/2026
              </p>
            </div>

            {/* Official Receipt Simulation Card */}
            <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#fffefc] to-[#f9f7f0] border-2 border-[#c8a84b] shadow-lg space-y-6">

              <div className="border-b-2 border-[#c8a84b]/40 pb-4 text-center space-y-1">
                <span className="text-xs font-black tracking-widest text-[#0a2e1d] uppercase block">
                  OFFICIAL ZAKAT RECEIPT
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Receipt No.: MFCT-ZKT-2026-XXXX
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-800">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span className="font-bold text-slate-600">{isHindi ? 'दाता का नाम (Donor Name):' : 'Donor Name:'}</span>
                  <span className="font-mono text-slate-500">_________________________________</span>
                </div>

                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span className="font-bold text-slate-600">{isHindi ? 'प्राप्त राशि (Amount):' : 'Amount in INR:'}</span>
                  <span className="font-mono font-bold text-emerald-800">₹ _____________________________</span>
                </div>

                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span className="font-bold text-slate-600">{isHindi ? 'उद्देश्य (Purpose):' : 'Purpose:'}</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-black text-xs">
                    ☑ Zakat
                  </span>
                </div>

                {/* Payment Mode Checkboxes */}
                <div className="border-b border-dashed border-slate-200 pb-2.5">
                  <span className="font-bold text-slate-600 block mb-1.5">{isHindi ? 'भुगतान माध्यम (Payment Mode):' : 'Payment Mode:'}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
                    <span className="flex items-center gap-1.5">☐ UPI</span>
                    <span className="flex items-center gap-1.5">☐ Bank Transfer</span>
                    <span className="flex items-center gap-1.5">☐ Cheque</span>
                    <span className="flex items-center gap-1.5">☐ Cash (as per law)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span className="font-bold text-slate-600">{isHindi ? 'दिनांक (Date):' : 'Date:'}</span>
                  <span className="font-mono text-slate-500">____ / ____ / 202___</span>
                </div>
              </div>

              {/* Receipt Declaration */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] sm:text-xs text-amber-950 italic text-center">
                {isHindi
                  ? '“यह राशि दाता द्वारा ज़कात के रूप में MFCT को बतौर वकील/अमीन सौंपने हेतु दी गई है। MFCT इसे अपनी शरीअती नीति के अनुसार योग्य लाभार्थियों तक पहुँचाने का प्रयास करेगा।”'
                  : '“This sum has been entrusted by the donor to MFCT as Wakīl/Amīn for Zakat disbursement. MFCT undertakes to deliver it strictly to Shariah-eligible beneficiaries.”'}
              </div>

              <div className="pt-3 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">{isHindi ? 'कार्यालय मुहर' : 'Official Seal'}</span>
                  <div className="w-16 h-16 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                    MFCT SEAL
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-mono text-slate-400 pb-1">_________________________</div>
                  <span className="font-bold text-slate-900 block">Authorized Signatory</span>
                  <span className="text-[10px] text-slate-500 block">MOHAMMAD FAEEM CHARITABLE TRUST</span>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            FOUNDATIONAL HADITH REFERENCES (सबसे महत्वपूर्ण शरीअती आधार)
        ══════════════════════════════════════════════════════════════ */}
        {(filteredSections.some(s => s.id === 'hadith-citations')) && (
          <section id="hadith-citations" className="bg-white rounded-3xl p-6 sm:p-9 shadow-md border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>{isHindi ? 'शरीअती आधार : हदीस संदर्भ' : 'Foundational Shariah References: Hadith Citations'}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">6 Primary Citations</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#0a2e1d]">
                {isHindi ? 'MFCT की पूरी व्यवस्था के 6 मूल शरीअती आधार' : 'The 6 Primary Hadiths Establishing MFCT Compliance'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {isHindi
                  ? 'MFCT की पूरी व्यवस्था के पीछे कम-से-कम ये हदीसें आधिकारिक रिकॉर्ड में रखी गई हैं:'
                  : 'The operational and Shariah framework of MFCT is anchored upon the following primary authentic Hadith references:'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  num: '1',
                  refHi: 'सहीह बुखारी 1395',
                  refEn: 'Sahih al-Bukhari 1395',
                  hi: 'ज़कात मालदारों से लेकर गरीबों को देने का स्पष्ट नबवी निर्देश।',
                  en: 'Mandate to collect Zakat from the wealthy and distribute among their poor.',
                },
                {
                  num: '2',
                  refHi: 'सहीह बुखारी 1500',
                  refEn: 'Sahih al-Bukhari 1500',
                  hi: 'नबी ﷺ द्वारा ज़कात संग्रहकर्ता नियुक्त करना और वापस आने पर उसका पाई-पाई हिसाब लेना।',
                  en: 'Prophetic appointment of Zakat collectors and rigorous auditing upon return.',
                },
                {
                  num: '3',
                  refHi: 'सहीह बुखारी 1503',
                  refEn: 'Sahih al-Bukhari 1503',
                  hi: 'सदक़ा-ए-फ़ित्र की अनिवार्यता और ईद की नमाज़ से पहले अदा करने का आदेश।',
                  en: 'Obligation of Sadaqah-e-Fitr and mandatory disbursement prior to Eid prayer.',
                },
                {
                  num: '4',
                  refHi: 'सहीह मुस्लिम 1074a',
                  refEn: 'Sahih Muslim 1074a',
                  hi: 'सदक़े की वस्तु पात्र व्यक्ति के कब्ज़े (Tamleek) में आने के बाद उसकी स्थिति का उदाहरण (हज़रत बरीरा رضي الله عنها)।',
                  en: 'Status transformation of charity upon physical possession by eligible recipient (Barirah رضي الله عنها).',
                },
                {
                  num: '5',
                  refHi: 'सुनन अबी दाऊद 1635',
                  refEn: 'Sunan Abi Dawood 1635',
                  hi: 'ज़कात संग्रह करने वाले व्यक्ति के संबंध में “आमिल” का उल्लेख और उसकी शर्तें।',
                  en: 'Jurisprudence governing the category and criteria of "Amil" (Zakat collector).',
                },
                {
                  num: '6',
                  refHi: 'सहीह बुखारी 1490',
                  refEn: 'Sahih al-Bukhari 1490',
                  hi: 'नबी ﷺ ने दिए हुए सदक़े को वापस लेने से मना किया (अल्लाह के नाम दिए दान की पवित्रता)।',
                  en: 'Prohibition against reclaiming charity given for the sake of Allah.',
                },
              ].map((item) => (
                <div key={item.num} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#0a2e1d] text-[#e0c068] font-black text-xs flex items-center justify-center shrink-0">
                    {item.num}
                  </span>
                  <div className="space-y-1">
                    <span className="font-black text-xs sm:text-sm text-slate-900 block">
                      {isHindi ? item.refHi : item.refEn}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isHindi ? item.hi : item.en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            THE THREE PILLARS SUMMARY (तीन अनिवार्य आधार)
        ══════════════════════════════════════════════════════════════ */}
        <section
          className="rounded-3xl p-7 sm:p-10 text-white shadow-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a2e1d 0%, #124029 60%, #061910 100%)',
            border: '2px solid #c8a84b',
          }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#e0c068] block">
              {isHindi ? 'शरीअती एवं प्रशासनिक स्पष्टता' : 'SHARIAH & AUDIT FOUNDATION'}
            </span>

            <h3 className="text-xl sm:text-3xl font-black text-white">
              {isHindi ? 'MFCT के तीन प्रमुख Undertaking स्तम्भ' : 'The Three Core Undertaking Pillars of MFCT'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-200">
              {isHindi
                ? 'और बैंक/अकाउंटिंग में भी Zakat, Fitra और General Donation की अलग पहचान रखें। इससे शरीअती और प्रशासनिक दोनों स्तर पर व्यवस्था काफी स्पष्ट रहेगी।'
                : 'Maintaining strict segregation across Zakat, Fitra, and General Donation ledgers guarantees flawless compliance at both Shariah and statutory audit levels.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs font-bold text-slate-100">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1 text-left">
                <span className="text-[#f5d77f] font-black text-sm block">① Zakat Wakalah Undertaking</span>
                <span className="text-slate-300 block text-[11px]">
                  {isHindi ? 'दाता से लिखित अमानत व एजेंसी अधिकार' : 'Written fiduciary mandate from the donor'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1 text-left">
                <span className="text-[#f5d77f] font-black text-sm block">② Fitra Wakalah Undertaking</span>
                <span className="text-slate-300 block text-[11px]">
                  {isHindi ? 'ईद से पूर्व वितरण का विशिष्ट संकल्प' : 'Pre-Eid distribution covenant'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1 text-left">
                <span className="text-[#f5d77f] font-black text-sm block">③ General Donation Undertaking</span>
                <span className="text-slate-300 block text-[11px]">
                  {isHindi ? 'मानवीय व सामाजिक कार्यों के लिए सहमति' : 'Humanitarian welfare mandate'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            GRAND CLOSING PLEDGE & CONTACT
        ══════════════════════════════════════════════════════════════ */}
        <section
          className="rounded-3xl p-7 sm:p-10 text-white shadow-xl text-center space-y-5 relative overflow-hidden print:hidden"
          style={{
            background: 'radial-gradient(ellipse at center, #0f2d1e 0%, #04120b 100%)',
            border: '2px solid #c8a84b',
          }}
        >
          <span className="text-xs font-bold tracking-widest uppercase text-[#e0c068] block">
            {isHindi ? 'MFCT का शरीअती संकल्प' : 'MFCT SOLEMN COMPLIANCE PLEDGE'}
          </span>

          <p className="text-xl sm:text-3xl font-black text-white">
            {isHindi ? 'MFCT का संकल्प है:' : 'The solemn pledge of MFCT:'}{' '}
            <span className="text-[#f5d77f]">
              {isHindi ? 'अमानत में खयानत नहीं, हकदार तक पूरा हक।' : 'Zero breach of trust, 100% aid to the rightful.'}
            </span>
          </p>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isHindi
              ? 'मरहूम मोहम्मद फ़ईम साहब की याद में स्थापित यह ट्रस्ट शरीअत के उसूलों और मानवीय संवेदनाओं के साथ आपकी ज़कात और सदक़ात को उसके वास्तविक हकदारों तक पहुँचाने के लिए वचनबद्ध है।'
              : 'Established in the cherished memory of Marhoom Mohammad Faeem Sahab, MFCT is steadfastly dedicated to delivering your Zakat and Sadaqat to genuine beneficiaries in full compliance with Islamic Shariah.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/918218017226"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isHindi ? 'WhatsApp शरीअत डेस्क से संपर्क करें' : 'Contact Shariah Helpdesk'}</span>
            </a>
            <a
              href="tel:+918218017226"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-black transition-all border border-white/20"
            >
              <PhoneCall className="w-4 h-4 text-amber-300" />
              <span>+91 82180 17226</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-400 tracking-widest pt-2">
            MOHAMMAD FAEEM CHARITABLE TRUST (MFCT) • Reg. No. 258/2026 &amp; 301/2026 • {isHindi ? '“याद उनकी, सेवा हमारी”' : '“In Their Memory, In Our Service”'}
          </p>
        </section>

      </main>

    </div>
  );
};
