'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Campaign, DonationCategory, Donation, User, AccountDetails } from '../types';
import { X, QrCode, Upload, ArrowRight, ShieldCheck, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCampaigns } from '../services/campaignService';
import { createDonation } from '../services/donationService';
import { updateCampaignRaised } from '../services/campaignService';
import { uploadImage } from '../lib/storage';
import { getAccountDetails } from '../services/adminService';
import { useLanguage } from '../context/LanguageContext';
import { translateCampaignTitle, translateCategory } from '../lib/translateEntity';

interface DonationModalProps {
  campaign?: Campaign;
  initialAmount?: number;
  initialCategory?: DonationCategory;
  currentUser?: User;
  onClose: () => void;
  onDonationSuccess: (donation: Donation) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  campaign,
  initialAmount,
  initialCategory,
  currentUser,
  onClose,
  onDonationSuccess,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<DonationCategory>(
    initialCategory || campaign?.category || 'General'
  );
  const [amount, setAmount] = useState<number>(initialAmount || 2500);
  const [customAmount, setCustomAmount] = useState<string>(
    initialAmount ? initialAmount.toString() : ''
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaign ? [campaign] : []);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaign?.id || '');
  const [isOutsideCommunity, setIsOutsideCommunity] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUploaded, setScreenshotUploaded] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>(
    currentUser?.name || tr('उदार दानदाता', 'عطیہ دہندہ', 'Generous Member')
  );
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (!campaign) {
      getCampaigns({ status: 'active' }).then((data) => {
        setCampaigns(data);
        if (data.length > 0 && !selectedCampaignId) setSelectedCampaignId(data[0].id);
      }).catch(console.error);
    }
    getAccountDetails().then((data) => {
      if (data && data.length > 0) {
        setAccountDetails(data[0]);
      }
    }).catch(console.error);
  }, [campaign, selectedCampaignId]);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  // Zakat Rule check
  const isZakatSelected = selectedCategory === 'Zakat';
  const filteredCampaigns = isZakatSelected ? campaigns.filter((c) => c.isZakatEligible) : campaigns;

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

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber && !screenshotUploaded) {
      showToast(
        tr(
          'कृपया 12 अंकों का यूपीआई यूटीआर नंबर दर्ज करें या भुगतान स्क्रीनशॉट अपलोड करें।',
          'براہ کرم 12 ہندسوں کا یو پی آئی UTR نمبر درج کریں یا رسید اپلوڈ کریں۔',
          'Please enter a valid 12-digit UPI UTR number or upload payment screenshot.'
        )
      );
      return;
    }
    if (!activeCampaign) return;
    setSubmitting(true);

    try {
      let screenshotUrl: string | undefined;
      if (screenshotFile) {
        screenshotUrl = await uploadImage('donations', screenshotFile);
      }

      const finalUtr = utrNumber || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const donationData: Omit<Donation, 'id'> = {
        transactionId: `TXN${Math.floor(100000000 + Math.random() * 900000000)}`,
        utrNumber: finalUtr,
        donorName: donorName || tr('उदार दानदाता', 'عطیہ دہندہ', 'Generous Member'),
        donorId: currentUser?.id || 'anonymous',
        donorRole: currentUser?.role || 'member',
        campaignId: activeCampaign.id,
        campaignTitle: activeCampaign.title,
        communityName: activeCampaign.communityName,
        amountINR: amount,
        category: selectedCategory,
        isOutsideCommunity,
        paymentMethod,
        paymentScreenshotUrl: screenshotUrl,
        status: 'pending_verification',
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        receiptNumber: `RCP-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      const savedDonation = await createDonation(donationData);
      await updateCampaignRaised(activeCampaign.id, amount);

      setCreatedDonation(savedDonation);
      onDonationSuccess(savedDonation);
      setStep(3);
      showToast(
        tr('दान सफलतापूर्वक जमा किया गया!', 'عطیہ کامیابی کے ساتھ جمع ہو گیا!', 'Donation submitted successfully!'),
        'success'
      );

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch { }
    } catch (err) {
      console.error('Donation error:', err);
      showToast(
        tr(
          'दान जमा करने में विफल। कृपया पुन: प्रयास करें।',
          'عطیہ جمع کرنے میں ناکامی۔ دوبارہ کوشش کریں۔',
          'Failed to submit donation. Please try again.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: DonationCategory) => {
    switch (cat) {
      case 'General': return tr('सामान्य', 'عام عطیہ', 'General');
      case 'Sadakah': return tr('सदक़ा', 'صدقہ', 'Sadakah');
      case 'Zakat': return tr('ज़कात', 'زکوٰۃ', 'Zakat');
      case 'Fitrah': return tr('फ़ितरा', 'فطرہ', 'Fitrah');
      case 'Medical': return tr('चिकित्सा', 'طبی امداد', 'Medical');
      case 'Education': return tr('शिक्षा', 'تعلیم', 'Education');
      case 'Marriage': return tr('विवाह सहायता', 'شادی امداد', 'Marriage');
      case 'Emergency Relief': return tr('आपातकालीन राहत', 'ہنگامی امداد', 'Emergency Relief');
      default: return cat;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
      <div
        className="rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-text-dark)' }}
      >

        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[60] text-sm font-bold text-white transition-all transform duration-300 ease-out ${toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'
            }`}>
            {toastMessage.message}
          </div>
        )}

        <button
          onClick={onClose}
          className="cursor-pointer absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 transition-colors"
          style={{ color: 'var(--mfct-text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--mfct-gold)' }}></span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-dark-green)' }}>
              {tr('पारदर्शी सामुदायिक एस्क्रो', 'شفاف کمیونٹی اسکرو', 'Transparent Community Escrow')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--mfct-dark-green)', fontFamily: 'Playfair Display, serif' }}>
            {step === 3
              ? tr('दान सफल! 🎉', 'عطیہ کامیاب! 🎉', 'Donation Successful! 🎉')
              : tr('सत्यापित दान करें', 'تصدیق شدہ عطیہ دیں', 'Make a Verified Donation')}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--mfct-text-muted)' }}>
            {tr(
              'आपके दान का 100% सीधे सत्यापित लाभार्थियों तक पहुंचता है।',
              'آپ کے عطیہ کا 100% براہ راست تصدیق شدہ مستحقین تک پہنچتا ہے۔',
              '100% of your donation directly reaches verified beneficiaries.'
            )}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--mfct-dark-green)' }}>
                {tr('1. दान का प्रकार चुनें', '1. عطیہ کی قسم منتخب کریں', '1. Select Donation Type')}
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
                      if (cat === 'Zakat' && activeCampaign && !activeCampaign.isZakatEligible) {
                        const zakatCamp = campaigns.find((c) => c.isZakatEligible);
                        if (zakatCamp) setSelectedCampaignId(zakatCamp.id);
                      }
                    }}
                    className="cursor-pointer py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between"
                    style={selectedCategory === cat ? {
                      background: 'var(--mfct-dark-green)',
                      color: '#fff',
                      borderColor: 'var(--mfct-gold)',
                      boxShadow: 'var(--shadow-card)'
                    } : {
                      background: 'var(--mfct-warm-bg)',
                      color: 'var(--mfct-text-dark)',
                      borderColor: 'var(--mfct-border)'
                    }}
                  >
                    <span>{getCategoryLabel(cat)}</span>
                    {cat === 'Zakat' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)' }}>
                        {tr('ज़कात', 'زکوٰۃ', 'Zakat')}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {isZakatSelected && (
                <div
                  className="mt-2.5 p-3 rounded-xl text-xs flex items-start gap-2"
                  style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.3)', color: 'var(--mfct-dark-green)' }}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--mfct-gold)' }} />
                  <div>
                    <span className="font-bold">{tr('ज़कात अनुपालन नियम:', 'زکوٰۃ کا اصول:', 'Zakat Compliance Rule:')}</span>{' '}
                    {tr(
                      'ज़कात केवल सख्ती से ज़कात-पात्र सत्यापित अभियानों में ही दी जा सकती है। अन्य अभियान स्वतः हटा दिए गए हैं।',
                      'زکوٰۃ صرف اور صرف مستحقِ زکوٰۃ مہمات میں ہی دی جا سکتی ہے۔ غیر مستحق مہمات فلٹر کر دی گئی ہیں۔',
                      'Zakat can only be donated to strictly Zakat Eligible verified campaigns. Non-eligible campaigns have been filtered out automatically.'
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--mfct-dark-green)' }}>
                {tr('2. लक्षित अभियान', '2. ہدف مہم', '2. Target Campaign')}
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full p-3 rounded-xl text-sm font-medium transition-all outline-none"
                style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
              >
                {filteredCampaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {translateCampaignTitle(c.title, language)} {c.isZakatEligible ? `(${tr('ज़कात पात्र ✓', 'زکوٰۃ اہل ✓', 'Zakat Eligible ✓')})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Outside Community Toggle */}
            <div className="p-4 rounded-2xl flex items-center justify-between" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5" style={{ color: 'var(--mfct-gold)' }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--mfct-dark-green)' }}>{tr('बाहरी समुदाय की मदद करें', 'باہر کی کمیونٹی کی مدد کریں', 'Help Outside Community')}</p>
                  <p className="text-[11px]" style={{ color: 'var(--mfct-text-muted)' }}>
                    {tr(
                      'अपने गृह समुदाय के बाहर के अभियानों में दान करें',
                      'اپنے مقامی علاقے سے باہر کی مہمات میں عطیہ دیں',
                      'Donate to campaigns outside your home community'
                    )}
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
                <div
                  className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{ background: isOutsideCommunity ? 'var(--mfct-dark-green)' : '#cbd5e1' }}
                ></div>
              </label>
            </div>

            {/* Amount Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--mfct-dark-green)' }}>
                {tr('3. राशि चुनें (INR ₹)', '3. رقم منتخب کریں (INR ₹)', '3. Choose Amount (INR ₹)')}
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[500, 1000, 2500, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAmountClick(val)}
                    className="cursor-pointer py-3 rounded-xl font-bold text-sm border transition-all"
                    style={amount === val && !customAmount ? {
                      background: 'var(--mfct-dark-green)', color: '#fff', borderColor: 'var(--mfct-gold)'
                    } : {
                      background: 'var(--mfct-warm-bg)', color: 'var(--mfct-dark-green)', borderColor: 'var(--mfct-border)'
                    }}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 font-bold" style={{ color: 'var(--mfct-gold)' }}>₹</span>
                <input
                  type="number"
                  placeholder={tr('इच्छानुसार राशि दर्ज करें...', 'اپنی مرضی کی رقم درج کریں...', 'Enter custom amount...')}
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>
            </div>

            {/* Proceed Step 1 Button */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mfct-btn-gold cursor-pointer w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
            >
              <span>{tr('भुगतान हेतु आगे बढ़ें', 'ادائیگی کے لیے آگے بڑھیں', 'Proceed to Payment')} (₹{amount.toLocaleString('en-IN')})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && activeCampaign && (
          <form onSubmit={handleSubmitPayment} className="space-y-6">
            <div className="p-4 rounded-2xl flex items-center justify-between text-sm" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
              <div>
                <span className="text-xs block" style={{ color: 'var(--mfct-text-muted)' }}>{tr('चयनित अभियान:', 'منتخب مہم:', 'Selected Campaign:')}</span>
                <span className="font-bold truncate max-w-[280px] block" style={{ color: 'var(--mfct-dark-green)' }}>
                  {translateCampaignTitle(activeCampaign.title, language)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs block" style={{ color: 'var(--mfct-text-muted)' }}>{tr('कुल राशि:', 'کل رقم:', 'Total Amount:')}</span>
                <span className="font-bold text-lg" style={{ color: 'var(--mfct-dark-green)' }}>₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: 'var(--mfct-warm-bg-2)', border: '1px solid var(--mfct-border)' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className="cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all"
                style={paymentMethod === 'UPI' ? { background: 'var(--mfct-dark-green)', color: '#fff' } : { color: 'var(--mfct-text-muted)' }}
              >
                {tr('तत्काल यूपीआई / क्यूआर स्कैन', 'فوری یو پی آئی / کیو آر اسکین', 'Instant UPI / QR Scan')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className="cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all"
                style={paymentMethod === 'Bank Transfer' ? { background: 'var(--mfct-dark-green)', color: '#fff' } : { color: 'var(--mfct-text-muted)' }}
              >
                {tr('प्रत्यक्ष बैंक NEFT / RTGS', 'براہ راست بینک NEFT / RTGS', 'Direct Bank NEFT / RTGS')}
              </button>
            </div>

            {paymentMethod === 'UPI' ? (
              <div className="p-6 text-white rounded-3xl text-center space-y-4 shadow-xl" style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}>
                <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                  {accountDetails?.qr_code_url ? (
                    <img src={accountDetails.qr_code_url} alt="QR Code" className="w-36 h-36 object-contain mx-auto" />
                  ) : (
                    <QrCode className="w-36 h-36 mx-auto" style={{ color: 'var(--mfct-dark-green)' }} />
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--mfct-gold)' }}>{tr('सीधे एस्क्रो के लिए UPI ID', 'براہ راست اسکرو کے لیے یو پی آئی آئی ڈی', 'UPI ID for Direct Escrow')}</p>
                  <p className="font-mono text-white font-bold text-lg select-all">
                    {accountDetails?.upi_id || 'mfct@okicici'}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {tr(
                      'Google Pay, PhonePe, Paytm या BHIM UPI द्वारा स्कैन करें',
                      'Google Pay, PhonePe, Paytm یا BHIM ایپ سے اسکین کریں',
                      'Scan using Google Pay, PhonePe, Paytm, or BHIM UPI'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 text-white rounded-3xl space-y-3 text-xs font-mono" style={{ background: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span style={{ color: 'rgba(200,168,75,0.8)' }}>{tr('बैंक का नाम:', 'بینک کا نام:', 'Bank Name:')}</span>
                  <span className="text-white">{accountDetails?.bank_name || 'ICICI Bank Ltd'}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span style={{ color: 'rgba(200,168,75,0.8)' }}>{tr('खाता संख्या:', 'اکاؤنٹ نمبر:', 'Account Number:')}</span>
                  <span className="font-bold select-all" style={{ color: 'var(--mfct-gold)' }}>{accountDetails?.account_number || '000405018892'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(200,168,75,0.8)' }}>{tr('IFSC कोड:', 'آئی ایف ایس سی کوڈ:', 'IFSC Code:')}</span>
                  <span className="font-bold select-all" style={{ color: 'var(--mfct-gold)' }}>{accountDetails?.ifsc_code || 'ICIC0000004'}</span>
                </div>
              </div>
            )}

            {/* UTR and Receipt Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('आपका पूरा नाम', 'آپ کا پورا نام', 'Your Full Name')}
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm font-medium outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('12 अंकों का बैंक UTR / संदर्भ संख्या', '12 ہندسوں کا بینک UTR / ٹرانزیکشن نمبر', '12-Digit Bank UTR / Transaction Ref No')}
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
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { setScreenshotFile(file); setScreenshotUploaded(true); }
                    }}
                  />
                  <Upload className="w-5 h-5 mb-1" style={{ color: 'var(--mfct-gold)' }} />
                  <span className="text-xs font-bold">
                    {screenshotUploaded
                      ? `✓ ${screenshotFile?.name ?? tr('स्क्रीनशॉट संलग्न है', 'رسید منسلک ہے', 'Screenshot Attached')}`
                      : tr('भुगतान स्क्रीनशॉट अपलोड करने के लिए क्लिक करें', 'ادائیگی کی رسید اپلوڈ کریں', 'Click to upload payment screenshot')}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="cursor-pointer py-3.5 px-5 rounded-2xl font-bold text-xs transition-colors"
                style={{ background: 'var(--mfct-warm-bg-2)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-border)' }}
              >
                {tr('वापस', 'واپس', 'Back')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="mfct-btn-gold cursor-pointer flex-1 py-4 rounded-2xl disabled:opacity-60 font-bold text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  tr('भुगतान जमा करें और रसीद प्राप्त करें', 'ادائیگی جمع کروائیں اور رسید حاصل کریں', 'Submit Payment & Generate Receipt')
                )}
              </button>
            </div>
          </form>
        )}

        {step === 3 && createdDonation && (
          <div className="text-center py-4 space-y-6 animate-fade-in">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md"
              style={{ background: 'rgba(200,168,75,0.2)', border: '2px solid var(--mfct-gold)', color: 'var(--mfct-dark-green)' }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--mfct-gold)' }} />
            </div>

            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--mfct-dark-green)', fontFamily: 'Playfair Display, serif' }}>
                {tr('आपकी उदारता के लिए धन्यवाद! 🎉', 'آپ کی سخاوت کا شکریہ! 🎉', 'Thank You for Your Generosity! 🎉')}
              </h3>
              <p className="text-sm mt-1 max-w-md mx-auto" style={{ color: 'var(--mfct-text-muted)' }}>
                {language === 'hi' ? (
                  <>आपकी <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>₹{createdDonation.amountINR.toLocaleString('en-IN')}</span> की दान राशि एस्क्रो के तहत दर्ज कर ली गई है और कर-छूट रसीद तैयार कर दी गई है।</>
                ) : language === 'ur' ? (
                  <>آپ کا <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>₹{createdDonation.amountINR.toLocaleString('en-IN')}</span> کا عطیہ موصول ہو گیا ہے اور ٹیکس چھوٹ رسید تیار کر دی گئی ہے۔</>
                ) : (
                  <>Your donation of <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>₹{createdDonation.amountINR.toLocaleString('en-IN')}</span> has been submitted under escrow and a tax-exempt receipt has been generated.</>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl text-left text-xs space-y-2" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('रसीद संख्या:', 'رسید نمبر:', 'Receipt No:')}</span>
                <span className="font-bold font-mono" style={{ color: 'var(--mfct-dark-green)' }}>{createdDonation.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('यूटीआर संदर्भ:', 'یو ٹی آر ریفرنس:', 'UTR Reference:')}</span>
                <span className="font-mono" style={{ color: 'var(--mfct-dark-green)' }}>{createdDonation.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('श्रेणी:', 'کیٹیگری:', 'Category:')}</span>
                <span className="font-semibold" style={{ color: 'var(--mfct-dark-green)' }}>{getCategoryLabel(createdDonation.category)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="mfct-btn-dark cursor-pointer flex-1 py-3.5 rounded-2xl font-bold text-sm"
              >
                {tr('मुख्य मंच पर वापस जाएं', 'پلیٹ فارم پر واپس جائیں', 'Return to Platform')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
