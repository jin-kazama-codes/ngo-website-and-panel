'use client';

import React from 'react';
import { Campaign } from '../types';
import { FileCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translateCampaignTitle } from '../lib/translateEntity';

interface ZakatWakalahFormProps {
  donorName: string;
  setDonorName: (v: string) => void;
  guardianName: string;
  setGuardianName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
  amount: number;
  customAmount: string;
  onAmountClick: (val: number) => void;
  onCustomAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  amountInWords: string;
  setAmountInWords: (v: string) => void;
  isAgreed: boolean;
  setIsAgreed: (v: boolean) => void;
  campaigns: Campaign[];
  selectedCampaignId: string;
  setSelectedCampaignId: (id: string) => void;
  translatedTitles: Record<string, string>;
  onProceed: () => void;
}

export const ZakatWakalahForm: React.FC<ZakatWakalahFormProps> = ({
  donorName,
  setDonorName,
  guardianName,
  setGuardianName,
  address,
  setAddress,
  mobile,
  setMobile,
  amount,
  customAmount,
  onAmountClick,
  onCustomAmountChange,
  amountInWords,
  setAmountInWords,
  isAgreed,
  setIsAgreed,
  campaigns,
  selectedCampaignId,
  setSelectedCampaignId,
  translatedTitles,
  onProceed,
}) => {
  const { language } = useLanguage();

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const isHi = language === 'hi';
  const isUr = language === 'ur';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Official Undertaking Container */}
      <div
        className="p-5 sm:p-6 rounded-2xl border-2 space-y-5"
        style={{
          background: 'linear-gradient(180deg, rgba(200,168,75,0.08) 0%, rgba(10,46,29,0.03) 100%)',
          borderColor: 'var(--mfct-gold)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {/* Header Banner - Cleanly displayed without redundant language toggle */}
        <div className="border-b pb-4" style={{ borderColor: 'rgba(200,168,75,0.3)' }}>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-700" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#855f1e]">
              MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-wide mt-1" style={{ color: 'var(--mfct-dark-green)' }}>
            ZAKAT AUTHORISATION &amp; WAKALAH UNDERTAKING
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {tr(
              'ज़कात वकील/अमीन नियुक्ति एवं वैधानिक घोषणा पत्र',
              'زکوٰۃ وکالت نامہ اور توثیق اقرار نامہ',
              'Official Legal & Shariah Undertaking Executed by the Zakat Donor'
            )}
          </p>
        </div>

        {/* Target Campaign Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--mfct-dark-green)' }}>
            {tr(
              'लक्षित शरीअत-सत्यापित ज़कात अभियान',
              'ہدف شریعت مصدقہ زکوٰۃ مہم',
              'Target Shariah-Verified Zakat Campaign'
            )}
          </label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full p-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all outline-none"
            style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {translatedTitles[c.id] || translateCampaignTitle(c.title, language)}
                {c.city ? ` — (${tr('शहर', 'شہر', 'City')}: ${c.city})` : ''}
                {c.isZakatEligible ? ` (${tr('ज़कात पात्र ✓', 'زکوٰۃ اہل ✓', 'Zakat Eligible ✓')})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Undertaking Form Fields */}
        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-900 italic">
            {tr('मैं,', 'میں،', 'I,')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* नाम / Name */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 focus-within:border-[var(--mfct-gold)] transition-colors">
              <label className="font-bold text-slate-700 block mb-1">
                {tr('नाम:', 'نام:', 'Name:')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder={tr('उदा. मोहम्मद फ़हीम', 'مثال: محمد فہیم', 'e.g. Mohammad Faeem')}
                className="w-full font-medium text-slate-900 outline-none text-xs sm:text-sm bg-transparent"
              />
            </div>

            {/* पिता/पति का नाम */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 focus-within:border-[var(--mfct-gold)] transition-colors">
              <label className="font-bold text-slate-700 block mb-1">
                {tr("पिता/पति का नाम:", "والد / شوہر کا نام:", "Father's / Husband's Name:")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder={tr('पिता या पति का नाम दर्ज करें', 'والد یا شوہر کا نام درج کریں', "Enter Father's or Husband's Name")}
                className="w-full font-medium text-slate-900 outline-none text-xs sm:text-sm bg-transparent"
              />
            </div>

            {/* पता / Address */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 focus-within:border-[var(--mfct-gold)] transition-colors">
              <label className="font-bold text-slate-700 block mb-1">
                {tr('पता:', 'پتہ:', 'Address:')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={tr('उदा. मकान सं., मोहल्ला, शहर', 'مثال: مکان نمبر، محلہ، شہر', 'e.g. House No., Street, City')}
                className="w-full font-medium text-slate-900 outline-none text-xs sm:text-sm bg-transparent"
              />
            </div>

            {/* मोबाइल / Mobile */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 focus-within:border-[var(--mfct-gold)] transition-colors">
              <label className="font-bold text-slate-700 block mb-1">
                {tr('मोबाइल:', 'موبائل:', 'Mobile:')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="उदा. 9876543210"
                className="w-full font-medium text-slate-900 outline-none text-xs sm:text-sm bg-transparent font-mono"
              />
            </div>

            {/* राशि / Amount */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 focus-within:border-[var(--mfct-gold)] transition-colors sm:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="font-bold text-slate-700 block">
                  {tr('राशि:', 'رقم:', 'Amount:')} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[1000, 2500, 5000, 10000, 25000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onAmountClick(val)}
                      className="cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold transition-all border"
                      style={amount === val && !customAmount ? {
                        background: 'var(--mfct-dark-green)',
                        color: '#fff',
                        borderColor: 'var(--mfct-gold)'
                      } : {
                        background: 'var(--mfct-warm-bg)',
                        color: 'var(--mfct-text-dark)',
                        borderColor: 'var(--mfct-border)'
                      }}
                    >
                      ₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative flex items-center">
                <span className="font-black text-sm text-[var(--mfct-gold)] mr-2">₹</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={customAmount || amount}
                  onChange={onCustomAmountChange}
                  placeholder={tr('राशि दर्ज करें...', 'رقم درج کریں...', 'Enter amount...')}
                  className="w-full font-bold text-base text-slate-900 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* राशि शब्दों में / Amount in Words */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 focus-within:border-[var(--mfct-gold)] transition-colors sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                {tr('राशि शब्दों में:', 'رقم لفظوں میں:', 'Amount in Words:')}
              </label>
              <input
                type="text"
                value={amountInWords}
                onChange={(e) => setAmountInWords(e.target.value)}
                placeholder={tr(
                  'उदा. दो हज़ार पाँच सौ रुपये मात्र',
                  'مثال: دو ہزار پانچ سو روپے فقط',
                  'e.g. Two Thousand Five Hundred Rupees Only'
                )}
                className="w-full font-medium text-slate-900 outline-none text-xs sm:text-sm bg-transparent"
              />
            </div>
          </div>

          {/* Solemn Declaration & Authorization Text */}
          <div
            className="p-4 rounded-xl space-y-3 text-xs sm:text-sm leading-relaxed border"
            style={{
              background: 'rgba(255,255,255,0.95)',
              borderColor: 'rgba(200,168,75,0.45)',
            }}
          >
            {isHi ? (
              <div className="space-y-2 text-slate-900">
                <p className="font-bold text-slate-900">
                  यह घोषित करता/करती हूँ कि उपरोक्त राशि मेरी ज़कात की राशि है।
                </p>
                <p className="text-slate-800 leading-normal">
                  मैं <span className="font-extrabold text-[#0a2e1d]">MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</span> को अपनी ओर से इस राशि को <span className="font-extrabold text-[#855f1e]">वकील/अमीन</span> के रूप में प्राप्त करने तथा शरीअत के अनुसार योग्य ज़कात लाभार्थियों तक पहुँचाने के लिए अधिकृत करता/करती हूँ।
                </p>
              </div>
            ) : isUr ? (
              <div className="space-y-2 text-slate-900 text-right" dir="rtl">
                <p className="font-bold text-slate-900">
                  یہ اقرار کرتا/کرتی ہوں کہ درج بالا رقم میری زکوٰۃ کی رقم ہے۔
                </p>
                <p className="text-slate-800 leading-normal">
                  میں <span className="font-extrabold text-[#0a2e1d]">MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</span> کو اپنی طرف سے <span className="font-extrabold text-[#855f1e]">وکیل/امین</span> کے طور پر اس رقم کو وصول کرنے اور شریعت کے مطابق مستحقین تک پہنچانے کا مجاز بناتا/بناتی ہوں۔
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-slate-900">
                <p className="font-bold text-slate-900">
                  hereby declare that the above amount is my Zakat money.
                </p>
                <p className="text-slate-800 leading-normal">
                  I authorise <span className="font-extrabold text-[#0a2e1d]">MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</span> to act as my <span className="font-extrabold text-[#855f1e]">Wakil/Amin</span> on my behalf to receive and disburse this Zakat to Shariah-compliant eligible beneficiaries.
                </p>
              </div>
            )}
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs text-slate-700 leading-snug">
              {tr(
                'मैं पुष्टि करता/करती हूँ कि मैंने उपरोक्त वकालात वचनबद्धता पढ़ ली है और मैं अपनी पूर्ण सहमति देता/देती हूँ।',
                'میں تصدیق کرتا/کرتی ہوں کہ میں نے مذکورہ بالا زکوٰۃ وکالت اقرار نامہ پڑھ لیا ہے اور میں اپنی مکمل رضامندی دیتا/دیتی ہوں۔',
                'I solemnly confirm that I have read the above Zakat Wakalah Undertaking and grant my full authorization.'
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Proceed Step 1 Button */}
      <button
        type="button"
        onClick={onProceed}
        disabled={!isAgreed}
        className="mfct-btn-gold cursor-pointer w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
      >
        <span>
          {tr(
            `वचनबद्धता स्वीकार करें एवं भुगतान करें (₹${amount.toLocaleString('en-IN')})`,
            `وکالت اقرار نامہ قبول کریں اور ادائیگی کریں (₹${amount.toLocaleString('en-IN')})`,
            `Accept Undertaking & Proceed (₹${amount.toLocaleString('en-IN')})`
          )}
        </span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
