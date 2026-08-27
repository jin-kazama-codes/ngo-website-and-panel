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
    <div
      className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-all"
      style={{
        background: 'var(--mfct-warm-bg)',
        border: '1px solid var(--mfct-border)',
      }}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full font-bold border text-[10px]"
            style={
              don.status === 'verified'
                ? { background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-gold)' }
                : don.status === 'pending_verification'
                ? { background: 'rgba(217,119,6,0.1)', color: '#b45309', border: '1px solid rgba(217,119,6,0.3)' }
                : { background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)' }
            }
          >
            {don.status === 'verified'
              ? tr('✓ UTR सत्यापित', '✓ UTR تصدیق شدہ', '✓ UTR Verified')
              : don.status === 'pending_verification'
              ? tr('⏳ लंबित', '⏳ زیر التواء', '⏳ Pending')
              : tr('❌ विफल', '❌ ناکام', '❌ Failed')}
          </span>
          <span className="font-mono text-[11px]" style={{ color: 'var(--mfct-text-muted)' }}>• {new Date(don.date).toLocaleDateString()}</span>
        </div>
        <h4 className="font-bold text-sm" style={{ color: 'var(--mfct-dark-green)' }}>{displayCampaign}</h4>
        <p style={{ color: 'var(--mfct-text-muted)' }}>
          {tr('समुदाय:', 'برادری:', 'Community:')} {displayCommunity}{' '}
          {don.utrNumber ? `• UTR: ${don.utrNumber}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-lg font-black font-mono" style={{ color: 'var(--mfct-dark-green)' }}>
          ₹{don.amountINR.toLocaleString('en-IN')}
        </span>
        <button
          onClick={() => onSelectDonationReceipt(don)}
          className="px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          style={{
            background: 'var(--mfct-white)',
            border: '1px solid var(--mfct-border)',
            color: 'var(--mfct-dark-green)',
          }}
        >
          <FileText className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold-dark)' }} />
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
    <div
      className="rounded-3xl p-6 sm:p-8 space-y-6 transition-all"
      style={{
        background: 'var(--mfct-white)',
        border: '1px solid var(--mfct-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>
            {tr('मेरे दान एवं सहयोग रिकॉर्ड', 'میرے عطیات', 'My Giving Ledger')}
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--mfct-text-muted)' }}>
            {tr('अपने सभी दानों के लिए सत्यापित रसीदें देखें।', 'اپنے تمام عطیات کے لیے تصدیق شدہ رسیدیں देखیں۔', 'View verified receipts for all your donations.')}
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
          <div className="flex flex-col items-center justify-center p-12 space-y-3 text-center" style={{ color: 'var(--mfct-text-muted)' }}>
            <FileText className="w-10 h-10" style={{ color: 'var(--mfct-gold)' }} />
            <p className="text-sm">
              {tr('आपने अभी तक कोई दान नहीं किया है।', 'آپ نے ابھی تک کوئی عطیہ نہیں دیا ہے۔', 'You haven\'t made any donations yet.')}
            </p>
            <button
              onClick={onOpenDonate}
              className="text-xs font-bold underline cursor-pointer"
              style={{ color: 'var(--mfct-mid-green)' }}
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
