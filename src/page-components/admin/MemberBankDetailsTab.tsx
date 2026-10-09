'use client';

import React, { useState, useEffect } from 'react';
import { User, MemberBankDetails } from '../../types';
import {
  getMemberBankDetails,
  saveMemberBankDetails,
  updateMemberBankDetails,
  deleteMemberBankDetails,
} from '../../services/memberService';
import { uploadImage } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';
import { MemberBankCardSkeleton } from '../../components/Skeletons';
import {
  Building,
  CreditCard,
  Hash,
  Code,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  UploadCloud,
  X,
  FileText,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

interface MemberBankDetailsTabProps {
  activeUser: User;
}

const COMMON_BANKS = [
  'State Bank of India (SBI)',
  'Punjab National Bank (PNB)',
  'Bank of Baroda (BOB)',
  'Canara Bank',
  'Union Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Central Bank of India',
  'Indian Bank',
  'UCO Bank',
  'Paytm Payments Bank',
  'Airtel Payments Bank',
  'India Post Payments Bank (IPPB)',
  'Other / Regional Rural Bank',
];

export const MemberBankDetailsTab: React.FC<MemberBankDetailsTabProps> = ({ activeUser }) => {
  const { language } = useLanguage();
  const [bankAccounts, setBankAccounts] = useState<MemberBankDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<MemberBankDetails | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [modalError, setModalError] = useState<string>('');

  // Form states
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState<'Savings' | 'Current'>('Savings');
  const [upiId, setUpiId] = useState('');
  const [passbookUrl, setPassbookUrl] = useState('');
  const [isPrimary, setIsPrimary] = useState<boolean>(true);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // UI state for showing/hiding account numbers
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    if (!activeUser?.id) return;
    setLoading(true);
    try {
      const data = await getMemberBankDetails(activeUser.id);
      setBankAccounts(data);
    } catch (err: any) {
      console.error('Error loading member bank details:', err);
      showToast(err.message || 'Failed to load bank accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeUser?.id]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openAddModal = () => {
    setEditingAccount(null);
    setAccountHolderName(activeUser.name || '');
    setBankName('');
    setAccountNumber('');
    setConfirmAccountNumber('');
    setIfscCode('');
    setBranchName('');
    setAccountType('Savings');
    setUpiId('');
    setPassbookUrl('');
    setIsPrimary(bankAccounts.length === 0);
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (acc: MemberBankDetails) => {
    setEditingAccount(acc);
    setAccountHolderName(acc.account_holder_name);
    setBankName(acc.bank_name);
    setAccountNumber(acc.account_number);
    setConfirmAccountNumber(acc.account_number);
    setIfscCode(acc.ifsc_code);
    setBranchName(acc.branch_name || '');
    setAccountType(acc.account_type || 'Savings');
    setUpiId(acc.upi_id || '');
    setPassbookUrl(acc.passbook_or_cheque_url || '');
    setIsPrimary(Boolean(acc.is_primary));
    setModalError('');
    setModalOpen(true);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const url = await uploadImage('member_bank_passbooks', file);
      setPassbookUrl(url);
      showToast(tr('पासबुक / चेक सफलतापूर्वक अपलोड हुआ', 'پاس بک / چیک کامیابی سے اپ لوڈ ہو گیا', 'Passbook / Cheque uploaded successfully'));
    } catch {
      showToast(tr('दस्तावेज़ अपलोड विफल', 'دستاویز اپ لوڈ ناکام ہو گئی', 'Upload failed'), 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!accountHolderName.trim()) {
      const err = tr('कृपया खाताधारक का नाम दर्ज करें', 'براہ کرم اکاؤنٹ ہولڈر کا نام درج کریں', 'Please enter account holder name');
      setModalError(err);
      showToast(err, 'error');
      return;
    }
    if (!bankName.trim()) {
      const err = tr('कृपया बैंक का नाम चुनें या दर्ज करें', 'براہ کرم بینک کا نام درج کریں', 'Please select or enter bank name');
      setModalError(err);
      showToast(err, 'error');
      return;
    }
    if (!accountNumber.trim()) {
      const err = tr('कृपया बैंक खाता संख्या दर्ज करें', 'براہ کرم اکاؤنٹ نمبر درج کریں', 'Please enter account number');
      setModalError(err);
      showToast(err, 'error');
      return;
    }
    if (!editingAccount && accountNumber.trim() !== confirmAccountNumber.trim()) {
      const err = tr('खाता संख्या मेल नहीं खाती है', 'اکاؤنٹ نمبر مماثل نہیں ہے', 'Account numbers do not match');
      setModalError(err);
      showToast(err, 'error');
      return;
    }
    if (!ifscCode.trim() || ifscCode.trim().length !== 11) {
      const err = tr('कृपया मान्य 11-अक्षरों का आईएफएससी कोड दर्ज करें', 'براہ کرم درست 11 ہندسوں کا IFSC کوڈ درج کریں', 'Please enter valid 11-character IFSC code');
      setModalError(err);
      showToast(err, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<MemberBankDetails> = {
        user_id: activeUser.id,
        account_holder_name: accountHolderName.trim(),
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifscCode.trim().toUpperCase(),
        branch_name: branchName.trim(),
        account_type: accountType,
        upi_id: upiId.trim(),
        passbook_or_cheque_url: passbookUrl,
        is_primary: isPrimary,
      };

      if (editingAccount) {
        await updateMemberBankDetails(editingAccount.id, payload);
        showToast(tr('बैंक खाता विवरण अपडेट किया गया', 'بینک اکاؤنٹ کی تفصیلات اپ ڈیٹ ہو گئیں', 'Bank details updated successfully'));
      } else {
        await saveMemberBankDetails(payload as any);
        showToast(tr('बैंक खाता सफलतापूर्वक जोड़ा गया', 'بینک اکاؤنٹ کامیابی سے شامل کیا گیا', 'Bank account saved successfully'));
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      const errMsg = err.message || tr('कार्रवाई विफल रही', 'کارروائی ناکام ہو گئی', 'Action failed');
      setModalError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeletingId(deleteConfirmId);
    try {
      await deleteMemberBankDetails(deleteConfirmId);
      showToast(tr('बैंक खाता हटा दिया गया', 'بینک اکاؤنٹ حذف کر دیا گیا', 'Bank account removed'));
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification - Centered at top with highest z-index so it is clearly visible everywhere */}
      {toastMsg && (
        <div
          className={`fixed top-8 left-1/2 -translate-x-1/2 z-[9999] min-w-[320px] max-w-lg px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3.5 border text-sm font-bold animate-in fade-in zoom-in-95 backdrop-blur-md ${
            toastMsg.type === 'success'
              ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-950/40'
              : 'bg-rose-600/95 text-white border-rose-400 shadow-rose-950/40'
          }`}
        >
          <div className="flex items-center gap-3">
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="leading-snug">{toastMsg.text}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              {tr('निजी सदस्य वॉल्ट (अलग तालिका)', 'نجی ممبر والٹ', 'Private Member Vault - Independent Storage')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {tr('मेरा बैंक खाता विवरण', 'میری بینک تفصیلات', 'My Bank Account Details')}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {tr(
                'यह आपका निजी बैंक खाता विवरण है। किसी भी प्रकार की सहायता राशि या रिफंड के अंतरण के लिए ट्रस्ट केवल आपके इस अधिकृत बैंक खाते का उपयोग करता है। यह ट्रस्ट के आधिकारिक खातों से पूर्णतः अलग व गोपनीय है।',
                'یہ آپ کی ذاتی بینک تفصیلات ہیں۔ کسی بھی امدادی رقم یا ریفنڈ کی منتقلی کے لیے ٹرسٹ صرف آپ کے اس بینک اکاؤنٹ کا استعمال کرتا ہے۔',
                'This is your personal bank account. The Trust uses this verified account exclusively for disbursing mutual assistance relief or processing refunds. This data is kept strictly isolated from the Trust donation account.'
              )}
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {tr('बैंक खाता जोड़ें', 'بینک اکاؤنٹ شامل کریں', 'Add Bank Account')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MemberBankCardSkeleton />
          <MemberBankCardSkeleton />
        </div>
      ) : bankAccounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-inner">
            <Building className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            {tr('कोई बैंक खाता नहीं जोड़ा गया है', 'کوئی بینک اکاؤنٹ شامل نہیں کیا گیا', 'No Bank Account Saved Yet')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            {tr(
              'सहायता वितरण एवं सत्यापन के लिए कृपया अपना सक्रिय बचत या चालू बैंक खाता विवरण सुरक्षित रूप से जोड़ें।',
              'امدادی ادائیگیوں اور تصدیق کے لیے براہ کرم اپنا فعال بینک اکاؤنٹ محفوظ طریقے سے شامل کریں۔',
              'Please add your active bank account details to ensure prompt verification and direct electronic transfers whenever mutual aid is granted.'
            )}
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-700/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {tr('अभी बैंक खाता जोड़ें', 'ابھی بینک اکاؤنٹ شامل کریں', 'Add Bank Account Now')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bankAccounts.map((acc) => {
            const isRevealed = Boolean(revealedIds[acc.id]);
            const maskedAcc = isRevealed
              ? acc.account_number
              : `•••• •••• •••• ${acc.account_number.slice(-4)}`;

            return (
              <div
                key={acc.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-2xl hover:border-emerald-500/40 relative group"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-emerald-50/50 to-teal-50/20 dark:from-emerald-950/20 dark:to-transparent flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {acc.bank_name}
                        </h4>
                        {acc.is_primary && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {tr('प्राथमिक खाता', 'بنیادی اکاؤنٹ', 'Primary')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        {acc.account_holder_name} ({acc.account_type || 'Savings'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(acc)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all cursor-pointer"
                      title={tr('संपादित करें', 'ترمیم کریں', 'Edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(String(acc.id))}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all cursor-pointer"
                      title={tr('हटाएं', 'حذف کریں', 'Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-4 text-xs">
                  {/* Account Number with Reveal & Copy */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                        <CreditCard className="w-3 h-3 text-emerald-500" />
                        {tr('खाता संख्या', 'اکاؤنٹ نمبر', 'Account Number')}
                      </span>
                      <p className="font-mono font-black text-slate-900 dark:text-white text-base tracking-wider">
                        {maskedAcc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleReveal(acc.id)}
                        className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                        title={isRevealed ? 'Hide' : 'Reveal'}
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(acc.account_number, acc.id)}
                        className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        title="Copy Account Number"
                      >
                        {copiedId === acc.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* IFSC & Branch */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                        <Code className="w-3 h-3 text-emerald-500" />
                        {tr('आईएफएससी कोड', 'IFSC کوڈ', 'IFSC Code')}
                      </span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {acc.ifsc_code}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                        <Building className="w-3 h-3 text-emerald-500" />
                        {tr('शाखा', 'برانچ', 'Branch')}
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {acc.branch_name || tr('लागू नहीं', 'غیر متعین', 'N/A')}
                      </p>
                    </div>
                  </div>

                  {/* UPI ID if present */}
                  {acc.upi_id && (
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-0.5">
                          <Smartphone className="w-3 h-3" />
                          {tr('यूपीआई आईडी (वैकल्पिक)', 'UPI آئی ڈی', 'UPI ID')}
                        </span>
                        <p className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                          {acc.upi_id}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(acc.upi_id!, `upi-${acc.id}`)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        {copiedId === `upi-${acc.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Passbook Document link */}
                  {acc.passbook_or_cheque_url && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <span>{tr('पासबुक / रद्द चेक प्रति संलग्न', 'چیک یا پاس بک منسلک', 'Passbook / Cheque Copy Attached')}</span>
                      </div>
                      <a
                        href={acc.passbook_or_cheque_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700"
                      >
                        {tr('देखें', 'دیکھیں', 'View')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {tr('सत्यापित व सुरक्षित बैंक रिकॉर्ड', 'محفوظ بینک ریکارڈ', 'Secured Bank Record')}
                  </span>
                  <span>{new Date(acc.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl my-8 animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    {editingAccount
                      ? tr('बैंक खाता विवरण संपादित करें', 'بینک اکاؤنٹ کی تفصیلات تبدیل کریں', 'Edit Bank Account')
                      : tr('नया बैंक खाता जोड़ें', 'نیا بینک اکاؤنٹ شامل کریں', 'Add Bank Account')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tr('पारस्परिक सहायता राशि सीधे अंतरण हेतु', 'براہ راست باہمی امداد کی منتقلی کے لیے', 'For direct transfer of mutual solace funds')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Modal Feedback Banner */}
            {modalError && (
              <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="flex-1">{modalError}</span>
                <button
                  type="button"
                  onClick={() => setModalError('')}
                  className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Account Holder Name */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                  {tr('खाताधारक का नाम * (बैंक रिकॉर्ड अनुसार)', 'اکاؤنٹ ہولڈر کا نام *', 'Account Holder Name * (as per bank passbook)')}
                </label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => {
                    setAccountHolderName(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  placeholder={tr('उदा. मोहम्मद इमरान', 'مثلاً محمد عمران', 'e.g. Mohd Imran')}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                  {tr('बैंक का नाम *', 'بینک کا نام *', 'Bank Name *')}
                </label>
                <input
                  type="text"
                  required
                  list="common-banks-list"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  placeholder={tr('बैंक चुनें या टाइप करें', 'بینک کا نام منتخب یا ٹائپ کریں', 'Select or type Bank Name')}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <datalist id="common-banks-list">
                  {COMMON_BANKS.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>

              {/* Account Number & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                    {tr('खाता संख्या *', 'اکاؤنٹ نمبر *', 'Account Number *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value.replace(/\D/g, ''));
                      if (modalError) setModalError('');
                    }}
                    placeholder="123456789012"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {!editingAccount && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                      {tr('खाता संख्या दोबारा दर्ज करें *', 'اکاؤنٹ نمبر کی تصدیق کریں *', 'Confirm Account Number *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmAccountNumber}
                      onChange={(e) => {
                        setConfirmAccountNumber(e.target.value.replace(/\D/g, ''));
                        if (modalError) setModalError('');
                      }}
                      placeholder="123456789012"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* IFSC & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                    {tr('आईएफएससी कोड (11 अक्षर) *', 'IFSC کوڈ (11 ہندسے) *', 'IFSC Code (11 alphanumeric) *')}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={ifscCode}
                    onChange={(e) => {
                      setIfscCode(e.target.value.toUpperCase());
                      if (modalError) setModalError('');
                    }}
                    placeholder="SBIN0001234"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-medium uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                    {tr('शाखा का नाम', 'برانچ کا نام', 'Branch Name')}
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder={tr('उदा. सिविल लाइन्स', 'مثلاً سول لائنز', 'e.g. Civil Lines')}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Account Type & UPI ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                    {tr('खाते का प्रकार', 'اکاؤنٹ کی قسم', 'Account Type')}
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Savings">{tr('बचत खाता (Savings)', 'بچت اکاؤنٹ', 'Savings Account')}</option>
                    <option value="Current">{tr('चालू खाता (Current)', 'کرنٹ اکاؤنٹ', 'Current Account')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                    {tr('यूपीआई आईडी (वैकल्पिक)', 'UPI آئی ڈی (اختیاری)', 'UPI ID (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                    placeholder="user@okhdfcbank"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Passbook / Cancelled Cheque upload */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                  {tr('पासबुक / चेक की प्रति (वैकल्पिक)', 'پاس بک یا چیک کی کاپی (اختیاری)', 'Passbook / Cancelled Cheque Copy (Optional)')}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-950">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDocUpload}
                      className="hidden"
                      disabled={uploadingDoc}
                    />
                    {uploadingDoc ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{tr('अपलोड हो रहा है...', 'اپ لوڈ ہو رہا ہے...', 'Uploading...')}</span>
                      </div>
                    ) : passbookUrl ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="truncate max-w-[200px]">{tr('दस्तावेज़ संलग्न है', 'دستاویز منسلک ہے', 'Document Attached')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500">
                        <UploadCloud className="w-5 h-5" />
                        <span>{tr('पासबुक / चेक फोटो चुनें', 'تصویر منتخب کریں', 'Upload Passbook or Cheque')}</span>
                      </div>
                    )}
                  </label>
                  {passbookUrl && (
                    <a
                      href={passbookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                    >
                      {tr('देखें', 'دیکھیں', 'View')}
                    </a>
                  )}
                </div>
              </div>

              {/* Primary account checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="primary-acc-check"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="primary-acc-check" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  {tr('इस खाते को प्राथमिक भुगतान खाता बनाएं', 'اس اکاؤنٹ کو بنیادی ادائیگی اکاؤنٹ بنائیں', 'Set as primary account for trust aid disbursements')}
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingAccount
                    ? tr('खाता अपडेट करें', 'اکاؤنٹ اپ ڈیٹ کریں', 'Update Account')
                    : tr('खाता सहेजें', 'اکاؤنٹ محفوظ کریں', 'Save Bank Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl">
              {tr('बैंक खाता हटाएं?', 'بینک اکاؤنٹ حذف کریں؟', 'Delete Bank Account?')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr(
                'क्या आप वाकई इस बैंक खाते को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
                'کیا آپ واقعی اس بینک اکاؤنٹ کو ہٹانا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
                'Are you sure you want to delete this bank account? This action cannot be undone.'
              )}
            </p>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3 rounded-2xl">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="cursor-pointer px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                disabled={deletingId !== null}
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="cursor-pointer px-6 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === deleteConfirmId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{tr('हटाया जा रहा है...', 'حذف ہو رہا ہے...', 'Deleting...')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{tr('हाँ, हटाएं', 'ہاں، حذف کریں', 'Yes, Delete')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
