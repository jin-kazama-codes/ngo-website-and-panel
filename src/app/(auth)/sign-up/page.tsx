'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  ArrowRight,
  Bell,
  Check,
  Clock,
  Send,
  Phone,
  FileText,
  Home,
  LogIn,
  Heart
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../../context/LanguageContext';
import { LanguageSelector } from '../../../components/LanguageSelector';

export default function SignUpPage() {
  const { language } = useLanguage();
  const [notifyContact, setNotifyContact] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Multilingual helper: Hindi, Urdu, English
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const dir = language === 'ur' ? 'rtl' : 'ltr';

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const input = notifyContact.trim();

    if (!input) {
      setErrorMessage(
        tr(
          'कृपया अपना मोबाइल नंबर या ईमेल पता दर्ज करें।',
          'براہ کرم اپنا موبائل نمبر یا ای میل درج کریں۔',
          'Please enter your phone number or email address.'
        )
      );
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      // Store in localStorage for persistence
      try {
        const existing = JSON.parse(localStorage.getItem('mfct_notify_list') || '[]');
        existing.push({ contact: input, date: new Date().toISOString() });
        localStorage.setItem('mfct_notify_list', JSON.stringify(existing));
      } catch (err) {
        console.error('Storage error:', err);
      }

      setSubmitting(false);
      setSubscribed(true);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#c8a84b', '#0f3322', '#10b981', '#f59e0b'],
        });
      } catch {}
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8f6f1]" dir={dir}>
      {/* ── LEFT: Branding & Solidarity Sidebar (Desktop) ── */}
      <div
        className="hidden lg:flex lg:w-[40%] xl:w-[38%] flex-col justify-between p-10 xl:p-12 text-white relative overflow-hidden shrink-0"
        style={{ background: 'radial-gradient(ellipse at top left, #0f3322 0%, #061910 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none bg-[#c8a84b]" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none bg-[#2e5e42]" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <img
              src="/mfct-logo.jpeg"
              alt="MFCT Logo"
              className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-[#c8a84b] transition-transform group-hover:scale-105"
            />
            <div>
              <p className="text-white font-black text-base tracking-tight leading-none">MFCT</p>
              <p className="text-[11px] font-medium leading-none mt-1 text-amber-200/80">
                Mohammad Faeem Charitable Trust
              </p>
            </div>
          </Link>
        </div>

        {/* Center Copy */}
        <div className="relative z-10 space-y-6 my-auto py-8">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              background: 'rgba(200,168,75,0.15)',
              border: '1px solid rgba(200,168,75,0.35)',
              color: '#f0c868',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {tr(
                'सदस्यता एकजुटता कार्यक्रम',
                'ممبرشپ یکجہتی پروگرام',
                'Membership Solidarity Program'
              )}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              {tr('सत्यापित समुदाय', 'تصدیق شدہ کمیونٹی', 'Become a Verified')}
              <br />
              <span style={{ color: '#f6d878' }}>
                {tr('सदस्य बनें।', 'ممبر بنیں۔', 'Community Member.')}
              </span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-300">
              {tr(
                'अपने स्थानीय समुदाय से जुड़ें। दानकर्ता बनें और आपातकालीन सहायता के पात्र भी। ₹100 की वार्षिक सदस्यता आपको प्राथमिकता देती है।',
                'اپنی مقامی کمیونٹی میں شامل ہوں۔ عطیہ دہندہ اور ہنگامی امداد کے اہل بنیں۔ ₹100 کی سالانہ فیس آپ کو ترجیحی حیثیت دیتی ہے۔',
                'Join your local neighbourhood community. Become an active supporter and get direct priority emergency relief.'
              )}
            </p>
          </div>

          {/* Benefits Preview */}
          <div className="space-y-3 pt-2">
            {[
              {
                icon: ShieldCheck,
                title: tr('100% पारदर्शी एस्क्रो', '100% شفاف ایسکرو', '100% Direct Escrow'),
                desc: tr(
                  'दान सीधे सत्यापित अस्पताल व विक्रेता को जाता है',
                  'عطیات براہ راست ہسپتال اور دکان جاتے ہیں',
                  'Direct hospital and vendor relief disbursements'
                ),
              },
              {
                icon: HeartHandshake,
                title: tr('पारस्परिक आपातकालीन सुरक्षा', 'باہمی ہنگامی تحفظ', 'Mutual Emergency Relief'),
                desc: tr(
                  'पंजीकृत सदस्यों को आवश्यकता पड़ने पर प्राथमिकता',
                  'ممبرز کو ضرورت کے وقت ترجیحی امداد',
                  'Priority relief for registered members in distress'
                ),
              },
              {
                icon: CheckCircle2,
                title: tr('डिजिटल सदस्य पहचान पत्र', 'ڈیجیٹل ممبر شناختی کارڈ', 'Digital Member ID Card'),
                desc: tr(
                  'आधिकारिक MFCT समुदाय कार्ड और QR सत्यापन',
                  'سرکاری MFCT کارڈ اور کیو آر تصدیق',
                  'Instant official membership card with QR verification'
                ),
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs italic leading-relaxed text-slate-300">
            {tr(
              '"एक छोटी-सी मदद किसी के जीवन में बड़ा बदलाव ला सकती है।"',
              '"ایک چھوٹی سی مدد کسی کی زندگی میں बड़ा بدلاؤ لا سکتی ہے۔"',
              '"A small act of solidarity transforms lives and strengthens our community."'
            )}
          </p>
          <p className="text-[11px] font-bold mt-1.5 text-amber-300">
            — Er. Mohammad Zahid,{' '}
            {tr('संस्थापक और अध्यक्ष', 'بانی و چیئرمین', 'Founder & Chairman')}
          </p>
        </div>
      </div>

      {/* ── RIGHT: Coming Soon Presentation & Notification Box ── */}
      <div className="flex-1 flex flex-col justify-between p-5 sm:p-8 lg:p-12 overflow-y-auto max-w-3xl mx-auto w-full">
        <div className="w-full space-y-6">
          {/* Top Bar: Mobile Logo, Language Switcher & Sign In Link */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <Link href="/" className="lg:hidden flex items-center gap-2.5 group">
              <img
                src="/mfct-logo.jpeg"
                alt="MFCT Logo"
                className="w-9 h-9 rounded-full object-cover shadow border-2 border-[#c8a84b]/60 group-hover:scale-105 transition-transform"
              />
              <span className="font-black text-sm text-[#0f3322]">MFCT</span>
            </Link>

            <div className="flex items-center gap-3 ml-auto">
              <LanguageSelector compact mode="website" />
              <span className="text-slate-300 hidden sm:inline">|</span>
              <div className="text-xs font-medium text-slate-600 hidden sm:block">
                {tr('पहले से सदस्य हैं?', 'پہلے سے ممبر ہیں؟', 'Already registered?')}{' '}
                <Link
                  href="/sign-in"
                  className="font-bold underline decoration-2 text-[#0f3322] hover:text-emerald-700"
                >
                  {tr('साइन इन करें', 'سائن ان کریں', 'Sign In')}
                </Link>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              COMING SOON MAIN HERO CARD
             ════════════════════════════════════════════════════════════════ */}
          <div
            className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border"
            style={{
              background: 'linear-gradient(135deg, #0f3322 0%, #0d281a 55%, #1a3c2c 100%)',
              borderColor: 'rgba(200,168,75,0.4)',
            }}
          >
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[#f0c868] text-xs font-black tracking-wider uppercase">
                <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>
                  {tr(
                    'पंजीकरण जल्द शुरू होगा',
                    'رجسٹریشن جلد شروع ہوگی',
                    'Registration Coming Soon'
                  )}
                </span>
              </div>

              {/* Headings in Hindi & English */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                  {tr(
                    'ऑनलाइन सदस्यता पंजीकरण जल्द ही शुरू होगा!',
                    'آن لائن ممبرشپ رجسٹریشن جلد شروع ہوگی!',
                    'Online Member Registration Coming Soon!'
                  )}
                </h2>
                <p className="text-amber-200/90 font-medium text-xs sm:text-sm">
                  {language === 'hi'
                    ? 'Registration Portal Launching Soon • Mohammad Faeem Charitable Trust'
                    : language === 'ur'
                    ? 'آن لائن رجسٹریشن پورٹل جلد دستیاب ہوگا • محمد فہیم چیریٹیبل ٹرسٹ'
                    : 'Online Membership Portal Launching Soon • MFCT Trust'}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                {tr(
                  'हम आपके लिए एक पारदर्शी, सुरक्षित और सहज ऑनलाइन सदस्यता प्रणाली तैयार कर रहे हैं। शीघ्र ही आप घर बैठे ₹100 की एकजुटता सदस्यता लेकर अपना डिजिटल पहचान पत्र और आपातकालीन सहायता पात्रता प्राप्त कर सकेंगे।',
                  'ہم آپ کے لیے ایک شفاف اور محفوظ آن لائن ممبرشپ پورٹل تیار کر رہے ہیں۔ جلد ہی آپ ₹100 کی فیس ادا کر کے اپنا ڈیجیٹل کارڈ اور ہنگامی امداد کی اہلیت حاصل کر سکیں گے۔',
                  'We are putting the final touches on a seamless, transparent, and secure membership portal. You will soon be able to register online, make solidarity payments, and receive your verified Digital Member ID card instantly.'
                )}
              </p>

              {/* Key Features Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  {
                    icon: CheckCircle2,
                    text: tr(
                      'त्वरित डिजिटल ID कार्ड',
                      'ڈیجیٹل کارڈ کی فوری فراہمی',
                      'Instant Digital QR ID Card'
                    ),
                  },
                  {
                    icon: ShieldCheck,
                    text: tr(
                      '100% पारदर्शी एस्क्रो UTR',
                      '100% شفاف تصدیق',
                      '100% Escrow & UTR Verification'
                    ),
                  },
                  {
                    icon: HeartHandshake,
                    text: tr(
                      'आपातकालीन राहत प्राथमिकता',
                      'ہنگامی امداد کی ترجیح',
                      'Priority Emergency Relief'
                    ),
                  },
                  {
                    icon: Sparkles,
                    text: tr(
                      'मात्र ₹100 वार्षिक अंशदान',
                      'صرف ₹100 سالانہ یکجہتی',
                      'Only ₹100 Annual Contribution'
                    ),
                  },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-slate-200"
                  >
                    <Icon className="w-4 h-4 text-[#f0c868] shrink-0" />
                    <span className="truncate">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              NOTIFY ME FORM / PRE-REGISTRATION INTEREST
             ════════════════════════════════════════════════════════════════ */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-700">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  {tr(
                    'पंजीकरण शुरू होते ही सूचित हों',
                    'رجسٹریشن کھلتے ہی اطلاع حاصل کریں',
                    'Get Notified When Registration Opens'
                  )}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {tr(
                    'अपना मोबाइल नंबर या ईमेल दर्ज करें। पोर्टल लाइव होते ही आपको सबसे पहले संदेश प्राप्त होगा।',
                    'اپنا موبائل نمبر یا ای میل درج کریں۔ پورٹل شروع ہوتے ہی آپ کو مطلع کر دیا جائے گا۔',
                    'Leave your phone number or email to receive an instant alert when online registration begins.'
                  )}
                </p>
              </div>
            </div>

            {subscribed ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-emerald-950">
                    {tr(
                      'धन्यवाद! आपका विवरण दर्ज कर लिया गया है।',
                      'شکریہ! آپ کی تفصیلات درج کر لی گئی ہیں۔',
                      'Thank You! Your details have been recorded.'
                    )}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {tr(
                      'जैसे ही ऑनलाइन सदस्यता शुरू होगी, हम आपको तुरंत सूचित करेंगे।',
                      'جیسے ہی رجسٹریشن شروع ہوگی، ہم آپ کو مطلع کریں گے۔',
                      'We will notify you immediately when membership registration goes live.'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-3">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    required
                    value={notifyContact}
                    onChange={(e) => setNotifyContact(e.target.value)}
                    placeholder={tr(
                      'उदा. 9876543210 या yourname@gmail.com',
                      'مثال: 9876543210 یا yourname@gmail.com',
                      'e.g. 9876543210 or yourname@gmail.com'
                    )}
                    className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="cursor-pointer py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm text-[#f0c868] transition-all flex items-center justify-center gap-2 shrink-0 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)' }}
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{tr('मुझे सूचित करें', 'مجھے مطلع کریں', 'Notify Me')}</span>
                        <Send className="w-3.5 h-3.5 text-amber-300" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════
              DIRECT CONTACT & HELPLINE SECTION
             ════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Direct Help */}
            <a
              href="https://wa.me/918218017226?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87!%20%E0%A4%AE%E0%A5%88%E0%A4%82%20MFCT%20%E0%A4%B8%E0%A4%A6%E0%A4%B8%E0%A5%8D%E0%A4%AF%E0%A4%A4%E0%A4%BE%20%E0%A4%AA%E0%A4%82%E0%A4%9C%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3%20%E0%A4%95%E0%A5%87%20%E0%A4%AC%E0%A4%BE%E0%A4%B0%E0%A5%87%20%E0%A4%AE%E0%A5%87%E0%A4%82%20%E0%A4%9C%E0%A4%BE%E0%A4%A8%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%80%20%E0%A4%9A%E0%A4%BE%E0%A4%B9%E0%A4%A4%E0%A4%BE%20%E0%A4%B9%E0%A5%82%E0%A4%81%E0%A5%A4"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/90 flex items-center gap-3.5 transition-all group shadow-xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <FaWhatsapp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">
                  {tr('WhatsApp सहायता', 'واٹس ایپ رابطہ', 'WhatsApp Helpdesk')}
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold truncate mt-0.5">
                  +91 82180 17226
                </p>
              </div>
            </a>

            {/* Helpline Call */}
            <a
              href="tel:+918218017226"
              className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 flex items-center gap-3.5 transition-all group shadow-xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#0f3322] text-[#f0c868] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">
                  {tr('सीधा संपर्क / हेल्पलाइन', 'براہ راست ہیلپ لائن', 'Direct Trust Helpline')}
                </p>
                <p className="text-[11px] text-amber-900 font-semibold truncate mt-0.5">
                  +91 82180 17226
                </p>
              </div>
            </a>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              NAVIGATION & EXPLORE BUTTONS
             ════════════════════════════════════════════════════════════════ */}
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/"
                className="cursor-pointer py-3.5 px-4 rounded-2xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Home className="w-4 h-4 text-emerald-700" />
                <span>{tr('होमपेज पर वापस जाएं', 'ہوم پیج پر واپس جائیں', 'Back to Home')}</span>
              </Link>

              <Link
                href="/sign-in"
                className="cursor-pointer py-3.5 px-4 rounded-2xl font-bold text-xs text-[#f0c868] transition-all flex items-center justify-center gap-2 shadow-md hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)' }}
              >
                <LogIn className="w-4 h-4" />
                <span>{tr('सदस्य लॉगिन करें', 'ممبر لاگ ان کریں', 'Member Sign In')}</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/campaigns"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
              >
                <Heart className="w-3.5 h-3.5 text-amber-600" />
                <span>{tr('सक्रिय अभियान देखें', 'فعال مہمات دیکھیں', 'Explore Campaigns')}</span>
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/niyamawali"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {tr(
                    'ट्रस्ट नियमावली पढ़ें',
                    'ٹرسٹ قواعد و ضوابط',
                    'Read Trust Bylaws & Rules'
                  )}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Footer Trust Badges ── */}
        <div className="flex items-center justify-center gap-4 pt-8 mt-6 border-t border-slate-200">
          {[
            {
              icon: ShieldCheck,
              hi: 'सुरक्षित पोर्टल',
              ur: 'محفوظ پورٹل',
              en: 'Secure Portal',
            },
            {
              icon: CheckCircle2,
              hi: 'डेटा संरक्षित',
              ur: 'ڈیٹا محفوظ',
              en: 'Data Protected',
            },
            {
              icon: HeartHandshake,
              hi: 'NGO पंजीकृत (258/2026)',
              ur: 'NGO رجسٹرڈ (258/2026)',
              en: 'NGO Regd. (258/2026)',
            },
          ].map(({ icon: Icon, hi, ur, en }) => (
            <div
              key={en}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{tr(hi, ur, en)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   ORIGINAL MULTI-STEP REGISTRATION FORM (PRESERVED & COMMENTED OUT)
   Uncomment the code below whenever online registration is officially opened.
=========================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Community } from '../../../types';
import {
  Upload,
  ArrowRight,
  UserCheck,
  Sparkles,
  Eye,
  EyeOff,
  QrCode,
  CheckCircle2,
  HandHeart,
  ShieldCheck,
  X,
  User as UserIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  MapPin,
  Building2,
  Copy,
  Check,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCommunities } from '../../../services/communityService';
import { createUser } from '../../../services/userService';
import { uploadImage } from '../../../lib/storage';
import { hashPassword } from '../../../lib/auth';
import { useLanguage } from '../../../context/LanguageContext';
import Link from 'next/link';

export function OriginalSignUpForm() {
  const router = useRouter();
  const { language } = useLanguage();

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };
  const dir = language === 'ur' ? 'rtl' : 'ltr';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [religion, setReligion] = useState<'Hindu' | 'Muslim' | 'Sikh' | 'Christian' | ''>('');
  const [isMalikENisab, setIsMalikENisab] = useState<boolean | null>(null);
  const [helpType, setHelpType] = useState<'Zakat' | 'Sadaka' | 'Fitra' | 'Other' | ''>('');
  const [helpDetails, setHelpDetails] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarFrontUploaded, setAadhaarFrontUploaded] = useState(false);
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  const [aadhaarBackUploaded, setAadhaarBackUploaded] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploaded, setAvatarUploaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    getCommunities()
      .then((data) => {
        setCommunities(data);
        if (data.length > 0) setSelectedCommunityId(data[0].id);
      })
      .catch(console.error);
  }, []);

  const activeCommunity = communities.find((c) => c.id === selectedCommunityId) || communities[0];

  const handleReligionChange = (newRel: string) => {
    setReligion(newRel as any);
    if (newRel !== 'Muslim') {
      setIsMalikENisab(null);
      setHelpType('');
      setHelpDetails('');
    }
  };

  const handleMalikENisabChange = (isNisab: boolean) => {
    setIsMalikENisab(isNisab);
    if (isNisab) {
      setHelpType('');
      setHelpDetails('');
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [];
    if (!fullName.trim()) missing.push(tr('पूरा नाम', 'مکمل نام', 'Full Name'));
    if (!phone.trim()) missing.push(tr('मोबाइल नंबर', 'موبائل نمبر', 'Mobile Number'));
    if (!password) missing.push(tr('पासवर्ड', 'پاس ورڈ', 'Password'));
    if (!state.trim()) missing.push(tr('राज्य', 'ریاست', 'State'));
    if (!city.trim()) missing.push(tr('शहर', 'شہر', 'City'));
    if (!address.trim()) missing.push(tr('पूरा पता', 'مکمل پتہ', 'Full Address'));
    if (!religion) missing.push(tr('धर्म', 'مذہب', 'Religion'));
    if (!avatarFile) missing.push(tr('प्रोफ़ाइल फ़ोटो', 'پروفائل تصویر', 'Profile Photo'));

    if (missing.length > 0) {
      const err = tr(
        `कृपया आवश्यक फ़ील्ड भरें: ${missing.join(', ')}`,
        `براہ کرم تمام ضروری خانے پر کریں: ${missing.join(', ')}`,
        `Please fill required fields: ${missing.join(', ')}`
      );
      setFormError(err);
      showToast(err, 'error');
      formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (phone.trim().length < 10) {
      const err = tr(
        'मोबाइल नंबर कम से कम 10 अंकों का होना चाहिए।',
        'موبائل نمبر 10 ہندسوں کا ہونا چاہیے۔',
        'Mobile number must be at least 10 digits.'
      );
      setFormError(err);
      showToast(err, 'error');
      return;
    }

    if (password.length < 6) {
      const err = tr(
        'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
        'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔',
        'Password must be at least 6 characters.'
      );
      setFormError(err);
      showToast(err, 'error');
      return;
    }

    if (religion === 'Muslim') {
      if (isMalikENisab === null) {
        const err = tr(
          'कृपया बताएं कि क्या आप मालिक-ए-निसब हैं।',
          'براہ کرم بتائیں کہ کیا آپ صاحبِ نصاب ہیں۔',
          'Please indicate whether you are Malik-e-Nisab.'
        );
        setFormError(err);
        showToast(err, 'error');
        return;
      }
      if (isMalikENisab === false && !helpType) {
        const err = tr(
          'कृपया सहायता का प्रकार चुनें।',
          'براہ کرم درکار امداد کی قسم منتخب کریں۔',
          'Please select the type of help needed.'
        );
        setFormError(err);
        showToast(err, 'error');
        return;
      }
      if (isMalikENisab === false && helpType === 'Other' && !helpDetails.trim()) {
        const err = tr(
          'कृपया सहायता का विवरण दर्ज करें।',
          'براہ کرم درکار امداد کی تفصیل لکھیں۔',
          'Please specify the details of assistance needed.'
        );
        setFormError(err);
        showToast(err, 'error');
        return;
      }
    }

    setFormError(null);
    setStep(2);
    formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinishRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;
    if (!utrNumber.trim()) {
      showToast(
        tr(
          'कृपया 12 अंकों का UTR नंबर दर्ज करें।',
          'براہ کرم 12 ہندسوں کا UTR نمبر درج کریں۔',
          'Please enter 12-digit Bank UTR / Reference number.'
        ),
        'error'
      );
      return;
    }
    if (!screenshotFile) {
      showToast(
        tr(
          'कृपया भुगतान स्क्रीनशॉट अपलोड करें।',
          'براہ کرم ادائیگی کی رسید اپلوڈ کریں۔',
          'Please upload payment screenshot.'
        ),
        'error'
      );
      return;
    }
    if (!isFeePaid) {
      showToast(
        tr(
          'कृपया भुगतान और दिशानिर्देशों की पुष्टि करें।',
          'براہ کرم ادائیگی کی تصدیق کریں۔',
          'Please confirm payment and guidelines agreement.'
        ),
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      let aadhaarFrontUrl: string | undefined;
      if (aadhaarFrontFile) aadhaarFrontUrl = await uploadImage('users', aadhaarFrontFile);
      let aadhaarBackUrl: string | undefined;
      if (aadhaarBackFile) aadhaarBackUrl = await uploadImage('users', aadhaarBackFile);
      let avatarUrl = '';
      if (avatarFile) avatarUrl = await uploadImage('users', avatarFile);
      let screenshotUrl: string | undefined;
      if (screenshotFile) screenshotUrl = await uploadImage('receipts', screenshotFile);

      const hashedPassword = await hashPassword(password);

      const newMember: User = {
        id: `usr_new_${Date.now()}`,
        name: fullName,
        email,
        phone,
        city,
        state,
        address,
        role: 'member',
        avatar: avatarUrl,
        communityId: activeCommunity.id,
        communityName: activeCommunity.name,
        membershipId: `SS-${city.substring(0, 3).toUpperCase()}-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        isVerified: false,
        isPremium: false,
        joinDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        passwordHash: hashedPassword,
        paymentMethod,
        paymentUtr: utrNumber || undefined,
        paymentScreenshotUrl: screenshotUrl,
        aadhaarFrontUrl,
        aadhaarBackUrl,
        religion: religion || undefined,
        isMalikENisab: religion === 'Muslim' ? (isMalikENisab ?? undefined) : undefined,
        is_malik_e_nisab: religion === 'Muslim' ? (isMalikENisab ?? undefined) : undefined,
        helpType: religion === 'Muslim' && isMalikENisab === false ? helpType || undefined : undefined,
        help_type: religion === 'Muslim' && isMalikENisab === false ? helpType || undefined : undefined,
        helpDetails: religion === 'Muslim' && isMalikENisab === false && helpType === 'Other' ? helpDetails || undefined : undefined,
        help_details: religion === 'Muslim' && isMalikENisab === false && helpType === 'Other' ? helpDetails || undefined : undefined,
      };

      await createUser(newMember);

      // Persist session
      const loginInfo = {
        role: newMember.role,
        id: newMember.id,
        email: newMember.email || '',
        name: newMember.name,
        avatar: newMember.avatar || '',
        community_id: newMember.communityId || '',
      };
      localStorage.setItem('mfct_is_logged_in', 'true');
      localStorage.setItem('mfct_user_role', newMember.role);
      localStorage.setItem('role', newMember.role);
      localStorage.setItem('id', newMember.id || '');
      localStorage.setItem('email', newMember.email || '');
      localStorage.setItem('name', newMember.name || '');
      localStorage.setItem('avatar', newMember.avatar || '');
      localStorage.setItem('community_id', newMember.communityId || '');
      localStorage.setItem('login_info', JSON.stringify(loginInfo));
      localStorage.setItem('mfct_user_info', JSON.stringify(loginInfo));

      setStep(3);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (err) {
      console.error('Registration error:', err);
      showToast(
        tr('पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।', 'رجسٹریشن ناکام رہی۔ دوبارہ کوشش کریں۔', 'Registration failed. Please try again.'),
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8f6f1]" dir={dir}>
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] max-w-lg w-[92%] animate-fade-in pointer-events-auto">
          <div
            className={`p-4 rounded-2xl text-sm font-bold shadow-2xl flex items-center justify-between gap-3 border ${
              toast.type === 'error'
                ? 'bg-red-600 text-white border-red-700 shadow-red-950/30'
                : 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-950/30'
            }`}
          >
            <div className="flex items-center gap-2.5 flex-1">
              <span className="text-lg">{toast.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-white/20 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div
        className="hidden lg:flex lg:w-[40%] xl:w-[36%] flex-col justify-between p-10 xl:p-12 text-white relative overflow-hidden shrink-0"
        style={{ background: 'radial-gradient(ellipse at top left, #0f3322 0%, #061910 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none bg-[#c8a84b]" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none bg-[#2e5e42]" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <img
              src="/mfct-logo.jpeg"
              alt="MFCT Logo"
              className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-[#c8a84b] transition-transform group-hover:scale-105"
            />
            <div>
              <p className="text-white font-black text-base tracking-tight leading-none">MFCT</p>
              <p className="text-[11px] font-medium leading-none mt-1 text-amber-200/80">Mohammad Faeem Charitable Trust</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 my-auto py-8">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.35)', color: '#f0c868' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{tr('सदस्यता एकजुटता कार्यक्रम', 'ممبرشپ یکجہتی پروگرام', '₹100 Membership Solidarity')}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              {tr('सत्यापित समुदाय', 'تصدیق شدہ کمیونٹی', 'Become a Verified')}<br />
              <span style={{ color: '#f6d878' }}>
                {tr('सदस्य बनें।', 'ممبر بنیں۔', 'Community Member.')}
              </span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-300">
              {tr(
                'अपने स्थानीय समुदाय से जुड़ें। दानकर्ता बनें और आपातकालीन सहायता के पात्र भी। ₹100 की सदस्यता आपको प्राथमिकता देती है।',
                'اپنی مقامی کمیونٹی میں شامل ہوں۔ عطیہ دہندہ اور ہنگامی امداد کے اہل بنیں۔ ₹100 کی فیس آپ کو ترجیحی حیثیت دیتی ہے۔',
                'Join your local neighbourhood community. Become an active supporter and get direct priority emergency relief.'
              )}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                icon: ShieldCheck,
                title: tr('100% पारदर्शी एस्क्रो', '100% شفاف ایسکرو', '100% Direct Escrow'),
                desc: tr('दान सीधे सत्यापित अस्पताल/मदद में जाता है', 'عطیات براہ راست ہسپتال و دکان جاتے ہیں', 'Direct vendor/hospital payouts'),
              },
              {
                icon: HeartHandshake,
                title: tr('पारस्परिक आपातकालीन सुरक्षा', 'باہمی ہنگامی تحفظ', 'Mutual Emergency Relief'),
                desc: tr('सदस्यों को आवश्यकता पड़ने पर प्राथमिकता', 'ممبرز کو ضرورت کے وقت ترجیحی مدد', 'Guaranteed priority emergency aid'),
              },
              {
                icon: CheckCircle2,
                title: tr('डिजिटल सदस्य पहचान पत्र', 'ڈیجیٹل ممبر شناختی کارڈ', 'Digital Member ID Card'),
                desc: tr('आधिकारिक MFCT समुदाय कार्ड और QR', 'سرکاری MFCT کارڈ اور کیو آر', 'Instant official membership card'),
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs italic leading-relaxed text-slate-300">
            {tr(
              '"एक छोटी-सी मदद किसी के जीवन में बड़ा बदलाव ला सकती है।"',
              '"ایک چھوٹی سی مدد کسی کی زندگی میں بڑا بدلاؤ لا سکتی ہے۔"',
              '"A small act of solidarity transforms lives and strengthens our community."'
            )}
          </p>
          <p className="text-[11px] font-bold mt-1.5 text-amber-300">
            — Er. Mohammad Zahid, {tr('संस्थापक और अध्यक्ष', 'بانی و چیئرمین', 'Founder & Chairman')}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-5 sm:p-8 lg:p-12 overflow-y-auto max-w-3xl mx-auto w-full">
        <div ref={formTopRef} className="w-full space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <Link href="/" className="lg:hidden flex items-center gap-2.5 group">
              <img
                src="/mfct-logo.jpeg"
                alt="MFCT Logo"
                className="w-9 h-9 rounded-full object-cover shadow border-2 border-[#c8a84b]/60 group-hover:scale-105 transition-transform"
              />
              <span className="font-black text-sm text-[#0f3322]">MFCT</span>
            </Link>
            <div className="text-xs font-medium text-slate-600 ml-auto">
              {tr('पहले से सदस्य हैं?', 'پہلے سے ممبر ہیں؟', 'Already registered?')}{' '}
              <Link href="/sign-in" className="font-bold underline decoration-2 text-[#0f3322] hover:text-emerald-700">
                {tr('साइन इन करें', 'سائن ان کریں', 'Sign In')}
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {step === 1 && tr('सदस्यता पंजीकरण', 'ممبرشپ رجسٹریشن', 'Member Registration')}
                {step === 2 && tr('सदस्यता शुल्क भुगतान', 'ممبرشپ فیس ادائیگی', 'Solidarity Fee Payment')}
                {step === 3 && tr('पंजीकरण पूर्ण हुआ!', 'رجسٹریشن مکمل ہو گئی!', 'Registration Complete!')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {step === 1 && tr('कृपया अपना व्यक्तिगत व पते का विवरण दर्ज करें।', 'براہ کرم ذاتی و رہائشی تفصیلات درج کریں۔', 'Enter your personal details to create your verified member profile.')}
                {step === 2 && tr('₹100 की वार्षिक सदस्यता शुल्क का भुगतान पूरा करें।', 'سالانہ ممبرشپ کے لیے ₹100 ادا کریں۔', 'Complete the ₹100 annual solidarity fee via UPI or Direct Bank Transfer.')}
                {step === 3 && tr('आपका अनुरोध सफलतापूर्वक दर्ज कर लिया गया है।', 'آپ کی ممبرشپ کامیابی سے درج کر لی گئی ہے۔', 'Your registration request has been submitted successfully.')}
              </p>
            </div>

            {step < 3 && (
              <div className="flex items-center gap-2 pt-1">
                {[
                  { n: 1, hi: '1. व्यक्तिगत विवरण', ur: '1. ذاتی معلومات', en: '1. Personal Info' },
                  { n: 2, hi: '2. ₹100 शुल्क भुगतान', ur: '2. فیس ادائیگی', en: '2. ₹100 Fee & UTR' },
                ].map(({ n, hi, ur, en }, idx, arr) => {
                  const isActive = step === n;
                  const isDone = step > n;
                  return (
                    <React.Fragment key={n}>
                      <div
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#0f3322] text-[#f0c868] shadow-md shadow-emerald-950/10'
                            : isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200/70 text-slate-500'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            isActive
                              ? 'bg-amber-400 text-slate-900'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {isDone ? '✓' : n}
                        </span>
                        <span>{tr(hi, ur, en)}</span>
                      </div>
                      {idx < arr.length - 1 && <div className="flex-1 h-0.5 bg-slate-200 rounded-full" />}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {formError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 animate-fade-in shadow-sm">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1 leading-relaxed">{formError}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('पूरा नाम (आधार के अनुसार) *', 'مکمل نام (آدھار کے مطابق) *', 'Full Name (as per ID) *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. मोहम्मद तारिक', 'مثال: محمد طارق', 'e.g. Mohammad Tariq')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('मोबाइल नंबर *', 'موبائل نمبر *', 'Mobile Number *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <PhoneIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('ईमेल पता (वैकल्पिक)', 'ای میل (اختیاری)', 'Email Address (Optional)')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MailIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="tariq@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('पासवर्ड बनाएं *', 'پاس ورڈ بنائیں *', 'Create Password *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <LockIcon className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={tr('कम से कम 6 अक्षर', 'کم از کم 6 حروف', 'Min. 6 characters')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('राज्य *', 'ریاست *', 'State *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. उत्तर प्रदेश', 'مثال: اتر پردیش', 'e.g. Uttar Pradesh')}
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('शहर / कस्बा *', 'شہر / قصبہ *', 'City / Town *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. बरेली', 'مثال: بریلی', 'e.g. Bareilly')}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {tr('पूरा पता *', 'مکمل پتہ *', 'Full Address *')}
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder={tr('मकान संख्या, गली / मोहल्ला, लैंडमार्क, पिन कोड', 'مکان نمبر، گلی / محلہ، پن کوڈ', 'House No., Street / Area, Landmark, Pincode')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('स्थानीय समुदाय *', 'مقامی کمیونٹی *', 'Local Community *')}
                  </label>
                  <select
                    value={selectedCommunityId}
                    onChange={(e) => setSelectedCommunityId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city} - {tr('प्रशासक:', 'ایڈمن:', 'Admin:')} {c.adminName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('धर्म *', 'مذہب *', 'Religion *')}
                  </label>
                  <select
                    value={religion}
                    onChange={(e) => handleReligionChange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="">{tr('-- धर्म चुनें --', '-- مذہب منتخب کریں --', '-- Select Religion --')}</option>
                    <option value="Hindu">{tr('हिन्दू (Hindu)', 'ہندو (Hindu)', 'Hindu')}</option>
                    <option value="Muslim">{tr('मुस्लिम (Muslim)', 'مسلم (Muslim)', 'Muslim')}</option>
                    <option value="Sikh">{tr('सिख (Sikh)', 'سکھ (Sikh)', 'Sikh')}</option>
                    <option value="Christian">{tr('ईसाई (Christian)', 'عیسائی (Christian)', 'Christian')}</option>
                  </select>
                </div>
              </div>

              {religion === 'Muslim' && (
                <div
                  className="p-5 rounded-2xl space-y-4 animate-fade-in border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(200,168,75,0.08) 0%, rgba(15,51,34,0.04) 100%)',
                    borderColor: 'rgba(200,168,75,0.4)',
                  }}
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-amber-300/40">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f3322]">
                      {tr('इस्लामी कल्याण एवं निसब घोषणा', 'اسلامی فلاحی و نصاب اقرار نامہ', 'Islamic Welfare & Nisab Declaration')}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {tr('क्या आप मालिक-ए-निसब (साहिब-ए-निसब) हैं? *', 'کیا آپ صاحبِ نصاب / مالکِ نصاب ہیں؟ *', 'Are you Malik-e-Nisab (Sahib-e-Nisab)? *')}
                    </label>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {tr(
                        'क्या आपके पास बुनियादी ज़रूरतों के अलावा 52.5 तोले चांदी (या इसके बराबर नकदी/माल) मौजूद है?',
                        'کیا آپ کے پاس اپنی بنیادی ضروریات سے زائد ساڑھے باون تولہ چاندی (یا مساوی مال/رقم) موجود ہے؟',
                        'Do you possess wealth exceeding the Nisab threshold (52.5 tolas silver / equivalent value)?'
                      )}
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {[
                        { val: true, hi: 'हाँ (मालिक-ए-निसब)', ur: 'ہاں (صاحبِ نصاب)', en: 'Yes (Malik-e-Nisab)' },
                        { val: false, hi: 'नहीं (गैर-निसबदार)', ur: 'نہیں (غیر نصاب)', en: 'No (Non-Nisab)' },
                      ].map(({ val, hi, ur, en }) => (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => handleMalikENisabChange(val)}
                          className={`cursor-pointer p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                            isMalikENisab === val
                              ? 'bg-amber-100/70 border-amber-500 text-slate-900 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                              isMalikENisab === val ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isMalikENisab === val && '✓'}
                          </span>
                          <span>{tr(hi, ur, en)}</span>
                        </button>
                      ))}
                    </div>

                    {isMalikENisab === true && (
                      <div className="p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>
                          {tr(
                            'अल्हम्दुलिल्लाह! आप एक सक्षम दाता/सदस्य के रूप में आगे बढ़ सकते हैं।',
                            'الحمدللہ! آپ بطور صاحبِ استطاعت ممبر آگے بڑھ سکتے ہیں۔',
                            'Alhamdulillah! You can proceed as a contributing donor/member.'
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {isMalikENisab === false && (
                    <div className="space-y-3 pt-3 border-t border-amber-200/50 animate-fade-in">
                      <label className="block text-xs font-bold text-slate-800">
                        {tr('आपको किस प्रकार की सहायता / इमदाद की आवश्यकता है? *', 'آپ کو کس قسم کی مدد / امداد کی ضرورت ہے؟ *', 'What kind of help / assistance do you need? *')}
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: 'Zakat', hi: 'ज़कात', ur: 'زکوٰۃ', en: 'Zakat', desc: tr('अनिवार्य इस्लामी सहायता', 'واجب مالی امداد', 'Mandatory relief') },
                          { id: 'Sadaka', hi: 'सदका', ur: 'صدقہ', en: 'Sadaka', desc: tr('सामान्य/आपात राहत', 'نفلی/ہنگامی امداد', 'Voluntary relief') },
                          { id: 'Fitra', hi: 'फ़ितरा', ur: 'فطرہ', en: 'Fitra', desc: tr('निर्वाह व ईद सहायता', 'عید و راشن امداد', 'Sustenance & Eid') },
                          { id: 'Other', hi: 'अन्य', ur: 'دیگر', en: 'Other', desc: tr('इलाज, राशन, फीस', 'علاج، راشن، تعلیم', 'Custom assistance') },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setHelpType(item.id as any)}
                            className={`cursor-pointer p-2.5 rounded-xl border text-left transition-all ${
                              helpType === item.id
                                ? 'bg-amber-100/70 border-amber-500 shadow-sm'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{tr(item.hi, item.ur, item.en)}</span>
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] ${
                                  helpType === item.id ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'
                                }`}
                              >
                                {helpType === item.id && '✓'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                          </button>
                        ))}
                      </div>

                      {helpType === 'Other' && (
                        <div className="pt-1">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {tr('सहायता का विवरण दर्ज करें *', 'درکار امداد کی تفصیل لکھیں *', 'Specify Details of Help Needed *')}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={tr('उदा. चिकित्सा खर्च, राशन, बच्चों की फीस', 'مثلاً علاج کا خرچہ، راشن', 'e.g. Medical expenses, ration, children fees')}
                            value={helpDetails}
                            onChange={(e) => setHelpDetails(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {tr('प्रोफ़ाइल फ़ोटो *', 'پروفائل تصویر *', 'Profile Photo *')}
                </label>
                <label
                  className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                    avatarUploaded
                      ? 'bg-amber-50/60 border-amber-400 text-slate-900'
                      : 'bg-slate-50/70 border-slate-300 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setAvatarFile(f);
                        setAvatarUploaded(true);
                      }
                    }}
                  />
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-700">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">
                    {avatarUploaded
                      ? `✓ ${avatarFile?.name || tr('फ़ोटो संलग्न है', 'تصویر منسلک ہے', 'Photo Attached')}`
                      : tr('फ़ोटो अपलोड करने के लिए क्लिक करें *', 'تصویر اپلوڈ کرنے کے لیے کلک کریں *', 'Click to upload profile photo *')}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    label: tr('आधार कार्ड - सामने (वैकल्पिक)', 'آدھار کارڈ - سامنے (اختیاری)', 'Aadhaar Front (Optional)'),
                    uploaded: aadhaarFrontUploaded,
                    file: aadhaarFrontFile,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setAadhaarFrontFile(f);
                        setAadhaarFrontUploaded(true);
                      }
                    },
                    placeholder: tr('आधार सामने का भाग अपलोड करें', 'آدھار سامنے کا حصہ اپلوڈ کریں', 'Upload Aadhaar Front'),
                  },
                  {
                    label: tr('आधार कार्ड - पीछे (वैकल्पिक)', 'آدھار کارڈ - پیچھے (اختیاری)', 'Aadhaar Back (Optional)'),
                    uploaded: aadhaarBackUploaded,
                    file: aadhaarBackFile,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setAadhaarBackFile(f);
                        setAadhaarBackUploaded(true);
                      }
                    },
                    placeholder: tr('आधार पीछे का भाग अपलोड करें', 'آدھار پیچھے کا حصہ اپلوڈ کریں', 'Upload Aadhaar Back'),
                  },
                ].map(({ label, uploaded, file, onChange, placeholder }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
                    <label
                      className={`p-3.5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        uploaded
                          ? 'bg-amber-50/60 border-amber-400 text-slate-900'
                          : 'bg-slate-50/70 border-slate-300 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <input type="file" accept="image/*,.pdf" className="sr-only" onChange={onChange} />
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold truncate max-w-[200px]">
                        {uploaded ? `✓ ${file?.name || tr('संलग्न है', 'منسلک ہے', 'Attached')}` : placeholder}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-950/20 text-[#f0c868] mt-2"
                style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)' }}
              >
                <span>{tr('आगे बढ़ें: ₹100 सदस्यता शुल्क', 'آگے بڑھیں: ₹100 ممبرشپ فیس', 'Proceed to Pay ₹100 Fee')}</span>
                <ArrowRight className="w-4 h-4 opacity-90" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinishRegistration} className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-[#0f3322]">
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-800 font-bold">
                    {tr('वार्षिक सदस्यता एकजुटता शुल्क', 'سالانہ ممبرشپ فیس', 'Annual Membership Solidarity Fee')}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {tr('समुदाय में सक्रिय सदस्यता व आपात राहत पात्रता के लिए', 'کمیونٹی میں فعال ممبرشپ و ہنگامی امداد کے لیے', `Activates membership in ${activeCommunity?.name}`)}
                  </p>
                </div>
                <div className="text-2xl font-black text-[#0f3322]">₹100</div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300">
                {[
                  { id: 'UPI', hi: 'UPI / QR स्कैन', ur: 'UPI / QR اسکین', en: 'Instant UPI / QR' },
                  { id: 'Bank Transfer', hi: 'बैंक ट्रांसफर (NEFT)', ur: 'بینک ٹرانسفر (NEFT)', en: 'Bank Transfer (NEFT)' },
                ].map(({ id, hi, ur, en }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id as any)}
                    className={`cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all ${
                      paymentMethod === id ? 'bg-white text-[#0f3322] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tr(hi, ur, en)}
                  </button>
                ))}
              </div>

              {paymentMethod === 'UPI' ? (
                <div
                  className="p-6 rounded-3xl text-center space-y-4 text-white shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #0f3322 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
                >
                  <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg">
                    <QrCode className="w-36 h-36 mx-auto text-slate-900" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                      {tr('प्रत्यक्ष एस्क्रो के लिए UPI ID', 'براہ راست ادائیگی کے لیے UPI ID', 'UPI ID for Direct Escrow')}
                    </p>
                    <div className="inline-flex items-center gap-2 mt-1 px-4 py-1.5 rounded-xl bg-white/10 border border-white/20">
                      <span className="font-mono font-bold text-lg select-all text-amber-300">mfct@okicici</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('mfct@okicici', 'upi')}
                        className="p-1 hover:bg-white/20 rounded-md transition-colors"
                      >
                        {copiedKey === 'upi' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-200" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2">
                      {tr('Google Pay, PhonePe, Paytm या BHIM UPI द्वारा स्कैन करें', 'Google Pay, PhonePe, Paytm کے ذریعے اسکین کریں', 'Scan using Google Pay, PhonePe, Paytm, or BHIM UPI')}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="p-5 rounded-3xl space-y-3 text-xs text-white shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #0f3322 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
                >
                  {[
                    { label: tr('खाता नाम:', 'کھاتہ نام:', 'Account Name:'), val: 'Mohammad Faeem Charitable Trust', copyKey: 'name' },
                    { label: tr('बैंक का नाम:', 'بینک نام:', 'Bank Name:'), val: 'ICICI Bank Ltd', copyKey: 'bank' },
                    { label: tr('खाता संख्या:', 'اکاؤنٹ نمبر:', 'Account Number:'), val: '000405018892', copyKey: 'acc' },
                    { label: 'IFSC Code:', val: 'ICIC0000004', copyKey: 'ifsc' },
                  ].map(({ label, val, copyKey }) => (
                    <div key={copyKey} className="flex justify-between items-center pb-2.5 border-b border-amber-900/40 last:border-0 last:pb-0">
                      <span className="text-slate-400 font-medium">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-300">{val}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(val, copyKey)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          {copiedKey === copyKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-200" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('12 अंकों का बैंक UTR / संदर्भ संख्या *', '12 ہندسوں کا UTR / ریفرنس نمبر *', '12-Digit Bank UTR / Transaction Ref No *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={tr('उदा. 420199381029', 'مثال: 420199381029', 'e.g. 420199381029')}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white font-mono text-sm font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('भुगतान रसीद / स्क्रीनशॉट *', 'ادائیگی کی رسید / اسکرین شاٹ *', 'Payment Screenshot / Receipt *')}
                  </label>
                  <label
                    className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                      screenshotUploaded
                        ? 'bg-amber-50/60 border-amber-400 text-slate-900'
                        : 'bg-slate-50/70 border-slate-300 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setScreenshotFile(f);
                          setScreenshotUploaded(true);
                        }
                      }}
                    />
                    <Upload className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold">
                      {screenshotUploaded
                        ? `✓ ${screenshotFile?.name || tr('स्क्रीनशॉट संलग्न है', 'رسید منسلک ہے', 'Screenshot Attached')}`
                        : tr('भुगतान रसीद अपलोड करने के लिए क्लिक करें *', 'ادائیگی کی رسید اپلوڈ کریں *', 'Click to upload payment receipt *')}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="feeCheck"
                  required
                  checked={isFeePaid}
                  onChange={(e) => setIsFeePaid(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded cursor-pointer accent-emerald-600"
                />
                <label htmlFor="feeCheck" className="text-xs font-medium cursor-pointer text-slate-700 leading-relaxed">
                  {tr(
                    'मैंने ₹100 का भुगतान पूरा कर लिया है और MFCT सामुदायिक दिशानिर्देशों से सहमत हूँ।',
                    'میں نے ₹100 کی ادائیگی مکمل کر لی ہے اور MFCT اصولوں سے متفق ہوں۔',
                    'I have completed the ₹100 payment and agree to MFCT community guidelines.'
                  )}
                </label>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="cursor-pointer py-3.5 px-5 rounded-2xl font-bold text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                >
                  ← {tr('वापस', 'واپس', 'Back')}
                </button>
                <button
                  type="submit"
                  disabled={!isFeePaid || submitting}
                  className="cursor-pointer flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-950/20 text-[#f0c868] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)' }}
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{tr('सदस्यता पंजीकरण पूर्ण करें', 'ممبرشپ رجسٹریشن مکمل کریں', 'Complete Registration')}</span>
                      <ArrowRight className="w-4 h-4 opacity-90" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-10 space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                <UserCheck className="w-10 h-10 text-emerald-700" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {tr('पंजीकरण अनुरोध सबमिट हुआ!', 'درخواست کامیابی سے جمع ہوئی!', 'Registration Submitted!')}
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  {tr(
                    `अल्हम्दुलिल्लाह! आप अब ${activeCommunity?.name} के एक सत्यापित सदस्य हैं।`,
                    `الحمدللہ! آپ اب ${activeCommunity?.name} کے تصدیق شدہ ممبر بن چکے ہیں۔`,
                    `You are now a registered member of ${activeCommunity?.name}.`
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                {[
                  { icon: ShieldCheck, hi: 'सत्यापित सदस्य', ur: 'تصدیق شدہ ممبر', en: 'Verified Member' },
                  { icon: CheckCircle2, hi: 'UTR रिकॉर्ड', ur: 'UTR ریکارڈ', en: 'UTR Recorded' },
                  { icon: HandHeart, hi: 'राहत के पात्र', ur: 'امداد کے اہل', en: 'Relief Eligible' },
                ].map(({ icon: Icon, hi, ur, en }) => (
                  <div key={en} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span>{tr(hi, ur, en)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={() => router.push('/')}
                  className="cursor-pointer w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-950/20 text-[#f0c868]"
                  style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)' }}
                >
                  <span>{tr('होम डैशबोर्ड पर जाएं', 'ہوم ڈیش بورڈ پر جائیں', 'Go to Home Dashboard')}</span>
                  <ArrowRight className="w-4 h-4 opacity-90" />
                </button>
                <Link href="/sign-in" className="block text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                  {tr('साइन इन पृष्ठ पर जाएं', 'سائن ان پر جائیں', 'Go to Sign In page')} →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 pt-8 mt-6 border-t border-slate-200">
          {[
            { icon: ShieldCheck, hi: 'सुरक्षित पोर्टल', ur: 'محفوظ پورٹل', en: 'Secure Portal' },
            { icon: CheckCircle2, hi: 'डेटा संरक्षित', ur: 'ڈیٹا محفوظ', en: 'Data Protected' },
            { icon: HandHeart, hi: 'NGO पंजीकृत', ur: 'NGO رجسٹرڈ', en: 'NGO Registered' },
          ].map(({ icon: Icon, hi, ur, en }) => (
            <div key={en} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <Icon className="w-3.5 h-3.5 text-emerald-600" />
              {tr(hi, ur, en)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
========================================================================= */
