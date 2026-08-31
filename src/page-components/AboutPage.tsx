'use client';

import React from 'react';
import {
  ShieldCheck,
  Users,
  Award,
  Sparkles,
  Quote,
  HeartHandshake,
  Scale,
  Heart,
  CheckCircle2,
  Building2,
  Compass,
  ArrowRight,
  HandHeart,
  UserCheck
} from 'lucide-react';
import { MembershipBanner } from '../components/MembershipBanner';
import { useLanguage } from '../context/LanguageContext';
import { useAppState } from '../providers/AppStateProvider';
import Link from 'next/link';

export const AboutPage: React.FC = () => {
  const { t, isHindi, isUrdu } = useLanguage();
  const { handleOpenRegister, handleOpenDonate } = useAppState();

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-slate-800 pb-20 animate-fade-in">
      {/* ── 1. Grand Hero Header & Memorial Spirit ── */}
      <section
        className="relative overflow-hidden text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b"
        style={{
          background: 'radial-gradient(ellipse at top, #0f3322 0%, #061910 100%)',
          borderColor: 'rgba(200, 168, 75, 0.25)',
        }}
      >
        {/* Decorative ambient glow */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:24px_24px]" />
        <div
          className="absolute -top-24 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: 'var(--mfct-gold)' }}
        />

        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          {/* Top Trust Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md"
            style={{
              background: 'rgba(200, 168, 75, 0.12)',
              border: '1.5px solid #c8a84b',
              color: '#f0c868',
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{t('about.badge', 'MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)')}</span>
          </div>

          {/* Main Slogan / Motto */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {t('about.hero_title', 'पूरे भारत में सामुदायिक एकजुटता की नई शुरुआत')}
            </h1>
            <p
              className="text-xl sm:text-2xl font-black tracking-wide pt-2 inline-block px-4 py-1 rounded-xl"
              style={{
                color: '#f6d878',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                background: 'rgba(200, 168, 75, 0.1)',
                border: '1px solid rgba(200, 168, 75, 0.25)',
              }}
            >
              🕊️ “{'याद उनकी, सेवा हमारी।'}”
            </p>
          </div>

          {/* Subtitle / Narrative */}
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-200 leading-relaxed font-normal pt-1">
            {t(
              'about.hero_desc',
              'MFCT was founded on a simple human belief every local neighbourhood can become self-sufficient when members unite under a transparent framework.'
            )}
          </p>

          {/* Memorial Tribute Callout Card */}
          <div
            className="mt-8 p-5 sm:p-6 rounded-2xl max-w-3xl mx-auto text-left flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-xl border backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 60, 44, 0.85) 0%, rgba(15, 38, 28, 0.95) 100%)',
              borderColor: 'rgba(200, 168, 75, 0.35)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
              style={{
                background: 'linear-gradient(135deg, #c8a84b 0%, #947728 100%)',
                color: '#0e2418',
              }}
            >
              <HandHeart className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-base text-amber-300 flex items-center justify-center sm:justify-start gap-2">
                <span>{t('about.memorial_title', 'मरहूम मोहम्मद फ़ईम साहब की पावन स्मृति में')}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {t(
                  'about.memorial_desc',
                  'MFCT की नींव इस विश्वास पर रखी गई है कि अपनों की याद को समाज के सबसे कमजोर और जरूरतमंद लोगों की सेवा से जोड़कर एक स्थायी बदलाव लाया जा सकता है।'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Founders' Messages Section (Core Feature) ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12">
        {/* Section Heading Banner */}
        <div className="text-center space-y-2 pt-16">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              background: 'rgba(26, 60, 44, 0.08)',
              color: 'var(--mfct-dark-green)',
              border: '1px solid rgba(26, 60, 44, 0.15)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('about.founders_section_title', 'संस्थापकों का संदेश | Founders’ Messages')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('about.founders_section_subtitle', 'मार्गदर्शक विचार एवं संकल्प जो MFCT के प्रत्येक कार्य की नींव हैं')}
          </h2>
        </div>

        {/* ── Founder 1: Er. Mohammad Zahid (Founder & Chairman) ── */}
        <div
          className="bg-white rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
          style={{
            borderColor: 'rgba(200, 168, 75, 0.35)',
            boxShadow: '0 10px 30px -5px rgba(26, 60, 44, 0.08)',
          }}
        >
          {/* Card Header Tag */}
          <div
            className="px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-bold"
            style={{
              background: 'linear-gradient(90deg, #0f3322 0%, #1a3c2c 100%)',
              color: '#f0c868',
              borderColor: 'rgba(200, 168, 75, 0.25)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🔷</span>
              <span className="tracking-wide uppercase">
                {t('about.zahid_role', 'Founder & Chairman — Founder’s Message')}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px]">
              MFCT Leadership
            </span>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Portrait & Profile */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div
                  className="absolute -inset-1 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-300"
                  style={{ background: 'linear-gradient(135deg, #c8a84b 0%, #1a3c2c 100%)' }}
                />
                <div
                  className="relative w-52 h-64 sm:w-60 sm:h-72 rounded-2xl overflow-hidden border-3 shadow-lg bg-slate-100"
                  style={{ borderColor: 'var(--mfct-gold)' }}
                >
                  <img
                    src="/Mr Mohammad Zahid.jpeg"
                    alt="Er. Mohammad Zahid - Founder & Chairman, MFCT"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // fallback if path with spaces needs encoding
                      (e.currentTarget as HTMLImageElement).src = '/Mr%20Mohammad%20Zahid.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Founder & Chairman</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {t('about.zahid_title', 'Er. Mohammad Zahid')}
                </h3>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--mfct-mid-green)' }}>
                  Founder & Chairman, MFCT
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                  <span>Mohammad Faeem Charitable Trust</span>
                </div>
              </div>
            </div>

            {/* Right Column: Complete Founder's Message */}
            <div className="lg:col-span-8 space-y-5 text-slate-700">
              {/* Quote Highlight Box */}
              <div
                className="p-5 rounded-2xl border relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(26, 60, 44, 0.04) 100%)',
                  borderColor: 'rgba(200, 168, 75, 0.4)',
                }}
              >
                <Quote
                  className="w-10 h-10 absolute -right-2 -bottom-2 opacity-15 pointer-events-none"
                  style={{ color: 'var(--mfct-gold-dark)' }}
                />
                <p
                  className="text-base sm:text-lg font-bold leading-relaxed italic"
                  style={{ color: 'var(--mfct-dark-green)' }}
                >
                  {t(
                    'about.zahid_quote',
                    '“मेरे लिए MFCT केवल एक संस्था नहीं, बल्कि एक विचार है—एक ऐसा विचार जिसमें मुश्किल समय में कोई परिवार खुद को अकेला महसूस न करे।”'
                  )}
                </p>
              </div>

              {/* Message Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700">
                <p>
                  {t(
                    'about.zahid_p1',
                    'मरहूम मोहम्मद फ़ईम साहब की याद को समाज की सेवा से जोड़ने की प्रेरणा से हमने MFCT की शुरुआत की। मेरा विश्वास है कि यदि समाज के लोग एक-दूसरे के साथ खड़े हों, तो छोटी-छोटी कोशिशें मिलकर किसी जरूरतमंद परिवार के लिए बहुत बड़ा सहारा बन सकती हैं।'
                  )}
                </p>

                <p>
                  {t(
                    'about.zahid_p2',
                    'मेरा सपना है कि MFCT केवल एक शहर या जिले तक सीमित न रहे, बल्कि हर उस व्यक्ति तक पहुँचे जिसे समाज के सहयोग की आवश्यकता है।'
                  )}
                </p>

                {/* Callout Box for Member Appeal */}
                <div
                  className="p-4 sm:p-5 rounded-xl border-l-4 my-3 space-y-1 shadow-sm"
                  style={{
                    background: '#fcf8ee',
                    borderLeftColor: '#c8a84b',
                    borderTop: '1px solid #ebdcb2',
                    borderRight: '1px solid #ebdcb2',
                    borderBottom: '1px solid #ebdcb2',
                  }}
                >
                  <p className="font-bold text-xs uppercase tracking-wide text-amber-900">
                    {t('about.zahid_callout_label', 'मैं हर सदस्य से यही कहना चाहता हूँ—')}
                  </p>
                  <p className="text-sm sm:text-base font-black" style={{ color: '#0f3322' }}>
                    {t('about.zahid_callout_quote', '“सिर्फ सदस्य मत बनिए, किसी जरूरतमंद के सहारे की वजह बनिए।”')}
                  </p>
                </div>

                <p>
                  {t(
                    'about.zahid_p3',
                    'हमारी कोशिश है कि MFCT में सेवा, पारदर्शिता, अनुशासन और आपसी सहयोग को सबसे अधिक महत्व दिया जाए।'
                  )}
                </p>

                <p className="font-medium text-slate-800">
                  {t(
                    'about.zahid_p4',
                    'हम साथ चलेंगे, साथ बढ़ेंगे और समाज के लिए कुछ ऐसा छोड़कर जाएँगे जिसे आने वाली पीढ़ियाँ याद रखें।'
                  )}
                </p>
              </div>

              {/* Founder Sign-off */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    — {t('about.zahid_title', 'Er. Mohammad Zahid')}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">Founder & Chairman, MFCT</p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(26, 60, 44, 0.08)',
                    color: 'var(--mfct-dark-green)',
                  }}
                >
                  MFCT Leadership Council
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Founder 2: Mrs. Amreen (Co-Founder & Secretary–Treasurer) ── */}
        <div
          className="bg-white rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
          style={{
            borderColor: 'rgba(200, 168, 75, 0.35)',
            boxShadow: '0 10px 30px -5px rgba(26, 60, 44, 0.08)',
          }}
        >
          {/* Card Header Tag */}
          <div
            className="px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-bold"
            style={{
              background: 'linear-gradient(90deg, #1a3c2c 0%, #2e5e42 100%)',
              color: '#f0c868',
              borderColor: 'rgba(200, 168, 75, 0.25)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🔶</span>
              <span className="tracking-wide uppercase">
                {t('about.amreen_role', 'Co-Founder & Secretary–Treasurer — Founder’s Message')}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px]">
              MFCT Co-Founder
            </span>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Portrait & Profile */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div
                  className="absolute -inset-1 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-300"
                  style={{ background: 'linear-gradient(135deg, #c8a84b 0%, #2e5e42 100%)' }}
                />
                <div
                  className="relative w-52 h-64 sm:w-60 sm:h-72 rounded-2xl overflow-hidden border-3 shadow-lg bg-slate-100"
                  style={{ borderColor: 'var(--mfct-gold)' }}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Co-Founder & Secretary–Treasurer</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {t('about.amreen_title', 'Mrs. Amreen')}
                </h3>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--mfct-mid-green)' }}>
                  Co-Founder & Secretary–Treasurer, MFCT
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                  <span>Mohammad Faeem Charitable Trust</span>
                </div>
              </div>
            </div>

            {/* Right Column: Complete Founder's Message */}
            <div className="lg:col-span-8 space-y-5 text-slate-700">
              {/* Quote Highlight Box */}
              <div
                className="p-5 rounded-2xl border relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(200, 168, 75, 0.08) 0%, rgba(46, 94, 66, 0.05) 100%)',
                  borderColor: 'rgba(200, 168, 75, 0.4)',
                }}
              >
                <Quote
                  className="w-10 h-10 absolute -right-2 -bottom-2 opacity-15 pointer-events-none"
                  style={{ color: 'var(--mfct-gold-dark)' }}
                />
                <p
                  className="text-base sm:text-lg font-bold leading-relaxed italic"
                  style={{ color: 'var(--mfct-dark-green)' }}
                >
                  {t(
                    'about.amreen_quote',
                    '“मेरे लिए सेवा का अर्थ केवल किसी की मदद करना नहीं, बल्कि जरूरत के समय उसके साथ खड़े होने का एहसास देना है।”'
                  )}
                </p>
              </div>

              {/* Message Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700">
                <p>
                  {t(
                    'about.amreen_p1',
                    'MFCT से जुड़ने का मेरा उद्देश्य है कि समाज में आपसी सहयोग, संवेदना और इंसानियत की भावना को और मजबूत किया जाए।'
                  )}
                </p>

                <p>
                  {t(
                    'about.amreen_p2',
                    'हम चाहते हैं कि MFCT ऐसा मंच बने जहाँ हर सदस्य यह महसूस करे कि वह केवल एक संस्था का हिस्सा नहीं, बल्कि एक बड़े परिवार का हिस्सा है।'
                  )}
                </p>

                <p>
                  {t(
                    'about.amreen_p3',
                    'हमारा प्रयास रहेगा कि संस्था की प्रत्येक गतिविधि में ईमानदारी, जिम्मेदारी और पारदर्शिता बनी रहे और जरूरतमंद लोगों तक सहायता सम्मान के साथ पहुँचे।'
                  )}
                </p>

                <p>
                  {t(
                    'about.amreen_p4',
                    'मैं विशेष रूप से महिलाओं, युवाओं और परिवारों से कहना चाहती हूँ कि वे इस मुहिम से जुड़ें और अपने आसपास के लोगों को भी जोड़ें। क्योंकि एक व्यक्ति की शुरुआत एक आंदोलन का रूप ले सकती है।'
                  )}
                </p>

                {/* Callout Box for Mutual Stand */}
                <div
                  className="p-4 sm:p-5 rounded-xl border-l-4 my-3 space-y-1 shadow-sm"
                  style={{
                    background: '#fcf8ee',
                    borderLeftColor: '#c8a84b',
                    borderTop: '1px solid #ebdcb2',
                    borderRight: '1px solid #ebdcb2',
                    borderBottom: '1px solid #ebdcb2',
                  }}
                >
                  <p className="text-sm sm:text-base font-black" style={{ color: '#0f3322' }}>
                    {t(
                      'about.amreen_callout_quote',
                      '“आज हम किसी का सहारा बनें, ताकि कल जरूरत के समय समाज हमारे साथ खड़ा हो।”'
                    )}
                  </p>
                </div>

                <p className="font-semibold" style={{ color: 'var(--mfct-mid-green)' }}>
                  {t(
                    'about.amreen_p5',
                    'आइए, मिलकर सेवा को अपनी जिम्मेदारी और इंसानियत को अपनी पहचान बनाएं।'
                  )}
                </p>
              </div>

              {/* Founder Sign-off */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    — {t('about.amreen_title', 'Mrs. Amreen')}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Co-Founder & Secretary–Treasurer, MFCT
                  </p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(200, 168, 75, 0.15)',
                    color: 'var(--mfct-gold-dark)',
                    border: '1px solid rgba(200, 168, 75, 0.3)',
                  }}
                >
                  MFCT Executive Secretariat
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Four Core Values (संस्था के 4 मूल स्तंभ) ── */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold border inline-block"
              style={{
                background: 'rgba(200, 168, 75, 0.12)',
                color: 'var(--mfct-gold-dark)',
                borderColor: 'rgba(200, 168, 75, 0.3)',
              }}
            >
              {t('about.values_title', 'संस्था के 4 मूल स्तंभ एवं मूल्य')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('about.values_subtitle', 'सेवा, पारदर्शिता, अनुशासन और आपसी सहयोग')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Value 1: Service */}
            <div
              className="p-6 bg-white rounded-3xl border shadow-sm space-y-3 transition hover:-translate-y-1 hover:shadow-md"
              style={{ borderColor: 'rgba(200, 168, 75, 0.25)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #2e5e42 100%)' }}
              >
                <HandHeart className="w-6 h-6 text-amber-300" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {t('about.val_service_title', 'निस्वार्थ सेवा (Selfless Service)')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  'about.val_service_desc',
                  'मानवीय गरिमा के साथ जरूरतमंदों की मदद और आपातकालीन परिस्थितियों में तुरंत सहायता पहुंचाना।'
                )}
              </p>
            </div>

            {/* Value 2: Transparency */}
            <div
              className="p-6 bg-white rounded-3xl border shadow-sm space-y-3 transition hover:-translate-y-1 hover:shadow-md"
              style={{ borderColor: 'rgba(200, 168, 75, 0.25)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #c8a84b 0%, #947728 100%)' }}
              >
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {t('about.val_transparency_title', '100% पारदर्शिता (Escrow Transparency)')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  'about.val_transparency_desc',
                  'प्रत्येक दान का पाई-पाई हिसाब, अस्पतालों और आपूर्तिकर्ताओं को सीधा भुगतान, बिना किसी बिचौलिए के।'
                )}
              </p>
            </div>

            {/* Value 3: Discipline */}
            <div
              className="p-6 bg-white rounded-3xl border shadow-sm space-y-3 transition hover:-translate-y-1 hover:shadow-md"
              style={{ borderColor: 'rgba(200, 168, 75, 0.25)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)' }}
              >
                <Scale className="w-6 h-6 text-amber-300" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {t('about.val_discipline_title', 'सख्त अनुशासन (Rules & Governance)')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  'about.val_discipline_desc',
                  '27 कठोर नियमावली, बहु-स्तरीय सत्यापन और निष्पक्ष संचालन द्वारा विश्वसनीयता सुनिश्चित करना।'
                )}
              </p>
            </div>

            {/* Value 4: Mutual Solidarity */}
            <div
              className="p-6 bg-white rounded-3xl border shadow-sm space-y-3 transition hover:-translate-y-1 hover:shadow-md"
              style={{ borderColor: 'rgba(200, 168, 75, 0.25)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #2e5e42 0%, #3d7a55 100%)' }}
              >
                <HeartHandshake className="w-6 h-6 text-amber-300" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {t('about.val_solidarity_title', 'आपसी सहयोग (Mutual Solidarity)')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  'about.val_solidarity_desc',
                  'एक ऐसा परिवार जहाँ हर सदस्य एक-दूसरे के सुख-दुख में कंधे से कंधा मिलाकर खड़ा रहे।'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. Core Transparency Pillars ── */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div
            className="p-6 bg-white rounded-3xl border shadow-sm space-y-3"
            style={{ borderColor: 'rgba(200, 168, 75, 0.25)' }}
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {t('about.pillar1_title', '100% Escrow Transparency')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t(
                'about.pillar1_desc',
                'Donations are never transferred to unverified personal bank accounts. All funds are paid directly to hospitals, medical suppliers, or vendors.'
              )}
            </p>
          </div>

          <div
            className="p-6 bg-white rounded-3xl border shadow-sm space-y-3"
            style={{ borderColor: 'rgba(200, 168, 75, 0.25)' }}
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {t('about.pillar2_title', 'Mutual Member Benefits')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t(
                'about.pillar2_desc',
                'A small ₹100 membership fee gives members dual status: the chance to give back and guaranteed priority assistance during a personal emergency.'
              )}
            </p>
          </div>

          <div
            className="p-6 bg-white rounded-3xl border shadow-sm space-y-3"
            style={{ borderColor: 'rgba(200, 168, 75, 0.25)' }}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {t('about.pillar3_title', 'Zakat & 80G Tax Exemption')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t(
                'about.pillar3_desc',
                'Strict system rules ensure Zakat reaches only eligible beneficiaries, while all contributors receive instant 80G tax benefit receipts.'
              )}
            </p>
          </div>
        </div> */}

        {/* ── 5. Call to Action / Membership Banner ── */}
        <MembershipBanner />
      </section>
    </div>
  );
};
