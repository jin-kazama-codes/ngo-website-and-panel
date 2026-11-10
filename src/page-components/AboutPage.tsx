'use client';

import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Quote,
  HeartHandshake,
  Scale,
  Building2,
  HandHeart,
  GraduationCap,
  Stethoscope,
  Users,
  LifeBuoy,
  Wallet,
  Landmark,
  ClipboardList,
} from 'lucide-react';
import { MembershipBanner } from '../components/MembershipBanner';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t, isHindi } = useLanguage();
  const aboutText = (key: string, english: string, hindi: string) =>
    isHindi ? hindi : t(key, english);

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
            <span>{t('about.founders_section_title')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('about.founders_section_subtitle')}
          </h2>
        </div>

        {/* ── Founder 1: Er. Mohammad Zahid (Founder & Chairman) ── */}
        <div
          className="bg-white rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
          style={{
            borderColor: 'rgba(200, 168, 75, 0.4)',
            boxShadow: '0 12px 36px -6px rgba(26, 60, 44, 0.09)',
          }}
        >
          {/* Card Header Tag */}
          <div
            className="px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-bold"
            style={{
              background: 'linear-gradient(90deg, #0a2217 0%, #133c2a 50%, #1a4d36 100%)',
              color: '#f0c868',
              borderColor: 'rgba(200, 168, 75, 0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🔷</span>
              <span className="tracking-wider uppercase text-[12px] font-black">
                {t('about.zahid_role', 'Founder & Chairman — Founder’s Message')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold tracking-wide">
                <Sparkles className="w-3 h-3 text-amber-300" /> {t('about.mfct_founder_tag', 'MFCT Founder')}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Large Portrait & Profile */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
              <div className="relative group w-full max-w-[280px] sm:max-w-[320px]">
                <div
                  className="absolute -inset-2 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"
                  style={{ background: 'linear-gradient(135deg, #c8a84b 0%, #1a3c2c 100%)' }}
                />
                <div
                  className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border-2"
                  style={{ borderColor: 'var(--mfct-gold)' }}
                >
                  <img
                    src="/Mr Mohammad Zahid.jpeg"
                    alt="Er. Mohammad Zahid - Founder & Chairman, MFCT"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/Mr%20Mohammad%20Zahid.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />


                  <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md text-white text-xs font-semibold border border-white/15 flex items-center justify-center gap-1.5 text-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t('about.zahid_role_title', 'Founder & Chairman, MFCT')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t('about.zahid_title')}
                </h3>
                <p className="text-sm font-bold" style={{ color: 'var(--mfct-mid-green)' }}>
                  {t('about.zahid_role_title')}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-slate-600 bg-slate-100 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('about.trust_name_full', 'Mohammad Faeem Charitable Trust')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Complete Founder's Message */}
            <div className="lg:col-span-7 space-y-5 text-slate-700">
              {/* Quote Highlight Box */}
              <div
                className="p-5 sm:p-6 rounded-2xl border relative overflow-hidden shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(200, 168, 75, 0.12) 0%, rgba(26, 60, 44, 0.05) 100%)',
                  borderColor: 'rgba(200, 168, 75, 0.45)',
                }}
              >
                <Quote
                  className="w-12 h-12 absolute -right-2 -bottom-2 opacity-15 pointer-events-none"
                  style={{ color: 'var(--mfct-gold-dark)' }}
                />
                <p
                  className="text-base sm:text-lg font-extrabold leading-relaxed italic"
                  style={{ color: 'var(--mfct-dark-green)' }}
                >
                  {t(
                    'about.zahid_quote',
                    '“मेरे लिए MFCT केवल एक संस्था नहीं, बल्कि एक विचार है—एक ऐसा विचार जिसमें मुश्किल समय में कोई परिवार खुद को अकेला महसूस न करे।”'
                  )}
                </p>
              </div>

              {/* Message Paragraphs */}
              <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed text-slate-700 font-normal">
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
                  className="p-4 sm:p-5 rounded-2xl border-l-4 my-3 space-y-1.5 shadow-sm"
                  style={{
                    background: '#fcf8ee',
                    borderLeftColor: '#c8a84b',
                    borderTop: '1px solid #ebdcb2',
                    borderRight: '1px solid #ebdcb2',
                    borderBottom: '1px solid #ebdcb2',
                  }}
                >
                  <p className="font-extrabold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    {t('about.zahid_callout_label', 'मैं हर सदस्य से यही कहना चाहता हूँ—')}
                  </p>
                  <p className="text-sm sm:text-base font-black leading-snug" style={{ color: '#0f3322' }}>
                    {t('about.zahid_callout_quote', '“सिर्फ सदस्य मत बनिए, किसी जरूरतमंद के सहारे की वजह बनिए।”')}
                  </p>
                </div>

                <p>
                  {t(
                    'about.zahid_p3',
                    'हमारी कोशिश है कि MFCT में सेवा, पारदर्शिता, अनुशासन और आपसी सहयोग को सबसे अधिक महत्व दिया जाए।'
                  )}
                </p>

                <p className="font-semibold text-slate-900">
                  {t(
                    'about.zahid_p4',
                    'हम साथ चलेंगे, साथ बढ़ेंगे और समाज के लिए कुछ ऐसा छोड़कर जाएँगे जिसे आने वाली पीढ़ियाँ याद रखें।'
                  )}
                </p>
              </div>

              {/* Founder Sign-off */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-base sm:text-lg text-slate-900">
                    - {t('about.zahid_title')}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('about.zahid_role_title', 'Founder & Chairman, MFCT')}</p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── Founder 2: Mrs. Amreen (Co-Founder & Secretary–Treasurer) ── */}
        <div
          className="bg-white rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
          style={{
            borderColor: 'rgba(200, 168, 75, 0.4)',
            boxShadow: '0 12px 36px -6px rgba(26, 60, 44, 0.09)',
          }}
        >
          {/* Card Header Tag */}
          <div
            className="px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-bold"
            style={{
              background: 'linear-gradient(90deg, #133c2a 0%, #1e5239 50%, #2e5e42 100%)',
              color: '#f0c868',
              borderColor: 'rgba(200, 168, 75, 0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🔶</span>
              <span className="tracking-wider uppercase text-[12px] font-black">
                {t('about.amreen_role', 'Co-Founder & Secretary–Treasurer — Founder’s Message')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold tracking-wide">
                <Sparkles className="w-3 h-3 text-amber-300" /> {t('about.mfct_cofounder_tag', 'MFCT Co-Founder')}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Large Portrait & Profile */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
              <div className="relative group w-full max-w-[280px] sm:max-w-[320px]">
                <div
                  className="absolute -inset-2 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"
                  style={{ background: 'linear-gradient(135deg, #c8a84b 0%, #2e5e42 100%)' }}
                />
                <div
                  className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border-2"
                  style={{ borderColor: 'var(--mfct-gold)' }}
                >
                  <img
                    src="/Mrs. Amreen.jpeg"
                    alt="Mrs. Amreen - Co-Founder & Secretary-Treasurer, MFCT"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/Mrs.%20Amreen.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

                  <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md text-white text-xs font-semibold border border-white/15 flex items-center justify-center gap-1.5 text-center">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{t('about.amreen_role_short')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t('about.amreen_title', 'Mrs. Amreen Idrisi')}
                </h3>
                <p className="text-sm font-bold" style={{ color: 'var(--mfct-mid-green)' }}>
                  {t('about.amreen_role_title', 'Co-Founder & Secretary–Treasurer, MFCT')}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-slate-600 bg-slate-100 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('about.trust_name_full', 'Mohammad Faeem Charitable Trust')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Complete Founder's Message */}
            <div className="lg:col-span-7 space-y-5 text-slate-700">
              {/* Quote Highlight Box */}
              <div
                className="p-5 sm:p-6 rounded-2xl border relative overflow-hidden shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(200, 168, 75, 0.12) 0%, rgba(46, 94, 66, 0.05) 100%)',
                  borderColor: 'rgba(200, 168, 75, 0.45)',
                }}
              >
                <Quote
                  className="w-12 h-12 absolute -right-2 -bottom-2 opacity-15 pointer-events-none"
                  style={{ color: 'var(--mfct-gold-dark)' }}
                />
                <p
                  className="text-base sm:text-lg font-extrabold leading-relaxed italic"
                  style={{ color: 'var(--mfct-dark-green)' }}
                >
                  {t(
                    'about.amreen_quote',
                    '“मेरे लिए सेवा का अर्थ केवल किसी की मदद करना नहीं, बल्कि जरूरत के समय उसके साथ खड़े होने का एहसास देना है।”'
                  )}
                </p>
              </div>

              {/* Message Paragraphs */}
              <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed text-slate-700 font-normal">
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
                  className="p-4 sm:p-5 rounded-2xl border-l-4 my-3 space-y-1.5 shadow-sm"
                  style={{
                    background: '#fcf8ee',
                    borderLeftColor: '#c8a84b',
                    borderTop: '1px solid #ebdcb2',
                    borderRight: '1px solid #ebdcb2',
                    borderBottom: '1px solid #ebdcb2',
                  }}
                >
                  <p className="text-sm sm:text-base font-black leading-snug" style={{ color: '#0f3322' }}>
                    {t(
                      'about.amreen_callout_quote',
                      '“आज हम किसी का सहारा बनें, ताकि कल जरूरत के समय समाज हमारे साथ खड़ा हो।”'
                    )}
                  </p>
                </div>

                <p className="font-semibold text-slate-900">
                  {t(
                    'about.amreen_p5',
                    'आइए, मिलकर सेवा को अपनी जिम्मेदारी और इंसानियत को अपनी पहचान बनाएं।'
                  )}
                </p>
              </div>

              {/* Founder Sign-off */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-base sm:text-lg text-slate-900">
                    - {t('about.amreen_title', 'Mrs. Amreen Idrisi')}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {t('about.amreen_role_title', 'Co-Founder & Secretary–Treasurer, MFCT')}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>


        {/* ── 3. MFCT's Areas of Work ── */}
        <section className="space-y-6 pt-4" aria-labelledby="about-areas-title">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                background: 'rgba(200, 168, 75, 0.12)',
                color: 'var(--mfct-gold-dark)',
                borderColor: 'rgba(200, 168, 75, 0.3)',
              }}
            >
              {aboutText('about.areas_eyebrow', 'OUR AREAS OF WORK', 'हमारे कार्यक्षेत्र')}
            </span>
            <h2 id="about-areas-title" className="text-2xl sm:text-3xl font-black text-slate-900">
              {aboutText('about.areas_title', 'Where MFCT Focuses Its Efforts', 'MFCT के प्रमुख कार्यक्षेत्र')}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              {aboutText(
                'about.areas_intro',
                'MFCT focuses on six areas of community support. Activities and assistance are organized according to identified needs, available resources, and the purpose of each initiative.',
                'MFCT समुदाय की सहायता के लिए छह प्रमुख क्षेत्रों में काम करता है। प्रत्येक गतिविधि और सहायता की योजना स्थानीय जरूरतों, उपलब्ध संसाधनों और संबंधित पहल के उद्देश्य को ध्यान में रखकर बनाई जाती है।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                key: 'education',
                icon: GraduationCap,
                title: aboutText('about.area_education_title', 'Education Support', 'शिक्षा सहायता'),
                description: aboutText('about.area_education_desc', 'Support related to learning opportunities and educational needs.', 'शिक्षा के अवसरों और शैक्षिक जरूरतों से संबंधित सहायता।'),
              },
              {
                key: 'healthcare',
                icon: Stethoscope,
                title: aboutText('about.area_healthcare_title', 'Healthcare Support', 'स्वास्थ्य सहायता'),
                description: aboutText('about.area_healthcare_desc', 'Support for healthcare-related needs and access to medical assistance.', 'स्वास्थ्य संबंधी जरूरतों और चिकित्सा सहायता तक पहुँच बनाने में सहयोग।'),
              },
              {
                key: 'social',
                icon: HeartHandshake,
                title: aboutText('about.area_social_title', 'Social Welfare', 'सामाजिक कल्याण'),
                description: aboutText('about.area_social_desc', 'Community welfare initiatives designed around local needs.', 'स्थानीय जरूरतों के अनुसार समुदाय के कल्याण के लिए पहल।'),
              },
              {
                key: 'community',
                icon: Users,
                title: aboutText('about.area_community_title', 'Community Development', 'सामुदायिक विकास'),
                description: aboutText('about.area_community_desc', 'Encouraging participation, cooperation, and stronger local communities.', 'लोगों की भागीदारी, आपसी सहयोग और मजबूत स्थानीय समुदायों को प्रोत्साहित करना।'),
              },
              {
                key: 'emergency',
                icon: LifeBuoy,
                title: aboutText('about.area_emergency_title', 'Emergency Assistance', 'आपातकालीन सहायता'),
                description: aboutText('about.area_emergency_desc', 'Helping coordinate support for people facing urgent and difficult situations.', 'कठिन और आपातकालीन परिस्थितियों का सामना कर रहे लोगों के लिए सहायता का समन्वय करना।'),
              },
              {
                key: 'marriage',
                icon: HandHeart,
                title: aboutText('about.area_marriage_title', 'Marriage Assistance', 'विवाह सहायता'),
                description: aboutText('about.area_marriage_desc', 'Support initiatives for eligible individuals and families, based on the trust’s process and available resources.', 'ट्रस्ट की प्रक्रिया और उपलब्ध संसाधनों के अनुसार पात्र व्यक्तियों और परिवारों के लिए सहायता पहल।'),
              },
            ].map(({ key, icon: Icon, title, description }) => (
              <article
                key={key}
                className="h-full p-5 sm:p-6 bg-white rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
                style={{ borderColor: 'rgba(200, 168, 75, 0.25)' }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(26, 60, 44, 0.09)', color: 'var(--mfct-dark-green)' }}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── 4. How Donations Currently Work ── */}
        <section
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2"
          aria-labelledby="about-donations-title"
        >
          <div
            className="lg:col-span-7 rounded-3xl p-6 sm:p-8 text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0f3322 0%, #061910 100%)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/10 text-amber-300">
                <Wallet className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {aboutText('about.donations_eyebrow', 'DONATION INFORMATION', 'दान संबंधी जानकारी')}
              </span>
            </div>
            <h2 id="about-donations-title" className="text-2xl sm:text-3xl font-black mb-3">
              {aboutText('about.donations_title', 'How You Can Contribute', 'आप किस प्रकार योगदान दे सकते हैं')}
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-5">
              {aboutText(
                'about.donations_intro',
                'At present, donations are received through manual methods. Supporters can contribute in person or through a bank transfer, using the instructions shared by the trust.',
                'वर्तमान में दान मैनुअल तरीकों से स्वीकार किया जाता है। समर्थक ट्रस्ट द्वारा साझा किए गए निर्देशों के अनुसार व्यक्तिगत रूप से या बैंक ट्रांसफर के माध्यम से योगदान दे सकते हैं।'
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold mb-2">
                  <HandHeart className="w-5 h-5" aria-hidden="true" />
                  {aboutText('about.donation_manual_title', 'Manual Donation', 'मैनुअल दान')}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {aboutText('about.donation_manual_desc', 'Donors can follow the manual donation instructions shared by the trust. Please contact the trust if you need help confirming the available method or acknowledgement process.', 'दाता ट्रस्ट द्वारा साझा किए गए मैनुअल दान के निर्देशों का पालन कर सकते हैं। उपलब्ध तरीके या दान की रसीद/पुष्टि के बारे में जानकारी के लिए कृपया ट्रस्ट से संपर्क करें।')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold mb-2">
                  <Landmark className="w-5 h-5" aria-hidden="true" />
                  {aboutText('about.donation_bank_title', 'Bank Transfer', 'बैंक ट्रांसफर')}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {aboutText('about.donation_bank_desc', 'Supporters can use the trust’s bank-transfer details and should retain the transaction reference for follow-up.', 'समर्थक ट्रस्ट के बैंक ट्रांसफर विवरण का उपयोग कर सकते हैं। आगे की पुष्टि के लिए लेन-देन का रेफरेंस नंबर सुरक्षित रखें।')}
                </p>
              </div>
            </div>
          </div>

          <aside
            className="lg:col-span-5 rounded-3xl border bg-white p-6 sm:p-8 flex flex-col justify-center"
            style={{ borderColor: 'rgba(200, 168, 75, 0.35)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(200, 168, 75, 0.14)', color: 'var(--mfct-gold-dark)' }}
            >
              <ClipboardList className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">
              {aboutText('about.donation_transparency_title', 'Donation Records and Transparency', 'दान का रिकॉर्ड और पारदर्शिता')}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {aboutText(
                'about.donation_transparency_desc',
                'The trust is working to strengthen the way donation information and fund use are documented and communicated. Supporters should refer to the acknowledgement and information provided by the trust for their contribution.',
                'ट्रस्ट दान और उसके उपयोग से संबंधित जानकारी का रिकॉर्ड रखने और उसे बेहतर तरीके से साझा करने की प्रक्रिया को मजबूत कर रहा है। दान के संबंध में ट्रस्ट द्वारा दी गई रसीद और जानकारी को संदर्भ के रूप में सुरक्षित रखें।'
              )}
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-950 leading-relaxed">
                {aboutText(
                  'about.payment_gateway_notice',
                  'Online payment gateway payments are not available on this website yet. Please use the current donation instructions shared directly by the trust.',
                  'इस वेबसाइट पर ऑनलाइन पेमेंट गेटवे की सुविधा अभी उपलब्ध नहीं है। कृपया फिलहाल ट्रस्ट द्वारा सीधे साझा किए गए दान संबंधी निर्देशों का उपयोग करें।'
                )}
              </p>
            </div>
          </aside>
        </section>

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
                  'मानवीय गरिमा का सम्मान करते हुए जरूरतमंद लोगों और परिवारों की सहायता के प्रयास करना।'
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
                {t('about.val_transparency_title', 'जिम्मेदार वित्तीय प्रबंधन (Responsible Financial Practices)')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  'about.val_transparency_desc',
                  'दान से संबंधित जानकारी और उसके उपयोग का स्पष्ट रिकॉर्ड रखने तथा उसे बेहतर तरीके से साझा करने की दिशा में निरंतर सुधार करना।'
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

        {/* ── 4. Additional Transparency Information (not currently displayed) ── */}
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
