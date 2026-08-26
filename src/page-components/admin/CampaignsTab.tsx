import React from 'react';
import { useRouter } from 'next/navigation';
import { Campaign } from '../../types';
import { PlusCircle, Eye, Edit, Trash2, Check, X, Clock, Flame } from 'lucide-react';
import { useAppState } from '../../providers/AppStateProvider';
import { updateCampaignStatus, deleteCampaign } from '../../services/campaignService';

import { useLanguage } from '../../context/LanguageContext';
import { translateCampaignTitle, translateCategory } from '../../lib/translateEntity';

interface CampaignsTabProps {
  campaignsList: Campaign[];
  onOpenCreateCampaign: (campaign?: Campaign) => void;
}

export const CampaignsTab: React.FC<CampaignsTabProps> = ({
  campaignsList,
  onOpenCreateCampaign,
}) => {
  const { currentRole, handleCampaignUpdated } = useAppState();
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const router = useRouter();
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const confirmDelete = async (id: string) => {
    try {
      setProcessingId(id);
      await deleteCampaign(id);
      showToast(tr('अभियान सफलतापूर्वक हटा दिया गया', 'مہم کامیابی سے حذف کر دی گئی', 'Campaign deleted successfully.'), 'success');
      setDeleteConfirmId(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(tr('हटाने में त्रुटि', 'حذف کرنے میں خرابی', 'Failed to delete campaign.'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleAction = async (id: string, isApprove: boolean) => {
    try {
      setProcessingId(id);
      const newStatus = isApprove ? 'active' : 'rejected';
      const isVerified = isApprove;
      const updated = await updateCampaignStatus(id, newStatus, isVerified);
      handleCampaignUpdated(updated);
      showToast(
        isApprove
          ? tr('अभियान स्वीकृत कर दिया गया', 'مہم منظور کر لی گئی', 'Campaign approved successfully')
          : tr('अभियान अस्वीकृत कर दिया गया', 'مہم مسترد کر دی گئی', 'Campaign rejected successfully'),
        'success'
      );
    } catch (err) {
      console.error('Failed to update campaign:', err);
      showToast(tr('स्थिति अपडेट करने में त्रुटि', 'اسٹیٹس اپ ڈیٹ میں خرابی', 'Failed to update campaign status.'));
    } finally {
      setProcessingId(null);
    }
  };

  const isAdmin = currentRole === 'super_admin' || currentRole === 'executive_admin';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {tr('सामुदायिक अभियान प्रबंधक', 'کمیونٹی مہمات کا انتظام', 'Community Campaign Manager')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tr('सत्यापित सामुदायिक अभियानों की समीक्षा करें और प्रकाशित करें।', 'تصدیق شدہ کمیونٹی مہمات کا جائزہ لیں اور شائع کریں۔', 'Review and publish verified community fundraising causes.')}
          </p>
        </div>
        <button
          onClick={() => onOpenCreateCampaign()}
          className="cursor-pointer px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{tr('+ नया अभियान बनाएं', '+ نئی مہم شامل کریں', '+ Create New Campaign')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaignsList.map((c) => (
          <div key={c.id} className="p-0 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm">
            {c.mainImage && (
              <div className="w-full h-40 overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                <img
                  src={c.mainImage}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=60' }}
                  alt={c.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 absolute inset-0"
                />
              </div>
            )}
            <div className="p-4 space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {translateCategory(c.category, language)}
                  </span>
                  {(c.status === 'pending_approval' || c.status === 'pending') && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{tr('स्वीकृति लंबित', 'زیر التواء', 'Pending')}</span>
                    </span>
                  )}
                  {c.isUrgent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>{tr('अति आवश्यक', 'اہم', 'Urgent')}</span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {c.daysLeft} {tr('दिन शेष', 'دن باقی', 'days left')}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                {translateCampaignTitle(c.title, language)}
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{tr('एकत्रित:', 'جمع شدہ:', 'Raised:')} ₹{(c.raisedINR || 0).toLocaleString('en-IN')}</span>
                  <span>{tr('लक्ष्य:', 'ہدف:', 'Goal:')} ₹{c.goalINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (c.raisedINR / c.goalINR) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-3 mt-auto border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
                {isAdmin && (c.status === 'pending_approval' || c.status === 'pending') && (
                  <>
                    <button
                      onClick={() => handleAction(c.id, true)}
                      disabled={processingId === c.id}
                      className="cursor-pointer px-3 py-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-white dark:hover:text-white bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-500 dark:hover:bg-emerald-500/20 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 border border-emerald-200 dark:border-transparent"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{tr('स्वीकार करें', 'منظور کریں', 'Approve')}</span>
                    </button>
                    <button
                      onClick={() => handleAction(c.id, false)}
                      disabled={processingId === c.id}
                      className="cursor-pointer px-3 py-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-white bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 dark:hover:bg-rose-500/20 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 border border-rose-200 dark:border-transparent"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{tr('अस्वीकार करें', 'مسترد کریں', 'Reject')}</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => router.push(`/campaigns/${c.id}`)}
                  className="cursor-pointer px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{tr('विवरण देखें', 'تفصیلات دیکھیں', 'View Details')}</span>
                </button>
                <button
                  onClick={() => onOpenCreateCampaign(c)}
                  className="cursor-pointer px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{tr('संपादित करें', 'ترمیم', 'Edit')}</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(c.id)}
                  disabled={processingId === c.id}
                  className="cursor-pointer px-3 py-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{tr('हटाएं', 'حذف کریں', 'Delete')}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] text-sm font-bold text-white transition-all transform duration-300 ease-out ${toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
          }`}>
          {toastMessage.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl dark:shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Campaign?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This action cannot be undone. Are you sure you want to permanently delete this campaign?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                disabled={processingId === deleteConfirmId}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                disabled={processingId === deleteConfirmId}
              >
                {processingId === deleteConfirmId ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
