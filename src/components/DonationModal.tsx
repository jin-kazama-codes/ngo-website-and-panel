import React, { useState } from 'react';
import { Campaign, DonationCategory, Donation } from '../types';
import { MOCK_CAMPAIGNS } from '../data/mockData';
import { X, Check, QrCode, Upload, ArrowRight, ShieldCheck, Heart, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonationModalProps {
  campaign?: Campaign;
  onClose: () => void;
  onDonationSuccess: (donation: Donation) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ campaign, onClose, onDonationSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<DonationCategory>(campaign?.category || 'General');
  const [amount, setAmount] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaign?.id || MOCK_CAMPAIGNS[0].id);
  const [isOutsideCommunity, setIsOutsideCommunity] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [screenshotUploaded, setScreenshotUploaded] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('Aarif Khan');
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);

  const activeCampaign = MOCK_CAMPAIGNS.find((c) => c.id === selectedCampaignId) || MOCK_CAMPAIGNS[0];

  // Zakat Rule check
  const isZakatSelected = selectedCategory === 'Zakat';
  const filteredCampaigns = isZakatSelected
    ? MOCK_CAMPAIGNS.filter((c) => c.isZakatEligible)
    : MOCK_CAMPAIGNS;

  const handleAmountClick = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber && !screenshotUploaded) {
      alert('Please enter a valid 12-digit UPI UTR number or upload payment screenshot.');
      return;
    }

    const finalUtr = utrNumber || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const newDonation: Donation = {
      id: `don_${Date.now()}`,
      transactionId: `TXN${Math.floor(100000000 + Math.random() * 900000000)}`,
      utrNumber: finalUtr,
      donorName: donorName || 'Generous Member',
      donorId: 'usr_mem_101',
      donorRole: 'member',
      campaignId: activeCampaign.id,
      campaignTitle: activeCampaign.title,
      communityName: activeCampaign.communityName,
      amountINR: amount,
      category: selectedCategory,
      isOutsideCommunity,
      paymentMethod,
      status: 'verified',
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      receiptNumber: `RCP-2024-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setCreatedDonation(newDonation);
    onDonationSuccess(newDonation);
    setStep(3);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback if unavailable
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Transparent Community Escrow
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {step === 3 ? 'Donation Successful! 🎉' : 'Make a Verified Donation'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            100% of your donation directly reaches verified beneficiaries.
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Donation Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    'General',
                    'Sadakah',
                    'Zakat',
                    'Fitrah',
                    'Medical',
                    'Education',
                    'Marriage',
                    'Emergency Relief',
                  ] as DonationCategory[]
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (cat === 'Zakat' && !activeCampaign.isZakatEligible) {
                        const zakatCamp = MOCK_CAMPAIGNS.find((c) => c.isZakatEligible);
                        if (zakatCamp) setSelectedCampaignId(zakatCamp.id);
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                    {cat === 'Zakat' && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                        Zakat
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {isZakatSelected && (
                <div className="mt-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Zakat Compliance Rule:</span> Zakat can only be donated to
                    strictly <span className="font-bold underline">Zakat Eligible</span> verified campaigns. Non-eligible campaigns have been filtered out automatically.
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Target Campaign
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {filteredCampaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} {c.isZakatEligible ? '(Zakat Eligible ✓)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Outside Community Toggle */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Help Outside Community</p>
                  <p className="text-[11px] text-slate-500">
                    Donate to campaigns outside your home community
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOutsideCommunity}
                  onChange={(e) => setIsOutsideCommunity(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Amount Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Choose Amount (INR ₹)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[500, 1000, 2500, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAmountClick(val)}
                    className={`py-3 rounded-xl font-bold text-sm border transition-all ${
                      amount === val && !customAmount
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  placeholder="Enter custom amount..."
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Proceed Step 1 Button */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <span>Proceed to Payment (₹{amount.toLocaleString('en-IN')})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitPayment} className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-500 text-xs block">Selected Campaign:</span>
                <span className="font-bold text-slate-900 truncate max-w-[280px] block">
                  {activeCampaign.title}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-xs block">Total Amount:</span>
                <span className="font-bold text-emerald-700 text-lg">₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  paymentMethod === 'UPI' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Instant UPI / QR Scan
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  paymentMethod === 'Bank Transfer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
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
                    sevasangam@okicici
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

            {/* UTR and Receipt Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

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
                <div
                  onClick={() => setScreenshotUploaded(true)}
                  className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    screenshotUploaded
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                  <span className="text-xs font-bold">
                    {screenshotUploaded
                      ? '✓ Screenshot Attached (payment_receipt_ss.png)'
                      : 'Click to upload payment screenshot'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20"
              >
                Submit Payment & Generate Receipt
              </button>
            </div>
          </form>
        )}

        {step === 3 && createdDonation && (
          <div className="text-center py-4 space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Thank You for Your Generosity!</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Your donation of <span className="font-bold text-emerald-700">₹{createdDonation.amountINR.toLocaleString('en-IN')}</span> has been submitted under escrow and a tax-exempt receipt has been generated.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold font-mono text-slate-800">{createdDonation.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UTR Reference:</span>
                <span className="font-mono text-slate-800">{createdDonation.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{createdDonation.category}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Return to Platform
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
