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

  // Trilingual helper - same pattern as rest of the website
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  // ---- Sign-In State ----
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
        localStorage.setItem('status', user.status || 'pending');
        localStorage.setItem('email', user.email || '');
        localStorage.setItem('name', user.name || '');
        localStorage.setItem('avatar', user.avatar || '');
        localStorage.setItem('community_id', user.communityId || '');
        localStorage.setItem('login_info', JSON.stringify(loginInfo));
        localStorage.setItem('mfct_user_info', JSON.stringify(loginInfo));
        setLoggedIn(true);
        setTimeout(() => {
          const userStatus = (user.status || '').toLowerCase();
          const isUserApproved = userStatus === 'approved' || (user.isVerified && userStatus !== 'reject' && userStatus !== 'rejected' && userStatus !== 'pending');
          if (!isUserApproved || userStatus === 'pending' || userStatus === 'reject' || userStatus === 'rejected') {
            router.push('/under-review');
          } else if (user.role === 'super_admin' || user.role === 'executive_admin' || user.role === 'community_admin') {
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

  // ---- Forgot Password State ----
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Step 1 – OTP
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  // Step 2 – New password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Shared status
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Countdown timer for OTP resend cooldown
  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const resetForgot = () => {
    setForgotStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setOtpSent(false);
    setSendingOtp(false);
    setVerifyingOtp(false);
    setCountdown(0);
    setPreviewCode(null);
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
  };

  const openForgot = () => { resetForgot(); setShowForgot(true); };
  const closeForgot = () => { setShowForgot(false); resetForgot(); };

  // Step 1a: Send OTP via existing /api/auth/send-otp route
  const handleSendOtp = async () => {
    setForgotError('');
    setForgotSuccess('');
    const email = forgotEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setForgotError(tr('कृपया एक मान्य ईमेल पता दर्ज करें।', 'براہ کرم ایک درست ای میل پتہ درج کریں۔', 'Please enter a valid email address.'));
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        setForgotError(data.error || tr('OTP भेजने में विफल।', 'او ٹی پی بھیجنے میں ناکامی۔', 'Failed to send OTP.'));
      } else {
        setOtpSent(true);
        setCountdown(60);
        if (data.emailSent) {
          setForgotSuccess(tr(
            `OTP आपके ईमेल (${email}) पर भेजा गया है।`,
            `او ٹی پی آپ کے ای میل (${email}) پر بھیج دیا گیا ہے۔`,
            `OTP sent to ${email}. Please check your inbox.`
          ));
          setPreviewCode(null);
        } else {
          setPreviewCode(data.previewCode || null);
          setForgotSuccess(tr(
            'सत्यापन कोड उत्पन्न हुआ (टेस्ट मोड)।',
            'تصدیقی کوڈ جنریٹ ہو گیا (ٹیسٹ موڈ)۔',
            'Verification code generated (test mode).'
          ));
        }
      }
    } catch {
      setForgotError(tr('नेटवर्क त्रुटि। पुनः प्रयास करें।', 'نیٹ ورک خرابی۔', 'Network error. Please try again.'));
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 1b: Verify OTP via existing /api/auth/verify-otp route
  const handleVerifyOtp = async () => {
    setForgotError('');
    setForgotSuccess('');
    if (!otpSent) {
      setForgotError(tr('पहले OTP भेजें।', 'پہلے او ٹی پی بھیجیں۔', 'Please send OTP first.'));
      return;
    }
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError(tr('कृपया 6 अंकों का OTP दर्ज करें।', 'براہ کرم 6 ہندسوں کا OTP درج کریں۔', 'Please enter the 6-digit OTP code.'));
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase(), otp: forgotOtp.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setForgotError(data.error || tr('OTP अमान्य है।', 'او ٹی پی غلط ہے۔', 'Invalid OTP. Please try again.'));
      } else {
        setForgotSuccess(tr('OTP सत्यापित! अब नया पासवर्ड बनाएं।', 'او ٹی پی تصدیق! اب نیا پاس ورڈ بنائیں۔', 'OTP verified! Now create your new password.'));
        setForgotStep(2);
      }
    } catch {
      setForgotError(tr('नेटवर्क त्रुटि।', 'نیٹ ورک خرابی۔', 'Network error. Please try again.'));
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 2: Reset password - find user by email, hash and save new password
  const handleResetPassword = async () => {
    setForgotError('');
    setForgotSuccess('');
    if (!newPassword || newPassword.length < 6) {
      setForgotError(tr('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।', 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔', 'Password must be at least 6 characters.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError(tr('पासवर्ड मेल नहीं खाते।', 'پاس ورڈ مماثل نہیں۔', 'Passwords do not match.'));
      return;
    }
    setSavingPassword(true);
    try {
      const { getUserByEmail, updateUser } = await import('../../../services/userService');
      const { hashPassword } = await import('../../../lib/auth');
      const user = await getUserByEmail(forgotEmail.trim().toLowerCase());
      if (!user) {
        setForgotError(tr('उपयोगकर्ता खाता नहीं मिला।', 'صارف اکاؤنٹ نہیں ملا۔', 'User account not found for this email.'));
        setSavingPassword(false);
        return;
      }
      const hashed = await hashPassword(newPassword);
      await updateUser(user.id, { passwordHash: hashed });
      setForgotSuccess(tr('पासवर्ड सफलतापूर्वक रीसेट!', 'پاس ورڈ کامیابی سے ری سیٹ!', 'Password reset successfully! You can now sign in.'));
      setTimeout(() => closeForgot(), 2200);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setForgotError(err?.message || tr('पासवर्ड रीसेट विफल।', 'ری سیٹ ناکام۔', 'Failed to reset password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  // RTL for Urdu
  const dir = language === 'ur' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f6f1' }} dir={dir}>

      {/* LEFT: Branding Panel */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at top left, #0f3322 0%, #061910 100%)' }}
      >
        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#c8a84b' }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: '#2e5e42' }} />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3 group w-fit">
          <img
            src="/mfct-logo.png"
            alt="MFCT Logo"
            className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-[#c8a84b] group-hover:scale-105 transition-transform"
          />
          <div>
            <p className="text-white font-black text-base tracking-tight leading-none">MFCT</p>
            <p className="text-[11px] font-medium leading-none mt-1" style={{ color: 'rgba(200,168,75,0.9)' }}>Mohammad Faeem Charitable Trust</p>
          </div>
        </Link>

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
          <p className="text-[11px] font-bold mt-1.5" style={{ color: '#f0c868' }}>-  Er. Mohammad Zahid, {tr('संस्थापक और अध्यक्ष', 'بانی و چیئرمین', 'Founder & Chairman')}</p>
        </div>
      </div>

      {/* RIGHT: Sign-In Form / Forgot Password */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-2 group w-fit">
            <img
              src="/mfct-logo.png"
              alt="MFCT Logo"
              className="w-10 h-10 rounded-full object-cover shadow border-2 border-[#c8a84b]/60 group-hover:scale-105 transition-transform"
            />
            <div>
              <p className="font-black text-base" style={{ color: '#0f3322' }}>MFCT</p>
              <p className="text-[11px] text-slate-500 font-medium">Mohammad Faeem Charitable Trust</p>
            </div>
          </Link>

          {/* ===== FORGOT PASSWORD PANEL (2-step: Verify OTP → New Password) ===== */}
          {showForgot ? (
            <div className="space-y-6">

              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeForgot}
                    className="cursor-pointer w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100"
                    style={{ color: '#0f3322' }}
                    aria-label={tr('वापस जाएं', 'واپس جائیں', 'Go back')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {tr('पासवर्ड रीसेट', 'پاس ورڈ ری سیٹ', 'Reset Password')}
                  </h2>
                </div>
                <p className="text-sm text-slate-500 font-medium pl-11">
                  {forgotStep === 1
                    ? tr('अपने पंजीकृत ईमेल पर OTP प्राप्त करें।', 'اپنے رجسٹرڈ ای میل پر OTP حاصل کریں۔', 'Verify your registered email to receive a reset code.')
                    : tr('अपना नया पासवर्ड बनाएं।', 'اپنا نیا پاس ورڈ بنائیں۔', 'Create your new password below.')}
                </p>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-3 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors"
                    style={{ background: forgotStep >= 1 ? '#0f3322' : '#e2e8f0', color: forgotStep >= 1 ? '#f0c868' : '#94a3b8' }}
                  >
                    {forgotStep > 1 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : '1'}
                  </div>
                  <span className="text-xs font-bold" style={{ color: forgotStep === 1 ? '#0f3322' : '#94a3b8' }}>
                    {tr('OTP सत्यापन', 'او ٹی پی تصدیق', 'Verify OTP')}
                  </span>
                </div>
                {/* Connector */}
                <div className="flex-1 h-0.5 rounded-full transition-all duration-500" style={{ background: forgotStep === 2 ? '#10b981' : '#e2e8f0' }} />
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors"
                    style={{ background: forgotStep === 2 ? '#0f3322' : '#e2e8f0', color: forgotStep === 2 ? '#f0c868' : '#94a3b8' }}
                  >
                    2
                  </div>
                  <span className="text-xs font-bold" style={{ color: forgotStep === 2 ? '#0f3322' : '#94a3b8' }}>
                    {tr('नया पासवर्ड', 'نیا پاس ورڈ', 'New Password')}
                  </span>
                </div>
              </div>

              {/* Error / Success Banners */}
              {forgotError && (
                <div className="flex items-start gap-2.5 p-4 rounded-2xl text-sm font-medium" style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48' }}>
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{forgotError}</span>
                </div>
              )}
              {forgotSuccess && !forgotError && (
                <div className="flex items-start gap-2.5 p-4 rounded-2xl text-sm font-medium" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {/* STEP 1: Email + OTP */}
              {forgotStep === 1 && (
                <div className="space-y-4">
                  {/* Email field + Send OTP button side by side */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      {tr('पंजीकृत ईमेल', 'رجسٹرڈ ای میل', 'Registered Email')}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                          </svg>
                        </div>
                        <input
                          id="forgot-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                      <button
                        id="forgot-send-otp"
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || countdown > 0}
                        className="cursor-pointer shrink-0 px-4 py-3 rounded-2xl font-bold text-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                        style={{ background: '#0f3322', color: '#f0c868' }}
                      >
                        {sendingOtp ? (
                          <div className="w-4 h-4 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                        ) : countdown > 0 ? (
                          <span>{countdown}s</span>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                            </svg>
                            {otpSent ? tr('पुनः भेजें', 'دوبارہ', 'Resend') : tr('OTP भेजें', 'او ٹی پی', 'Send OTP')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Preview code banner (test / dev mode) */}
                  {previewCode && (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-medium text-amber-800">
                          {tr('कोड:', 'کوڈ:', 'Code:')}{' '}
                          <span className="font-mono font-black tracking-widest text-emerald-700">{previewCode}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(previewCode)}
                        className="cursor-pointer text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                        style={{ background: 'rgba(217,119,6,0.15)', color: '#92400e' }}
                      >
                        {tr('ऑटो भरें', 'آٹو فل', 'Auto Fill')}
                      </button>
                    </div>
                  )}

                  {/* OTP input */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      {tr('6 अंकों का OTP', '6 ہندسوں کا OTP', '6-Digit OTP Code')}
                    </label>
                    <input
                      id="forgot-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="──────"
                      className="w-full py-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-center font-mono font-black text-xl tracking-[0.5em] focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal"
                    />
                  </div>

                  {/* Verify OTP button */}
                  <button
                    id="forgot-verify-otp"
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || !otpSent || forgotOtp.length !== 6}
                    className="cursor-pointer w-full mt-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)', color: '#f0c868', boxShadow: '0 8px 24px rgba(15,51,34,0.3)' }}
                  >
                    {verifyingOtp ? (
                      <div className="w-5 h-5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 opacity-80" />
                        <span>{tr('OTP सत्यापित करें और आगे बढ़ें', 'OTP تصدیق کریں اور آگے بڑھیں', 'Verify OTP & Continue')}</span>
                      </>
                    )}
                  </button>

                  {/* Back to sign in */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={closeForgot}
                      className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      ← {tr('लॉगिन पर वापस जाएं', 'لاگ ان پر واپس', 'Back to Sign In')}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: New Password form */}
              {forgotStep === 2 && (
                <div className="space-y-4">
                  {/* Verified email badge */}
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-800">
                      {tr('ईमेल सत्यापित:', 'ای میل تصدیق شدہ:', 'Verified:')} <span className="font-mono">{forgotEmail}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setForgotError(''); setForgotSuccess(''); }}
                      className="cursor-pointer ml-auto text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 transition-colors"
                    >
                      {tr('बदलें', 'تبدیل', 'Change')}
                    </button>
                  </div>

                  {/* New password */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      {tr('नया पासवर्ड', 'نیا پاس ورڈ', 'New Password')}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                      <input
                        id="forgot-new-password"
                        type={showNewPw ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={tr('कम से कम 6 अक्षर', 'کم از کم 6 حروف', 'Minimum 6 characters')}
                        className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        aria-label={showNewPw ? tr('छिपाएं', 'چھپائیں', 'Hide') : tr('दिखाएं', 'دکھائیں', 'Show')}
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      {tr('पासवर्ड की पुष्टि करें', 'پاس ورڈ کی تصدیق', 'Confirm Password')}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                      <input
                        id="forgot-confirm-password"
                        type={showConfirmPw ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={tr('पासवर्ड पुनः दर्ज करें', 'دوبارہ درج کریں', 'Re-enter your new password')}
                        className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        aria-label={showConfirmPw ? tr('छिपाएं', 'چھپائیں', 'Hide') : tr('दिखाएं', 'دکھائیں', 'Show')}
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Set New Password button */}
                  <button
                    id="forgot-save-password"
                    type="button"
                    onClick={handleResetPassword}
                    disabled={savingPassword}
                    className="cursor-pointer w-full mt-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)', color: '#f0c868', boxShadow: '0 8px 24px rgba(15,51,34,0.3)' }}
                  >
                    {savingPassword ? (
                      <div className="w-5 h-5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 opacity-80" />
                        <span>{tr('नया पासवर्ड सेट करें', 'نیا پاس ورڈ سیٹ کریں', 'Set New Password')}</span>
                      </>
                    )}
                  </button>

                  {/* Back to step 1 */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setForgotError(''); setForgotSuccess(''); }}
                      className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      ← {tr('चरण 1 पर वापस जाएं', 'مرحلہ 1 پر واپس', 'Back to Step 1 (Verify OTP)')}
                    </button>
                  </div>
                </div>
              )}
            </div>

          ) : (
            <>
              {/* ===== NORMAL SIGN-IN FORM ===== */}

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
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={tr('अपना मोबाइल नंबर दर्ज करें', 'اپنا موبائل نمبر درج کریں', 'Enter your registered phone number')}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    {/* Label row with Forgot Password link */}
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-slate-700">
                        {tr('पासवर्ड', 'پاس ورڈ', 'Password')}
                      </label>
                      <button
                        type="button"
                        id="forgot-password-link"
                        onClick={openForgot}
                        className="cursor-pointer text-xs font-bold underline decoration-2 underline-offset-4 transition-colors hover:opacity-70"
                        style={{ color: '#1a3c2c' }}
                      >
                        {tr('पासवर्ड भूल गए?', 'پاس ورڈ بھول گئے؟', 'Forgot Password?')}
                      </button>
                    </div>
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
            </>
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
