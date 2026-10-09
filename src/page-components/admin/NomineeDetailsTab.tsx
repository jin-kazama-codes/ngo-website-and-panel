'use client';

import React, { useState, useEffect } from 'react';
import { User, MemberNominee } from '../../types';
import {
  getMemberNominees,
  saveMemberNominee,
  updateMemberNominee,
  deleteMemberNominee,
} from '../../services/memberService';
import { uploadImage } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';
import { NomineeCardSkeleton } from '../../components/Skeletons';
import {
  UserCheck,
  HeartHandshake,
  ShieldCheck,
  Phone,
  Calendar,
  Hash,
  MapPin,
  UploadCloud,
  Edit2,
  Trash2,
  Plus,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  FileText,
  User as UserIcon,
  Percent,
} from 'lucide-react';

interface NomineeDetailsTabProps {
  activeUser: User;
}

const RELATION_OPTIONS = [
  { value: 'Spouse', labelEn: 'Spouse (Wife / Husband)', labelHi: 'जीवनसाथी (पत्नी / पति)', labelUr: 'شریک حیات (بیوی / شوہر)' },
  { value: 'Father', labelEn: 'Father', labelHi: 'पिता', labelUr: 'والد' },
  { value: 'Mother', labelEn: 'Mother', labelHi: 'माता', labelUr: 'والدہ' },
  { value: 'Son', labelEn: 'Son', labelHi: 'पुत्र (बेटा)', labelUr: 'بیٹا' },
  { value: 'Daughter', labelEn: 'Daughter', labelHi: 'पुत्री (बेटी)', labelUr: 'بیٹی' },
  { value: 'Brother', labelEn: 'Brother', labelHi: 'भाई', labelUr: 'بھائی' },
  { value: 'Sister', labelEn: 'Sister', labelHi: 'बहन', labelUr: 'بہن' },
  { value: 'Other', labelEn: 'Other Relative / Dependent', labelHi: 'अन्य रिश्तेदार / आश्रित', labelUr: 'دیگر رشتہ دار' },
];

export const NomineeDetailsTab: React.FC<NomineeDetailsTabProps> = ({ activeUser }) => {
  const { language } = useLanguage();
  const [nominees, setNominees] = useState<MemberNominee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingNominee, setEditingNominee] = useState<MemberNominee | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [modalError, setModalError] = useState<string>('');

  // Form State
  const [nomineeName, setNomineeName] = useState('');
  const [relation, setRelation] = useState('Spouse');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [sharePercentage, setSharePercentage] = useState('100');
  const [idProofUrl, setIdProofUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      const data = await getMemberNominees(activeUser.id);
      setNominees(data);
    } catch (err: any) {
      console.error('Error loading nominee details:', err);
      showToast(err.message || 'Failed to load nominees', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeUser?.id]);

  const openAddModal = () => {
    setEditingNominee(null);
    setNomineeName('');
    setRelation('Spouse');
    setPhone('');
    setEmail('');
    setDob('');
    setAge('');
    setAadhaarNumber('');
    setAddress(activeUser.address || '');
    setSharePercentage('100');
    setIdProofUrl('');
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (nom: MemberNominee) => {
    setEditingNominee(nom);
    setNomineeName(nom.nominee_name);
    setRelation(nom.relation);
    setPhone(nom.phone);
    setEmail(nom.email || '');
    setDob(nom.date_of_birth || '');
    setAge(nom.age ? nom.age.toString() : '');
    setAadhaarNumber(nom.aadhaar_number || '');
    setAddress(nom.address || '');
    setSharePercentage(nom.share_percentage ? nom.share_percentage.toString() : '100');
    setIdProofUrl(nom.id_proof_url || '');
    setModalError('');
    setModalOpen(true);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const url = await uploadImage('nominees', file);
      setIdProofUrl(url);
      showToast(tr('दस्तावेज़ सफलतापूर्वक अपलोड हो गया', 'دستاویز کامیابی سے اپ لوڈ ہو گئی', 'Document uploaded successfully'));
    } catch {
      showToast(tr('अपलोड विफल रहा', 'اپ لوڈ ناکام ہو گیا', 'Document upload failed'), 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!nomineeName.trim()) {
      const err = tr('कृपया नॉमिनी का नाम दर्ज करें', 'براہ کرم نامزد شخص کا نام درج کریں', 'Please enter nominee name');
      setModalError(err);
      showToast(err, 'error');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      const err = tr('कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें', 'براہ کرم درست 10 ہندسوں کا موبائل نمبر درج کریں', 'Please enter valid 10-digit mobile number');
      setModalError(err);
      showToast(err, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<MemberNominee> = {
        user_id: activeUser.id,
        nominee_name: nomineeName.trim(),
        relation,
        phone: phone.trim(),
        email: email.trim(),
        date_of_birth: dob,
        age: age ? parseInt(age, 10) : undefined,
        aadhaar_number: aadhaarNumber.trim(),
        id_proof_url: idProofUrl,
        address: address.trim(),
        share_percentage: sharePercentage ? parseInt(sharePercentage, 10) : 100,
      };

      if (editingNominee) {
        await updateMemberNominee(editingNominee.id, payload);
        showToast(tr('नॉमिनी विवरण सफलतापूर्वक अपडेट किया गया', 'نامزد کی تفصیلات کامیابی سے اپ ڈیٹ ہو گئیں', 'Nominee details updated successfully'));
      } else {
        await saveMemberNominee(payload as any);
        showToast(tr('नॉमिनी सफलतापूर्वक जोड़ा गया', 'نامزد کامیابی سے شامل کیا गया', 'Nominee added successfully'));
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
      await deleteMemberNominee(deleteConfirmId);
      showToast(tr('नॉमिनी हटा दिया गया', 'نامزد ہٹا دیا گیا', 'Nominee removed successfully'));
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || tr('हटाने में विफल', 'حذف کرنے में ناکام', 'Failed to remove nominee'), 'error');
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              {tr('नियम 13 - सीधे नॉमिनी सहायता', 'قاعدہ 13 - براہ راست نامزد امداد', 'Trust Bylaw Rule 13 - Mutual Solace')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {tr('सदस्य नॉमिनी विवरण', 'ممبر نامزد تفصیلات', 'Member Nominee Details')}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {tr(
                'किसी सदस्य के असामयिक निधन की दुर्भाग्यपूर्ण स्थिति में, ट्रस्ट की पारस्परिक सहयोग राशि केवल आपके द्वारा नामित व सत्यापित नॉमिनी को सीधे बैंक खाते में प्रदान की जाती है।',
                'کسی ممبر کے ناگہانی انتقال کی صورت میں ٹرسٹ کی باہمی مالی امداد براہ راست نامزد وارث کے بینک اکاؤنٹ میں فراہم کی جاتی ہے۔',
                'In the unfortunate event of an untimely demise, the Trust mutual assistance solace is disbursed directly into the verified bank account of your designated nominee.'
              )}
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {nominees.length > 0
              ? tr('दूसरा नॉमिनी जोड़ें', 'دوسرا نامزد شامل کریں', 'Add Co-Nominee')
              : tr('नॉमिनी जोड़ें', 'نامزد شامل کریں', 'Add Nominee')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NomineeCardSkeleton />
          <NomineeCardSkeleton />
        </div>
      ) : nominees.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5 shadow-inner">
            <HeartHandshake className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            {tr('कोई नॉमिनी पंजीकृत नहीं है', 'کوئی نامزد رجسٹرڈ نہیں ہے', 'No Nominee Registered Yet')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            {tr(
              'ट्रस्ट नियमावली के अनुसार सभी सदस्यों के लिए नॉमिनी का विवरण दर्ज करना अनिवार्य है। कृपया अपने परिवार की सुरक्षा व सहायता हेतु नॉमिनी जोड़ें।',
              'ٹرسٹ کے قواعد کے مطابق تمام ممبران کے لیے نامزد کی تفصیلات درج کرنا لازمی ہے۔ براہ کرم نامزد شخص کا اندراج کریں۔',
              'In accordance with Trust guidelines, designating a verified nominee is required so mutual relief can be smoothly granted without dispute.'
            )}
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-700/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {tr('अभी नॉमिनी जोड़ें', 'ابھی نامزد شامل کریں', 'Register Nominee Now')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nominees.map((nom, index) => {
            const relObj = RELATION_OPTIONS.find((r) => r.value.toLowerCase() === nom.relation.toLowerCase());
            const displayRelation = relObj
              ? language === 'hi'
              ? relObj.labelHi
              : language === 'ur'
              ? relObj.labelUr
              : relObj.labelEn
              : nom.relation;

            return (
              <div
                key={nom.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-2xl hover:border-emerald-500/40 relative group"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-emerald-50/50 to-teal-50/20 dark:from-emerald-950/20 dark:to-transparent flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 font-black text-lg">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                          {nom.nominee_name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {index === 0 ? tr('मुख्य नॉमिनी', 'اہم نامزد', 'Primary Nominee') : tr('सह-नॉमिनी', 'شریک نامزد', 'Co-Nominee')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                        {displayRelation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(nom)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all cursor-pointer"
                      title={tr('संपादित करें', 'ترمیم کریں', 'Edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(String(nom.id))}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all cursor-pointer"
                      title={tr('हटाएं', 'حذف کریں', 'Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        {tr('फ़ोन नंबर', 'فون نمبر', 'Phone Number')}
                      </span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {nom.phone}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                        <Percent className="w-3 h-3 text-emerald-500" />
                        {tr('हिस्सेदारी', 'حصہ داری', 'Share %')}
                      </span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {nom.share_percentage || 100}%
                      </p>
                    </div>
                  </div>

                  {(nom.aadhaar_number || nom.date_of_birth || nom.age) && (
                    <div className="grid grid-cols-2 gap-3">
                      {nom.aadhaar_number && (
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                            <Hash className="w-3 h-3 text-emerald-500" />
                            {tr('आधार / पहचान संख्या', 'شناختی نمبر', 'Aadhaar / Govt ID')}
                          </span>
                          <p className="font-mono font-bold text-slate-900 dark:text-white">
                            •••• •••• {nom.aadhaar_number.slice(-4)}
                          </p>
                        </div>
                      )}

                      {(nom.date_of_birth || nom.age) && (
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3 h-3 text-emerald-500" />
                            {tr('जन्म तिथि / आयु', 'تاریخ پیدائش / عمر', 'DOB / Age')}
                          </span>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {nom.date_of_birth || `${nom.age} ${tr('वर्ष', 'سال', 'Yrs')}`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {nom.address && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {tr('पता', 'پتہ', 'Address')}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {nom.address}
                      </p>
                    </div>
                  )}

                  {nom.id_proof_url && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/30">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                        <FileText className="w-4 h-4" />
                        <span>{tr('पहचान प्रमाण पत्र संलग्न', 'شناختی ثبوت منسلک', 'ID Proof Attached')}</span>
                      </div>
                      <a
                        href={nom.id_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700"
                      >
                        {tr('देखें', 'دیکھیں', 'View Doc')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {tr('ट्रस्ट में सत्यापित व सुरक्षित', 'محفوظ اور تصدیق شدہ', 'Linked & Secured')}
                  </span>
                  <span>{new Date(nom.created_at || Date.now()).toLocaleDateString()}</span>
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
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    {editingNominee
                      ? tr('नॉमिनी विवरण संपादित करें', 'نامزد تفصیلات میں ترمیم کریں', 'Edit Nominee Details')
                      : tr('नया नॉमिनी जोड़ें', 'نیا نامزد شامل کریں', 'Register New Nominee')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tr('पारस्परिक सहायता योजना हेतु कानूनी उत्तराधिकारी', 'باہمی امدادی اسکیم کے لیے قانونی وارث', 'Designated heir for mutual assistance solace')}
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
              {/* Nominee Name */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                  {tr('नॉमिनी का पूरा नाम *', 'نامزد شخص کا مکمل نام *', 'Nominee Full Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={nomineeName}
                  onChange={(e) => {
                    setNomineeName(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  placeholder={tr('उदा. फातिमा खान', 'مثلاً فاطمہ خان', 'e.g. Fatima Khan')}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                  {tr('सदस्य के साथ रिश्ता *', 'ممبر کے ساتھ رشتہ *', 'Relationship with Member *')}
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  {RELATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {language === 'hi' ? opt.labelHi : language === 'ur' ? opt.labelUr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone & Share % */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                    {tr('नॉमिनी का मोबाइल नंबर *', 'موبائل نمبر *', 'Nominee Phone Number *')}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      if (modalError) setModalError('');
                    }}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                    {tr('हिस्सेदारी (%)', 'حصہ داری (%)', 'Share Percentage (%)')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sharePercentage}
                    onChange={(e) => setSharePercentage(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Aadhaar Number & Age / DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                    {tr('आधार / सरकारी पहचान संख्या', 'آدھار / شناختی کارڈ نمبر', 'Aadhaar / Govt ID No.')}
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456789012"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                    {tr('जन्म तिथि / आयु', 'تاریخ پیدائش یا عمر', 'Date of Birth or Age')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="flex-1 px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder={tr('आयु', 'عمر', 'Age')}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-20 px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                  {tr('नॉमिनी का पता', 'نامزد کا پتہ', 'Nominee Address')}
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={tr('मकान संख्या, गली, मोहल्ला, शहर, पिन कोड...', 'پتہ درج کریں...', 'House No, Street, Landmark, City, Pincode...')}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* ID Proof Upload */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] mb-1.5">
                  {tr('पहचान पत्र की फोटो (वैकल्पिक)', 'شناختی ثبوت की تصویر (اختیاری)', 'ID Proof Photo / Document (Optional)')}
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
                    ) : idProofUrl ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="truncate max-w-[200px]">{tr('दस्तावेज़ संलग्न है', 'دستاویز منسلک ہے', 'Document Attached')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500">
                        <UploadCloud className="w-5 h-5" />
                        <span>{tr('फ़ाइल चुनें (आधार / वोटर आईडी)', 'فائل منتخب کریں', 'Choose File (Aadhaar/Voter ID)')}</span>
                      </div>
                    )}
                  </label>
                  {idProofUrl && (
                    <a
                      href={idProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                    >
                      {tr('देखें', 'دیکھیں', 'View')}
                    </a>
                  )}
                </div>
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
                  {editingNominee
                    ? tr('अपडेट सहेजें', 'اپ ڈیٹ محفوظ کریں', 'Save Updates')
                    : tr('नॉमिनी सुरक्षित करें', 'نامزد محفوظ کریں', 'Save Nominee')}
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
              {tr('नॉमिनी हटाएं?', 'نامزد حذف کریں؟', 'Delete Nominee?')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr(
                'क्या आप वाकई इस नॉमिनी को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
                'کیا آپ واقعی اس نامزد کو ہٹانا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
                'Are you sure you want to remove this nominee? This action cannot be undone.'
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
