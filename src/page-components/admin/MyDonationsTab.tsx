import React, { useState, useEffect } from 'react';
import { Donation, User } from '../../types';
import { FileText } from 'lucide-react';
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
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full font-bold border text-[10px]"
            style={
              don.status === 'verified'
                ? { background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold)', border: '1px solid var(--mfct-gold)' }
                : don.status === 'pending_verification'
                ? { background: 'rgba(217,119,6,0.1)', color: '#f59e0b', border: '1px solid rgba(217,119,6,0.3)' }
                : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
            }
          >
            {don.status === 'verified'
              ? tr('✓ UTR सत्यापित', '✓ UTR تصدیق شدہ', '✓ UTR Verified')
              : don.status === 'pending_verification'
              ? tr('⏳ लंबित', '⏳ زیر التواء', '⏳ Pending')
              : tr('❌ विफल', '❌ ناکام', '❌ Failed')}
          </span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">• {new Date(don.date).toLocaleDateString()}</span>
        </div>
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{displayCampaign}</h4>
        <p className="text-slate-500 dark:text-slate-400">
          {tr('समुदाय:', 'برادری:', 'Community:')} {displayCommunity}{' '}
          {don.utrNumber ? `• UTR: ${don.utrNumber}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
          ₹{don.amountINR.toLocaleString('en-IN')}
        </span>
        <button
          onClick={() => onSelectDonationReceipt(don)}
          className="px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600"
        >
          <FileText className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>{tr('रसीद', 'رسید', 'Receipt')}</span>
        </button>
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
    <div className="rounded-3xl p-6 sm:p-8 space-y-6 transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {tr('मेरे दान एवं सहयोग रिकॉर्ड', 'میرے عطیات', 'My Giving Ledger')}
          </h2>
          <p className="text-xs sm:text-sm mt-1 text-slate-500 dark:text-slate-400">
            {tr('अपने सभी दानों के लिए सत्यापित रसीदें देखें।', 'اپنے تمام عطیات के लिए تصدیق شدہ رسیدیں देखیں۔', 'View verified receipts for all your donations.')}
          </p>
        </div>
        <button
          onClick={onOpenDonate}
          className="mfct-btn-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all"
        >
          {tr('+ अभी दान करें', '+ ابھی عطیہ دیں', '+ Donate Now')}
        </button>
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
