'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Heart,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Phone,
  Mail,
  Coins,
  Scale,
  Award,
  Lock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  HandHeart,
  Share2,
  FileCheck2,
  HeartHandshake
} from 'lucide-react';
import { FaHandsHoldingChild, FaHandHoldingHeart, FaWhatsapp } from 'react-icons/fa6';
import { useLanguage } from '../context/LanguageContext';

export const NiyamawaliPage: React.FC = () => {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: language === 'hi' ? 'सभी नियम (1–27)' : 'All Rules (1–27)' },
    { id: 'foundation', label: language === 'hi' ? 'उद्देश्य एवं सदस्यता' : 'Objectives & Membership' },
    { id: 'support', label: language === 'hi' ? 'निधन व विवाह सहायता' : 'Bereavement & Marriage Aid' },
    { id: 'verification', label: language === 'hi' ? 'पात्रता, नॉमिनी व दस्तावेज' : 'Eligibility & Verification' },
    { id: 'organization', label: language === 'hi' ? 'जिला संगठन व आचार संहिता' : 'Organization & Code of Conduct' },
    { id: 'transparency', label: language === 'hi' ? 'पारदर्शिता व संकल्प' : 'Transparency & Principles' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* ── 1. Grand Hero Header ── */}
      <section className="relative overflow-hidden text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8" style={{ background: 'radial-gradient(ellipse at top, #133c2a 0%, #081e13 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest shadow-md" style={{ background: 'rgba(200,168,75,0.18)', border: '1.5px solid var(--mfct-gold)', color: 'var(--mfct-gold)' }}>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {language === 'hi' ? 'नियमावली एवं संचालन नियम' : 'Rules, Regulations & Bylaws'}
          </h1>

          <p className="text-base sm:text-xl font-bold tracking-wide" style={{ color: 'var(--mfct-gold)' }}>
            “याद उनकी, सेवा हमारी”
          </p>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {language === 'hi'
              ? 'मोहम्मद फ़ईम चैरिटेबल ट्रस्ट की वैधानिक नियमावली, सामूहिक सहयोग संरचना, सदस्यता दायित्व एवं पारदर्शिता दिशानिर्देश।'
              : 'Official bylaws, mutual welfare support frameworks, membership responsibilities, and transparency guidelines of Mohammad Faeem Charitable Trust.'}
          </p>

          {/* Quick Stat Highlight Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 text-left">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">वार्षिक सहयोग</span>
              <span className="text-lg sm:text-xl font-black text-white">₹100</span>
              <span className="text-[10px] text-slate-300 block">व्यवस्था संचालन हेतु</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">आकस्मिक सहायता</span>
              <span className="text-lg sm:text-xl font-black text-white">₹20–25 लाख*</span>
              <span className="text-[10px] text-slate-300 block">संभावित सामूहिक सहयोग</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">बेटी विवाह सहायता</span>
              <span className="text-lg sm:text-xl font-black text-white">₹8–10 लाख*</span>
              <span className="text-[10px] text-slate-300 block">संभावित सामूहिक सहयोग</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">पारदर्शिता</span>
              <span className="text-lg sm:text-xl font-black text-white">100% प्रत्यक्ष</span>
              <span className="text-[10px] text-slate-300 block">खाते में डिजिटल ट्रांसफर</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. Category Filter Bar (No Scroll, Centered, No Search) ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-200/80 flex items-center justify-center">
          
          {/* Category Filter Pills - Flex Wrap, No Scroll */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#103825] text-amber-300 shadow-md scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── 3. Content Rules Body ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">

        {/* ── प्रस्तावना (Preamble) ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#103825] to-[#0a2317] text-white shadow-xl border-2 border-[var(--mfct-gold)] space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
                🕊️
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">प्रस्तावना (Preamble)</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">मोहम्मद फ़ईम चैरिटेबल ट्रस्ट (MFCT)</h2>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-200">
              मोहम्मद फ़ईम चैरिटेबल ट्रस्ट (MFCT) का उद्देश्य मरहूम मोहम्मद फ़ईम साहब की याद को समाजसेवा, मानवीय सहयोग और जनकल्याण के स्थायी प्रयासों से जोड़ना है।
            </p>
            <p className="text-sm leading-relaxed text-slate-200">
              ट्रस्ट का मूल विचार है कि कठिन परिस्थितियों में कोई परिवार स्वयं को अकेला और असहाय महसूस न करे तथा समाज के लोग आपसी सहयोग, भाईचारे और इंसानियत की भावना से जरूरतमंदों के साथ खड़े हों।
            </p>
            <div className="pt-2">
              <div className="inline-block px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold text-sm">
                🕊️ MFCT का मूल मंत्र: “याद उनकी, सेवा हमारी।”
              </div>
            </div>
          </div>
        )}

        {/* ── 1. नाम एवं पहचान ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="text-lg font-bold text-slate-900">नाम एवं पहचान</h3>
            </div>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>संस्था का नाम <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong> होगा।</li>
              <li>संस्था एक सामाजिक एवं जनकल्याणकारी ट्रस्ट के रूप में कार्य करेगी।</li>
              <li>संस्था का संचालन उसके <strong>Trust Deed, लागू कानूनों तथा समय-समय पर स्वीकृत नियमों</strong> के अनुसार किया जाएगा।</li>
            </ol>
          </div>
        )}

        {/* ── 2. मुख्य उद्देश्य ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-lg font-bold text-slate-900">मुख्य उद्देश्य (Core Objectives)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { num: '1', text: 'जरूरतमंद परिवारों की सहायता करना।' },
                { num: '2', text: 'आकस्मिक निधन की स्थिति में पात्र सदस्य के परिवार के लिए सामूहिक सहयोग का प्रयास करना।' },
                { num: '3', text: 'पात्र सदस्य की बेटी के विवाह में सामूहिक आर्थिक सहयोग का प्रयास करना।' },
                { num: '4', text: 'शिक्षा के क्षेत्र में जरूरतमंद विद्यार्थियों की सहायता करना।' },
                { num: '5', text: 'स्वास्थ्य एवं चिकित्सा सहायता उपलब्ध कराने का प्रयास करना।' },
                { num: '6', text: 'गरीब, असहाय एवं जरूरतमंद लोगों की सहायता करना।' },
                { num: '7', text: 'भोजन, वस्त्र, राहत सामग्री एवं आवश्यक वस्तुओं का वितरण करना।' },
                { num: '8', text: 'महिलाओं एवं बेटियों के कल्याण तथा सशक्तिकरण के लिए कार्य करना।' },
                { num: '9', text: 'युवाओं को सामाजिक सेवा से जोड़ना।' },
                { num: '10', text: 'समाज में आपसी सहयोग, भाईचारा और मानवता की भावना को मजबूत करना।' },
                { num: '11', text: 'प्राकृतिक आपदा, दुर्घटना अथवा अन्य कठिन परिस्थितियों में यथासंभव राहत कार्य करना।' },
                { num: '12', text: 'डिजिटल एवं पारदर्शी सामाजिक सहायता व्यवस्था विकसित करना।' },
              ].map((item) => (
                <div key={item.num} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 leading-snug">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. सदस्यता ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="text-lg font-bold text-slate-900">सदस्यता (Membership)</h3>
            </div>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>ट्रस्ट द्वारा निर्धारित पात्रता पूरी करने वाला व्यक्ति सदस्य बन सकता है।</li>
              <li>सदस्यता स्वैच्छिक होगी।</li>
              <li>सदस्य को ट्रस्ट की वर्तमान नियमावली एवं संबंधित योजनाओं के नियमों को स्वीकार करना होगा।</li>
              <li>सदस्यता का रिकॉर्ड डिजिटल/लिखित रूप में रखा जाएगा।</li>
              <li>प्रत्येक सदस्य को अपनी व्यक्तिगत जानकारी, मोबाइल नंबर, पता तथा नॉमिनी संबंधी जानकारी सही रखना आवश्यक होगा।</li>
            </ol>
          </div>
        )}

        {/* ── 4. वार्षिक व्यवस्था संचालन सहयोग ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl p-6 sm:p-7 shadow-sm border-2 border-amber-300 space-y-4">
            <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 block">वार्षिक सहयोग</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">₹100 — “वार्षिक व्यवस्था संचालन सहयोग”</h3>
              </div>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              MFCT में ₹100 को सहायता के बदले शुल्क, बीमा प्रीमियम या लाभ खरीदने की राशि <strong>नहीं</strong> माना जाएगा। इसे <strong>“वार्षिक व्यवस्था संचालन सहयोग”</strong> के रूप में रखा जाएगा।
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              इसका उद्देश्य ट्रस्ट की प्रशासनिक एवं सामाजिक व्यवस्था को सुचारु रूप से चलाने में सहयोग करना है।
            </p>

            <div className="bg-white/80 p-4 rounded-xl border border-amber-200 space-y-2">
              <p className="text-xs font-bold text-slate-800">इस राशि का उपयोग आवश्यकतानुसार निम्न कार्यों में किया जा सकता है:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                <span>• कार्यालय संचालन</span>
                <span>• वेबसाइट एवं ऐप</span>
                <span>• डिजिटल सिस्टम</span>
                <span>• हेल्पलाइन एवं संचार</span>
                <span>• दस्तावेजीकरण</span>
                <span>• सदस्य रिकॉर्ड</span>
                <span>• प्रचार-प्रसार</span>
                <span>• सामाजिक जागरूकता</span>
                <span>• आवश्यक प्रशासनिक खर्च</span>
                <span>• सामाजिक व जनकल्याण कार्य</span>
              </div>
            </div>

            <div className="p-3 bg-amber-100/70 rounded-xl text-xs text-amber-900 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>महत्वपूर्ण: ₹100 का वार्षिक सहयोग देने मात्र से किसी व्यक्ति को किसी निश्चित आर्थिक सहायता की गारंटी नहीं होगी।</span>
            </div>
          </div>
        )}

        {/* ── 5. आकस्मिक निधन सहायता व्यवस्था ── */}
        {(activeCategory === 'all' || activeCategory === 'support') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                5
              </span>
              <h3 className="text-lg font-bold text-slate-900">आकस्मिक निधन सहायता व्यवस्था</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              यदि किसी सक्रिय एवं वैधानिक सदस्य का आकस्मिक निधन होता है और वह संबंधित योजना की सभी पात्रता शर्तें पूरी करता है, तो MFCT अपने सदस्यों से सामूहिक आर्थिक सहयोग का आह्वान कर सकता है।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">सदस्य सहयोग</span>
                <p className="text-base font-extrabold text-emerald-950">न्यूनतम ₹100 प्रति सदस्य</p>
                <p className="text-[11px] text-emerald-700 leading-snug">प्राप्त कुल राशि सदस्य संख्या एवं वास्तविक सहयोग पर निर्भर करेगी।</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">संभावित सहायता लक्ष्य</span>
                <p className="text-base font-extrabold text-amber-950">लगभग ₹20–25 लाख तक (अथवा कम/अधिक)</p>
                <p className="text-[11px] text-amber-700 leading-snug">यह अनुमानित सामूहिक लक्ष्य है, निश्चित लाभ या गारंटी नहीं।</p>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. बेटी विवाह सहायता व्यवस्था ── */}
        {(activeCategory === 'all' || activeCategory === 'support') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                6
              </span>
              <h3 className="text-lg font-bold text-slate-900">बेटी विवाह सहायता व्यवस्था</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              किसी पात्र एवं सक्रिय सदस्य की बेटी के विवाह के अवसर पर MFCT सामूहिक सहयोग अभियान चला सकता है।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">सदस्य सहयोग</span>
                <p className="text-base font-extrabold text-rose-950">न्यूनतम ₹50 प्रति सदस्य</p>
                <p className="text-[11px] text-rose-700 leading-snug">सदस्यों की संख्या एवं वास्तविक सहयोग पर निर्भर करेगी।</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">संभावित सहायता लक्ष्य</span>
                <p className="text-base font-extrabold text-amber-950">लगभग ₹8–10 लाख तक (अथवा कम/अधिक)</p>
                <p className="text-[11px] text-amber-700 leading-snug">यह भी अनुमानित/संभावित राशि है, निश्चित या गारंटीकृत सहायता नहीं।</p>
              </div>
            </div>
          </div>
        )}

        {/* ── 7. सहायता प्राप्त करने की पात्रता ── */}
        {(activeCategory === 'all' || activeCategory === 'verification') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                7
              </span>
              <h3 className="text-lg font-bold text-slate-900">सहायता प्राप्त करने की पात्रता (Eligibility Criteria)</h3>
            </div>
            <p className="text-xs text-slate-500">किसी भी सहायता के लिए निम्न 10 बिंदुओं पर विचार किया जाएगा:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50">1. सदस्य की वैधानिक स्थिति</div>
              <div className="p-2.5 rounded-lg bg-slate-50">2. सदस्यता की अवधि</div>
              <div className="p-2.5 rounded-lg bg-slate-50">3. संबंधित योजना की पात्रता</div>
              <div className="p-2.5 rounded-lg bg-slate-50">4. आवश्यक सहयोग में सदस्य की भागीदारी</div>
              <div className="p-2.5 rounded-lg bg-slate-50">5. लॉक-इन अवधि, यदि लागू हो</div>
              <div className="p-2.5 rounded-lg bg-slate-50">6. सदस्य द्वारा नियमों का पालन</div>
              <div className="p-2.5 rounded-lg bg-slate-50">7. आवश्यक दस्तावेज</div>
              <div className="p-2.5 rounded-lg bg-slate-50">8. घटना/दावे का सत्यापन</div>
              <div className="p-2.5 rounded-lg bg-slate-50">9. नॉमिनी की वैधता</div>
              <div className="p-2.5 rounded-lg bg-slate-50">10. ट्रस्ट की उपलब्ध व्यवस्था एवं नियम</div>
            </div>
          </div>
        )}

        {/* ── 8. लॉक-इन एवं पात्रता अवधि ── */}
        {(activeCategory === 'all' || activeCategory === 'verification') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                8
              </span>
              <h3 className="text-lg font-bold text-slate-900">लॉक-इन एवं पात्रता अवधि (Lock-in Period)</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              MFCT प्रत्येक योजना के लिए अलग-अलग Lock-in Period निर्धारित कर सकता है।
            </p>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
              लॉक-इन अवधि का उद्देश्य यह सुनिश्चित करना होगा कि सदस्य केवल सहायता प्राप्त करने के उद्देश्य से तत्काल सदस्य बनकर योजना का अनुचित लाभ न उठाए। लॉक-इन अवधि, पात्रता एवं पुनः पात्रता संबंधी नियम संबंधित योजना के दस्तावेज में स्पष्ट किए जाएंगे।
            </p>
          </div>
        )}

        {/* ── 9. नॉमिनी व्यवस्था ── */}
        {(activeCategory === 'all' || activeCategory === 'verification') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                9
              </span>
              <h3 className="text-lg font-bold text-slate-900">नॉमिनी व्यवस्था (Nominee Policy)</h3>
            </div>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>प्रत्येक सदस्य को नॉमिनी घोषित करने का अवसर दिया जाएगा।</li>
              <li>सदस्य को नॉमिनी की जानकारी सही एवं अद्यतन रखनी होगी।</li>
              <li>नॉमिनी में परिवर्तन निर्धारित प्रक्रिया के अनुसार किया जा सकेगा।</li>
              <li>नॉमिनी को लेकर विवाद होने पर ट्रस्ट उपलब्ध दस्तावेजों और लागू कानूनों के आधार पर निर्णय लेगा।</li>
              <li>आवश्यक होने पर वैधानिक उत्तराधिकारी/सक्षम प्राधिकारी से दस्तावेज मांगे जा सकते हैं।</li>
            </ol>
          </div>
        )}

        {/* ── 10. दस्तावेज एवं सत्यापन ── */}
        {(activeCategory === 'all' || activeCategory === 'verification') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                10
              </span>
              <h3 className="text-lg font-bold text-slate-900">दस्तावेज एवं सत्यापन (Verification & Documents)</h3>
            </div>
            <p className="text-xs text-slate-600">सहायता अभियान शुरू करने से पहले ट्रस्ट आवश्यक दस्तावेज मांग सकता है, जैसे:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
              <span className="p-2 bg-slate-50 rounded-lg">• सदस्यता विवरण</span>
              <span className="p-2 bg-slate-50 rounded-lg">• मृत्यु प्रमाणपत्र</span>
              <span className="p-2 bg-slate-50 rounded-lg">• आधार/पहचान पत्र</span>
              <span className="p-2 bg-slate-50 rounded-lg">• नॉमिनी विवरण</span>
              <span className="p-2 bg-slate-50 rounded-lg">• बैंक खाते का प्रमाण</span>
              <span className="p-2 bg-slate-50 rounded-lg">• विवाह प्रमाण पत्र</span>
              <span className="p-2 bg-slate-50 rounded-lg">• अन्य आवश्यक प्रमाण</span>
              <span className="p-2 bg-emerald-50 text-emerald-800 font-bold rounded-lg">• Ground Verification</span>
            </div>
          </div>
        )}

        {/* ── 11. आर्थिक सहयोग की प्रक्रिया ── */}
        {(activeCategory === 'all' || activeCategory === 'support') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                11
              </span>
              <h3 className="text-lg font-bold text-slate-900">आर्थिक सहयोग की प्रक्रिया (Direct Digital Transfer)</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              जहाँ संभव और उपयुक्त हो, सहायता अभियान में सदस्य अपना सहयोग <strong>सीधे निर्धारित लाभार्थी/नॉमिनी के बैंक खाते में</strong> डिजिटल माध्यम (UPI/IMPS/NEFT) से भेज सकते हैं।
            </p>
            <p className="text-xs text-slate-600">
              सहयोग के प्रमाण के रूप में transaction ID / UTR / receipt सुरक्षित रखी जा सकती है।
            </p>
          </div>
        )}

        {/* ── 12. डिजिटल पारदर्शिता ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                12
              </span>
              <h3 className="text-lg font-bold text-slate-900">डिजिटल पारदर्शिता (Digital Transparency)</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              MFCT पारदर्शिता के लिए डिजिटल व्यवस्था विकसित करेगा। जहाँ लागू हो, निम्न रिकॉर्ड रखे जा सकते हैं:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
              <span className="p-2 bg-slate-50 rounded">• सदस्य संख्या</span>
              <span className="p-2 bg-slate-50 rounded">• सहायता अभियान</span>
              <span className="p-2 bg-slate-50 rounded">• प्राप्त सहयोग</span>
              <span className="p-2 bg-slate-50 rounded">• Transaction Details</span>
              <span className="p-2 bg-slate-50 rounded">• Beneficiary Details</span>
              <span className="p-2 bg-slate-50 rounded">• आवश्यक दस्तावेज</span>
              <span className="p-2 bg-slate-50 rounded">• खर्च का लेखा</span>
              <span className="p-2 bg-slate-50 rounded">• वार्षिक वित्तीय रिकॉर्ड</span>
            </div>
          </div>
        )}

        {/* ── 13. ट्रस्ट के बैंक खाते ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                13
              </span>
              <h3 className="text-lg font-bold text-slate-900">ट्रस्ट के बैंक खाते</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
              <li>ट्रस्ट के नाम से बैंक खाता खोला जाएगा।</li>
              <li>संचालन Trust Deed/Board Resolution अनुसार अधिकृत पदाधिकारियों द्वारा होगा।</li>
              <li>ट्रस्ट के व्यक्तिगत और संस्थागत धन को अलग रखा जाएगा।</li>
              <li>ट्रस्ट की आय एवं व्यय का उचित लेखा रखा जाएगा।</li>
            </ul>
          </div>
        )}

        {/* ── 14. Crowdfunding एवं डिजिटल भुगतान ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                14
              </span>
              <h3 className="text-lg font-bold text-slate-900">Crowdfunding एवं डिजिटल भुगतान</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
              <li>केवल आधिकारिक बैंक खातों/अधिकृत भुगतान माध्यम का उपयोग किया जाएगा।</li>
              <li>QR/UPI की जानकारी आधिकारिक माध्यम से ही जारी की जाएगी।</li>
              <li>प्राप्त धन का पारदर्शी रिकॉर्ड रखा जाएगा।</li>
              <li>प्रत्येक अभियान का उद्देश्य स्पष्ट किया जाएगा तथा लागू कानूनों एवं कर नियमों का पालन होगा।</li>
            </ul>
          </div>
        )}

        {/* ── 15. जिला स्तरीय संगठन ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                15
              </span>
              <h3 className="text-lg font-bold text-slate-900">जिला स्तरीय संगठन (Organizational Structure)</h3>
            </div>
            <p className="text-sm text-slate-700">
              MFCT अपने कार्यों के विस्तार के लिए राज्य एवं जिला स्तर पर पदाधिकारी/स्वयंसेवक नियुक्त कर सकता है।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">राज्य स्तर</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  संरक्षक, अध्यक्ष, उपाध्यक्ष, महासचिव, सचिव, कोषाध्यक्ष, अन्य पदाधिकारी
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">जिला स्तर</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  जिला अध्यक्ष, जिला उपाध्यक्ष, जिला महासचिव, जिला सचिव, जिला कोषाध्यक्ष, जिला समन्वयक, स्वयंसेवक टीम
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 16. जिला अध्यक्ष के प्रमुख दायित्व ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                16
              </span>
              <h3 className="text-lg font-bold text-slate-900">जिला अध्यक्ष के प्रमुख दायित्व</h3>
            </div>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>जिले में MFCT का विस्तार करना।</li>
              <li>सदस्यता अभियान चलाना।</li>
              <li>जिला टीम बनाना।</li>
              <li>जरूरतमंद मामलों की प्राथमिक जानकारी प्राप्त करना।</li>
              <li>आवश्यक होने पर Ground Verification में सहयोग करना।</li>
              <li>ट्रस्ट की आधिकारिक जानकारी लोगों तक पहुंचाना।</li>
              <li>गलत सूचना एवं अफवाहों से बचने के लिए जागरूक करना।</li>
              <li>ट्रस्ट की गोपनीय एवं व्यक्तिगत जानकारी सुरक्षित रखना।</li>
            </ol>
          </div>
        )}

        {/* ── 17. पदाधिकारी की जवाबदेही ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-rose-100 text-rose-800 font-black text-sm flex items-center justify-center shrink-0">
                17
              </span>
              <h3 className="text-lg font-bold text-slate-900">पदाधिकारी की जवाबदेही एवं प्रतिबंध</h3>
            </div>
            <p className="text-xs text-slate-600 font-bold">कोई भी पदाधिकारी निम्न कार्य कदापि नहीं करेगा:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 pt-1">
              <div className="p-2.5 bg-rose-50/70 border border-rose-150 rounded-xl">❌ ट्रस्ट के नाम पर निजी धन संग्रह नहीं करेगा।</div>
              <div className="p-2.5 bg-rose-50/70 border border-rose-150 rounded-xl">❌ व्यक्तिगत बैंक खाते में ट्रस्ट का पैसा नहीं लेगा।</div>
              <div className="p-2.5 bg-rose-50/70 border border-rose-150 rounded-xl">❌ बिना अनुमति कोई वित्तीय वादा नहीं करेगा।</div>
              <div className="p-2.5 bg-rose-50/70 border border-rose-150 rounded-xl">❌ लाभार्थी को निश्चित राशि की गारंटी नहीं देगा।</div>
              <div className="p-2.5 bg-rose-50/70 border border-rose-150 rounded-xl">❌ ट्रस्ट की मुहर/लेटरहेड का अनधिकृत उपयोग नहीं।</div>
              <div className="p-2.5 bg-rose-50/70 border border-rose-150 rounded-xl">❌ ट्रस्ट की गोपनीय जानकारी सार्वजनिक नहीं करेगा।</div>
            </div>
          </div>
        )}

        {/* ── 18. सोशल मीडिया नीति ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-indigo-100 text-indigo-800 font-black text-sm flex items-center justify-center shrink-0">
                18
              </span>
              <h3 className="text-lg font-bold text-slate-900">सोशल मीडिया नीति</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              MFCT के आधिकारिक सोशल मीडिया माध्यमों पर केवल सत्यापित एवं अधिकृत जानकारी प्रकाशित की जाएगी।
            </p>
            <p className="text-xs font-bold text-slate-800">किसी सदस्य को निम्न सामग्री प्रसारित नहीं करनी चाहिए:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700">
              <span className="p-2 bg-slate-50 rounded-lg">❌ अफवाह</span>
              <span className="p-2 bg-slate-50 rounded-lg">❌ झूठी जानकारी</span>
              <span className="p-2 bg-slate-50 rounded-lg">❌ व्यक्तिगत आरोप</span>
              <span className="p-2 bg-slate-50 rounded-lg">❌ अपमानजनक सामग्री</span>
              <span className="p-2 bg-slate-50 rounded-lg">❌ असंबंधित राजनीतिक सामग्री</span>
              <span className="p-2 bg-slate-50 rounded-lg">❌ संस्था की छवि खराब करने वाली सामग्री</span>
            </div>
          </div>
        )}

        {/* ── 19. WhatsApp एवं डिजिटल ग्रुप नियम ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                19
              </span>
              <h3 className="text-lg font-bold text-slate-900">WhatsApp एवं डिजिटल ग्रुप नियम</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              MFCT के आधिकारिक WhatsApp समूह केवल ट्रस्ट से संबंधित: <strong>सूचना, सेवा गतिविधि, सहायता अभियान, बैठक, सदस्यता, आधिकारिक फोटो/वीडियो एवं संगठनात्मक कार्य</strong> के लिए उपयोग किए जाएंगे।
            </p>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              असंबंधित वीडियो, शुभकामना संदेश, विज्ञापन, राजनीतिक पोस्ट, फॉरवर्ड एवं व्यक्तिगत चर्चा प्रतिबंधित हो सकती है। बार-बार नियमों का उल्लंघन होने पर एडमिन आवश्यक कार्रवाई कर सकता है।
            </p>
          </div>
        )}

        {/* ── 20. आचार संहिता ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                20
              </span>
              <h3 className="text-lg font-bold text-slate-900">आचार संहिता (Code of Conduct)</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              प्रत्येक सदस्य से अपेक्षा होगी कि वह <strong>“सम्मान, अनुशासन, पारदर्शिता और इंसानियत”</strong> के सिद्धांतों का पालन करे।
            </p>
            <p className="text-xs text-slate-600">
              किसी सदस्य द्वारा धोखाधड़ी, फर्जी दस्तावेज, गलत जानकारी, वित्तीय अनियमितता या ट्रस्ट के नाम का दुरुपयोग पाए जाने पर उचित कार्रवाई की जा सकती है।
            </p>
          </div>
        )}

        {/* ── 21. सदस्यता समाप्ति ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-rose-100 text-rose-800 font-black text-sm flex items-center justify-center shrink-0">
                21
              </span>
              <h3 className="text-lg font-bold text-slate-900">सदस्यता समाप्ति (Termination Grounds)</h3>
            </div>
            <p className="text-xs text-slate-600 font-bold">निम्न परिस्थितियों में सदस्यता निलंबित/समाप्त की जा सकती है:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-rose-800 pt-1">
              <span className="p-2.5 bg-rose-50 rounded-xl">1. फर्जी दस्तावेज</span>
              <span className="p-2.5 bg-rose-50 rounded-xl">2. गलत जानकारी</span>
              <span className="p-2.5 bg-rose-50 rounded-xl">3. नाम का दुरुपयोग</span>
              <span className="p-2.5 bg-rose-50 rounded-xl">4. वित्तीय धोखाधड़ी</span>
              <span className="p-2.5 bg-rose-50 rounded-xl">5. गंभीर अनुशासनहीनता</span>
              <span className="p-2.5 bg-rose-50 rounded-xl">6. लगातार उल्लंघन</span>
              <span className="p-2.5 bg-rose-50 rounded-xl">7. संपत्ति दुरुपयोग</span>
              <span className="p-2.5 bg-rose-50 rounded-xl">8. अन्य गंभीर कारण</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              जहाँ आवश्यक हो, संबंधित व्यक्ति को स्पष्टीकरण का अवसर दिया जा सकता है।
            </p>
          </div>
        )}

        {/* ── 22. शिकायत एवं समाधान ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                22
              </span>
              <h3 className="text-lg font-bold text-slate-900">शिकायत एवं समाधान (Grievance Redressal)</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              सदस्य अपनी शिकायत/प्रश्न आधिकारिक: <strong>ईमेल, WhatsApp, हेल्पलाइन (+91 82180 17226) अथवा लिखित आवेदन</strong> के माध्यम से प्रस्तुत कर सकते हैं।
            </p>
            <p className="text-xs text-slate-600">
              ट्रस्ट शिकायत की प्रकृति के अनुसार उचित समय में उसका निष्पक्ष परीक्षण एवं समाधान करेगा।
            </p>
          </div>
        )}

        {/* ── 23. वित्तीय पारदर्शिता एवं लेखा ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                23
              </span>
              <h3 className="text-lg font-bold text-slate-900">वित्तीय पारदर्शिता एवं लेखा (Accounting & Audit)</h3>
            </div>
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>उचित books of accounts रखेगा।</li>
              <li>आय एवं व्यय का पूर्ण रिकॉर्ड रखेगा।</li>
              <li>बैंक लेन-देन का रिकॉर्ड सुरक्षित रखेगा।</li>
              <li>लागू होने पर निर्धारित लेखा/ऑडिट प्रक्रिया अपनाएगा।</li>
              <li>ट्रस्ट की वित्तीय गतिविधियों को लागू कानूनों के अनुसार संचालित करेगा।</li>
            </ol>
          </div>
        )}

        {/* ── 24. नियमों में संशोधन ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                24
              </span>
              <h3 className="text-lg font-bold text-slate-900">नियमों में संशोधन (Amendments Policy)</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              ट्रस्ट की आवश्यकता, परिस्थितियों एवं लागू कानूनों के अनुसार इस नियमावली में संशोधन किया जा सकता है। संशोधन Trust Deed एवं लागू कानूनों के अधीन होगा। नवीनतम स्वीकृत नियमावली ही प्रभावी मानी जाएगी।
            </p>
          </div>
        )}

        {/* ── 25. सहायता राशि के संबंध में महत्वपूर्ण घोषणा ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl p-6 sm:p-7 shadow-sm border-2 border-amber-300 space-y-3">
            <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
              <span className="min-w-8 px-2.5 h-8 rounded-lg bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                25
              </span>
              <h3 className="text-lg font-bold text-slate-900">सहायता राशि के संबंध में महत्वपूर्ण घोषणा (Disclaimer)</h3>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              MFCT द्वारा प्रचारित <strong>₹20–25 लाख अथवा ₹8–10 लाख जैसी राशियाँ संभावित/अनुमानित सामूहिक सहयोग राशि</strong> हैं।
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              इनका निर्धारण: <strong>(सदस्यों की संख्या × वास्तविक सहयोग × पात्र सदस्यों की भागीदारी)</strong> जैसे कारकों पर निर्भर करेगा।
            </p>
            <div className="p-3 bg-white rounded-xl border border-amber-300 text-xs text-amber-950 font-bold">
              ⚠️ किसी सदस्य अथवा लाभार्थी को किसी निश्चित राशि की गारंटी नहीं दी जाएगी।
            </div>
          </div>
        )}

        {/* ── 26. ट्रस्ट का मूल सिद्धांत ── */}
        <div
          className="rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-4 relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, #103825 0%, #06190f 100%)',
            border: '2px solid var(--mfct-gold)',
          }}
        >
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 block">26. ट्रस्ट का मूल सिद्धांत</span>
          
          <blockquote className="text-base sm:text-2xl font-black text-white italic leading-relaxed">
            “हम किसी को लाभ का वादा नहीं करते, हम जरूरत के समय साथ खड़े होने का प्रयास करते हैं।”
          </blockquote>
          
          <p className="text-sm sm:text-base font-semibold text-amber-200">
            “आपका ₹100 छोटा हो सकता है, लेकिन हजारों हाथ मिल जाएँ तो किसी परिवार के लिए बड़ी उम्मीद बन सकते हैं।”
          </p>
        </div>

        {/* ── 27. अंतिम संकल्प ── */}
        <div
          className="rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-4 relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, #0f2d1e 0%, #04120b 100%)',
            border: '2px solid var(--mfct-gold)',
          }}
        >
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 block">27. अंतिम संकल्प</span>

          <p className="text-lg sm:text-2xl font-extrabold text-white">
            MFCT का संकल्प है: <span className="text-amber-300">कोई परिवार मुश्किल में अकेला न रहे।</span>
          </p>

          <p className="text-xs text-slate-300">हमारी कोशिश है कि:</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-200 pt-1">
            <span className="p-2.5 rounded-xl bg-white/10 border border-white/10">यादें → सेवा बनें</span>
            <span className="p-2.5 rounded-xl bg-white/10 border border-white/10">मोहब्बत → मदद बने</span>
            <span className="p-2.5 rounded-xl bg-white/10 border border-white/10">सदस्यता → जिम्मेदारी बने</span>
            <span className="p-2.5 rounded-xl bg-white/10 border border-white/10">एकता → ताकत बने</span>
          </div>

          <p className="text-xs text-slate-300 pt-2">
            और मरहूम मोहम्मद फ़ईम साहब की याद समाज के लिए निरंतर भलाई का माध्यम बने।
          </p>

          <div className="pt-3 flex items-center justify-center gap-2">
            <span className="text-xl">🕊️</span>
            <span className="text-lg sm:text-xl font-black text-amber-400 tracking-wider">
              MFCT — “याद उनकी, सेवा हमारी।”
            </span>
          </div>

          <p className="text-[11px] text-slate-400 tracking-widest pt-1">— समाप्त —</p>
        </div>

      </main>

    </div>
  );
};
