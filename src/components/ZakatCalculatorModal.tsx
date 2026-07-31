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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> 2.5% Islamic Zakat Calculator
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-700/80 text-emerald-100 font-bold text-[11px]">
              Shariah Compliant
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isHindi ? 'सटीक ज़कात कैलकुलेटर' : 'Accurate Zakat Calculator'}
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-xl">
            {isHindi
              ? 'अपनी कुल संपत्ति, सोना, चांदी, नकद एवं ऋण दर्ज करके आसानी से अपनी 2.5% देय ज़कात की गणना करें।'
              : 'Calculate your exact 2.5% Zakat obligation based on current gold/silver rates, savings, cash, and investments.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Nisab Standard Selector & Live Rates */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  {isHindi ? 'निसाब मानक चुनें (Nisab Standard)' : 'Select Nisab Threshold Standard'}
                </label>
                <p className="text-[11px] text-slate-500">
                  {isHindi
                    ? 'अधिकांश विद्वान चांदी (Silver) के मानक की सलाह देते हैं ताकि अधिक गरीबों की मदद हो सके।'
                    : 'Silver Nisab is widely recommended for maximal charity benefit to the needy.'}
                </p>
              </div>

              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-300 shadow-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setNisabStandard('silver')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    nisabStandard === 'silver'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Silver (612.36g) ~ ₹{Math.round(silverNisabValue).toLocaleString('en-IN')}
                </button>
                <button
                  type="button"
                  onClick={() => setNisabStandard('gold')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    nisabStandard === 'gold'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Gold (87.48g) ~ ₹{Math.round(goldNisabValue).toLocaleString('en-IN')}
                </button>
              </div>
            </div>

            {/* Editable Gold/Silver Per Gram Rates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {isHindi ? 'सोना दर (₹/ग्राम)' : 'Gold Rate (₹/Gram)'}
                </label>
                <input
                  type="number"
                  value={goldRatePerGram || ''}
                  onChange={(e) => setGoldRatePerGram(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {isHindi ? 'चांदी दर (₹/ग्राम)' : 'Silver Rate (₹/Gram)'}
                </label>
                <input
                  type="number"
                  value={silverRatePerGram || ''}
                  onChange={(e) => setSilverRatePerGram(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:border-emerald-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Asset Section */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center justify-between">
              <span>{isHindi ? '1. संपत्ति एवं परिसंपत्तियां (Assets)' : '1. Assets & Wealth Eligible for Zakat'}</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> {isHindi ? 'रीसेट करें' : 'Reset Fields'}
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Gold Grams */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                <label className="text-xs font-bold text-amber-950 block mb-1">
                  {isHindi ? 'सोने का वजन (ग्राम में)' : 'Gold Weight (in Grams)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    value={goldGrams || ''}
                    onChange={(e) => setGoldGrams(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-amber-800">
                    = ₹{goldValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Silver Grams */}
              <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-300/80">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {isHindi ? 'चांदी का वजन (ग्राम में)' : 'Silver Weight (in Grams)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    value={silverGrams || ''}
                    onChange={(e) => setSilverGrams(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-700">
                    = ₹{silverValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Cash in Hand */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {isHindi ? 'नकद राशि हाथ में (₹)' : 'Cash in Hand (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={cashInHand || ''}
                  onChange={(e) => setCashInHand(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              {/* Bank Balance */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {isHindi ? 'बैंक खाते में बचत (₹)' : 'Cash in Bank Accounts (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={bankBalance || ''}
                  onChange={(e) => setBankBalance(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              {/* Investments / Stocks */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {isHindi ? 'शेयर/म्यूचुअल फंड/इन्वेस्टमेंट (₹)' : 'Investments, Shares & Stocks (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={investments || ''}
                  onChange={(e) => setInvestments(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              {/* Business Merchandise */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {isHindi ? 'व्यापार का माल / स्टॉक (₹)' : 'Business Stock & Inventory (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={businessStock || ''}
                  onChange={(e) => setBusinessStock(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Liabilities Section */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">
              {isHindi ? '2. देनदारियां व ऋण (Liabilities & Debts Deductible)' : '2. Liabilities & Immediate Debts'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200/80">
                <label className="text-xs font-bold text-red-950 block mb-1">
                  {isHindi ? 'बकाया कर्ज़ / लोन (₹)' : 'Immediate Debts Owed to Others (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={debtsOwed || ''}
                  onChange={(e) => setDebtsOwed(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-red-300 text-xs font-bold outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200/80">
                <label className="text-xs font-bold text-red-950 block mb-1">
                  {isHindi ? 'तत्काल भुगतान योग्य बिल व बकाया (₹)' : 'Pending Utility Bills / Wages Due (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={pendingBills || ''}
                  onChange={(e) => setPendingBills(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-red-300 text-xs font-bold outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
          </div>

          {/* Zakat Calculation Summary Box */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800 text-center sm:text-left">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isHindi ? 'कुल संपत्ति (Gross Assets)' : 'Total Gross Assets'}
                </span>
                <span className="text-lg font-extrabold text-slate-100">
                  ₹{totalGrossAssets.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isHindi ? 'कुल कर्ज़ (Liabilities)' : 'Total Deductions'}
                </span>
                <span className="text-lg font-extrabold text-red-400">
                  - ₹{totalLiabilities.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isHindi ? 'शुद्ध संपत्ति (Net Zakat Wealth)' : 'Net Wealth Position'}
                </span>
                <span className="text-lg font-extrabold text-emerald-400">
                  ₹{netWealth.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Eligibility & Final Output */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isEligibleForZakat ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {isHindi ? 'ज़कात फर्ज़ (Eligible)' : 'Zakat Obligation Applies'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      {isHindi ? 'निसाब से कम (Below Nisab)' : 'Below Nisab Threshold'}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    (Nisab: ₹{Math.round(activeNisabThreshold).toLocaleString('en-IN')})
                  </span>
                </div>
                <p className="text-xs text-slate-300">
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
              <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-500/40 text-center sm:text-right shrink-0">
                <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block">
                  {isHindi ? 'कुल देय ज़कात (2.5%)' : 'Total Payable Zakat (2.5%)'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300">
                  ₹{zakatAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Direct Action Button */}
            {zakatAmount > 0 ? (
              <button
                type="button"
                onClick={handleProceedToDonate}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
              >
                <Heart className="w-4 h-4 fill-current text-slate-950" />
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
                  onDonateCalculated(1000); // optional general sadaqah
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                <Heart className="w-4 h-4 text-emerald-400" />
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
