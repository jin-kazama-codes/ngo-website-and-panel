'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

type ResetStep = 'identify' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };
  const [step, setStep] = useState<ResetStep>('identify');
  const [membershipId, setMembershipId] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId, email }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Could not send a verification code.');
      }

      setPreviewCode(result.previewCode || '');
      setNotice(
        result.emailSent
          ? tr('आपके पंजीकृत ईमेल पर OTP भेजा गया है।', 'آپ کے رجسٹرڈ ای میل پر OTP بھیجا گیا ہے۔', 'A verification code was sent to your registered email.')
          : tr('ईमेल सेवा कॉन्फ़िगर नहीं है। स्थानीय परीक्षण के लिए नीचे दिया गया कोड उपयोग करें।', 'ای میل سروس ترتیب نہیں ہے۔ مقامی جانچ کے لیے نیچے دیا گیا کوڈ استعمال کریں۔', 'Email is not configured. Use the development-only code shown below.')
      );
      setStep('reset');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send a verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (password.length < 6) {
      setError(tr('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।', 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔', 'Password must be at least 6 characters.'));
      return;
    }
    if (password !== confirmPassword) {
      setError(tr('पासवर्ड मेल नहीं खाते।', 'پاس ورڈ مماثل نہیں ہیں۔', 'Passwords do not match.'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId, email, otp, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Could not reset your password.');
      }
      setStep('done');
      setNotice(tr('आपका पासवर्ड बदल दिया गया है। अब साइन इन करें।', 'آپ کا پاس ورڈ تبدیل ہو گیا ہے۔ اب سائن ان کریں۔', 'Your password has been reset. You can now sign in.'));
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not reset your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f6f1] px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <Link href="/sign-in" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0f3322]">
          <ArrowLeft className="h-4 w-4" />
          {tr('साइन इन पर वापस जाएं', 'سائن ان پر واپس جائیں', 'Back to sign in')}
        </Link>

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
          {step === 'done' ? <CheckCircle2 className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          {tr('पासवर्ड रीसेट करें', 'پاس ورڈ ری سیٹ کریں', 'Reset your password')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {tr(
            'कई सदस्यों का ईमेल एक हो सकता है। सही खाते की पुष्टि के लिए सदस्यता आईडी और पंजीकृत ईमेल दोनों दर्ज करें।',
            'ایک ای میل کئی ممبران کے لیے ہو سکتی ہے۔ اکاؤنٹ کی تصدیق کے لیے ممبرشپ آئی ڈی اور رجسٹرڈ ای میل دونوں درج کریں۔',
            'An email address can belong to multiple members. Enter your membership ID and registered email to identify the correct account.'
          )}
        </p>

        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{notice}</p>}

        {step === 'identify' && (
          <form onSubmit={handleRequestCode} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              {tr('सदस्यता आईडी', 'ممبرشپ آئی ڈی', 'Membership ID')}
              <input
                required
                autoComplete="username"
                value={membershipId}
                onChange={(event) => setMembershipId(event.target.value.toUpperCase())}
                placeholder="MFCT-00001"
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              {tr('पंजीकृत ईमेल', 'رجسٹرڈ ای میل', 'Registered email')}
              <span className="relative mt-1.5 block">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                />
              </span>
            </label>
            <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3322] px-4 py-3.5 text-sm font-bold text-[#f0c868] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? tr('भेजा जा रहा है…', 'بھیجا جا رہا ہے…', 'Sending…') : tr('OTP भेजें', 'OTP بھیجیں', 'Send verification code')}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            {previewCode && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {tr('स्थानीय परीक्षण OTP:', 'مقامی جانچ OTP:', 'Development-only code:')} <strong className="font-mono tracking-widest">{previewCode}</strong>
              </div>
            )}
            <label className="block text-sm font-semibold text-slate-700">
              {tr('6 अंकों का OTP', '6 ہندسوں کا OTP', '6-digit verification code')}
              <input
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm tracking-widest text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              {tr('नया पासवर्ड', 'نیا پاس ورڈ', 'New password')}
              <input
                required
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              {tr('नया पासवर्ड दोबारा दर्ज करें', 'نیا پاس ورڈ دوبارہ درج کریں', 'Confirm new password')}
              <input
                required
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3322] px-4 py-3.5 text-sm font-bold text-[#f0c868] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? tr('पासवर्ड अपडेट हो रहा है…', 'پاس ورڈ اپ ڈیٹ ہو رہا ہے…', 'Updating password…') : tr('पासवर्ड रीसेट करें', 'پاس ورڈ ری سیٹ کریں', 'Reset password')}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('identify');
                setOtp('');
                setPassword('');
                setConfirmPassword('');
                setPreviewCode('');
                setNotice('');
                setError('');
              }}
              className="w-full py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              {tr('सदस्यता आईडी या ईमेल बदलें', 'ممبرشپ آئی ڈی یا ای میل تبدیل کریں', 'Change membership ID or email')}
            </button>
          </form>
        )}

        {step === 'done' && (
          <Link href="/sign-in" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3322] px-4 py-3.5 text-sm font-bold text-[#f0c868]">
            {tr('साइन इन करें', 'سائن ان کریں', 'Go to sign in')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </section>
    </main>
  );
}
