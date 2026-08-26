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
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${
              don.status === 'verified'
                ? 'bg-emerald-100/50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : don.status === 'pending_verification'
                ? 'bg-amber-100/50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-rose-100/50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
            }`}
          >
            {don.status === 'verified'
              ? tr('✓ UTR सत्यापित', '✓ UTR تصدیق شدہ', '✓ UTR Verified')
              : don.status === 'pending_verification'
              ? tr('⏳ लंबित', '⏳ زیر التواء', '⏳ Pending')
              : tr('❌ विफल', '❌ ناکام', '❌ Failed')}
          </span>
          <span className="text-slate-400 font-mono">• {new Date(don.date).toLocaleDateString()}</span>
        </div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{displayCampaign}</h4>
        <p className="text-slate-500 dark:text-slate-400">
          {tr('समुदाय:', 'برادری:', 'Community:')} {displayCommunity}{' '}
          {don.utrNumber ? `• UTR: ${don.utrNumber}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
          ₹{don.amountINR.toLocaleString('en-IN')}
        </span>
        <button
          onClick={() => onSelectDonationReceipt(don)}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {tr('मेरा दान इतिहास एवं रसीदें', 'میری عطیات کی تاریخ اور رسیدیں', 'My Donation History & Receipts')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tr('अपने सभी दानों के लिए सत्यापित रसीदें देखें।', 'اپنے تمام عطیات کے لیے تصدیق شدہ رسیدیں دیکھیں۔', 'View verified receipts for all your donations.')}
          </p>
        </div>
        <button
          onClick={onOpenDonate}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          {tr('+ अभी दान करें', '+ ابھی عطیہ دیں', '+ Donate Now')}
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <DarkListSkeleton items={4} />
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm">
              {tr('आपने अभी तक कोई दान नहीं किया है।', 'آپ نے ابھی تک کوئی عطیہ نہیں دیا ہے۔', 'You haven\'t made any donations yet.')}
            </p>
            <button
              onClick={onOpenDonate}
              className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-bold cursor-pointer"
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
