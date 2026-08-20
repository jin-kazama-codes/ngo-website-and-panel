import React, { useState, useEffect } from 'react';
import { Donation, User } from '../../types';
import { FileText } from 'lucide-react';
import { DarkListSkeleton } from '../../components/Skeletons';
import { getDonations } from '../../services/donationService';

interface MyDonationsTabProps {
  activeUser: User;
  onOpenDonate: () => void;
  onSelectDonationReceipt: (donation: Donation) => void;
}

export const MyDonationsTab: React.FC<MyDonationsTabProps> = ({
  activeUser,
  onOpenDonate,
  onSelectDonationReceipt,
}) => {
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">My Donation History & UTR Receipts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">View tax-deductible 80G compliant receipts for all your donations.</p>
        </div>
        <button
          onClick={onOpenDonate}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-sm cursor-pointer"
        >
          + Donate Now
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <DarkListSkeleton items={4} />
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-slate-500 dark:text-slate-500 space-y-3">
            <p className="text-sm">You haven't made any donations yet.</p>
            <button
              onClick={onOpenDonate}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 text-xs font-bold underline cursor-pointer"
            >
              Make your first donation
            </button>
          </div>
        ) : (
          donations.map((don) => (
            <div
              key={don.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${don.status === 'verified'
                    ? 'bg-emerald-100/50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : don.status === 'pending_verification'
                      ? 'bg-amber-100/50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'bg-rose-100/50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    }`}>
                    {don.status === 'verified' ? '✓ UTR Verified' : don.status === 'pending_verification' ? '⏳ Pending' : '❌ Failed'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">• {new Date(don.date).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{don.campaignTitle}</h4>
                <p className="text-slate-600 dark:text-slate-400">Community: {don.communityName} {don.utrNumber ? `• UTR No: ${don.utrNumber}` : ''}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{don.amountINR.toLocaleString('en-IN')}</span>
                <button
                  onClick={() => onSelectDonationReceipt(don)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
