'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Mail,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { User } from '../types';
import { updateUser } from '../services/userService';
import { hashPassword, verifyPassword } from '../lib/auth';
import { useLanguage } from '../context/LanguageContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { language } = useLanguage();

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  // Mode: 'change' (requires old password) | 'forgot' (2-step: 1. Verify OTP -> 2. Create Password)
  const [mode, setMode] = useState<'change' | 'forgot'>('change');
  // 2-step state for forgot password flow
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Form fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Email OTP states
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync email when user prop changes
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp('');
    setOtpSent(false);
    setPreviewOtp(null);
    setForgotStep(1);
  };

  // 1. Send Email OTP
  const handleSendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = (email || user.email || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg(
        tr(
          'कृपया एक मान्य ईमेल पता दर्ज करें।',
          'براہ کرم ایک درست ای میل پتہ درج کریں۔',
          'Please enter a valid email address.'
        )
      );
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setCountdown(60);

      if (data.emailSent) {
        setPreviewOtp(null);
        setSuccessMsg(
          tr(
            `OTP आपके ईमेल (${targetEmail}) पर भेजा गया है। कृपया अपना इनबॉक्स जांचें।`,
            `او ٹی پی آپ کے ای میل (${targetEmail}) پر بھیج دیا گیا ہے۔ براہ کرم اپنا ان باکس چیک کریں۔`,
            `OTP has been sent to your email (${targetEmail}). Please check your inbox.`
          )
        );
      } else {
        if (data.previewCode) {
          setPreviewOtp(data.previewCode);
        }
        if (data.emailError) {
          setErrorMsg(`Resend Error: ${data.emailError}`);
        } else {
          setSuccessMsg(
            tr(
              'सत्यापन कोड उत्पन्न हुआ (टेस्ट मोड)।',
              'تصدیقی کوڈ جنریٹ ہو گیا۔',
              'Verification code generated (Test mode).'
            )
          );
        }
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMsg(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // 2. Step 1: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = (email || user.email || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg(
        tr(
          'कृपया एक मान्य ईमेल पता दर्ज करें।',
          'براہ کرم ایک درست ای میل پتہ درج کریں۔',
          'Please enter a valid email address.'
        )
      );
      return;
    }

    if (!otpSent) {
      setErrorMsg(
        tr(
          'कृपया पहले "OTP भेजें" पर क्लिक करें।',
          'براہ کرم پہلے "او ٹی پی بھیجیں" پر کلک کریں۔',
          'Please click "Send OTP" first to receive verification code.'
        )
      );
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      setErrorMsg(
        tr(
          'कृपया 6 अंकों का OTP दर्ज करें।',
          'براہ کرم 6 ہندسوں کا او ٹی پی درج کریں۔',
          'Please enter the 6-digit OTP code.'
        )
      );
      return;
    }

    setVerifyingOtp(true);
    try {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          otp: otp.trim(),
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(
          verifyData.error ||
            tr(
              'अमान्य OTP कोड। कृपया पुनः जांचें।',
              'غلط او ٹی پی کوڈ۔ براہ کرم دوبارہ چیک کریں۔',
              'Invalid OTP code. Please check and try again.'
            )
        );
      }

      setSuccessMsg(
        tr(
          'OTP सफलतापूर्वक सत्यापित हुआ! अब अपना नया पासवर्ड बनाएं।',
          'او ٹی پی کامیابی سے تصدیق شدہ! اب اپنا نیا پاس ورڈ بنائیں۔',
          'OTP verified successfully! Now create your new password.'
        )
      );
      setForgotStep(2);
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setErrorMsg(err?.message || 'Failed to verify OTP.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // 3. Step 2: Set New Password (or Normal Mode change)
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // --- Validation in Normal Mode ---
    if (mode === 'change' && user.passwordHash) {
      if (!currentPassword) {
        setErrorMsg(
          tr(
            'कृपया वर्तमान पासवर्ड दर्ज करें।',
            'براہ کرم موجودہ پاس ورڈ درج کریں۔',
            'Please enter current password.'
          )
        );
        return;
      }
    }

    // --- Password Validation ---
    if (!newPassword) {
      setErrorMsg(
        tr(
          'कृपया नया पासवर्ड दर्ज करें।',
          'براہ کرم نیا پاس ورڈ درج کریں۔',
          'Please enter new password.'
        )
      );
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg(
        tr(
          'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
          'نیا پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔',
          'New password must be at least 6 characters long.'
        )
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(
        tr(
          'नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।',
          'نیا پاس ورڈ اور تصدیقی پاس ورڈ مماثل نہیں ہیں۔',
          'New password and confirmation password do not match.'
        )
      );
      return;
    }

    setSubmitting(true);
    try {
      // If Normal Mode, verify current password first
      if (mode === 'change' && user.passwordHash) {
        const isValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isValid) {
          setErrorMsg(
            tr(
              'वर्तमान पासवर्ड गलत है। यदि आप भूल गए हैं, तो "पासवर्ड भूल गए?" पर क्लिक करें।',
              'موجودہ پاس ورڈ غلط ہے۔ اگر آپ بھول گئے ہیں تو "پاس ورڈ بھول گئے؟" پر کلک کریں۔',
              'Current password is incorrect. If forgotten, click "Forgot Password?".'
            )
          );
          setSubmitting(false);
          return;
        }

        if (currentPassword === newPassword) {
          setErrorMsg(
            tr(
              'नया पासवर्ड वर्तमान पासवर्ड से अलग होना चाहिए।',
              'نیا پاس ورڈ موجودہ پاس ورڈ سے مختلف ہونا چاہیے۔',
              'New password cannot be the same as your current password.'
            )
          );
          setSubmitting(false);
          return;
        }
      }

      // Hash and update password in DB
      const newPasswordHash = await hashPassword(newPassword);
      await updateUser(user.id, {
        passwordHash: newPasswordHash,
      });

      setSuccessMsg(
        mode === 'forgot'
          ? tr(
              'पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है!',
              'پاس ورڈ کامیابی سے ری سیٹ کر دیا گیا ہے!',
              'Password has been reset successfully!'
            )
          : tr(
              'पासवर्ड सफलतापूर्वक अपडेट कर दिया गया है!',
              'پاس ورڈ کامیابی سے اپ ڈیٹ کر دیا گیا ہے!',
              'Password has been updated successfully!'
            )
      );

      setTimeout(() => {
        onClose();
        setMode('change');
        resetFormState();
      }, 1600);
    } catch (err: any) {
      console.error('Password save error:', err);
      setErrorMsg(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800"
          style={{ background: 'var(--mfct-dark-green, #0f3322)' }}
        >
          <div className="flex items-center gap-3">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => {
                  if (forgotStep === 2) {
                    setForgotStep(1);
                    setErrorMsg('');
                    setSuccessMsg('');
                  } else {
                    setMode('change');
                    resetFormState();
                  }
                }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer mr-1"
                title={tr('वापस जाएं', 'واپس جائیں', 'Go Back')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <KeyRound className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'change'
                  ? tr('पासवर्ड बदलें', 'پاس ورڈ تبدیل کریں', 'Change Password')
                  : tr('पासवर्ड भूल गए (OTP रीसेट)', 'پاس ورڈ بھول گئے (او ٹی پی)', 'Forgot Password (OTP Reset)')}
              </h3>
              <p className="text-xs text-emerald-200">
                {user.email || user.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper for Forgot Password Mode */}
        {mode === 'forgot' && (
          <div className="px-6 pt-4 pb-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              {/* Step 1 Pill */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    forgotStep === 1
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  }`}
                >
                  {forgotStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <span
                  className={`text-xs font-bold ${
                    forgotStep === 1
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tr('चरण 1: OTP सत्यापन', 'مرحلہ 1: OTP تصدیق', 'Step 1: Verify OTP')}
                </span>
              </div>

              {/* Connecting Line */}
              <div
                className={`flex-1 mx-3 h-0.5 rounded-full ${
                  forgotStep === 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />

              {/* Step 2 Pill */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    forgotStep === 2
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-bold ${
                    forgotStep === 2
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {tr('चरण 2: नया पासवर्ड', 'مرحلہ 2: نیا پاس ورڈ', 'Step 2: New Password')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Test / Dev OTP Preview Banner */}
          {mode === 'forgot' && forgotStep === 1 && previewOtp && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {tr('सत्यापन कोड (OTP):', 'تصدیقی کوڈ (OTP):', 'Verification Code (OTP):')}
                </span>
                <span className="font-mono font-bold tracking-widest text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-300">
                  {previewOtp}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(previewOtp)}
                className="text-[11px] font-bold text-amber-700 dark:text-amber-400 underline hover:no-underline cursor-pointer"
              >
                {tr('ऑटो भरें', 'آٹو فل', 'Auto Fill')}
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* 1. NORMAL MODE: Current Password + New Password               */}
          {/* ============================================================== */}
          {mode === 'change' && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              {user.passwordHash && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {tr('वर्तमान पासवर्ड *', 'موجودہ پاس ورڈ *', 'Current Password *')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        resetFormState();
                      }}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      {tr('पासवर्ड भूल गए?', 'پاس ورڈ بھول گئے؟', 'Forgot Password?')}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={tr('वर्तमान पासवर्ड दर्ज करें', 'موجودہ پاس ورڈ درج کریں', 'Enter current password')}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('नया पासवर्ड *', 'نیا پاس ورڈ *', 'New Password *')}
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={tr('कम से कम 6 अक्षर', 'کم از کم 6 حروف', 'Minimum 6 characters')}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('नए पासवर्ड की पुष्टि करें *', 'نئے پاس ورڈ کی تصدیق کریں *', 'Confirm New Password *')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={tr('नया पासवर्ड पुनः दर्ज करें', 'نیا پاس ورڈ دوبارہ درج کریں', 'Re-enter new password')}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tr('अद्यतन कर रहे हैं...', 'اپ ڈیٹ کر رہے ہیں...', 'Updating...')}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{tr('पासवर्ड अपडेट करें', 'پاس ورڈ اپ ڈیٹ کریں', 'Update Password')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 2. FORGOT MODE - STEP 1: Verify Email OTP                      */}
          {/* ============================================================== */}
          {mode === 'forgot' && forgotStep === 1 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tr(
                    'अपने पंजीकृत ईमेल पते पर 6 अंकों का सत्यापन कोड प्राप्त करें और नीचे दर्ज करें।',
                    'اپنے رجسٹرڈ ای میل ایڈریس پر 6 ہندسوں کا تصدیقی کوڈ حاصل کریں اور نیچے درج کریں۔',
                    'Receive a 6-digit verification code on your registered email address and enter it below.'
                  )}
                </p>
              </div>

              {/* Email Input + Send Button */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('पंजीकृत ईमेल *', 'رجسٹرڈ ای میل *', 'Registered Email *')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || countdown > 0}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
                  >
                    {sendingOtp ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : countdown > 0 ? (
                      <span>{countdown}s</span>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{otpSent ? tr('पुनः भेजें', 'دوبارہ بھیجیں', 'Resend') : tr('OTP भेजें', 'او ٹی پی بھیجیں', 'Send OTP')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 6-Digit OTP Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('6 अंकों का OTP दर्ज करें *', '6 ہندسوں کا او ٹی پی درج کریں *', 'Enter 6-Digit OTP *')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full px-3 py-2.5 text-center text-base font-mono tracking-widest font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Step 1 Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('change');
                    resetFormState();
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{tr('सामान्य पासवर्ड मोड', 'عام پاس ورڈ موڈ', 'Normal Mode')}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingOtp || !otpSent || otp.length !== 6}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{tr('सत्यापित कर रहे हैं...', 'تصدیق کر رہے ہیں...', 'Verifying...')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{tr('OTP सत्यापित करें & आगे बढ़ें', 'او ٹی پی تصدیق کریں & آگے بڑھیں', 'Verify OTP & Continue')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 3. FORGOT MODE - STEP 2: Create New Password                   */}
          {/* ============================================================== */}
          {mode === 'forgot' && forgotStep === 2 && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              {/* Verified badge */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    {tr('ईमेल सत्यापित:', 'ای میل تصدیق شدہ:', 'Verified:')} <span className="font-bold underline">{email}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep(1);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                >
                  {tr('बदलें', 'تبدیل', 'Change')}
                </button>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('नया पासवर्ड बनाएं *', 'نیا پاس ورڈ بنائیں *', 'Create New Password *')}
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={tr('कम से कम 6 अक्षर', 'کم از کم 6 حروف', 'Minimum 6 characters')}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('नए पासवर्ड की पुष्टि करें *', 'نئے پاس ورڈ کی تصدیق کریں *', 'Confirm New Password *')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={tr('नया पासवर्ड पुनः दर्ज करें', 'نیا پاس ورڈ دوبارہ درج کریں', 'Re-enter new password')}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep(1);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{tr('चरण 1 पर लौटें', 'مرحلہ 1 پر واپس', 'Back to Step 1')}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{tr('सहेज रहे हैं...', 'محفوظ کر رہے ہیں...', 'Saving...')}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{tr('नया पासवर्ड सहेजें', 'نیا پاس ورڈ محفوظ کریں', 'Set New Password')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
