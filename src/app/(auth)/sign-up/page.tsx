'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User, Community, AccountDetails } from '../../../types';
import {
  Upload,
  ArrowRight,
  UserCheck,
  Sparkles,
  Eye,
  EyeOff,
  QrCode,
  CheckCircle2,
  AlertCircle,
  HandHeart,
  ShieldCheck,
  X,
  User as UserIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  MapPin,
  Building2,
  Building,
  Home,
  Landmark,
  Mail,
  Copy,
  Check,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCommunities } from '../../../services/communityService';
import { getAccountDetails } from '../../../services/adminService';
import { createUser } from '../../../services/userService';
import { uploadImage } from '../../../lib/storage';
import { hashPassword } from '../../../lib/auth';
import { useLanguage } from '../../../context/LanguageContext';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };
  const dir = language === 'ur' ? 'rtl' : 'ltr';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [houseNo, setHouseNo] = useState('');
  const [villageTown, setVillageTown] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [block, setBlock] = useState('');
  const [tehsil, setTehsil] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const city = (villageTown.trim() || district.trim());
  const [religion, setReligion] = useState<'Hindu' | 'Muslim' | 'Sikh' | 'Christian' | ''>('');
  const [isMalikENisab, setIsMalikENisab] = useState<boolean | null>(null);
  const [helpType, setHelpType] = useState<'Zakat' | 'Sadaka' | 'Fitra' | 'Other' | ''>('');
  const [helpDetails, setHelpDetails] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarFrontUploaded, setAadhaarFrontUploaded] = useState(false);
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  const [aadhaarBackUploaded, setAadhaarBackUploaded] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploaded, setAvatarUploaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [registeredMembershipId, setRegisteredMembershipId] = useState('');
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);

  useEffect(() => {
    getCommunities()
      .then((data) => {
        setCommunities(data);
        if (data.length > 0) setSelectedCommunityId(data[0].id);
      })
      .catch(console.error);

    getAccountDetails()
      .then((data) => {
        if (data && data.length > 0) {
          setAccountDetails(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => {
        setAccountLoading(false);
      });
  }, []);

  // Filter communities strictly by village/town or district typed by user
  const filteredCommunities = useMemo(() => {
    const qCity = villageTown.trim().toLowerCase();
    const qDist = district.trim().toLowerCase();
    if (!qCity && !qDist) return communities;
    return communities.filter((c) => {
      const cCity = (c.city || '').trim().toLowerCase();
      const cDist = (c.district || '').trim().toLowerCase();
      const matchCity = qCity.length > 0 && cCity.length > 0 && (cCity.includes(qCity) || qCity.includes(cCity));
      const matchDist = qDist.length > 0 && cDist.length > 0 && (cDist.includes(qDist) || qDist.includes(cDist));
      const crossCity = qDist.length > 0 && cCity.length > 0 && (cCity.includes(qDist) || qDist.includes(cCity));
      const crossDist = qCity.length > 0 && cDist.length > 0 && (cDist.includes(qCity) || qCity.includes(cDist));
      return matchCity || matchDist || crossCity || crossDist;
    });
  }, [communities, villageTown, district]);

  const hasCitySpecificCommunities = useMemo(() => {
    return city.trim().length > 0 && filteredCommunities.length > 0;
  }, [city, filteredCommunities]);

  // When city changes, auto-select first matching community if current selection is not in filtered list
  useEffect(() => {
    if (filteredCommunities.length > 0) {
      const exists = filteredCommunities.some((c) => c.id === selectedCommunityId);
      if (!exists) {
        setSelectedCommunityId(filteredCommunities[0].id);
      }
    } else if (communities.length > 0) {
      const exists = communities.some((c) => c.id === selectedCommunityId);
      if (!exists) {
        setSelectedCommunityId(communities[0].id);
      }
    }
  }, [filteredCommunities, communities, selectedCommunityId]);

  const activeCommunity =
    filteredCommunities.find((c) => c.id === selectedCommunityId) ||
    communities.find((c) => c.id === selectedCommunityId) ||
    communities[0];

  const handleReligionChange = (newRel: string) => {
    setReligion(newRel as any);
    if (newRel !== 'Muslim') {
      setIsMalikENisab(null);
      setHelpType('');
      setHelpDetails('');
    }
  };

  const handleMalikENisabChange = (isNisab: boolean) => {
    setIsMalikENisab(isNisab);
    if (isNisab) {
      setHelpType('');
      setHelpDetails('');
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      const err = tr(
        'ईमेल फ़ील्ड आवश्यक है। कृपया अपना ईमेल पता दर्ज करें।',
        'ای میل کا خانہ ضروری ہے۔ براہ کرم اپنا ای میل درج کریں۔',
        'Email field is required. Please enter your email address.'
      );
      setFormError(err);
      showToast(err, 'error');
      formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const err = tr(
        'कृपया एक वैध ईमेल पता दर्ज करें।',
        'براہ کرم درست ای میل درج کریں۔',
        'Please enter a valid email address.'
      );
      setFormError(err);
      showToast(err, 'error');
      formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const missing = [];
    if (!fullName.trim()) missing.push(tr('पूरा नाम', 'مکمل نام', 'Full Name'));
    if (!fatherName.trim()) missing.push(tr('पिता का नाम', 'والد کا نام', "Father's Name"));
    if (!phone.trim()) missing.push(tr('मोबाइल नंबर', 'موبائل نمبر', 'Mobile Number'));
    if (!password) missing.push(tr('पासवर्ड', 'پاس ورڈ', 'Password'));
    if (!houseNo.trim()) missing.push(tr('मकान संख्या (H.No.)', 'مکان نمبر (H.No.)', 'House No. (H.No.)'));
    if (!villageTown.trim()) missing.push(tr('गाँव / कस्बा (Village / Town)', 'گاؤں / قصبہ (Village / Town)', 'Village / Town'));
    if (!postOffice.trim()) missing.push(tr('डाकघर (Post Office)', 'پوسٹ آفس (Post Office)', 'Post Office'));
    if (!block.trim()) missing.push(tr('ब्लॉक (Block)', 'بلاک (Block)', 'Block'));
    if (!tehsil.trim()) missing.push(tr('तहसील (Tehsil)', 'تحصیل (Tehsil)', 'Tehsil'));
    if (!district.trim()) missing.push(tr('ज़िला (District)', 'ضلع (District)', 'District'));
    if (!state.trim()) missing.push(tr('राज्य (State)', 'ریاست (State)', 'State'));
    if (!religion) missing.push(tr('धर्म', 'مذہب', 'Religion'));
    if (!avatarFile) missing.push(tr('प्रोफ़ाइल फ़ोटो', 'پروفائل تصویر', 'Profile Photo'));
    if (!aadhaarFrontFile) missing.push(tr('आधार कार्ड (सामने)', 'آدھار کارڈ (سامنے)', 'Aadhaar Card (Front)'));
    if (!aadhaarBackFile) missing.push(tr('आधार कार्ड (पीछे)', 'آدھار کارڈ (پیچھے)', 'Aadhaar Card (Back)'));

    if (missing.length > 0) {
      const err = tr(
        `कृपया आवश्यक फ़ील्ड भरें: ${missing.join(', ')}`,
        `براہ کرم تمام ضروری خانے پر کریں: ${missing.join(', ')}`,
        `Please fill required fields: ${missing.join(', ')}`
      );
      setFormError(err);
      showToast(err, 'error');
      formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (phone.trim().length < 10) {
      const err = tr(
        'मोबाइल नंबर कम से कम 10 अंकों का होना चाहिए।',
        'موبائل نمبر 10 ہندسوں کا ہونا چاہیے۔',
        'Mobile number must be at least 10 digits.'
      );
      setFormError(err);
      showToast(err, 'error');
      return;
    }

    if (password.length < 6) {
      const err = tr(
        'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
        'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔',
        'Password must be at least 6 characters.'
      );
      setFormError(err);
      showToast(err, 'error');
      return;
    }

    if (religion === 'Muslim') {
      if (isMalikENisab === null) {
        const err = tr(
          'कृपया बताएं कि क्या आप मालिक-ए-निसब हैं।',
          'براہ کرم بتائیں کہ کیا آپ صاحبِ نصاب ہیں۔',
          'Please indicate whether you are Malik-e-Nisab.'
        );
        setFormError(err);
        showToast(err, 'error');
        return;
      }
      if (isMalikENisab === false && !helpType) {
        const err = tr(
          'कृपया सहायता का प्रकार चुनें।',
          'براہ کرم درکار امداد کی قسم منتخب کریں۔',
          'Please select the type of help needed.'
        );
        setFormError(err);
        showToast(err, 'error');
        return;
      }
      if (isMalikENisab === false && helpType === 'Other' && !helpDetails.trim()) {
        const err = tr(
          'कृपया सहायता का विवरण दर्ज करें।',
          'براہ کرم درکار امداد کی تفصیل لکھیں۔',
          'Please specify the details of assistance needed.'
        );
        setFormError(err);
        showToast(err, 'error');
        return;
      }
    }

    setFormError(null);
    setStep(2);
    formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinishRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;
    if (!utrNumber.trim()) {
      showToast(
        tr(
          'कृपया 12 अंकों का UTR नंबर दर्ज करें।',
          'براہ کرم 12 ہندسوں کا UTR نمبر درج کریں۔',
          'Please enter 12-digit Bank UTR / Reference number.'
        ),
        'error'
      );
      return;
    }
    if (!screenshotFile) {
      showToast(
        tr(
          'कृपया भुगतान स्क्रीनशॉट अपलोड करें।',
          'براہ کرم ادائیگی کی رسید اپلوڈ کریں۔',
          'Please upload payment screenshot.'
        ),
        'error'
      );
      return;
    }
    if (!isFeePaid) {
      showToast(
        tr(
          'कृपया भुगतान और दिशानिर्देशों की पुष्टि करें।',
          'براہ کرم ادائیگی کی تصدیق کریں۔',
          'Please confirm payment and guidelines agreement.'
        ),
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      let aadhaarFrontUrl: string | undefined;
      if (aadhaarFrontFile) aadhaarFrontUrl = await uploadImage('users', aadhaarFrontFile);
      let aadhaarBackUrl: string | undefined;
      if (aadhaarBackFile) aadhaarBackUrl = await uploadImage('users', aadhaarBackFile);
      let avatarUrl = '';
      if (avatarFile) avatarUrl = await uploadImage('users', avatarFile);
      let screenshotUrl: string | undefined;
      if (screenshotFile) screenshotUrl = await uploadImage('receipts', screenshotFile);

      const hashedPassword = await hashPassword(password);

      const fullAddress = [
        houseNo.trim() ? `H.No: ${houseNo.trim()}` : '',
        villageTown.trim() ? `Village/Town: ${villageTown.trim()}` : '',
        postOffice.trim() ? `P.O.: ${postOffice.trim()}` : '',
        block.trim() ? `Block: ${block.trim()}` : '',
        tehsil.trim() ? `Tehsil: ${tehsil.trim()}` : '',
        district.trim() ? `District: ${district.trim()}` : '',
        state.trim() ? `State: ${state.trim()}` : '',
      ].filter(Boolean).join(', ');

      const memberCity = villageTown.trim() || district.trim();

      const newMember: User = {
        id: `usr_new_${Date.now()}`,
        name: fullName,
        fatherName: fatherName.trim(),
        father_name: fatherName.trim(),
        email: email.trim().toLowerCase(),
        phone,
        city: memberCity,
        district: district.trim(),
        state: state.trim(),
        address: fullAddress,
        houseNo: houseNo.trim(),
        house_no: houseNo.trim(),
        villageTown: villageTown.trim(),
        village_town: villageTown.trim(),
        postOffice: postOffice.trim(),
        post_office: postOffice.trim(),
        block: block.trim(),
        tehsil: tehsil.trim(),
        role: 'member',
        avatar: avatarUrl,
        communityId: activeCommunity.id,
        communityName: activeCommunity.name,
        membershipId: `SS-${(district.trim() || memberCity || 'DEL').substring(0, 3).toUpperCase()}-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'pending',
        isVerified: false,
        joinDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        passwordHash: hashedPassword,
        paymentMethod,
        paymentUtr: utrNumber || undefined,
        paymentScreenshotUrl: screenshotUrl,
        aadhaarFrontUrl,
        aadhaarBackUrl,
        religion: religion || undefined,
        isMalikENisab: religion === 'Muslim' ? (isMalikENisab ?? undefined) : undefined,
        is_malik_e_nisab: religion === 'Muslim' ? (isMalikENisab ?? undefined) : undefined,
        helpType: religion === 'Muslim' && isMalikENisab === false ? helpType || undefined : undefined,
        help_type: religion === 'Muslim' && isMalikENisab === false ? helpType || undefined : undefined,
        helpDetails: religion === 'Muslim' && isMalikENisab === false && helpType === 'Other' ? helpDetails || undefined : undefined,
        help_details: religion === 'Muslim' && isMalikENisab === false && helpType === 'Other' ? helpDetails || undefined : undefined,
      };

      const created = await createUser(newMember);
      const finalUser = created || newMember;
      setRegisteredMembershipId(finalUser.membershipId || '');

      let emailSent = false;
      if (finalUser.email && finalUser.membershipId) {
        try {
          const emailResponse = await fetch('/api/auth/send-membership-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: finalUser.id,
              email: finalUser.email,
              membershipId: finalUser.membershipId,
            }),
          });
          const emailResult = await emailResponse.json();
          emailSent = emailResponse.ok && emailResult.success && emailResult.emailSent;
          if (!emailSent) {
            console.error('Membership ID email was not sent:', emailResult.error || emailResponse.statusText);
          }
        } catch (emailError) {
          console.error('Membership ID email request failed:', emailError);
        }
      }
      setWelcomeEmailSent(emailSent);

      // Persist session
      const loginInfo = {
        role: finalUser.role,
        id: finalUser.id,
        email: finalUser.email || '',
        name: finalUser.name,
        fatherName: finalUser.fatherName || finalUser.father_name || '',
        avatar: finalUser.avatar || '',
        community_id: finalUser.communityId || '',
      };
      localStorage.setItem('mfct_is_logged_in', 'true');
      localStorage.setItem('mfct_user_role', finalUser.role);
      localStorage.setItem('role', finalUser.role);
      localStorage.setItem('id', finalUser.id || '');
      localStorage.setItem('status', finalUser.status || 'pending');
      localStorage.setItem('email', finalUser.email || '');
      localStorage.setItem('name', finalUser.name || '');
      localStorage.setItem('avatar', finalUser.avatar || '');
      localStorage.setItem('community_id', finalUser.communityId || '');
      localStorage.setItem('login_info', JSON.stringify(loginInfo));
      localStorage.setItem('mfct_user_info', JSON.stringify(loginInfo));

      setStep(3);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch { }

      // Auto redirect to 'Under Review' page after allowing user to view their membership ID
      redirectTimerRef.current = setTimeout(() => {
        router.replace('/under-review');
      }, 5000);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err?.code === '23505' && (err?.message?.includes('users_email_key') || err?.details?.includes('email'))) {
        showToast(
          tr('यह ईमेल पता पहले से पंजीकृत है। कृपया दूसरा ईमेल दर्ज करें।', 'یہ ای میل ایڈریس پہلے سے رجسٹرڈ ہے۔ براہ کرم دوسرا ای میل درج کریں۔', 'This email is already registered. Please use another email.'),
          'error'
        );
      } else if (err?.code === '23505' && (err?.message?.includes('phone') || err?.details?.includes('phone'))) {
        showToast(
          tr('यह फोन नंबर पहले से पंजीकृत है।', 'یہ فون نمبر پہلے سے رجسٹرڈ ہے۔', 'This phone number is already registered.'),
          'error'
        );
      } else {
        showToast(
          tr('पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।', 'رجسٹریشن ناکام رہی۔ دوبارہ کوشش کریں۔', 'Registration failed. Please try again.'),
          'error'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8f6f1]" dir={dir}>
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] max-w-lg w-[92%] animate-fade-in pointer-events-auto">
          <div
            className={`p-4 rounded-2xl text-sm font-bold shadow-2xl flex items-center justify-between gap-3 border ${toast.type === 'error'
              ? 'bg-red-600 text-white border-red-700 shadow-red-950/30'
              : 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-950/30'
              }`}
          >
            <div className="flex items-center gap-2.5 flex-1">
              <span className="text-lg">{toast.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-white/20 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div
        className="hidden lg:flex lg:w-[40%] xl:w-[36%] flex-col justify-between p-10 xl:p-12 text-white relative overflow-hidden shrink-0"
        style={{ background: 'radial-gradient(ellipse at top left, #0f3322 0%, #061910 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none bg-[#c8a84b]" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none bg-[#2e5e42]" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <img
              src="/mfct-logo.png"
              alt="MFCT Logo"
              className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-[#c8a84b] transition-transform group-hover:scale-105"
            />
            <div>
              <p className="text-white font-black text-base tracking-tight leading-none">MFCT</p>
              <p className="text-[11px] font-medium leading-none mt-1 text-amber-200/80">Mohammad Faeem Charitable Trust</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 my-auto py-8">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.35)', color: '#f0c868' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{tr('सदस्यता एकजुटता कार्यक्रम', 'ممبرشپ یکجہتی پروگرام', '₹100 Membership Solidarity')}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              {tr('सत्यापित समुदाय', 'تصدیق شدہ کمیونٹی', 'Become a Verified')}<br />
              <span style={{ color: '#f6d878' }}>
                {tr('सदस्य बनें।', 'ممبر بنیں۔', 'Community Member.')}
              </span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-300">
              {tr(
                'अपने स्थानीय समुदाय से जुड़ें। दानकर्ता बनें और आपातकालीन सहायता के पात्र भी। ₹100 की सदस्यता आपको प्राथमिकता देती है।',
                'اپنی مقامی کمیونٹی میں شامل ہوں۔ عطیہ دہندہ اور ہنگامی امداد کے اہل بنیں۔ ₹100 کی فیس آپ کو ترجیحی حیثیت دیتی ہے۔',
                'Join your local neighbourhood community. Become an active supporter and get direct priority emergency relief.'
              )}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                icon: ShieldCheck,
                title: tr('100% पारदर्शी एस्क्रो', '100% شفاف ایسکرو', '100% Direct Escrow'),
                desc: tr('दान सीधे सत्यापित अस्पताल/मदद में जाता है', 'عطیات براہ راست ہسپتال و دکان جاتے ہیں', 'Direct vendor/hospital payouts'),
              },
              {
                icon: HeartHandshake,
                title: tr('पारस्परिक आपातकालीन सुरक्षा', 'باہمی ہنگامی تحفظ', 'Mutual Emergency Relief'),
                desc: tr('सदस्यों को आवश्यकता पड़ने पर प्राथमिकता', 'ممبرز کو ضرورت کے وقت ترجیحی مدد', 'Guaranteed priority emergency aid'),
              },
              {
                icon: CheckCircle2,
                title: tr('डिजिटल सदस्य पहचान पत्र', 'ڈیجیٹل ممبر شناختی کارڈ', 'Digital Member ID Card'),
                desc: tr('आधिकारिक MFCT समुदाय कार्ड और QR', 'سرکاری MFCT کارڈ اور کیو آر', 'Instant official membership card'),
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs italic leading-relaxed text-slate-300">
            {tr(
              '"एक छोटी-सी मदद किसी के जीवन में बड़ा बदलाव ला सकती है।"',
              '"ایک چھوٹی سی مدد کسی کی زندگی میں بڑا بدلاؤ لا سکتی ہے۔"',
              '"A small act of solidarity transforms lives and strengthens our community."'
            )}
          </p>
          <p className="text-[11px] font-bold mt-1.5 text-amber-300">
            -  Er. Mohammad Zahid, {tr('संस्थापक और अध्यक्ष', 'بانی و چیئرمین', 'Founder & Chairman')}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-5 sm:p-8 lg:p-12 overflow-y-auto max-w-3xl mx-auto w-full">
        <div ref={formTopRef} className="w-full space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <Link href="/" className="lg:hidden flex items-center gap-2.5 group">
              <img
                src="/mfct-logo.png"
                alt="MFCT Logo"
                className="w-9 h-9 rounded-full object-cover shadow border-2 border-[#c8a84b]/60 group-hover:scale-105 transition-transform"
              />
              <span className="font-black text-sm text-[#0f3322]">MFCT</span>
            </Link>
            <div className="text-xs font-medium text-slate-600 ml-auto">
              {tr('पहले से सदस्य हैं?', 'پہلے سے ممبر ہیں؟', 'Already registered?')}{' '}
              <Link href="/sign-in" className="font-bold underline decoration-2 text-[#0f3322] hover:text-emerald-700">
                {tr('साइन इन करें', 'سائن ان کریں', 'Sign In')}
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {step === 1 && tr('सदस्यता पंजीकरण', 'ممبرشپ رجسٹریشن', 'Member Registration')}
                {step === 2 && tr('सदस्यता शुल्क भुगतान', 'ممبرشپ فیس ادائیگی', 'Solidarity Fee Payment')}
                {step === 3 && tr('पंजीकरण पूर्ण हुआ!', 'رجسٹریشن مکمل ہو گئی!', 'Registration Complete!')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {step === 1 && tr('कृपया अपना व्यक्तिगत व पते का विवरण दर्ज करें।', 'براہ کرم ذاتی و رہائشی تفصیلات درج کریں۔', 'Enter your personal details to create your verified member profile.')}
                {step === 2 && tr('₹100 की वार्षिक सदस्यता शुल्क का भुगतान पूरा करें।', 'سالانہ ممبرشپ کے لیے ₹100 ادا کریں۔', 'Complete the ₹100 annual solidarity fee via UPI or Direct Bank Transfer.')}
                {step === 3 && tr('आपका अनुरोध सफलतापूर्वक दर्ज कर लिया गया है।', 'آپ کی ممبرشپ کامیابی سے درج کر لی گئی ہے۔', 'Your registration request has been submitted successfully.')}
              </p>
            </div>

            {step < 3 && (
              <div className="flex items-center gap-2 pt-1">
                {[
                  { n: 1, hi: '1. व्यक्तिगत विवरण', ur: '1. ذاتی معلومات', en: '1. Personal Info' },
                  { n: 2, hi: '2. ₹100 शुल्क भुगतान', ur: '2. فیس ادائیگی', en: '2. ₹100 Fee & UTR' },
                ].map(({ n, hi, ur, en }, idx, arr) => {
                  const isActive = step === n;
                  const isDone = step > n;
                  return (
                    <React.Fragment key={n}>
                      <div
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isActive
                          ? 'bg-[#0f3322] text-[#f0c868] shadow-md shadow-emerald-950/10'
                          : isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200/70 text-slate-500'
                          }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isActive
                            ? 'bg-amber-400 text-slate-900'
                            : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 text-slate-600'
                            }`}
                        >
                          {isDone ? '✓' : n}
                        </span>
                        <span>{tr(hi, ur, en)}</span>
                      </div>
                      {idx < arr.length - 1 && <div className="flex-1 h-0.5 bg-slate-200 rounded-full" />}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {formError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 animate-fade-in shadow-sm">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1 leading-relaxed">{formError}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('पूरा नाम (आधार के अनुसार) *', 'مکمل نام (آدھار کے مطابق) *', 'Full Name (as per ID) *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. मोहम्मद तारिक', 'مثال: محمد طارق', 'e.g. Mohammad Tariq')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('पिता का नाम *', 'والد کا نام *', "Father's Name *")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. मोहम्मद रफ़ीक', 'مثال: محمد رفیق', "e.g. Mohammad Rafiq")}
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('मोबाइल नंबर *', 'موبائل نمبر *', 'Mobile Number *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <PhoneIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('ईमेल पता *', 'ای میل ایڈریس *', 'Email Address *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MailIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="tariq@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {tr('पासवर्ड बनाएं *', 'پاس ورڈ بنائیں *', 'Create Password *')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LockIcon className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={tr('कम से कम 6 अक्षर', 'کم از کم 6 حروف', 'Min. 6 characters')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2 text-[#0f3322]">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {tr('आवासीय पता विवरण', 'رہائشی پتہ کی تفصیلات', 'Address Details')}
                  </span>
                </div>
              </div>

              {/* 1. Hno & 2. Village/Town */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('मकान संख्या (H.No.) *', 'مکان نمبر (H.No.) *', 'House No. (H.No.) *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Home className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. 12B या वार्ड नं. 4', 'مثال: 12B یا وارڈ 4', 'e.g. 12B / Ward No. 4')}
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('गाँव / कस्बा (Village / Town) *', 'گاؤں / قصبہ (Village / Town) *', 'Village / Town *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. शेरगढ़ / भोजीपुरा', 'مثال: شیرگڑھ / قصبہ', 'e.g. Shergarh / Town name')}
                      value={villageTown}
                      onChange={(e) => setVillageTown(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Post Office & 4. Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('डाकघर (Post Office) *', 'پوسٹ آفس (Post Office) *', 'Post Office *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. मुख्य डाकघर', 'مثال: مرکزی ڈاکخانہ', 'e.g. Main Post Office')}
                      value={postOffice}
                      onChange={(e) => setPostOffice(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('ब्लॉक / प्रखंड (Block) *', 'بلاک (Block) *', 'Block *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. नवाबगंज', 'مثال: نواب گنج', 'e.g. Nawabganj')}
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Tehsil & 6. District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('तहसील (Tehsil) *', 'تحصیل (Tehsil) *', 'Tehsil *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. मीरगंज / सदर', 'مثال: میر گنج / صدر', 'e.g. Meerganj / Sadar')}
                      value={tehsil}
                      onChange={(e) => setTehsil(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('ज़िला (District) *', 'ضلع (District) *', 'District *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={tr('उदा. बरेली', 'مثال: بریلی', 'e.g. Bareilly')}
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 7. State */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {tr('राज्य (State) *', 'ریاست (State) *', 'State *')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={tr('उदा. उत्तर प्रदेश', 'مثال: اتر پردیش', 'e.g. Uttar Pradesh')}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('स्थानीय समुदाय *', 'مقامی کمیونٹی *', 'Local Community *')}
                  </label>
                  <select
                    value={selectedCommunityId}
                    onChange={(e) => setSelectedCommunityId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    {filteredCommunities.length > 0 ? (
                      filteredCommunities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.city} - {tr('प्रशासक:', 'ایڈمن:', 'Admin:')} {c.adminName})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="" disabled>
                          {tr(
                            `-- "${city.trim()}" में कोई समुदाय नहीं मिला (सभी समुदाय नीचे हैं) --`,
                            `-- "${city.trim()}" میں کوئی کمیونٹی نہیں ملی (تمام نیچے ہیں) --`,
                            `-- No community in "${city.trim()}" (Showing all communities) --`
                          )}
                        </option>
                        {communities.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.city} - {tr('प्रशासक:', 'ایڈمن:', 'Admin:')} {c.adminName})
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {city.trim() ? (
                    hasCitySpecificCommunities ? (
                      <p className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span>
                          {tr(
                            `"${city.trim()}" के लिए ${filteredCommunities.length} स्थानीय समुदाय उपलब्ध`,
                            `"${city.trim()}" کے لیے ${filteredCommunities.length} مقامی کمیونٹیز دستیاب`,
                            `${filteredCommunities.length} local communities found for "${city.trim()}"`
                          )}
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] font-medium text-amber-700 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>
                          {tr(
                            `"${city.trim()}" के लिए कोई विशिष्ट समुदाय नहीं मिला, सभी समुदाय दिखाए जा रहे हैं`,
                            `"${city.trim()}" کے لیے کوئی مخصوص کمیونٹی نہیں ملی، تمام کمیونٹیز دکھائی جا رہی ہیں`,
                            `No specific community found for "${city.trim()}", showing all communities`
                          )}
                        </span>
                      </p>
                    )
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('धर्म *', 'مذہب *', 'Religion *')}
                  </label>
                  <select
                    value={religion}
                    onChange={(e) => handleReligionChange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="">{tr('-- धर्म चुनें --', '-- مذہب منتخب کریں --', '-- Select Religion --')}</option>
                    <option value="Hindu">{tr('हिन्दू (Hindu)', 'ہندو (Hindu)', 'Hindu')}</option>
                    <option value="Muslim">{tr('मुस्लिम (Muslim)', 'مسلم (Muslim)', 'Muslim')}</option>
                    <option value="Sikh">{tr('सिख (Sikh)', 'سکھ (Sikh)', 'Sikh')}</option>
                    <option value="Christian">{tr('ईसाई (Christian)', 'عیسائی (Christian)', 'Christian')}</option>
                  </select>
                </div>
              </div>

              {religion === 'Muslim' && (
                <div
                  className="p-5 rounded-2xl space-y-4 animate-fade-in border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(200,168,75,0.08) 0%, rgba(15,51,34,0.04) 100%)',
                    borderColor: 'rgba(200,168,75,0.4)',
                  }}
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-amber-300/40">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f3322]">
                      {tr('इस्लामी कल्याण एवं निसब घोषणा', 'اسلامی فلاحی و نصاب اقرار نامہ', 'Islamic Welfare & Nisab Declaration')}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {tr('क्या आप मालिक-ए-निसब (साहिब-ए-निसब) हैं? *', 'کیا آپ صاحبِ نصاب / مالکِ نصاب ہیں؟ *', 'Are you Malik-e-Nisab (Sahib-e-Nisab)? *')}
                    </label>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {tr(
                        'क्या आपके पास बुनियादी ज़रूरतों के अलावा 52.5 तोले चांदी (या इसके बराबर नकदी/माल) मौजूद है?',
                        'کیا آپ کے پاس اپنی بنیادی ضروریات سے زائد ساڑھے باون تولہ چاندی (یا مساوی مال/رقم) موجود ہے؟',
                        'Do you possess wealth exceeding the Nisab threshold (52.5 tolas silver / equivalent value)?'
                      )}
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {[
                        { val: true, hi: 'हाँ (मालिक-ए-निसब)', ur: 'ہاں (صاحبِ نصاب)', en: 'Yes (Malik-e-Nisab)' },
                        { val: false, hi: 'नहीं (गैर-निसबदार)', ur: 'نہیں (غیر نصاب)', en: 'No (Non-Nisab)' },
                      ].map(({ val, hi, ur, en }) => (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => handleMalikENisabChange(val)}
                          className={`cursor-pointer p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${isMalikENisab === val
                            ? 'bg-amber-100/70 border-amber-500 text-slate-900 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${isMalikENisab === val ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'
                              }`}
                          >
                            {isMalikENisab === val && '✓'}
                          </span>
                          <span>{tr(hi, ur, en)}</span>
                        </button>
                      ))}
                    </div>

                    {isMalikENisab === true && (
                      <div className="p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>
                          {tr(
                            'अल्हम्दुलिल्लाह! आप एक सक्षम दाता/सदस्य के रूप में आगे बढ़ सकते हैं।',
                            'الحمدللہ! آپ بطور صاحبِ استطاعت ممبر آگے بڑھ سکتے ہیں۔',
                            'Alhamdulillah! You can proceed as a contributing donor/member.'
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {isMalikENisab === false && (
                    <div className="space-y-3 pt-3 border-t border-amber-200/50 animate-fade-in">
                      <label className="block text-xs font-bold text-slate-800">
                        {tr('आपको किस प्रकार की सहायता / इमदाद की आवश्यकता है? *', 'آپ کو کس قسم کی مدد / امداد کی ضرورت ہے؟ *', 'What kind of help / assistance do you need? *')}
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: 'Zakat', hi: 'ज़कात', ur: 'زکوٰۃ', en: 'Zakat', desc: tr('अनिवार्य इस्लामी सहायता', 'واجب مالی امداد', 'Mandatory relief') },
                          { id: 'Sadaka', hi: 'सदका', ur: 'صدقہ', en: 'Sadaka', desc: tr('सामान्य/आपात राहत', 'نفلی/ہنگامی امداد', 'Voluntary relief') },
                          { id: 'Fitra', hi: 'फ़ितरा', ur: 'فطرہ', en: 'Fitra', desc: tr('निर्वाह व ईद सहायता', 'عید و راشن امداد', 'Sustenance & Eid') },
                          { id: 'Other', hi: 'अन्य', ur: 'دیگر', en: 'Other', desc: tr('इलाज, राशन, फीस', 'علاج، راشن، تعلیم', 'Custom assistance') },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setHelpType(item.id as any)}
                            className={`cursor-pointer p-2.5 rounded-xl border text-left transition-all ${helpType === item.id
                              ? 'bg-amber-100/70 border-amber-500 shadow-sm'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{tr(item.hi, item.ur, item.en)}</span>
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] ${helpType === item.id ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'
                                  }`}
                              >
                                {helpType === item.id && '✓'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                          </button>
                        ))}
                      </div>

                      {helpType === 'Other' && (
                        <div className="pt-1">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {tr('सहायता का विवरण दर्ज करें *', 'درکار امداد کی تفصیل لکھیں *', 'Specify Details of Help Needed *')}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={tr('उदा. चिकित्सा खर्च, राशन, बच्चों की फीस', 'مثلاً علاج کا خرچہ، راشن', 'e.g. Medical expenses, ration, children fees')}
                            value={helpDetails}
                            onChange={(e) => setHelpDetails(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {tr('प्रोफ़ाइल फ़ोटो *', 'پروفائل تصویر *', 'Profile Photo *')}
                </label>
                <label
                  className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${avatarUploaded
                    ? 'bg-amber-50/60 border-amber-400 text-slate-900'
                    : 'bg-slate-50/70 border-slate-300 hover:bg-slate-100 text-slate-600'
                    }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setAvatarFile(f);
                        setAvatarUploaded(true);
                      }
                    }}
                  />
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-700">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">
                    {avatarUploaded
                      ? `✓ ${avatarFile?.name || tr('फ़ोटो संलग्न है', 'تصویر منسلک ہے', 'Photo Attached')}`
                      : tr('फ़ोटो अपलोड करने के लिए क्लिक करें *', 'تصویر اپلوڈ کرنے کے لیے کلک کریں *', 'Click to upload profile photo *')}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    label: tr('आधार कार्ड - सामने *', 'آدھار کارڈ - سامنے *', 'Aadhaar Card - Front *'),
                    uploaded: aadhaarFrontUploaded,
                    file: aadhaarFrontFile,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setAadhaarFrontFile(f);
                        setAadhaarFrontUploaded(true);
                      }
                    },
                    placeholder: tr('आधार सामने का भाग अपलोड करें *', 'آدھار سامنے کا حصہ اپلوڈ کریں *', 'Upload Aadhaar Front *'),
                  },
                  {
                    label: tr('आधार कार्ड - पीछे *', 'آدھار کارڈ - پیچھے *', 'Aadhaar Card - Back *'),
                    uploaded: aadhaarBackUploaded,
                    file: aadhaarBackFile,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setAadhaarBackFile(f);
                        setAadhaarBackUploaded(true);
                      }
                    },
                    placeholder: tr('आधार पीछे का भाग अपलोड करें *', 'آدھار پیچھے کا حصہ اپلوڈ کریں *', 'Upload Aadhaar Back *'),
                  },
                ].map(({ label, uploaded, file, onChange, placeholder }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
                    <label
                      className={`p-3.5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${uploaded
                        ? 'bg-amber-50/60 border-amber-400 text-slate-900'
                        : 'bg-slate-50/70 border-slate-300 hover:bg-slate-100 text-slate-600'
                        }`}
                    >
                      <input type="file" accept="image/*,.pdf" className="sr-only" onChange={onChange} />
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold truncate max-w-[200px]">
                        {uploaded ? `✓ ${file?.name || tr('संलग्न है', 'منسلک ہے', 'Attached')}` : placeholder}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-950/20 text-[#f0c868] mt-2"
                style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)' }}
              >
                <span>{tr('आगे बढ़ें: ₹100 सदस्यता शुल्क', 'آگے بڑھیں: ₹100 ممبرشپ فیس', 'Proceed to Pay ₹100 Fee')}</span>
                <ArrowRight className="w-4 h-4 opacity-90" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinishRegistration} className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-[#0f3322]">
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-800 font-bold">
                    {tr('वार्षिक सदस्यता एकजुटता शुल्क', 'سالانہ ممبرشپ فیس', 'Annual Membership Solidarity Fee')}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {tr('समुदाय में सक्रिय सदस्यता व आपात राहत पात्रता के लिए', 'کمیونٹی میں فعال ممبرشپ و ہنگامی امداد کے لیے', `Activates membership in ${activeCommunity?.name}`)}
                  </p>
                </div>
                <div className="text-2xl font-black text-[#0f3322]">₹100</div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300">
                {[
                  { id: 'UPI', hi: 'UPI / QR स्कैन', ur: 'UPI / QR اسکین', en: 'Instant UPI / QR' },
                  { id: 'Bank Transfer', hi: 'बैंक ट्रांसफर (NEFT)', ur: 'بینک ٹرانسفر (NEFT)', en: 'Bank Transfer (NEFT)' },
                ].map(({ id, hi, ur, en }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id as any)}
                    className={`cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all ${paymentMethod === id ? 'bg-white text-[#0f3322] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {tr(hi, ur, en)}
                  </button>
                ))}
              </div>

              {accountLoading ? (
                <div
                  className="p-6 rounded-3xl text-center space-y-4 text-white shadow-xl animate-pulse"
                  style={{ background: 'linear-gradient(135deg, #0f3322 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
                >
                  {paymentMethod === 'UPI' ? (
                    <div className="space-y-4 flex flex-col items-center">
                      <div className="w-36 h-36 rounded-2xl bg-white/10" />
                      <div className="h-3 w-36 rounded bg-white/10" />
                      <div className="h-10 w-48 rounded-xl bg-white/15" />
                      <div className="h-2.5 w-60 rounded bg-white/10" />
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-left w-full">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex justify-between items-center pb-2.5 border-b border-white/10">
                          <div className="h-3 w-28 rounded bg-white/10" />
                          <div className="h-4 w-40 rounded bg-white/15" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : paymentMethod === 'UPI' ? (
                <div
                  className="p-6 rounded-3xl text-center space-y-4 text-white shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #0f3322 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
                >
                  <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white w-[200px] sm:w-[230px] aspect-square bg-white mx-auto relative flex items-center justify-center">
                    {accountDetails?.qr_code_url ? (
                      <img
                        src={accountDetails.qr_code_url}
                        alt="UPI QR Code"
                        className="w-full h-full object-cover scale-[1.46] pointer-events-none select-none"
                        style={{ objectPosition: 'center 50%' }}
                      />
                    ) : (
                      <QrCode className="w-36 h-36 mx-auto text-slate-900 p-2" />
                    )}
                  </div>
                  <div>
                    {/* UPI ID hidden — NGO currently does not have a UPI ID */}
                    {/* <p className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                      {tr('प्रत्यक्ष एस्क्रो के लिए UPI ID', 'براہ راست ادائیگی کے لیے UPI ID', 'UPI ID for Direct Escrow')}
                    </p>
                    {accountDetails?.upi_id ? (
                      <div className="inline-flex items-center gap-2 mt-1 px-4 py-1.5 rounded-xl bg-white/10 border border-white/20">
                        <span className="font-mono font-bold text-lg select-all text-amber-300">
                          {accountDetails.upi_id}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(accountDetails.upi_id, 'upi')}
                          className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                          title="Copy UPI ID"
                        >
                          {copiedKey === 'upi' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-200" />}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-300 mt-1">
                        {tr('UPI आईडी अभी उपलब्ध नहीं है', 'UPI ID فی الحال دستیاب نہیں ہے', 'UPI ID not configured')}
                      </p>
                    )} */}
                    <p className="text-[11px] text-slate-300 mt-2">
                      {tr('Google Pay, PhonePe, Paytm या BHIM UPI द्वारा स्कैन करें', 'Google Pay, PhonePe, Paytm کے ذریعے اسکین کریں', 'Scan using Google Pay, PhonePe, Paytm, or BHIM UPI')}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="p-5 rounded-3xl space-y-3 text-xs text-white shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #0f3322 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}
                >
                  {accountDetails ? (
                    [
                      accountDetails.account_holder_name ? { label: tr('खाताधारक का नाम:', 'کھاتہ دار کا نام:', 'Account Holder:'), val: accountDetails.account_holder_name, copyKey: 'name' } : null,
                      accountDetails.bank_name ? { label: tr('बैंक का नाम:', 'بینک کا نام:', 'Bank Name:'), val: accountDetails.bank_name, copyKey: 'bank' } : null,
                      accountDetails.branch_name ? { label: tr('शाखा का नाम:', 'برانچ کا نام:', 'Branch Name:'), val: accountDetails.branch_name, copyKey: 'branch' } : null,
                      accountDetails.account_number ? { label: tr('खाता संख्या:', 'اکاؤنٹ نمبر:', 'Account Number:'), val: accountDetails.account_number, copyKey: 'acc' } : null,
                      accountDetails.ifsc_code ? { label: tr('IFSC कोड:', 'آئی ایف ایس سی کوڈ:', 'IFSC Code:'), val: accountDetails.ifsc_code, copyKey: 'ifsc' } : null,
                    ].filter(Boolean).map((item) => {
                      const { label, val, copyKey } = item!;
                      return (
                        <div key={copyKey} className="flex justify-between items-center pb-2.5 border-b border-amber-900/40 last:border-0 last:pb-0">
                          <span className="text-slate-400 font-medium">{label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-amber-300 select-all">{val}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(val, copyKey)}
                              className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                              title={`Copy ${label}`}
                            >
                              {copiedKey === copyKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-200" />}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-300">
                      {tr('बैंक विवरण अभी उपलब्ध नहीं है।', 'بینک کی تفصیلات دستیاب نہیں ہیں۔', 'Bank details not configured.')}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('12 अंकों का बैंक UTR / संदर्भ संख्या *', '12 ہندسوں کا UTR / ریفرنس نمبر *', '12-Digit Bank UTR / Transaction Ref No *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={tr('उदा. 420199381029', 'مثال: 420199381029', 'e.g. 420199381029')}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white font-mono text-sm font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tr('भुगतान रसीद / स्क्रीनशॉट *', 'ادائیگی کی رسید / اسکرین شاٹ *', 'Payment Screenshot / Receipt *')}
                  </label>
                  <label
                    className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${screenshotUploaded
                      ? 'bg-amber-50/60 border-amber-400 text-slate-900'
                      : 'bg-slate-50/70 border-slate-300 hover:bg-slate-100 text-slate-600'
                      }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setScreenshotFile(f);
                          setScreenshotUploaded(true);
                        }
                      }}
                    />
                    <Upload className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold">
                      {screenshotUploaded
                        ? `✓ ${screenshotFile?.name || tr('स्क्रीनशॉट संलग्न है', 'رسید منسلک ہے', 'Screenshot Attached')}`
                        : tr('भुगतान रसीद अपलोड करने के लिए क्लिक करें *', 'ادائیگی کی رسید اپلوڈ کریں *', 'Click to upload payment receipt *')}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="feeCheck"
                  required
                  checked={isFeePaid}
                  onChange={(e) => setIsFeePaid(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded cursor-pointer accent-emerald-600"
                />
                <label htmlFor="feeCheck" className="text-xs font-medium cursor-pointer text-slate-700 leading-relaxed">
                  {tr(
                    'मैंने ₹100 का भुगतान पूरा कर लिया है और MFCT सामुदायिक दिशानिर्देशों से सहमत हूँ।',
                    'میں نے ₹100 کی ادائیگی مکمل کر لی ہے اور MFCT اصولوں سے متفق ہوں۔',
                    'I have completed the ₹100 payment and agree to MFCT community guidelines.'
                  )}
                </label>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="cursor-pointer py-3.5 px-5 rounded-2xl font-bold text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                >
                  ← {tr('वापस', 'واپس', 'Back')}
                </button>
                <button
                  type="submit"
                  disabled={!isFeePaid || submitting}
                  className="cursor-pointer flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-950/20 text-[#f0c868] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)' }}
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{tr('सदस्यता पंजीकरण पूर्ण करें', 'ممبرشپ رجسٹریشن مکمل کریں', 'Complete Registration')}</span>
                      <ArrowRight className="w-4 h-4 opacity-90" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-10 space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                <UserCheck className="w-10 h-10 text-emerald-700" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {tr('पंजीकरण अनुरोध सबमिट हुआ!', 'درخواست کامیابی سے جمع ہوئی!', 'Registration Submitted!')}
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  {tr(
                    `अल्हम्दुलिल्लाह! आप अब ${activeCommunity?.name} के एक सत्यापित सदस्य हैं।`,
                    `الحمدللہ! آپ اب ${activeCommunity?.name} کے تصدیق شدہ ممبر بن چکے ہیں۔`,
                    `You are now a registered member of ${activeCommunity?.name}.`
                  )}
                </p>
              </div>

              <div className="mx-auto max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {tr('आपकी सदस्यता आईडी', 'آپ کی ممبرشپ آئی ڈی', 'Your Membership ID')}
                </p>
                <p className="mt-2 font-mono text-2xl font-black tracking-wider text-[#0f3322]">
                  {registeredMembershipId || tr('उपलब्ध नहीं', 'دستیاب نہیں', 'Not available')}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  {welcomeEmailSent
                    ? tr(
                      `सदस्यता आईडी आपके ईमेल ${email} पर भेज दी गई है।`,
                      `ممبرشپ آئی ڈی آپ کے ای میل ${email} پر بھیج دی گئی ہے۔`,
                      `Your membership ID was emailed to ${email}.`
                    )
                    : tr(
                      `ईमेल नहीं भेजा जा सका। कृपया अपनी सदस्यता आईडी सुरक्षित रखें और सहायता के लिए info@mfcttrust.com से संपर्क करें।`,
                      `ای میل نہیں بھیجی جا سکی۔ اپنی ممبرشپ آئی ڈی محفوظ رکھیں اور info@mfcttrust.com سے رابطہ کریں۔`,
                      'We could not send the email. Please save your membership ID and contact info@mfcttrust.com for help.'
                    )}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                {[
                  { icon: ShieldCheck, hi: 'समीक्षा में', ur: 'جائزے میں', en: 'Under Review' },
                  { icon: CheckCircle2, hi: 'UTR रिकॉर्ड', ur: 'UTR ریکارڈ', en: 'UTR Recorded' },
                  { icon: HandHeart, hi: 'सदस्यता आईडी जारी', ur: 'ممبرشپ آئی ڈی جاری', en: 'Membership ID Issued' },
                ].map(({ icon: Icon, hi, ur, en }) => (
                  <div key={en} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span>{tr(hi, ur, en)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-2.5 px-4 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>
                    {tr(
                      'समीक्षा स्थिति पृष्ठ पर स्वतः भेजा जा रहा है…',
                      'آپ کو خود بخود جائزہ صفحہ پر منتقل کیا جا رہا ہے…',
                      'Automatically redirecting to Under Review page…'
                    )}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
                    router.replace('/under-review');
                  }}
                  className="cursor-pointer w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-950/20 text-[#f0c868]"
                  style={{ background: 'linear-gradient(135deg, #1a3c2c 0%, #0f3322 100%)' }}
                >
                  <div className="w-4 h-4 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                  <span>{tr('खाता समीक्षा स्थिति देखें', 'اکاؤنٹ اسٹیٹس دیکھیں', 'View Account Review Status')}</span>
                  <ArrowRight className="w-4 h-4 opacity-90" />
                </button>
                <Link href="/sign-in" className="block text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                  {tr('साइन इन पृष्ठ पर जाएं', 'سائن ان پر جائیں', 'Go to Sign In page')} →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 pt-8 mt-6 border-t border-slate-200">
          {[
            { icon: ShieldCheck, hi: 'सुरक्षित पोर्टल', ur: 'محفوظ پورٹل', en: 'Secure Portal' },
            { icon: CheckCircle2, hi: 'डेटा संरक्षित', ur: 'ڈیٹا محفوظ', en: 'Data Protected' },
            { icon: HandHeart, hi: 'NGO पंजीकृत', ur: 'NGO رجسٹرڈ', en: 'NGO Registered' },
          ].map(({ icon: Icon, hi, ur, en }) => (
            <div key={en} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <Icon className="w-3.5 h-3.5 text-emerald-600" />
              {tr(hi, ur, en)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
