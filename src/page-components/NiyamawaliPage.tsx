'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NiyamawaliPage: React.FC = () => {
  const { isHindi } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: isHindi ? 'सभी नियम (1-27)' : 'All Rules (1-27)' },
    { id: 'foundation', label: isHindi ? 'उद्देश्य एवं सदस्यता' : 'Objectives & Membership' },
    { id: 'support', label: isHindi ? 'निधन व विवाह सहायता' : 'Bereavement & Marriage Aid' },
    { id: 'verification', label: isHindi ? 'पात्रता, नॉमिनी व दस्तावेज' : 'Eligibility & Verification' },
    { id: 'organization', label: isHindi ? 'जिला संगठन व आचार संहिता' : 'Organization & Code of Conduct' },
    { id: 'transparency', label: isHindi ? 'पारदर्शिता व संकल्प' : 'Transparency & Principles' },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 pb-24">

      {/* ── 1. Grand Hero Header (Exact 1:1 Live Design) ── */}
      <section
        className="relative overflow-hidden text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8"
        style={{ background: 'radial-gradient(ellipse at top, #0f3322 0%, #061910 100%)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto text-center space-y-4">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest shadow-md"
            style={{
              background: 'rgba(200,168,75,0.12)',
              border: '1.5px solid #c8a84b',
              color: '#f0c868'
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white pt-1">
            {isHindi ? 'नियमावली एवं संचालन नियम' : 'Rules, Regulations & Bylaws'}
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-xl font-bold tracking-wide" style={{ color: '#e0c068' }}>
            {isHindi ? '“याद उनकी, सेवा हमारी”' : '“In Their Memory, In Our Service”'}
          </p>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {isHindi
              ? 'मोहम्मद फ़ईम चैरिटेबल ट्रस्ट की वैधानिक नियमावली, सामूहिक सहयोग संरचना, सदस्यता दायित्व एवं पारदर्शिता दिशानिर्देश।'
              : 'Official bylaws, mutual welfare support frameworks, membership responsibilities, and transparency guidelines of Mohammad Faeem Charitable Trust.'}
          </p>

          {/* Quick Stat Highlight Boxes (Dark Rounded Translucent Containers) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-6xl mx-auto pt-6 text-left">
            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'वार्षिक सहयोग' : 'Annual Support'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">₹100</span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? 'व्यवस्था संचालन हेतु' : 'For operations'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'आकस्मिक सहायता' : 'Bereavement Aid'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {isHindi ? '₹20-25 लाख*' : '₹20-25 Lakh*'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? 'संभावित सामूहिक सहयोग' : 'Collective welfare goal'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'बेटी विवाह सहायता' : 'Marriage Support'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {isHindi ? '₹8-10 लाख*' : '₹8-10 Lakh*'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? 'संभावित सामूहिक सहयोग' : 'Collective welfare goal'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'पारदर्शिता' : 'Transparency'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {isHindi ? '100% प्रत्यक्ष' : '100% Direct'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? 'खाते में डिजिटल ट्रांसफर' : 'Direct bank transfer'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. Floating Filter Bar (Exact 1:1 Live Design) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl border border-slate-200/80 flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${activeCategory === cat.id
                  ? 'bg-[#0a2e1d] text-[#e0c068] shadow-md scale-105'
                  : 'bg-[#ebf3ef] text-[#2c4035] hover:bg-[#deede5]'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Content Rules Body (Exact 1:1 Live Cards) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">

        {/* ── प्रस्तावना (Preamble) ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="rounded-3xl p-7 sm:p-8 bg-[#0a2e1d] text-white shadow-xl border-2 border-[#c8a84b] space-y-4">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-xl shadow-inner">
                🕊️
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#e0c068] block">
                  {isHindi ? 'प्रस्तावना (PREAMBLE)' : 'PREAMBLE'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {isHindi ? 'मोहम्मद फ़ईम चैरिटेबल ट्रस्ट (MFCT)' : 'Mohammad Faeem Charitable Trust (MFCT)'}
                </h2>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-200">
              {isHindi
                ? 'मोहम्मद फ़ईम चैरिटेबल ट्रस्ट (MFCT) का उद्देश्य मरहूम मोहम्मद फ़ईम साहब की याद को समाजसेवा, मानवीय सहयोग और जनकल्याण के स्थायी प्रयासों से जोड़ना है।'
                : 'The objective of Mohammad Faeem Charitable Trust (MFCT) is to dedicate the memory of Marhoom Mohammad Faeem Sahab to sustainable social service, humanitarian solidarity, and community empowerment.'}
            </p>
            <p className="text-sm leading-relaxed text-slate-200">
              {isHindi
                ? 'ट्रस्ट का मूल विचार है कि कठिन परिस्थितियों में कोई परिवार स्वयं को अकेला और असहाय महसूस न करे तथा समाज के लोग आपसी सहयोग, भाईचारे और इंसानियत की भावना से जरूरतमंदों के साथ खड़े हों।'
                : 'The foundational principle of the Trust is that during acute distress, no family should feel alone or helpless, and members of society should stand with the needy in the spirit of brotherhood and humanity.'}
            </p>
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/25 border border-[#c8a84b]/40 text-[#f5d77f] font-bold text-xs sm:text-sm">
                <span>🕊️</span>
                <span>
                  {isHindi ? 'MFCT का मूल मंत्र: “याद उनकी, सेवा हमारी।”' : 'MFCT Core Motto: “In Their Memory, In Our Service.”'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── 1. नाम एवं पहचान ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'नाम एवं पहचान' : '1. Name & Legal Identity'}
              </h3>
            </div>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
              {isHindi ? (
                <>
                  <li>संस्था का नाम <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong> होगा।</li>
                  <li>संस्था एक सामाजिक एवं जनकल्याणकारी ट्रस्ट के रूप में कार्य करेगी।</li>
                  <li>संस्था का संचालन उसके <strong>Trust Deed, लागू कानूनों तथा समय-समय पर स्वीकृत नियमों</strong> के अनुसार किया जाएगा।</li>
                </>
              ) : (
                <>
                  <li>The organization name shall be <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong>.</li>
                  <li>The organization shall function as an independent public social welfare trust.</li>
                  <li>Operations shall be governed strictly according to its registered <strong>Trust Deed, statutory laws, and approved bylaws</strong>.</li>
                </>
              )}
            </ol>
          </div>
        )}

        {/* ── 2. मुख्य उद्देश्य ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'मुख्य उद्देश्य (Core Objectives)' : '2. Core Objectives'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { num: '1', hi: 'जरूरतमंद परिवारों की सहायता करना।', en: 'Providing relief and emergency support to needy families.' },
                { num: '2', hi: 'आकस्मिक निधन की स्थिति में पात्र सदस्य के परिवार के लिए सामूहिक सहयोग का प्रयास करना।', en: 'Facilitating collective bereavement aid for families of deceased verified members.' },
                { num: '3', hi: 'पात्र सदस्य की बेटी के विवाह में सामूहिक आर्थिक सहयोग का प्रयास करना।', en: 'Supporting verified members during daughter marriages through mutual solidarity.' },
                { num: '4', hi: 'शिक्षा के क्षेत्र में जरूरतमंद विद्यार्थियों की सहायता करना।', en: 'Assisting deserving underprivileged students with educational aids and fees.' },
                { num: '5', hi: 'स्वास्थ्य एवं चिकित्सा सहायता उपलब्ध कराने का प्रयास करना।', en: 'Providing healthcare support, hospital navigation, and medical aid.' },
                { num: '6', hi: 'गरीब, असहाय एवं जरूरतमंद लोगों की सहायता करना।', en: 'Uplifting the destitute, widows, orphans, and vulnerable individuals.' },
                { num: '7', hi: 'भोजन, वस्त्र, राहत सामग्री एवं आवश्यक वस्तुओं का वितरण करना।', en: 'Distributing food kits, clothing, ration, and essential relief items.' },
                { num: '8', hi: 'महिलाओं एवं बेटियों के कल्याण तथा सशक्तिकरण के लिए कार्य करना।', en: 'Working towards the welfare and economic empowerment of women and girls.' },
                { num: '9', hi: 'युवाओं को सामाजिक सेवा से जोड़ना।', en: 'Engaging youth constructively in humanitarian volunteering.' },
                { num: '10', hi: 'समाज में आपसी सहयोग, भाईचारा और मानवता की भावना को मजबूत करना।', en: 'Fostering brotherhood, harmony, and mutual solidarity across society.' },
                { num: '11', hi: 'प्राकृतिक आपदा, दुर्घटना अथवा अन्य कठिन परिस्थितियों में यथासंभव राहत कार्य करना।', en: 'Providing disaster relief and rapid crisis intervention during emergencies.' },
                { num: '12', hi: 'डिजिटल एवं पारदर्शी सामाजिक सहायता व्यवस्था विकसित करना।', en: 'Developing a 100% direct, transparent, and verifiable welfare network.' },
              ].map((item) => (
                <div key={item.num} className="p-3.5 rounded-2xl bg-[#f8faf9] border border-slate-200/90 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 leading-snug">{isHindi ? item.hi : item.en}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. सदस्यता ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'सदस्यता (Membership)' : '3. Membership Policy'}
              </h3>
            </div>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
              {isHindi ? (
                <>
                  <li>ट्रस्ट द्वारा निर्धारित पात्रता पूरी करने वाला व्यक्ति सदस्य बन सकता है।</li>
                  <li>सदस्यता स्वैच्छिक होगी।</li>
                  <li>सदस्य को ट्रस्ट की वर्तमान नियमावली एवं संबंधित योजनाओं के नियमों को स्वीकार करना होगा।</li>
                  <li>सदस्यता का रिकॉर्ड डिजिटल/लिखित रूप में रखा जाएगा।</li>
                  <li>प्रत्येक सदस्य को अपनी व्यक्तिगत जानकारी, मोबाइल नंबर, पता तथा नॉमिनी संबंधी जानकारी सही रखना आवश्यक होगा।</li>
                </>
              ) : (
                <>
                  <li>Any eligible individual meeting the Trust criteria can register as a member.</li>
                  <li>Membership is purely voluntary and non-commercial.</li>
                  <li>Members must abide by the Trust bylaws and scheme regulations.</li>
                  <li>Membership records are maintained digitally and securely.</li>
                  <li>Members must maintain updated contact, Aadhaar, address, and nominee details.</li>
                </>
              )}
            </ol>
          </div>
        )}

        {/* ── 4. वार्षिक व्यवस्था संचालन सहयोग (Exact Yellow Border Container) ── */}
        {(activeCategory === 'all' || activeCategory === 'foundation') && (
          <div className="bg-[#fefdf8] rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-[#fcd34d] space-y-4">
            <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
              <span className="w-8 h-8 rounded-lg bg-[#f59e0b] text-white font-black text-sm flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                  {isHindi ? 'वार्षिक सहयोग' : 'Annual Contribution'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {isHindi ? '₹100 - “वार्षिक व्यवस्था संचालन सहयोग”' : '₹100 - “Annual System & Operations Support”'}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed">
              {isHindi
                ? 'MFCT में ₹100 को सहायता के बदले शुल्क, बीमा प्रीमियम या लाभ खरीदने की राशि नहीं माना जाएगा। इसे “वार्षिक व्यवस्था संचालन सहयोग” के रूप में रखा जाएगा।'
                : 'In MFCT, ₹100 is NOT an insurance premium, fee, or commercial consideration. It is designated as “Annual System Support” to maintain administrative infrastructure.'}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isHindi
                ? 'इसका उद्देश्य ट्रस्ट की प्रशासनिक एवं सामाजिक व्यवस्था को सुचारु रूप से चलाने में सहयोग करना है।'
                : 'Its sole purpose is to support cloud servers, app verification, helplines, and field documentation.'}
            </p>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 space-y-2.5">
              <p className="text-xs font-bold text-slate-800">
                {isHindi ? 'इस राशि का उपयोग आवश्यकतानुसार निम्न कार्यों में किया जा सकता है:' : 'This contribution supports the following operations:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
                <div className="space-y-1">
                  <p>• {isHindi ? 'कार्यालय संचालन' : 'Office Operations'}</p>
                  <p>• {isHindi ? 'हेल्पलाइन एवं संचार' : 'Helpline & Communication'}</p>
                  <p>• {isHindi ? 'प्रचार-प्रसार' : 'Public Awareness'}</p>
                  <p>• {isHindi ? 'सामाजिक व जनकल्याण कार्य' : 'Community Welfare Work'}</p>
                </div>
                <div className="space-y-1">
                  <p>• {isHindi ? 'वेबसाइट एवं ऐप' : 'Website & App Maintenance'}</p>
                  <p>• {isHindi ? 'दस्तावेजीकरण' : 'Documentation & Audit'}</p>
                  <p>• {isHindi ? 'सामाजिक जागरूकता' : 'Social Outreach'}</p>
                </div>
                <div className="space-y-1">
                  <p>• {isHindi ? 'डिजिटल सिस्टम' : 'Cloud Server Infrastructure'}</p>
                  <p>• {isHindi ? 'सदस्य रिकॉर्ड' : 'Member Directory Records'}</p>
                  <p>• {isHindi ? 'आवश्यक प्रशासनिक खर्च' : 'Administrative Expenses'}</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#fef3c7] rounded-2xl text-xs text-[#92400e] font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#b45309]" />
              <span>
                {isHindi
                  ? 'महत्वपूर्ण: ₹100 का वार्षिक सहयोग देने मात्र से किसी व्यक्ति को किसी निश्चित आर्थिक सहायता की गारंटी नहीं होगी।'
                  : 'Important: Contributing ₹100 does NOT guarantee any fixed monetary payout or commercial entitlement.'}
              </span>
            </div>
          </div>
        )}

        {/* ── 5. आकस्मिक निधन सहायता व्यवस्था ── */}
        {(activeCategory === 'all' || activeCategory === 'support') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                5
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'आकस्मिक निधन सहायता व्यवस्था' : '5. Bereavement Welfare Support Scheme'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'यदि किसी सक्रिय एवं वैधानिक सदस्य का आकस्मिक निधन होता है और वह संबंधित योजना की सभी पात्रता शर्तें पूरी करता है, तो MFCT अपने सदस्यों से सामूहिक आर्थिक सहयोग का आह्वान कर सकता है।'
                : 'Upon the sudden demise of an active verified member who meets scheme eligibility, MFCT issues a collective solidarity appeal to all members.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  {isHindi ? 'सदस्य सहयोग' : 'Member Contribution'}
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  {isHindi ? 'न्यूनतम ₹100 प्रति सदस्य' : 'Min ₹100 per member'}
                </p>
                <p className="text-[11px] text-emerald-700 leading-snug">
                  {isHindi ? 'प्राप्त कुल राशि सदस्य संख्या एवं वास्तविक सहयोग पर निर्भर करेगी।' : 'Total pool depends on active member count and real participation.'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fde68a] space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  {isHindi ? 'संभावित सहायता लक्ष्य' : 'Potential Collective Target'}
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  {isHindi ? 'लगभग ₹20-25 लाख तक (अथवा कम/अधिक)' : 'Approx. ₹20-25 Lakh (Estimated Target)'}
                </p>
                <p className="text-[11px] text-amber-700 leading-snug">
                  {isHindi ? 'यह अनुमानित सामूहिक लक्ष्य है, निश्चित लाभ या गारंटी नहीं।' : 'This is an estimated community goal, not a guaranteed return.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. बेटी विवाह सहायता व्यवस्था ── */}
        {(activeCategory === 'all' || activeCategory === 'support') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                6
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'बेटी विवाह सहायता व्यवस्था' : '6. Daughter Wedding Solidarity Scheme'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'किसी पात्र एवं सक्रिय सदस्य की बेटी के विवाह के अवसर पर MFCT सामूहिक सहयोग अभियान चला सकता है।'
                : 'For verified members solemnizing the marriage of their daughter, MFCT initiates a mutual assistance micro-campaign.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                  {isHindi ? 'सदस्य सहयोग' : 'Member Contribution'}
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  {isHindi ? 'न्यूनतम ₹50 प्रति सदस्य' : 'Min ₹50 per member'}
                </p>
                <p className="text-[11px] text-rose-700 leading-snug">
                  {isHindi ? 'सदस्यों की संख्या एवं वास्तविक सहयोग पर निर्भर करेगी।' : 'Actual collected amount depends on voluntary member donations.'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fde68a] space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  {isHindi ? 'संभावित सहायता लक्ष्य' : 'Potential Collective Target'}
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  {isHindi ? 'लगभग ₹8-10 लाख तक (अथवा कम/अधिक)' : 'Approx. ₹8-10 Lakh (Estimated Target)'}
                </p>
                <p className="text-[11px] text-amber-700 leading-snug">
                  {isHindi ? 'यह भी अनुमानित/संभावित राशि है, निश्चित या गारंटीकृत सहायता नहीं।' : 'Community solidarity target, not a commercial guarantee.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 7. सहायता प्राप्त करने की पात्रता ── */}
        {(activeCategory === 'all' || activeCategory === 'verification') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                7
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'सहायता प्राप्त करने की पात्रता (Eligibility Criteria)' : '7. Eligibility Criteria for Assistance'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {isHindi ? 'किसी भी सहायता के लिए निम्न 10 बिंदुओं पर विचार किया जाएगा:' : 'Evaluation is conducted on the following essential parameters:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700 pt-1">
              {[
                { hi: '1. सदस्य की वैधानिक स्थिति', en: '1. Legal and active membership status' },
                { hi: '2. सदस्यता की अवधि', en: '2. Active membership tenure' },
                { hi: '3. संबंधित योजना की पात्रता', en: '3. Scheme-specific eligibility criteria' },
                { hi: '4. आवश्यक सहयोग में सदस्य की भागीदारी', en: '4. Prior participation in community appeals' },
                { hi: '5. लॉक-इन अवधि, यदि लागू हो', en: '5. Fulfillment of lock-in period' },
                { hi: '6. सदस्य द्वारा नियमों का पालन', en: '6. Compliance with bylaws and code of conduct' },
                { hi: '7. आवश्यक दस्तावेज', en: '7. Submission of verified documentary proof' },
                { hi: '8. घटना/दावे का सत्यापन', en: '8. Multi-tier field ground audit' },
                { hi: '9. नॉमिनी की वैधता', en: '9. Validity of designated nominee details' },
                { hi: '10. ट्रस्ट की उपलब्ध व्यवस्था एवं नियम', en: '10. Operational guidelines of the Trust' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#f8faf9] border border-slate-200/80">
                  {isHindi ? item.hi : item.en}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 8. लॉक-इन एवं पात्रता अवधि ── */}
        {(activeCategory === 'all' || activeCategory === 'verification') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                8
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'लॉक-इन एवं पात्रता अवधि (Lock-in Period)' : '8. Lock-in & Qualification Period'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'MFCT प्रत्येक योजना के लिए अलग-अलग Lock-in Period निर्धारित कर सकता है। लॉक-इन अवधि का उद्देश्य यह सुनिश्चित करना होगा कि सदस्य केवल सहायता प्राप्त करने के उद्देश्य से तत्काल सदस्य बनकर योजना का अनुचित लाभ न उठाए।'
                : 'MFCT prescribes lock-in periods for each scheme to ensure genuine long-term solidarity and prevent opportunistic or fraudulent registrations.'}
            </p>
          </div>
        )}

        {/* ── 9. नॉमिनी व्यवस्था ── */}
        {(activeCategory === 'all' || activeCategory === 'verification') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                9
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'नॉमिनी व्यवस्था (Nominee Policy)' : '9. Nominee Designation Policy'}
              </h3>
            </div>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
              {isHindi ? (
                <>
                  <li>प्रत्येक सदस्य को नॉमिनी घोषित करने का अवसर दिया जाएगा।</li>
                  <li>सदस्य को नॉमिनी की जानकारी सही एवं अद्यतन रखनी होगी।</li>
                  <li>नॉमिनी में परिवर्तन निर्धारित प्रक्रिया के अनुसार किया जा सकेगा।</li>
                  <li>नॉमिनी को लेकर विवाद होने पर ट्रस्ट उपलब्ध दस्तावेजों और लागू कानूनों के आधार पर निर्णय लेगा।</li>
                </>
              ) : (
                <>
                  <li>Every member must declare a verified family nominee upon registration.</li>
                  <li>Members must maintain accurate, up-to-date KYC nominee details.</li>
                  <li>Nominee updates can be processed through prescribed administrative channels.</li>
                  <li>In disputes, certified legal heir certificates and statutory laws govern.</li>
                </>
              )}
            </ol>
          </div>
        )}

        {/* ── 10. दस्तावेज एवं सत्यापन ── */}
        {(activeCategory === 'all' || activeCategory === 'verification') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                10
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'दस्तावेज एवं सत्यापन (Verification & Documents)' : '10. Verification & Required Documents'}
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              {isHindi ? 'सहायता अभियान शुरू करने से पहले ट्रस्ट आवश्यक दस्तावेज मांग सकता है:' : 'Required documentation before initiating solidarity appeals:'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 pt-1">
              {[
                { hi: '• सदस्यता विवरण', en: '• Member KYC Record' },
                { hi: '• मृत्यु प्रमाणपत्र', en: '• Death Certificate' },
                { hi: '• आधार/पहचान पत्र', en: '• Aadhaar / ID Proof' },
                { hi: '• नॉमिनी बैंक पासबुक', en: '• Nominee Bank Proof' },
                { hi: '• विवाह प्रमाण पत्र / कार्ड', en: '• Wedding Invitation/Card' },
                { hi: '• अस्पताल बिल / रिपोर्ट', en: '• Medical Bills' },
                { hi: '• Ground Verification', en: '• Field Ground Audit' },
                { hi: '• 100% Direct Transfer', en: '• Bank Digital Receipt' },
              ].map((item, idx) => (
                <span key={idx} className="p-2.5 bg-[#f8faf9] rounded-2xl border border-slate-200/80 font-medium">
                  {isHindi ? item.hi : item.en}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── 11. आर्थिक सहयोग की प्रक्रिया ── */}
        {(activeCategory === 'all' || activeCategory === 'support' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                11
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'आर्थिक सहयोग की प्रक्रिया (Direct Digital Transfer)' : '11. Direct Digital Transfer Process'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'जहाँ संभव और उपयुक्त हो, सहायता अभियान में सदस्य अपना सहयोग सीधे निर्धारित लाभार्थी/नॉमिनी के बैंक खाते में डिजिटल माध्यम (UPI/IMPS/NEFT) से भेज सकते हैं।'
                : 'Members transfer their relief contributions directly to the verified beneficiary / nominee bank account via UPI/IMPS/NEFT with zero middleman deductions.'}
            </p>
          </div>
        )}

        {/* ── 12. डिजिटल पारदर्शिता ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                12
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'डिजिटल पारदर्शिता (Digital Transparency)' : '12. Digital Ledger & Transparency'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'MFCT पारदर्शिता के लिए डिजिटल व्यवस्था विकसित करेगा। सदस्य संख्या, सहायता अभियान, प्राप्त सहयोग, UTR विवरण और वार्षिक वित्तीय रिकॉर्ड पारदर्शी रखे जाते हैं।'
                : 'MFCT maintains complete digital transparency covering active member count, active campaigns, UTR verifications, beneficiary receipts, and annual audited financial statements.'}
            </p>
          </div>
        )}

        {/* ── 13. ट्रस्ट के बैंक खाते ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                13
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'ट्रस्ट के बैंक खाते (Trust Bank Accounts)' : '13. Trust Bank Accounts'}
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside leading-relaxed">
              {isHindi ? (
                <>
                  <li>ट्रस्ट के नाम से आधिकारिक बैंक खाता संचालित होगा।</li>
                  <li>संचालन Trust Deed अनुसार अधिकृत पदाधिकारियों द्वारा होगा।</li>
                  <li>ट्रस्ट के व्यक्तिगत और संस्थागत धन को कड़ाई से अलग रखा जाएगा।</li>
                  <li>ट्रस्ट की आय एवं व्यय का उचित लेखा रखा जाएगा।</li>
                </>
              ) : (
                <>
                  <li>Official dedicated bank accounts operated in the registered name of the Trust.</li>
                  <li>Operated jointly by authorized signatories under Board Resolution.</li>
                  <li>Strict separation between institutional funds and personal accounts.</li>
                  <li>Proper accounting of all receipts and disbursements is maintained.</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* ── 14. Crowdfunding एवं डिजिटल भुगतान ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                14
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'Crowdfunding एवं डिजिटल भुगतान' : '14. Crowdfunding & Digital Payments'}
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside leading-relaxed">
              {isHindi ? (
                <>
                  <li>केवल आधिकारिक बैंक खातों/अधिकृत QR कोड का उपयोग किया जाएगा।</li>
                  <li>प्राप्त धन का पारदर्शी डिजिटल रिकॉर्ड रखा जाएगा।</li>
                  <li>प्रत्येक अभियान का उद्देश्य स्पष्ट किया जाएगा तथा लागू कानूनों का पालन होगा।</li>
                </>
              ) : (
                <>
                  <li>Only official authorized banking channels, QR codes, and gateways are used.</li>
                  <li>Every transaction is logged with immutable digital ledger transparency.</li>
                  <li>Full compliance with Indian charitable trust taxation and financial statutes.</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* ── 15. जिला स्तरीय संगठन ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                15
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'जिला स्तरीय संगठन (Organizational Structure)' : '15. Organizational Structure'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  {isHindi ? 'राज्य स्तर' : 'State Executive Level'}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {isHindi ? 'संरक्षक, अध्यक्ष, उपाध्यक्ष, महासचिव, सचिव, कोषाध्यक्ष, अन्य पदाधिकारी' : 'Patrons, President, Vice-President, General Secretary, Treasurer, Core Board'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  {isHindi ? 'जिला स्तर' : 'District Chapter Level'}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {isHindi ? 'जिला अध्यक्ष, जिला उपाध्यक्ष, जिला महासचिव, जिला सचिव, जिला कोषाध्यक्ष, जिला समन्वयक, स्वयंसेवक टीम' : 'District President, District VP, General Secretary, Coordinator, Ground Audit Volunteers'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 16. जिला अध्यक्ष के प्रमुख दायित्व ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                16
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'जिला अध्यक्ष के प्रमुख दायित्व' : '16. Key Responsibilities of District Leadership'}
              </h3>
            </div>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
              {isHindi ? (
                <>
                  <li>जिले में MFCT का विस्तार करना।</li>
                  <li>सदस्यता अभियान चलाना।</li>
                  <li>जिला टीम बनाना।</li>
                  <li>जरूरतमंद मामलों की प्राथमिक जानकारी प्राप्त करना।</li>
                  <li>आवश्यक होने पर Ground Verification में सहयोग करना।</li>
                  <li>ट्रस्ट की आधिकारिक जानकारी लोगों तक पहुंचाना।</li>
                  <li>गलत सूचना एवं अफवाहों से बचने के लिए जागरूक करना।</li>
                  <li>ट्रस्ट की गोपनीय एवं व्यक्तिगत जानकारी सुरक्षित रखना।</li>
                </>
              ) : (
                <>
                  <li>Expanding MFCT membership campaigns and chapter coordination across the district.</li>
                  <li>Building and mentoring local volunteer teams.</li>
                  <li>Receiving preliminary information of emergency aid cases.</li>
                  <li>Facilitating authentic field ground verifications and documentation for beneficiary cases.</li>
                  <li>Disseminating official Trust information and countering misinformation.</li>
                  <li>Maintaining strict confidentiality of member and beneficiary records.</li>
                </>
              )}
            </ol>
          </div>
        )}

        {/* ── 17. पदाधिकारी की जवाबदेही एवं प्रतिबंध ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 font-black text-sm flex items-center justify-center shrink-0">
                17
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'पदाधिकारी की जवाबदेही एवं प्रतिबंध' : '17. Office Bearer Accountability & Prohibitions'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-bold">
              {isHindi ? 'कोई भी पदाधिकारी निम्न कार्य कदापि नहीं करेगा:' : 'Strict prohibitions for all office bearers:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700 pt-1">
              {[
                { hi: '❌ ट्रस्ट के नाम पर निजी धन संग्रह नहीं करेगा।', en: '❌ Prohibited from collecting private cash in Trust name.' },
                { hi: '❌ व्यक्तिगत बैंक खाते में ट्रस्ट का पैसा नहीं लेगा।', en: '❌ No Trust funds in personal bank accounts.' },
                { hi: '❌ बिना अनुमति कोई वित्तीय वादा नहीं करेगा।', en: '❌ No unauthorized financial commitments.' },
                { hi: '❌ लाभार्थी को निश्चित राशि की गारंटी नहीं देगा।', en: '❌ No commercial payout guarantees to any claimant.' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-rose-50/70 border border-rose-150 rounded-2xl">
                  {isHindi ? item.hi : item.en}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 18. सोशल मीडिया नीति (Exact Light Blue Badge & 3-Col Pills) ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-[#e0e7ff] text-[#4338ca] font-black text-sm flex items-center justify-center shrink-0">
                18
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'सोशल मीडिया नीति' : '18. Social Media Policy'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'MFCT के आधिकारिक सोशल मीडिया माध्यमों पर केवल सत्यापित एवं अधिकृत जानकारी प्रकाशित की जाएगी।'
                : 'Only verified and authorized updates shall be published across official MFCT social channels.'}
            </p>
            <p className="text-xs text-slate-600 font-bold pt-1">
              {isHindi ? 'किसी सदस्य को निम्न सामग्री प्रसारित नहीं करनी चाहिए:' : 'Members must strictly avoid broadcasting:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs sm:text-sm text-slate-700 pt-1">
              {[
                { hi: '❌ अफवाह', en: '❌ Unverified Rumors' },
                { hi: '❌ झूठी जानकारी', en: '❌ Misinformation' },
                { hi: '❌ व्यक्तिगत आरोप', en: '❌ Personal Allegations' },
                { hi: '❌ अपमानजनक सामग्री', en: '❌ Defamatory Content' },
                { hi: '❌ असंबंधित राजनीतिक सामग्री', en: '❌ Partisan Politics' },
                { hi: '❌ संस्था की छवि खराब करने वाली सामग्री', en: '❌ Disparaging Content' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-[#f8fafc] border border-slate-200/70 rounded-2xl font-medium">
                  {isHindi ? item.hi : item.en}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 19. WhatsApp एवं डिजिटल ग्रुप नियम ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                19
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'WhatsApp एवं डिजिटल ग्रुप नियम' : '19. WhatsApp & Digital Group Rules'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'MFCT के आधिकारिक WhatsApp समूह केवल ट्रस्ट से संबंधित: सूचना, सेवा गतिविधि, सहायता अभियान, बैठक, सदस्यता, आधिकारिक फोटो/वीडियो एवं संगठनात्मक कार्य के लिए उपयोग किए जाएंगे।'
                : 'Official MFCT WhatsApp groups are strictly reserved for official notices, relief appeals, meeting schedules, membership drives, and authorized documentation.'}
            </p>
            <div className="bg-[#f8fafc] p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
              {isHindi
                ? 'असंबंधित वीडियो, शुभकामना संदेश, विज्ञापन, राजनीतिक पोस्ट, फॉरवर्ड एवं व्यक्तिगत चर्चा प्रतिबंधित हो सकती है। बार-बार नियमों का उल्लंघन होने पर एडमिन आवश्यक कार्रवाई कर सकता है।'
                : 'Unrelated promotional videos, spam, partisan forwards, and private chatter are prohibited. Group admins may remove persistent violators.'}
            </div>
          </div>
        )}

        {/* ── 20. आचार संहिता ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                20
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'आचार संहिता (Code of Conduct)' : '20. Code of Conduct'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'प्रत्येक सदस्य से अपेक्षा होगी कि वह “सम्मान, अनुशासन, पारदर्शिता और इंसानियत” के सिद्धांतों का पालन करे।'
                : 'Every member is expected to conduct themselves under the core tenets of “Respect, Discipline, Transparency, and Humanity.”'}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'किसी सदस्य द्वारा धोखाधड़ी, फर्जी दस्तावेज, गलत जानकारी, वित्तीय अनियमितता या ट्रस्ट के नाम का दुरुपयोग पाए जाने पर उचित कार्रवाई की जा सकती है।'
                : 'Any member found indulging in fraud, forged records, financial misconduct, or misusing the Trust name shall face immediate disciplinary action.'}
            </p>
          </div>
        )}

        {/* ── 21. सदस्यता समाप्ति (Exact Light Red Badge & 4-Col Pink Pills) ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-[#ffe4e6] text-[#be123c] font-black text-sm flex items-center justify-center shrink-0">
                21
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'सदस्यता समाप्ति (Termination Grounds)' : '21. Membership Termination Grounds'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-bold">
              {isHindi ? 'निम्न परिस्थितियों में सदस्यता निलंबित/समाप्त की जा सकती है:' : 'Grounds for suspension or termination of membership:'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs sm:text-sm text-slate-700 pt-1">
              {[
                { hi: '1. फर्जी दस्तावेज', en: '1. Forged Records' },
                { hi: '2. गलत जानकारी', en: '2. Misinformation' },
                { hi: '3. नाम का दुरुपयोग', en: '3. Misuse of Trust Name' },
                { hi: '4. वित्तीय धोखाधड़ी', en: '4. Financial Fraud' },
                { hi: '5. गंभीर अनुशासनहीनता', en: '5. Gross Indiscipline' },
                { hi: '6. लगातार उल्लंघन', en: '6. Repeated Violations' },
                { hi: '7. संपत्ति दुरुपयोग', en: '7. Misuse of Assets' },
                { hi: '8. अन्य गंभीर कारण', en: '8. Other Major Breaches' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-[#fff1f2] border border-rose-200/60 rounded-2xl text-[#9f1239] font-medium">
                  {isHindi ? item.hi : item.en}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {isHindi ? 'जहाँ आवश्यक हो, संबंधित व्यक्ति को स्पष्टीकरण का अवसर दिया जा सकता है।' : 'Where appropriate, a formal opportunity for clarification shall be provided.'}
            </p>
          </div>
        )}

        {/* ── 22. शिकायत एवं समाधान ── */}
        {(activeCategory === 'all' || activeCategory === 'organization') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                22
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'शिकायत एवं समाधान (Grievance Redressal)' : '22. Grievance Redressal'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'सदस्य अपनी शिकायत/प्रश्न आधिकारिक: ईमेल, WhatsApp, हेल्पलाइन (+91 82180 17226) अथवा लिखित आवेदन के माध्यम से प्रस्तुत कर सकते हैं।'
                : 'Members can submit grievances or inquiries via official Email, WhatsApp, Helpline (+91 82180 17226), or written petition.'}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'ट्रस्ट शिकायत की प्रकृति के अनुसार उचित समय में उसका निष्पक्ष परीक्षण एवं समाधान करेगा।'
                : 'The Trust conducts impartial reviews and provides timely redressal depending on the nature of the matter.'}
            </p>
          </div>
        )}

        {/* ── 23. वित्तीय पारदर्शिता एवं लेखा ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                23
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'वित्तीय पारदर्शिता एवं लेखा (Accounting & Audit)' : '23. Financial Accounting & Audit'}
              </h3>
            </div>
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
              {isHindi ? (
                <>
                  <li>उचित books of accounts रखेगा।</li>
                  <li>आय एवं व्यय का पूर्ण रिकॉर्ड रखेगा।</li>
                  <li>बैंक लेन-देन का रिकॉर्ड सुरक्षित रखेगा।</li>
                  <li>लागू होने पर निर्धारित लेखा/ऑडिट प्रक्रिया अपनाएगा।</li>
                  <li>ट्रस्ट की वित्तीय गतिविधियों को लागू कानूनों के अनुसार संचालित करेगा।</li>
                </>
              ) : (
                <>
                  <li>Maintaining standard books of accounts and transparent expense ledgers.</li>
                  <li>Full digital recording of all revenue, donations, and expenditures.</li>
                  <li>Secured bank statement and UTR reconciliation records.</li>
                  <li>Statutory audit conducted annually by certified Chartered Accountants.</li>
                  <li>Operating financial activities in strict compliance with applicable laws.</li>
                </>
              )}
            </ol>
          </div>
        )}

        {/* ── 24. नियमों में संशोधन ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                24
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'नियमों में संशोधन (Amendments Policy)' : '24. Bylaw Amendments Policy'}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHindi
                ? 'ट्रस्ट की आवश्यकता, परिस्थितियों एवं लागू कानूनों के अनुसार इस नियमावली में संशोधन किया जा सकता है। संशोधन Trust Deed एवं लागू कानूनों के अधीन होगा। नवीनतम स्वीकृत नियमावली ही प्रभावी मानी जाएगी।'
                : 'Amendments may be enacted according to changing needs, prevailing circumstances, and statutory laws. All revisions are subject to the Trust Deed, and the latest ratified version remains legally operative.'}
            </p>
          </div>
        )}

        {/* ── 25. सहायता राशि के संबंध में महत्वपूर्ण घोषणा (Disclaimer) ── */}
        {(activeCategory === 'all' || activeCategory === 'transparency') && (
          <div className="bg-[#fefdf8] rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-[#fcd34d] space-y-3">
            <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
              <span className="w-8 h-8 rounded-lg bg-[#f59e0b] text-white font-black text-sm flex items-center justify-center shrink-0">
                25
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? 'सहायता राशि के संबंध में महत्वपूर्ण घोषणा (Disclaimer)' : '25. Relief Estimate Disclaimer'}
              </h3>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {isHindi
                ? 'MFCT द्वारा प्रचारित ₹20-25 लाख अथवा ₹8-10 लाख जैसी राशियाँ संभावित/अनुमानित सामूहिक सहयोग राशि हैं।'
                : 'Figures such as ₹20-25 Lakh or ₹8-10 Lakh represent potential community solidarity targets based on collective voluntary participation.'}
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              {isHindi
                ? 'इनका निर्धारण: (सदस्यों की संख्या × वास्तविक सहयोग × पात्र सदस्यों की भागीदारी) जैसे कारकों पर निर्भर करेगा।'
                : 'Calculated as: (Active Member Count × Voluntary Participation × Case Verification Status).'}
            </p>
            <div className="p-3.5 bg-white rounded-2xl border border-amber-300 text-xs text-amber-950 font-bold">
              ⚠️ {isHindi ? 'किसी सदस्य अथवा लाभार्थी को किसी निश्चित राशि की गारंटी नहीं दी जाएगी।' : 'No commercial payout or fixed return is guaranteed.'}
            </div>
          </div>
        )}

        {/* ── 26. ट्रस्ट का मूल सिद्धांत ── */}
        <div
          className="rounded-3xl p-7 sm:p-9 text-white shadow-xl text-center space-y-4 relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, #0f3322 0%, #061910 100%)',
            border: '2px solid #c8a84b',
          }}
        >
          <span className="text-xs font-bold tracking-widest uppercase text-[#e0c068] block">
            {isHindi ? '26. ट्रस्ट का मूल सिद्धांत' : '26. Core Philosophy'}
          </span>

          <blockquote className="text-base sm:text-2xl font-black text-white italic leading-relaxed">
            {isHindi
              ? '“हम किसी को लाभ का वादा नहीं करते, हम जरूरत के समय साथ खड़े होने का प्रयास करते हैं।”'
              : '“We do not promise commercial returns; we strive to stand by each other in times of acute distress.”'}
          </blockquote>

          <p className="text-sm sm:text-base font-semibold text-amber-200">
            {isHindi
              ? '“आपका ₹100 छोटा हो सकता है, लेकिन हजारों हाथ मिल जाएँ तो किसी परिवार के लिए बड़ी उम्मीद बन सकते हैं।”'
              : '“Your ₹100 micro-aid may seem small, but thousands of united hands become an insurmountable pillar of hope.”'}
          </p>
        </div>

        {/* ── 27. अंतिम संकल्प ── */}
        <div
          className="rounded-3xl p-7 sm:p-9 text-white shadow-xl text-center space-y-4 relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, #0f2d1e 0%, #04120b 100%)',
            border: '2px solid #c8a84b',
          }}
        >
          <span className="text-xs font-bold tracking-widest uppercase text-[#e0c068] block">
            {isHindi ? '27. अंतिम संकल्प' : '27. Final Pledge'}
          </span>

          <p className="text-lg sm:text-2xl font-extrabold text-white">
            {isHindi ? 'MFCT का संकल्प है:' : 'The solemn pledge of MFCT:'}{' '}
            <span className="text-[#f5d77f]">
              {isHindi ? 'कोई परिवार मुश्किल में अकेला न रहे।' : 'No family shall face calamity alone.'}
            </span>
          </p>

          <p className="text-xs text-slate-300">
            {isHindi ? 'हमारी कोशिश है कि:' : 'Our sacred endeavor:'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-200 pt-1">
            <span className="p-3 rounded-2xl bg-white/10 border border-white/10">
              {isHindi ? 'यादें → सेवा बनें' : 'Memories → Service'}
            </span>
            <span className="p-3 rounded-2xl bg-white/10 border border-white/10">
              {isHindi ? 'मोहब्बत → मदद बने' : 'Compassion → Support'}
            </span>
            <span className="p-3 rounded-2xl bg-white/10 border border-white/10">
              {isHindi ? 'सदस्यता → जिम्मेदारी बने' : 'Membership → Responsibility'}
            </span>
            <span className="p-3 rounded-2xl bg-white/10 border border-white/10">
              {isHindi ? 'एकता → ताकत बने' : 'Unity → Strength'}
            </span>
          </div>

          <p className="text-xs text-slate-300 pt-2">
            {isHindi
              ? 'और मरहूम मोहम्मद फ़ईम साहब की याद समाज के लिए निरंतर भलाई का माध्यम बने।'
              : 'And the cherished memory of Marhoom Mohammad Faeem Sahab remains an eternal source of goodness for society.'}
          </p>

          <div className="pt-3 flex items-center justify-center gap-2">
            <span className="text-xl">🕊️</span>
            <span className="text-lg sm:text-xl font-black text-[#e0c068] tracking-wider">
              MFCT — {isHindi ? '“याद उनकी, सेवा हमारी।”' : '“In Their Memory, In Our Service.”'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 tracking-widest pt-1">
            {isHindi ? '— समाप्त —' : '— Conclusion —'}
          </p>
        </div>

      </main>

    </div>
  );
};
