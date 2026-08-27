'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  HeartHandshake,
  Users,
  Coins,
  Heart,
  Scale,
  Building2,
  FileCheck,
  Award,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  ArrowLeft,
  Printer,
  Sparkles,
  PhoneCall,
  UserCheck,
  Landmark,
  MessageCircle,
  Share2,
  Lock,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppState } from '../providers/AppStateProvider';

interface RuleSection {
  id: string;
  number: number | string;
  category: 'about' | 'membership' | 'aid' | 'org' | 'ethics' | 'pledge';
  title: {
    hi: string;
    en: string;
    ur: string;
  };
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  content: {
    hi: React.ReactNode;
    en: React.ReactNode;
    ur: React.ReactNode;
  };
}

export const RulesPage: React.FC = () => {
  const router = useRouter();
  const { language, t, isHindi } = useLanguage();
  const { handleOpenRegister, handleOpenDonate } = useAppState();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const tr = (hiText: string, urText: string, enText: string) => {
    if (language === 'hi') return hiText;
    if (language === 'ur') return urText;
    return enText;
  };

  const categories = [
    { id: 'all', label: tr('सभी नियम एवं धाराएं', 'تمام قواعد و دفعات', 'All Rules & Sections') },
    { id: 'membership', label: tr('सदस्यता व ₹100 सहयोग', 'رکنیت و ₹100 تعاون', 'Membership & ₹100 Support') },
    { id: 'aid', label: tr('निधन व विवाह सहायता', 'امداد و تعاون اسکیمیں', 'Aid & Assistance Schemes') },
    { id: 'org', label: tr('संगठन व पदाधिकारी', 'تنظیم و عہدیداران', 'Organization & Governance') },
    { id: 'ethics', label: tr('आचार संहिता व नियम', 'ضابطہ اخلاق و شفافیت', 'Code of Conduct & Ethics') },
    { id: 'pledge', label: tr('मूल सिद्धांत व संकल्प', 'بنیادی اصول و عہد', 'Core Philosophy & Pledge') },
  ];

  const sections: RuleSection[] = [
    {
      id: 'preamble',
      number: 'प्रस्तावना',
      category: 'about',
      title: {
        hi: 'प्रस्तावना (Preamble)',
        en: 'Preamble',
        ur: 'تمہید و پس منظر'
      },
      icon: Sparkles,
      content: {
        hi: (
          <div className="space-y-4">
            <p className="leading-relaxed">
              मोहम्मद फ़ईम चैरिटेबल ट्रस्ट (MFCT) का उद्देश्य <strong>मरहूम मोहम्मद फ़ईम साहब</strong> की याद को समाजसेवा, मानवीय सहयोग और जनकल्याण के स्थायी प्रयासों से जोड़ना है।
            </p>
            <p className="leading-relaxed">
              ट्रस्ट का मूल विचार है कि कठिन परिस्थितियों में कोई परिवार स्वयं को अकेला और असहाय महसूस न करे तथा समाज के लोग आपसी सहयोग, भाईचारे और इंसानियत की भावना से जरूरतमंदों के साथ खड़े हों।
            </p>
            <div className="p-4 rounded-xl border flex items-center gap-3" style={{ background: 'rgba(200,168,75,0.08)', borderColor: 'rgba(200,168,75,0.3)' }}>
              <span className="text-2xl">🕊️</span>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">MFCT का मूल मंत्र:</p>
                <p className="text-base font-extrabold" style={{ color: 'var(--mfct-gold)' }}>“याद उनकी, सेवा हमारी।”</p>
              </div>
            </div>
          </div>
        ),
        en: (
          <div className="space-y-4">
            <p className="leading-relaxed">
              The objective of Mohammad Faeem Charitable Trust (MFCT) is to dedicate the cherished memory of <strong>Marhoom Mohammad Faeem Sahab</strong> to sustainable social service, humanitarian solidarity, and community empowerment.
            </p>
            <p className="leading-relaxed">
              The foundational ethos of the Trust is that during times of acute distress, no family should feel abandoned or helpless. Society members unite with mutual compassion, brotherhood, and human dignity.
            </p>
            <div className="p-4 rounded-xl border flex items-center gap-3" style={{ background: 'rgba(200,168,75,0.08)', borderColor: 'rgba(200,168,75,0.3)' }}>
              <span className="text-2xl">🕊️</span>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">MFCT Core Motto:</p>
                <p className="text-base font-extrabold" style={{ color: 'var(--mfct-gold)' }}>“In Their Memory, Our Service” (याद उनकी, सेवा हमारी)</p>
              </div>
            </div>
          </div>
        ),
        ur: (
          <div className="space-y-4 text-right" dir="rtl">
            <p className="leading-relaxed">
              محمد فہیم چیریٹیبل ٹرسٹ (MFCT) کا بنیادی مقصد <strong>مرحوم محمد فہیم صاحب</strong> کی یاد کو فلاحی خدمات، انسانی ہمدردی اور عوامی بہبود کی پائیدار کوششوں سے جوڑنا ہے۔
            </p>
            <p className="leading-relaxed">
              ٹرسٹ کا بنیادی نظریہ یہ ہے کہ کٹھن اور نازک حالات میں کوئی بھی خاندان خود کو تنہا اور بے یار و مددگار نہ سمجھے، اور معاشرے کے باضمیر افراد اخوت اور انسانیت کے تحت ضرورت مندوں کے ساتھ شانہ بشانہ کھڑے ہوں۔
            </p>
            <div className="p-4 rounded-xl border flex items-center justify-between gap-3" style={{ background: 'rgba(200,168,75,0.08)', borderColor: 'rgba(200,168,75,0.3)' }}>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">MFCT کا بنیادی منشور:</p>
                <p className="text-base font-extrabold" style={{ color: 'var(--mfct-gold)' }}>“یاد ان کی، خدمت ہماری”</p>
              </div>
              <span className="text-2xl">🕊️</span>
            </div>
          </div>
        )
      }
    },
    {
      id: 'sec-1',
      number: 1,
      category: 'about',
      title: {
        hi: '1. नाम एवं पहचान',
        en: '1. Name & Legal Identity',
        ur: '1. نام اور قانونی شناخت'
      },
      icon: Landmark,
      content: {
        hi: (
          <ol className="list-decimal pl-5 space-y-2">
            <li>संस्था का नाम <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong> होगा।</li>
            <li>संस्था एक सामाजिक एवं जनकल्याणकारी ट्रस्ट के रूप में कार्य करेगी।</li>
            <li>संस्था का संचालन उसके Trust Deed, लागू कानूनों तथा समय-समय पर स्वीकृत नियमों के अनुसार किया जाएगा।</li>
          </ol>
        ),
        en: (
          <ol className="list-decimal pl-5 space-y-2">
            <li>The official name of the organization shall be <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong>.</li>
            <li>The institution operates as a registered non-profit social and public charitable trust.</li>
            <li>All Trust governance and operations strictly adhere to its registered Trust Deed, Indian laws, and ratified operational bylaws.</li>
          </ol>
        ),
        ur: (
          <ol className="list-decimal pr-5 space-y-2 text-right" dir="rtl">
            <li>ادارے کا باضابطہ نام <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong> ہوگا۔</li>
            <li>ادارہ ایک غیر منافع بخش سماجی اور عوامی فلاحی ٹرسٹ کے طور پر کام کرے گا۔</li>
            <li>ٹرسٹ کا نظم و نسق ٹرسٹ ڈیڈ، ملکی قوانین اور باضابطہ منظور شدہ قواعد کے مطابق چلایا جائے گا۔</li>
          </ol>
        )
      }
    },
    {
      id: 'sec-2',
      number: 2,
      category: 'about',
      title: {
        hi: '2. मुख्य उद्देश्य (Core Objectives)',
        en: '2. Core Objectives & Mission',
        ur: '2. بنیادی مقاصد اور اہداف'
      },
      icon: HeartHandshake,
      content: {
        hi: (
          <div>
            <p className="mb-3 font-semibold text-slate-700 dark:text-slate-300">MFCT के प्रमुख 12 उद्देश्य निम्न होंगे:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                '1. जरूरतमंद परिवारों की सहायता करना।',
                '2. आकस्मिक निधन की स्थिति में पात्र सदस्य के परिवार के लिए सामूहिक सहयोग का प्रयास करना।',
                '3. पात्र सदस्य की बेटी के विवाह में सामूहिक आर्थिक सहयोग का प्रयास करना।',
                '4. शिक्षा के क्षेत्र में जरूरतमंद विद्यार्थियों की सहायता करना।',
                '5. स्वास्थ्य एवं चिकित्सा सहायता उपलब्ध कराने का प्रयास करना।',
                '6. गरीब, असहाय एवं जरूरतमंद लोगों की सहायता करना।',
                '7. भोजन, वस्त्र, राहत सामग्री एवं आवश्यक वस्तुओं का वितरण करना।',
                '8. महिलाओं एवं बेटियों के कल्याण तथा सशक्तिकरण के लिए कार्य करना।',
                '9. युवाओं को सामाजिक सेवा से जोड़ना।',
                '10. समाज में आपसी सहयोग, भाईचारा और मानवता की भावना को मजबूत करना।',
                '11. प्राकृतिक आपदा, दुर्घटना अथवा अन्य कठिन परिस्थितियों में यथासंभव राहत कार्य करना।',
                '12. डिजिटल एवं पारदर्शी सामाजिक सहायता व्यवस्था विकसित करना।',
              ].map((obj, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        ),
        en: (
          <div>
            <p className="mb-3 font-semibold text-slate-700 dark:text-slate-300">The 12 primary foundational objectives of MFCT are:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                '1. Provide essential direct relief to impoverished and distressed families.',
                '2. Mobilize collective community aid for the family in case of an eligible member’s sudden demise.',
                '3. Mobilize collective economic support for the wedding of an eligible member’s daughter.',
                '4. Deliver educational aid, scholarships, and resources to deserving students.',
                '5. Facilitate hospital care, emergency treatments, and medical relief.',
                '6. Uplift destitutes, orphans, widows, and vulnerable citizens.',
                '7. Distribute food rations, clothing, emergency relief kits, and necessities.',
                '8. Work towards women’s safety, welfare, self-reliance, and empowerment.',
                '9. Engage youth positively in grassroots social and humanitarian service.',
                '10. Strengthen community brotherhood, mutual solidarity, and humanitarian values.',
                '11. Deploy rapid emergency relief during natural disasters, accidents, and crises.',
                '12. Pioneer a 100% digital, audited, and transparent crowdfunding ecosystem.',
              ].map((obj, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        ),
        ur: (
          <div dir="rtl" className="text-right">
            <p className="mb-3 font-semibold text-slate-700 dark:text-slate-300">MFCT کے 12 بنیادی مقاصد درج ذیل ہیں:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                '1. مستحق اور غریب خاندانوں کی براہ راست امداد کرنا۔',
                '2. فعال ممبر کے ناگہانی انتقال پر اس کے پس ماندگان کے لیے اجتماعی امداد فراہم کرنا۔',
                '3. مستحق ممبر کی بیٹی کی شادی میں اجتماعی مالی تعاون فراہم کرنا۔',
                '4. تعلیم کے میدان میں نادار اور لائق طلبہ کی فیس و کتب سے مدد کرنا۔',
                '5. علاج معالجہ اور ہنگامی طبی امداد کی سہولیات فراہم کرنا۔',
                '6. بیواؤں، یتیموں، معذوروں اور بے سہارا افراد کی کفالت کرنا۔',
                '7. راشن، کپڑے، امدادی اشیاء اور ضروری سازوسامان تقسیم کرنا۔',
                '8. خواتین اور بیٹیوں کی خود کفالت اور فلاح کے لیے کام کرنا۔',
                '9. نوجوانوں کو سماجی خدمت اور فلاحی کاموں سے جوڑنا۔',
                '10. باہمی اخوت، یکجہتی اور انسانیت کے جذبے کو فروغ دینا۔',
                '11. قدرتی آفات اور حادثات کے وقت ہنگامی ریلیف کیمپ چلانا۔',
                '12. ڈیجیٹل اور 100 فیصد شفاف سماجی تعاون کا نظام قائم کرنا۔',
              ].map((obj, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )
      }
    },
    {
      id: 'sec-3',
      number: 3,
      category: 'membership',
      title: {
        hi: '3. सदस्यता (Membership)',
        en: '3. Membership Guidelines',
        ur: '3. رکنیت کے اصول'
      },
      icon: UserCheck,
      content: {
        hi: (
          <ol className="list-decimal pl-5 space-y-2">
            <li>ट्रस्ट द्वारा निर्धारित पात्रता पूरी करने वाला कोई भी नागरिक सदस्य बन सकता है।</li>
            <li>सदस्यता पूर्णतः स्वैच्छिक होगी।</li>
            <li>प्रत्येक सदस्य को ट्रस्ट की वर्तमान नियमावली एवं संबंधित योजनाओं के नियमों को स्वीकार करना होगा।</li>
            <li>सदस्यता का रिकॉर्ड डिजिटल/लिखित रूप में सुरक्षित रखा जाएगा।</li>
            <li>प्रत्येक सदस्य को अपनी व्यक्तिगत जानकारी, मोबाइल नंबर, पता तथा नॉमिनी संबंधी विवरण सत्य और अद्यतन रखना अनिवार्य होगा।</li>
          </ol>
        ),
        en: (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Any citizen fulfilling the eligibility criteria established by the Trust may enroll as a member.</li>
            <li>Membership is entirely voluntary and community-driven.</li>
            <li>Every member must accept and abide by the Trust’s current bylaws and operational scheme regulations.</li>
            <li>Membership records and digital ID cards are maintained transparently on our verified database.</li>
            <li>Members are required to maintain accurate personal KYC, contact numbers, residential address, and nominee details.</li>
          </ol>
        ),
        ur: (
          <ol className="list-decimal pr-5 space-y-2 text-right" dir="rtl">
            <li>ٹرسٹ کی مقرر کردہ شرائط پر پورا اترنے والا کوئی بھی شہری رکن بن سکتا ہے۔</li>
            <li>رکنیت مکمل طور پر رضاکارانہ ہے۔</li>
            <li>ہر رکن کو ٹرسٹ کے باضابطہ قوانین اور متعلقہ اسکیموں کے اصول تسلیم کرنے ہوں گے۔</li>
            <li>رکنیت کا ریکارڈ ڈیجیٹل اور تصدیق شدہ طریقے سے محفوظ رکھا جائے گا۔</li>
            <li>ہر ممبر کو اپنی ذاتی معلومات، فون نمبر، پتہ اور نامزد وارث (Nominee) کی تفصیلات درست رکھنا لازمی ہے۔</li>
          </ol>
        )
      }
    },
    {
      id: 'sec-4',
      number: 4,
      category: 'membership',
      title: {
        hi: '4. वार्षिक व्यवस्था संचालन सहयोग (₹100 Annual Support)',
        en: '4. Annual Operational System Support (₹100 Contribution)',
        ur: '4. سالانہ تنظیمی و انتظامی تعاون (₹100)'
      },
      icon: Coins,
      content: {
        hi: (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <p className="font-extrabold text-amber-600 dark:text-amber-400 text-sm sm:text-base">
                ₹100 — “वार्षिक व्यवस्था संचालन सहयोग”
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                MFCT में ₹100 को सहायता के बदले शुल्क, बीमा प्रीमियम या लाभ खरीदने की राशि <strong>नहीं</strong> माना जाएगा। इसे केवल <strong>“वार्षिक व्यवस्था संचालन सहयोग”</strong> के रूप में रखा जाएगा।
              </p>
            </div>
            <p className="text-xs sm:text-sm">
              इसका उद्देश्य ट्रस्ट की प्रशासनिक, तकनीकी एवं सामाजिक व्यवस्था को सुचारु रूप से चलाने में सहयोग करना है। इस राशि का उपयोग आवश्यकतानुसार निम्न कार्यों में किया जा सकता है:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                'कार्यालय संचालन',
                'वेबसाइट एवं ऐप सिस्टम',
                'डिजिटल सर्वर व सुरक्षा',
                '24/7 हेल्पलाइन व संचार',
                'दस्तावेजीकरण व ऑडिट',
                'सदस्य व आईडी रिकॉर्ड',
                'प्रचार-प्रसार व जागरूकता',
                'फील्ड वेरिफिकेशन खर्च',
                'सामाजिक व जनहित गतिविधियाँ'
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  ✓ {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              ⚠️ ₹100 का वार्षिक सहयोग देने मात्र से किसी व्यक्ति को किसी निश्चित आर्थिक सहायता की गारंटी नहीं होगी।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <p className="font-extrabold text-amber-600 dark:text-amber-400 text-sm sm:text-base">
                ₹100 — “Annual Operational Support Contribution”
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                In MFCT, ₹100 is strictly <strong>NOT</strong> an insurance premium, fee for aid, or purchase of benefits. It is classified solely as an <strong>Annual Operational & Administrative Support Contribution</strong>.
              </p>
            </div>
            <p className="text-xs sm:text-sm">
              Its purpose is to sustainably maintain the Trust’s administrative, cloud, and field infrastructure:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                'Office & Administration',
                'Website & Mobile Portal',
                'Digital Servers & Security',
                '24/7 Helpline Support',
                'Documentation & Legal Audits',
                'Verified Member ID Database',
                'Public Awareness Drives',
                'On-site Field Verifications',
                'Relief & Welfare Operations'
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  ✓ {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              ⚠️ Contribution of the ₹100 annual support fee does not constitute any guarantee or entitlement to a fixed monetary payout.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-4 text-right" dir="rtl">
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <p className="font-extrabold text-amber-600 dark:text-amber-400 text-sm sm:text-base">
                ₹100 — “سالانہ انتظامی و تنظیمی تعاون”
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                MFCT میں ₹100 کو کوئی کمرشل فیس، انشورنس پریمیم یا مالی منافع خریدنے کی رقم <strong>نہیں</strong> سمجھا جائے گا۔ یہ صرف ٹرسٹ کے انتظام و انصرام کا سالانہ تعاون ہے۔
              </p>
            </div>
            <p className="text-xs sm:text-sm">
              یہ رقم ٹرسٹ کے دفتری اخراجات، آن لائن پورٹل، ہیلپ لائن، تصدیق اور فلاحی خدمات کو فعال رکھنے میں خرچ کی جاتی ہے:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                'دفتری اخراجات',
                'ویب سائٹ اور ایپ سرورز',
                'ڈیجیٹل سیکیورٹی',
                '24/7 ہیلپ لائن اور مواصلات',
                'دستاویزات اور آڈٹ',
                'ممبر ریکارڈ و کارڈ سسٹم',
                'عوامی آگاہی مہمات',
                'میدانی تصدیق کے اخراجات',
                'فلاحی و ریلیف سرگرمیاں'
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  ✓ {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              ⚠️ ₹100 کا سالانہ تعاون ادا کرنے سے کسی بھی مقررہ مالی ادائیگی یا انشورنس کا کوئی قانونی دعویٰ پیدا نہیں ہوتا۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-5',
      number: 5,
      category: 'aid',
      title: {
        hi: '5. आकस्मिक निधन सहायता व्यवस्था (Bereavement Solidarity)',
        en: '5. Emergency Bereavement Solidarity Assistance',
        ur: '5. ناگہانی انتقال پر ہنگامی امدادی نظام'
      },
      icon: Heart,
      content: {
        hi: (
          <div className="space-y-3">
            <p>
              यदि किसी सक्रिय एवं वैधानिक सदस्य का आकस्मिक निधन होता है और वह संबंधित योजना की सभी पात्रता शर्तें पूरी करता है, तो MFCT अपने सदस्यों से सामूहिक आर्थिक सहयोग का आह्वान कर सकता है।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">सदस्य सहयोग:</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">न्यूनतम ₹100</p>
                <p className="text-[11px] text-slate-500 mt-1">प्रत्येक पात्र सदस्य से न्यूनतम ₹100 का सहयोग निर्धारित किया जा सकता है।</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">संभावित सहायता लक्ष्य:</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">₹20–25 लाख तक</p>
                <p className="text-[11px] text-slate-500 mt-1">सदस्य संख्या एवं वास्तविक सहयोग पर निर्भर (कम या अधिक हो सकती है)।</p>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              * यह सामूहिक सहयोग का अनुमानित लक्ष्य है, कोई निश्चित लाभ या बीमा गारंटी नहीं।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-3">
            <p>
              Upon the sudden demise of an active, verified member fulfilling all scheme bylaws, MFCT issues a collective appeal to the member community.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Member Solidarity Contribution:</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">Min. ₹100</p>
                <p className="text-[11px] text-slate-500 mt-1">Requested from each active, participating member.</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Potential Collective Target:</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">Approx. ₹20–25 Lakh</p>
                <p className="text-[11px] text-slate-500 mt-1">Actual aid directly reflects member turnout and actual transfers.</p>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              * This is an estimated collective community goal, not a guaranteed contractual insurance benefit.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-3 text-right" dir="rtl">
            <p>
              اگر کسی فعال اور تصدیق شدہ ممبر کا ناگہانی انتقال ہو جائے اور وہ اسکیم کی تمام شرائط پوری کرتا ہو، تو MFCT تمام ممبران سے اجتماعی امداد کی اپیل جاری کرتا ہے۔
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">فی ممبر تعاون:</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">کم از کم ₹100</p>
                <p className="text-[11px] text-slate-500 mt-1">ہر فعال ممبر سے اپیل کی جائے گی۔</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">امکانی اجتماعی امداد:</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">تقریباً ₹20 تا 25 لاکھ</p>
                <p className="text-[11px] text-slate-500 mt-1">حتمی رقم ممبران کی کل تعداد اور حقیقی ادائیگی پر منحصر ہوگی۔</p>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              * یہ باہمی تعاون کا ایک ہدف ہے، کوئی انشورنس یا مقررہ منافع کا معاہدہ نہیں۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-6',
      number: 6,
      category: 'aid',
      title: {
        hi: '6. बेटी विवाह सहायता व्यवस्था (Daughter’s Wedding Support)',
        en: '6. Daughter’s Marriage Solidarity Assistance',
        ur: '6. بیٹی کی شادی کے لیے اجتماعی تعاون'
      },
      icon: HeartHandshake,
      content: {
        hi: (
          <div className="space-y-3">
            <p>
              किसी पात्र एवं सक्रिय सदस्य की बेटी के विवाह के अवसर पर MFCT सामूहिक सहयोग अभियान चला सकता है।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
                <p className="text-xs font-bold text-purple-800 dark:text-purple-300">सदस्य सहयोग:</p>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">न्यूनतम ₹50</p>
                <p className="text-[11px] text-slate-500 mt-1">प्रत्येक पात्र सदस्य से न्यूनतम ₹50 का स्वैच्छिक सहयोग।</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">संभावित सहायता लक्ष्य:</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">₹8–10 लाख तक</p>
                <p className="text-[11px] text-slate-500 mt-1">सदस्य संख्या एवं वास्तविक सहयोग पर निर्भर (कम या अधिक हो सकती है)।</p>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              * यह भी अनुमानित/संभावित राशि है, निश्चित या गारंटीकृत सहायता नहीं।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-3">
            <p>
              On the auspicious occasion of an eligible, active member’s daughter’s wedding, MFCT launches a grassroots collective solidarity campaign.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
                <p className="text-xs font-bold text-purple-800 dark:text-purple-300">Member Solidarity Contribution:</p>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">Min. ₹50</p>
                <p className="text-[11px] text-slate-500 mt-1">Voluntary micro-donation from each active member.</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Potential Collective Target:</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">Approx. ₹8–10 Lakh</p>
                <p className="text-[11px] text-slate-500 mt-1">Directly dependent on member strength and participation.</p>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              * Estimated community target, not an automatic guarantee.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-3 text-right" dir="rtl">
            <p>
              کسی مستحق اور فعال ممبر کی بیٹی کے نکاح و شادی کے موقع پر MFCT اجتماعی فلاحی مہم چلائے گا۔
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
                <p className="text-xs font-bold text-purple-800 dark:text-purple-300">فی ممبر تعاون:</p>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">کم از کم ₹50</p>
                <p className="text-[11px] text-slate-500 mt-1">تمام فعال اراکین سے اپیل کی جائے گی۔</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">امکانی اجتماعی ہدف:</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">تقریباً ₹8 تا 10 لاکھ</p>
                <p className="text-[11px] text-slate-500 mt-1">حتمی رقم کل شرکت کرنے والے ممبران کی تعداد پر منحصر ہوگی۔</p>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              * یہ ممکنہ اجتماعی ہدف ہے، کوئی لازمی یا گارنٹی شدہ ادائیگی نہیں۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-7',
      number: 7,
      category: 'aid',
      title: {
        hi: '7. सहायता प्राप्त करने की पात्रता',
        en: '7. Assistance Eligibility Factors',
        ur: '7. امداد کی اہلیت کے اصول'
      },
      icon: FileCheck,
      content: {
        hi: (
          <div>
            <p className="mb-2">किसी भी सहायता के लिए निम्न 10 मुख्य बिंदुओं पर विचार किया जाएगा:</p>
            <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm">
              <li>सदस्य की वैधानिक स्थिति (सत्यापित KYC)।</li>
              <li>सदस्यता की निरंतर अवधि।</li>
              <li>संबंधित योजना की विशिष्ट पात्रता शर्तें।</li>
              <li>पूर्व के अभियानों में सदस्य की नियमित भागीदारी।</li>
              <li>निर्धारित लॉक-इन अवधि का पूर्ण होना।</li>
              <li>सदस्य द्वारा ट्रस्ट के नियमों व आचार संहिता का पालन।</li>
              <li>प्रामाणिक आवश्यक दस्तावेज जमा होना।</li>
              <li>घटना अथवा दावे का भौतिक सत्यापन (Ground Verification)।</li>
              <li>नॉमिनी की वैधानिक वैधता।</li>
              <li>ट्रस्ट की उपलब्ध व्यवस्था एवं समय-समय पर लागू नियम।</li>
            </ol>
          </div>
        ),
        en: (
          <div>
            <p className="mb-2">Assistance claims are evaluated against the following 10 verification parameters:</p>
            <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm">
              <li>Legal verification status (verified KYC and identity).</li>
              <li>Tenure and consistency of active membership.</li>
              <li>Specific scheme-level qualifying criteria.</li>
              <li>Past active participation in community solidarity calls.</li>
              <li>Fulfillment of the mandatory lock-in period.</li>
              <li>Adherence to Trust code of conduct and ethics.</li>
              <li>Submission of valid statutory and supporting documentation.</li>
              <li>Physical on-site fact verification by district officers.</li>
              <li>Legal validity and documentation of the registered nominee.</li>
              <li>Available Trust operational mechanisms and regulatory provisions.</li>
            </ol>
          </div>
        ),
        ur: (
          <div dir="rtl" className="text-right">
            <p className="mb-2">کسی بھی امدادی اپیل کے لیے درج ذیل 10 نکات کا جائزہ لیا جائے گا:</p>
            <ol className="list-decimal pr-5 space-y-1 text-xs sm:text-sm">
              <li>رکن کی قانونی حیثیت اور مصدقہ KYC۔</li>
              <li>رکنیت کا تسلسل اور مدت۔</li>
              <li>متعلقہ فلاحی اسکیم کی مخصوص شرائط۔</li>
              <li>ماضی کی مہمات میں ممبر کا باقاعدہ حصہ لینا۔</li>
              <li>لازمی لاک اِن مدت (Lock-in Period) کا مکمل ہونا۔</li>
              <li>ٹرسٹ کے ضوابط اور اخلاقی اصولوں کی پاسداری۔</li>
              <li>مطلوبہ اصل و مصدقہ دستاویزات کی پیشکش۔</li>
              <li>واقعہ یا دعوے کی میدانی تصدیق (Ground Verification)۔</li>
              <li>نامزد وارث (Nominee) کی قانونی حیثیت۔</li>
              <li>ٹرسٹ کا باضابطہ فیصلہ اور ضابطہ اخلاق۔</li>
            </ol>
          </div>
        )
      }
    },
    {
      id: 'sec-8',
      number: 8,
      category: 'aid',
      title: {
        hi: '8. लॉक-इन एवं पात्रता अवधि',
        en: '8. Lock-in & Qualification Period',
        ur: '8. لاک اِن اور اہلیت کی مدت'
      },
      icon: Lock,
      content: {
        hi: (
          <div className="space-y-2">
            <p>MFCT प्रत्येक योजना के लिए अलग-अलग <strong>Lock-in Period</strong> निर्धारित कर सकता है।</p>
            <p>
              लॉक-इन अवधि का उद्देश्य यह सुनिश्चित करना है कि कोई व्यक्ति केवल सहायता प्राप्त करने के उद्देश्य से तत्काल सदस्य बनकर योजना का अनुचित लाभ न उठाए और व्यवस्था का दुरुपयोग न हो।
            </p>
            <p className="text-xs text-slate-500">
              * लॉक-इन अवधि, पात्रता एवं पुनः पात्रता संबंधी विस्तृत नियम संबंधित योजना के दस्तावेज में स्पष्ट किए जाएंगे।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-2">
            <p>MFCT reserves the right to enforce specific <strong>Lock-in Periods</strong> for different welfare initiatives.</p>
            <p>
              The purpose of the lock-in period is to safeguard the community from opportunistic or fraudulent enrollments designed solely to claim immediate payouts without genuine prior solidarity.
            </p>
            <p className="text-xs text-slate-500">
              * Detailed tenure rules are clearly documented in the respective scheme guidelines.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-2 text-right" dir="rtl">
            <p>MFCT مختلف فلاحی اسکیموں کے لیے ایک لازمی <strong>لاک اِن مدت (Lock-in Period)</strong> مقرر کر سکتا ہے۔</p>
            <p>
              اس مدت کا مقصد یہ یقینی بنانا ہے کہ کوئی شخص محض فوری مالی فائدہ اٹھانے کی غرض سے عین وقت پر رکن بن کر نظام کا غلط استعمال نہ کرے۔
            </p>
            <p className="text-xs text-slate-500">
              * اسکیم کے باضابطہ قوانین میں لاک اِن کی مدت کی مکمل وضاحت فراہم کی جائے گی۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-9',
      number: 9,
      category: 'membership',
      title: {
        hi: '9. नॉमिनी व्यवस्था (Nominee Framework)',
        en: '9. Nominee Framework & Verification',
        ur: '9. نامزدگی (Nominee) کا ضابطہ'
      },
      icon: Users,
      content: {
        hi: (
          <ol className="list-decimal pl-5 space-y-2">
            <li>प्रत्येक सदस्य को अपना वैधानिक नॉमिनी घोषित करने का पूरा अधिकार होगा।</li>
            <li>सदस्य को नॉमिनी की जानकारी सही एवं हमेशा अद्यतन रखनी होगी।</li>
            <li>नॉमिनी में परिवर्तन निर्धारित प्रक्रिया व पहचान प्रमाण के अनुसार किया जा सकेगा।</li>
            <li>नॉमिनी को लेकर विवाद की स्थिति में ट्रस्ट उपलब्ध साक्ष्यों एवं लागू कानूनों के आधार पर निर्णय लेगा।</li>
            <li>आवश्यक होने पर कानूनी उत्तराधिकारी/सक्षम न्यायालय से प्रमाण पत्र मांगा जा सकता है।</li>
          </ol>
        ),
        en: (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Every verified member is provided the opportunity to declare a legal nominee.</li>
            <li>The member is solely responsible for maintaining accurate, updated nominee credentials.</li>
            <li>Nominee updates may be processed through standard KYC re-verification protocols.</li>
            <li>In case of disputed nominee claims, the Trust board decides objectively based on authenticated records and applicable law.</li>
            <li>Succession certificates or legal heir documentation from competent authorities may be requested when warranted.</li>
          </ol>
        ),
        ur: (
          <ol className="list-decimal pr-5 space-y-2 text-right" dir="rtl">
            <li>ہر ممبر کو اپنا نامزد وارث (Nominee) مقرر کرنے کا مکمل موقع دیا جائے گا۔</li>
            <li>ممبر پر لازم ہے کہ وہ نامزد فرد کی تفصیلات درست اور اپڈیٹ رکھے۔</li>
            <li>نامزدگی میں تبدیلی باضابطہ تصدیقی طریقہ کار کے تحت کی جا سکے گی۔</li>
            <li>کسی اختلاف یا نزاع کی صورت میں ٹرسٹ دستیاب قانونی ثبوتوں کی روشنی میں فیصلہ کرے گا۔</li>
            <li>ضرورت پڑنے پر مجاز عدالت یا مجاز اتھارٹی سے جانشینی سرٹیفکیٹ طلب کیا جا سکتا ہے۔</li>
          </ol>
        )
      }
    },
    {
      id: 'sec-10',
      number: 10,
      category: 'aid',
      title: {
        hi: '10. दस्तावेज एवं सत्यापन (Ground Verification)',
        en: '10. Document Submission & Field Verification',
        ur: '10. دستاویزات اور میدانی تصدیق'
      },
      icon: FileText,
      content: {
        hi: (
          <div className="space-y-3">
            <p>सहायता अभियान शुरू करने से पहले ट्रस्ट निम्न आवश्यक दस्तावेजों की मांग कर सकता है:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                'सदस्यता विवरण व आईडी',
                'मृत्यु प्रमाणपत्र (Death Cert.)',
                'आधार व पहचान पत्र',
                'नॉमिनी का बैंक खाता प्रमाण',
                'विवाह कार्ड व प्रमाण पत्र',
                'अस्पताल मेडिकल बिल्स व रिपोर्ट',
                'स्थानीय प्रधान/पार्षद सत्यापन',
                'बैंक पासबुक/कैंसिल्ड चेक'
              ].map((doc, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  📄 {doc}
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ ट्रस्ट आवश्यकता पड़ने पर जिला टीम द्वारा 100% Ground Verification भी कराएगा।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-3">
            <p>Prior to activating any collective aid drive, the Trust requires authenticated documentation:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                'Member ID & KYC Profile',
                'Official Death Certificate',
                'Aadhaar / Gov ID Proof',
                'Nominee Bank Account Proof',
                'Marriage Proof / Wedding Card',
                'Hospital / Doctor Reports',
                'Local Officer / Councillor Endorsement',
                'Cancelled Cheque / Bank Passbook'
              ].map((doc, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  📄 {doc}
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ Mandatory on-site field verification is conducted by designated district officers prior to disbursement.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-3 text-right" dir="rtl">
            <p>امداد کی مہم شروع کرنے سے قبل ٹرسٹ درج ذیل دستاویزات کا مطالبہ کرے گا:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                'ممبرشپ تفصیلات و کارڈ',
                'ڈیتھ سرٹیفکیٹ',
                'آدھار و شناختی ثبوت',
                'وارث کا مصدقہ بینک کھاتہ',
                'شادی کا کارڈ یا قانونی ثبوت',
                'طبی بل اور اسپتال رپورٹس',
                'مقامی معززین کی تصدیق',
                'بینک پاس بک یا کینسلڈ چیک'
              ].map((doc, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  📄 {doc}
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ ٹرسٹ ضلعی ٹیم کے ذریعے موقع پر جا کر 100 فیصد میدانی تصدیق (Ground Verification) انجام دے گا۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-11',
      number: 11,
      category: 'aid',
      title: {
        hi: '11. आर्थिक सहयोग की प्रक्रिया (Direct Transfer)',
        en: '11. Financial Aid Disbursement (Direct to Beneficiary)',
        ur: '11. مالی تعاون کی براہ راست منتقلی کا طریقہ'
      },
      icon: Landmark,
      content: {
        hi: (
          <div className="space-y-2">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <p className="font-extrabold text-emerald-700 dark:text-emerald-300 text-sm sm:text-base">
                सीधे निर्धारित लाभार्थी / नॉमिनी के बैंक खाते में
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                जहाँ संभव और उपयुक्त हो, सहायता अभियान में सदस्य अपना सहयोग <strong>सीधे लाभार्थी या उसके नॉमिनी के अधिकृत बैंक खाते</strong> में डिजिटल माध्यम (UPI/NEFT/IMPS) से भेजेंगे।
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              सहयोग के प्रमाण के रूप में transaction ID / UTR / रसीद को डिजिटल पोर्टल पर सुरक्षित रखा जाएगा।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-2">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <p className="font-extrabold text-emerald-700 dark:text-emerald-300 text-sm sm:text-base">
                Direct to Beneficiary / Nominee Bank Account
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                Wherever applicable and feasible, members transfer their micro-aid <strong>directly to the verified bank account of the beneficiary or nominee</strong> via digital channels (UPI, IMPS, NEFT).
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Transaction IDs / UTR numbers / payment receipts are uploaded and permanently logged for 100% public auditability.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-2 text-right" dir="rtl">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <p className="font-extrabold text-emerald-700 dark:text-emerald-300 text-sm sm:text-base">
                براہ راست مستحق / نامزد وارث کے بینک کھاتے میں
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                جہاں ممکن ہو، تمام ممبران اپنا تعاون <strong>براہ راست مستحق فرد یا اس کے قانونی وارث کے بینک اکاؤنٹ</strong> میں ڈیجیٹل ذرائع سے منتقل کریں گے۔
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              ادائیگی کے ثبوت کے طور پر UTR / ٹرانزیکشن آئی ڈی پورٹل پر آڈٹ کے لیے درج کی جائے گی۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-12',
      number: 12,
      category: 'ethics',
      title: {
        hi: '12. डिजिटल पारदर्शिता (100% Digital Transparency)',
        en: '12. Digital Transparency & Data Protection',
        ur: '12. ڈیجیٹل شفافیت اور ریکارڈ'
      },
      icon: ShieldCheck,
      content: {
        hi: (
          <div className="space-y-3">
            <p>MFCT पूर्ण पारदर्शिता के लिए आधुनिक डिजिटल व्यवस्था बनाए रखेगा। जहाँ लागू हो, निम्न रिकॉर्ड सार्वजनिक/आंतरिक रूप से संधारित होंगे:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>कुल सत्यापित सदस्य संख्या व लाइव डेटा।</li>
              <li>सक्रिय एवं संपन्न सहायता अभियान।</li>
              <li>प्राप्त कुल सहयोग एवं UTR ट्रांजेक्शन रिकॉर्ड।</li>
              <li>लाभार्थी सत्यापन व ग्राउंड रिपोर्ट।</li>
              <li>खर्च का विधिवत लेखा-जोखा व वार्षिक वित्तीय ऑडिट रिपोर्ट।</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              * व्यक्तिगत बैंकिंग जानकारी एवं संवेदनशील डेटा को लागू डेटा गोपनीयता कानूनों के अंतर्गत सुरक्षित रखा जाएगा।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-3">
            <p>MFCT employs automated digital workflows to guarantee maximum transparency:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Verified member count and realtime chapter metrics.</li>
              <li>Active and completed relief campaigns with outcome reports.</li>
              <li>Aggregated contributions, UTR logs, and disbursement timestamps.</li>
              <li>Beneficiary background and case documentation.</li>
              <li>Statutory balance sheets and certified quarterly CA audit statements.</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              * Sensitive personal data and private banking credentials are encrypted and protected per Indian data privacy standards.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-3 text-right" dir="rtl">
            <p>MFCT شفافیت کے لیے مکمل ڈیجیٹل سسٹم پر کام کرتا ہے:</p>
            <ul className="list-disc pr-5 space-y-1 text-xs sm:text-sm">
              <li>مصدقہ اراکین کی کل تعداد اور لائیو ڈیٹا۔</li>
              <li>جاری اور مکمل شدہ امدادی مہمات۔</li>
              <li>موصولہ تعاون اور UTR ٹرانزیکشن کی تفصیلات۔</li>
              <li>مستحقین کی تفتیشی رپورٹس۔</li>
              <li>سالانہ مالیاتی گوشوارے اور چارٹرڈ اکاؤنٹنٹ کے آڈٹ ریکارڈز۔</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              * ذاتی ڈیٹا اور حساس بینکنگ معلومات کو رازداری کے قوانین کے تحت محفوظ رکھا جائے گا۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-13',
      number: 13,
      category: 'org',
      title: {
        hi: '13. ट्रस्ट के बैंक खाते (Official Bank Accounts)',
        en: '13. Trust Institutional Bank Accounts',
        ur: '13. ٹرسٹ کے باضابطہ بینک اکاؤنٹس'
      },
      icon: Landmark,
      content: {
        hi: (
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
            <li>ट्रस्ट के नाम से अनुसूचित बैंक में अधिकृत खाता संचालित होगा।</li>
            <li>बैंक खाते का संचालन Trust Deed एवं Board Resolution के अनुसार अधिकृत पदाधिकारियों द्वारा ही किया जाएगा।</li>
            <li>ट्रस्ट के संस्थागत धन को किसी भी व्यक्ति के निजी खाते से पूर्णतः पृथक रखा जाएगा।</li>
            <li>आय-व्यय का दैनिक एवं मासिक लेखा सुरक्षित रखा जाएगा।</li>
          </ol>
        ),
        en: (
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
            <li>Official accounts are maintained in recognized scheduled commercial banks under the Trust’s legal registered entity name.</li>
            <li>Bank operations are executed strictly in accordance with the registered Trust Deed and authorized Board Resolutions.</li>
            <li>Institutional Trust funds remain strictly segregated from any officer’s personal finances.</li>
            <li>Comprehensive double-entry books of account are maintained and reviewed regularly.</li>
          </ol>
        ),
        ur: (
          <ol className="list-decimal pr-5 space-y-2 text-right text-xs sm:text-sm" dir="rtl">
            <li>تمام اکاؤنٹس ٹرسٹ کے باضابطہ قانونی نام پر سرکاری/شیڈولڈ بینکوں میں کھولے جائیں گے۔</li>
            <li>اکاؤنٹس کا انتظام ٹرسٹ ڈیڈ اور بورڈ کی قرارداد کے مطابق مجاز عہدیداران کے ذریعے ہوگا۔</li>
            <li>ٹرسٹ کا فنڈ کسی بھی فرد کے ذاتی اکاؤنٹ سے مکمل طور پر الگ رہے گا۔</li>
            <li>آمدنی اور اخراجات کا مکمل ڈیجیٹل اور تحریری حساب رکھا جائے گا۔</li>
          </ol>
        )
      }
    },
    {
      id: 'sec-14',
      number: 14,
      category: 'org',
      title: {
        hi: '14. Crowdfunding एवं डिजिटल भुगतान',
        en: '14. Crowdfunding & Official Digital Payment Rules',
        ur: '14. کراؤڈ فنڈنگ اور ڈیجیٹل ادائیگیاں'
      },
      icon: Coins,
      content: {
        hi: (
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
            <li>केवल आधिकारिक बैंक खाते / अधिकृत गेटवे / प्रमाणित UPI QR का ही उपयोग होगा।</li>
            <li>QR/UPI की जानकारी केवल आधिकारिक वेबसाइट व अधिकृत माध्यमों से ही जारी होगी।</li>
            <li>प्राप्त प्रत्येक सहयोग का डिजिटल रिकॉर्ड व रसीद उपलब्ध होगी।</li>
            <li>प्रत्येक अभियान का उद्देश्य पूर्व से स्पष्ट और सार्वजनिक रहेगा।</li>
            <li>लागू कानूनों एवं आयकर (80G) नियमों का 100% पालन किया जाएगा।</li>
          </ol>
        ),
        en: (
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
            <li>Donations are received solely via the Trust’s authorized institutional payment gateways and verified UPI handles.</li>
            <li>Official QR codes and payment details are published exclusively on our verified portal (mfcttrust.com).</li>
            <li>Every contribution receives an instantaneous digital receipt with UTR and 80G tax exemption details.</li>
            <li>Campaign objectives, targets, and criteria are published prior to campaign launch.</li>
            <li>Strict compliance with Indian tax laws, NGO regulations, and financial guidelines.</li>
          </ol>
        ),
        ur: (
          <ol className="list-decimal pr-5 space-y-2 text-right text-xs sm:text-sm" dir="rtl">
            <li>صرف آفیشل بینک کھاتے اور منظور شدہ ڈیجیٹل ادائیگی کے راستے استعمال ہوں گے۔</li>
            <li>کیو آر کوڈ (QR Code) یا یو پی آئی کی معلومات صرف آفیشل ویب سائٹ سے جاری ہوں گی۔</li>
            <li>ہر موصولہ امداد کی ڈیجیٹل رسید اور ریکارڈ فراہم کیا جائے گا۔</li>
            <li>ہر مہم کا مقصد اور ہدف عوام کے سامنے واضح ہوگا۔</li>
            <li>ملکی ٹیکس اور فلاحی اداروں کے تمام قوانین کی مکمل پابندی کی جائے گی۔</li>
          </ol>
        )
      }
    },
    {
      id: 'sec-15',
      number: 15,
      category: 'org',
      title: {
        hi: '15. जिला स्तरीय संगठन संरचना',
        en: '15. District & State Organizational Structure',
        ur: '15. تنظیمی ڈھانچہ (ریاستی و ضلعی)'
      },
      icon: Building2,
      content: {
        hi: (
          <div className="space-y-4">
            <p>MFCT अपने जनकल्याणकारी कार्यों के विस्तार के लिए राज्य एवं जिला स्तर पर समर्पित पदाधिकारियों की नियुक्ति करता है:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <p className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 mb-2">राज्य स्तरीय संरचना (State Level)</p>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• संरक्षक (Patron)</li>
                  <li>• अध्यक्ष (President)</li>
                  <li>• उपाध्यक्ष (Vice-President)</li>
                  <li>• महासचिव (General Secretary)</li>
                  <li>• सचिव (Secretary)</li>
                  <li>• कोषाध्यक्ष (Treasurer)</li>
                  <li>• अन्य अधिकृत पदाधिकारी</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <p className="font-extrabold text-sm text-amber-700 dark:text-amber-400 mb-2">जिला स्तरीय संरचना (District Level)</p>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• जिला अध्यक्ष (District President)</li>
                  <li>• जिला उपाध्यक्ष (District VP)</li>
                  <li>• जिला महासचिव (District Gen. Sec.)</li>
                  <li>• जिला सचिव (District Secretary)</li>
                  <li>• जिला कोषाध्यक्ष (District Treasurer)</li>
                  <li>• जिला समन्वयक (District Coordinator)</li>
                  <li>• समर्पित स्वयंसेवक टीम (Volunteer Network)</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              * सभी पदाधिकारी ट्रस्ट के केंद्रीय निर्देशों, आचार संहिता और नीतियों के पूर्णतः अधीन कार्य करेंगे।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-4">
            <p>MFCT operates a structured, decentralized hierarchy of dedicated social leaders across state and district chapters:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <p className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 mb-2">State Executive Board</p>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• Chief Patron</li>
                  <li>• President</li>
                  <li>• Vice President</li>
                  <li>• General Secretary</li>
                  <li>• Secretary</li>
                  <li>• Treasurer</li>
                  <li>• Executive Trustees</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <p className="font-extrabold text-sm text-amber-700 dark:text-amber-400 mb-2">District Chapter Leadership</p>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• District President</li>
                  <li>• District Vice President</li>
                  <li>• District General Secretary</li>
                  <li>• District Secretary</li>
                  <li>• District Treasurer</li>
                  <li>• District Field Coordinator</li>
                  <li>• Grassroots Volunteer Team</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              * All office bearers operate strictly under central bylaws, code of conduct, and oversight.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-4 text-right" dir="rtl">
            <p>MFCT ریاستی اور ضلعی سطح پر ایک باضابطہ اور منظم تنظیمی ڈھانچہ رکھتا ہے:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <p className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 mb-2">ریاستی مجلس عاملہ</p>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• سرپرست اعلیٰ</li>
                  <li>• صدر</li>
                  <li>• نائب صدر</li>
                  <li>• جنرل سیکرٹری</li>
                  <li>• سیکرٹری</li>
                  <li>• خزانچی</li>
                  <li>• نامزد ایگزیکٹو ممبران</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <p className="font-extrabold text-sm text-amber-700 dark:text-amber-400 mb-2">ضلعی تنظیمی عہدیداران</p>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• ضلعی صدر</li>
                  <li>• ضلعی نائب صدر</li>
                  <li>• ضلعی جنرل سیکرٹری</li>
                  <li>• ضلعی سیکرٹری</li>
                  <li>• ضلعی خزانچی</li>
                  <li>• ضلعی کوآرڈینیٹر</li>
                  <li>• رضاکاروں کی ٹیم</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              * تمام عہدیداران ٹرسٹ کی مرکزی ہدایات اور ضابطہ اخلاق کے پابند ہوں گے۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-16',
      number: 16,
      category: 'org',
      title: {
        hi: '16. जिला अध्यक्ष के प्रमुख दायित्व',
        en: '16. Responsibilities of District Presidents',
        ur: '16. ضلعی صدر کے اہم فرائض و ذمہ داریاں'
      },
      icon: Award,
      content: {
        hi: (
          <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>जिले में MFCT के सामाजिक मिशन का विस्तार करना।</li>
            <li>सत्यापित सदस्यता अभियान का कुशल संचालन करना।</li>
            <li>सक्रिय व निष्ठावान कार्यकर्ताओं की मजबूत जिला टीम गठित करना।</li>
            <li>जरूरतमंद व पीड़ित मामलों की प्राथमिक तथ्यपरक जानकारी प्राप्त करना।</li>
            <li>आवश्यक होने पर मौके पर जाकर Ground Verification में पूर्ण सहयोग करना।</li>
            <li>ट्रस्ट की अधिकृत व प्रामाणिक जानकारी जन-जन तक पहुंचाना।</li>
            <li>गलत सूचना, भ्रामक प्रचार एवं अफवाहों का तत्काल खंडन करना।</li>
            <li>ट्रस्ट व सदस्यों की गोपनीय एवं व्यक्तिगत जानकारी की पूरी सुरक्षा रखना।</li>
          </ol>
        ),
        en: (
          <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Expand the noble humanitarian footprint of MFCT within their designated district.</li>
            <li>Organize verified membership drives with complete KYC compliance.</li>
            <li>Build an active, trustworthy district volunteer and administrative team.</li>
            <li>Conduct initial fact-finding on reported local hardship cases.</li>
            <li>Lead on-site Ground Verification and submit authenticated reports.</li>
            <li>Disseminate official Trust announcements accurately to the local public.</li>
            <li>Vigorously counter rumors, misleading claims, and unauthorized statements.</li>
            <li>Strictly protect sensitive beneficiary data and maintain member confidentiality.</li>
          </ol>
        ),
        ur: (
          <ol className="list-decimal pr-5 space-y-1.5 text-right text-xs sm:text-sm" dir="rtl">
            <li>متعلقہ ضلع میں MFCT کے فلاحی کاموں اور نیٹ ورک کو وسعت دینا۔</li>
            <li>باضابطہ تصدیقی رکنیت مہم کو کامیابی سے چلانا۔</li>
            <li>مخلص اور فعال رضاکاروں پر مشتمل ضلعی ٹیم تشکیل دینا۔</li>
            <li>مستحق اور ضرورت مند مقدمات کی ابتدائی رپورٹ تیار کرنا۔</li>
            <li>میدانی تصدیق (Ground Verification) میں بھرپور تعاون کرنا۔</li>
            <li>ٹرسٹ کی مصدقہ معلومات عوام تک پہنچانا۔</li>
            <li>کسی بھی افواہ یا غلط بیانی کی فوری تردید کرنا۔</li>
            <li>ممبران اور ٹرسٹ کے ریکارڈ کی مکمل رازداری برقرار رکھنا۔</li>
          </ol>
        )
      }
    },
    {
      id: 'sec-17',
      number: 17,
      category: 'ethics',
      title: {
        hi: '17. पदाधिकारी की जवाबदेही एवं प्रतिबंध',
        en: '17. Office Bearer Accountability & Prohibitions',
        ur: '17. عہدیداران کی جوابدہی اور ممنوعہ سرگرمیاں'
      },
      icon: AlertTriangle,
      content: {
        hi: (
          <div className="space-y-3">
            <p className="font-semibold text-rose-600 dark:text-rose-400">कोई भी पदाधिकारी या कार्यकर्ता निम्नलिखित कृत्यों में लिप्त नहीं होगा:</p>
            <div className="space-y-2 text-xs sm:text-sm">
              {[
                '❌ ट्रस्ट के नाम पर किसी भी प्रकार का निजी या अनाधिकृत धन संग्रह नहीं करेगा।',
                '❌ व्यक्तिगत बैंक खाते में ट्रस्ट अथवा सहायता अभियान का पैसा कभी जमा नहीं कराएगा।',
                '❌ बोर्ड की पूर्व लिखित अनुमति के बिना कोई भी वित्तीय वादा नहीं करेगा।',
                '❌ किसी भी लाभार्थी अथवा परिवार को निश्चित राशि की कानूनी गारंटी नहीं देगा।',
                '❌ ट्रस्ट की मुहर, लेटरहेड अथवा लोगो का अनधिकृत या व्यक्तिगत उपयोग नहीं करेगा।',
                '❌ ट्रस्ट की गोपनीय अथवा संवेदनशील जानकारी को सार्वजनिक या लीक नहीं करेगा।'
              ].map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ),
        en: (
          <div className="space-y-3">
            <p className="font-semibold text-rose-600 dark:text-rose-400">Strict prohibitions for all office bearers and volunteers:</p>
            <div className="space-y-2 text-xs sm:text-sm">
              {[
                '❌ NEVER collect private or cash funds in the name of the Trust.',
                '❌ NEVER accept Trust or campaign donations into personal bank accounts.',
                '❌ NEVER make unilateral financial commitments without prior written Board approval.',
                '❌ NEVER guarantee fixed monetary payouts to any applicant or beneficiary.',
                '❌ NEVER misuse the Trust’s official letterhead, seal, or emblem without authorization.',
                '❌ NEVER disclose, leak, or exploit confidential member/beneficiary records.'
              ].map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ),
        ur: (
          <div className="space-y-3 text-right" dir="rtl">
            <p className="font-semibold text-rose-600 dark:text-rose-400">عہدیداران کے لیے سخت ممنوعہ امور:</p>
            <div className="space-y-2 text-xs sm:text-sm">
              {[
                '❌ ٹرسٹ کے نام پر کسی قسم کی ذاتی فنڈ ریزنگ قطعی ممنوع ہے۔',
                '❌ ٹرسٹ یا فلاحی مہم کا پیسہ کسی ذاتی اکاؤنٹ میں ہرگز نہیں لیا جائے گا۔',
                '❌ بورڈ کی پیشگی تحریری اجازت کے بغیر کوئی مالی وعدہ نہیں کیا جائے گا۔',
                '❌ کسی بھی مستحق کو کسی متعین رقم کی گارنٹی نہیں دی جائے گی۔',
                '❌ ٹرسٹ کے لیٹر ہیڈ، مہر یا نام کا غیر مجاز یا ذاتی استعمال ممنوع ہے۔',
                '❌ ٹرسٹ کے حساس ریکارڈ اور معلومات کو کسی صورت افشا نہیں کیا جائے گا۔'
              ].map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )
      }
    },
    {
      id: 'sec-18',
      number: 18,
      category: 'ethics',
      title: {
        hi: '18. सोशल मीडिया नीति (Social Media Policy)',
        en: '18. Official Social Media Policy',
        ur: '18. سوشل میڈیا پالیسی اور قواعد'
      },
      icon: Share2,
      content: {
        hi: (
          <div className="space-y-2">
            <p>MFCT के आधिकारिक सोशल मीडिया माध्यमों पर केवल सत्यापित एवं अधिकृत जानकारी ही प्रकाशित की जाएगी।</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">किसी भी सदस्य या पदाधिकारी द्वारा निम्न सामग्री का प्रसार पूर्णतः वर्जित है:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                '❌ अफवाहें व झूठी खबरें',
                '❌ असत्यापित दावे',
                '❌ व्यक्तिगत आक्षेप व आरोप',
                '❌ अपमानजनक सामग्री',
                '❌ राजनीतिक व पक्षपाती पोस्ट',
                '❌ संस्था की छवि धूमिल करने वाले पोस्ट'
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-semibold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ),
        en: (
          <div className="space-y-2">
            <p>Only verified and formally cleared press releases and updates may be published on MFCT digital channels.</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Strictly prohibited content across social platforms:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                '❌ Rumors & fake news',
                '❌ Unverified assertions',
                '❌ Personal attacks/slander',
                '❌ Defamatory material',
                '❌ Partisan political content',
                '❌ Anything tarnishing institutional dignity'
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-semibold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ),
        ur: (
          <div className="space-y-2 text-right" dir="rtl">
            <p>سوشل میڈیا پر صرف تصدیق شدہ اور مرکزی طور پر منظور شدہ بیانات ہی شائع کیے جائیں گے۔</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">درج ذیل مواد کی اشاعت قطعی ممنوع ہے:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                '❌ بے بنیاد افواہیں اور جھوٹی خبریں',
                '❌ غیر مصدقہ دعوے',
                '❌ ذاتی الزامات اور توہین آمیز مواد',
                '❌ غیر شائستہ زبان',
                '❌ سیاسی اور متنازعہ پوسٹس',
                '❌ ٹرسٹ کا وقار مجروح کرنے والا مواد'
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-semibold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )
      }
    },
    {
      id: 'sec-19',
      number: 19,
      category: 'ethics',
      title: {
        hi: '19. WhatsApp एवं डिजिटल ग्रुप नियम',
        en: '19. WhatsApp & Community Group Guidelines',
        ur: '19. واٹس ایپ اور ڈیجیٹل گروپس کے قوانین'
      },
      icon: MessageCircle,
      content: {
        hi: (
          <div className="space-y-3">
            <p>MFCT के आधिकारिक WhatsApp समूह केवल ट्रस्ट से संबंधित निम्न कार्यों के लिए ही उपयोग किए जाएंगे:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                'आधिकारिक सूचनाएं',
                'सेवा गतिविधियां',
                'सहायता अभियान',
                'बैठक व एजेंडा',
                'सदस्यता अपडेट्स',
                'सत्यापित फोटो/वीडियो',
                'संगठनात्मक कार्य',
                'आपातकालीन समन्वय'
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-medium">
                  ✓ {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              ⚠️ असंबंधित वीडियो, शुभकामना संदेश, विज्ञापन, राजनीतिक पोस्ट, फॉरवर्ड एवं व्यक्तिगत बहस सख्त प्रतिबंधित हैं। बार-बार उल्लंघन पर एडमिन द्वारा निष्कासन की कार्रवाई की जाएगी।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-3">
            <p>Official MFCT WhatsApp groups and communication channels are reserved strictly for organizational matters:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                'Official Notices',
                'Relief Drives',
                'Verified Campaigns',
                'Meeting Agendas',
                'Membership Updates',
                'Ground Photo/Video Proof',
                'Chapter Governance',
                'Emergency Coordination'
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-medium">
                  ✓ {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              ⚠️ Unrelated video clips, generic greetings, advertisements, partisan political forwards, and personal disputes are strictly prohibited. Group administrators will remove persistent violators.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-3 text-right" dir="rtl">
            <p>MFCT کے باضابطہ واٹس ایپ گروپس صرف فلاحی اور تنظیمی مقاصد کے لیے مخصوص ہیں:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                'سرکاری اعلانات',
                'فلاحی سرگرمیاں',
                'امداد کی اپیلیں',
                'میٹنگز کا شیڈول',
                'رکنیت کی تصدیق',
                'میدانی کام کی تصاویر',
                'تنظیمی رابطے',
                'ہنگامی رابطہ کاری'
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-medium">
                  ✓ {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              ⚠️ غیر متعلقہ ویڈیوز، مبارکباد کے پیغامات، اشتہارات، سیاسی پوسٹس اور ذاتی بحثیں سخت منع ہیں۔ خلاف ورزی کی صورت میں فوری بلاک کیا جائے گا۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-20',
      number: 20,
      category: 'ethics',
      title: {
        hi: '20. आचार संहिता (Code of Conduct)',
        en: '20. Code of Conduct & Ethical Values',
        ur: '20. ضابطہ اخلاق اور اصول'
      },
      icon: Scale,
      content: {
        hi: (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center">
              <p className="text-xs font-bold text-slate-500">प्रत्येक सदस्य से अपेक्षा होगी कि वह इन सिद्धांतों का पालन करे:</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
                “सम्मान, अनुशासन, पारदर्शिता और इंसानियत”
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              किसी सदस्य द्वारा धोखाधड़ी, फर्जी दस्तावेज, गलत जानकारी, वित्तीय अनियमितता या ट्रस्ट के नाम का दुरुपयोग पाए जाने पर तत्काल कानूनी व अनुशासनात्मक कार्रवाई की जाएगी।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center">
              <p className="text-xs font-bold text-slate-500">Every member, volunteer, and officer pledges adherence to:</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
                “Mutual Respect, Strict Discipline, Absolute Transparency, and Humanity”
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Any act of forgery, document falsification, misleading claims, fiscal irregularity, or brand misrepresentation will face immediate disciplinary revocation and statutory legal action.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-3 text-right" dir="rtl">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center">
              <p className="text-xs font-bold text-slate-500">ہر ممبر سے ان چار بنیادی ستونوں پر عمل کی توقع ہے:</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
                “احترام، نظم و ضبط، شفافیت اور انسانیت”
              </p>
            </div>
            <p className="text-xs sm:text-slate-600 dark:text-slate-300">
              دھوکہ دہی، جعلی دستاویزات، مالی بدعنوانی یا ٹرسٹ کے نام کے ناجائز استعمال کی صورت میں فوری تادیبی اور قانونی کارروائی عمل میں لائی جائے گی۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-21',
      number: 21,
      category: 'membership',
      title: {
        hi: '21. सदस्यता समाप्ति (Termination of Membership)',
        en: '21. Termination & Suspension of Membership',
        ur: '21. رکنیت کا خاتمہ و معطلی'
      },
      icon: UserCheck,
      content: {
        hi: (
          <div>
            <p className="mb-2">निम्न परिस्थितियों में किसी सदस्य की सदस्यता तत्काल प्रभाव से निलंबित/समाप्त की जा सकती है:</p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>फर्जी, कूट रचित या जाली दस्तावेज प्रस्तुत करना।</li>
              <li>केवाईसी अथवा पंजीकरण में भ्रामक/गलत जानकारी देना।</li>
              <li>ट्रस्ट के नाम, पहचान या पद का अनुचित व्यक्तिगत दुरुपयोग।</li>
              <li>वित्तीय धोखाधड़ी अथवा अनाधिकृत धन संग्रह।</li>
              <li>गंभीर अनुशासनहीनता एवं संस्था विरोधी कृत्य।</li>
              <li>ट्रस्ट की नियमावली का लगातार उल्लंघन।</li>
              <li>संस्था की संपत्ति अथवा धन का गबन/दुरुपयोग।</li>
              <li>न्यायसंगत प्रक्रिया के उपरांत बोर्ड द्वारा निर्धारित अन्य गंभीर कारण।</li>
            </ol>
            <p className="text-xs text-slate-500 mt-2">* जहाँ आवश्यक हो, संबंधित व्यक्ति को अपना पक्ष रखने का अवसर दिया जाएगा।</p>
          </div>
        ),
        en: (
          <div>
            <p className="mb-2">Membership is subject to immediate suspension or permanent termination under the following conditions:</p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Submission of forged, counterfeit, or manipulated documents.</li>
              <li>Providing false identity, medical, or nominee data during KYC.</li>
              <li>Unauthorized commercial or personal exploitation of the MFCT brand or title.</li>
              <li>Financial fraud, embezzlement, or illicit fund-raising.</li>
              <li>Gross indiscipline, abusive conduct, or anti-institutional actions.</li>
              <li>Chronic disregard for operational bylaws and guidelines.</li>
              <li>Misappropriation of Trust assets or charity relief goods.</li>
              <li>Other grave grounds determined following formal board inquiry.</li>
            </ol>
            <p className="text-xs text-slate-500 mt-2">* A fair opportunity to show cause will be provided where appropriate.</p>
          </div>
        ),
        ur: (
          <div dir="rtl" className="text-right">
            <p className="mb-2">درج ذیل حالات میں رکنیت فوری طور پر معطل یا ختم کی جا سکتی ہے:</p>
            <ol className="list-decimal pr-5 space-y-1.5 text-xs sm:text-sm">
              <li>جعلی یا بوگس دستاویزات پیش کرنا۔</li>
              <li>رجسٹریشن میں غلط بیانی یا گمراہ کن معلومات فراہم کرنا۔</li>
              <li>ٹرسٹ کے نام یا عہدے کا ذاتی مفاد کے لیے غلط استعمال۔</li>
              <li>مالی ہیرا پھیری یا غیر مجاز فنڈ جمع کرنا۔</li>
              <li>سنگین بد نظمی اور فلاحی مقاصد کو نقصان پہنچانا۔</li>
              <li>قواعد کی مسلسل خلاف ورزی کرنا۔</li>
              <li>ٹرسٹ کے اثاثوں یا فنڈز کا غیر قانونی استعمال۔</li>
              <li>تحقیقات کے بعد بورڈ کی جانب سے پایا جانے والا کوئی سنگین سبب۔</li>
            </ol>
            <p className="text-xs text-slate-500 mt-2">* جہاں ضروری ہو، متعلقہ شخص کو وضاحت پیش کرنے کا موقع دیا جائے گا۔</p>
          </div>
        )
      }
    },
    {
      id: 'sec-22',
      number: 22,
      category: 'ethics',
      title: {
        hi: '22. शिकायत एवं समाधान (Grievance Redressal)',
        en: '22. Grievance Redressal Mechanism',
        ur: '22. شکایات کا ازالہ اور ہیلپ لائن'
      },
      icon: PhoneCall,
      content: {
        hi: (
          <div className="space-y-3">
            <p>सदस्य अपनी किसी भी प्रकार की शिकायत, सुझाव या प्रश्न आधिकारिक माध्यमों से दर्ज करा सकते हैं:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">📧 आधिकारिक ईमेल:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">info@mfcttrust.com</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">📞 24/7 हेल्पलाइन:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+91 82180 17226 / +91 97569 19430</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              * ट्रस्ट शिकायत की प्रकृति के अनुसार निष्पक्ष जांच कर त्वरित समाधान सुनिश्चित करेगा।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-3">
            <p>Members and citizens may submit grievances, inquiries, or feedback through authenticated channels:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">📧 Official Grievance Email:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">info@mfcttrust.com</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">📞 24/7 Support Helpline:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+91 82180 17226 / +91 97569 19430</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              * The Trust redressal ombudsman reviews issues promptly with fair administrative oversight.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-3 text-right" dir="rtl">
            <p>ممبران اپنی شکایات یا سوالات باضابطہ چینلز کے ذریعے درج کروا سکتے ہیں:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">📧 آفیشل ای میل:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">info@mfcttrust.com</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">📞 24/7 ہیلپ لائن:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+91 82180 17226 / +91 97569 19430</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              * تمام موصولہ شکایات کا شفاف جائزہ لے کر جلد از جلد ازالہ کیا جائے گا۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-23',
      number: 23,
      category: 'org',
      title: {
        hi: '23. वित्तीय पारदर्शिता एवं लेखा (Financial Audit)',
        en: '23. Financial Accounting & Statutory Audits',
        ur: '23. مالیاتی شفافیت اور آڈٹ'
      },
      icon: Scale,
      content: {
        hi: (
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
            <li>ट्रस्ट उचित Books of Accounts का विधिवत संधारण करेगा।</li>
            <li>आय एवं व्यय का पूर्ण डिजिटल व कागजी रिकॉर्ड रखा जाएगा।</li>
            <li>बैंक के प्रत्येक लेन-देन का UTR व वाउचर रिकॉर्ड सुरक्षित रहेगा।</li>
            <li>चार्टर्ड अकाउंटेंट्स द्वारा निर्धारित वार्षिक वित्तीय ऑडिट कराया जाएगा।</li>
            <li>ट्रस्ट की सभी वित्तीय गतिविधियां भारतीय कानून व आयकर नियमों के पूर्ण अनुपालन में संचालित होंगी।</li>
          </ol>
        ),
        en: (
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
            <li>The Trust maintains statutory Books of Accounts as mandated under Indian non-profit regulations.</li>
            <li>Comprehensive digital ledgers track every inflow and outflow in real time.</li>
            <li>Every bank transaction maintains an unbroken audit trail of vouchers and UTR numbers.</li>
            <li>Annual and quarterly independent audits are conducted by certified Chartered Accountants.</li>
            <li>Strict adherence to statutory Income Tax Act provisions and Section 80G/12A requirements.</li>
          </ol>
        ),
        ur: (
          <ol className="list-decimal pr-5 space-y-2 text-right text-xs sm:text-sm" dir="rtl">
            <li>ٹرسٹ باقاعدہ Books of Accounts اور کھاتے مرتب رکھے گا۔</li>
            <li>تمام آمد و خرچ کا 100 فیصد ڈیجیٹل ریکارڈ رکھا جائے گا۔</li>
            <li>ہر ٹرانزیکشن کا بینک واؤچر اور UTR محفوظ رہے گا۔</li>
            <li>مستند چارٹرڈ اکاؤنٹنٹ سے سالانہ باضابطہ آڈٹ کرایا جائے گا۔</li>
            <li>تمام مالیاتی کام انکم ٹیکس قوانین اور ملکی ضوابط کے عین مطابق انجام پائیں گے۔</li>
          </ol>
        )
      }
    },
    {
      id: 'sec-24',
      number: 24,
      category: 'org',
      title: {
        hi: '24. नियमों में संशोधन (Amendments)',
        en: '24. Amendments to Bylaws',
        ur: '24. قواعد میں ترامیم کا اختیار'
      },
      icon: FileCheck,
      content: {
        hi: (
          <div className="space-y-2 text-xs sm:text-sm">
            <p>ट्रस्ट की आवश्यकता, परिस्थितियों एवं लागू कानूनों के अनुसार इस नियमावली में समय-समय पर संशोधन किया जा सकता है।</p>
            <p>कोई भी संशोधन Trust Deed एवं लागू भारतीय कानूनों के पूर्णतः अधीन होगा।</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">✓ नवीनतम स्वीकृत नियमावली ही सर्वमान्य और प्रभावी मानी जाएगी।</p>
          </div>
        ),
        en: (
          <div className="space-y-2 text-xs sm:text-sm">
            <p>The Trust Board reserves the authority to review and ratify amendments to these operational bylaws as warranted by circumstances or legal enactments.</p>
            <p>Any proposed amendment shall remain subordinate to the core registered Trust Deed and statutory laws of India.</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">✓ The latest ratified version published on the official platform constitutes the governing authority.</p>
          </div>
        ),
        ur: (
          <div className="space-y-2 text-right text-xs sm:text-sm" dir="rtl">
            <p>حالات کے تقاضوں اور ملکی قوانین کی روشنی میں ان قواعد میں ترامیم کی جا سکتی ہیں۔</p>
            <p>کوئی بھی ترمیم ٹرسٹ ڈیڈ اور بنیادی مقاصد کے دائرے میں ہوگی۔</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">✓ آفیشل پورٹل پر شائع شدہ تازہ ترین منظور شدہ قواعد ہی مؤثر سمجھے جائیں گے۔</p>
          </div>
        )
      }
    },
    {
      id: 'sec-25',
      number: 25,
      category: 'pledge',
      title: {
        hi: '25. सहायता राशि के संबंध में महत्वपूर्ण घोषणा (Crucial Disclaimer)',
        en: '25. Crucial Disclaimer Regarding Aid Target Amounts',
        ur: '25. امدادی رقم کے متعلق اہم اور حتمی اعلان'
      },
      icon: AlertTriangle,
      content: {
        hi: (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10">
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                📢 महत्वपूर्ण कानूनी घोषणा:
              </p>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">
                MFCT द्वारा प्रचारित <strong>₹20–25 लाख अथवा ₹8–10 लाख</strong> जैसी राशियाँ संभावित/अनुमानित सामूहिक सहयोग राशि हैं।
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 text-amber-300 text-center font-bold text-xs">
                निर्धारण सूत्र: [कुल सक्रिय सदस्य संख्या] × [वास्तविक स्वैच्छिक सहयोग] × [पात्र भागीदारी]
              </div>
            </div>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              ⚠️ किसी भी सदस्य अथवा लाभार्थी को किसी निश्चित राशि की कानूनी गारंटी नहीं दी जाएगी। यह विशुद्ध रूप से भाईचारे और इंसानियत पर आधारित सामूहिक सहयोग व्यवस्था है।
            </p>
          </div>
        ),
        en: (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10">
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                📢 Mandatory Transparency Notice:
              </p>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">
                Figures such as <strong>₹20–25 Lakh or ₹8–10 Lakh</strong> referenced by MFCT represent potential collective fundraising targets derived purely from micro-solidarity turnout.
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 text-amber-300 text-center font-bold text-xs">
                Formula: [Active Verified Members] × [Actual Voluntary Contribution] × [Participation Rate]
              </div>
            </div>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              ⚠️ No member or applicant receives a legally binding guarantee or contractual insurance entitlement. This operates solely as community mutual humanitarian assistance.
            </p>
          </div>
        ),
        ur: (
          <div className="space-y-3 text-right" dir="rtl">
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10">
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                📢 اہم اور شفاف اعلان:
              </p>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">
                MFCT میں بیان کردہ <strong>₹20 تا 25 لاکھ یا ₹8 تا 10 لاکھ</strong> کی رقوم ممکنہ اجتماعی اہداف ہیں جن کا انحصار اراکین کے باہمی اشتراک پر ہے۔
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 text-amber-300 text-center font-bold text-xs">
                فارمولا: [فعال ممبران کی تعداد] × [حقیقی رضاکارانہ ادائیگی] × [شمولیت]
              </div>
            </div>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              ⚠️ کسی بھی رکن یا خاندان کو کسی مقررہ رقم کی کوئی قانونی گارنٹی نہیں دی جاتی۔ یہ خالصتاً ہمدردی اور اخوت پر مبنی نظام ہے۔
            </p>
          </div>
        )
      }
    },
    {
      id: 'sec-26',
      number: 26,
      category: 'pledge',
      title: {
        hi: '26. ट्रस्ट का मूल सिद्धांत (Core Philosophy)',
        en: '26. Core Guiding Principles of MFCT',
        ur: '26. ٹرسٹ کا بنیادی نظریہ اور فلسفہ'
      },
      icon: Heart,
      content: {
        hi: (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border text-center space-y-3" style={{ background: 'linear-gradient(135deg, rgba(26,60,44,0.06) 0%, rgba(200,168,75,0.12) 100%)', borderColor: 'rgba(200,168,75,0.35)' }}>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 italic">
                “हम किसी को लाभ का वादा नहीं करते, हम जरूरत के समय साथ खड़े होने का प्रयास करते हैं।”
              </p>
              <div className="w-24 h-0.5 mx-auto" style={{ background: 'var(--mfct-gold)' }} />
              <p className="text-base sm:text-lg font-extrabold" style={{ color: 'var(--mfct-gold-dark)' }}>
                “आपका ₹100 छोटा हो सकता है, लेकिन हजारों हाथ मिल जाएँ तो किसी परिवार के लिए बड़ी उम्मीद बन सकते हैं।”
              </p>
            </div>
          </div>
        ),
        en: (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border text-center space-y-3" style={{ background: 'linear-gradient(135deg, rgba(26,60,44,0.06) 0%, rgba(200,168,75,0.12) 100%)', borderColor: 'rgba(200,168,75,0.35)' }}>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 italic">
                “We do not promise commercial profits; we strive to stand united by your side in your hour of deepest need.”
              </p>
              <div className="w-24 h-0.5 mx-auto" style={{ background: 'var(--mfct-gold)' }} />
              <p className="text-base sm:text-lg font-extrabold" style={{ color: 'var(--mfct-gold-dark)' }}>
                “Your ₹100 may seem modest alone, but when thousands of compassionate hands unite, it becomes a beacon of life-saving hope for a struggling family.”
              </p>
            </div>
          </div>
        ),
        ur: (
          <div className="space-y-4 text-right" dir="rtl">
            <div className="p-5 rounded-2xl border text-center space-y-3" style={{ background: 'linear-gradient(135deg, rgba(26,60,44,0.06) 0%, rgba(200,168,75,0.12) 100%)', borderColor: 'rgba(200,168,75,0.35)' }}>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 italic">
                “ہم کسی کو مالی منافع کا وعدہ نہیں دیتے، ہم ضرورت کے وقت ایک دوسرے کا سہارا بننے کی کوشش کرتے ہیں۔”
              </p>
              <div className="w-24 h-0.5 mx-auto" style={{ background: 'var(--mfct-gold)' }} />
              <p className="text-base sm:text-lg font-extrabold" style={{ color: 'var(--mfct-gold-dark)' }}>
                “آپ کا ₹100 اکیلے معمولی ہو سکتا ہے، لیکن جب ہزاروں مخلص ہاتھ مل جاتے ہیں تو وہ کسی مجبور خاندان کے لیے نئی زندگی کی امید بن جاتے ہیں۔”
              </p>
            </div>
          </div>
        )
      }
    },
    {
      id: 'sec-27',
      number: 27,
      category: 'pledge',
      title: {
        hi: '27. अंतिम संकल्प (Our Final Pledge)',
        en: '27. The Final Solidarity Pledge',
        ur: '27. حتمی عہد اور منشور'
      },
      icon: Sparkles,
      content: {
        hi: (
          <div className="space-y-4">
            <p className="text-base font-bold text-emerald-800 dark:text-emerald-300">
              MFCT का संकल्प है: <span className="underline">कोई परिवार मुश्किल में अकेला न रहे।</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">यादें</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">→ सेवा बनें</span>
              </div>
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10">
                <span className="block text-xl font-black text-rose-600 dark:text-rose-400">मोहब्बत</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">→ मदद बने</span>
              </div>
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <span className="block text-xl font-black text-amber-600 dark:text-amber-400">सदस्यता</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">→ जिम्मेदारी बने</span>
              </div>
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10">
                <span className="block text-xl font-black text-purple-600 dark:text-purple-400">एकता</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">→ ताकत बने</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              और मरहूम मोहम्मद फ़ईम साहब की याद समाज के लिए निरंतर भलाई का सशक्त माध्यम बने।
            </p>
            <div className="p-4 rounded-xl text-center text-white font-extrabold" style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d251a 100%)', border: '1px solid var(--mfct-gold)' }}>
              🕊️ MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)
              <span className="block text-xs font-normal mt-1" style={{ color: 'var(--mfct-gold)' }}>“याद उनकी, सेवा हमारी” — समाप्त —</span>
            </div>
          </div>
        ),
        en: (
          <div className="space-y-4">
            <p className="text-base font-bold text-emerald-800 dark:text-emerald-300">
              MFCT’s Solemn Pledge: <span className="underline">No family shall ever stand alone in distress.</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">Memories</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">→ Become Service</span>
              </div>
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10">
                <span className="block text-xl font-black text-rose-600 dark:text-rose-400">Affection</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">→ Becomes Aid</span>
              </div>
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <span className="block text-xl font-black text-amber-600 dark:text-amber-400">Membership</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">→ Becomes Duty</span>
              </div>
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10">
                <span className="block text-xl font-black text-purple-600 dark:text-purple-400">Unity</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">→ Becomes Strength</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              May the cherished memory of Marhoom Mohammad Faeem Sahab remain an enduring catalyst of kindness and societal upliftment.
            </p>
            <div className="p-4 rounded-xl text-center text-white font-extrabold" style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d251a 100%)', border: '1px solid var(--mfct-gold)' }}>
              🕊️ MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)
              <span className="block text-xs font-normal mt-1" style={{ color: 'var(--mfct-gold)' }}>“In Their Memory, Our Service” — Concluded —</span>
            </div>
          </div>
        ),
        ur: (
          <div className="space-y-4 text-right" dir="rtl">
            <p className="text-base font-bold text-emerald-800 dark:text-emerald-300">
              MFCT کا حتمی عہد: <span className="underline">کوئی بھی خاندان مشکل میں تنہا نہ رہے۔</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">یادیں</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">← خدمت بنیں</span>
              </div>
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10">
                <span className="block text-xl font-black text-rose-600 dark:text-rose-400">محبت</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">← مدد بنے</span>
              </div>
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <span className="block text-xl font-black text-amber-600 dark:text-amber-400">رکنیت</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">← ذمہ داری بنے</span>
              </div>
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10">
                <span className="block text-xl font-black text-purple-600 dark:text-purple-400">اتحاد</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">← طاقت بنے</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              اور مرحوم محمد فہیم صاحب کی یاد سدا فلاح و انسانیت کے لیے مشعلِ راہ بنی رہے۔
            </p>
            <div className="p-4 rounded-xl text-center text-white font-extrabold" style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d251a 100%)', border: '1px solid var(--mfct-gold)' }}>
              🕊️ MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)
              <span className="block text-xs font-normal mt-1" style={{ color: 'var(--mfct-gold)' }}>“یاد ان کی، خدمت ہماری” — اختتام —</span>
            </div>
          </div>
        )
      }
    }
  ];

  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
      const matchesCategory = activeCategory === 'all' || sec.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const titleMatch =
        sec.title.hi.toLowerCase().includes(q) ||
        sec.title.en.toLowerCase().includes(q) ||
        sec.title.ur.toLowerCase().includes(q);

      const numberMatch = String(sec.number).toLowerCase().includes(q);
      return matchesCategory && (titleMatch || numberMatch);
    });
  }, [sections, activeCategory, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* ── Top Bar with Back & Print ── */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t('btn.back', 'Back')}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{tr('प्रिंट / डाउनलोड PDF', 'پرنٹ / ڈاؤنلوڈ', 'Print / PDF')}</span>
          </button>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div
        className="rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d251a 100%)',
          border: '2px solid rgba(200,168,75,0.4)',
          boxShadow: '0 20px 40px -15px rgba(26,60,44,0.4)'
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15" style={{ background: 'var(--mfct-gold)' }} />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border" style={{ background: 'rgba(200,168,75,0.15)', borderColor: 'rgba(200,168,75,0.3)', color: 'var(--mfct-gold)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tr('आधिकारिक नियमावली एवं संचालन नियम', 'آفیشل قواعد و ضوابط اور آئین', 'Official Trust Bylaws & Operating Rules')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: isHindi ? 'inherit' : 'serif' }}>
            {tr('MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)', 'محمد فہیم چیریٹیبل ٹرسٹ (MFCT)', 'MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)')}
          </h1>

          <p className="text-base sm:text-xl font-bold italic" style={{ color: 'var(--mfct-gold)' }}>
            “याद उनकी, सेवा हमारी”
          </p>

          <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
            {tr(
              'ट्रस्ट के 27 मूलभूत नियम, 100% पारदर्शी कार्यप्रणाली, ₹100 वार्षिक संचालन सहयोग, सामूहिक आकस्मिक निधन व बेटी विवाह सहायता व्यवस्था, एवं जिला स्तरीय प्रशासनिक दिशा-निर्देश।',
              'ٹرسٹ کے 27 بنیادی قواعد، 100 فیصد شفاف لائحہ عمل، ₹100 سالانہ تنظیمی تعاون، ہنگامی امداد اور بیٹی کی شادی میں اجتماعی تعاون کے رہنما اصول۔',
              'The 27 founding bylaws, 100% transparent operations, ₹100 annual system support, bereavement & daughter wedding solidarity schemes, and district governance code of conduct.'
            )}
          </p>

          {/* Quick Stat Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 border border-white/20">
              Regd. No.: 258/2026
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              ✓ 100% Audited
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/20 border border-amber-400/30 text-amber-300">
              ₹100 Annual Support
            </span>
          </div>
        </div>
      </div>

      {/* ── Key Highlights Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {tr('₹100 वार्षिक व्यवस्था सहयोग', '₹100 سالانہ تنظیمی تعاون', '₹100 Annual System Support')}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tr(
              'कार्यालय, ऐप, हेल्पलाइन व फील्ड वेरिफिकेशन को सुचारु रखने हेतु वार्षिक सहयोग। कोई बीमा प्रीमियम या लाभ खरीद नहीं।',
              'دفتری اخراجات، ایپ، ہیلپ لائن اور میدانی تصدیق کو فعال رکھنے کا سالانہ تعاون۔ کوئی انشورنس پریمیم نہیں۔',
              'Maintains cloud systems, 24/7 helpline, and verified field audits. Not an insurance premium or guaranteed payout.'
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {tr('आकस्मिक निधन सहायता', 'ناگہانی انتقال پر امداد', 'Bereavement Aid Pool')}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tr(
              'सत्यापित सदस्य के निधन पर प्रत्येक पात्र सदस्य से न्यूनतम ₹100 का आह्वान। संभावित सामूहिक लक्ष्य ₹20–25 लाख तक।',
              'مصدقہ ممبر کے انتقال پر فی ممبر کم از کم ₹100 کا باہمی تعاون۔ امکانی اجتماعی ہدف تقریباً ₹20 تا 25 لاکھ۔',
              'Min ₹100 collective appeal per member for grieving families. Potential collective goal of approx. ₹20–25 Lakh.'
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {tr('बेटी विवाह सहायता', 'بیٹی کی شادی میں معاونت', 'Daughter Wedding Support')}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tr(
              'पात्र सदस्य की बेटी के विवाह पर प्रत्येक सदस्य से न्यूनतम ₹50 का सहयोग। संभावित सामूहिक लक्ष्य ₹8–10 लाख तक।',
              'مستحق ممبر کی بیٹی کے نکاح پر فی ممبر کم از کم ₹50 کا تعاون۔ امکانی اجتماعی ہدف تقریباً ₹8 تا 10 لاکھ۔',
              'Min ₹50 collective micro-aid per member. Potential collective community target of approx. ₹8–10 Lakh.'
            )}
          </p>
        </div>
      </div>

      {/* ── Filter & Search Controls ── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[var(--mfct-dark-green)] text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={tr('नियम खोजें (उदा. विवाह, ₹100, नॉमिनी)...', 'قواعد میں تلاش کریں...', 'Search rules...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          {tr(
            `${filteredSections.length} नियम एवं धाराएं प्रदर्शित`,
            `${filteredSections.length} قواعد و دفعات دکھائی جا رہی ہیں`,
            `Showing ${filteredSections.length} sections`
          )}
        </p>
      </div>

      {/* ── Rules List ── */}
      <div className="space-y-4">
        {filteredSections.map((sec) => {
          const Icon = sec.icon;
          const isExpanded = expandedSections[sec.id] !== false; // Default expanded

          return (
            <div
              key={sec.id}
              id={sec.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    [sec.id]: !isExpanded
                  }))
                }
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
                style={{ background: 'rgba(200,168,75,0.03)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold-dark)' }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {sec.title[language] || sec.title.en}
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      MFCT Bylaw #{sec.number}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Content */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-fade-in">
                  {sec.content[language] || sec.content.en}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom CTA Band ── */}
      <div
        className="rounded-3xl p-8 text-white text-center shadow-xl space-y-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, var(--mfct-mid-green) 100%)',
          border: '1px solid rgba(200,168,75,0.35)'
        }}
      >
        <h3 className="text-xl sm:text-2xl font-black">
          {tr('MFCT के साथ जुड़ें और इंसानियत का हाथ थामें', 'MFCT کے ساتھ جڑیں اور انسانیت کا ہاتھ تھامیں', 'Join MFCT and Stand with Humanity')}
        </h3>
        <p className="text-xs sm:text-sm max-w-xl mx-auto opacity-90 leading-relaxed">
          {tr(
            '₹100 का वार्षिक व्यवस्था संचालन सहयोग देकर अपने शहर की कम्युनिटी के सत्यापित सदस्य बनें।',
            '₹100 کا سالانہ تنظیمی تعاون ادا کر کے اپنے شہر کی کمیونٹی کے تصدیق شدہ رکن بنیں۔',
            'Contribute the ₹100 annual system support and become a verified solidarity member of your local chapter.'
          )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleOpenRegister}
            className="mfct-btn-gold px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <UserCheck className="w-4 h-4" />
            <span>{tr('सदस्य बनें (₹100)', 'رکن بنیں (₹100)', 'Become a Member (₹100)')}</span>
          </button>
          <button
            onClick={() => handleOpenDonate()}
            className="mfct-btn-outline px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            <span>{t('home.donate_now', 'Donate Now')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
