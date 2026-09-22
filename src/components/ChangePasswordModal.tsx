'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ShieldCheck,
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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (user.passwordHash && !currentPassword) {
      setErrorMsg(
        tr(
          'कृपया वर्तमान पासवर्ड दर्ज करें।',
          'براہ کرم موجودہ پاس ورڈ درج کریں۔',
          'Please enter current password.'
        )
      );
      return;
    }

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
      // If user has an existing passwordHash, verify current password
      if (user.passwordHash) {
        const isValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isValid) {
          setErrorMsg(
            tr(
              'वर्तमान पासवर्ड गलत है। कृपया पुनः प्रयास करें।',
              'موجودہ پاس ورڈ غلط ہے۔ براہ کرم دوبارہ کوشش کریں۔',
              'Current password is incorrect. Please try again.'
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

      // Hash and update
      const newPasswordHash = await hashPassword(newPassword);
      await updateUser(user.id, {
        passwordHash: newPasswordHash,
      });

      setSuccessMsg(
        tr(
          'पासवर्ड सफलतापूर्वक बदल दिया गया है!',
          'پاس ورڈ کامیابی سے تبدیل کر دیا گیا ہے!',
          'Password has been changed successfully!'
        )
      );

      setTimeout(() => {
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      console.error('Password change error:', err);
      setErrorMsg(err?.message || 'Failed to change password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800"
          style={{ background: 'var(--mfct-dark-green)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {tr('पासवर्ड बदलें', 'پاس ورڈ تبدیل کریں', 'Change Password')}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Password (if user already has passwordHash) */}
          {user.passwordHash && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {tr('वर्तमान पासवर्ड *', 'موجودہ پاس ورڈ *', 'Current Password *')}
              </label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
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
      </div>
    </div>
  );
};
