import React, { useState, useEffect, useRef } from 'react';
import { Donation, User } from '../../types';
import { FileText, Pencil, X, Upload, AlertCircle, IndianRupee, Image as ImageIcon } from 'lucide-react';
import { DarkListSkeleton } from '../../components/Skeletons';
import { getDonations, updateDonation } from '../../services/donationService';
import { uploadImage } from '../../lib/storage';
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
  onEditDonation: (donation: Donation) => void;
}> = ({ don, onSelectDonationReceipt, onEditDonation }) => {
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
        {don.status === 'verified' ? (
          <button
            onClick={() => onSelectDonationReceipt(don)}
            className="px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>{tr('रसीद', 'رسید', 'Receipt')}</span>
          </button>
        ) : (
          <button
            onClick={() => onEditDonation(don)}
            className="px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60"
            title={tr('दान विवरण संपादित करें', 'تفصیلات تبدیل کریں', 'Edit Donation Details')}
          >
            <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{tr('संपादित करें', 'تبدیل کریں', 'Edit')}</span>
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
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Edit Donation Modal state
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editDonorName, setEditDonorName] = useState('');
  const [editUtrNumber, setEditUtrNumber] = useState('');
  const [editScreenshotFile, setEditScreenshotFile] = useState<File | null>(null);
  const [editScreenshotPreview, setEditScreenshotPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  const handleOpenEdit = (don: Donation) => {
    setEditingDonation(don);
    setEditDonorName(don.donorName || '');
    setEditUtrNumber(don.utrNumber || '');
    setEditScreenshotFile(null);
    setEditScreenshotPreview(don.paymentScreenshotUrl || '');
  };

  const handleCloseEdit = () => {
    setEditingDonation(null);
    setEditDonorName('');
    setEditUtrNumber('');
    setEditScreenshotFile(null);
    setEditScreenshotPreview('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonation) return;

    if (!editDonorName.trim()) {
      showToast(tr('कृपया अपना पूरा नाम दर्ज करें।', 'براہ کرم اپنا پورا نام درج کریں۔', 'Please enter your full name.'));
      return;
    }

    if (!editUtrNumber.trim()) {
      showToast(tr('कृपया बैंक UTR / संदर्भ संख्या दर्ज करें।', 'براہ کرم بینک UTR / ٹرانزیکشن نمبر درج کریں۔', 'Please enter Bank UTR / Transaction Ref No.'));
      return;
    }

    if (!editScreenshotFile && !editScreenshotPreview) {
      showToast(tr('कृपया भुगतान स्क्रीनशॉट अपलोड करें।', 'براہ کرم ادائیگی کی رسید اپلوڈ کریں۔', 'Please upload payment screenshot.'));
      return;
    }

    setSubmitting(true);
    try {
      let finalScreenshotUrl = editingDonation.paymentScreenshotUrl;
      if (editScreenshotFile) {
        finalScreenshotUrl = await uploadImage('donations', editScreenshotFile);
      }

      const updated = await updateDonation(editingDonation.id, {
        donorName: editDonorName.trim(),
        utrNumber: editUtrNumber.trim(),
        paymentScreenshotUrl: finalScreenshotUrl,
        status: 'pending_verification',
        rejectionReason: '',
        rejection_reason: '',
      });

      setDonations((prev) =>
        prev.map((d) => (d.id === editingDonation.id ? { ...d, ...updated, status: 'pending_verification', rejectionReason: undefined, rejection_reason: undefined } : d))
      );

      handleCloseEdit();
      showToast(
        tr(
          'दान विवरण सफलतापूर्वक अपडेट किया गया और पुन: सत्यापन हेतु भेजा गया!',
          'عطیہ کی تفصیلات اپ ڈیٹ کر کے دوبارہ تصدیق کے لیے بھیج دی گئیں!',
          'Donation details updated and resubmitted for verification!'
        ),
        'success'
      );
    } catch (err: any) {
      console.error('Failed to update donation:', err);
      showToast(
        tr('दान विवरण अपडेट करने में विफल। पुनः प्रयास करें।', 'اپ ڈیٹ کرنے میں ناکامی۔', 'Failed to update donation. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 space-y-6 transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg z-[100] text-xs font-bold text-white transition-all transform duration-300 ease-out ${toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'
            }`}
        >
          {toastMessage.message}
        </div>
      )}

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
                'अपने सभी दानों के लिए सत्यापित रसीदें देखें एवं लंबित विवरण संपादित करें।',
                'اپنے تمام عطیات کے ریکارڈ دیکھیں۔',
                'View verified receipts and manage your donation submissions.'
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
              onEditDonation={handleOpenEdit}
            />
          ))
        )}
      </div>

      {/* Edit Donation Modal (For Pending and Rejected Donations) */}
      {editingDonation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
          <div
            className="rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <button
              onClick={handleCloseEdit}
              className="cursor-pointer absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {editingDonation.status === 'rejected'
                    ? tr('अस्वीकृत विवरण सुधारें', 'مسترد شدہ تفصیلات درست کریں', 'Correct Rejected Submission')
                    : tr('दान विवरण संपादित करें', 'عطیہ تفصیلات تبدیل کریں', 'Edit Donation Details')}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {tr('भुगतान विवरण संपादित करें', 'ادائیگی کی تفصیلات تبدیل کریں', 'Edit Payment Details')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {tr(
                  'विवरण अपडेट करें और व्यवस्थापक के पास पुन: सत्यापन के लिए भेजें।',
                  'تفصیلات درست کریں اور دوبارہ تصدیق کے لیے بھیجیں۔',
                  'Update details and resubmit for administrator verification.'
                )}
              </p>
            </div>

            {/* Rejection Notice Banner (if rejected) */}
            {editingDonation.status === 'rejected' && (editingDonation.rejectionReason || editingDonation.rejection_reason) && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400 mb-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{tr('व्यवस्थापक द्वारा अस्वीकृति का कारण:', 'مسترد کرنے کی وجہ:', 'Rejection Reason from Admin:')}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-medium pl-5">
                  {editingDonation.rejectionReason || editingDonation.rejection_reason}
                </p>
              </div>
            )}

            {/* Summary Info Card */}
            <div className="p-4 rounded-2xl mb-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">{tr('अभियान:', 'مہم:', 'Campaign:')}</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[240px] block">
                  {editingDonation.campaignTitle}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">{tr('दान राशि:', 'رقم:', 'Amount:')}</span>
                <span className="font-bold text-base font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{editingDonation.amountINR.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  {tr('आपका पूरा नाम', 'آپ کا پورا نام', 'Your Full Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editDonorName}
                  onChange={(e) => setEditDonorName(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm font-medium outline-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  {tr('12 अंकों का बैंक UTR / संदर्भ संख्या', '12 ہندسوں کا بینک UTR / ٹرانزیکشن نمبر', '12-Digit Bank UTR / Transaction Ref No')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUtrNumber}
                  onChange={(e) => setEditUtrNumber(e.target.value)}
                  placeholder={tr('उदा. 420199381029', 'مثال: 420199381029', 'e.g. 420199381029')}
                  className="w-full p-3 rounded-xl font-mono text-sm font-semibold outline-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  {tr('भुगतान स्क्रीनशॉट', 'ادائیگی کی رسید', 'Payment Screenshot')} <span className="text-red-500">*</span>
                </label>

                {/* Existing Preview or Newly Selected */}
                {editScreenshotPreview && (
                  <div className="mb-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs truncate font-medium text-slate-700 dark:text-slate-200">
                        {editScreenshotFile?.name || tr('वर्तमान स्क्रीनशॉट संलग्न है', 'موجودہ رسید منسلک ہے', 'Current Screenshot Attached')}
                      </span>
                    </div>
                    {editScreenshotPreview.startsWith('http') && (
                      <a
                        href={editScreenshotPreview}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-500 hover:underline shrink-0 ml-2"
                      >
                        {tr('देखें', 'دیکھیں', 'View')}
                      </a>
                    )}
                  </div>
                )}

                <label
                  className="p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 hover:border-amber-500"
                >
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditScreenshotFile(file);
                        setEditScreenshotPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <Upload className="w-5 h-5 mb-1 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {editScreenshotFile
                      ? `✓ ${editScreenshotFile.name}`
                      : tr('नया भुगतान स्क्रीनशॉट चुनें / बदलें', 'نئی رسید اپلوڈ کریں', 'Click to replace payment screenshot')}
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="cursor-pointer py-3.5 px-5 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mfct-btn-gold cursor-pointer flex-1 py-3.5 rounded-2xl disabled:opacity-60 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    tr('अपडेट करें और पुन: सत्यापन हेतु भेजें', 'اپ ڈیٹ کریں اور تصدیق کے لیے بھیجیں', 'Update & Resubmit for Verification')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
