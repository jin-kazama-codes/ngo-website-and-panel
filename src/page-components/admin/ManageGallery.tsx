'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GalleryPhoto, getGalleryPhotos, createGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto } from '../../services/galleryService';
import { PlusCircle, Edit2, Trash2, X, Image as ImageIcon, CheckCircle2, Clock, Filter, Search, Award, Sparkles } from 'lucide-react';
import { User, UserRole } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { translateCategory, translateCity } from '../../lib/translateEntity';
import DynamicText from '../../components/DynamicText';
import { STANDARD_DISTRICTS } from '../../data/districtsData';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';

interface ManageGalleryProps {
  activeUser: User;
  currentRole?: UserRole | string;
}

type PhotoStatusFilter = 'all' | 'pending' | 'approved';

export const ManageGallery: React.FC<ManageGalleryProps> = ({ activeUser, currentRole }) => {
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

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Filters State
  const [activeFilter, setActiveFilter] = useState<PhotoStatusFilter>('all');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<Partial<GalleryPhoto>>({
    title: '',
    city: '',
    image: '',
    category: 'Medical Aid',
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
      const data = await getGalleryPhotos();
      let filteredData = data;
      if (normalizedRole === 'member' || normalizedRole === 'premium_donor') {
        filteredData = data.filter((p) => p.createdBy === activeUser.id);
      } else if (normalizedRole === 'community_admin') {
        filteredData = data.filter((p) => p.communityId === activeUser.communityId);
      }
      setPhotos(filteredData);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const canApprovePhoto = (p: GalleryPhoto) => {
    if (isSuperOrExecutive) return true;
    if (isDistrictPresident && userDistrict) {
      if (!p.city) return false;
      const target = userDistrict.toLowerCase().trim();
      const cleanTarget = (cleanDistrict || target).toLowerCase().trim();
      const c = p.city.toLowerCase().trim();
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
      return p.communityId === activeUser.communityId;
    }
    return false;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      city: (activeUser?.district || activeUser?.city || '').trim(),
      image: '',
      category: 'Medical Aid',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: GalleryPhoto) => {
    setEditingId(p.id);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await updateGalleryPhoto(id, { status: 'approved' });
      showToast(tr('तस्वीर स्वीकृत कर दी गई', 'تصویر منظور کر لی گئی', 'Photo approved successfully'), 'success');
      await fetchData(false);
    } catch (err) {
      console.error(err);
      showToast(tr('स्वीकृति विफल रही', 'منظوری ناکام رہی', 'Failed to approve photo'));
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteGalleryPhoto(id);
      showToast(tr('तस्वीर हटा दी गई', 'تصویر حذف کر دی گئی', 'Photo deleted successfully'), 'success');
      await fetchData(false);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      showToast(tr('तस्वीर हटाने में त्रुटि', 'حذف کرنے میں خرابی', 'Failed to delete photo'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      showToast(tr('कृपया एक छवि अपलोड करें', 'براہ کرم تصویر اپ لوڈ کریں', 'Please upload an image'));
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await updateGalleryPhoto(editingId, formData);
        showToast(tr('तस्वीर अपडेट हो गई', 'تصویر اپ ڈیٹ کر دی گئی', 'Photo updated successfully'), 'success');
      } else {
        const userDistrictVal = (activeUser?.district || activeUser?.city || '').trim();
        const newPhotoData = {
          ...formData,
          city: userDistrictVal,
          createdBy: activeUser.id,
          communityId: activeUser.communityId,
          status: isSuperOrExecutive ? ('approved' as const) : ('pending' as const),
        };
        await createGalleryPhoto(newPhotoData as Omit<GalleryPhoto, 'id'>);
        showToast(tr('तस्वीर सुरक्षित हो गई', 'تصویر محفوظ کر دی گئی', 'Photo created successfully'), 'success');
      }
      setIsModalOpen(false);
      await fetchData(false);
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || tr('सुरक्षित करने में त्रुटि', 'محفوظ کرنے میں خرابی', 'Failed to save photo'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(tr('छवि का आकार 5MB से कम होना चाहिए', 'تصویر کا سائز 5MB سے کم ہونا چاہیے', 'Image size should be less than 5MB'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // District Scoped Filtering
  const districtFilteredPhotos = useMemo(() => {
    let list = photos;

    if (isRestrictedToDistrict && userDistrict) {
      const target = userDistrict.toLowerCase().trim();
      const cleanTarget = (cleanDistrict || target).toLowerCase().trim();
      list = list.filter((p) => {
        const pCity = (p.city || '').toLowerCase().trim();
        return (
          pCity === target ||
          pCity === cleanTarget ||
          (pCity && (target.includes(pCity) || cleanTarget.includes(pCity) || pCity.includes(target) || pCity.includes(cleanTarget))) ||
          p.createdBy === activeUser.id
        );
      });
    } else if (isSuperOrExecutive && selectedDistrictFilter) {
      const target = selectedDistrictFilter.toLowerCase().trim();
      list = list.filter((p) => {
        const pCity = (p.city || '').toLowerCase().trim();
        return (
          pCity === target ||
          (pCity && target.includes(pCity)) ||
          (target && pCity.includes(target))
        );
      });
    }

    return list;
  }, [photos, isRestrictedToDistrict, userDistrict, cleanDistrict, selectedDistrictFilter, activeUser.id]);

  // Counts based on active district scope
  const counts = useMemo(() => {
    const pending = districtFilteredPhotos.filter((p) => (p.status || 'approved') === 'pending').length;
    const approved = districtFilteredPhotos.filter((p) => (p.status || 'approved') === 'approved').length;
    return {
      all: districtFilteredPhotos.length,
      pending,
      approved,
    };
  }, [districtFilteredPhotos]);

  // Filtered list with status filter and search query
  const displayedPhotos = useMemo(() => {
    return districtFilteredPhotos.filter((p) => {
      const pStatus = p.status || 'approved';
      const matchesStatus =
        activeFilter === 'all' ||
        (activeFilter === 'pending' && pStatus === 'pending') ||
        (activeFilter === 'approved' && pStatus === 'approved');

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.title?.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [districtFilteredPhotos, activeFilter, searchQuery]);

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
            <ImageIcon className="w-6 h-6" style={{ color: 'var(--mfct-gold)' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr('राहत कार्य गैलरी का प्रबंधन', 'ریلیف ورک گیلری کا انتظام', 'Manage Relief Work Gallery')}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-4xl" style={{ color: 'rgba(200,168,75,0.9)' }}>
              {tr(
                'सार्वजनिक गैलरी पृष्ठ पर दिखाई जाने वाली तस्वीरें जोड़ें, समीक्षा करें या स्वीकृति दें।',
                'عوامی گیلری پر دکھائی جانے والی تصاویر کا انتظام اور منظوری دیں۔',
                'Add, review, approve, and manage relief work photos displayed on the public gallery page.'
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
          <span>{tr('+ नई तस्वीर जोड़ें', '+ نئی تصویر شامل کریں', '+ Add Photo')}</span>
        </button>
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* District Role Filter Indicator Banner (matching KYC & UTR) */}
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
                    `केवल आपके जिले (${displayUserDistrict || 'निर्दिष्ट जिला'}) की तस्वीरें दिखाई जा रही हैं।`,
                    `صرف آپ کے ضلع (${displayUserDistrict || 'مخصوص ضلع'}) کی تصاویر دکھائی جا رہی ہیں۔`,
                    `Showing only gallery photos belonging to your designated district (${displayUserDistrict || 'Assigned District'}).`
                  )}
                  {isDistrictPresident && (
                    <span className="block mt-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                      {tr(
                        '(जिला अध्यक्ष अपने जिले की लंबित तस्वीरों को स्वीकृत कर सकते हैं)',
                        '(ضلعی صدر اپنے ضلع کی تصاویر منظور کر سکتے ہیں)',
                        '(District President has permission to approve photos from this district)'
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold text-[11px] shrink-0">
              {districtFilteredPhotos.length} {tr('तस्वीरें', 'تصاویر', districtFilteredPhotos.length === 1 ? 'Photo' : 'Photos')}
            </span>
          </div>
        )}

        {/* Filter Pills & Controls Bar (matching KYC & UTR) */}
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
              <span>{tr('लंबित तस्वीरें', 'زیر التواء', 'Pending Approval')}</span>
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
              <span>{tr('स्वीकृत तस्वीरें', 'منظور شدہ', 'Approved Photos')}</span>
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
              <span>{tr('सभी तस्वीरें', 'تمام تصاویر', 'All Photos')}</span>
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
                placeholder={tr('शीर्षक, शहर या श्रेणी खोजें...', 'عنوان، شہر یا زمرہ تلاش کریں...', 'Search title, city, category...')}
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

        {/* 3. Photo Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedPhotos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-300 mb-2">
              {tr('कोई तस्वीर नहीं मिली', 'کوئی تصویر نہیں ملی', 'No Gallery Photos Found')}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery || selectedDistrictFilter || activeFilter !== 'all'
                ? tr(
                    'चयनित फ़िल्टर के अनुसार कोई तस्वीर उपलब्ध नहीं है। कृपया फ़िल्टर बदलें।',
                    'منتخب کردہ فلٹر کے مطابق کوئی تصویر دستیاب نہیں ہے۔ براہ کرم فلٹر تبدیل کریں۔',
                    'No photos match the selected filter criteria. Try adjusting your filters or search query.'
                  )
                : tr('इस समय प्रदर्शित करने के लिए कोई तस्वीर नहीं है।', 'اس وقت دکھانے کے لیے کوئی تصویر موجود نہیں ہے۔', 'There are no photos to display at the moment.')}
            </p>
            <button
              onClick={handleOpenAdd}
              className="cursor-pointer px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 inline-flex items-center gap-1.5 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{tr('नई तस्वीर जोड़ें', 'نئی تصویر شامل کریں', 'Add Photo')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPhotos.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white font-bold text-[10px]">
                    {translateCategory(p.category, language)}
                  </div>
                  {p.status === 'pending' && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-amber-500/90 backdrop-blur-sm rounded text-white font-bold text-[10px] flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3" />
                      <span>{tr('स्वीकृति लंबित', 'زیر التواء', 'Pending')}</span>
                    </div>
                  )}
                  {p.status === 'approved' && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm rounded text-white font-bold text-[10px] flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tr('स्वीकृत', 'منظور شدہ', 'Approved')}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2" title={p.title}>
                      <DynamicText text={p.title} lang={language} />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <span>📍</span>
                      <DynamicText text={p.city} lang={language} fallback={translateCity(p.city, language)} />
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    {p.status === 'pending' && canApprovePhoto(p) && (
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={approvingId === p.id}
                        className="cursor-pointer flex-1 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                      >
                        {approvingId === p.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {approvingId === p.id
                            ? tr('स्वीकार हो रहा है...', 'منظور ہو رہا ہے...', 'Approving...')
                            : tr('स्वीकार करें', 'منظور کریں', 'Approve')}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="cursor-pointer flex-1 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{tr('संपादित करें', 'ترمیم', 'Edit')}</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="cursor-pointer flex-1 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
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
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editingId
                  ? tr('तस्वीर संपादित करें', 'تصویر میں ترمیم کریں', 'Edit Gallery Photo')
                  : tr('नई तस्वीर जोड़ें', 'نئی تصویر شامل کریں', 'Add Gallery Photo')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="gallery-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {tr('छवि URL या अपलोड करें', 'تصویر کا URL یا اپلوڈ کریں', 'Image URL or Upload')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="image"
                      value={formData.image?.startsWith('data:') ? '' : formData.image}
                      onChange={handleChange}
                      placeholder="e.g. https://images.unsplash.com/..."
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                    <span className="text-slate-400 text-xs font-bold shrink-0">{tr('या', 'یا', 'OR')}</span>
                    <label className="cursor-pointer shrink-0 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap">
                      {tr('अपलोड', 'اپلوڈ', 'Upload')}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="mt-3">
                      <img src={formData.image} alt="Preview" className="h-32 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('शीर्षक / विवरण', 'عنوان / مختصر تفصیل', 'Title / Short Story')}
                  </label>
                  <input
                    required
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {editingId ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('शहर / जिला', 'شہر / ضلع', 'City / District')}
                      </label>
                      <input
                        required
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleChange}
                        placeholder={isDistrictRole && userDistrict ? userDistrict : 'e.g. Bareilly'}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('श्रेणी', 'زمرہ', 'Category')}
                      </label>
                      <select
                        required
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      >
                        <option value="">{tr('-- श्रेणी चुनें --', '-- زمرہ منتخب کریں --', '-- Select Category --')}</option>
                        <option value="Medical Aid">Medical Aid</option>
                        <option value="Nikah Support">Nikah Support</option>
                        <option value="Child Education">Child Education</option>
                        <option value="Disaster Relief">Disaster Relief</option>
                        <option value="Food & Ration">Food & Ration</option>
                        <option value="Community Welfare">Community Welfare</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('श्रेणी', 'زمرہ', 'Category')}
                    </label>
                    <select
                      required
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="">{tr('-- श्रेणी चुनें --', '-- زمرہ منتخب کریں --', '-- Select Category --')}</option>
                      <option value="Medical Aid">Medical Aid</option>
                      <option value="Nikah Support">Nikah Support</option>
                      <option value="Child Education">Child Education</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Food & Ration">Food & Ration</option>
                      <option value="Community Welfare">Community Welfare</option>
                    </select>
                  </div>
                )}

                {formData.image && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      {tr('छवि पूर्वावलोकन', 'تصویر کا پیش منظر', 'Image Preview')}
                    </label>
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                disabled={isSaving}
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                type="submit"
                form="gallery-form"
                disabled={isSaving}
                className="cursor-pointer px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{tr('सुरक्षित हो रहा है...', 'محفوظ ہو رہا ہے...', 'Saving...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr('तस्वीर सुरक्षित करें', 'تصویر محفوظ کریں', 'Save Photo')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl">
              {tr('क्या आप तस्वीर हटाना चाहते हैं?', 'کیا آپ تصویر حذف کرنا چاہتے ہیں؟', 'Delete Gallery Photo?')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr(
                'क्या आप वाकई इस तस्वीर को गैलरी से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
                'کیا آپ واقعی اس تصویر کو گیلری سے حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
                'Are you sure you want to delete this photo from the gallery? This action cannot be undone.'
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
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId !== null}
                className="cursor-pointer px-6 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === deleteConfirmId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl text-white font-bold text-sm z-[100] animate-bounce ${
            toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        >
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};
