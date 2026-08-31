'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Sparkles, HandHeart, ShieldCheck } from 'lucide-react';
import { authenticateUser } from '../../../services/userService';
import { useLanguage } from '../../../context/LanguageContext';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const { language } = useLanguage();

  // Trilingual helper — same pattern as rest of the website
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthenticating(true);

    try {
      if (!phone || !password) {
        setAuthError(tr('मोबाइल नंबर और पासवर्ड आवश्यक हैं।', 'موبائل نمبر اور پاس ورڈ درکار ہے۔', 'Phone number and password are required.'));
        setAuthenticating(false);
        return;
      }

      const result = await authenticateUser(phone, password);

      if (result.success && result.user) {
        const user = result.user;
        const loginInfo = {
          role: user.role,
          id: user.id,
          email: user.email || '',
          name: user.name,
          avatar: user.avatar || '',
          community_id: user.communityId || '',
        };

        // Persist session — mirrors AppStateProvider.handleLogin
        localStorage.setItem('mfct_is_logged_in', 'true');
        localStorage.setItem('mfct_user_role', user.role);
        localStorage.setItem('role', user.role);
        localStorage.setItem('id', user.id || '');
        localStorage.setItem('email', user.email || '');
        localStorage.setItem('name', user.name || '');
        localStorage.setItem('avatar', user.avatar || '');
        localStorage.setItem('community_id', user.communityId || '');
        localStorage.setItem('login_info', JSON.stringify(loginInfo));
        localStorage.setItem('mfct_user_info', JSON.stringify(loginInfo));

        setLoggedIn(true);
        setTimeout(() => {
          if (user.role === 'super_admin' || user.role === 'executive_admin' || user.role === 'community_admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }, 1200);
      } else {
        setAuthError(result.error || tr('लॉगिन विफल। कृपया विवरण जांचें।', 'لاگ ان ناکام۔ تفصیلات چیک کریں۔', 'Authentication failed. Please check your credentials.'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setAuthError(tr('लॉगिन के दौरान त्रुटि हुई। पुनः प्रयास करें।', 'لاگ ان کے دوران خرابی۔ دوبارہ کوشش کریں۔', 'An error occurred during login. Please try again.'));
    } finally {
      setAuthenticating(false);
    }
  };

  // RTL for Urdu
  const dir = language === 'ur' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f6f1' }} dir={dir}>

      {/* ── LEFT: Branding Panel ── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at top left, #0f3322 0%, #061910 100%)' }}
      >
        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#c8a84b' }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: '#2e5e42' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #c8a84b 0%, #947728 100%)' }}>
            <HandHeart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-base tracking-tight leading-none">MFCT</p>
            <p className="text-[11px] font-medium leading-none mt-0.5" style={{ color: 'rgba(200,168,75,0.8)' }}>Mohammad Faeem Charitable Trust</p>
          </div>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest" style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.35)', color: '#f0c868' }}>
            <Sparkles className="w-3 h-3" />
            <span>{tr('सदस्य पोर्टल', 'ممبر پورٹل', 'Member Portal')}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
              याद उनकी,सेवा हमारी।
            </h1>
            <p className="text-sm leading-relaxed font-normal" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {tr(
                'अपने सदस्य डैशबोर्ड तक पहुँचें, दान ट्रैक करें, अभियान देखें और समुदाय सहायता प्रबंधित करें।',
                'اپنے ممبر ڈیش بورڈ تک رسائی حاصل کریں، عطیات ٹریک کریں اور کمیونٹی سپورٹ منظم کریں۔',
                'Sign in to access your member dashboard, track donations, view campaigns, and manage your community support.'
              )}
            </p>
          </div>

          {/* Feature chips */}
          <div className="space-y-2.5 pt-2">
            {[
              { icon: ShieldCheck, hi: '100% एस्क्रो पारदर्शिता', ur: '100% ایسکرو شفافیت', en: '100% Escrow Transparency' },
              { icon: CheckCircle2, hi: 'UTR-सत्यापित रसीदें', ur: 'UTR تصدیق شدہ رسیدیں', en: 'UTR-Verified Receipts' },
              { icon: HandHeart, hi: 'ज़कात और 80G अनुपालन', ur: 'زکوٰۃ اور 80G مطابق', en: 'Zakat & 80G Compliant' },
            ].map(({ icon: Icon, hi, ur, en }) => (
              <div key={en} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.25)' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: '#f0c868' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{tr(hi, ur, en)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10 p-4 rounded-2xl" style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.2)' }}>
          <p className="text-xs italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {tr(
              '"एक छोटी-सी मदद किसी के जीवन में बड़ा बदलाव ला सकती है।"',
              '"ایک چھوٹی سی مدد کسی کی زندگی میں بڑا بدلاؤ لا سکتی ہے۔"',
              '"A small act of kindness can bring a great change in someone\'s life."'
            )}
          </p>
          <p className="text-[11px] font-bold mt-1.5" style={{ color: '#f0c868' }}>— Er. Mohammad Zahid, {tr('संस्थापक और अध्यक्ष', 'بانی و چیئرمین', 'Founder & Chairman')}</p>
        </div>
      </div>

      {/* ── RIGHT: Sign-In Form ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow" style={{ background: 'linear-gradient(135deg, #0f3322 0%, #1a3c2c 100%)' }}>
              <HandHeart className="w-5 h-5" style={{ color: '#f0c868' }} />
            </div>
            <div>
              <p className="font-black text-base" style={{ color: '#0f3322' }}>MFCT</p>
              <p className="text-[11px] text-slate-500 font-medium">Mohammad Faeem Charitable Trust</p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {tr('वापसी पर स्वागत है', 'خوش آمدید', 'Welcome Back')}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {tr('अपने MFCT खाते में लॉगिन करें।', 'اپنے MFCT اکاؤنٹ میں لاگ ان کریں۔', 'Log in to your MFCT member account to continue.')}
            </p>
          </div>

          {/* Success state */}
          {loggedIn ? (
            <div className="flex flex-col items-center justify-center py-14 space-y-4 rounded-3xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1.5px solid rgba(16,185,129,0.2)' }}>
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  {tr('सफलतापूर्वक लॉगिन हो गए!', 'کامیابی سے لاگ ان ہو گئے!', 'Successfully Logged In!')}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {tr('डैशबोर्ड पर जा रहे हैं…', 'ڈیش بورڈ کی طرف جا رہے ہیں…', 'Redirecting to your dashboard…')}
                </p>
              </div>
              <div className="w-8 h-1 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Error banner */}
              {authError && (
                <div className="flex items-start gap-2.5 p-4 rounded-2xl text-sm font-medium" style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48' }}>
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{authError}</span>
                </div>
              )}

              {/* Phone field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  {tr('मोबाइल नंबर', 'موبائل نمبر', 'Phone Number')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <input
                    id="sign-in-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={tr('अपना मोबाइल नंबर दर्ज करें', 'اپنا موبائل نمبر درج کریں', 'Enter your registered phone number')}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  {tr('पासवर्ड', 'پاس ورڈ', 'Password')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    id="sign-in-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tr('अपना पासवर्ड दर्ज करें', 'اپنا پاس ورڈ درج کریں', 'Enter your password')}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    aria-label={showPassword ? tr('पासवर्ड छिपाएं', 'پاس ورڈ چھپائیں', 'Hide password') : tr('पासवर्ड दिखाएं', 'پاس ورڈ دکھائیں', 'Show password')}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="sign-in-submit"
                type="submit"
                disabled={authenticating}
                className="cursor-pointer w-full mt-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)', color: '#f0c868', boxShadow: '0 8px 24px rgba(15,51,34,0.3)' }}
              >
                {authenticating ? (
                  <div className="w-5 h-5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{tr('साइन इन करें', 'سائن ان کریں', 'Sign In')}</span>
                    <ArrowRight className="w-4 h-4 opacity-80" />
                  </>
                )}
              </button>

              {/* Register link */}
              <div className="text-center pt-1">
                <p className="text-sm text-slate-500 font-medium">
                  {tr('खाता नहीं है?', 'اکاؤنٹ نہیں ہے؟', "Don't have an account?")}{' '}
                  <Link href="/sign-up" className="font-bold underline decoration-2 underline-offset-4 transition-colors" style={{ color: '#1a3c2c' }}>
                    {tr('सदस्य के रूप में रजिस्टर करें', 'ممبر کے طور پر رجسٹر کریں', 'Register as a Member')}
                  </Link>
                </p>
              </div>

              {/* Back to home */}
              <div className="text-center">
                <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
                  ← {tr('MFCT होम पर वापस जाएं', 'MFCT ہوم پر واپس جائیں', 'Back to MFCT Home')}
                </Link>
              </div>
            </form>
          )}

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100">
            {[
              { icon: ShieldCheck, hi: 'सुरक्षित लॉगिन', ur: 'محفوظ لاگ ان', en: 'Secure Login' },
              { icon: CheckCircle2, hi: 'डेटा सुरक्षित', ur: 'ڈیٹا محفوظ', en: 'Data Protected' },
              { icon: HandHeart, hi: 'NGO पंजीकृत', ur: 'NGO رجسٹرڈ', en: 'NGO Registered' },
            ].map(({ icon: Icon, hi, ur, en }) => (
              <div key={en} className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <Icon className="w-3.5 h-3.5 text-emerald-500" />
                {tr(hi, ur, en)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
