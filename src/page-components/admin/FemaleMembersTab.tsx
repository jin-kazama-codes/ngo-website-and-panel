'use client';

import React, { useState, useEffect } from 'react';
import { User, FemaleFamilyMember, AccountDetails } from '../../types';
import {
  getFemaleFamilyMembers,
  saveFemaleFamilyMember,
  updateFemaleFamilyMember,
  deleteFemaleFamilyMember,
} from '../../services/memberService';
import { getAccountDetails } from '../../services/adminService';
import { uploadImage } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';
import { MFCT_LOGO_BASE64 } from '../../lib/mfctLogoBase64';
import { FemaleMemberCardSkeleton } from '../../components/Skeletons';
import {
  Heart,
  UserCheck,
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
  CreditCard,
  QrCode,
  Copy,
  Check,
  Printer,
  Sparkles,
  ExternalLink,
  Users,
} from 'lucide-react';

interface FemaleMembersTabProps {
  activeUser: User;
}

const FEMALE_RELATION_OPTIONS = [
  { value: 'Daughter', labelEn: 'Daughter', labelHi: 'बेटी', labelUr: 'دختر' },
  { value: 'Sister', labelEn: 'Sister', labelHi: 'बहन', labelUr: 'بہن' },
];

export const FemaleMembersTab: React.FC<FemaleMembersTabProps> = ({ activeUser }) => {
  const { language } = useLanguage();
  const [members, setMembers] = useState<FemaleFamilyMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<FemaleFamilyMember | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [modalError, setModalError] = useState<string>('');

  // Account details for QR & bank payment
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Wife');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fee & Payment State (Fixed ₹50)
  const feeAmount = 50;
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [paymentUtr, setPaymentUtr] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadData = async () => {
    if (!activeUser?.id) return;
    setLoading(true);
    try {
      const isSuperOrExec = activeUser.role === 'super_admin' || activeUser.role === 'executive_admin';
      // If super/exec admin, can view all, otherwise only their own
      const data = await getFemaleFamilyMembers(isSuperOrExec ? undefined : activeUser.id);
      setMembers(data);
    } catch (err: any) {
      console.error('Error loading female family members:', err);
      showToast(err.message || 'Failed to load female members', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    getAccountDetails()
      .then((accs) => {
        if (accs && accs.length > 0) {
          setAccountDetails(accs[0]);
        }
      })
      .catch(console.error);
  }, [activeUser?.id]);

  const userOwnMembers = members.filter((m) => m.user_id === activeUser?.id);
  const isLimitReached = userOwnMembers.length >= 2;

  const openAddModal = () => {
    if (isLimitReached) {
      showToast(
        tr(
          'अधिकतम सीमा पूर्ण: आप केवल अधिकतम 2 महिला सदस्य (2 बेटी / 2 बहन / 1 बहन 1 बेटी) जोड़ सकते हैं।',
          'زیادہ سے زیادہ حد پوری: آپ صرف 2 خواتین ممبر (2 بیٹیاں / 2 بہنیں / 1 بہن 1 بیٹی) شامل کر سکتے ہیں۔',
          'Maximum limit reached: You can only add up to 2 female members (2 Daughters, 2 Sisters, or 1 Sister + 1 Daughter).'
        ),
        'error'
      );
      return;
    }
    setEditingMember(null);
    setName('');
    setRelation('Daughter');
    setPhone('');
    setDob('');
    setAge('');
    setAadhaarNumber('');
    setAddress(activeUser?.city || '');
    setPhotoUrl('');
    setPaymentMethod('UPI');
    setPaymentUtr('');
    setPaymentScreenshotUrl('');
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (member: FemaleFamilyMember) => {
    setEditingMember(member);
    setName(member.name || '');
    setRelation(member.relation || 'Daughter');
    setPhone(member.phone || '');
    setDob(member.date_of_birth || '');
    setAge(member.age ? String(member.age) : '');
    setAadhaarNumber(member.aadhaar_number || '');
    setAddress(member.address || '');
    setPhotoUrl(member.photo_url || '');
    setPaymentMethod((member.payment_method as any) || 'UPI');
    setPaymentUtr(member.payment_utr || '');
    setPaymentScreenshotUrl(member.payment_screenshot_url || '');
    setModalError('');
    setModalOpen(true);
  };

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
      const url = await uploadImage('users', file, `female_${Date.now()}_${file.name}`);
      setPhotoUrl(url);
    } catch (err: any) {
      setModalError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setModalError(tr('स्क्रीनशॉट 6MB से कम होना चाहिए', 'اسکرین شاٹ 6MB سے کم ہونا چاہیے', 'Receipt must be under 6MB'));
      return;
    }
    setUploadingScreenshot(true);
    setModalError('');
    try {
      const url = await uploadImage('receipts', file, `fee50_${Date.now()}_${file.name}`);
      setPaymentScreenshotUrl(url);
    } catch (err: any) {
      setModalError(err.message || 'Failed to upload payment screenshot');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!name.trim()) {
      setModalError(tr('कृपया महिला सदस्य का नाम दर्ज करें', 'براہ کرم خاتون کا نام درج کریں', 'Please enter member name'));
      return;
    }

    if (!relation.trim() || !['Daughter', 'Sister'].includes(relation.trim())) {
      setModalError(tr('कृपया मान्य संबंध (बेटी या बहन) चुनें', 'براہ کرم درست رشتہ (بیٹی یا بہن) منتخب کریں', 'Please select valid relation (Daughter or Sister)'));
      return;
    }

    if (!editingMember && isLimitReached) {
      setModalError(
        tr(
          'अधिकतम सीमा पूर्ण: आप केवल 2 महिला सदस्य (2 बेटी / 2 बहन / 1 बहन 1 बेटी) जोड़ सकते हैं।',
          'زیادہ سے زیادہ حد پوری: آپ صرف 2 خواتین ممبر (2 بیٹیاں / 2 بہنیں / 1 بہن 1 بیٹی) شامل کر سکتے ہیں۔',
          'Maximum limit reached: You can only add up to 2 female members (2 Daughters, 2 Sisters, or 1 Sister + 1 Daughter).'
        )
      );
      return;
    }

    // Require UTR when adding new female member with ₹50 fee
    if (!editingMember && !paymentUtr.trim()) {
      setModalError(
        tr('कृपया ₹50 पंजीकरण शुल्क का 12-अंकों का बैंक UTR नंबर दर्ज करें', 'براہ کرم ₹50 رجسٹریشن فیس کا 12 ہندسوں کا UTR نمبر درج کریں', 'Please enter 12-digit UTR number for the ₹50 registration fee')
      );
      return;
    }

    // Require payment screenshot when adding new female member with ₹50 fee
    if (!editingMember && !paymentScreenshotUrl) {
      setModalError(
        tr(
          'कृपया ₹50 पंजीकरण शुल्क का भुगतान स्क्रीनशॉट / रसीद अपलोड करें (अनिवार्य)',
          'براہ کرم فیس ادائیگی کا اسکرین شاٹ اپ لوڈ کریں (لازمی)',
          'Payment screenshot proof is mandatory. Please upload payment receipt screenshot.'
        )
      );
      return;
    }

    setSubmitting(true);
    try {
      if (editingMember) {
        await updateFemaleFamilyMember(editingMember.id, {
          name: name.trim(),
          relation: relation.trim(),
          phone: phone.trim(),
          date_of_birth: dob,
          age: age ? parseInt(age, 10) : undefined,
          aadhaar_number: aadhaarNumber.trim(),
          address: address.trim(),
          photo_url: photoUrl,
          payment_method: paymentMethod,
          payment_utr: paymentUtr.trim(),
          payment_screenshot_url: paymentScreenshotUrl,
        });
        showToast(
          tr('महिला सदस्य विवरण सफलतापूर्वक अपडेट किया गया', 'خاتون رکن کی تفصیلات کامیابی سے اپ ڈیٹ ہو گئیں', 'Female member updated successfully')
        );
      } else {
        await saveFemaleFamilyMember({
          user_id: activeUser.id,
          name: name.trim(),
          relation: relation.trim(),
          phone: phone.trim(),
          date_of_birth: dob,
          age: age ? parseInt(age, 10) : undefined,
          aadhaar_number: aadhaarNumber.trim(),
          address: address.trim(),
          photo_url: photoUrl,
          fee_amount: feeAmount,
          payment_method: paymentMethod,
          payment_utr: paymentUtr.trim(),
          payment_screenshot_url: paymentScreenshotUrl,
          status: 'pending',
        });
        showToast(
          tr('महिला सदस्य को ₹50 शुल्क के साथ सफलतापूर्वक पंजीकृत किया गया', 'خاتون رکن کو ₹50 فیس کے ساتھ کامیابی سے رجسٹر کیا گیا', 'Female member added successfully with ₹50 fee receipt')
        );
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Save female member error:', err);
      setModalError(err.message || 'Failed to save female member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteFemaleFamilyMember(id);
      showToast(tr('महिला सदस्य हटा दिया गया', 'خاتون رکن ہٹا دیا گیا', 'Female member deleted successfully'));
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete female member', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const printPaymentSlip = (member: FemaleFamilyMember) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to view the registration slip');
      return;
    }

    const slipNo = `MFCT-FFM-${member.id.replace('ffm_', '').slice(-8).toUpperCase()}`;
    const paymentDate = member.created_at ? new Date(member.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('en-IN');

    printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>MFCT Family Female Member Registration Slip - ${slipNo}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; color: #17211c; padding: 20px; font-size: 13px; line-height: 1.5; }
    .slip {
      max-width: 650px;
      margin: 0 auto;
      border: 2px dashed #0c4a2b;
      padding: 30px;
      position: relative;
      background: #fafaf8;
      border-radius: 12px;
    }
    .header { text-align: center; border-bottom: 2px solid #c8a84b; padding-bottom: 14px; margin-bottom: 18px; }
    .logo { width: 75px; height: 75px; object-fit: contain; margin-bottom: 8px; }
    .trust-name { font-size: 20px; font-weight: 800; color: #0c4a2b; margin: 0; }
    .trust-sub { font-size: 11px; color: #666; margin-top: 2px; }
    .badge { display: inline-block; background: #c8a84b; color: #0c2016; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 20px; margin-top: 8px; }
    .details-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .details-table th, .details-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e0dfd5; font-size: 12px; }
    .details-table th { width: 45%; color: #444; font-weight: 600; background: rgba(200,168,75,0.08); }
    .details-table td { font-weight: 700; color: #111; }
    .amount { font-size: 16px; color: #0c4a2b; font-weight: 900; }
    .footer { margin-top: 25px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #e0dfd5; padding-top: 12px; }
    .stamp { margin-top: 15px; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 10px; }
    .seal-box { border: 1.5px solid #0c4a2b; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 11px; color: #0c4a2b; text-align: center; }
  </style>
</head>
<body>
  <div class="slip">
    <div class="header">
      <img src="${MFCT_LOGO_BASE64}" class="logo" alt="MFCT Logo" />
      <h1 class="trust-name">Mohammad Faeem Charitable Trust (MFCT)</h1>
      <p class="trust-sub">Regd. Public Charitable Trust • Supporting Community & Empowering Families</p>
      <div class="badge">महिला पारिवारिक सदस्य पंजीकरण रसीद • FEMALE FAMILY MEMBER SLIP</div>
    </div>
    
    <table class="details-table">
      <tr><th>रसीद संख्या (Receipt / Slip No.)</th><td>${slipNo}</td></tr>
      <tr><th>मुख्य सदस्य का नाम (Primary Member)</th><td>${activeUser.name} (${activeUser.membershipId || activeUser.id})</td></tr>
      <tr><th>महिला सदस्य का नाम (Female Member Name)</th><td>${member.name}</td></tr>
      <tr><th>सदस्य से संबंध (Relationship)</th><td>${member.relation}</td></tr>
      <tr><th>आयु / जन्म तिथि (Age / DOB)</th><td>${member.age ? `${member.age} वर्ष (Years)` : member.date_of_birth || 'N/A'}</td></tr>
      <tr><th>मोबाइल नंबर (Phone)</th><td>${member.phone || 'N/A'}</td></tr>
      <tr><th>आधार संख्या (Aadhaar No.)</th><td>${member.aadhaar_number || 'N/A'}</td></tr>
      <tr><th>पंजीकरण शुल्क (Registration Fee)</th><td class="amount">₹50.00 (Fifty Rupees Only)</td></tr>
      <tr><th>भुगतान माध्यम (Payment Mode)</th><td>${member.payment_method || 'UPI'}</td></tr>
      <tr><th>बैंक लेनदेन संख्या (UTR / Ref No.)</th><td style="font-family: monospace;">${member.payment_utr || 'Pending'}</td></tr>
      <tr><th>पंजीकरण तिथि (Registration Date)</th><td>${paymentDate}</td></tr>
      <tr><th>सत्यापन स्थिति (Verification Status)</th><td>${member.status === 'approved' ? '✓ VERIFIED & ACTIVE' : '⏳ PENDING EXECUTIVE AUDIT'}</td></tr>
    </table>

    <div class="stamp">
      <div class="seal-box">
        MOHAMMAD FAEEM CHARITABLE TRUST<br/>
        <span style="font-size: 9px; font-weight: 500;">OFFICIAL WELFARE ENROLLMENT</span>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 11px; font-weight: 700; margin: 0; color: #0c4a2b;">Authorized Signatory</p>
        <p style="font-size: 10px; color: #666; margin: 2px 0 0 0;">MFCT Welfare Desk</p>
      </div>
    </div>

    <div class="footer">
      This is an official computer-generated fee receipt of Mohammad Faeem Charitable Trust for family female member welfare enrollment.
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`);
    printWindow.document.close();
  };

  const totalMembersCount = members.length;
  const verifiedCount = members.filter((m) => m.status === 'approved').length;
  const pendingCount = members.filter((m) => m.status !== 'approved').length;
  const totalFeesCollected = totalMembersCount * 50;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all transform animate-bounce ${toastMsg.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
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
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{tr('महिला सशक्तिकरण एवं परिवार सुरक्षा', 'خواتین کو بااختیار بنانا اور خاندانی تحفظ', 'Women Empowerment & Family Welfare')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {tr('महिला पारिवारिक सदस्य', 'خواتین خاندانی ارکان', 'Female Family Members')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {tr(
                'अपने परिवार की केवल महिला सदस्यों को जोड़ें। अनुमत संयोजन: 2 बेटी, 2 बहन, या 1 बहन 1 बेटी (अधिकतम 2 सदस्य, ₹50 प्रति सदस्य पंजीकरण शुल्क)।',
                'اپنے خاندان کی صرف خواتین اراکین کو شامل کریں۔ جائز مجموعہ: 2 بیٹیاں، 2 بہنیں، یا 1 بہن 1 بیٹی (زیادہ سے زیادہ 2 اراکین، فیس ₹50 فی ممبر)۔',
                'Only female family members can be enrolled. Allowed combinations: 2 Daughters, 2 Sisters, or 1 Sister + 1 Daughter (Max 2 members, ₹50 registration fee per member).'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isLimitReached ? (
              <div className="px-5 py-3 rounded-2xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>{tr('अधिकतम 2 सदस्य पूर्ण (2/2)', 'زیادہ سے زیادہ 2 ارکان مکمل (2/2)', 'Limit Reached (2/2 Members)')}</span>
              </div>
            ) : (
              <button
                onClick={openAddModal}
                className="mfct-btn-gold py-3 px-5 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{tr('नई महिला सदस्य जोड़ें', 'نئی خاتون رکن شامل کریں', 'Add Female Member')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Allowed Combination Guide Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/30 border border-pink-200 dark:border-pink-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h4 className="font-extrabold text-pink-950 dark:text-pink-200 text-xs sm:text-sm">
              {tr(
                'मान्य पारिवारिक संयोजन (अधिकतम 2 सदस्य)',
                'جائز خاندانی مجموعہ (زیادہ سے زیادہ 2 اراکین)',
                'Allowed Family Combinations (Max 2 Members)'
              )}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-bold">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-200/70 dark:bg-pink-900/60 text-pink-900 dark:text-pink-200">
                1) 2 {tr('बेटी', 'بیٹیاں', 'Daughters')}
              </span>
              <span className="text-pink-400">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-200/70 dark:bg-pink-900/60 text-pink-900 dark:text-pink-200">
                2) 2 {tr('बहन', 'بہنیں', 'Sisters')}
              </span>
              <span className="text-pink-400">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-200/70 dark:bg-pink-900/60 text-pink-900 dark:text-pink-200">
                3) 1 {tr('बहन', 'بہن', 'Sister')} + 1 {tr('बेटी', 'بیٹی', 'Daughter')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span
            className={`px-3 py-1 rounded-full font-black text-[11px] border ${isLimitReached
              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
              }`}
          >
            {userOwnMembers.length} / 2 {tr('स्थान उपयोग', 'سیٹیں استعمال', 'Slots Used')}
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {tr('कुल महिला सदस्य', 'کل خواتین ارکان', 'Total Female Members')}
          </span>
          <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">
            {loading ? (
              <span className="inline-block w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse align-middle" />
            ) : (
              totalMembersCount
            )}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {tr('परिवार में नामांकित', 'خاندان میں شامل', 'Enrolled in family registry')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {tr('सत्यापित सदस्य', 'تصدیق شدہ ارکان', 'Verified Members')}
          </span>
          <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
            {loading ? (
              <span className="inline-block w-12 h-7 bg-emerald-100 dark:bg-emerald-950/60 rounded-md animate-pulse align-middle" />
            ) : (
              verifiedCount
            )}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            {tr('सक्रिय व सत्यापित', 'فعال اور تصدیق شدہ', 'Active and verified')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {tr('सत्यापन प्रक्रियाधीन', 'زیر التوا تصدیق', 'Pending Verification')}
          </span>
          <p className="text-2xl font-black mt-1 text-amber-500 dark:text-amber-400">
            {loading ? (
              <span className="inline-block w-12 h-7 bg-amber-100 dark:bg-amber-950/60 rounded-md animate-pulse align-middle" />
            ) : (
              pendingCount
            )}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">
            {tr('यूटीआर ऑडिट के अधीन', 'یو ٹی آر آڈٹ کے تحت', 'Under UTR audit review')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {tr('कुल शुल्क भुगतान', 'کل فیس کی ادائیگی', 'Total Fee Paid (₹50/member)')}
          </span>
          <p className="text-2xl font-black mt-1 text-[#0c4a2b] dark:text-emerald-400">
            {loading ? (
              <span className="inline-block w-16 h-7 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse align-middle" />
            ) : (
              `₹${totalFeesCollected}`
            )}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {tr('₹50 प्रति महिला सदस्य', '₹50 فی خاتون رکن', '₹50 per female member')}
          </span>
        </div>
      </div>

      {/* Members List Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{tr('पंजीकृत पारिवारिक महिला सदस्य', 'رجسٹرڈ خواتین خاندانی ارکان', 'Registered Family Female Members')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tr(
                'आपके द्वारा ट्रस्ट में नामांकित परिवार की महिला सदस्यों का पूर्ण विवरण एवं भुगतान स्थिति',
                'خاندان کی خواتین اراکین کی مکمل تفصیلات اور ادائیگی کی حیثیت',
                'Complete listing of female family members and verification status'
              )}
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{tr('+ महिला सदस्य जोड़ें (शुल्क ₹50)', '+ خاتون رکن شامل کریں (فیس ₹50)', '+ Add Member (Fee ₹50)')}</span>
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            <FemaleMemberCardSkeleton />
            <FemaleMemberCardSkeleton />
            <FemaleMemberCardSkeleton />
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600">
              <Heart className="w-8 h-8 fill-emerald-100 dark:fill-emerald-900/50" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {tr('कोई महिला सदस्य नहीं जोड़ी गई है', 'کوئی خاتون رکن شامل نہیں کی گئی', 'No Female Family Members Added Yet')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {tr(
                  'परिवार की महिला सदस्यों (जैसे पत्नी, माँ, बेटी, बहन) को केवल ₹50 शुल्क के साथ जोड़ें ताकि उन्हें ट्रस्ट कल्याण योजनाओं में मान्यता मिल सके।',
                  'خاندان کی خواتین اراکین کو صرف ₹50 فیس کے ساتھ رجسٹر کریں تاکہ وہ ٹرسٹ کی فلاحی اسکیموں میں شامل ہو سکیں۔',
                  'Add female members of your family for just ₹50 fee each to ensure their official recognition and mutual solace assistance.'
                )}
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="mfct-btn-gold py-2.5 px-5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{tr('पहली महिला सदस्य जोड़ें (₹50)', 'پہلی خاتون رکن شامل کریں (₹50)', 'Add First Female Member (₹50)')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {members.map((member) => {
              const relObj = FEMALE_RELATION_OPTIONS.find((r) => r.value === member.relation);
              const relLabel = relObj ? (language === 'hi' ? relObj.labelHi : language === 'ur' ? relObj.labelUr : relObj.labelEn) : member.relation;
              const isApproved = member.status === 'approved';

              return (
                <div
                  key={member.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{member.name}</h4>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {relLabel}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{tr('सत्यापित', 'تصدیق شدہ', 'Verified')}</span>
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>{tr('प्रक्रियाधीन', 'زیر جائزہ', 'Pending')}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Member Details */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      {member.age ? (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">{tr('आयु (Age):', 'عمر:', 'Age:')}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{member.age} {tr('वर्ष', 'سال', 'Years')}</span>
                        </div>
                      ) : member.date_of_birth ? (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">{tr('जन्म तिथि:', 'تاریخ پیدائش:', 'DOB:')}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{member.date_of_birth}</span>
                        </div>
                      ) : null}

                      {member.phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">{tr('संपर्क:', 'فون:', 'Phone:')}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{member.phone}</span>
                        </div>
                      )}

                      {member.aadhaar_number && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">{tr('आधार संख्या:', 'آدھار:', 'Aadhaar:')}</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            •••• •••• {member.aadhaar_number.slice(-4)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-400">{tr('पंजीकरण शुल्क:', 'فیس:', 'Fee Paid:')}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          ₹{member.fee_amount || 50} ({member.payment_method || 'UPI'})
                        </span>
                      </div>

                      {member.payment_utr && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">{tr('UTR संख्या:', 'UTR نمبر:', 'UTR No:')}</span>
                          <span className="font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300">
                            {member.payment_utr}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => printPaymentSlip(member)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#0c4a2b] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer transition-all"
                      title={tr('रसीद प्रिंट / डाउनलोड करें', 'رسید پرنٹ کریں', 'Print Payment Slip')}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{tr('रसीद', 'رسید', 'Slip')}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={tr('संपादित करें', 'ترمیم کریں', 'Edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(member.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title={tr('हटाएं', 'حذف کریں', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {tr('महिला सदस्य को हटाएं?', 'خاتون رکن کو ہٹائیں؟', 'Delete Female Member?')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr(
                  'क्या आप वाकई इस महिला सदस्य को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
                  'کیا آپ واقعی اس خاتون رکن کو ہٹانا چاہتے ہیں؟',
                  'Are you sure you want to remove this female member from your family registry?'
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => handleDelete(deleteConfirmId)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : tr('हटाएं', 'حذف کریں', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div
              className="p-5 text-white flex items-center justify-between shrink-0"
              style={{ background: 'linear-gradient(135deg, #0c2b1d 0%, #081a12 100%)', borderBottom: '1px solid rgba(200,168,75,0.3)' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center" style={{ color: 'var(--mfct-gold)' }}>
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    {editingMember
                      ? tr('महिला सदस्य विवरण संपादित करें', 'خاتون رکن میں ترمیم کریں', 'Edit Female Family Member')
                      : tr('नई महिला पारिवारिक सदस्य जोड़ें', 'نئی خاتون خاندانی رکن شامل کریں', 'Add Female Family Member')}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-semibold">
                    {tr('पंजीकरण शुल्क: ₹50 मात्र', 'رجسٹریشن فیس: صرف ₹50', 'Registration Fee: ₹50 Only')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-xs">
              {modalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-bold">{modalError}</span>
                </div>
              )}

              {/* STEP 1: PERSONAL DETAILS */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <UserIcon className="w-4 h-4" />
                  <span>{tr('1. महिला सदस्य की व्यक्तिगत जानकारी', '1. خاتون کی ذاتی تفصیلات', '1. Personal Details of Female Member')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('महिला सदस्य का पूरा नाम *', 'خاتون رکن کا پورا نام *', 'Female Member Full Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={tr('उदा. फातिमा खातून', 'مثال: فاطمہ خاتون', 'e.g. Fatima Khatoon')}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>

                  {/* Relationship */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('मुख्य सदस्य से संबंध *', 'رشتہ *', 'Relation to Member *')}
                    </label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all cursor-pointer"
                    >
                      {FEMALE_RELATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {language === 'hi' ? opt.labelHi : language === 'ur' ? opt.labelUr : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('आयु (वर्ष)', 'عمر (سال)', 'Age (Years)')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('जन्म तिथि', 'تاریخ پیدائش', 'Date of Birth')}
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all cursor-pointer"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('मोबाइल नंबर (वैकल्पिक)', 'موبائل نمبر (اختیاری)', 'Mobile Number (Optional)')}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>

                  {/* Aadhaar Number */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {tr('आधार संख्या / पहचान पत्र', 'آدھار نمبر', 'Aadhaar / ID Card Number')}
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      placeholder="e.g. 1234 5678 9012"
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>

                {/* Photo / ID Upload */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {tr('फोटो / पहचान पत्र प्रमाण (वैकल्पिक)', 'تصویر / شناختی کارڈ پروف (اختیاری)', 'Photo / ID Proof (Optional)')}
                  </label>
                  <div className="flex items-center gap-4">
                    {photoUrl ? (
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-emerald-500 shrink-0">
                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="absolute top-0.5 right-0.5 bg-rose-600 text-white p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null}

                    <label className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-3 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
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
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-semibold">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          <span>{photoUrl ? tr('फोटो बदलें', 'تصویر تبدیل کریں', 'Change Photo') : tr('फोटो अपलोड करें (JPG / PNG)', 'تصویر منتخب کریں', 'Upload Photo (JPG/PNG)')}</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* STEP 2: REGISTRATION FEE (₹50) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>{tr('2. पंजीकरण शुल्क भुगतान (₹50)', '2. رجسٹریشن فیس کی ادائیگی (₹50)', '2. Registration Fee Payment (₹50)')}</span>
                  </h4>
                  <div className="text-right">
                    <span className="text-xs font-black text-white px-3 py-1 rounded-full" style={{ background: '#0c4a2b' }}>
                      ₹{feeAmount} Fee
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentMethod === 'UPI'
                      ? 'bg-white dark:bg-slate-900 text-[#0c4a2b] dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {tr('UPI / QR स्कैन', 'UPI / QR اسکین', 'Instant UPI / QR Code')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Bank Transfer')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentMethod === 'Bank Transfer'
                      ? 'bg-white dark:bg-slate-900 text-[#0c4a2b] dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {tr('बैंक खाता ट्रांसफर', 'بینک اکاؤنٹ', 'Direct Bank Transfer')}
                  </button>
                </div>

                {/* QR Code / Bank Info Box */}
                {paymentMethod === 'UPI' ? (
                  <div
                    className="p-5 rounded-2xl text-center space-y-3 text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #0c2b1d 0%, #081a12 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
                  >
                    <div className="bg-white p-2 rounded-xl shadow-lg inline-block max-w-[200px] w-full">
                      {accountDetails?.qr_code_url ? (
                        <img
                          src={accountDetails.qr_code_url}
                          alt="MFCT Trust QR Code"
                          className="w-full h-auto object-contain rounded-lg mx-auto"
                        />
                      ) : (
                        <QrCode className="w-32 h-32 mx-auto text-slate-900 p-2" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-300">
                        {tr('₹50 शुल्क का भुगतान करें', '₹50 فیس ادا کریں', 'Pay ₹50 Registration Fee')}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {tr('Google Pay, PhonePe, Paytm या BHIM UPI द्वारा स्कैन करें', 'Google Pay, PhonePe, Paytm سے اسکین کریں', 'Scan with PhonePe, Google Pay, Paytm or any BHIM UPI app')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-2xl space-y-2 text-xs text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #0c2b1d 0%, #081a12 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
                  >
                    {[
                      { label: tr('खाताधारक का नाम:', 'کھاتہ دار کا نام:', 'Account Holder:'), val: accountDetails?.account_holder_name || 'Mohammad Faeem Charitable Trust', copyKey: 'name' },
                      { label: tr('बैंक का नाम:', 'بینک کا نام:', 'Bank Name:'), val: accountDetails?.bank_name || 'HDFC Bank', copyKey: 'bank' },
                      { label: tr('खाता संख्या:', 'اکاؤنٹ نمبر:', 'Account Number:'), val: accountDetails?.account_number || 'N/A', copyKey: 'acc' },
                      { label: tr('IFSC कोड:', 'آئی ایف ایس سی کوڈ:', 'IFSC Code:'), val: accountDetails?.ifsc_code || 'N/A', copyKey: 'ifsc' },
                    ].map((item) => (
                      <div key={item.copyKey} className="flex justify-between items-center pb-1.5 border-b border-amber-900/40 last:border-0 last:pb-0">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-300">{item.val}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.val, item.copyKey)}
                            className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                          >
                            {copiedKey === item.copyKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-200" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 12-Digit UTR */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {tr('12 अंकों का बैंक UTR / संदर्भ संख्या *', '12 ہندسوں کا UTR / ریفرنس نمبر *', '12-Digit Bank UTR / Reference No *')}
                  </label>
                  <input
                    type="text"
                    required={!editingMember}
                    value={paymentUtr}
                    onChange={(e) => setPaymentUtr(e.target.value)}
                    placeholder={tr('उदा. 420199381029', 'مثال: 420199381029', 'e.g. 420199381029')}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-all"
                  />
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {tr('भुगतान रसीद / स्क्रीनशॉट (अनिवार्य) *', 'ادائیگی رسید / اسکرین شاٹ (لازمی) *', 'Payment Screenshot Proof (Mandatory) *')}
                  </label>
                  <div className="flex items-center gap-3">
                    {paymentScreenshotUrl ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500 shrink-0">
                        <img src={paymentScreenshotUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPaymentScreenshotUrl('')}
                          className="absolute top-0.5 right-0.5 bg-rose-600 text-white p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null}

                    <label className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-3 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleScreenshotUpload}
                        disabled={uploadingScreenshot}
                      />
                      {uploadingScreenshot ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{tr('रसीद अपलोड हो रही है...', 'رسید اپلوڈ ہو رہی ہے...', 'Uploading receipt...')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-semibold">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          <span>{paymentScreenshotUrl ? tr('स्क्रीनशॉट बदलें', 'رسید تبدیل کریں', 'Change Screenshot') : tr('स्क्रीनशॉट अपलोड करें', 'اسکرین شاٹ اپلوڈ کریں', 'Upload Payment Screenshot')}</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingPhoto || uploadingScreenshot}
                  className="mfct-btn-gold py-2.5 px-6 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tr('सहेज रहे हैं...', 'محفوظ کیا جا رہا ہے...', 'Saving...')}</span>
                    </>
                  ) : (
                    <span>{editingMember ? tr('अपडेट करें', 'اپ ڈیٹ کریں', 'Update Member') : tr('महिला सदस्य जोड़ें (₹50)', 'شامل کریں (₹50)', 'Enroll Member (₹50)')}</span>
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
