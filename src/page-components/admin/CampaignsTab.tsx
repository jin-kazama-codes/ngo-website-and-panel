import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign, Donation } from '../../types';
import { 
  PlusCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Flame, 
  Users, 
  HeartHandshake, 
  BadgeCheck, 
  Sparkles, 
  Heart, 
  Award, 
  RotateCcw,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { useAppState } from '../../providers/AppStateProvider';
import { updateCampaignStatus, deleteCampaign } from '../../services/campaignService';
import { getCampaignDonations } from '../../services/donationService';

import { useLanguage } from '../../context/LanguageContext';
import { translateCampaignTitle, translateCategory } from '../../lib/translateEntity';
import DynamicText from '../../components/DynamicText';

interface CampaignsTabProps {
  campaignsList: Campaign[];
  onOpenCreateCampaign: (campaign?: Campaign) => void;
}

type FilterType = 'all' | 'zakat' | 'sadqa' | 'fitrah' | 'urgent' | 'pending';

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
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedCampaignForDonors, setSelectedCampaignForDonors] = useState<Campaign | null>(null);
  const [campaignDonors, setCampaignDonors] = useState<Donation[]>([]);
  const [loadingDonors, setLoadingDonors] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCampaignForDonors?.id) {
      setLoadingDonors(true);
      getCampaignDonations(selectedCampaignForDonors.id)
        .then((data) => setCampaignDonors(data || []))
        .catch((err) => {
          console.error('Failed to load donors for campaign:', err);
          setCampaignDonors([]);
        })
        .finally(() => setLoadingDonors(false));
    } else {
      setCampaignDonors([]);
    }
  }, [selectedCampaignForDonors?.id]);

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
      }, 1200);
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(tr('हटाने में त्रुटि: ' + (err?.message || 'असफल'), 'حذف کرنے میں خرابی', 'Failed to delete campaign: ' + (err?.message || 'Error')));
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

  // Filter counts
  const counts = {
    all: campaignsList.length,
    zakat: campaignsList.filter((c) => !!c.isZakatEligible).length,
    sadqa: campaignsList.filter((c) => !!c.isSadqaEligible).length,
    fitrah: campaignsList.filter((c) => !!c.isFitrahEligible).length,
    urgent: campaignsList.filter((c) => !!c.isUrgent).length,
    pending: campaignsList.filter((c) => c.status === 'pending_approval' || c.status === 'pending').length,
  };

  const filteredCampaigns = campaignsList.filter((c) => {
    if (activeFilter === 'zakat') return !!c.isZakatEligible;
    if (activeFilter === 'sadqa') return !!c.isSadqaEligible;
    if (activeFilter === 'fitrah') return !!c.isFitrahEligible;
    if (activeFilter === 'urgent') return !!c.isUrgent;
    if (activeFilter === 'pending') return c.status === 'pending_approval' || c.status === 'pending';
    return true;
  });

  const getEmptyStateContent = () => {
    switch (activeFilter) {
      case 'zakat':
        return {
          title: tr('कोई ज़कात पात्र अभियान नहीं मिला', 'کوئی زکوٰۃ کے اہل مہم نہیں ملی', 'No Zakat-Eligible Campaigns Found'),
          desc: tr('वर्तमान में कोई ज़कात अनुपालन अभियान सक्रिय नहीं है।', 'اس وقت زکوٰۃ کی شرائط پر پورا اترنے والی کوئی مہم موجود نہیں ہے۔', 'No active campaigns currently match the Zakat compliance criteria.'),
        };
      case 'sadqa':
        return {
          title: tr('कोई सदका पात्र अभियान नहीं मिला', 'کوئی صدقہ کے اہل مہم نہیں ملی', 'No Sadqa-Eligible Campaigns Found'),
          desc: tr('वर्तमान में कोई सदका स्वीकार्य अभियान सक्रिय नहीं है।', 'اس وقت صدقہ کے اہل کوئی مہم موجود نہیں ہے۔', 'No active campaigns currently match Sadqa eligibility.'),
        };
      case 'fitrah':
        return {
          title: tr('कोई फ़ितरा पात्र अभियान नहीं मिला', 'کوئی فطرہ کے اہل مہم نہیں ملی', 'No Fitrah-Eligible Campaigns Found'),
          desc: tr('वर्तमान में कोई फ़ितरा / फ़िद्या अभियान सक्रिय नहीं है।', 'اس وقت فطرہ / فدیہ کی اہل کوئی مہم موجود نہیں ہے۔', 'No active campaigns currently match Fitrah eligibility.'),
        };
      case 'urgent':
        return {
          title: tr('कोई अति आवश्यक अभियान नहीं मिला', 'کوئی ہنگامی مہم نہیں ملی', 'No Urgent Priority Campaigns Found'),
          desc: tr('वर्तमान में कोई आपातकालीन या जीवन रक्षा अभियान सक्रिय नहीं है।', 'اس وقت کوئی ہنگامی یا فوری مدد کی مہم موجود نہیں ہے۔', 'No active urgent priority campaigns at the moment.'),
        };
      case 'pending':
        return {
          title: tr('कोई लंबित अभियान नहीं मिला', 'کوئی زیر التواء مہم نہیں ملی', 'No Pending Approval Campaigns'),
          desc: tr('सभी अभियानों की समीक्षा पूरी हो चुकी है। कोई नई अपील लंबित नहीं है।', 'تمام مہمات کا جائزہ لیا جا چکا ہے۔ کوئی نئی مہم زیر التواء نہیں ہے۔', 'All submitted campaigns have been reviewed.'),
        };
      default:
        return {
          title: tr('कोई अभियान नहीं मिला', 'کوئی مہم دستیاب نہیں ہے', 'No Campaigns Created Yet'),
          desc: tr('अभी तक कोई सामुदायिक अभियान नहीं बनाया गया है। पहला सत्यापित अभियान शुरू करने के लिए नीचे क्लिक करें।', 'ابھی تک کوئی کمیونٹی مہم نہیں بنائی گئی ہے۔ پہلی تصدیق شدہ مہم شروع کرنے کے لیے نیچے کلک کریں۔', 'No community campaigns have been registered yet. Start by creating your first verified cause.'),
        };
    }
  };

  const emptyState = getEmptyStateContent();
  const targetDeleteCamp = deleteConfirmId ? campaignsList.find((c) => c.id === deleteConfirmId) : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {tr('सामुदायिक अभियान प्रबंधक', 'کمیونٹی مہمات کا انتظام', 'Community Campaign Manager')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tr('सत्यापित सामुदायिक अभियानों की समीक्षा करें और प्रकाशित करें।', 'تصدیق شدہ کمیونٹی مہمات کا جائزہ لیں और شائع کریں۔', 'Review and publish verified community fundraising causes.')}
          </p>
        </div>
        <button
          onClick={() => onOpenCreateCampaign()}
          className="cursor-pointer px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{tr('+ नया अभियान बनाएं', '+ नई مہم شامل کریں', '+ Create New Campaign')}</span>
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* All */}
        <button
          onClick={() => setActiveFilter('all')}
          className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{tr('सभी अभियान', 'تمام مہمات', 'All Campaigns')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeFilter === 'all' ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {counts.all}
          </span>
        </button>

        {/* Zakat Eligible */}
        <button
          onClick={() => setActiveFilter('zakat')}
          className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeFilter === 'zakat'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{tr('ज़कात पात्र', 'زکوٰۃ کے اہل', 'Zakat Eligible')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeFilter === 'zakat' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
          }`}>
            {counts.zakat}
          </span>
        </button>

        {/* Sadqa Eligible */}
        <button
          onClick={() => setActiveFilter('sadqa')}
          className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeFilter === 'sadqa'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-teal-400 text-teal-400" />
          <span>{tr('सदका पात्र', 'صدقہ کے اہل', 'Sadqa Eligible')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeFilter === 'sadqa' ? 'bg-white/20 text-white' : 'bg-teal-200/80 dark:bg-teal-900 text-teal-800 dark:text-teal-200'
          }`}>
            {counts.sadqa}
          </span>
        </button>

        {/* Fitrah Eligible */}
        <button
          onClick={() => setActiveFilter('fitrah')}
          className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeFilter === 'fitrah'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          <span>{tr('फ़ितरा पात्र', 'فطرہ کے اہل', 'Fitrah Eligible')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeFilter === 'fitrah' ? 'bg-white/20 text-white' : 'bg-indigo-200/80 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
          }`}>
            {counts.fitrah}
          </span>
        </button>

        {/* Urgent */}
        <button
          onClick={() => setActiveFilter('urgent')}
          className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeFilter === 'urgent'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>{tr('अति आवश्यक', 'اہم / ہنگامی', 'Urgent')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeFilter === 'urgent' ? 'bg-white/20 text-white' : 'bg-rose-200/80 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
          }`}>
            {counts.urgent}
          </span>
        </button>

        {/* Pending Approval */}
        {counts.pending > 0 && (
          <button
            onClick={() => setActiveFilter('pending')}
            className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{tr('स्वीकृति लंबित', 'زیر التواء', 'Pending')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
            }`}>
              {counts.pending}
            </span>
          </button>
        )}
      </div>

      {/* Campaigns Grid or Multilingual Empty State */}
      {filteredCampaigns.length === 0 ? (
        <div className="py-14 px-6 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col items-center justify-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner">
            <HeartHandshake className="w-8 h-8" />
          </div>

          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {emptyState.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {emptyState.desc}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="cursor-pointer px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{tr('सभी अभियान देखें', 'تمام مہمات دیکھیں', 'View All Campaigns')}</span>
              </button>
            )}
            <button
              onClick={() => onOpenCreateCampaign()}
              className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{tr('+ नया अभियान बनाएं', '+ नई مہم بنائیں', '+ Create New Campaign')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCampaigns.map((c) => (
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
                  <div className="flex gap-1.5 items-center flex-wrap">
                    {/* Category */}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {translateCategory(c.category, language)}
                    </span>

                    {/* Zakat Badge */}
                    {c.isZakatEligible && (
                      <span className="text-[10px] font-bold tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        <span>{tr('ज़कात', 'زکوٰۃ', 'Zakat')}</span>
                      </span>
                    )}

                    {/* Sadqa Badge */}
                    {c.isSadqaEligible && (
                      <span className="text-[10px] font-bold tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 fill-teal-600 text-teal-600" />
                        <span>{tr('सदका', 'صدقہ', 'Sadqa')}</span>
                      </span>
                    )}

                    {/* Fitrah Badge */}
                    {c.isFitrahEligible && (
                      <span className="text-[10px] font-bold tracking-wider text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                        <Award className="w-2.5 h-2.5 text-indigo-600" />
                        <span>{tr('फ़ितरा', 'فطرہ', 'Fitrah')}</span>
                      </span>
                    )}

                    {/* Urgent Badge */}
                    {c.isUrgent && (
                      <span className="text-[10px] font-bold tracking-wider text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" />
                        <span>{tr('अति आवश्यक', 'اہم', 'Urgent')}</span>
                      </span>
                    )}

                    {/* Pending Approval Badge */}
                    {(c.status === 'pending_approval' || c.status === 'pending') && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{tr('स्वीकृति लंबित', 'زیر التواء', 'Pending')}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0 ml-1">
                    {c.daysLeft} {tr('दिन शेष', 'دن باقی', 'days left')}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                  <DynamicText text={c.title} lang={language} fallback={translateCampaignTitle(c.title, language)} />
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
                    onClick={() => setSelectedCampaignForDonors(c)}
                    className="cursor-pointer px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-white bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 dark:hover:bg-emerald-600 rounded-lg flex items-center gap-1 transition-colors border border-emerald-200 dark:border-emerald-800"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{tr('दानदाता सूची', 'معاونین', 'Donors')} ({c.donorsCount || 0})</span>
                  </button>
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
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] text-sm font-bold text-white transition-all transform duration-300 ease-out ${toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
          }`}>
          {toastMessage.message}
        </div>
      )}

      {/* Campaign Donors List Modal */}
      {selectedCampaignForDonors && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[88vh] flex flex-col">
            <button
              onClick={() => setSelectedCampaignForDonors(null)}
              className="cursor-pointer absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {translateCampaignTitle(selectedCampaignForDonors.title, language)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tr('दानदाता सूची एवं सत्यापन विवरण', 'معاونین اور تصدیقی ریکارڈ', 'Donors & Verification Ledger')} • {campaignDonors.length} {tr('सहयोग', 'عطیات', 'contributions')}
                </p>
              </div>
            </div>

            {/* Campaign Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs mb-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{tr('एकत्रित', 'جمع شدہ', 'Raised')}</span>
                <span className="font-extrabold text-emerald-600 text-sm">₹{(selectedCampaignForDonors.raisedINR || 0).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{tr('लक्ष्य', 'ہدف', 'Goal')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">₹{selectedCampaignForDonors.goalINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{tr('दानदाता', 'معاونین', 'Total Donors')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{campaignDonors.length || selectedCampaignForDonors.donorsCount || 0}</span>
              </div>
            </div>

            {/* Donors List Scrollable Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
              {loadingDonors ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : campaignDonors.length === 0 ? (
                <div className="text-center py-10 space-y-2 text-slate-500 dark:text-slate-400">
                  <HeartHandshake className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-sm font-medium">{tr('इस अभियान में अभी तक कोई दान दर्ज नहीं हुआ है।', 'اس مہم کے لیے ابھی کوئی عطیہ نہیں ہے۔', 'No donations recorded for this campaign yet.')}</p>
                </div>
              ) : (
                campaignDonors.map((don, idx) => {
                  const isAnonymous = !don.donorName || don.donorName.toLowerCase().includes('anonymous') || don.donorName.toLowerCase().includes('गुमनाम');
                  const displayName = isAnonymous
                    ? tr('गुमनाम दानदाता', 'گمنام معاون', 'Anonymous Supporter')
                    : don.donorName;
                  const initial = displayName.trim().charAt(0).toUpperCase();
                  const avatarUrl = !isAnonymous ? don.donorAvatar : null;

                  return (
                    <div
                      key={don.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-9 h-9 shrink-0">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-emerald-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`avatar-fallback w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}
                          >
                            {initial}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                            <span>{displayName}</span>
                            {don.status === 'verified' ? (
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">Pending</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {don.date ? new Date(don.date).toLocaleDateString() : 'N/A'}{' '}
                            {don.utrNumber ? `• UTR: ${don.utrNumber}` : ''}
                            {don.category ? ` • ${don.category}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm block">
                          ₹{don.amountINR.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block uppercase">
                          {don.paymentMethod || 'UPI'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedCampaignForDonors(null)}
                className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {tr('बंद करें', 'بند کریں', 'Close')}
              </button>
              <button
                onClick={() => {
                  const cid = selectedCampaignForDonors.id;
                  setSelectedCampaignForDonors(null);
                  router.push(`/campaigns/${cid}`);
                }}
                className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{tr('अभियान पृष्ठ पर जाएं', 'مہم کے صفحے پر جائیں', 'Open Campaign Page')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {tr('अभियान हटाएं?', 'مہم حذف کریں؟', 'Delete Campaign?')}
            </h3>

            {targetDeleteCamp && (
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 truncate">
                {translateCampaignTitle(targetDeleteCamp.title, language)}
              </p>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {targetDeleteCamp && (targetDeleteCamp.donorsCount > 0 || (targetDeleteCamp.raisedINR || 0) > 0) ? (
                <span className="text-amber-600 dark:text-amber-400 font-semibold block mb-1">
                  {tr(
                    `इस अभियान में ${targetDeleteCamp.donorsCount || 0} दान (₹${(targetDeleteCamp.raisedINR || 0).toLocaleString('en-IN')}) दर्ज हैं। इसे हटाने पर इसके सभी दान रिकॉर्ड भी हटा दिए जाएंगे।`,
                    `اس مہم میں عطیات درج ہیں۔ مہم حذف کرنے پر اس کے تمام عطیات بھی حذف کر دیے جائیں گے۔`,
                    `This campaign has ${targetDeleteCamp.donorsCount || 0} donation(s) (₹${(targetDeleteCamp.raisedINR || 0).toLocaleString('en-IN')}). Deleting this will also remove all associated donation records.`
                  )}
                </span>
              ) : null}
              {tr('यह क्रिया पूर्ववत नहीं की जा सकती। क्या आप वाकई इस अभियान को स्थायी रूप से हटाना चाहते हैं?', 'اس عمل کو واپس نہیں لیا جا سکتا۔ کیا آپ واقعی اس مہم کو مستقل طور پر حذف کرنا چاہتے ہیں؟', 'This action cannot be undone. Are you sure you want to permanently delete this campaign?')}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                disabled={processingId === deleteConfirmId}
              >
                {tr('रद्द करें', 'منسوخ', 'Cancel')}
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 active:bg-rose-800 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                disabled={processingId === deleteConfirmId}
              >
                {processingId === deleteConfirmId ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {processingId === deleteConfirmId 
                    ? tr('हटाया जा रहा है...', 'حذف کیا جا رہا ہے...', 'Deleting...') 
                    : tr('हाँ, हटाएं', 'ہاں، حذف کریں', 'Yes, Delete')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
