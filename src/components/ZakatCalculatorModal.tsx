'use client';

import React, { useState } from 'react';
import { X, Calculator, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, HelpCircle, RefreshCw, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ZakatCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonateCalculated: (amount: number) => void;
}

export const ZakatCalculatorModal: React.FC<ZakatCalculatorModalProps> = ({
  isOpen,
  onClose,
  onDonateCalculated,
}) => {
  const { t, isHindi } = useLanguage();

  // Asset states
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [goldRatePerGram, setGoldRatePerGram] = useState<number>(7200); // approx gold rate per gram in INR
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [silverRatePerGram, setSilverRatePerGram] = useState<number>(88); // approx silver rate per gram in INR

  const [cashInHand, setCashInHand] = useState<number>(0);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [businessStock, setBusinessStock] = useState<number>(0);
  const [receivables, setReceivables] = useState<number>(0);

  // Liabilities states
  const [debtsOwed, setDebtsOwed] = useState<number>(0);
  const [pendingBills, setPendingBills] = useState<number>(0);

  // Nisab standard choice
  const [nisabStandard, setNisabStandard] = useState<'silver' | 'gold'>('silver');

  if (!isOpen) return null;

  // Calculations
  const goldValue = (goldGrams || 0) * (goldRatePerGram || 0);
  const silverValue = (silverGrams || 0) * (silverRatePerGram || 0);
  const totalGrossAssets =
    goldValue +
    silverValue +
    (cashInHand || 0) +
    (bankBalance || 0) +
    (investments || 0) +
    (businessStock || 0) +
    (receivables || 0);

  const totalLiabilities = (debtsOwed || 0) + (pendingBills || 0);
  const netWealth = Math.max(0, totalGrossAssets - totalLiabilities);

  // Nisab values in INR
  const silverNisabValue = 612.36 * silverRatePerGram; // 612.36g silver
  const goldNisabValue = 87.48 * goldRatePerGram;     // 87.48g gold

  const activeNisabThreshold = nisabStandard === 'silver' ? silverNisabValue : goldNisabValue;
  const isEligibleForZakat = netWealth >= activeNisabThreshold;
  const zakatAmount = isEligibleForZakat ? Math.round(netWealth * 0.025) : 0;

  const handleReset = () => {
    setGoldGrams(0);
    setSilverGrams(0);
    setCashInHand(0);
    setBankBalance(0);
    setInvestments(0);
    setBusinessStock(0);
    setReceivables(0);
    setDebtsOwed(0);
    setPendingBills(0);
  };

  const handleProceedToDonate = () => {
    if (zakatAmount > 0) {
      onDonateCalculated(zakatAmount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-6"
        style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)' }}
      >
        {/* Header */}
        <div
          className="text-white p-6 sm:p-7 relative"
          style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, var(--mfct-mid-green) 100%)', borderBottom: '1px solid rgba(200,168,75,0.3)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="px-3 py-1 rounded-full font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm"
              style={{ background: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)' }}
            >
              <Sparkles className="w-3.5 h-3.5" /> 2.5% Islamic Zakat Calculator
            </span>
            <span
              className="px-2.5 py-1 rounded-full font-bold text-[11px]"
              style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold)', border: '1px solid rgba(200,168,75,0.3)' }}
            >
              Shariah Compliant
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isHindi ? 'सटीक ज़कात कैलकुलेटर' : 'Accurate Zakat Calculator'}
          </h2>
          <p className="text-xs sm:text-sm mt-1 max-w-xl" style={{ color: 'rgba(200,168,75,0.85)' }}>
            {isHindi
              ? 'अपनी कुल संपत्ति, सोना, चांदी, नकद एवं ऋण दर्ज करके आसानी से अपनी 2.5% देय ज़कात की गणना करें।'
              : 'Calculate your exact 2.5% Zakat obligation based on current gold/silver rates, savings, cash, and investments.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Nisab Standard Selector & Live Rates */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider block" style={{ color: 'var(--mfct-dark-green)' }}>
                  {isHindi ? 'निसाब मानक चुनें (Nisab Standard)' : 'Select Nisab Threshold Standard'}
                </label>
                <p className="text-[11px]" style={{ color: 'var(--mfct-text-muted)' }}>
                  {isHindi
                    ? 'अधिकांश विद्वान चांदी (Silver) के मानक की सलाह देते हैं ताकि अधिक गरीबों की मदद हो सके।'
                    : 'Silver Nisab is widely recommended for maximal charity benefit to the needy.'}
                </p>
              </div>

              <div className="flex items-center p-1 rounded-xl shadow-xs self-start sm:self-auto" style={{ background: 'var(--mfct-warm-bg-2)', border: '1px solid var(--mfct-border)' }}>
                <button
                  type="button"
                  onClick={() => setNisabStandard('silver')}
                  className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={nisabStandard === 'silver' ? {
                    background: 'var(--mfct-dark-green)', color: '#fff'
                  } : {
                    color: 'var(--mfct-text-muted)'
                  }}
                >
                  Silver (612.36g) ~ ₹{Math.round(silverNisabValue).toLocaleString('en-IN')}
                </button>
                <button
                  type="button"
                  onClick={() => setNisabStandard('gold')}
                  className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={nisabStandard === 'gold' ? {
                    background: 'var(--mfct-dark-green)', color: '#fff'
                  } : {
                    color: 'var(--mfct-text-muted)'
                  }}
                >
                  Gold (87.48g) ~ ₹{Math.round(goldNisabValue).toLocaleString('en-IN')}
                </button>
              </div>
            </div>

            {/* Editable Gold/Silver Per Gram Rates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" style={{ borderTop: '1px solid var(--mfct-border)' }}>
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {isHindi ? 'सोना दर (₹/ग्राम)' : 'Gold Rate (₹/Gram)'}
                </label>
                <input
                  type="number"
                  value={goldRatePerGram || ''}
                  onChange={(e) => setGoldRatePerGram(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl text-xs font-bold outline-none"
                  style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {isHindi ? 'चांदी दर (₹/ग्राम)' : 'Silver Rate (₹/Gram)'}
                </label>
                <input
                  type="number"
                  value={silverRatePerGram || ''}
                  onChange={(e) => setSilverRatePerGram(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl text-xs font-bold outline-none"
                  style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>
            </div>
          </div>

          {/* Asset Section */}
          <div>
            <h3 className="text-sm font-extrabold mb-3 flex items-center justify-between" style={{ color: 'var(--mfct-dark-green)' }}>
              <span>{isHindi ? '1. संपत्ति एवं परिसंपत्तियां (Assets)' : '1. Assets & Wealth Eligible for Zakat'}</span>
              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer text-xs font-bold flex items-center gap-1"
                style={{ color: 'var(--mfct-gold-dark)' }}
              >
                <RefreshCw className="w-3 h-3" /> {isHindi ? 'रीसेट करें' : 'Reset Fields'}
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Gold Grams */}
              <div className="p-3.5 rounded-2xl" style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.3)' }}>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {isHindi ? 'सोने का वजन (ग्राम में)' : 'Gold Weight (in Grams)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    value={goldGrams || ''}
                    onChange={(e) => setGoldGrams(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold outline-none"
                    style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold" style={{ color: 'var(--mfct-gold-dark)' }}>
                    = ₹{goldValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Silver Grams */}
              <div className="p-3.5 rounded-2xl" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {isHindi ? 'चांदी का वजन (ग्राम में)' : 'Silver Weight (in Grams)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    value={silverGrams || ''}
                    onChange={(e) => setSilverGrams(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold outline-none"
                    style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold" style={{ color: 'var(--mfct-text-muted)' }}>
                    = ₹{silverValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Cash in Hand */}
              <div className="p-3.5 rounded-2xl" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)' }}>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {isHindi ? 'नकद राशि हाथ में (₹)' : 'Cash in Hand (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={cashInHand || ''}
                  onChange={(e) => setCashInHand(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>

              {/* Bank Balance */}
              <div className="p-3.5 rounded-2xl" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)' }}>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {isHindi ? 'बैंक खाते में बचत (₹)' : 'Cash in Bank Accounts (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={bankBalance || ''}
                  onChange={(e) => setBankBalance(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>

              {/* Investments / Stocks */}
              <div className="p-3.5 rounded-2xl" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)' }}>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {isHindi ? 'शेयर/म्यूचुअल फंड/इन्वेस्टमेंट (₹)' : 'Investments, Shares & Stocks (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={investments || ''}
                  onChange={(e) => setInvestments(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>

              {/* Business Merchandise */}
              <div className="p-3.5 rounded-2xl" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)' }}>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {isHindi ? 'व्यापार का माल / स्टॉक (₹)' : 'Business Stock & Inventory (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={businessStock || ''}
                  onChange={(e) => setBusinessStock(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>
            </div>
          </div>

          {/* Liabilities Section */}
          <div>
            <h3 className="text-sm font-extrabold mb-3" style={{ color: 'var(--mfct-dark-green)' }}>
              {isHindi ? '2. देनदारियां व ऋण (Liabilities & Debts Deductible)' : '2. Liabilities & Immediate Debts'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <label className="text-xs font-bold text-red-950 block mb-1">
                  {isHindi ? 'बकाया कर्ज़ / लोन (₹)' : 'Immediate Debts Owed to Others (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={debtsOwed || ''}
                  onChange={(e) => setDebtsOwed(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  style={{ background: 'var(--mfct-white)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--mfct-text-dark)' }}
                />
              </div>

              <div className="p-3.5 rounded-2xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <label className="text-xs font-bold text-red-950 block mb-1">
                  {isHindi ? 'तत्काल भुगतान योग्य बिल व बकाया (₹)' : 'Pending Utility Bills / Wages Due (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={pendingBills || ''}
                  onChange={(e) => setPendingBills(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  style={{ background: 'var(--mfct-white)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--mfct-text-dark)' }}
                />
              </div>
            </div>
          </div>

          {/* Zakat Calculation Summary Box */}
          <div
            className="p-5 sm:p-6 rounded-3xl text-white space-y-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-white/10 text-center sm:text-left">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'rgba(200,168,75,0.7)' }}>
                  {isHindi ? 'कुल संपत्ति (Gross Assets)' : 'Total Gross Assets'}
                </span>
                <span className="text-lg font-extrabold text-white">
                  ₹{totalGrossAssets.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'rgba(200,168,75,0.7)' }}>
                  {isHindi ? 'कुल कर्ज़ (Liabilities)' : 'Total Deductions'}
                </span>
                <span className="text-lg font-extrabold text-rose-400">
                  - ₹{totalLiabilities.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'rgba(200,168,75,0.7)' }}>
                  {isHindi ? 'शुद्ध संपत्ति (Net Zakat Wealth)' : 'Net Wealth Position'}
                </span>
                <span className="text-lg font-extrabold" style={{ color: 'var(--mfct-gold)' }}>
                  ₹{netWealth.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Eligibility & Final Output */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isEligibleForZakat ? (
                    <span
                      className="px-2.5 py-0.5 rounded-full font-bold text-xs flex items-center gap-1"
                      style={{ background: 'rgba(200,168,75,0.2)', color: 'var(--mfct-gold)', border: '1px solid var(--mfct-gold)' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> {isHindi ? 'ज़कात फर्ज़ (Eligible)' : 'Zakat Obligation Applies'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      {isHindi ? 'निसाब से कम (Below Nisab)' : 'Below Nisab Threshold'}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    (Nisab: ₹{Math.round(activeNisabThreshold).toLocaleString('en-IN')})
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {isEligibleForZakat
                    ? isHindi
                      ? 'आपकी संपत्ति निसाब सीमा से अधिक है। आपकी 2.5% ज़कात नीचे दी गई है:'
                      : 'Your wealth exceeds the Nisab threshold. Your 2.5% compulsory Zakat due:'
                    : isHindi
                      ? 'आपकी शुद्ध संपत्ति निसाब सीमा से कम है। ज़कात अनिवार्य नहीं है, लेकिन आप सदक़ा दे सकते हैं।'
                      : 'Net wealth is below Nisab. Compulsory Zakat is not due, but Sadaqah donation is welcomed.'}
                </p>
              </div>

              {/* Large Calculated Zakat Output */}
              <div
                className="p-4 rounded-2xl text-center sm:text-right shrink-0"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(200,168,75,0.3)' }}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: 'rgba(200,168,75,0.8)' }}>
                  {isHindi ? 'कुल देय ज़कात (2.5%)' : 'Total Payable Zakat (2.5%)'}
                </span>
                <span className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--mfct-gold)' }}>
                  ₹{zakatAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Direct Action Button */}
            {zakatAmount > 0 ? (
              <button
                type="button"
                onClick={handleProceedToDonate}
                className="mfct-btn-gold cursor-pointer w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 group"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>
                  {isHindi
                    ? `₹${zakatAmount.toLocaleString('en-IN')} सीधे सत्यापित ज़कात अभियानों में दान करें`
                    : `Donate Payable Zakat (₹${zakatAmount.toLocaleString('en-IN')}) Directly to Verified Campaigns`}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onDonateCalculated(1000);
                  onClose();
                }}
                className="cursor-pointer w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(200,168,75,0.25)' }}
              >
                <Heart className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                <span>
                  {isHindi
                    ? 'सामान्य सदक़ा / राहत कोष में स्वेच्छा से दान करें'
                    : 'Donate Voluntary Sadaqah to Verified Emergency Relief'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
