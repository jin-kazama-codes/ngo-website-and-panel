'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Clock,
  Upload,
  CheckCircle2,
  FileText,
  CreditCard,
  Building2,
  MapPin,
  Camera,
  Loader2,
  Eye,
  User as UserIcon,
} from 'lucide-react';
import { User } from '../types';
import { updateUser, getUserById } from '../services/userService';
import { uploadImage } from '../lib/storage';
import { useLanguage } from '../context/LanguageContext';

interface KycUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdated?: (updatedUser: User) => void;
}

export const KycUpdateModal: React.FC<KycUpdateModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdated,
}) => {
  const { language } = useLanguage();

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const isApproved = user.status === 'approved' || (user.isVerified && user.status !== 'reject' && user.status !== 'rejected');
  const isRejected = user.status === 'reject' || user.status === 'rejected';
  const isPending = user.status === 'pending' || (!isApproved && !isRejected);
  const reason = user.rejectionReason || user.rejection_reason;

  // Step 1 Form states prefilled from current user
  const [fullName, setFullName] = useState(user.name && user.name !== 'No User' ? user.name : '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || (user as any).district || '');
  const [state, setState] = useState(user.state || '');
  const [address, setAddress] = useState(user.address || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 2 & 3: Payment and documents
  const [paymentUtr, setPaymentUtr] = useState(user.paymentUtr || '');
  const [paymentMethod, setPaymentMethod] = useState(user.paymentMethod || 'UPI');

  // Existing document URLs
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState(user.aadhaarFrontUrl || user.documentUrl || '');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState(user.aadhaarBackUrl || '');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState(user.paymentScreenshotUrl || '');

  // File uploads
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState<File | null>(null);

  // Local previews for newly chosen files
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync and pre-fill data whenever modal opens or user prop changes
  useEffect(() => {
    if (!isOpen) return;

    let initialName = user?.name && user.name !== 'No User' ? user.name : '';
    let initialEmail = user?.email || '';
    let initialPhone = user?.phone || '';
    let initialCity = user?.city || (user as any)?.district || '';
    let initialState = user?.state || '';
    let initialAddress = user?.address || '';
    let initialAvatar = user?.avatar || '';

    // Check localStorage fallback if initial user had missing fields
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mfct_active_user') || localStorage.getItem('login_info') || localStorage.getItem('mfct_user_info');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed) {
            if (!initialName && parsed.name && parsed.name !== 'No User') initialName = parsed.name;
            if (!initialEmail && parsed.email) initialEmail = parsed.email;
            if (!initialPhone && parsed.phone) initialPhone = parsed.phone;
            if (!initialCity && (parsed.city || parsed.district)) initialCity = parsed.city || parsed.district;
            if (!initialState && parsed.state) initialState = parsed.state;
            if (!initialAddress && parsed.address) initialAddress = parsed.address;
            if (!initialAvatar && parsed.avatar) initialAvatar = parsed.avatar;
          }
        }
        if (!initialName && localStorage.getItem('name') && localStorage.getItem('name') !== 'No User') {
          initialName = localStorage.getItem('name')!;
        }
        if (!initialEmail && localStorage.getItem('email')) {
          initialEmail = localStorage.getItem('email')!;
        }
        if (!initialCity && localStorage.getItem('city')) {
          initialCity = localStorage.getItem('city')!;
        }
        if (!initialAvatar && localStorage.getItem('avatar')) {
          initialAvatar = localStorage.getItem('avatar')!;
        }
      } catch {}
    }

    setFullName(initialName);
    setEmail(initialEmail);
    setPhone(initialPhone);
    setCity(initialCity);
    setState(initialState);
    setAddress(initialAddress);
    setAvatarUrl(initialAvatar);
    setAvatarFile(null);
    setAvatarPreview(null);
    setPaymentUtr(user?.paymentUtr || '');
    setPaymentMethod(user?.paymentMethod || 'UPI');
    setAadhaarFrontUrl(user?.aadhaarFrontUrl || user?.documentUrl || '');
    setAadhaarBackUrl(user?.aadhaarBackUrl || '');
    setPaymentScreenshotUrl(user?.paymentScreenshotUrl || '');
    setAadhaarFrontFile(null);
    setAadhaarBackFile(null);
    setPaymentScreenshotFile(null);
    setFrontPreview(null);
    setBackPreview(null);
    setReceiptPreview(null);
    setErrorMsg('');
    setSuccessMsg('');

    // Fetch freshest user data from database if real user ID is available
    const targetId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('id') : null);
    if (targetId && targetId !== 'user_member') {
      getUserById(targetId).then((freshUser) => {
        if (freshUser) {
          if (freshUser.name && freshUser.name !== 'No User') setFullName(freshUser.name);
          if (freshUser.email) setEmail(freshUser.email);
          if (freshUser.phone) setPhone(freshUser.phone);
          if (freshUser.city || freshUser.district) setCity(freshUser.city || freshUser.district || '');
          if (freshUser.state) setState(freshUser.state);
          if (freshUser.address) setAddress(freshUser.address);
          if (freshUser.avatar) setAvatarUrl(freshUser.avatar);
          if (freshUser.paymentUtr) setPaymentUtr(freshUser.paymentUtr);
          if (freshUser.paymentMethod) setPaymentMethod(freshUser.paymentMethod);
          if (freshUser.aadhaarFrontUrl || freshUser.documentUrl) {
            setAadhaarFrontUrl(freshUser.aadhaarFrontUrl || freshUser.documentUrl || '');
          }
          if (freshUser.aadhaarBackUrl) setAadhaarBackUrl(freshUser.aadhaarBackUrl);
          if (freshUser.paymentScreenshotUrl) setPaymentScreenshotUrl(freshUser.paymentScreenshotUrl);
        }
      }).catch(console.error);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back' | 'receipt' | 'avatar'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(objectUrl);
    } else if (type === 'front') {
      setAadhaarFrontFile(file);
      setFrontPreview(objectUrl);
    } else if (type === 'back') {
      setAadhaarBackFile(file);
      setBackPreview(objectUrl);
    } else if (type === 'receipt') {
      setPaymentScreenshotFile(file);
      setReceiptPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg(tr('कृपया पूरा नाम दर्ज करें।', 'براہ کرم پورا نام درج کریں۔', 'Please enter full name.'));
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(tr('कृपया मोबाइल नंबर दर्ज करें।', 'براہ کرم موبائل نمبر درج کریں۔', 'Please enter phone number.'));
      return;
    }

    setSubmitting(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadImage('users', avatarFile);
      }

      let finalFrontUrl = aadhaarFrontUrl;
      let finalBackUrl = aadhaarBackUrl;
      let finalReceiptUrl = paymentScreenshotUrl;

      if (aadhaarFrontFile) {
        finalFrontUrl = await uploadImage('users', aadhaarFrontFile);
      }
      if (aadhaarBackFile) {
        finalBackUrl = await uploadImage('users', aadhaarBackFile);
      }
      if (paymentScreenshotFile) {
        finalReceiptUrl = await uploadImage('users', paymentScreenshotFile);
      }

      const payload: Partial<User> = {
        name: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        city: city.trim(),
        state: state.trim(),
        address: address.trim(),
        avatar: finalAvatarUrl || undefined,
      };

      if (isRejected) {
        payload.status = 'pending';
        payload.rejectionReason = '';
        payload.aadhaarFrontUrl = finalFrontUrl || undefined;
        payload.aadhaarBackUrl = finalBackUrl || undefined;
        payload.paymentScreenshotUrl = finalReceiptUrl || undefined;
        payload.documentUrl = finalFrontUrl || undefined;
        payload.paymentUtr = paymentUtr.trim() || undefined;
        payload.paymentMethod = paymentMethod;
      } else if (isPending) {
        payload.status = 'pending';
        if (finalFrontUrl) payload.aadhaarFrontUrl = finalFrontUrl;
        if (finalBackUrl) payload.aadhaarBackUrl = finalBackUrl;
        if (finalReceiptUrl) payload.paymentScreenshotUrl = finalReceiptUrl;
        if (paymentUtr.trim()) payload.paymentUtr = paymentUtr.trim();
        if (paymentMethod) payload.paymentMethod = paymentMethod;
      }

      const updated = await updateUser(user.id, payload);

      setSuccessMsg(
        isApproved
          ? tr('प्रोफ़ाइल सफलतापूर्वक अपडेट कर दी गई है!', 'پروفائل اپ ڈیٹ ہو گئی۔', 'Profile updated successfully!')
          : tr(
              'केवाईसी विवरण सफलतापूर्वक अपडेट कर दिया गया है! सत्यापन अब समीक्षाधीन है।',
              'کے وائی سی کی تفصیلات کامیابی سے اپ ڈیٹ ہو گئیں۔ اب تصدیق زیر جائزہ ہے۔',
              'KYC details updated successfully! Status is now pending admin review.'
            )
      );

      if (onUpdated) {
        onUpdated(updated);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update KYC/Profile:', err);
      setErrorMsg(err?.message || 'Failed to update details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800"
          style={{ background: 'var(--mfct-dark-green)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              {isApproved ? (
                <UserIcon className="w-5 h-5 text-amber-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isApproved
                  ? tr('प्रोफ़ाइल विवरण संपादित करें', 'پروفائل تفصیلات تبدیل کریں', 'Edit Profile')
                  : tr('केवाईसी सत्यापन विवरण अपडेट करें', 'کے وائی سی تصدیقی تفصیلات اپ ڈیٹ کریں', 'Update KYC Details')}
              </h3>
              <p className="text-xs text-emerald-200">
                {user.membershipId ? `ID: ${user.membershipId}` : (user.email || user.name)}
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Rejection Alert Banner */}
          {isRejected && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-rose-800 dark:text-rose-300 text-sm">
                  {tr('व्यवस्थापक द्वारा केवाईसी अस्वीकार कर दिया गया है', 'ایڈمن کے ذریعہ کے وائی سی مسترد کر دیا گیا ہے', 'KYC Application Rejected by Admin')}
                </p>
                {reason && (
                  <div className="mt-1.5 p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900">
                    <span className="font-bold text-rose-700 dark:text-rose-400">
                      {tr('अस्वीकृति का कारण:', 'مسترد کرنے کی وجہ:', 'Rejection Reason:')}{' '}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{reason}</span>
                  </div>
                )}
                <p className="mt-1.5 text-rose-700 dark:text-rose-400">
                  {tr(
                    'कृपया नीचे सही जानकारी व दस्तावेज़ पुनः अपलोड करके फॉर्म जमा करें।',
                    'براہ کرم نیچے درست معلومات اور دستاویزات اپلوڈ کر کے فارم جمع کریں۔',
                    'Please update the corrected details and re-upload required documents below for re-verification.'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Pending Status Alert Banner */}
          {isPending && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-amber-800 dark:text-amber-300">
                  {tr('केवाईसी सत्यापन प्रक्रिया में है', 'کے وائی سی تصدیق جاری ہے', 'KYC Status: Pending Review')}
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                  {tr(
                    'यदि कोई जानकारी गलत है, तो आप नीचे इसे अभी सुधार कर सकते हैं।',
                    'اگر کوئی معلومات غلط ہے تو آپ اسے نیچے ابھی درست کر سکتے ہیں۔',
                    'You may review or correct your personal and contact details below before final approval.'
                  )}
                </p>
              </div>
            </div>
          )}

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

          {/* Section 1: Basic Details & Profile Picture */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              {tr('व्यक्तिगत विवरण', 'ذاتی تفصیلات', 'Personal Information')}
            </h4>

            {/* Profile Photo Upload */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center">
                {avatarPreview || avatarUrl ? (
                  <img
                    src={avatarPreview || avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {tr('फ़ोटो / प्रोफ़ाइल चित्र', 'پروفائل تصویر', 'Profile Photo')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                  {tr('JPG, PNG स्वीकार्य', 'JPG، PNG قابل قبول', 'JPG, PNG image')}
                </p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {avatarPreview || avatarUrl
                      ? tr('फ़ोटो बदलें', 'تصویر تبدیل کریں', 'Change Photo')
                      : tr('फ़ोटो अपलोड करें', 'تصویر اپلوڈ کریں', 'Upload Photo')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('पूरा नाम *', 'پورا نام *', 'Full Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('ईमेल पता', 'ای میل پتہ', 'Email Address')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('मोबाइल नंबर *', 'موبائل نمبر *', 'Phone Number *')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('शहर / जिला *', 'شہر / ضلع *', 'City / District *')}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('राज्य *', 'ریاست *', 'State *')}
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('पूरा पता', 'مکمل پتہ', 'Full Address')}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2 & 3: Aadhaar and Payment (shown fully if rejected, or optional collapsible if pending) */}
          {(isRejected || isPending) && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {isPending ? (
                <details className="group">
                  <summary className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline py-1 flex items-center justify-between list-none">
                    <span>{tr('दस्तावेज़ या भुगतान रसीद भी बदलें (वैकल्पिक)', 'دستاویزات یا رسید تبدیل کریں (اختیاری)', 'Update ID Documents / Payment Receipt (Optional)')}</span>
                    <span className="text-[10px] text-slate-400 font-normal">▼</span>
                  </summary>
                  <div className="pt-3 space-y-4">
                    {/* Documents Content */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {tr('आधार कार्ड / पहचान प्रमाण दस्तावेज', 'شناختی دستاویز', 'ID Proof / Aadhaar Documents')}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {tr('आधार कार्ड (सामने का भाग)', 'آدھار کارڈ (سامنے کا حصہ)', 'Aadhaar Card (Front)')}
                          </span>
                          {(frontPreview || aadhaarFrontUrl) ? (
                            <div className="relative mb-2.5 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 h-32 bg-slate-900 flex items-center justify-center">
                              <img src={frontPreview || aadhaarFrontUrl} alt="Aadhaar Front" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 mb-2.5 text-xs">
                              <FileText className="w-6 h-6 mb-1" />
                              <span>No front document</span>
                            </div>
                          )}
                          <label className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{frontPreview || aadhaarFrontUrl ? tr('दस्तावेज़ बदलें', 'تبدیل کریں', 'Replace Front Image') : tr('दस्तावेज़ अपलोड करें', 'اپلوڈ کریں', 'Upload Front Image')}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'front')} />
                          </label>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {tr('आधार कार्ड (पीछे का भाग)', 'آدھار کارڈ (پیچھے کا حصہ)', 'Aadhaar Card (Back)')}
                          </span>
                          {(backPreview || aadhaarBackUrl) ? (
                            <div className="relative mb-2.5 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 h-32 bg-slate-900 flex items-center justify-center">
                              <img src={backPreview || aadhaarBackUrl} alt="Aadhaar Back" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 mb-2.5 text-xs">
                              <FileText className="w-6 h-6 mb-1" />
                              <span>No back document</span>
                            </div>
                          )}
                          <label className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{backPreview || aadhaarBackUrl ? tr('दस्तावेज़ बदलें', 'تبدیل کریں', 'Replace Back Image') : tr('दस्तावेज़ अपलोड करें', 'اپلوڈ کریں', 'Upload Back Image')}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'back')} />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Payment Content */}
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        {tr('सदस्यता शुल्क व भुगतान विवरण', 'ادائیگی کی تفصیلات', 'Payment & Fee Verification')}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {tr('बैंक UTR / रेफ़रेंस नंबर', 'بینک UTR نمبر', 'Bank UTR / Ref Number')}
                          </label>
                          <input
                            type="text"
                            value={paymentUtr}
                            onChange={(e) => setPaymentUtr(e.target.value)}
                            placeholder="e.g. 4289XXXXXXXX"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {tr('भुगतान का तरीका', 'طریقہ ادائیگی', 'Payment Method')}
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="UPI">UPI / QR Code</option>
                            <option value="Net Banking">Net Banking / IMPS</option>
                            <option value="Cash">Cash to Coordinator</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {tr('भुगतान रसीद / स्क्रीनशॉट', 'ادائیگی کی رسید', 'Payment Screenshot')}
                          </span>
                          {(receiptPreview || paymentScreenshotUrl) ? (
                            <div className="relative mb-2.5 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 h-36 bg-slate-900 flex items-center justify-center">
                              <img src={receiptPreview || paymentScreenshotUrl} alt="Payment Receipt" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 mb-2.5 text-xs">
                              <CreditCard className="w-5 h-5 mb-1" />
                              <span>No receipt screenshot</span>
                            </div>
                          )}
                          <label className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{receiptPreview || paymentScreenshotUrl ? tr('रसीद बदलें', 'رسید تبدیل کریں', 'Replace Receipt') : tr('रसीद अपलोड करें', 'رسید اپلوڈ کریں', 'Upload Receipt')}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'receipt')} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              ) : (
                <div className="space-y-5">
                  {/* Documents Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {tr('आधार कार्ड / पहचान प्रमाण दस्तावेज', 'شناختی دستاویز', 'ID Proof / Aadhaar Documents')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                          {tr('आधार कार्ड (सामने का भाग)', 'آدھار کارڈ (سامنے کا حصہ)', 'Aadhaar Card (Front)')}
                        </span>
                        {(frontPreview || aadhaarFrontUrl) ? (
                          <div className="relative mb-2.5 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 h-32 bg-slate-900 flex items-center justify-center">
                            <img src={frontPreview || aadhaarFrontUrl} alt="Aadhaar Front" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 mb-2.5 text-xs">
                            <FileText className="w-6 h-6 mb-1" />
                            <span>No front document</span>
                          </div>
                        )}
                        <label className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{frontPreview || aadhaarFrontUrl ? tr('दस्तावेज़ बदलें', 'تبدیل کریں', 'Replace Front Image') : tr('दस्तावेज़ अपलोड करें', 'اپلوڈ کریں', 'Upload Front Image')}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'front')} />
                        </label>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                          {tr('आधार कार्ड (पीछे का भाग)', 'آدھار کارڈ (پیچھے کا حصہ)', 'Aadhaar Card (Back)')}
                        </span>
                        {(backPreview || aadhaarBackUrl) ? (
                          <div className="relative mb-2.5 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 h-32 bg-slate-900 flex items-center justify-center">
                            <img src={backPreview || aadhaarBackUrl} alt="Aadhaar Back" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 mb-2.5 text-xs">
                            <FileText className="w-6 h-6 mb-1" />
                            <span>No back document</span>
                          </div>
                        )}
                        <label className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{backPreview || aadhaarBackUrl ? tr('दस्तावेज़ बदलें', 'تبدیل کریں', 'Replace Back Image') : tr('दस्तावेज़ अपलोड करें', 'اپلوڈ کریں', 'Upload Back Image')}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'back')} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      {tr('सदस्यता शुल्क व भुगतान विवरण', 'ادائیگی کی تفصیلات', 'Payment & Fee Verification')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {tr('बैंक UTR / रेफ़रेंस नंबर', 'بینک UTR نمبر', 'Bank UTR / Ref Number')}
                        </label>
                        <input
                          type="text"
                          value={paymentUtr}
                          onChange={(e) => setPaymentUtr(e.target.value)}
                          placeholder="e.g. 4289XXXXXXXX"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {tr('भुगतान का तरीका', 'طریقہ ادائیگی', 'Payment Method')}
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="UPI">UPI / QR Code</option>
                          <option value="Net Banking">Net Banking / IMPS</option>
                          <option value="Cash">Cash to Coordinator</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                          {tr('भुगतान रसीद / स्क्रीनशॉट', 'ادائیگی کی رسید', 'Payment Screenshot')}
                        </span>
                        {(receiptPreview || paymentScreenshotUrl) ? (
                          <div className="relative mb-2.5 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 h-36 bg-slate-900 flex items-center justify-center">
                            <img src={receiptPreview || paymentScreenshotUrl} alt="Payment Receipt" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 mb-2.5 text-xs">
                            <CreditCard className="w-5 h-5 mb-1" />
                            <span>No receipt screenshot</span>
                          </div>
                        )}
                        <label className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{receiptPreview || paymentScreenshotUrl ? tr('रसीद बदलें', 'رسید تبدیل کریں', 'Replace Receipt') : tr('रसीद अपलोड करें', 'رسید اپلوڈ کریں', 'Upload Receipt')}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'receipt')} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                  <span>{tr('सहेज रहे हैं...', 'محفوظ کیا جا رہا ہے...', 'Saving & Submitting...')}</span>
                </>
              ) : isApproved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{tr('अपडेट करें', 'اپ ڈیٹ کریں', 'Update')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{tr('पुनः सत्यापन हेतु भेजें', 'دوبارہ تصدیق کے لیے بھیجیں', 'Submit for Re-Verification')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
