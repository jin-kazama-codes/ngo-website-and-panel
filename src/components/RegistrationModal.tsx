'use client';

import React, { useState, useEffect } from 'react';
import { User, Community } from '../types';
import { X, Upload, ArrowRight, UserCheck, Sparkles, Lock, Eye, EyeOff, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCommunities } from '../services/communityService';
import { createUser } from '../services/userService';
import { uploadImage } from '../lib/storage';
import { hashPassword } from '../lib/auth';

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
      showToast('Registration failed. Please try again.', 'error');
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
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> ₹50 Membership solidarity program
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Become a Verified Community Member</h2>
          <p className="text-sm text-slate-500 mt-1">
            Join your local community. Become both a donor and someone eligible for emergency aid.
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Legal Name (as per Aadhaar)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farhan Siddiqui"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
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
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. farhan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
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
                  State
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Your Local Community
              </label>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 truncate"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city} - Managed by {c.adminName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Profile Picture
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
                      ? `✓ ${avatarFile?.name ?? 'Photo Attached'}`
                      : 'Click to upload photo'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Identity Document (Aadhaar / Voter ID)
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
                      ? `✓ ${kycFile?.name ?? 'Document Attached'}`
                      : 'Click to upload Aadhaar'}
                  </span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const missingFields = [];
                if (!fullName) missingFields.push('Full Name');
                if (!email) missingFields.push('Email');
                if (!password) missingFields.push('Password');
                if (!phone) missingFields.push('Mobile Number');
                if (!state) missingFields.push('State');
                if (!city) missingFields.push('City');

                if (missingFields.length > 0) {
                  showToast(`Please fill out: ${missingFields.join(', ')}`);
                  return;
                }
                if (password.length < 6) {
                  showToast('Password must be at least 6 characters long.');
                  return;
                }
                setStep(2);
              }}
              className="cursor-pointer w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <span>Next: Pay ₹50 Membership Fee</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleFinishRegistration} className="space-y-6">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 space-y-2">
              <div className="flex justify-between font-bold text-base">
                <span>Annual Membership Solidarity Fee:</span>
                <span className="text-emerald-700">₹50</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                This nominal ₹50 fee activates your membership inside{' '}
                <span className="font-semibold">{activeCommunity.name}</span>, providing full access to community emergency funds and voting rights.
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
                Instant UPI / QR Scan
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all ${paymentMethod === 'Bank Transfer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
              >
                Direct Bank NEFT / RTGS
              </button>
            </div>

            {paymentMethod === 'UPI' ? (
              <div className="p-6 bg-slate-900 text-white rounded-3xl text-center space-y-4">
                <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                  <QrCode className="w-36 h-36 text-slate-900 mx-auto" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">UPI ID for Direct Escrow</p>
                  <p className="font-mono text-emerald-400 font-bold text-lg select-all">
                    sevasangam.membership@okicici
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Scan using Google Pay, PhonePe, Paytm, or BHIM UPI
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-3 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Account Name:</span>
                  <span className="text-emerald-400 font-bold">SevaSangam Relief Escrow Trust</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="text-slate-200">ICICI Bank Ltd</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Account Number:</span>
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
                  12-Digit Bank UTR / Transaction Ref No
                </label>
                <input
                  type="text"
                  placeholder="e.g. 420199381029"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-mono text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Or Upload Payment Screenshot
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
                      ? `✓ ${screenshotFile?.name ?? 'Screenshot Attached'}`
                      : 'Click to upload payment screenshot'}
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
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label htmlFor="feeCheck" className="text-xs text-slate-700 font-medium">
                I have completed the ₹50 UPI payment and agree to community solidarity guidelines.
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="cursor-pointer py-3.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isFeePaid || submitting}
                className="cursor-pointer flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Complete Membership Registration'}
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
              <h3 className="text-2xl font-bold text-slate-900">Welcome to SevaSangam!</h3>
              <p className="text-sm text-slate-600 mt-1">
                You are now a verified member of <span className="font-bold text-emerald-700">{activeCommunity.name}</span>.
                {hasPendingDonation && (
                  <span className="block text-emerald-600 font-bold mt-2 text-xs bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-100">
                    ✓ Verified Membership Active! Proceeding to complete your donation...
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={onClose}
              className="cursor-pointer w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <span>{hasPendingDonation ? 'Proceed to Complete Donation' : 'Access Member Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
