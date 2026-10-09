import React, { useState, useEffect } from 'react';
import { Donation, User } from '../../types';
import { FileText, AlertCircle, IndianRupee } from 'lucide-react';
import { DarkListSkeleton } from '../../components/Skeletons';
import { getDonations } from '../../services/donationService';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateCommunityName } from '../../lib/translateEntity';

interface MyDonationsTabProps {
  activeUser: User;
  onOpenDonate: () => void;
  onSelectDonationReceipt: (donation: Donation) => void;
}

const MyDonationItem: React.FC<{
  don: Donation;
  onSelectDonationReceipt: (donation: Donation) => void;
}> = ({ don, onSelectDonationReceipt }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayCampaign = useDynamicTranslatedText(don.campaignTitle || '', language);
  const displayCommunity = translateCommunityName(don.communityName || '', language);

  return (
    <div className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-all bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2.5 py-0.5 rounded-full font-bold border text-[10px]"
            style={
              don.status === 'verified'
                ? { background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold)', border: '1px solid var(--mfct-gold)' }
                : (don.status === 'pending_verification' || don.status === 'pending')
                  ? { background: 'rgba(217,119,6,0.1)', color: '#f59e0b', border: '1px solid rgba(217,119,6,0.3)' }
                  : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
            }
          >
            {don.status === 'verified'
              ? tr('✓ UTR सत्यापित', '✓ UTR تصدیق شدہ', '✓ UTR Verified')
              : (don.status === 'pending_verification' || don.status === 'pending')
                ? tr('⏳ सत्यापन लंबित', '⏳ زیر التواء', '⏳ Verification Pending')
                : tr('❌ अस्वीकृत', '❌ مسترد', '❌ Rejected')}
          </span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">• {new Date(don.date).toLocaleDateString()}</span>
        </div>
        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{displayCampaign}</h4>
        <p className="text-slate-500 dark:text-slate-400">
          {tr('समुदाय:', 'برادری:', 'Community:')} {displayCommunity}{' '}
          {don.utrNumber ? `• UTR: ${don.utrNumber}` : ''}
        </p>

        {don.status === 'rejected' && (don.rejectionReason || don.rejection_reason) && (
          <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-800 dark:text-rose-300">
            <div className="font-bold flex items-center gap-1 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{tr('व्यवस्थापक द्वारा अस्वीकृति का कारण:', 'مسترد کرنے کی وجہ:', 'Rejection Reason from Admin:')}</span>
            </div>
            <p className="font-medium text-slate-700 dark:text-slate-200">{don.rejectionReason || don.rejection_reason}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
          ₹{don.amountINR.toLocaleString('en-IN')}
        </span>
        {don.status === 'verified' && (
          <button
            onClick={() => onSelectDonationReceipt(don)}
            className="px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>{tr('रसीद', 'رسید', 'Receipt')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

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

  return (
    <div className="rounded-3xl p-6 sm:p-8 space-y-6 transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative">
      {/* Header */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        style={{
          background:
            'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0a1c12 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Decorative Glow */}
        <div
          className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{
            background: 'rgba(200,168,75,0.18)',
          }}
        />

        {/* Header Content */}
        <div className="flex items-start gap-4 relative z-10">
          {/* Icon */}
          <div
            className="p-3.5 rounded-2xl shrink-0 mt-0.5"
            style={{
              background: 'rgba(200,168,75,0.15)',
              border: '1px solid rgba(200,168,75,0.35)',
            }}
          >
            <IndianRupee
              className="w-6 h-6"
              style={{
                color: 'var(--mfct-gold)',
              }}
            />
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr(
                'मेरे दान एवं सहयोग रिकॉर्ड',
                'میرے عطیات',
                'My Giving Ledger'
              )}
            </h1>

            <p
              className="text-xs sm:text-sm mt-1 max-w-4xl"
              style={{
                color: 'rgba(200,168,75,0.9)',
              }}
            >
              {tr(
                'अपने सभी दानों के लिए सत्यापित रसीदें देखें।',
                'اپنے تمام عطیات کے تصدیق شدہ ریکارڈ دیکھیں۔',
                'View verified receipts for all your donations.'
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDonate}
            className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:brightness-110 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, var(--mfct-gold) 0%, #d4af37 100%)',
              color: 'var(--mfct-dark-green)',
              boxShadow: '0 4px 15px rgba(200,168,75,0.35)',
            }}
          >
            <IndianRupee className="w-4 h-4" />

            <span>
              {tr(
                '+ अभी दान करें',
                '+ ابھی عطیہ دیں',
                '+ Donate Now'
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <DarkListSkeleton items={4} />
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 text-center text-slate-500 dark:text-slate-400">
            <FileText className="w-10 h-10 text-amber-500 dark:text-amber-400" />
            <p className="text-sm">
              {tr('आपने अभी तक कोई दान नहीं किया है।', 'آپ نے ابھی تک کوئی عطیہ نہیں دیا ہے۔', 'You haven\'t made any donations yet.')}
            </p>
            <button
              onClick={onOpenDonate}
              className="text-xs font-bold underline cursor-pointer text-emerald-600 dark:text-emerald-400"
            >
              {tr('अपना पहला दान करें', 'اپنا پہلا عطیہ دیں', 'Make your first donation')}
            </button>
          </div>
        ) : (
          donations.map((don) => (
            <MyDonationItem
              key={don.id}
              don={don}
              onSelectDonationReceipt={onSelectDonationReceipt}
            />
          ))
        )}
      </div>
    </div>
  );
};
