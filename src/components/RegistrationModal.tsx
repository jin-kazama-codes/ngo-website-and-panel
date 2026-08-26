'use client';

import React, { useState, useEffect } from 'react';
import { User, Community } from '../types';
import { X, Upload, ArrowRight, UserCheck, Sparkles, Eye, EyeOff, QrCode } from 'lucide-react';
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
  const { isHindi } = useLanguage();
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

      let avatarUrl = 'https://images.unsplash.com/photo-153452874';
      if (avatarFile) {
        avatarUrl = await uploadImage('users', avatarFile);
      }

      let screenshotUrl: string | undefined;
      if (screenshotFile) {
        screenshotUrl = await uploadImage('receipts', screenshotFile);
      }

      const hashedPassword = await hashPassword(password);
      const userCity = city.trim() || 'Bareilly';

      const newMember: User = {
        id: `usr_new_${Date.now()}`,
        name: fullName.trim(),
        email: email.trim() ? email.trim().toLowerCase() : undefined,
        phone: phone.trim(),
        city: userCity,
        state: state.trim(),
        role: 'member',
        avatar: avatarUrl,
        communityId: activeCommunity.id,
        communityName: activeCommunity.name,
        membershipId: `MFCT-${userCity.substring(0, 3).toUpperCase()}-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        isVerified: false,
        joinDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        passwordHash: hashedPassword,
        paymentMethod: paymentMethod,
        paymentUtr: utrNumber.trim() || undefined,
        paymentScreenshotUrl: screenshotUrl,
      };

      await createUser({ ...newMember, kycDocumentUrl: kycUrl });
      onRegistered(newMember);
      setStep(3);
      try { confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } }); } catch { }
    } catch (err) {
      console.error('Registration error:', err);
      showToast(
        isHindi ? 'पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।' : 'رجسٹریشن ناکام رہی۔ دوبارہ کوشش کریں۔',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[92vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? '₹50 सदस्यता एकजुटता कार्यक्रम' : '₹50 ممبرشپ یکجہتی پروگرام'}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isHindi ? 'सत्यापित समुदाय सदस्य बनें' : 'تصدیق شدہ کمیونٹی ممبر بنیں'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isHindi
              ? 'अपने स्थानीय समुदाय से जुड़ें। दानकर्ता बनें और आपातकालीन सहायता के पात्र भी।'
              : 'اپنی مقامی کمیونٹی میں شامل ہوں۔ عطیہ دہندہ بنیں اور ہنگامی امداد کے اہل بھی۔'}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'पूरा नाम (आधार के अनुसार) *' : 'مکمل نام (آدھار کے مطابق) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHindi ? 'उदा. मोहम्मद तारिक' : 'مثال: محمد طارق'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'मोबाइल नंबर *' : 'موبائل نمبر *'}
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
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'ईमेल पता (वैकल्पिक)' : 'ای میل ایڈریس (اختیاری)'}
                </label>
                <input
                  type="email"
                  placeholder={isHindi ? 'उदा. tariq@example.com' : 'tariq@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'पासवर्ड बनाएं *' : 'پاس ورڈ بنائیں *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={isHindi ? 'कम से कम 6 अक्षर' : 'کم از کم 6 حروف'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'राज्य *' : 'ریاست *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHindi ? 'उदा. उत्तर प्रदेश' : 'مثال: اتر پردیش'}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'शहर / कस्बा *' : 'شہر / قصبہ *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHindi ? 'उदा. बरेली' : 'مثال: بریلی'}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isHindi ? 'अपना स्थानीय समुदाय चुनें' : 'اپنی مقامی کمیونٹی منتخب کریں'}
              </label>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 truncate"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city} - {isHindi ? 'प्रशासक:' : 'ایڈمن:'} {c.adminName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'प्रोफ़ाइल फ़ोटो (वैकल्पिक)' : 'پروفائل تصویر (اختیاری)'}
                </label>
                <label
                  className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center ${avatarUploaded
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarFileChange} />
                  <Upload className="w-5 h-5 mb-1 text-slate-500" />
                  <span className="text-xs font-bold">
                    {avatarUploaded
                      ? `✓ ${avatarFile?.name ?? (isHindi ? 'फ़ोटो संलग्न है' : 'تصویر منسلک ہے')}`
                      : (isHindi ? 'फ़ोटो अपलोड करने के लिए क्लिक करें' : 'تصویر اپلوڈ کریں')}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'पहचान दस्तावेज (आधार / वोटर आईडी) *' : 'شناختی دستاویز (آدھار / ووٹر کارڈ) *'}
                </label>
                <label
                  className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center ${kycUploaded
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <input type="file" accept="image/*,.pdf" className="sr-only" onChange={handleKycFileChange} />
                  <Upload className="w-5 h-5 mb-1 text-slate-500" />
                  <span className="text-xs font-bold">
                    {kycUploaded
                      ? `✓ ${kycFile?.name ?? (isHindi ? 'दस्तावेज संलग्न है' : 'دستاویز منسلک ہے')}`
                      : (isHindi ? 'आधार या पहचान पत्र अपलोड करें *' : '* شناختی دستاویز اپلوڈ کریں')}
                  </span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const missingFields = [];
                if (!fullName) missingFields.push(isHindi ? 'पूरा नाम' : 'مکمل نام');
                if (!password) missingFields.push(isHindi ? 'पासवर्ड' : 'پاس ورڈ');
                if (!phone) missingFields.push(isHindi ? 'मोबाइल नंबर' : 'موبائل نمبر');
                if (!state) missingFields.push(isHindi ? 'राज्य' : 'ریاست');
                if (!city) missingFields.push(isHindi ? 'शहर' : 'شہر');
                if (!kycFile) missingFields.push(isHindi ? 'पहचान दस्तावेज' : 'شناختی دستاویز');

                if (missingFields.length > 0) {
                  showToast(
                    isHindi
                      ? `कृपया भरें: ${missingFields.join(', ')}`
                      : `براہ کرم درج کریں: ${missingFields.join(', ')}`
                  );
                  return;
                }
                if (password.length < 6) {
                  showToast(
                    isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔'
                  );
                  return;
                }
                setStep(2);
              }}
              className="cursor-pointer w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <span>{isHindi ? 'आगे बढ़ें: ₹50 सदस्यता शुल्क का भुगतान करें' : 'آگے بڑھیں: ₹50 ممبرشپ فیس ادا کریں'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleFinishRegistration} className="space-y-6">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 space-y-2">
              <div className="flex justify-between font-bold text-base">
                <span>{isHindi ? 'वार्षिक सदस्यता एकजुटता शुल्क:' : 'سالانہ ممبرشپ فیس:'}</span>
                <span className="text-emerald-700">₹50</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {isHindi
                  ? `यह नाममात्र ₹50 शुल्क आपकी सदस्यता को ${activeCommunity.name} में सक्रिय करता है और आपातकालीन सहायता व मतदान का अधिकार देता है।`
                  : `یہ ₹50 فیس ${activeCommunity.name} میں آپ کی ممبرشپ فعال کرتی ہے اور ہنگامی امداد کی اہلیت دیتی ہے۔`}
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all ${paymentMethod === 'UPI' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
              >
                {isHindi ? 'तुरंत UPI / QR स्कैन' : 'فوری UPI / کیو آر اسکین'}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all ${paymentMethod === 'Bank Transfer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
              >
                {isHindi ? 'डायरेक्ट बैंक NEFT / RTGS' : 'بینک ٹرانسفر / RTGS'}
              </button>
            </div>

            {paymentMethod === 'UPI' ? (
              <div className="p-6 bg-slate-900 text-white rounded-3xl text-center space-y-4">
                <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                  <QrCode className="w-36 h-36 text-slate-900 mx-auto" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    {isHindi ? 'प्रत्यक्ष एस्क्रो के लिए UPI ID' : 'براہ راست ادائیگی کے لیے UPI ID'}
                  </p>
                  <p className="font-mono text-emerald-400 font-bold text-lg select-all">
                    mfct@okicici
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isHindi ? 'Google Pay, PhonePe, Paytm या BHIM UPI द्वारा स्कैन करें' : 'Google Pay, PhonePe, Paytm کے ذریعے اسکین کریں'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-3 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{isHindi ? 'खाता नाम:' : 'کھاتہ نام:'}</span>
                  <span className="text-emerald-400 font-bold">MFCT Community Foundation</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{isHindi ? 'बैंक का नाम:' : 'بینک:'}</span>
                  <span className="text-slate-200">ICICI Bank Ltd</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{isHindi ? 'खाता संख्या:' : 'اکاؤنٹ نمبر:'}</span>
                  <span className="text-emerald-300 font-bold select-all">000405018892</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="text-emerald-300 font-bold select-all">ICIC0000004</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? '12 अंकों का बैंक UTR / संदर्भ संख्या' : '12 ہندسوں کا بینک UTR / ریفرنس نمبر'}
                </label>
                <input
                  type="text"
                  placeholder={isHindi ? 'उदा. 420199381029' : 'مثال: 420199381029'}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-mono text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'या भुगतान स्क्रीनशॉट अपलोड करें' : 'یا ادائیگی کی رسید اپلوڈ کریں'}
                </label>
                <label
                  className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center ${screenshotUploaded
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleScreenshotFileChange}
                  />
                  <Upload className="w-5 h-5 mb-1 text-slate-500" />
                  <span className="text-xs font-bold">
                    {screenshotUploaded
                      ? `✓ ${screenshotFile?.name ?? (isHindi ? 'स्क्रीनशॉट संलग्न है' : 'رسید منسلک ہے')}`
                      : (isHindi ? 'भुगतान रसीद अपलोड करने के लिए क्लिक करें' : 'ادائیگی کی رسید اپلوڈ کریں')}
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
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="feeCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                {isHindi
                  ? 'मैंने ₹50 का UPI भुगतान पूरा कर लिया है और सामुदायिक दिशानिर्देशों से सहमत हूँ।'
                  : 'میں نے ₹50 کی ادائیگی مکمل کر لی ہے اور فلاحی اصولوں سے متفق ہوں۔'}
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="cursor-pointer py-3.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                {isHindi ? 'वापस' : 'واپس'}
              </button>
              <button
                type="submit"
                disabled={!isFeePaid || submitting}
                className="cursor-pointer flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (isHindi ? 'सदस्यता पंजीकरण पूर्ण करें' : 'ممبرشپ رجسٹریشن مکمل کریں')}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <UserCheck className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {isHindi ? 'MFCT में आपका स्वागत है!' : 'MFCT میں خوش آمدید!'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {isHindi ? (
                  <>अब आप <span className="font-bold text-emerald-700">{activeCommunity.name}</span> के एक सत्यापित सदस्य हैं।</>
                ) : (
                  <>اب آپ <span className="font-bold text-emerald-700">{activeCommunity.name}</span> کے تصدیق شدہ ممبر بن چکے ہیں۔</>
                )}
                {hasPendingDonation && (
                  <span className="block text-emerald-600 font-bold mt-2 text-xs bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-100">
                    {isHindi
                      ? '✓ सत्यापित सदस्यता सक्रिय! दान पूरा करने के लिए आगे बढ़ रहे हैं...'
                      : '✓ ممبرشپ فعال ہو گئی! عطیہ مکمل کرنے کے لیے آگے بڑھ رہے ہیں...'}
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={onClose}
              className="cursor-pointer w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <span>
                {hasPendingDonation
                  ? (isHindi ? 'दान पूरा करने के लिए आगे बढ़ें' : 'عطیہ مکمل کریں')
                  : (isHindi ? 'सदस्य डैशबोर्ड खोलें' : 'ممبر ڈیش بورڈ کھولیں')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
