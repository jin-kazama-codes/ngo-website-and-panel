import React, { useState, useEffect, useMemo } from 'react';
import { Donation, User } from '../../types';
import { FileText, AlertCircle, IndianRupee, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DarkListSkeleton } from '../../components/Skeletons';
import { getDonations } from '../../services/donationService';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateCommunityName } from '../../lib/translateEntity';
import { downloadDonationPaymentSlip } from '../../lib/donationPaymentSlip';

interface MyDonationsTabProps {
  activeUser: User;
  onOpenDonate: () => void;
  onSelectDonationReceipt: (donation: Donation) => void;
}

/* ─── Single table row ─────────────────────────────────────────── */
const DonationRow: React.FC<{
  don: Donation;
  index: number;
  onSelectDonationReceipt: (donation: Donation) => void;
}> = ({ don, index, onSelectDonationReceipt }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [expanded, setExpanded] = useState(false);

  const displayCampaign = useDynamicTranslatedText(don.campaignTitle || '', language);
  const displayCommunity = translateCommunityName(don.communityName || '', language);

  const statusStyle =
    don.status === 'verified'
      ? { background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold)', border: '1px solid var(--mfct-gold)' }
      : don.status === 'pending_verification' || don.status === 'pending'
        ? { background: 'rgba(217,119,6,0.1)', color: '#f59e0b', border: '1px solid rgba(217,119,6,0.3)' }
        : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' };

  const statusLabel =
    don.status === 'verified'
      ? tr('✓ सत्यापित', '✓ تصدیق شدہ', '✓ Verified')
      : don.status === 'pending_verification' || don.status === 'pending'
        ? tr('⏳ लंबित', '⏳ زیر التواء', '⏳ Pending')
        : tr('❌ अस्वीकृत', '❌ مسترد', '❌ Rejected');

  const dateStr = don.date
    ? new Date(don.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <>
      {/* Main row */}
      <tr
        className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${index % 2 === 0
          ? 'bg-white dark:bg-slate-900'
          : 'bg-slate-50/60 dark:bg-slate-800/40'
          } hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20`}
      >
        {/* # */}
        <td className="px-4 py-3 text-center text-xs font-mono text-slate-400 dark:text-slate-500 w-10">
          {index + 1}
        </td>

        {/* Status */}
        <td className="px-3 py-3 whitespace-nowrap">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap"
            style={statusStyle}
          >
            {statusLabel}
          </span>
        </td>

        {/* Date */}
        <td className="px-3 py-3 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {dateStr}
        </td>

        {/* Campaign */}
        <td className="px-3 py-3 min-w-[140px]">
          <span className="block font-bold text-xs text-slate-900 dark:text-white truncate max-w-[200px]">
            {displayCampaign}
          </span>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
            {displayCommunity}
          </span>
        </td>

        {/* Method */}
        <td className="px-3 py-3 whitespace-nowrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            {don.paymentMethod || (don as any).payment_method || '—'}
          </span>
        </td>

        {/* UTR */}
        <td className="px-3 py-3 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {don.utrNumber || don.transactionId || '—'}
        </td>

        {/* Amount */}
        <td className="px-3 py-3 text-right whitespace-nowrap">
          <span className="font-extrabold font-mono text-sm text-emerald-600 dark:text-emerald-400">
            ₹{don.amountINR.toLocaleString('en-IN')}
          </span>
        </td>

        {/* Actions */}
        <td className="px-3 py-3 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1.5">
            {don.status === 'verified' ? (
              <button
                onClick={() => {
                  try {
                    downloadDonationPaymentSlip(don);
                  } catch (err) {
                    window.alert(err instanceof Error ? err.message : 'Could not open payment slip.');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--mfct-gold) 0%, #d4af37 100%)',
                  color: 'var(--mfct-dark-green)',
                }}
                title={tr('भुगतान पर्ची डाउनलोड करें', 'ادائیگی کی رسید ڈاؤنلوڈ کریں', 'Download Payment Slip')}
              >
                <Download className="w-3.5 h-3.5" />
                {tr('पर्ची', 'پرچی', 'Payslip')}
              </button>
            ) : don.status === 'rejected' && (don.rejectionReason || don.rejection_reason) ? (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {tr('कारण', 'وجہ', 'Reason')}
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">—</span>
            )}
          </div>
        </td>
      </tr>

      {/* Rejection reason expanded row */}
      {expanded && don.status === 'rejected' && (don.rejectionReason || don.rejection_reason) && (
        <tr className="bg-rose-50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/40">
          <td colSpan={8} className="px-6 py-3">
            <div className="flex items-start gap-2 text-[11px] text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {tr('अस्वीकृति का कारण:', 'مسترد کرنے کی وجہ:', 'Rejection Reason:')}
                </span>{' '}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {don.rejectionReason || don.rejection_reason}
                </span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

/* ─── Main Component ───────────────────────────────────────────── */
export const MyDonationsTab: React.FC<MyDonationsTabProps> = ({
  activeUser,
  onOpenDonate,
  onSelectDonationReceipt,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [donations, setDonations] = useState<Donation[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const data = await getDonations(activeUser.id);
        setDonations(data);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeUser?.id) {
      fetchDonations();
    }
  }, [activeUser?.id]);

  const totalAmount = donations.reduce((s, d) => s + d.amountINR, 0);
  const verifiedCount = donations.filter((d) => d.status === 'verified').length;

  const totalPages = Math.max(1, Math.ceil(donations.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedDonations = useMemo(
    () => donations.slice((safePage - 1) * pageSize, safePage * pageSize),
    [donations, safePage, pageSize]
  );

  // Reset to page 1 when pageSize changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="rounded-3xl space-y-6 transition-all">
      {/* ── Header banner ── */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0a1c12 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.18)' }} />

        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl shrink-0 mt-0.5" style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.35)' }}>
            <IndianRupee className="w-6 h-6" style={{ color: 'var(--mfct-gold)' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr('मेरे दान एवं सहयोग रिकॉर्ड', 'میرے عطیات', 'My Giving Ledger')}
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'rgba(200,168,75,0.9)' }}>
              {tr('अपने सभी दानों के लिए सत्यापित रसीदें देखें।', 'اپنے تمام عطیات کے تصدیق شدہ ریکارڈ دیکھیں۔', 'View verified receipts for all your donations.')}
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={onOpenDonate}
            className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--mfct-gold) 0%, #d4af37 100%)',
              color: 'var(--mfct-dark-green)',
              boxShadow: '0 4px 15px rgba(200,168,75,0.35)',
            }}
          >
            <IndianRupee className="w-4 h-4" />
            <span>{tr('अभी दान करें', 'ابھی عطیہ دیں', 'Donate Now')}</span>
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <DarkListSkeleton items={4} />
          </div>
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3 text-center text-slate-500 dark:text-slate-400">
            <FileText className="w-12 h-12 text-amber-400/60" />
            <p className="text-sm font-medium">
              {tr('आपने अभी तक कोई दान नहीं किया है।', 'آپ نے ابھی تک کوئی عطیہ نہیں دیا ہے۔', "You haven't made any donations yet.")}
            </p>
            <button
              onClick={onOpenDonate}
              className="text-xs font-bold underline cursor-pointer text-emerald-600 dark:text-emerald-400"
            >
              {tr('अपना पहला दान करें', 'اپنا پہلا عطیہ دیں', 'Make your first donation')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              {/* Table head */}
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  {[
                    { label: '#', className: 'w-10 text-center' },
                    { label: tr('स्थिति', 'حالت', 'Status') },
                    { label: tr('तारीख', 'تاریخ', 'Date') },
                    { label: tr('अभियान / कारण', 'مہم / وجہ', 'Campaign / Cause') },
                    { label: tr('माध्यम', 'طریقہ', 'Method') },
                    { label: tr('UTR / संदर्भ', 'UTR / حوالہ', 'UTR / Ref') },
                    { label: tr('राशि', 'رقم', 'Amount'), className: 'text-right' },
                    { label: tr('पर्ची', 'پرچی', 'Payslip'), className: 'text-right' },
                  ].map(({ label, className }) => (
                    <th
                      key={label}
                      className={`px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap bg-slate-50 dark:bg-slate-800/60 ${className ?? ''}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table body */}
              <tbody>
                {paginatedDonations.map((don, i) => (
                  <DonationRow
                    key={don.id}
                    don={don}
                    index={(safePage - 1) * pageSize + i}
                    onSelectDonationReceipt={onSelectDonationReceipt}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination bar ── */}
        {!loading && donations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">

            {/* Left — showing info + per-page select */}
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                {tr('दिखा रहा है', 'دکھا رہا ہے', 'Showing')}{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {Math.min((safePage - 1) * pageSize + 1, donations.length)}
                  {' - '}
                  {Math.min(safePage * pageSize, donations.length)}
                </strong>
                {' '}
                {tr('में से', 'میں سے', 'of')}
                {' '}
                <strong className="text-slate-700 dark:text-slate-200">{donations.length}</strong>
                {' '}{tr('रिकॉर्ड', 'ریکارڈ', 'records')}
              </span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline">{tr('प्रति पृष्ठ:', 'فی صفحہ:', 'Per page:')}</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[5, 10, 20, 50].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Right — < Prev | pages | Next > */}
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {tr('पिछला', 'پچھلا', 'Prev')}
              </button>

              {/* Page number buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`e-${idx}`} className="px-2 text-slate-400 dark:text-slate-500 select-none">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`min-w-[32px] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${safePage === p
                        ? 'text-white border-transparent shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      style={safePage === p ? { background: 'var(--mfct-dark-green)' } : {}}
                    >
                      {p}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {tr('अगला', 'اگلا', 'Next')}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
