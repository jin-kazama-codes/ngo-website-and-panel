'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User, MemberNominee } from '../../types';
import {
  getMemberNominees,
  saveMemberNominee,
  updateMemberNominee,
  deleteMemberNominee,
} from '../../services/memberService';
import { getUsers } from '../../services/userService';
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
  Search,
  Users,
  Camera,
  Eye,
  ExternalLink,
  CreditCard,
  Check,
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

  const isSuperOrExecutive =
    activeUser?.role === 'super_admin' ||
    activeUser?.role === 'executive_admin';

  const [nominees, setNominees] = useState<MemberNominee[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewScope, setViewScope] = useState<'all' | 'mine'>(isSuperOrExecutive ? 'all' : 'mine');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [relationFilter, setRelationFilter] = useState<string>('all');

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingNominee, setEditingNominee] = useState<MemberNominee | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [modalError, setModalError] = useState<string>('');

  // Form State
  const [targetUserId, setTargetUserId] = useState<string>(activeUser?.id || '');
  const [nomineeName, setNomineeName] = useState('');
  const [relation, setRelation] = useState('Spouse');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [sharePercentage, setSharePercentage] = useState('100');

  // Document & Photo States
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState('');
  const [uploadingAadhaarFront, setUploadingAadhaarFront] = useState(false);
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState('');
  const [uploadingAadhaarBack, setUploadingAadhaarBack] = useState(false);

  // Lightbox / Image Preview Modal
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

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

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    usersList.forEach((u) => {
      if (u.id) map.set(u.id, u);
    });
    return map;
  }, [usersList]);

  const loadData = async () => {
    if (!activeUser?.id) return;
    setLoading(true);
    try {
      if (isSuperOrExecutive) {
        const [nomData, usrData] = await Promise.all([
          getMemberNominees(),
          getUsers().catch(() => []),
        ]);
        setNominees(nomData || []);
        setUsersList(usrData || []);
      } else {
        const nomData = await getMemberNominees(activeUser.id);
        setNominees(nomData || []);
      }
    } catch (err: any) {
      console.error('Error loading nominee details:', err);
      showToast(err.message || 'Failed to load nominees', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeUser?.id, isSuperOrExecutive]);

  const openAddModal = () => {
    if (isSuperOrExecutive) return;
    setEditingNominee(null);
    setTargetUserId(activeUser?.id || '');
    setNomineeName('');
    setRelation('Spouse');
    setPhone('');
    setEmail('');
    setDob('');
    setAge('');
    setAadhaarNumber('');
    setAddress(activeUser?.address || activeUser?.city || '');
    setSharePercentage('100');
    setPhotoUrl('');
    setAadhaarFrontUrl('');
    setAadhaarBackUrl('');
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (nom: MemberNominee) => {
    setEditingNominee(nom);
    setTargetUserId(nom.user_id || activeUser?.id || '');
    setNomineeName(nom.nominee_name);
    setRelation(nom.relation);
    setPhone(nom.phone);
    setEmail(nom.email || '');
    setDob(nom.date_of_birth || '');
    setAge(nom.age ? nom.age.toString() : '');
    setAadhaarNumber(nom.aadhaar_number || '');
    setAddress(nom.address || '');
    setSharePercentage(nom.share_percentage ? nom.share_percentage.toString() : '100');
    setPhotoUrl(nom.photo_url || '');
    setAadhaarFrontUrl(nom.aadhaar_front_url || nom.id_proof_url || '');
    setAadhaarBackUrl(nom.aadhaar_back_url || '');
    setModalError('');
    setModalOpen(true);
  };

  // Nominee Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setModalError(tr('फोटो का आकार 5MB से कम होना चाहिए', 'تصویر کا سائز 5MB سے کم ہونا چاہیے', 'Photo must be under 5MB'));
      return;
    }
    setUploadingPhoto(true);
    setModalError('');
    try {
      const url = await uploadImage('nominees', file, `nominee_photo_${Date.now()}_${file.name}`);
      setPhotoUrl(url);
      showToast(tr('नॉमिनी की फोटो अपलोड हो गई', 'نامزد کی تصویر اپلوڈ ہو گئی', 'Nominee photo uploaded successfully'));
    } catch (err: any) {
      setModalError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Aadhaar Front Upload
  const handleAadhaarFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setModalError(tr('दस्तावेज़ 6MB से कम होना चाहिए', 'دستاویز 6MB سے کم ہونا چاہیے', 'File must be under 6MB'));
      return;
    }
    setUploadingAadhaarFront(true);
    setModalError('');
    try {
      const url = await uploadImage('nominees', file, `nominee_aadhaar_front_${Date.now()}_${file.name}`);
      setAadhaarFrontUrl(url);
      showToast(tr('आधार कार्ड (सामने का भाग) अपलोड हो गया', 'آدھار کارڈ سامنے کا حصہ اپلوڈ ہو گیا', 'Aadhaar front image uploaded successfully'));
    } catch (err: any) {
      setModalError(err.message || 'Failed to upload Aadhaar front image');
    } finally {
      setUploadingAadhaarFront(false);
    }
  };

  // Aadhaar Back Upload
  const handleAadhaarBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setModalError(tr('दस्तावेज़ 6MB से कम होना चाहिए', 'دستاویز 6MB سے کم ہونا چاہیے', 'File must be under 6MB'));
      return;
    }
    setUploadingAadhaarBack(true);
    setModalError('');
    try {
      const url = await uploadImage('nominees', file, `nominee_aadhaar_back_${Date.now()}_${file.name}`);
      setAadhaarBackUrl(url);
      showToast(tr('आधार कार्ड (पीछे का भाग) अपलोड हो गया', 'آدھار کارڈ پیچھے کا حصہ اپلوڈ ہو گیا', 'Aadhaar back image uploaded successfully'));
    } catch (err: any) {
      setModalError(err.message || 'Failed to upload Aadhaar back image');
    } finally {
      setUploadingAadhaarBack(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!nomineeName.trim()) {
      const err = tr('कृपया नॉमिनी का नाम दर्ज करें', 'براہ کرم نامزد شخص کا نام درج کریں', 'Please enter nominee name');
      setModalError(err);
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      const err = tr('कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें', 'براہ کرم درست 10 ہندسوں کا موبائل نمبر درج کریں', 'Please enter valid 10-digit mobile number');
      setModalError(err);
      return;
    }

    if (!photoUrl) {
      const err = tr(
        'कृपया नॉमिनी की फोटो अपलोड करें (अनिवार्य)',
        'براہ کرم نامزد کی تصویر اپلوڈ کریں (لازمی)',
        'Please upload nominee photo (Mandatory)'
      );
      setModalError(err);
      return;
    }

    if (!aadhaarFrontUrl) {
      const err = tr(
        'कृपया आधार कार्ड (सामने का भाग) अपलोड करें (अनिवार्य)',
        'براہ کرم آدھار کارڈ (سامنے کا حصہ) اپلوڈ کریں (لازمی)',
        'Please upload Aadhaar card (front side) image (Mandatory)'
      );
      setModalError(err);
      return;
    }

    if (!aadhaarBackUrl) {
      const err = tr(
        'कृपया आधार कार्ड (पीछे का भाग) अपलोड करें (अनिवार्य)',
        'براہ کرم آدھار کارڈ (پیچھے کا حصہ) اپلوڈ کریں (لازمی)',
        'Please upload Aadhaar card (back side) image (Mandatory)'
      );
      setModalError(err);
      return;
    }

    setSubmitting(true);
    try {
      const resolvedUserId = isSuperOrExecutive ? (targetUserId || activeUser.id) : activeUser.id;
      const payload: Partial<MemberNominee> = {
        user_id: resolvedUserId,
        nominee_name: nomineeName.trim(),
        relation,
        phone: phone.trim(),
        email: email.trim(),
        date_of_birth: dob,
        age: age ? parseInt(age, 10) : undefined,
        aadhaar_number: aadhaarNumber.trim(),
        photo_url: photoUrl,
        aadhaar_front_url: aadhaarFrontUrl,
        aadhaar_back_url: aadhaarBackUrl,
        id_proof_url: aadhaarFrontUrl || '',
        address: address.trim(),
        share_percentage: sharePercentage ? parseInt(sharePercentage, 10) : 100,
      };

      if (editingNominee) {
        await updateMemberNominee(editingNominee.id, payload);
        showToast(tr('नॉमिनी विवरण सफलतापूर्वक अपडेट किया गया', 'نامزد کی تفصیلات کامیابی سے اپ ڈیٹ ہو گئیں', 'Nominee details updated successfully'));
      } else {
        await saveMemberNominee(payload as any);
        showToast(tr('नॉमिनी सफलतापूर्वक जोड़ा गया', 'نامزد کامیابی سے شامل کیا گیا', 'Nominee added successfully'));
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      const errMsg = err.message || tr('कार्रवाई विफल रही', 'کارروائی ناکام ہو گئی', 'Action failed');
      setModalError(errMsg);
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
      showToast(err.message || tr('हटाने में विफल', 'حذف کرنے میں ناکام', 'Failed to remove nominee'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered nominees list
  const filteredNominees = useMemo(() => {
    return nominees.filter((nom) => {
      if (!isSuperOrExecutive && nom.user_id !== activeUser?.id) {
        return false;
      }
      if (relationFilter !== 'all' && nom.relation.toLowerCase() !== relationFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const member = userMap.get(nom.user_id);
        const matchesNominee =
          (nom.nominee_name && nom.nominee_name.toLowerCase().includes(q)) ||
          (nom.phone && nom.phone.includes(q)) ||
          (nom.aadhaar_number && nom.aadhaar_number.includes(q)) ||
          (nom.relation && nom.relation.toLowerCase().includes(q));

        const matchesMember =
          member &&
          ((member.name && member.name.toLowerCase().includes(q)) ||
            (member.membershipId && member.membershipId.toLowerCase().includes(q)) ||
            (member.phone && member.phone.includes(q)) ||
            (member.city && member.city.toLowerCase().includes(q)));

        if (!matchesNominee && !matchesMember) {
          return false;
        }
      }
      return true;
    });
  }, [nominees, relationFilter, searchQuery, activeUser?.id, userMap, isSuperOrExecutive]);

  // Statistics
  const totalCount = nominees.length;
  const uniqueMembersCovered = useMemo(() => {
    return new Set(nominees.map((n) => n.user_id)).size;
  }, [nominees]);
  const withDocumentsCount = nominees.filter((n) => Boolean(n.aadhaar_front_url || n.id_proof_url || n.photo_url)).length;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all transform animate-bounce ${
            toastMsg.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toastMsg.text}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Welcome Banner (MFCT Signature Brand Gradient & Gold Border) */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0c2b1d 0%, #081a12 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
        }}
      >
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(200,168,75,0.18)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--mfct-gold)',
                border: '1px solid rgba(200,168,75,0.35)',
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{tr('नियम 13 - सीधे नॉमिनी सहायता', 'قاعدہ 13 - براہ راست نامزد امداد', 'Trust Bylaw Rule 13 - Mutual Solace')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isSuperOrExecutive
                ? tr('सभी सदस्य नॉमिनी विवरण (प्रशासक)', 'تمام ممبر نامزد تفصیلات (ایڈمن)', 'Member Nominees Central Registry')
                : tr('सदस्य नॉमिनी विवरण', 'ممبر نامزد تفصیلات', 'Member Nominee Details')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {tr(
                'किसी सदस्य के असामयिक निधन की दुर्भाग्यपूर्ण स्थिति में, ट्रस्ट की पारस्परिक सहयोग राशि केवल आपके द्वारा नामित व सत्यापित नॉमिनी को सीधे बैंक खाते में प्रदान की जाती है।',
                'کسی ممبر کے ناگہانی انتقال کی صورت میں ٹرسٹ کی باہمی مالی امداد براہ راست نامزد وارث کے بینک اکاؤنٹ میں فراہم کی جاتی ہے۔',
                'In the unfortunate event of an untimely demise, the Trust mutual assistance solace is disbursed directly into the verified bank account of the designated nominee.'
              )}
            </p>
          </div>

          {/* Create Button - Only for Member and District roles, NOT for Super Admin and Executive Admin */}
          {!isSuperOrExecutive && (
            <button
              onClick={openAddModal}
              className="mfct-btn-gold py-3 px-5 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{tr('नया नॉमिनी जोड़ें', 'نیا نامزد شامل کریں', 'Add Nominee')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Metric Cards (Super Admin & Exec Admin only) */}
      {isSuperOrExecutive && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tr('कुल पंजीकृत नॉमिनी', 'کل رجسٹرڈ نامزد', 'Total Registered Nominees')}
            </span>
            <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">
              {loading ? <span className="inline-block w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /> : totalCount}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {tr('सभी सदस्यों के नॉमिनी', 'تمام ممبران کے نامزد', 'Across entire membership')}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tr('कवर किए गए सदस्य', 'شامل ممبران', 'Members with Nominees')}
            </span>
            <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
              {loading ? <span className="inline-block w-12 h-7 bg-emerald-100 dark:bg-emerald-950/60 rounded animate-pulse" /> : uniqueMembersCovered}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
              {tr('सत्यापित परिवार सुरक्षा', 'خاندانی تحفظ محفوظ', 'Family welfare secured')}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tr('दस्तावेज़ संलग्न', 'دستاویزات منسلک', 'Documents Attached')}
            </span>
            <p className="text-2xl font-black mt-1" style={{ color: 'var(--mfct-gold-dark)' }}>
              {loading ? <span className="inline-block w-12 h-7 bg-amber-100 dark:bg-amber-950/60 rounded animate-pulse" /> : withDocumentsCount}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {tr('फोटो / आधार कार्ड उपलब्ध', 'تصویر / آدھار کارڈ دستیاب', 'Photo / Aadhaar Card on file')}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tr('सह-नॉमिनी संख्या', 'شریک نامزد', 'Co-Nominees Count')}
            </span>
            <p className="text-2xl font-black mt-1 text-[#0c4a2b] dark:text-emerald-400">
              {loading ? <span className="inline-block w-12 h-7 bg-indigo-100 dark:bg-indigo-950/60 rounded animate-pulse" /> : Math.max(0, totalCount - uniqueMembersCovered)}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {tr('अतिरिक्त नामांकित व्यक्ति', 'اضافی نامزد', 'Secondary beneficiaries')}
            </span>
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isSuperOrExecutive ? (
            <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-extrabold text-sm">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold-dark)' }}
              >
                <Users className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span>{tr('सभी सदस्यों के पंजीकृत नॉमिनी', 'تمام ممبران کے رجسٹرڈ نامزد', 'All Registered Members’ Nominees')}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {totalCount}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>{tr('मेरे पंजीकृत नॉमिनी', 'میرے رجسٹرڈ نامزد', 'My Registered Nominees')} ({totalCount})</span>
            </div>
          )}

          {/* Quick Search & Relation Filter */}
          <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl justify-end">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isSuperOrExecutive && viewScope === 'all'
                    ? tr('नॉमिनी, फ़ोन, आधार, या सदस्य नाम/ID से खोजें...', 'تلاش نامزد، فون، یا ممبر...', 'Search nominee, phone, Aadhaar, member...')
                    : tr('नॉमिनी नाम या फ़ोन से खोजें...', 'تلاش نامزد یا فون...', 'Search nominee name or phone...')
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={relationFilter}
              onChange={(e) => setRelationFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="all">{tr('सभी रिश्ते (All Relations)', 'تمام رشتے', 'All Relations')}</option>
              {RELATION_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {language === 'hi' ? r.labelHi : language === 'ur' ? r.labelUr : r.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Nominees Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NomineeCardSkeleton />
          <NomineeCardSkeleton />
        </div>
      ) : filteredNominees.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-inner"
            style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold-dark)' }}
          >
            <HeartHandshake className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            {searchQuery || relationFilter !== 'all'
              ? tr('कोई नॉमिनी परिणाम नहीं मिला', 'کوئی نتیجہ نہیں ملا', 'No Nominees Matched Your Filter')
              : tr('कोई नॉमिनी पंजीकृत नहीं है', 'کوئی نامزد رجسٹرڈ نہیں ہے', 'No Nominees Registered Yet')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            {searchQuery || relationFilter !== 'all'
              ? tr('कृपया अपनी खोज या फ़िल्टर बदलें।', 'براہ کرم تلاش تبدیل کریں۔', 'Try clearing your search query or relation filter to see all results.')
              : tr(
                  'ट्रस्ट नियमावली के अनुसार सभी सदस्यों के लिए नॉमिनी का विवरण दर्ज करना अनिवार्य है। कृपया अपने परिवार की सुरक्षा व सहायता हेतु नॉमिनी जोड़ें।',
                  'ٹرسٹ کے قواعد کے مطابق تمام ممبران کے لیے نامزد کی تفصیلات درج کرنا لازمی ہے۔ براہ کرم نامزد شخص کا اندراج کریں۔',
                  'In accordance with Trust guidelines, designating a verified nominee is required so mutual relief can be smoothly granted without dispute.'
                )}
          </p>
          {!isSuperOrExecutive && (
            <button
              onClick={openAddModal}
              className="mfct-btn-gold py-3 px-6 rounded-2xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md hover:scale-102 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{tr('अभी नॉमिनी जोड़ें', 'ابھی نامزد شامل کریں', 'Register Nominee Now')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNominees.map((nom, index) => {
            const relObj = RELATION_OPTIONS.find((r) => r.value.toLowerCase() === nom.relation.toLowerCase());
            const displayRelation = relObj
              ? language === 'hi'
                ? relObj.labelHi
                : language === 'ur'
                  ? relObj.labelUr
                  : relObj.labelEn
              : nom.relation;

            const memberObj = userMap.get(nom.user_id);
            const isOwner = nom.user_id === activeUser?.id;
            const canManage = !isSuperOrExecutive && isOwner;

            return (
              <div
                key={nom.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-2xl hover:border-amber-400/50 relative group"
              >
                {/* Associated Member Header Bar (For Super Admin / Exec Admin) */}
                {isSuperOrExecutive && (
                  <div className="px-6 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate">
                        {memberObj ? memberObj.name : tr('सदस्य', 'ممبر', 'Member')} {memberObj?.membershipId ? `(${memberObj.membershipId})` : ''}
                      </span>
                    </div>
                    {memberObj?.city && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        {memberObj.city}
                      </span>
                    )}
                  </div>
                )}

                {/* Nominee Profile Header with Photo & Actions */}
                <div
                  className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between"
                  style={{
                    background: 'linear-gradient(to right, rgba(200,168,75,0.06), rgba(12,43,29,0.03))',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Nominee Photo with click to preview */}
                    {nom.photo_url ? (
                      <div className="relative group/pic cursor-pointer" onClick={() => setPreviewImage({ url: nom.photo_url!, title: `${nom.nominee_name} (Photo)` })}>
                        <img
                          src={nom.photo_url}
                          alt={nom.nominee_name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400/60 shadow-md transition-transform group-hover/pic:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover/pic:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #0c2b1d 0%, #081a12 100%)',
                          color: 'var(--mfct-gold)',
                          border: '1px solid rgba(200,168,75,0.4)',
                        }}
                      >
                        {nom.nominee_name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                          {nom.nominee_name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {index === 0 ? tr('मुख्य नॉमिनी', 'اہم نامزد', 'Primary Nominee') : tr('सह-नॉमिनी', 'شریک نامزد', 'Co-Nominee')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {displayRelation}
                        </span>
                        {nom.share_percentage && (
                          <span className="text-[11px] font-bold text-slate-500">
                            • {nom.share_percentage}% {tr('हिस्सेदारी', 'حصہ', 'Share')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(nom)}
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all cursor-pointer"
                        title={tr('संपादित करें', 'ترمیم کریں', 'Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(String(nom.id))}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all cursor-pointer"
                        title={tr('हटाएं', 'حذف کریں', 'Delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {tr('फ़ोन नंबर', 'فون نمبر', 'Phone Number')}
                      </span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {nom.phone}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                        <Percent className="w-3 h-3 text-amber-600" />
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
                            <Hash className="w-3 h-3 text-emerald-600" />
                            {tr('आधार संख्या', 'شناختی نمبر', 'Aadhaar / ID No')}
                          </span>
                          <p className="font-mono font-bold text-slate-900 dark:text-white">
                            •••• •••• {nom.aadhaar_number.slice(-4)}
                          </p>
                        </div>
                      )}

                      {(nom.date_of_birth || nom.age) && (
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3 h-3 text-amber-600" />
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
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {tr('पता', 'پتہ', 'Address')}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {nom.address}
                      </p>
                    </div>
                  )}

                  {/* Aadhaar Front & Back Documents Cards */}
                  {(nom.aadhaar_front_url || nom.aadhaar_back_url || nom.id_proof_url) && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{tr('संलग्न आधार कार्ड दस्तावेज', 'منسلک آدھار دستاویزات', 'Attached Aadhaar Documents')}</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Front Aadhaar */}
                        {(nom.aadhaar_front_url || nom.id_proof_url) && (
                          <div
                            onClick={() =>
                              setPreviewImage({
                                url: nom.aadhaar_front_url || nom.id_proof_url!,
                                title: `${nom.nominee_name} - ${tr('आधार कार्ड (सामने)', 'آدھار کارڈ (سامنے)', 'Aadhaar Card (Front)')}`,
                              })
                            }
                            className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 transition-all group/doc"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-400/50 shrink-0 bg-slate-900">
                                <img
                                  src={nom.aadhaar_front_url || nom.id_proof_url}
                                  alt="Aadhaar Front"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="truncate">
                                <p className="font-bold text-emerald-800 dark:text-emerald-200 text-xs truncate">
                                  {tr('आधार (सामने का भाग)', 'آدھار کارڈ سامنے', 'Aadhaar (Front)')}
                                </p>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> {tr('देखें', 'دیکھیں', 'View')}
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0 opacity-60 group-hover/doc:opacity-100" />
                          </div>
                        )}

                        {/* Back Aadhaar */}
                        {nom.aadhaar_back_url && (
                          <div
                            onClick={() =>
                              setPreviewImage({
                                url: nom.aadhaar_back_url!,
                                title: `${nom.nominee_name} - ${tr('आधार कार्ड (पीछे)', 'آدھار کارڈ (پیچھے)', 'Aadhaar Card (Back)')}`,
                              })
                            }
                            className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-all group/doc"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-400/50 shrink-0 bg-slate-900">
                                <img
                                  src={nom.aadhaar_back_url}
                                  alt="Aadhaar Back"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="truncate">
                                <p className="font-bold text-amber-900 dark:text-amber-200 text-xs truncate">
                                  {tr('आधार (पीछे का भाग)', 'آدھار کارڈ پیچھے', 'Aadhaar (Back)')}
                                </p>
                                <span className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> {tr('देखें', 'دیکھیں', 'View')}
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-amber-600 shrink-0 opacity-60 group-hover/doc:opacity-100" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-[#0c4a2b] dark:text-emerald-400 font-bold">
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

      {/* Add / Edit Nominee Modal (MFCT Signature Brand Design) */}
      {modalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div
              className="p-5 text-white flex items-center justify-between shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0c2b1d 0%, #081a12 100%)',
                borderBottom: '1px solid rgba(200,168,75,0.3)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold"
                  style={{ background: 'rgba(200,168,75,0.18)', color: 'var(--mfct-gold)' }}
                >
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg">
                    {editingNominee
                      ? tr('नॉमिनी विवरण संपादित करें', 'نامزد تفصیلات میں ترمیم', 'Edit Nominee Details')
                      : tr('नया नॉमिनी जोड़ें', 'نیا نامزد شامل کریں', 'Register New Nominee')}
                  </h3>
                  <p className="text-[11px] text-amber-200">
                    {tr('पारस्परिक राहत हेतु कानूनी रूप से वैध विवरण भरें', 'قانونی طور پر درست تفصیلات درج کریں', 'Enter legally valid details for mutual relief registry')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-800 dark:text-slate-200">
              {modalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* If Super / Executive Admin: Option to select Member */}
              {isSuperOrExecutive && !editingNominee && usersList.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                  <label className="block text-amber-900 dark:text-amber-200 font-extrabold uppercase text-[11px] mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>{tr('सदस्य चुनें (वैकल्पिक - स्वतः आपके खाते में जुड़ेगा)', 'ممبر منتخب کریں (اختیاری)', 'Assign to Member (Optional - Defaults to Admin)')}</span>
                  </label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none cursor-pointer text-xs"
                  >
                    <option value={activeUser.id}>
                      {activeUser.name} ({activeUser.membershipId || 'Admin Self'})
                    </option>
                    {usersList
                      .filter((u) => u.id !== activeUser.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.membershipId ? `(${u.membershipId})` : ''} - {u.phone} ({u.city || ''})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* SECTION 1: PERSONAL DETAILS */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <UserIcon className="w-4 h-4" />
                  <span>{tr('1. नॉमिनी की व्यक्तिगत जानकारी', '1. نامزد کی ذاتی تفصیلات', '1. Nominee Personal Details')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nominee Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
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
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>

                  {/* Relationship */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('सदस्य के साथ रिश्ता *', 'ممبر کے ساتھ رشتہ *', 'Relationship with Member *')}
                    </label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all cursor-pointer"
                    >
                      {RELATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {language === 'hi' ? opt.labelHi : language === 'ur' ? opt.labelUr : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('मोबाइल नंबर *', 'موبائل نمبر *', 'Mobile Number *')}
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
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>

                  {/* Share % */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('हिस्सेदारी प्रतिशत (%)', 'حصہ داری (%)', 'Share Percentage (%)')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={sharePercentage}
                      onChange={(e) => setSharePercentage(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>

                  {/* Aadhaar Number */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('आधार / पहचान पत्र संख्या', 'آدھار نمبر', 'Aadhaar / ID Card Number')}
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      placeholder="e.g. 1234 5678 9012"
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>

                  {/* DOB / Age */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('जन्म तिथि / आयु', 'تاریخ پیدائش یا عمر', 'Date of Birth or Age')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all cursor-pointer"
                      />
                      <input
                        type="number"
                        placeholder={tr('आयु', 'عمر', 'Age')}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-20 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {tr('नॉमिनी का स्थायी पता', 'نامزد کا پتہ', 'Nominee Full Address')}
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={tr('मकान संख्या, गली, मोहल्ला, शहर, पिन कोड...', 'مکمل پتہ درج کریں...', 'House No, Street, Landmark, City, Pincode...')}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* SECTION 2: PHOTO OF NOMINEE */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>{tr('2. नॉमिनी की पासपोर्ट साइज फोटो * (अनिवार्य)', '2. نامزد کی تصویر * (لازمی)', '2. Photo of Nominee * (Mandatory)')}</span>
                </h4>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-4">
                  {photoUrl ? (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shrink-0 shadow-md">
                      <img src={photoUrl} alt="Nominee Photo Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 transition-colors cursor-pointer"
                        title={tr('फोटो हटाएं', 'تصویر ہٹائیں', 'Remove Photo')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-6 h-6 mb-1 text-slate-400" />
                      <span className="text-[10px] font-bold">{tr('फोटो नहीं', 'تصویر نہیں', 'No Photo')}</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-1.5">
                    <label className="block border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-600 rounded-xl p-3 text-center cursor-pointer transition-colors bg-white dark:bg-slate-900">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      />
                      {uploadingPhoto ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{tr('फोटो अपलोड हो रही है...', 'تصویر اپلوڈ ہو رہی ہے...', 'Uploading photo...')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          <span>
                            {photoUrl
                              ? tr('नॉमिनी की फोटो बदलें', 'تصویر تبدیل کریں', 'Change Nominee Photo')
                              : tr('नॉमिनी की फोटो अपलोड करें (JPG / PNG, अधिकतम 5MB)', 'تصویر اپلوڈ کریں', 'Upload Nominee Photo (JPG/PNG, Max 5MB)')}
                          </span>
                        </div>
                      )}
                    </label>
                    <p className="text-[11px] text-slate-500 text-center sm:text-left">
                      {tr(
                        'स्पष्ट पासपोर्ट साइज फोटो अपलोड करें ताकि ट्रस्ट सत्यापन व दावा प्रक्रिया निर्बाध हो सके।',
                        'واضح تصویر اپلوڈ کریں تاکہ تصدیق اور دعوے کا عمل آسان ہو سکے۔',
                        'Clear front-facing passport style photo for official mutual relief verification.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: AADHAAR CARD FRONT & BACK UPLOADS */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{tr('3. आधार कार्ड दस्तावेज (सामने और पीछे का भाग) * (अनिवार्य)', '3. آدھار کارڈ دستاویزات (سامنے اور پیچھے) * (لازمی)', '3. Aadhaar Card Images (Front & Back - Mandatory) *')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Aadhaar Card Front */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {tr('आधार कार्ड (सामने का भाग) *', 'آدھار کارڈ (سامنے کا حصہ) *', 'Aadhaar Card (Front Side) *')}
                      </span>
                      {aadhaarFrontUrl && (
                        <button
                          type="button"
                          onClick={() => setAadhaarFrontUrl('')}
                          className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" /> {tr('हटाएं', 'ہٹائیں', 'Remove')}
                        </button>
                      )}
                    </div>

                    {aadhaarFrontUrl ? (
                      <div
                        className="relative rounded-xl overflow-hidden border border-emerald-400/60 h-28 bg-slate-900 flex items-center justify-center cursor-pointer group/prev"
                        onClick={() => setPreviewImage({ url: aadhaarFrontUrl, title: tr('आधार कार्ड - सामने का भाग', 'آدھار کارڈ سامنے کا حصہ', 'Aadhaar Card - Front Side') })}
                      >
                        <img src={aadhaarFrontUrl} alt="Aadhaar Front Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/prev:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity">
                          <Eye className="w-4 h-4" />
                          <span>{tr('बड़ा देखें', 'دیکھیں', 'View Full')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs bg-white dark:bg-slate-900">
                        <FileText className="w-6 h-6 mb-1 text-slate-400" />
                        <span>{tr('सामने का भाग संलग्न नहीं है', 'سامنے کا حصہ منسلک نہیں', 'No Front Document')}</span>
                      </div>
                    )}

                    <label className="block w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-600 text-slate-700 dark:text-slate-200 text-xs font-semibold text-center cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAadhaarFrontUpload}
                        disabled={uploadingAadhaarFront}
                      />
                      {uploadingAadhaarFront ? (
                        <span className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {tr('अपलोड हो रहा है...', 'اپلوڈ ہو رہا ہے...', 'Uploading...')}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          {aadhaarFrontUrl
                            ? tr('सामने का भाग बदलें', 'تبدیل کریں', 'Replace Front Image')
                            : tr('सामने का भाग अपलोड करें', 'اپلوڈ کریں', 'Upload Front Image')}
                        </span>
                      )}
                    </label>
                  </div>

                  {/* Aadhaar Card Back */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {tr('आधार कार्ड (पीछे का भाग) *', 'آدھار کارڈ (پیچھے کا حصہ) *', 'Aadhaar Card (Back Side) *')}
                      </span>
                      {aadhaarBackUrl && (
                        <button
                          type="button"
                          onClick={() => setAadhaarBackUrl('')}
                          className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" /> {tr('हटाएं', 'ہٹائیں', 'Remove')}
                        </button>
                      )}
                    </div>

                    {aadhaarBackUrl ? (
                      <div
                        className="relative rounded-xl overflow-hidden border border-amber-400/60 h-28 bg-slate-900 flex items-center justify-center cursor-pointer group/prev"
                        onClick={() => setPreviewImage({ url: aadhaarBackUrl, title: tr('आधार कार्ड - पीछे का भाग', 'آدھار کارڈ پیچھے کا حصہ', 'Aadhaar Card - Back Side') })}
                      >
                        <img src={aadhaarBackUrl} alt="Aadhaar Back Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/prev:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity">
                          <Eye className="w-4 h-4" />
                          <span>{tr('बड़ा देखें', 'دیکھیں', 'View Full')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs bg-white dark:bg-slate-900">
                        <FileText className="w-6 h-6 mb-1 text-slate-400" />
                        <span>{tr('पीछे का भाग संलग्न नहीं है', 'پیچھے کا حصہ منسلک نہیں', 'No Back Document')}</span>
                      </div>
                    )}

                    <label className="block w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-600 text-slate-700 dark:text-slate-200 text-xs font-semibold text-center cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAadhaarBackUpload}
                        disabled={uploadingAadhaarBack}
                      />
                      {uploadingAadhaarBack ? (
                        <span className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {tr('अपलोड हो रहा है...', 'اپلوڈ ہو رہا ہے...', 'Uploading...')}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          {aadhaarBackUrl
                            ? tr('पीछे का भाग बदलें', 'تبدیل کریں', 'Replace Back Image')
                            : tr('पीछे का भाग अपलोड करें', 'اپلوڈ کریں', 'Upload Back Image')}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingPhoto || uploadingAadhaarFront || uploadingAadhaarBack}
                  className="mfct-btn-gold py-2.5 px-6 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {editingNominee
                      ? tr('अपडेट सहेजें', 'اپ ڈیٹ محفوظ کریں', 'Save Updates')
                      : tr('नॉमिनी सुरक्षित करें', 'نامزد محفوظ کریں', 'Save Nominee')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Document Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative max-w-3xl w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white text-xs font-bold">
              <span className="truncate pr-4">{previewImage.title}</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
                  title="Open original in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50 min-h-[300px]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-600 dark:text-rose-500">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg">
              {tr('नॉमिनी हटाएं?', 'نامزد حذف کریں؟', 'Delete Nominee?')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr(
                'क्या आप वाकई इस नॉमिनी को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
                'کیا آپ واقعی اس نامزد کو ہٹانا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
                'Are you sure you want to remove this nominee? This action cannot be undone.'
              )}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="cursor-pointer px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all"
                disabled={deletingId !== null}
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="cursor-pointer px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
