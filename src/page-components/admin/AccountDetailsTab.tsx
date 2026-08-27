'use client';

import React, { useState, useEffect } from 'react';
import { AccountDetails } from '../../types';
import { getAccountDetails, createAccountDetails, updateAccountDetails, deleteAccountDetails } from '../../services/adminService';
import { uploadImage } from '../../lib/storage';
import { Save, Plus, Trash2, Edit2, Loader2, Building, Hash, Code, Smartphone, QrCode, UploadCloud, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';

const AccountDetailsCard: React.FC<{
  detail: AccountDetails;
  onEdit: (details: AccountDetails) => void;
  onDelete: (id: string) => void;
}> = ({ detail, onEdit, onDelete }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayBankName = useDynamicTranslatedText(detail.bank_name, language);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col relative group transition-all hover:shadow-2xl hover:shadow-emerald-900/10">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {displayBankName}
            </h3>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {tr('आधिकारिक बैंक खाता', 'سرکاری بینک اکاؤنٹ', 'Official Bank Account')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(detail)}
            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all cursor-pointer"
            title={tr('खाता संपादित करें', 'اکاؤنٹ میں ترمیم کریں', 'Edit Account')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(detail.id)}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all cursor-pointer"
            title={tr('खाता हटाएं', 'اکاؤنٹ حذف کریں', 'Delete Account')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col sm:flex-row gap-6 relative z-10">
        <div className="flex-1 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3 h-3" /> {tr('खाता संख्या', 'اکاؤنٹ نمبر', 'Account Number')}
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-wider">
                {detail.account_number}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Code className="w-3 h-3" /> {tr('आईएफएससी कोड', 'IFSC کوڈ', 'IFSC Code')}
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-wider">
                {detail.ifsc_code}
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <Smartphone className="w-3 h-3" /> {tr('यूपीआई आईडी', 'UPI شناخت', 'UPI ID')}
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white font-mono tracking-wide">
              {detail.upi_id}
            </p>
          </div>
        </div>

        {detail.qr_code_url && (
          <div className="shrink-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl border border-slate-200 dark:border-slate-700">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white p-2 shadow-sm mb-3">
              <img src={detail.qr_code_url} alt="UPI QR Code" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <QrCode className="w-3 h-3" /> {tr('भुगतान के लिए स्कैन करें', 'ادائیگی کے لیے اسکین کریں', 'Scan to Pay')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AccountDetailsTab: React.FC = () => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [accountDetails, setAccountDetails] = useState<AccountDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  // Form State
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    setLoading(true);
    try {
      const data = await getAccountDetails();
      setAccountDetails(data);
    } catch (err) {
      console.error('Failed to fetch account details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (details: AccountDetails) => {
    setCurrentEditId(details.id);
    setBankName(details.bank_name);
    setAccountNumber(details.account_number);
    setIfscCode(details.ifsc_code);
    setUpiId(details.upi_id);
    setQrCodeUrl(details.qr_code_url || '');
    setIsEditing(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setBankName('');
    setAccountNumber('');
    setIfscCode('');
    setUpiId('');
    setQrCodeUrl('');
    setQrCodeFile(null);
    setErrorMsg('');
  };

  const handleDelete = async (id: string) => {
    const confirmText = tr(
      'क्या आप वाकई इस खाता विवरण को हटाना चाहते हैं?',
      'کیا آپ واقعی اس اکاؤنٹ کی تفصیل کو حذف کرنا چاہتے ہیں؟',
      'Are you sure you want to delete this account detail?'
    );
    if (!window.confirm(confirmText)) return;
    try {
      await deleteAccountDetails(id);
      await fetchAccountDetails();
      setSuccessMsg(tr('सफलतापूर्वक हटा दिया गया', 'کامیابی سے حذف ہو گیا', 'Deleted successfully'));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || tr('हटाने में विफल', 'حذف کرنے میں ناکام', 'Failed to delete'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !ifscCode || !upiId || (!qrCodeUrl && !qrCodeFile)) {
      setErrorMsg(
        tr(
          'कृपया सभी आवश्यक फ़ील्ड भरें और एक क्यूआर कोड अपलोड करें',
          'براہ کرم تمام مطلوبہ فیلڈز کو پُر کریں اور ایک QR کوڈ اپ لوڈ کریں',
          'Please fill out all required fields and upload a QR Code'
        )
      );
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let uploadedUrl = qrCodeUrl;
      if (qrCodeFile) {
        uploadedUrl = await uploadImage('campaigns', qrCodeFile);
      }

      if (currentEditId) {
        await updateAccountDetails({
          id: currentEditId,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          upi_id: upiId,
          qr_code_url: uploadedUrl,
        });
        setSuccessMsg(
          tr(
            'खाता विवरण सफलतापूर्वक अपडेट हो गया',
            'اکاؤنٹ کی تفصیلات کامیابی سے اپ ڈیٹ ہو گئیں',
            'Account details updated successfully'
          )
        );
      } else {
        await createAccountDetails({
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          upi_id: upiId,
          qr_code_url: uploadedUrl,
        });
        setSuccessMsg(
          tr(
            'खाता विवरण सफलतापूर्वक सुरक्षित हो गया',
            'اکاؤنٹ کی تفصیلات کامیابی سے شامل ہو گئیں',
            'Account details created successfully'
          )
        );
      }
      handleCancel();
      fetchAccountDetails();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message ||
          tr(
            'खाता विवरण सुरक्षित करने में विफल',
            'اکاؤنٹ کی تفصیلات محفوظ کرنے میں ناکام',
            'Failed to save account details'
          )
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md mb-2"></div>
            <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
          <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--mfct-dark-green)', fontFamily: 'serif' }}>
            {tr('बैंक खाता विवरण', 'بینک اکاؤنٹ کی تفصیلات', 'Bank Account Details')}
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--mfct-text-muted)' }}>
            {tr(
              'दान प्राप्त करने के लिए आधिकारिक बैंक और यूपीआई विवरण प्रबंधित करें।',
              'عطیات حاصل کرنے کے لیے سرکاری بینک اور UPI کی تفصیلات کا انتظام کریں۔',
              'Manage official bank and UPI details for receiving donations.'
            )}
          </p>
        </div>
        {!isEditing && accountDetails.length === 0 && (
          <button
            onClick={() => setIsEditing(true)}
            className="mfct-btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {tr('नया खाता जोड़ें', 'نیا اکاؤنٹ شامل کریں', 'Add New Account')}
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-bold">
          {successMsg}
        </div>
      )}

      {isEditing ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentEditId
                ? tr('खाता विवरण संपादित करें', 'اکاؤنٹ کی تفصیلات میں ترمیم کریں', 'Edit Account Details')
                : tr('खाता विवरण जोड़ें', 'اکاؤنٹ کی تفصیلات شامل کریں', 'Add Account Details')}
            </h3>
          </div>
          <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tr('बैंक का नाम *', 'بینک کا نام *', 'Bank Name *')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                    placeholder={tr('उदा. स्टेट बैंक ऑफ इंडिया', 'مثلاً اسٹیٹ بینک آف انڈیا', 'e.g. State Bank of India')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tr('खाता संख्या *', 'اکاؤنٹ نمبر *', 'Account Number *')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                    placeholder={tr('खाता संख्या दर्ज करें', 'اکاؤنٹ نمبر درج کریں', 'Enter Account Number')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tr('आईएफएससी कोड *', 'IFSC کوڈ *', 'IFSC Code *')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Code className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                    placeholder="e.g. SBIN0001234"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tr('यूपीआई आईडी *', 'UPI شناخت *', 'UPI ID *')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Smartphone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                    placeholder="e.g. ngo@okbank"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tr('क्यूआर कोड छवि *', 'QR کوڈ کی تصویر *', 'QR Code Image *')}
                </label>
                <div className="flex items-center gap-4">
                  {qrCodeUrl && !qrCodeFile ? (
                    <div className="relative w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setQrCodeUrl('')}
                        className="absolute top-0 right-0 p-1 bg-red-500/80 text-white hover:bg-red-600 rounded-bl-lg cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : qrCodeFile ? (
                    <div className="relative w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-emerald-500" />
                      <button
                        type="button"
                        onClick={() => setQrCodeFile(null)}
                        className="absolute top-0 right-0 p-1 bg-red-500/80 text-white hover:bg-red-600 rounded-bl-lg cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 dark:border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-6 h-6 mb-2 text-slate-400" />
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {qrCodeFile
                            ? qrCodeFile.name
                            : tr('क्यूआर कोड अपलोड करने के लिए क्लिक करें', 'QR کوڈ اپ لوڈ کرنے کے لیے کلک کریں', 'Click to upload QR Code')}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setQrCodeFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                disabled={saving}
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-900/20 disabled:opacity-70 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{tr('सुरक्षित हो रहा है...', 'محفوظ ہو رہا ہے...', 'Saving...')}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{tr('विवरण सुरक्षित करें', 'تفصیلات محفوظ کریں', 'Save Details')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full">
          {accountDetails.length === 0 ? (
            <div className="col-span-full p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                {tr('कोई खाता विवरण नहीं', 'کوئی اکاؤنٹ تفصیلات نہیں', 'No Account Details')}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-6 max-w-md mx-auto">
                {tr(
                  'सदस्यों को सीधे संगठन में सुरक्षित रूप से दान स्थानांतरित करने की अनुमति देने के लिए बैंक खाता और यूपीआई विवरण जोड़ें।',
                  'ممبران کو براہ راست تنظیم کو محفوظ طریقے سے عطیات منتقل کرنے کی اجازت دینے کے لیے بینک اکاؤنٹ اور UPI تفصیلات شامل کریں۔',
                  'Add bank account and UPI details to allow members to securely transfer donations directly to the organisation.'
                )}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-900/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {tr('खाता विवरण जोड़ें', 'اکاؤنٹ کی تفصیلات شامل کریں', 'Add Account Details')}
              </button>
            </div>
          ) : (
            accountDetails.map((detail) => (
              <AccountDetailsCard
                key={detail.id}
                detail={detail}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
