'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../services/testimonialService';
import { MessageSquareQuote, PlusCircle, Edit, Trash2, Check, X, CheckCircle2, Clock, Sparkles, Filter, Search, Award } from 'lucide-react';
import { DarkCardSkeleton } from '../../components/Skeletons';
import { Testimonial, User, UserRole } from '../../types';
import { useLanguage, Language } from '../../context/LanguageContext';
import { autoTranslateText, autoTranslateStory, setMemoryCache, useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateRole, translateCity } from '../../lib/translateEntity';
import { STANDARD_DISTRICTS } from '../../data/districtsData';

interface ManageTestimonialsProps {
  activeUser: User;
  currentRole?: UserRole | string;
}

type TestimonialStatusFilter = 'all' | 'pending' | 'approved';

// Interactive Dynamic Testimonial Card with instant Language Translation
const AdminTestimonialCard: React.FC<{
  testimonial: Testimonial;
  canApprove: boolean;
  approvingId: string | null;
  onApprove: (id: string) => void;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: string) => void;
}> = ({ testimonial, canApprove, approvingId, onApprove, onEdit, onDelete }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(testimonial.name, language);
  const displayCity = useDynamicTranslatedText(testimonial.city, language);
  const displayQuote = useDynamicTranslatedText(testimonial.quote, language);

  return (
    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group p-4 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700 shrink-0">
            {(displayName || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
            <span>📍</span>
            <span>{displayCity}</span>
          </p>
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 italic line-clamp-4 leading-relaxed">
          &ldquo;{displayQuote}&rdquo;
        </p>

        {testimonial.status === 'pending' && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100/60 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md text-[11px] font-bold border border-amber-200 dark:border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{tr('स्वीकृति लंबित', 'زیر التواء', 'Pending Approval')}</span>
          </div>
        )}
        {testimonial.status === 'approved' && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100/60 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{tr('स्वीकृत', 'منظور شدہ', 'Approved')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
        {testimonial.status === 'pending' && canApprove && (
          <button
            onClick={() => onApprove(testimonial.id)}
            disabled={approvingId === testimonial.id}
            className="cursor-pointer flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {approvingId === testimonial.id ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>
              {approvingId === testimonial.id
                ? tr('स्वीकार हो रहा है...', 'منظور ہو رہا ہے...', 'Approving...')
                : tr('स्वीकार करें', 'منظور کریں', 'Approve')}
            </span>
          </button>
        )}
        <button
          onClick={() => onEdit(testimonial)}
          className="cursor-pointer flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>{tr('संपादित करें', 'ترمیم', 'Edit')}</span>
        </button>
        <button
          onClick={() => onDelete(testimonial.id)}
          className="cursor-pointer flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{tr('हटाएं', 'حذف کریں', 'Delete')}</span>
        </button>
      </div>
    </div>
  );
};

export const ManageTestimonials: React.FC<ManageTestimonialsProps> = ({ activeUser, currentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const rawRole = (currentRole as string) || activeUser.role || 'member';
  let normalizedRole = rawRole.toLowerCase().trim().replace(' ', '_');
  if (normalizedRole.includes('executive')) normalizedRole = 'executive_admin';
  else if (normalizedRole.includes('community')) normalizedRole = 'community_admin';
  else if (normalizedRole.includes('super')) normalizedRole = 'super_admin';
  else if (normalizedRole.includes('premium')) normalizedRole = 'premium_donor';

  const rawDistRole = (
    activeUser?.district_role ||
    activeUser?.districtRole ||
    (activeUser?.role as string) ||
    ''
  ).toLowerCase().trim().replace(/\s+/g, '_');

  const isSuperOrExecutive =
    normalizedRole === 'super_admin' ||
    normalizedRole === 'executive_admin' ||
    rawDistRole === 'super_admin' ||
    rawDistRole === 'executive_admin';

  const isDistrictPresident =
    normalizedRole === 'district_president' ||
    rawDistRole === 'district_president' ||
    rawDistRole.includes('president');

  const districtRoleKeys = [
    'district_president',
    'district_coordinator',
    'district_gen_secretary',
    'district_secretary',
    'district_finance_coord',
  ];

  const isDistrictRole =
    districtRoleKeys.includes(normalizedRole) ||
    districtRoleKeys.includes(rawDistRole) ||
    normalizedRole.startsWith('district_') ||
    rawDistRole.startsWith('district_') ||
    rawDistRole.includes('president') ||
    rawDistRole.includes('coordinator') ||
    rawDistRole.includes('secretary') ||
    rawDistRole.includes('finance');

  const isRestrictedToDistrict = !isSuperOrExecutive && isDistrictRole;

  const districtRoleTitle =
    normalizedRole === 'district_president' || rawDistRole.includes('president')
      ? tr('जिला अध्यक्ष दृश्य', 'ضلعی صدر منظر', 'District President View')
      : normalizedRole === 'district_coordinator' || rawDistRole.includes('coordinator')
        ? tr('जिला संयोजक दृश्य', 'ضلعی کوآرڈینیٹر منظر', 'District Coordinator View')
        : normalizedRole === 'district_gen_secretary' || rawDistRole.includes('gen_sec')
          ? tr('जिला महासचिव दृश्य', 'ضلعی جنرل سیکرٹری منظر', 'District General Secretary View')
          : normalizedRole === 'district_secretary' || rawDistRole.includes('secretary')
            ? tr('जिला सचिव दृश्य', 'ضلعی سیکرٹری منظر', 'District Secretary View')
            : normalizedRole === 'district_finance_coord' || rawDistRole.includes('finance')
              ? tr('जिला वित्त समन्वयक दृश्य', 'ضلعی فنانس کوآرڈینیٹر منظر', 'District Finance Coordinator View')
              : tr('जिला स्तरीय दृश्य', 'ضلعی سطحی منظر', 'District Level View');

  const userDistrict = (activeUser.district || activeUser.city || '').trim();
  const cleanDistrict = userDistrict
    ? userDistrict.replace(/\s+(district|chapter|city|block|zone).*$/i, '').trim() || userDistrict
    : '';
  const displayUserDistrict = userDistrict ? (useDynamicTranslatedText(userDistrict, language) || userDistrict) : '';

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Filters State
  const [activeFilter, setActiveFilter] = useState<TestimonialStatusFilter>('all');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Story Input State
  const [formData, setFormData] = useState({
    name: '',
    city: (activeUser?.district || activeUser?.city || '').trim(),
    quote: '',
  });

  useEffect(() => {
    fetchData();
  }, [normalizedRole, isRestrictedToDistrict, userDistrict, cleanDistrict]);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const data = await getTestimonials();
      let filteredData = data;
      if (normalizedRole === 'member' || normalizedRole === 'premium_donor') {
        filteredData = data.filter((t) => t.createdBy === activeUser.id);
      } else if (normalizedRole === 'community_admin') {
        filteredData = data.filter((t) => t.communityId === activeUser.communityId);
      }
      setTestimonials(filteredData);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const canApproveTestimonial = (t: Testimonial) => {
    if (isSuperOrExecutive) return true;
    if (isDistrictPresident && userDistrict) {
      if (!t.city) return false;
      const target = userDistrict.toLowerCase().trim();
      const cleanTarget = (cleanDistrict || target).toLowerCase().trim();
      const c = t.city.toLowerCase().trim();
      return (
        c === target ||
        c === cleanTarget ||
        target.includes(c) ||
        cleanTarget.includes(c) ||
        c.includes(target) ||
        c.includes(cleanTarget)
      );
    }
    if (normalizedRole === 'community_admin' && activeUser.communityId) {
      return t.communityId === activeUser.communityId;
    }
    return false;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      city: (activeUser?.district || activeUser?.city || '').trim(),
      quote: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setFormData({
      name: t.name,
      city: t.city,
      quote: t.quote,
    });
    setIsModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await updateTestimonial(id, { status: 'approved' });
      showToast(tr('कहानी स्वीकृत कर दी गई', 'کہانی منظور کر لی گئی', 'Story approved successfully'), 'success');
      await fetchData(false);
    } catch (err) {
      console.error(err);
      showToast(tr('स्वीकृति विफल रही', 'منظوری ناکام رہی', 'Failed to approve story'));
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTestimonial(id);
      showToast(tr('कहानी हटा दी गई', 'کہانی حذف کر دی گئی', 'Story deleted successfully'), 'success');
      await fetchData(false);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      showToast(tr('कहानी हटाने में त्रुटि', 'حذف کرنے میں خرابی', 'Failed to delete story'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) {
      showToast(tr('कृपया नाम और अनुभव दर्ज करें', 'براہ کرم نام اور تاثرات درج کریں', 'Please provide name and story quote'));
      return;
    }

    setIsSaving(true);
    try {
      // Automatic Translation to all 3 languages (Hindi, Urdu, English)
      let translatedQuoteEn = formData.quote;
      let translatedQuoteHi = formData.quote;
      let translatedQuoteUr = formData.quote;

      const userDistrictVal = (activeUser?.district || activeUser?.city || '').trim();
      const targetCity = editingId ? (formData.city?.trim() || userDistrictVal) : userDistrictVal;

      try {
        const [enRes, hiRes, urRes] = await Promise.all([
          autoTranslateText(formData.quote, 'en'),
          autoTranslateText(formData.quote, 'hi'),
          autoTranslateText(formData.quote, 'ur'),
        ]);
        translatedQuoteEn = enRes;
        translatedQuoteHi = hiRes;
        translatedQuoteUr = urRes;

        setMemoryCache(formData.quote, 'en', enRes);
        setMemoryCache(formData.quote, 'hi', hiRes);
        setMemoryCache(formData.quote, 'ur', urRes);

        const [enName, hiName, urName] = await Promise.all([
          autoTranslateText(formData.name, 'en'),
          autoTranslateText(formData.name, 'hi'),
          autoTranslateText(formData.name, 'ur'),
        ]);
        setMemoryCache(formData.name, 'en', enName);
        setMemoryCache(formData.name, 'hi', hiName);
        setMemoryCache(formData.name, 'ur', urName);

        if (targetCity) {
          const [enCity, hiCity, urCity] = await Promise.all([
            autoTranslateText(targetCity, 'en'),
            autoTranslateText(targetCity, 'hi'),
            autoTranslateText(targetCity, 'ur'),
          ]);
          setMemoryCache(targetCity, 'en', enCity);
          setMemoryCache(targetCity, 'hi', hiCity);
          setMemoryCache(targetCity, 'ur', urCity);
        }
      } catch (transErr) {
        console.warn('Auto translation warning:', transErr);
      }

      const payload = {
        name: formData.name.trim(),
        city: targetCity,
        quote: formData.quote.trim(),
        role: translateRole('Donor / Member', language),
      };

      if (editingId) {
        await updateTestimonial(editingId, payload);
        showToast(tr('कहानी सफलतापूर्वक अपडेट हो गई', 'کہانی اپ ڈیٹ کر دی گئی', 'Impact story updated successfully'), 'success');
      } else {
        const newStoryData = {
          ...payload,
          avatar:
            activeUser.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          createdBy: activeUser.id,
          communityId: activeUser.communityId,
          status: isSuperOrExecutive ? ('approved' as const) : ('pending' as const),
        };
        await createTestimonial(newStoryData as Omit<Testimonial, 'id'>);
        showToast(tr('नई कहानी सुरक्षित हो गई!', 'نئی کہانی محفوظ کر دی گئی!', 'Impact story created successfully!'), 'success');
      }
      setIsModalOpen(false);
      await fetchData(false);
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || tr('कहानी सुरक्षित नहीं हो सकी', 'محفوظ کرنے میں خرابی', 'Failed to save impact story'));
    } finally {
      setIsSaving(false);
    }
  };

  // District Scoped Filtering
  const districtFilteredTestimonials = useMemo(() => {
    let list = testimonials;

    if (isRestrictedToDistrict && userDistrict) {
      const target = userDistrict.toLowerCase().trim();
      const cleanTarget = (cleanDistrict || target).toLowerCase().trim();
      list = list.filter((t) => {
        const tCity = (t.city || '').toLowerCase().trim();
        return (
          tCity === target ||
          tCity === cleanTarget ||
          (tCity && (target.includes(tCity) || cleanTarget.includes(tCity) || tCity.includes(target) || tCity.includes(cleanTarget))) ||
          t.createdBy === activeUser.id
        );
      });
    } else if (isSuperOrExecutive && selectedDistrictFilter) {
      const target = selectedDistrictFilter.toLowerCase().trim();
      list = list.filter((t) => {
        const tCity = (t.city || '').toLowerCase().trim();
        return (
          tCity === target ||
          (tCity && target.includes(tCity)) ||
          (target && tCity.includes(target))
        );
      });
    }

    return list;
  }, [testimonials, isRestrictedToDistrict, userDistrict, cleanDistrict, selectedDistrictFilter, activeUser.id]);

  // Counts based on active district scope
  const counts = useMemo(() => {
    const pending = districtFilteredTestimonials.filter((t) => (t.status || 'approved') === 'pending').length;
    const approved = districtFilteredTestimonials.filter((t) => (t.status || 'approved') === 'approved').length;
    return {
      all: districtFilteredTestimonials.length,
      pending,
      approved,
    };
  }, [districtFilteredTestimonials]);

  // Filtered list with status and search
  const displayedTestimonials = useMemo(() => {
    return districtFilteredTestimonials.filter((t) => {
      const tStatus = t.status || 'approved';
      const matchesStatus =
        activeFilter === 'all' ||
        (activeFilter === 'pending' && tStatus === 'pending') ||
        (activeFilter === 'approved' && tStatus === 'approved');

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        t.name?.toLowerCase().includes(query) ||
        t.city?.toLowerCase().includes(query) ||
        t.quote?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [districtFilteredTestimonials, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Banner - Matching KYC & UTR Tabs */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0a1c12 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(200,168,75,0.18)' }}
        />

        <div className="flex items-start gap-4 relative z-10">
          <div
            className="p-3.5 rounded-2xl shrink-0 mt-0.5"
            style={{
              background: 'rgba(200,168,75,0.15)',
              border: '1px solid rgba(200,168,75,0.35)',
            }}
          >
            <MessageSquareQuote className="w-6 h-6" style={{ color: 'var(--mfct-gold)' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr('असर और प्रेरणादायक कहानियों का प्रबंधन', 'اثرات اور متاثر کن کہانیوں کا انتظام', 'Manage Impact Stories & Testimonials')}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-4xl" style={{ color: 'rgba(200,168,75,0.9)' }}>
              {tr(
                'लाभार्थियों और सदस्यों के वास्तविक अनुभव, प्रशंसापत्र और कहानियों की समीक्षा एवं प्रबंधन करें।',
                'مستفیدین اور اراکین کے حقیقی تجربات اور متاثر کن کہانیوں کا جائزہ لیں اور انتظام کریں۔',
                'Review, approve, and manage real impact stories, beneficiary testimonials, and experiences.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 relative z-10 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, var(--mfct-gold) 0%, #a88434 100%)',
            color: '#0a1c12',
          }}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{tr('+ नई कहानी जोड़ें', '+ نئی کہانی شامل کریں', '+ Add Story')}</span>
        </button>
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* District Role Filter Indicator Banner */}
        {isRestrictedToDistrict && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <span>{districtRoleTitle}</span>
                  {displayUserDistrict && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                      {displayUserDistrict}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  {tr(
                    `केवल आपके जिले (${displayUserDistrict || 'निर्दिष्ट जिला'}) की कहानियां दिखाई जा रही हैं।`,
                    `صرف آپ کے ضلع (${displayUserDistrict || 'مخصوص ضلع'}) کی کہانیاں دکھائی جا رہی ہیں۔`,
                    `Showing only impact stories belonging to your designated district (${displayUserDistrict || 'Assigned District'}).`
                  )}
                  {isDistrictPresident && (
                    <span className="block mt-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                      {tr(
                        '(जिला अध्यक्ष अपने जिले की लंबित कहानियों को स्वीकृत कर सकते हैं)',
                        '(ضلعی صدر اپنے ضلع کی کہانیاں منظور کر سکتے ہیں)',
                        '(District President has permission to approve stories from this district)'
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold text-[11px] shrink-0">
              {districtFilteredTestimonials.length} {tr('कहानियां', 'کہانیاں', districtFilteredTestimonials.length === 1 ? 'Story' : 'Stories')}
            </span>
          </div>
        )}

        {/* Filter Pills & Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs: Pending, Approved, All */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{tr('लंबित कहानियां', 'زیر التواء', 'Pending Approval')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeFilter === 'pending'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                }`}
              >
                {counts.pending}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('approved')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tr('स्वीकृत कहानियां', 'منظور شدہ', 'Approved Stories')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeFilter === 'approved'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                {counts.approved}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tr('सभी कहानियां', 'تمام کہانیاں', 'All Stories')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeFilter === 'all'
                    ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {counts.all}
              </span>
            </button>
          </div>

          {/* Right Controls: District Filter Dropdown (Super/Executive Admin Only) & Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {isSuperOrExecutive && (
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="">{tr('सभी जिले (All Districts)', 'تمام اضلاع', 'All Districts')}</option>
                  {STANDARD_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'hi' ? d.nameHi : language === 'ur' ? d.nameUr : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={tr('नाम, शहर या कहानी खोजें...', 'نام، شہر یا کہانی تلاش کریں...', 'Search name, city, story...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <DarkCardSkeleton key={i} />
            ))}
          </div>
        ) : displayedTestimonials.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <MessageSquareQuote className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-300 mb-2">
              {tr('कोई कहानी नहीं मिली', 'کوئی کہانی نہیں ملی', 'No Impact Stories Found')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery || selectedDistrictFilter || activeFilter !== 'all'
                ? tr(
                    'चयनित फ़िल्टर के अनुसार कोई कहानी उपलब्ध नहीं है। कृपया फ़िल्टर बदलें।',
                    'منتخب کردہ فلٹر کے مطابق کوئی کہانی دستیاب نہیں ہے۔ براہ کرم فلٹر تبدیل کریں۔',
                    'No stories match the selected filter criteria. Try adjusting your filters or search query.'
                  )
                : tr(
                    'इस समय प्रदर्शित करने के लिए कोई कहानी नहीं है। किसी भी भाषा में वास्तविक अनुभव साझा करें!',
                    'اس وقت دکھانے کے لیے کوئی کہانی موجود نہیں ہے۔ کسی بھی زبان میں تاثرات شامل کریں!',
                    'There are no impact stories to display at the moment. Share real stories in any language!'
                  )}
            </p>
            <button
              onClick={handleOpenAdd}
              className="cursor-pointer px-6 py-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-600/20 inline-flex items-center gap-2 mx-auto transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{tr('नई कहानी जोड़ें', 'نئی کہانی شامل کریں', 'Add Story')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTestimonials.map((t) => (
              <AdminTestimonialCard
                key={t.id}
                testimonial={t}
                canApprove={canApproveTestimonial(t)}
                approvingId={approvingId}
                onApprove={handleApprove}
                onEdit={handleOpenEdit}
                onDelete={(id) => setDeleteConfirmId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {editingId
                    ? tr('कहानी संपादित करें', 'کہانی میں ترمیم کریں', 'Edit Impact Story')
                    : tr('नई कहानी जोड़ें', 'نئی کہانی شامل کریں', 'Add Impact Story')}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-4">
                <div className={editingId ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('नाम (Name)', 'نام (Name)', 'Name')}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={tr('उदा. हाफ़िज़ मोहम्मद', 'مثلاً حافظ محمد', 'e.g. Hafiz Mohammed')}
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  {editingId && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('शहर / जिला (City / District)', 'شہر / ضلع (City / District)', 'City / District')}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder={isDistrictRole && userDistrict ? userDistrict : tr('उदा. बरेली, लखनऊ', 'مثلاً بریلی، لکھنؤ', 'e.g. Bareilly, Lucknow')}
                        value={formData.city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('अनुभव / कहानी (Quote)', 'تاثرات / کہانی (Quote)', 'Story Quote')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={tr(
                      'उदा. इस संस्था ने समय पर हमारी मदद की और सब कुछ पारदर्शी रहा...',
                      'مثلاً اس تنظیم نے وقت پر ہماری مدد کی اور شفافیت کے ساتھ پورا نظام کام کرتا ہے...',
                      'e.g. This platform made it so easy to see the direct impact of our contributions. Highly recommended!'
                    )}
                    value={formData.quote}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none transition-all"
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {tr(
                  '✨ सुरक्षित करने पर सभी भाषाओं में अनुवाद अपने आप सिंक हो जाएगा',
                  '✨ محفوظ کرنے پر تمام زبانوں میں ترجمہ خودکار سنک ہو جائے گا',
                  '✨ Translations will sync to all languages automatically on save'
                )}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                  disabled={isSaving}
                >
                  {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
                </button>
                <button
                  type="submit"
                  form="testimonial-form"
                  disabled={isSaving}
                  className="cursor-pointer px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{tr('सुरक्षित और अनुवाद हो रहा है...', 'محفوظ اور ترجمہ ہو رہا ہے...', 'Saving & Translating...')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{tr('कहानी सुरक्षित करें', 'کہانی محفوظ کریں', 'Save Story')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-rose-600 dark:text-rose-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-xl">
                {tr('क्या आप इस कहानी को हटाना चाहते हैं?', 'کیا آپ اس کہانی کو حذف کرنا چاہتے ہیں؟', 'Delete Impact Story?')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {tr(
                  'क्या आप वाकई इस कहानी को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
                  'کیا آپ واقعی اس اثر انگیز کہانی کو حذف کرنا چاہتے हैं؟ یہ عمل واپس نہیں ہو سکتا۔',
                  'Are you sure you want to delete this impact story? This action cannot be undone.'
                )}
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="cursor-pointer px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                disabled={deletingId !== null}
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId !== null}
                className="cursor-pointer px-6 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === deleteConfirmId ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{tr('हटाया जा रहा है...', 'حذف ہو رہا ہے...', 'Deleting...')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> <span>{tr('हाँ, हटाएं', 'ہاں، حذف کریں', 'Yes, Delete')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl text-white font-bold text-xs z-[100] animate-bounce ${
            toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'
          }`}
        >
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};
