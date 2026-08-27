'use client';

import React, { useState, useEffect } from 'react';
import { User, Community } from '../types';
import { X, Upload, ArrowRight, UserCheck, Sparkles, Lock, Eye, EyeOff, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCommunities } from '../services/communityService';
import { createUser } from '../services/userService';
import { uploadImage } from '../lib/storage';
import { hashPassword } from '../lib/auth';
import { useLanguage } from '../context/LanguageContext';

interface RegistrationModalProps {
  onClose: () => void;
  onRegistered: (user: User) => void;
  hasPendingDonation?: boolean;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  onClose,
  onRegistered,
  hasPendingDonation = false,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycUploaded, setKycUploaded] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploaded, setAvatarUploaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getCommunities().then((data) => {
      setCommunities(data);
      if (data.length > 0) setSelectedCommunityId(data[0].id);
    }).catch(console.error);
  }, []);

  const activeCommunity = communities.find((c) => c.id === selectedCommunityId) || communities[0];

  const handleKycFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setKycFile(file); setKycUploaded(true); }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAvatarFile(file); setAvatarUploaded(true); }
  };

  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setScreenshotFile(file); setScreenshotUploaded(true); }
  };

  const handleFinishRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;
    setSubmitting(true);
    try {
      let kycUrl: string | undefined;
      if (kycFile) {
        kycUrl = await uploadImage('users', kycFile);
      }

      let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
      if (avatarFile) {
        avatarUrl = await uploadImage('users', avatarFile);
      }

      let screenshotUrl: string | undefined;
      if (screenshotFile) {
        screenshotUrl = await uploadImage('receipts', screenshotFile);
      }

      const hashedPassword = await hashPassword(password);

      const newMember: User = {
        id: `usr_new_${Date.now()}`,
        name: fullName,
        email: email,
        phone: phone,
        city,
        state: state,
        role: 'member',
        avatar: avatarUrl,
        communityId: activeCommunity.id,
        communityName: activeCommunity.name,
        membershipId: `SS-${city.substring(0, 3).toUpperCase()}-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        isVerified: false,
        isPremium: false,
        joinDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        passwordHash: hashedPassword,
        paymentMethod: paymentMethod,
        paymentUtr: utrNumber || undefined,
        paymentScreenshotUrl: screenshotUrl,
      };

      await createUser({ ...newMember, kycDocumentUrl: kycUrl });
      onRegistered(newMember);
      setStep(3);
      try { confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } }); } catch { }
    } catch (err) {
      console.error('Registration error:', err);
      showToast(
        tr(
          'पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।',
          'رجسٹریشن ناکام رہی، دوبارہ کوشش کریں۔',
          'Registration failed. Please try again.'
        ),
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div
        className="rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)' }}
      >
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 transition-colors"
          style={{ color: 'var(--mfct-text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {toast && (
          <div className={`fixed top-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all z-[100] flex items-center gap-2 animate-fade-in ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}>
            <span>{toast.message}</span>
          </div>
        )}

        <div className="mb-6">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2"
            style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
            <span>{tr('₹100 सदस्यता एकजुटता कार्यक्रम', '₹100 ممبرشپ یکجہتی پروگرام', '₹100 Membership Solidarity Program')}</span>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--mfct-dark-green)', fontFamily: 'Playfair Display, serif' }}>
            {tr('सत्यापित समुदाय सदस्य बनें', 'تصدیق شدہ کمیونٹی ممبر بنیں', 'Become a Verified Community Member')}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--mfct-text-muted)' }}>
            {tr(
              'अपने स्थानीय समुदाय से जुड़ें। दानकर्ता बनें और आपातकालीन सहायता के पात्र भी।',
              'اپنی مقامی کمیونٹی میں شامل ہوں۔ عطیہ دہندہ بنیں اور ہنگامی امداد کے اہل بھی۔',
              'Join your local neighbourhood community. Become an active supporter and get direct emergency relief.'
            )}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('पूरा नाम (आधार के अनुसार) *', 'مکمل نام (آدھار کے مطابق) *', 'Full Name (as per Aadhaar/ID) *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={tr('उदा. मोहम्मद तारिक', 'مثال: محمد طارق', 'e.g. Mohammad Tariq')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm font-medium outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('मोबाइल नंबर *', 'موبائل نمبر *', 'Mobile Number *')}
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="w-full p-3 rounded-xl text-sm font-medium outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('ईमेल पता (वैकल्पिक)', 'ای میل ایڈریس (اختیاری)', 'Email Address (Optional)')}
                </label>
                <input
                  type="email"
                  placeholder={tr('उदा. tariq@example.com', 'tariq@example.com', 'e.g. tariq@example.com')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm font-medium outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('पासवर्ड बनाएं *', 'پاس ورڈ بنائیں *', 'Create Password *')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={tr('कम से कम 6 अक्षर', 'کم از کم 6 حروف', 'Minimum 6 characters')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl text-sm font-medium outline-none"
                    style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-3"
                    style={{ color: 'var(--mfct-text-muted)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('राज्य *', 'ریاست *', 'State *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={tr('उदा. उत्तर प्रदेश', 'مثال: اتر پردیش', 'e.g. Uttar Pradesh')}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm font-medium outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('शहर / कस्बा *', 'شہر / قصبہ *', 'City / Town *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={tr('उदा. बरेली', 'مثال: بریلی', 'e.g. Bareilly')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm font-medium outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                {tr('अपना स्थानीय समुदाय चुनें', 'اپنی مقامی کمیونٹی منتخب کریں', 'Select Your Local Community')}
              </label>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="w-full p-3 rounded-xl text-sm font-medium outline-none truncate"
                style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city} - {tr('प्रशासक:', 'ایڈمن:', 'Admin:')} {c.adminName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('प्रोफ़ाइल फ़ोटो (वैकल्पिक)', 'پروفائل تصویر (اختیاری)', 'Profile Photo (Optional)')}
                </label>
                <label
                  className="p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center"
                  style={avatarUploaded ? {
                    background: 'rgba(200,168,75,0.12)', borderColor: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)'
                  } : {
                    background: 'var(--mfct-warm-bg)', borderColor: 'var(--mfct-border)', color: 'var(--mfct-text-muted)'
                  }}
                >
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarFileChange} />
                  <Upload className="w-5 h-5 mb-1" style={{ color: 'var(--mfct-gold)' }} />
                  <span className="text-xs font-bold">
                    {avatarUploaded
                      ? `✓ ${avatarFile?.name ?? tr('फ़ोटो संलग्न है', 'تصویر منسلک ہے', 'Photo Attached')}`
                      : tr('फ़ोटो अपलोड करने के लिए क्लिक करें', 'تصویر اپلوڈ کریں', 'Click to upload photo')}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('पहचान दस्तावेज़ (आधार / वोटर आईडी) *', 'شناختی دستاویز (آدھار / ووٹر کارڈ) *', 'ID Document (Aadhaar / Voter ID) *')}
                </label>
                <label
                  className="p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center"
                  style={kycUploaded ? {
                    background: 'rgba(200,168,75,0.12)', borderColor: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)'
                  } : {
                    background: 'var(--mfct-warm-bg)', borderColor: 'var(--mfct-border)', color: 'var(--mfct-text-muted)'
                  }}
                >
                  <input type="file" accept="image/*,.pdf" className="sr-only" onChange={handleKycFileChange} />
                  <Upload className="w-5 h-5 mb-1" style={{ color: 'var(--mfct-gold)' }} />
                  <span className="text-xs font-bold">
                    {kycUploaded
                      ? `✓ ${kycFile?.name ?? tr('दस्तावेज़ संलग्न है', 'دستاویز منسلک ہے', 'Document Attached')}`
                      : tr('आधार या पहचान पत्र अपलोड करें *', '* شناختی دستاویز اپلوڈ کریں', 'Upload ID proof (Aadhaar/Voter ID) *')}
                  </span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const missingFields = [];
                if (!fullName) missingFields.push(tr('पूरा नाम', 'مکمل نام', 'Full Name'));
                if (!password) missingFields.push(tr('पासवर्ड', 'پاس ورڈ', 'Password'));
                if (!phone) missingFields.push(tr('मोबाइल नंबर', 'موبائل نمبر', 'Mobile Number'));
                if (!state) missingFields.push(tr('राज्य', 'ریاست', 'State'));
                if (!city) missingFields.push(tr('शहर', 'شہر', 'City'));
                if (!kycFile) missingFields.push(tr('पहचान दस्तावेज़', 'شناختی دستاویز', 'ID Document'));

                if (missingFields.length > 0) {
                  showToast(
                    tr(
                      `कृपया भरें: ${missingFields.join(', ')}`,
                      `براہ کرم درج کریں: ${missingFields.join(', ')}`,
                      `Please fill: ${missingFields.join(', ')}`
                    )
                  );
                  return;
                }
                if (password.length < 6) {
                  showToast(
                    tr(
                      'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
                      'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔',
                      'Password must be at least 6 characters.'
                    )
                  );
                  return;
                }
                setStep(2);
              }}
              className="mfct-btn-gold cursor-pointer w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <span>{tr('आगे बढ़ें: ₹100 सदस्यता शुल्क का भुगतान करें', 'آگے بڑھیں: ₹100 ممبرشپ فیس ادا کریں', 'Proceed to Pay ₹100 Membership Fee')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleFinishRegistration} className="space-y-6">
            <div
              className="p-5 rounded-2xl space-y-2"
              style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.3)' }}
            >
              <div className="flex justify-between font-bold text-base" style={{ color: 'var(--mfct-dark-green)' }}>
                <span>{tr('वार्षिक सदस्यता एकजुटता शुल्क:', 'سالانہ ممبرشپ فیس:', 'Annual Membership Solidarity Fee:')}</span>
                <span className="font-bold">₹100</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--mfct-text-dark)' }}>
                {tr(
                  `यह नाममात्र ₹100 शुल्क आपकी सदस्यता को ${activeCommunity.name} में सक्रिय करता है और आपातकालीन सहायता व मतदान का अधिकार देता है।`,
                  `یہ ₹100 فیس ${activeCommunity.name} میں آپ کی ممبرشپ فعال کرتی ہے اور ہنگامی امداد کی اہلیت دیتی ہے۔`,
                  `This ₹100 solidarity fee activates your full membership in ${activeCommunity.name}, giving you community voting rights and priority emergency relief.`
                )}
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: 'var(--mfct-warm-bg-2)', border: '1px solid var(--mfct-border)' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className="cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all"
                style={paymentMethod === 'UPI' ? {
                  background: 'var(--mfct-white)', color: 'var(--mfct-dark-green)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                } : {
                  color: 'var(--mfct-text-muted)'
                }}
              >
                {tr('तुरंत UPI / QR स्कैन', 'فوری UPI / کیو آر اسکین', 'Instant UPI / QR Scan')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className="cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all"
                style={paymentMethod === 'Bank Transfer' ? {
                  background: 'var(--mfct-white)', color: 'var(--mfct-dark-green)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                } : {
                  color: 'var(--mfct-text-muted)'
                }}
              >
                {tr('डायरेक्ट बैंक NEFT / RTGS', 'بینک ٹرانسفر / RTGS', 'Direct Bank NEFT / RTGS')}
              </button>
            </div>

            {paymentMethod === 'UPI' ? (
              <div
                className="p-6 rounded-3xl text-center space-y-4 text-white"
                style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
              >
                <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                  <QrCode className="w-36 h-36 mx-auto" style={{ color: 'var(--mfct-dark-green)' }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'rgba(200,168,75,0.9)' }}>
                    {tr('प्रत्यक्ष एस्क्रो के लिए UPI ID', 'براہ راست ادائیگی کے لیے UPI ID', 'UPI ID for Direct Escrow')}
                  </p>
                  <p className="font-mono font-bold text-lg select-all" style={{ color: 'var(--mfct-gold)' }}>
                    mfct@okicici
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {tr(
                      'Google Pay, PhonePe, Paytm या BHIM UPI द्वारा स्कैन करें',
                      'Google Pay, PhonePe, Paytm کے ذریعے اسکین کریں',
                      'Scan using Google Pay, PhonePe, Paytm, or BHIM UPI'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="p-5 rounded-3xl space-y-3 text-xs font-mono text-white"
                style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
              >
                <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{tr('खाता नाम:', 'کھاتہ نام:', 'Account Name:')}</span>
                  <span className="font-bold" style={{ color: 'var(--mfct-gold)' }}>Mohammad Faeem Charitable Trust</span>
                </div>
                <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{tr('बैंक का नाम:', 'بینک:', 'Bank Name:')}</span>
                  <span className="text-white">ICICI Bank Ltd</span>
                </div>
                <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{tr('खाता संख्या:', 'اکاؤنٹ نمبر:', 'Account Number:')}</span>
                  <span className="font-bold select-all" style={{ color: 'var(--mfct-gold)' }}>000405018892</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>IFSC Code:</span>
                  <span className="font-bold select-all" style={{ color: 'var(--mfct-gold)' }}>ICIC0000004</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('12 अंकों का बैंक UTR / संदर्भ संख्या', '12 ہندسوں کا بینک UTR / ریفرنس نمبر', '12-Digit Bank UTR / Transaction Ref No')}
                </label>
                <input
                  type="text"
                  placeholder={tr('उदा. 420199381029', 'مثال: 420199381029', 'e.g. 420199381029')}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full p-3 rounded-xl font-mono text-sm font-semibold outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('या भुगतान स्क्रीनशॉट अपलोड करें', 'یا ادائیگی کی رسید اپلوڈ کریں', 'Or Upload Payment Screenshot')}
                </label>
                <label
                  className="p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center"
                  style={screenshotUploaded ? {
                    background: 'rgba(200,168,75,0.12)', borderColor: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)'
                  } : {
                    background: 'var(--mfct-warm-bg)', borderColor: 'var(--mfct-border)', color: 'var(--mfct-text-muted)'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleScreenshotFileChange}
                  />
                  <Upload className="w-5 h-5 mb-1" style={{ color: 'var(--mfct-gold)' }} />
                  <span className="text-xs font-bold">
                    {screenshotUploaded
                      ? `✓ ${screenshotFile?.name ?? tr('स्क्रीनशॉट संलग्न है', 'رسید منسلک ہے', 'Screenshot Attached')}`
                      : tr('भुगतान रसीद अपलोड करने के लिए क्लिक करें', 'ادائیگی کی رسید اپلوڈ کریں', 'Click to upload payment screenshot')}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="feeCheck"
                required
                checked={isFeePaid}
                onChange={(e) => setIsFeePaid(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-[#c8a84b]"
              />
              <label htmlFor="feeCheck" className="text-xs font-medium cursor-pointer" style={{ color: 'var(--mfct-text-dark)' }}>
                {tr(
                  'मैंने ₹100 का UPI भुगतान पूरा कर लिया है और सामुदायिक दिशानिर्देशों से सहमत हूँ।',
                  'میں نے ₹100 کی ادائیگی مکمل کر لی ہے اور فلاحی اصولوں سے متفق ہوں۔',
                  'I have completed the ₹100 payment and agree to the community guidelines.'
                )}
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="cursor-pointer py-3.5 px-4 rounded-xl font-bold text-xs transition-colors"
                style={{ background: 'var(--mfct-warm-bg-2)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-border)' }}
              >
                {tr('वापस', 'واپس', 'Back')}
              </button>
              <button
                type="submit"
                disabled={!isFeePaid || submitting}
                className="mfct-btn-gold cursor-pointer flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  tr('सदस्यता पंजीकरण पूर्ण करें', 'ممبرشپ رجسٹریشن مکمل کریں', 'Complete Membership Registration')
                )}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md"
              style={{ background: 'rgba(200,168,75,0.2)', border: '2px solid var(--mfct-gold)' }}
            >
              <UserCheck className="w-10 h-10" style={{ color: 'var(--mfct-gold)' }} />
            </div>

            <div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--mfct-dark-green)', fontFamily: 'Playfair Display, serif' }}>
                {tr('MFCT में आपका स्वागत है!', 'MFCT میں خوش آمدید!', 'Welcome to MFCT!')}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--mfct-text-muted)' }}>
                {language === 'hi' ? (
                  <>अब आप <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>{activeCommunity.name}</span> के एक सत्यापित सदस्य हैं।</>
                ) : language === 'ur' ? (
                  <>اب آپ <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>{activeCommunity.name}</span> کے تصدیق شدہ ممبر بن چکے ہیں۔</>
                ) : (
                  <>You are now a verified member of <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>{activeCommunity.name}</span>.</>
                )}
                {hasPendingDonation && (
                  <span
                    className="block font-bold mt-2 text-xs py-1.5 px-3 rounded-lg"
                    style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}
                  >
                    {tr(
                      '✓ सत्यापित सदस्यता सक्रिय! दान पूरा करने के लिए आगे बढ़ रहे हैं...',
                      '✓ ممبرشپ فعال ہو گئی! عطیہ مکمل کرنے کے لیے آگے بڑھ رہے ہیں...',
                      '✓ Verified membership active! Continuing to complete your donation...'
                    )}
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={onClose}
              className="mfct-btn-gold cursor-pointer w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <span>
                {hasPendingDonation
                  ? tr('दान पूरा करने के लिए आगे बढ़ें', 'عطیہ مکمل کریں', 'Proceed to Complete Donation')
                  : tr('सदस्य डैशबोर्ड खोलें', 'ممبر ڈیش بورڈ کھولیں', 'Open Member Dashboard')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
