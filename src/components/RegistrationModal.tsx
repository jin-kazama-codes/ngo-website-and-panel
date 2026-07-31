import React, { useState } from 'react';
import { MOCK_COMMUNITIES } from '../data/mockData';
import { User } from '../types';
import { X, CheckCircle2, ShieldCheck, Upload, ArrowRight, UserCheck, Sparkles, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationModalProps {
  onClose: () => void;
  onRegistered: (user: User) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onClose, onRegistered }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Delhi');
  const [selectedCommunityId, setSelectedCommunityId] = useState(MOCK_COMMUNITIES[0].id);
  const [kycUploaded, setKycUploaded] = useState(false);
  const [isFeePaid, setIsFeePaid] = useState(false);

  const activeCommunity = MOCK_COMMUNITIES.find((c) => c.id === selectedCommunityId) || MOCK_COMMUNITIES[0];

  const handleFinishRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: User = {
      id: `usr_new_${Date.now()}`,
      name: fullName || 'New Community Member',
      email: email || 'member@example.com',
      phone: phone || '+91 98765 00000',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      communityId: activeCommunity.id,
      communityName: activeCommunity.name,
      membershipId: `SS-${city.substring(0, 3).toUpperCase()}-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerified: true,
      isPremium: false,
      joinDate: 'Today',
      city: city,
      state: activeCommunity.state,
      totalDonatedINR: 50, // Initial membership fee
      donationsCount: 1,
    };

    onRegistered(newMember);
    setStep(3);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number (OTP Verified)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City / Town
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Lucknow">Lucknow</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bareilly">Bareilly</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bhopal">Bhopal</option>
                  <option value="Jaipur">Jaipur</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Your Local Community
              </label>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
              >
                {MOCK_COMMUNITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city} - Managed by {c.adminName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Identity Document (Aadhaar / Voter ID)
              </label>
              <div
                onClick={() => setKycUploaded(true)}
                className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  kycUploaded
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                <span className="text-xs font-bold">
                  {kycUploaded
                    ? '✓ Aadhaar Copy Attached (aadhaar_front.jpg)'
                    : 'Click to upload photo of Aadhaar or ID'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!fullName || !phone) {
                  alert('Please enter your full name and mobile number.');
                  return;
                }
                setStep(2);
              }}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
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

            <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-3">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Scan UPI QR to Pay ₹50</span>
              <div className="w-28 h-28 bg-white p-2 rounded-xl mx-auto shadow-md flex items-center justify-center text-slate-900 font-bold text-xs">
                QR CODE ₹50
              </div>
              <p className="font-mono text-emerald-400 font-bold text-sm">sevasangam.membership@okicici</p>
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
                className="py-3.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isFeePaid}
                className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20"
              >
                Complete Membership Registration
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
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
            >
              Access Member Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
