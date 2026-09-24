'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Community, User, UserRole, DistrictRoleKey } from '../../types';
import { getCommunities, createCommunity, updateCommunity, deleteCommunity } from '../../services/communityService';
import { getUsers, updateUser } from '../../services/userService';
import { PlusCircle, Edit2, Trash2, X, Building2, CheckCircle2, Camera, Upload, ImageIcon, Award, Search, Filter, MapPin, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText, autoTranslateCommunityData } from '../../lib/autoTranslate';
import { uploadImage } from '../../lib/storage';
import { useAppState } from '../../providers/AppStateProvider';
import { STANDARD_DISTRICTS } from '../../data/districtsData';
import { AdminCommunityCardSkeleton } from '../../components/Skeletons';
import { div } from 'motion/react-client';

const CommunityCard: React.FC<{
  community: Community;
  onEdit: (c: Community) => void;
  onDelete: (id: string) => void;
  canVerify?: boolean;
  onQuickVerify?: (id: string) => void;
}> = ({ community: c, onEdit, onDelete, canVerify, onQuickVerify }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(c.name, language);
  const displayCity = useDynamicTranslatedText(c.city, language);
  const displayState = useDynamicTranslatedText(c.state, language);
  const displayAdminName = useDynamicTranslatedText(c.adminName, language);

  const healthPct = Math.min(100, c.healthScore ?? 80);
  const healthColor = healthPct >= 80 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm dark:shadow-none">
      {/* Cover Image — always dark overlay regardless of mode */}
      <div className="relative h-36 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d3822 0%, #061c11 100%)' }}>
        {c.coverImage ? (
          <img
            src={c.coverImage}
            alt={c.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.onerror = null;
              img.style.display = 'none';
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Verified badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.verifiedStatus === 'Verified' ? 'bg-emerald-600/80 text-white'
            : c.verifiedStatus === 'Pending' ? 'bg-amber-500/80 text-white'
              : 'bg-rose-600/80 text-white'
            }`}>
            {c.verifiedStatus === 'Verified'
              ? tr('✓ सत्यापित', '✓ تصدیق شدہ', '✓ Verified')
              : c.verifiedStatus === 'Pending'
                ? tr('लंबित', 'زیر التواء', 'Pending')
                : tr('चिह्नित', 'نشان زدہ', 'Flagged')}
          </span>
        </div>

        {/* Avatar + Name + City */}
        <div className="absolute bottom-2 left-3 right-3 flex items-end gap-2">
          <img
            src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'C')}&background=059669&color=fff`}
            alt=""
            className="w-9 h-9 rounded-lg object-cover border-2 border-white shrink-0"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.onerror = null;
              img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'C')}&background=059669&color=fff`;
            }}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-emerald-400 truncate">
              {c.district ? `${c.district} • ` : ''}{displayCity || c.city}, {displayState || c.state}
            </p>
            <h4 className="font-bold text-sm text-white truncate">{displayName || c.name}</h4>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Admin row */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs">
          <span className="text-slate-500 dark:text-slate-500 shrink-0">{tr('प्रशासक:', 'ایڈمن:', 'Admin:')}</span>
          <span className="font-bold text-slate-900 dark:text-white truncate flex-1">{displayAdminName || c.adminName || '-'}</span>
          {c.adminRoleTitle && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">• {c.adminRoleTitle}</span>
          )}
        </div>

        {/* 4-metric grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col gap-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
            <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">{c.totalMembers.toLocaleString('en-IN')}</span>
            <span className="text-slate-500">{tr('सदस्य', 'ممبران', 'Members')}</span>
          </div>
          <div className="flex flex-col gap-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
            <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
              ₹{c.totalRaisedINR >= 100000 ? `${(c.totalRaisedINR / 100000).toFixed(1)}L` : c.totalRaisedINR.toLocaleString('en-IN')}
            </span>
            <span className="text-slate-500">{tr('एकत्रित', 'جمع شدہ', 'Raised')}</span>
          </div>
          <div className="flex flex-col gap-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
            <span className="font-black text-sm text-amber-500 dark:text-amber-400">{c.activeCampaigns ?? 0}</span>
            <span className="text-slate-500">{tr('अभियान', 'مہمات', 'Campaigns')}</span>
          </div>
          <div className="flex flex-col gap-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
            <span className="font-black text-sm text-violet-600 dark:text-violet-400">{c.establishedYear || 2024}</span>
            <span className="text-slate-500">{tr('स्थापना', 'قیام', 'Est. Year')}</span>
          </div>
        </div>

        {/* Health score bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">{tr('स्वास्थ्य स्कोर', 'ہیلتھ سکور', 'Health Score')}</span>
            <span className="font-bold" style={{ color: healthColor }}>{healthPct}%{healthPct >= 80 ? ' A' : ''}</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full transition-all" style={{ width: `${healthPct}%`, background: healthColor }} />
          </div>
        </div>

        {/* Edit / Delete / Verify */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
          {canVerify && c.verifiedStatus !== 'Verified' && onQuickVerify && (
            <button
              onClick={() => onQuickVerify(c.id)}
              className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title={tr('सत्यापित करें', 'تصدیق کریں', 'Approve & Verify Community')}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> {tr('सत्यापित करें', 'تصدیق کریں', 'Verify')}
            </button>
          )}
          <button
            onClick={() => onEdit(c)}
            className="flex-1 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> {tr('संपादित करें', 'ترمیم', 'Edit')}
          </button>
          <button
            onClick={() => onDelete(c.id)}
            className="flex-1 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> {tr('हटाएं', 'حذف کریں', 'Delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CommunitiesProps {
  activeUser?: User;
  currentRole?: UserRole;
}

export const Communities: React.FC<CommunitiesProps> = ({ activeUser: propActiveUser, currentRole: propCurrentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  // Safe fallback to AppStateProvider context if props are not explicitly supplied
  let contextUser: User | undefined;
  let contextRole: UserRole | undefined;
  try {
    const appState = useAppState();
    contextUser = appState.activeUser;
    contextRole = appState.currentRole;
  } catch {
    // Outside AppStateProvider fallback
  }

  const activeUser = propActiveUser || contextUser;
  const currentRole = propCurrentRole || contextRole;

  // Resolve whether user is a district president or has district responsibility
  const distRoleKeys: DistrictRoleKey[] = [
    'district_president',
    'district_coordinator',
    'district_gen_secretary',
    'district_secretary',
    'district_finance_coord',
  ];

  const rawDistRole = (
    activeUser?.district_role ||
    activeUser?.districtRole ||
    (activeUser?.role as string) ||
    ''
  ).toLowerCase().trim().replace(/\s+/g, '_');

  const isSuperOrExecutive =
    currentRole === 'super_admin' ||
    currentRole === 'executive_admin' ||
    activeUser?.role === 'super_admin' ||
    activeUser?.role === 'executive_admin';

  const isDistrictPresident =
    currentRole === 'district_president' ||
    rawDistRole === 'district_president' ||
    rawDistRole.includes('president');

  // Strictly use activeUser.district for District President
  const userDistrict = (activeUser?.district || activeUser?.city || '').trim();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickVerify = async (id: string) => {
    if (!isSuperOrExecutive) return;
    try {
      await updateCommunity(id, { verifiedStatus: 'Verified' });
      showToast(tr('समुदाय सफलतापूर्वक सत्यापित किया गया', 'کمیونٹی کی کامیابی سے تصدیق ہو گئی', 'Community verified successfully'), 'success');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast(tr('सत्यापन में विफल', 'تصدیق میں ناکامی', 'Failed to verify community'));
    }
  };

  const [formData, setFormData] = useState<Partial<Community> & { adminId?: string }>({
    name: '',
    district: '',
    city: '',
    state: '',
    adminName: '',
    adminRoleTitle: '',
    avatar: '',
    totalMembers: 0,
    activeCampaigns: 0,
    totalRaisedINR: 0,
    healthScore: 100,
    verifiedStatus: 'Verified',
    description: '',
    establishedYear: new Date().getFullYear(),
    coverImage: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [data, usersData] = await Promise.all([getCommunities(), getUsers()]);
      setCommunities(data);
      setAvailableUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Filter communities: for District President, strictly restrict to their district
  const filteredCommunities = useMemo(() => {
    let list = communities;

    // 1. District president restriction: strictly match by District, NOT by city or communityId
    if (isDistrictPresident && userDistrict) {
      const target = userDistrict.toLowerCase().trim();
      list = list.filter((c) => {
        const commDistrict = (c.district || c.city || '').toLowerCase().trim();
        return commDistrict === target;
      });
    } else if (selectedDistrictFilter) {
      // Super admin / Executive admin optional district filter
      const target = selectedDistrictFilter.toLowerCase().trim();
      list = list.filter((c) => {
        const commDistrict = (c.district || c.city || '').toLowerCase().trim();
        return commDistrict === target;
      });
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        ((c.district || '')).toLowerCase().includes(q) ||
        (c.adminName || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [communities, isDistrictPresident, userDistrict, selectedDistrictFilter, searchQuery]);

  // Candidate users for becoming community admin:
  // - Super Admin & Executive Admin: all users are visible
  // - District President: only users from their specific district appear as candidates
  const candidateUsers = useMemo(() => {
    const districtRoles = [
      'district_president',
      'district_coordinator',
      'district_gen_secretary',
      'district_secretary',
      'district_finance_coord',
      'community_admin'
    ];

    // District President / user with district context
    if (isDistrictPresident || userDistrict) {
      const target = (userDistrict || '').toLowerCase().trim();

      return availableUsers.filter((u) => {
        // Remove users who already have a district-level role
        if (districtRoles.includes(u.districtRole || '')) {
          return false;
        }

        // If district is available, only show users from that district
        if (target) {
          const uDist = (u.district || '').toLowerCase().trim();
          const uCity = (u.city || '').toLowerCase().trim();

          return (
            uDist === target ||
            uCity === target ||
            (formData.adminId && u.id === formData.adminId)
          );
        }

        return true;
      });
    }

    // Super Admin / Executive
    if (isSuperOrExecutive) {
      return availableUsers;
    }

    return availableUsers;
  }, [
    availableUsers,
    isSuperOrExecutive,
    isDistrictPresident,
    userDistrict,
    formData.adminId,
  ]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setAvatarFile(null);
    setAvatarPreview('');
    setCoverFile(null);
    setCoverPreview('');
    setFormData({
      name: '',
      city: userDistrict,
      state: activeUser?.state || 'Uttar Pradesh',
      adminName: '',
      adminRoleTitle: 'community_admin',
      adminId: '',
      avatar: '',
      totalMembers: 0,
      activeCampaigns: 0,
      totalRaisedINR: 0,
      healthScore: 100,
      verifiedStatus: isSuperOrExecutive ? 'Verified' : 'Pending',
      description: '',
      establishedYear: new Date().getFullYear(),
      coverImage: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Community) => {
    setEditingId(c.id);
    setAvatarFile(null);
    setAvatarPreview(c.avatar || '');
    setCoverFile(null);
    setCoverPreview(c.coverImage || '');
    const existingAdmin = availableUsers.find((u) => u.name === c.adminName || u.id === (c as any).adminId);
    setFormData({
      ...c,
      district: c.district || c.city || '',
      adminId: existingAdmin ? existingAdmin.id : '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCommunity(id);
      showToast(tr('समुदाय हटा दिया गया', 'کمیونٹی حذف کر دی گئی', 'Community deleted successfully'), 'success');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(tr('समुदाय हटाने में त्रुटि', 'کمیونٹی حذف کرنے میں خرابی', 'Failed to delete community'));
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Upload a file: tries Supabase Storage via /api/upload,
   * falls back to base64 data URL so the image always saves.
   */
  const uploadFileWithFallback = async (file: File, folder: string): Promise<string> => {
    try {
      const url = await uploadImage(folder, file);
      // uploadImage already has error handling; if it returns an unsplash URL it failed
      // In that case fall back to base64 so the user's actual image is preserved
      if (url && !url.includes('unsplash.com')) return url;
    } catch {
      // ignore, fall through to base64
    }
    // Reliable base64 fallback
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Upload avatar if a new file was selected
      let resolvedAvatar = formData.avatar || '';
      if (avatarFile) {
        resolvedAvatar = await uploadFileWithFallback(avatarFile, 'community-avatars');
      }
      // Upload cover image if a new file was selected
      let resolvedCover = formData.coverImage || '';
      if (coverFile) {
        resolvedCover = await uploadFileWithFallback(coverFile, 'community-covers');
      }

      // Verification status rules:
      // - Creating: Super Admin & Executive Admin -> 'Verified'; District President -> strictly 'Pending'
      // - Editing: only Super Admin & Executive Admin can promote to 'Verified'
      let resolvedStatus: Community['verifiedStatus'] = 'Pending';
      if (editingId) {
        if (isSuperOrExecutive) {
          resolvedStatus = (formData.verifiedStatus as Community['verifiedStatus']) || 'Verified';
        } else {
          const existingComm = communities.find((c) => c.id === editingId);
          resolvedStatus = existingComm?.verifiedStatus === 'Verified' ? 'Verified' : 'Pending';
        }
      } else {
        resolvedStatus = isSuperOrExecutive ? ((formData.verifiedStatus as Community['verifiedStatus']) || 'Verified') : 'Pending';
      }

      const finalFormData = {
        ...formData,
        district: formData.district || (isDistrictPresident ? userDistrict : '') || formData.city || '',
        verifiedStatus: resolvedStatus,
        avatar: resolvedAvatar,
        coverImage: resolvedCover,
      };

      let savedCommunity: Community;
      if (editingId) {
        savedCommunity = await updateCommunity(editingId, finalFormData);
      } else {
        savedCommunity = await createCommunity({
          ...finalFormData,
          avatar: resolvedAvatar || '',
          totalMembers: Number(finalFormData.totalMembers) || 0,
          activeCampaigns: Number(finalFormData.activeCampaigns) || 0,
          totalRaisedINR: Number(finalFormData.totalRaisedINR) || 0,
          healthScore: Number(finalFormData.healthScore) || 100,
          verifiedStatus: resolvedStatus,
          description: finalFormData.description || '',
          establishedYear: Number(finalFormData.establishedYear) || new Date().getFullYear(),
        } as Omit<Community, 'id'>);
      }

      // Auto-translate community metadata using Groq AI for instant Hindi & Urdu caching
      try {
        await autoTranslateCommunityData(
          finalFormData.name || '',
          finalFormData.description || '',
          finalFormData.city || '',
          finalFormData.state || ''
        );
      } catch (tErr) {
        console.warn('Community auto-translation notice:', tErr);
      }

      if (formData.adminId) {
        await updateUser(formData.adminId, {
          districtRole: 'community_admin',
          district_role: 'community_admin',
          district: finalFormData.city,
          communityId: savedCommunity.id,
          communityName: savedCommunity.name,
        });
      }

      setIsModalOpen(false);
      showToast(tr('समुदाय सुरक्षित हो गया', 'کمیونٹی محفوظ ہو گئی', 'Community saved successfully'), 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(tr('सुरक्षित करने में त्रुटि', 'محفوظ کرنے میں خرابی', 'Failed to save community'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'adminId') {
      const selectedUser = availableUsers.find((u) => u.id === value);
      setFormData((prev) => ({
        ...prev,
        adminId: value,
        adminName: selectedUser ? selectedUser.name : '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast(tr('छवि 5MB से कम होनी चाहिए', 'تصویر 5MB سے کم ہونی چاہیے', 'Avatar image must be less than 5MB'));
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast(tr('छवि 5MB से कम होनी चाहिए', 'تصویر 5MB سے کم ہونی چاہیے', 'Cover image must be less than 5MB'));
      return;
    }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0a1c12 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.18)' }} />

        <div className="flex items-start gap-4 relative z-10">
          <div
            className="p-3.5 rounded-2xl shrink-0 mt-0.5"
            style={{
              background: 'rgba(200,168,75,0.15)',
              border: '1px solid rgba(200,168,75,0.35)',
            }}
          >
            <Building2 className="w-6 h-6" style={{ color: 'var(--mfct-gold)' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr('समुदाय प्रबंधन', 'کمیونٹیز کا انتظام', 'Manage Communities')}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-4xl" style={{ color: 'rgba(200,168,75,0.9)' }}>
              {tr(
                'प्लेटफ़ॉर्म से समुदाय जोड़ें, संपादित करें या हटाएं एवं क्षेत्रीय नेटवर्क का विस्तार करें।',
                'پلیٹ فارم سے کمیونٹیز شامل کریں، ترمیم کریں یا حذف کریں اور علاقائی نیٹ ورک کو وسعت دیں۔',
                'Add, edit, or remove communities from the platform and manage grassroots chapters.'
              )}
            </p>
          </div>
        </div>

        {/* Action Button on Right */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenAdd}
            className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--mfct-gold) 0%, #d4af37 100%)',
              color: 'var(--mfct-dark-green)',
              boxShadow: '0 4px 15px rgba(200,168,75,0.35)',
            }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{tr('+ नया समुदाय जोड़ें', '+ نئی کمیونٹی شامل کریں', '+ Add Community')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">

        {/* District President Filter Indicator Banner */}
        {isDistrictPresident && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <span>{tr('जिला अध्यक्ष दृश्य', 'ضلعی صدر منظر', 'District President View')}</span>
                  {userDistrict && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                      {userDistrict}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  {tr(
                    `केवल आपके जिले (${userDistrict || 'निर्दिष्ट जिला'}) के समुदाय दिखाए जा रहे हैं।`,
                    `صرف آپ کے ضلع (${userDistrict || 'مخصوص ضلع'}) کی کمیونٹیز دکھائی جا رہی ہیں۔`,
                    `Showing only communities belonging to your designated district (${userDistrict || 'Assigned District'}).`
                  )}
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold text-[11px] shrink-0">
              {filteredCommunities.length} {tr('समुदाय', 'کمیونٹیز', filteredCommunities.length === 1 ? 'Community' : 'Communities')}
            </span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={tr('समुदाय, शहर या व्यवस्थापक खोजें...', 'کمیونٹی، شہر یا منتظم تلاش کریں...', 'Search community, city, or admin...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!isDistrictPresident && (
            <div className="flex items-center gap-2">
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
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AdminCommunityCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {isDistrictPresident
                  ? tr(
                    `जिला ${userDistrict || ''} में कोई समुदाय नहीं मिला`,
                    `ضلع ${userDistrict || ''} میں کوئی کمیونٹی نہیں ملی`,
                    `No communities found for ${userDistrict || 'your district'}`
                  )
                  : tr('कोई समुदाय नहीं मिला', 'کوئی کمیونٹی نہیں ملی', 'No communities found')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                {isDistrictPresident
                  ? tr(
                    `आप अपने जिले (${userDistrict}) के लिए नया समुदाय बनाने के लिए नीचे दिए गए बटन पर क्लिक करें।`,
                    `آپ اپنے ضلع (${userDistrict}) کے لیے نئی کمیونٹی بنانے کے لیے نیچے دیے گئے بٹن پر کلک کریں۔`,
                    `Click below to establish the official community chapter for ${userDistrict}.`
                  )
                  : tr('अपनी खोज को समायोजित करें या नया समुदाय जोड़ें।', 'اپنی تلاش تبدیل کریں یا نئی کمیونٹی شامل کریں۔', 'Try adjusting your search or add a new community.')}
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{tr('+ नया समुदाय जोड़ें', '+ نئی کمیونٹی شامل کریں', '+ Add Community')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                canVerify={isSuperOrExecutive}
                onQuickVerify={handleQuickVerify}
                onEdit={handleOpenEdit}
                onDelete={(id) => setDeleteConfirmId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-black text-slate-900 dark:text-white text-lg">
                {editingId ? tr('समुदाय संपादित करें', 'کمیونٹی میں ترمیم کریں', 'Edit Community') : tr('नया समुदाय जोड़ें', 'نئی کمیونٹی شامل کریں', 'Add New Community')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="community-form" onSubmit={handleSubmit} className="space-y-6">

                {/* Avatar Upload Section */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
                    {tr('समुदाय का अवतार / लोगो', 'کمیونٹی اوتار / لوگو', 'Community Avatar / Logo')}
                  </h4>
                  <div className="flex items-start gap-4">
                    {/* Avatar Preview */}
                    <div className="relative shrink-0">
                      <img
                        src={
                          avatarPreview ||
                          formData.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'C')}&background=059669&color=fff`
                        }
                        alt="Avatar Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.onerror = null;
                          img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'C')}&background=059669&color=fff`;
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
                        title={tr('अवतार बदलें', 'اوتار تبدیل کریں', 'Change avatar')}
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                      />
                    </div>

                    {/* URL or Upload controls */}
                    <div className="flex-1 space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        {tr('URL से या फ़ाइल अपलोड करें', 'URL سے یا فائل اپلوڈ کریں', 'Paste URL or upload a file')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="avatar"
                          value={avatarFile ? '' : (formData.avatar || '')}
                          onChange={(e) => {
                            setAvatarFile(null);
                            setAvatarPreview(e.target.value);
                            setFormData((prev) => ({ ...prev, avatar: e.target.value }));
                          }}
                          placeholder="https://..."
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                        />
                        <span className="text-slate-400 text-xs font-bold shrink-0">{tr('या', 'یا', 'OR')}</span>
                        <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap">
                          <Upload className="w-3.5 h-3.5" />
                          {tr('अपलोड', 'اپلوڈ', 'Upload')}
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
                        </label>
                      </div>
                      {avatarFile && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ {avatarFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
                    {tr('मूल विवरण', 'بنیادی تفصیلات', 'Basic Details')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('समुदाय का नाम', 'کمیونٹی کا نام', 'Community Name')}
                      </label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('स्थापना वर्ष', 'قیام کا سال', 'Established Year')}
                      </label>
                      <input
                        required
                        type="number"
                        name="establishedYear"
                        value={formData.establishedYear}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('जिला', 'ضلع', 'District')}
                      </label>
                      <select
                        required
                        name="district"
                        value={formData.district || (isDistrictPresident ? userDistrict : '')}
                        disabled={isDistrictPresident && !!userDistrict}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="">{tr('-- जिला चुनें --', '-- ضلع منتخب کریں --', '-- Select District --')}</option>
                        {STANDARD_DISTRICTS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {language === 'hi' ? d.nameHi : language === 'ur' ? d.nameUr : d.nameEn}
                          </option>
                        ))}
                      </select>
                      {isDistrictPresident && userDistrict && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{tr(`आपके जिले (${userDistrict}) के लिए लॉक है`, `آپ کے ضلع (${userDistrict}) کے لیے مقفل`, `Locked to your district (${userDistrict})`)}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('राज्य', 'ریاست', 'State')}
                      </label>
                      <input
                        required
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
                    {tr('व्यवस्थापक असाइन करें', 'ایڈمن تفویض کریں', 'Assign Admin')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('उपयोगकर्ता चुनें', 'صارف منتخب کریں', 'Select User (Admin)')}
                      </label>
                      <select
                        name="adminId"
                        value={formData.adminId || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      >
                        <option value="">{tr('-- पंजीकृत उपयोगकर्ता चुनें --', '-- رجسٹرڈ صارف منتخب کریں --', '-- Select a registered user --')}</option>
                        {candidateUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({isSuperOrExecutive && `${u.district_role} - ${u.district}`})
                          </option>
                        ))}
                      </select>
                      {isDistrictPresident && userDistrict && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                          {tr(
                            `केवल आपके जिले (${userDistrict}) के पंजीकृत सदस्य व्यवस्थापक उम्मीदवार के रूप में दिखाए जा रहे हैं (${candidateUsers.length})`,
                            `صرف آپ کے ضلع (${userDistrict}) کے رجسٹرڈ ارکان ایڈمن امیدوار کے طور پر دستیاب ہیں (${candidateUsers.length})`,
                            `Showing only registered members from your district (${userDistrict}) as admin candidates (${candidateUsers.length})`
                          )}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('भूमिका शीर्षक', 'کردار کا عنوان', 'Admin Role Title')}
                      </label>
                      <input
                        readOnly
                        type="text"
                        value="community_admin"
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Status Section */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
                    <span>{tr('सत्यापन स्थिति', 'تصدیقی حیثیت', 'Verification Status')}</span>
                    {!isSuperOrExecutive && (
                      <span className="text-[10px] font-normal text-slate-500 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-500" />
                        {tr('केवल सुपर / कार्यकारी एडमिन सत्यापित कर सकते हैं', 'صرف سپر یا ایگزیکٹو ایڈمن تصدیق کر سکتے ہیں', 'Only Super / Exec Admin can verify')}
                      </span>
                    )}
                  </h4>
                  {isSuperOrExecutive ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tr('समुदाय सत्यापन स्थिति चुनें', 'کمیونٹی کی تصدیقی حیثیت منتخب کریں', 'Community Verification Status')}
                      </label>
                      <select
                        name="verifiedStatus"
                        value={formData.verifiedStatus || 'Verified'}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer"
                      >
                        <option value="Verified">{tr('✓ सत्यापित (Verified)', '✓ تصدیق شدہ', '✓ Verified (Approved)')}</option>
                        <option value="Pending">{tr('⏳ लंबित (Pending Approval)', '⏳ زیر التواء', '⏳ Pending Approval')}</option>
                        <option value="Flagged">{tr('🚩 चिह्नित (Flagged)', '🚩 نشان زدہ', '🚩 Flagged')}</option>
                      </select>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {tr(
                          'सत्यापित स्थिति समुदाय को आधिकारिक बनाती है। केवल सुपर / कार्यकारी एडमिन इसे सेट कर सकते हैं।',
                          'تصدیق شدہ حیثیت کمیونٹی کو باضابطہ بناتی ہے۔ صرف سپر یا ایگزیکٹو ایڈمن اسے سیٹ کر سکتے ہیں۔',
                          'Verified status officially validates the community. Only Super / Executive Admin can set this.'
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${formData.verifiedStatus === 'Verified'
                          ? 'bg-emerald-600/80 text-white'
                          : formData.verifiedStatus === 'Flagged'
                            ? 'bg-rose-600/80 text-white'
                            : 'bg-amber-500/80 text-white'
                          }`}>
                          {formData.verifiedStatus === 'Verified'
                            ? tr('✓ सत्यापित', '✓ تصدیق شدہ', '✓ Verified')
                            : formData.verifiedStatus === 'Flagged'
                              ? tr('चिह्नित', 'نشان زدہ', 'Flagged')
                              : tr('⏳ लंबित अनुमोदन', '⏳ زیر التواء منظوری', '⏳ Pending Approval')}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {editingId
                            ? (formData.verifiedStatus === 'Verified'
                              ? tr('यह समुदाय पहले से सत्यापित है।', 'یہ کمیونٹی پہلے سے تصدیق شدہ ہے۔', 'This community is officially verified.')
                              : tr('कार्यकारी / सुपर एडमिन से सत्यापन की प्रतीक्षा है।', 'ایگزیکٹو یا سپر ایڈمن کی تصدیق کا انتظار ہے۔', 'Awaiting approval and verification from Executive / Super Admin.'))
                            : tr(
                              'जिला अध्यक्ष द्वारा बनाए गए नए समुदाय डिफ़ॉल्ट रूप से "लंबित" रहते हैं।',
                              'ضلعی صدر کی بنائی گئی نئی کمیونٹی خود بخود "زیر التواء" رہے گی۔',
                              'New communities created by District President are set to "Pending" until approved by Executive/Super Admin.'
                            )}
                        </span>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0" />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
                    {tr('विवरण', 'تفصیل', 'Description')}
                  </h4>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"
                  ></textarea>
                </div>

                {/* Cover Image Section */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
                    {tr('कवर / बैनर इमेज', 'کور / بینر تصویر', 'Cover / Banner Image')}
                  </h4>
                  <div className="space-y-3">
                    {/* Cover preview */}
                    {(coverPreview || formData.coverImage) && (
                      <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img
                          src={coverPreview || formData.coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            img.onerror = null;
                            img.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute bottom-2 left-3 text-white text-xs font-bold opacity-80">
                          {tr('पूर्वावलोकन', 'پیش منظر', 'Preview')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="coverImage"
                        value={coverFile ? '' : (formData.coverImage || '')}
                        onChange={(e) => {
                          setCoverFile(null);
                          setCoverPreview(e.target.value);
                          setFormData((prev) => ({ ...prev, coverImage: e.target.value }));
                        }}
                        placeholder="https://..."
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      />
                      <span className="text-slate-400 text-xs font-bold shrink-0">{tr('या', 'یا', 'OR')}</span>
                      <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap">
                        <Upload className="w-3.5 h-3.5" />
                        {tr('अपलोड', 'اپلوڈ', 'Upload')}
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverFileChange}
                        />
                      </label>
                    </div>
                    {coverFile && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {coverFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="cursor-pointer px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                disabled={isSubmitting}
                type="submit"
                form="community-form"
                className="cursor-pointer px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{tr('सुरक्षित हो रहा है...', 'محفوظ ہو رہا ہے...', 'Saving...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr('समुदाय सुरक्षित करें', 'کمیونٹی محفوظ کریں', 'Save Community')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl">
              {tr('समुदाय हटाएं?', 'کمیونٹی حذف کریں؟', 'Delete Community?')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr(
                'क्या आप वाकई इस समुदाय को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
                'کیا آپ واقعی اس کمیونٹی کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
                'Are you sure you want to delete this community? This action cannot be undone.'
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
                    <Trash2 className="w-4 h-4" />
                    <span>{tr('हाँ, हटाएं', 'ہاں، حذف کریں', 'Yes, Delete')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg z-[100] text-xs font-bold text-white transition-all transform duration-300 ease-out ${toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
        >
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};
