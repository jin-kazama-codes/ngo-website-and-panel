'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole, Community } from '../../types';
import { getUsers, createUser, deleteUser, updateUser } from '../../services/userService';
import { getCommunities } from '../../services/communityService';
import { hashPassword } from '../../lib/auth';
import { PlusCircle, Edit2, X, Users, CheckCircle2, Search, Upload, Trash2, Mail, Phone, MapPin, Award, Eye, ShieldCheck, FileText, Building2, Calendar, ExternalLink, Lock, Filter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText, autoTranslateText } from '../../lib/autoTranslate';
import { translateReligion, translateHelpType, translateDistrictRole } from '../../lib/translateEntity';
import { STANDARD_DISTRICTS } from '../../data/districtsData';

// Interactive Dynamic User Row with real-time language conversion for Desktop Table
const UserRow: React.FC<{
  user: User;
  onView: (u: User) => void;
  onAssignRole: (u: User) => void;
  onDelete: (id: string) => void;
}> = ({ user, onView, onAssignRole, onDelete }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(user.name, language) || user.name;
  const displayCity = useDynamicTranslatedText(user.city, language) || user.city;
  const displayDistrict = user.district ? (useDynamicTranslatedText(user.district, language) || user.district) : '';
  const displayState = useDynamicTranslatedText(user.state, language) || user.state;

  const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];
  const effectiveDistrictRole = user.districtRole || user.district_role || (distRoleKeys.includes(user.role) ? user.role : '');

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return tr('सुपर एडमिन', 'سپر ایڈمن', 'SUPER ADMIN');
      case 'executive_admin':
        return tr('कार्यकारी एडमिन', 'ایگزیکٹو ایڈمن', 'EXECUTIVE ADMIN');
      case 'community_admin':
        return tr('सामुदायिक एडमिन', 'کمیونٹی ایڈمن', 'COMMUNITY ADMIN');
      case 'district_president':
        return tr('जिला अध्यक्ष', 'ضلعی صدر', 'DISTRICT PRESIDENT');
      case 'district_coordinator':
        return tr('जिला सहयोजक', 'ضلعی کوآرڈینیٹر', 'DISTRICT COORDINATOR');
      case 'district_gen_secretary':
        return tr('जिला महासचिव', 'ضلعی جنرل سیکرٹری', 'DISTRICT GEN SEC');
      case 'district_secretary':
        return tr('जिला सचिव', 'ضلعی سیکرٹری', 'DISTRICT SECRETARY');
      case 'district_finance_coord':
        return tr('जिला वित्त समन्वयक', 'ضلعی فنانس کوآرڈینیٹر', 'DISTRICT FINANCE COORD');
      default:
        return tr('सदस्य', 'ممبر', 'MEMBER');
    }
  };

  const locationText = [displayCity, displayState].filter(Boolean).join(', ') || '-';

  const safeAvatar = (user.avatar && !user.avatar.startsWith('file://'))
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;

  const isDistrictRole = distRoleKeys.includes(user.role);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={safeAvatar}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 object-cover shrink-0"
          />
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{displayName}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">ID: {user.membershipId || user.id.slice(0, 8)}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1 items-start">
          <span
            className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded text-[10px] font-bold ${user.role === 'super_admin'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
              : user.role === 'executive_admin'
                ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50'
                : user.role === 'community_admin'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                  : isDistrictRole
                    ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-xs'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
          >
            {getRoleLabel(user.role)}
          </span>
        </div>
      </td>
      {/* District Role Column (Role + District combined) */}
      <td className="px-4 py-3 whitespace-nowrap">
        {effectiveDistrictRole ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-xs">
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {translateDistrictRole(effectiveDistrictRole, language)}
              {displayDistrict ? ` (${displayDistrict})` : ''}
            </span>
          </span>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        )}
      </td>
      {/* Location Column */}
      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
        <div>{locationText}</div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onView(user)}
            className="cursor-pointer px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
            title={tr('विवरण देखें', 'تفصیلات دیکھیں', 'View Details')}
          >
            <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{tr('विवरण', 'تفصیل', 'View')}</span>
          </button>
          <button
            onClick={() => onAssignRole(user)}
            className="cursor-pointer px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
            title={tr('भूमिका सौंपें', 'عہدہ تفویض کریں', 'Assign Role')}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{tr('भूमिका सौंपें', 'عہدہ تفویض کریں', 'Assign Role')}</span>
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="cursor-pointer p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors inline-flex"
            title={tr('हटाएं', 'حذف کریں', 'Delete User')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Mobile-Optimized User Card
const UserMobileCard: React.FC<{
  user: User;
  onView: (u: User) => void;
  onAssignRole: (u: User) => void;
  onDelete: (id: string) => void;
}> = ({ user, onView, onAssignRole, onDelete }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(user.name, language) || user.name;
  const displayCity = useDynamicTranslatedText(user.city, language) || user.city;
  const displayDistrict = user.district ? (useDynamicTranslatedText(user.district, language) || user.district) : '';
  const displayState = useDynamicTranslatedText(user.state, language) || user.state;

  const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];
  const effectiveDistrictRole = user.districtRole || user.district_role || (distRoleKeys.includes(user.role) ? user.role : '');

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return tr('सुपर एडमिन', 'سپر ایڈمن', 'SUPER ADMIN');
      case 'executive_admin':
        return tr('कार्यकारी एडमिन', 'ایگزیکٹو ایڈمن', 'EXECUTIVE ADMIN');
      case 'community_admin':
        return tr('सामुदायिक एडमिन', 'کمیونٹی ایڈمن', 'COMMUNITY ADMIN');
      case 'district_president':
        return tr('जिला अध्यक्ष', 'ضلعی صدر', 'DISTRICT PRESIDENT');
      case 'district_coordinator':
        return tr('जिला सहयोजक', 'ضلعی کوآرڈینیٹر', 'DISTRICT COORDINATOR');
      case 'district_gen_secretary':
        return tr('जिला महासचिव', 'ضلعی جنرل سیکرٹری', 'DISTRICT GEN SEC');
      case 'district_secretary':
        return tr('जिला सचिव', 'ضلعی سیکرٹری', 'DISTRICT SECRETARY');
      case 'district_finance_coord':
        return tr('जिला वित्त समन्वयक', 'ضلعی فنانس کوآرڈینیٹر', 'DISTRICT FINANCE COORD');
      default:
        return tr('सदस्य', 'ممبر', 'MEMBER');
    }
  };

  const locationText = [displayCity, displayState].filter(Boolean).join(', ') || '-';
  const safeAvatar = (user.avatar && !user.avatar.startsWith('file://'))
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;

  const isDistrictRole = distRoleKeys.includes(user.role);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={safeAvatar}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;
            }}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{displayName}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">ID: {user.membershipId || user.id.slice(0, 8)}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`shrink-0 px-2.5 py-0.5 rounded text-[10px] font-extrabold ${user.role === 'super_admin'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
              : user.role === 'executive_admin'
                ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50'
                : user.role === 'community_admin'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                  : isDistrictRole
                    ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-xs'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
          >
            {getRoleLabel(user.role)}
          </span>
        </div>
      </div>

      {/* District Role Badge (with district) */}
      {effectiveDistrictRole && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-[10px] font-extrabold shadow-xs">
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {translateDistrictRole(effectiveDistrictRole, language)}
              {displayDistrict ? ` (${displayDistrict})` : ''}
            </span>
          </span>
        </div>
      )}

      <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
        {user.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono text-xs truncate">{user.email}</span>
          </div>
        )}
        {user.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono text-xs">{user.phone}</span>
          </div>
        )}
        {locationText !== '-' && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs truncate">{locationText}</span>
          </div>
        )}
        {user.religion && (
          <div className="pt-0.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${user.religion === 'Muslim'
              ? user.isMalikENisab
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}>
              {user.religion === 'Muslim'
                ? user.isMalikENisab
                  ? tr('मुस्लिम (साहिब-ए-निसाब)', 'مسلم (صاحبِ نصاب)', 'Muslim (Sahib-e-Nisab)')
                  : `${tr('मुस्लिम', 'مسلم', 'Muslim')} (${tr('ज़रूरत', 'ضرورت', 'Need')}: ${translateHelpType(user.helpType, language) || tr('सहायता', 'امداد', 'Aid')})`
                : translateReligion(user.religion, language)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <button
          onClick={() => onView(user)}
          className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-sky-500" />
          <span>{tr('विवरण देखें', 'تفصیلات دیکھیں', 'View Details')}</span>
        </button>
        <button
          onClick={() => onAssignRole(user)}
          className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>{tr('भूमिका सौंपें', 'عہدہ تفویض کریں', 'Assign Role')}</span>
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>{tr('हटाएं', 'حذف کریں', 'Delete')}</span>
        </button>
      </div>
    </div>
  );
};

export const ManageUsers: React.FC = () => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [viewUser, setViewUser] = useState<User | null>(null);
  const [assignRoleUser, setAssignRoleUser] = useState<User | null>(null);
  const [assignDistrict, setAssignDistrict] = useState('');
  const [assignRole, setAssignRole] = useState<string>('member');
  const [isAssigningRole, setIsAssigningRole] = useState(false);

  const handleOpenAssignRole = (u: User) => {
    setAssignRoleUser(u);
    const resolvedDistrict = (u.district || u.city || '').trim();
    setAssignDistrict(resolvedDistrict);
    const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];
    const currentDistRole = u.districtRole || u.district_role || '';
    if (currentDistRole && distRoleKeys.includes(currentDistRole)) {
      setAssignRole(currentDistRole);
    } else {
      setAssignRole(u.role || 'member');
    }
  };

  const handleSaveAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRoleUser) return;
    setIsAssigningRole(true);
    try {
      const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];
      const isDistrictRole = distRoleKeys.includes(assignRole);
      const finalDistrictRole = isDistrictRole ? assignRole : undefined;
      const finalDistrict = (assignRoleUser.district || assignRoleUser.city || assignDistrict).trim();

      await updateUser(assignRoleUser.id, {
        district: finalDistrict || undefined,
        districtRole: finalDistrictRole,
        district_role: finalDistrictRole,
      });

      if (finalDistrict) {
        autoTranslateText(finalDistrict, 'hi').catch(() => { });
        autoTranslateText(finalDistrict, 'ur').catch(() => { });
      }

      showToast(tr('भूमिका व जिला सफलतापूर्वक सौंपा गया', 'عہدہ اور ضلع کامیابی سے تفویض کیا گیا', 'Role & District assigned successfully!'), 'success');
      setAssignRoleUser(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || tr('भूमिका सौंपने में त्रुटि', 'عہدہ تفویض کرنے میں خرابی', 'Failed to assign role'));
    } finally {
      setIsAssigningRole(false);
    }
  };

  const [communities, setCommunities] = useState<Community[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [existingAvatar, setExistingAvatar] = useState<string | null>(null);
  const [existingDoc, setExistingDoc] = useState<string | null>(null);
  const [existingScreenshot, setExistingScreenshot] = useState<string | null>(null);

  const initialFormState: Partial<User> & { plainPassword?: string } = {
    name: '',
    email: '',
    phone: '',
    role: 'member',
    city: '',
    district: '',
    districtRole: '',
    state: '',
    plainPassword: '',
    communityId: '',
    paymentUtr: '',
    religion: '',
    isMalikENisab: undefined,
    helpType: '',
    helpDetails: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('');
  const [selectedReligionFilter, setSelectedReligionFilter] = useState('all');
  const [selectedNisabFilter, setSelectedNisabFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      const filteredMembers = data.filter(
        (member) =>
          member.role !== 'super_admin' &&
          member.role !== 'executive_admin'
      );
      setUsers(filteredMembers);
      const comms = await getCommunities();
      setCommunities(comms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setAvatarFile(null);
    setDocumentFile(null);
    setScreenshotFile(null);
    setExistingAvatar(null);
    setExistingDoc(null);
    setExistingScreenshot(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];
    const assignedDistRole = user.districtRole || user.district_role || (distRoleKeys.includes(user.role) ? user.role : '');

    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'member',
      city: user.city,
      district: user.district || user.city || '',
      districtRole: assignedDistRole,
      state: user.state,
      communityId: user.communityId || '',
      paymentUtr: user.paymentUtr || '',
      religion: user.religion || '',
      isMalikENisab: user.isMalikENisab,
      helpType: user.helpType || '',
      helpDetails: user.helpDetails || '',
    });
    setAvatarFile(null);
    setDocumentFile(null);
    setScreenshotFile(null);
    setExistingAvatar(user.avatar || null);
    setExistingDoc(user.documentUrl || null);
    setExistingScreenshot(user.paymentScreenshotUrl || null);
    setIsModalOpen(true);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteUser(id);
      showToast(tr('उपयोगकर्ता हटा दिया गया', 'صارف کامیابی سے حذف کر دیا گیا', 'User deleted successfully'), 'success');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(tr('उपयोगकर्ता हटाने में त्रुटि', 'صارف حذف کرنے میں خرابی', 'Failed to delete user'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const comm = communities.find((c) => c.id === formData.communityId);
      const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];
      const finalDistrictRole = formData.districtRole || (distRoleKeys.includes(formData.role || '') ? formData.role : undefined);
      const finalDistrict = formData.district?.trim() || undefined;

      let avatarUrl =
        existingAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || '')}&background=random`;
      if (avatarFile) avatarUrl = await fileToBase64(avatarFile);

      let docUrl = existingDoc || undefined;
      if (documentFile) docUrl = await fileToBase64(documentFile);

      let screenshotUrl = existingScreenshot || undefined;
      if (screenshotFile) screenshotUrl = await fileToBase64(screenshotFile);

      if (editingId) {
        const patch: Partial<User> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role as UserRole,
          city: formData.city,
          district: finalDistrict,
          districtRole: finalDistrictRole,
          district_role: finalDistrictRole,
          state: formData.state,
          communityId: comm?.id || '',
          communityName: comm?.name || '',
          avatar: avatarUrl,
          documentUrl: docUrl,
          paymentUtr: formData.paymentUtr || undefined,
          paymentScreenshotUrl: screenshotUrl,
          religion: formData.religion || undefined,
          isMalikENisab: formData.religion === 'Muslim' ? formData.isMalikENisab : undefined,
          is_malik_e_nisab: formData.religion === 'Muslim' ? formData.isMalikENisab : undefined,
          helpType: (formData.religion === 'Muslim' && formData.isMalikENisab === false) ? (formData.helpType || undefined) : undefined,
          help_type: (formData.religion === 'Muslim' && formData.isMalikENisab === false) ? (formData.helpType || undefined) : undefined,
          helpDetails: (formData.religion === 'Muslim' && formData.isMalikENisab === false) ? (formData.helpDetails || undefined) : undefined,
          help_details: (formData.religion === 'Muslim' && formData.isMalikENisab === false) ? (formData.helpDetails || undefined) : undefined,
        };
        if (formData.plainPassword) {
          patch.passwordHash = await hashPassword(formData.plainPassword);
        }
        await updateUser(editingId, patch);
        showToast(tr('उपयोगकर्ता अपडेट हो गया', 'صارف کامیابی سے اپ ڈیٹ ہو گیا', 'User updated successfully'), 'success');
      } else {
        const newUser: User = {
          id: `usr_${Date.now()}`,
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || '',
          role: (formData.role as UserRole) || 'member',
          district: finalDistrict,
          districtRole: finalDistrictRole,
          district_role: finalDistrictRole,
          avatar: avatarUrl,
          communityId: comm?.id || '',
          communityName: comm?.name || '',
          membershipId: `MEM-${Date.now().toString().slice(-4)}`,
          city: formData.city || '',
          state: formData.state || '',
          status: 'approved',
          isVerified: true,
          joinDate: new Date().toISOString(),
          passwordHash: formData.plainPassword ? await hashPassword(formData.plainPassword) : undefined,
          documentUrl: docUrl,
          paymentUtr: formData.paymentUtr || undefined,
          paymentScreenshotUrl: screenshotUrl,
          religion: formData.religion || undefined,
          isMalikENisab: formData.religion === 'Muslim' ? formData.isMalikENisab : undefined,
          is_malik_e_nisab: formData.religion === 'Muslim' ? formData.isMalikENisab : undefined,
          helpType: (formData.religion === 'Muslim' && formData.isMalikENisab === false) ? (formData.helpType || undefined) : undefined,
          help_type: (formData.religion === 'Muslim' && formData.isMalikENisab === false) ? (formData.helpType || undefined) : undefined,
          helpDetails: (formData.religion === 'Muslim' && formData.isMalikENisab === false) ? (formData.helpDetails || undefined) : undefined,
          help_details: (formData.religion === 'Muslim' && formData.isMalikENisab === false) ? (formData.helpDetails || undefined) : undefined,
        };
        await createUser(newUser);
        showToast(tr('नया उपयोगकर्ता सुरक्षित हो गया', 'نیا صارف کامیابی سے محفوظ ہو گیا', 'User created successfully'), 'success');
      }

      // Pre-warm translations for name, city, district, state in Hindi and Urdu
      if (formData.name) {
        autoTranslateText(formData.name, 'hi').catch(() => { });
        autoTranslateText(formData.name, 'ur').catch(() => { });
      }
      if (formData.district) {
        autoTranslateText(formData.district, 'hi').catch(() => { });
        autoTranslateText(formData.district, 'ur').catch(() => { });
      }
      if (formData.city) {
        autoTranslateText(formData.city, 'hi').catch(() => { });
        autoTranslateText(formData.city, 'ur').catch(() => { });
      }
      if (formData.state) {
        autoTranslateText(formData.state, 'hi').catch(() => { });
        autoTranslateText(formData.state, 'ur').catch(() => { });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || tr('सुरक्षित करने में त्रुटि', 'محفوظ کرنے میں خرابی', 'Failed to save user'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'role') {
        if (distRoleKeys.includes(value)) {
          updated.districtRole = value;
        }
      }
      return updated;
    });
  };

  const filteredUsers = users.filter((u) => {
    const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];
    // Role filter
    if (selectedRoleFilter === 'district_committee') {
      if (!u.districtRole && !u.district_role && !distRoleKeys.includes(u.role)) return false;
    } else if (selectedRoleFilter !== 'all') {
      if (u.role !== selectedRoleFilter && u.districtRole !== selectedRoleFilter && u.district_role !== selectedRoleFilter) return false;
    }

    // District filter
    if (selectedDistrictFilter) {
      const target = selectedDistrictFilter.toLowerCase().trim();
      const uDist = (u.district || '').toLowerCase().trim();
      const uCity = (u.city || '').toLowerCase().trim();
      const uComm = (u.communityName || '').toLowerCase().trim();

      const matchesDistrict =
        uDist === target ||
        (uDist && (target.includes(uDist) || uDist.includes(target))) ||
        uCity === target ||
        (uCity && (target.includes(uCity) || uCity.includes(target))) ||
        (uComm && (target.includes(uComm) || uComm.includes(target)));

      if (!matchesDistrict) return false;
    }

    // Religion filter
    if (selectedReligionFilter !== 'all') {
      const uRel = (u.religion || '').toLowerCase();
      if (uRel !== selectedReligionFilter.toLowerCase()) return false;
    }

    // Nisab filter
    if (selectedNisabFilter !== 'all') {
      const isNisab = u.isMalikENisab === true || u.is_malik_e_nisab === true;
      const isNonNisab = u.isMalikENisab === false || u.is_malik_e_nisab === false;
      const uHelp = (u.helpType || u.help_type || '').toLowerCase();

      if (selectedNisabFilter === 'nisab') {
        if (!isNisab) return false;
      } else if (selectedNisabFilter === 'non_nisab') {
        if (!isNonNisab) return false;
      } else if (['zakat', 'sadaka', 'fitra', 'other'].includes(selectedNisabFilter.toLowerCase())) {
        if (uHelp !== selectedNisabFilter.toLowerCase()) return false;
      }
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.membershipId && u.membershipId.toLowerCase().includes(q)) ||
      (u.city && u.city.toLowerCase().includes(q)) ||
      (u.district && u.district.toLowerCase().includes(q)) ||
      (u.districtRole && u.districtRole.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.religion && u.religion.toLowerCase().includes(q)) ||
      (u.helpType && u.helpType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm flex flex-col min-h-[500px] transition-colors">
      {/* Row 1: Manage Users (Left) & Add User Button (Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span>{tr('उपयोगकर्ता प्रबंधन', 'صارفین کا انتظام', 'Manage Users')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {tr('सभी पंजीकृत उपयोगकर्ताओं को देखें और प्रबंधित करें।', 'تمام رجسٹرڈ صارفین کو دیکھیں اور ان کا انتظام کریں۔', 'View and manage all registered platform users.')}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{tr('+ नया जोड़ें', '+ نیا صارف', '+ Add User')}</span>
        </button>
      </div>

      {/* Row 2: All Filters & Search */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pb-1">
        {/* Role Filter */}
        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">{tr('सभी भूमिकाएं (All Roles)', 'تمام کردار', 'All Roles')}</option>
          <option value="district_president">{tr('जिला अध्यक्ष (District President)', 'ضلعی صدر', 'District President')}</option>
          <option value="district_coordinator">{tr('जिला सहयोजक (District Coordinator)', 'ضلعی کوآرڈینیٹر', 'District Coordinator')}</option>
          <option value="district_gen_secretary">{tr('जिला महासचिव (District Gen Sec)', 'ضلعی جنرل سیکرٹری', 'District General Secretary')}</option>
          <option value="district_secretary">{tr('जिला सचिव (District Secretary)', 'ضلعی سیکرٹری', 'District Secretary')}</option>
          <option value="district_finance_coord">{tr('जिला वित्त समन्वयक (District Finance Coord)', 'ضلعی فنانس کوآرڈینیٹر', 'District Finance Coordinator')}</option>
          <option value="member">{tr('सदस्य (Member)', 'ممبر', 'Member')}</option>
          <option value="community_admin">{tr('सामुदायिक एडमिन (Community Admin)', 'کمیونٹی एडمن', 'Community Admin')}</option>
        </select>

        {/* District Filter (like KYC & UTR tabs) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={selectedDistrictFilter}
            onChange={(e) => setSelectedDistrictFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="">{tr('सभी जिले (All Districts)', 'تمام اضلاع', 'All Districts')}</option>
            {STANDARD_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {language === 'hi' ? d.nameHi : language === 'ur' ? d.nameUr : d.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Religion Filter */}
        <select
          value={selectedReligionFilter}
          onChange={(e) => setSelectedReligionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">{tr('सभी धर्म (All Religions)', 'تمام مذاہب', 'All Religions')}</option>
          <option value="Muslim">{tr('मुस्लिम (Muslim)', 'مسلم', 'Muslim')}</option>
          <option value="Hindu">{tr('हिंदू (Hindu)', 'ہندو', 'Hindu')}</option>
          <option value="Sikh">{tr('सिख (Sikh)', 'سکھ', 'Sikh')}</option>
          <option value="Christian">{tr('ईसाई (Christian)', 'عیسائی', 'Christian')}</option>
        </select>

        {/* Nisab Filter */}
        <select
          value={selectedNisabFilter}
          onChange={(e) => setSelectedNisabFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">{tr('सभी निसाब स्थिति (All Nisab)', 'تمام نصاب کی حیثیت', 'All Nisab Status')}</option>
          <option value="nisab">{tr('★ साहिब-ए-निसब (दाता)', '★ صاحبِ نصاب (ڈونر)', '★ Sahib-e-Nisab (Donor)')}</option>
          <option value="non_nisab">{tr('गैर-निसबदार (सहायता पात्र)', 'غیر نصاب دار (مستحق)', 'Non-Nisab (Aid Eligible)')}</option>
          <option value="zakat">{tr('ज़कात पात्र (Zakat)', 'زکوٰۃ مستحق', 'Zakat Eligible')}</option>
          <option value="sadaka">{tr('सदका पात्र (Sadaka)', 'صدقہ مستحق', 'Sadaka Eligible')}</option>
          <option value="fitra">{tr('फ़ितरा पात्र (Fitra)', 'فطرہ مستحق', 'Fitra Eligible')}</option>
        </select>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('उपयोगकर्ता / जिला खोजें...', 'صارف یا ضلع تلاش کریں...', 'Search user or district...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {(selectedRoleFilter !== 'all' || selectedDistrictFilter !== '' || selectedReligionFilter !== 'all' || selectedNisabFilter !== 'all' || searchQuery.trim()) && (
          <button
            onClick={() => {
              setSelectedRoleFilter('all');
              setSelectedDistrictFilter('');
              setSelectedReligionFilter('all');
              setSelectedNisabFilter('all');
              setSearchQuery('');
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            title={tr('फ़िल्टर हटाएं', 'فلٹرز صاف کریں', 'Clear Filters')}
          >
            <X className="w-3.5 h-3.5" />
            <span>{tr('रीसेट', 'ری سیٹ', 'Reset')}</span>
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="space-y-3">
            <div className="md:hidden space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-pulse h-28" />
              ))}
            </div>
            <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse bg-white dark:bg-slate-900">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></th>
                    <th className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></th>
                    <th className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></th>
                    <th className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></th>
                    <th className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></th>
                    <th className="px-4 py-3 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 ml-auto"></div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                          <div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28 mb-1"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                      </td>
                      <td className="px-4 py-3"><div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="px-4 py-3"><div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="px-4 py-3 text-right"><div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded ml-auto"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            {tr('कोई उपयोगकर्ता नहीं मिला', 'کوئی صارف نہیں ملا', 'No users found.')}
          </div>
        ) : (
          <div>
            <div className="md:hidden space-y-3">
              {filteredUsers.map((user) => (
                <UserMobileCard
                  key={user.id}
                  user={user}
                  onView={setViewUser}
                  onAssignRole={handleOpenAssignRole}
                  onDelete={(id) => setDeleteConfirmId(id)}
                />
              ))}
            </div>
            <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">{tr('उपयोगकर्ता', 'صارف', 'User')}</th>
                    {/* <th className="px-4 py-3">{tr('संपर्क', 'رابطہ', 'Contact')}</th> */}
                    <th className="px-4 py-3">{tr('भूमिका', 'کردار', 'Role')}</th>
                    <th className="px-4 py-3">{tr('जिला भूमिका', 'ضلعی عہدہ', 'District Role')}</th>
                    <th className="px-4 py-3">{tr('स्थान', 'مقام', 'Location')}</th>
                    <th className="px-4 py-3 text-right">{tr('कार्रवाई', 'کارروائی', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50">
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={setViewUser}
                      onAssignRole={handleOpenAssignRole}
                      onDelete={(id) => setDeleteConfirmId(id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-black text-slate-900 dark:text-white text-lg">
                {editingId ? tr('उपयोगकर्ता संपादित करें', 'صارف میں ترمیم کریں', 'Edit User') : tr('नया उपयोगकर्ता बनाएं', 'نیا صارف بنائیں', 'Create New User')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('पूरा नाम', 'مکمل نام', 'Full Name')}
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={tr('उदा. मोहम्मद शाह नवाज', 'مثلاً محمد شاہ نواز', 'e.g. Mohammad Shah Nawaz')}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('भूमिका', 'کردار', 'Role')}
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="member">{tr('सदस्य (Member)', 'ممبر (Member)', 'Member')}</option>
                      <option value="district_president">{tr('जिला अध्यक्ष (District President)', 'ضلعی صدر (District President)', 'District President')}</option>
                      <option value="district_coordinator">{tr('जिला समन्वयक (District Coordinator)', 'ضلعی کوآرڈینیٹر (District Coordinator)', 'District Coordinator')}</option>
                      <option value="district_gen_secretary">{tr('जिला महासचिव (District General Secretary)', 'ضلعی جنرل سیکرٹری (District General Secretary)', 'District General Secretary')}</option>
                      <option value="district_secretary">{tr('जिला सचिव (District Secretary)', 'ضلعی سیکرٹری (District Secretary)', 'District Secretary')}</option>
                      <option value="district_finance_coord">{tr('जिला वित्त समन्वयक (District Finance Coordinator)', 'ضلعی فنانس کوآرڈینیٹر (District Finance Coordinator)', 'District Finance Coordinator')}</option>
                      <option value="community_admin">{tr('सामुदायिक एडमिन (Community Admin)', 'کمیونٹی ایڈمن (Community Admin)', 'Community Admin')}</option>
                      <option value="executive_admin">{tr('कार्यकारी एडमिन (Executive Admin)', 'ایگزیکٹو ایڈمن (Executive Admin)', 'Executive Admin')}</option>
                      <option value="super_admin">{tr('सुपर एडमिन (Super Admin)', 'سپر ایڈمن (Super Admin)', 'Super Admin')}</option>
                    </select>
                    {(formData.role === 'district_finance_coord' || formData.districtRole === 'district_finance_coord') && (
                      <div className="mt-1.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                          {tr('आधिकारिक दायित्व (Official Mandate):', 'سرکاری ذمہ داری:', 'Official Responsibility:')}
                        </span>
                        <p className="text-xs text-amber-900 dark:text-amber-200 font-semibold mt-0.5">
                          {tr(
                            'आधिकारिक लेन-देन के लिए वित्तीय रिकॉर्ड और दस्तावेजी सहायता।',
                            'سرکاری لین دین के लिए مالیاتی ریکارڈ اور دستاویزی معاونت۔',
                            'Financial records and documentary support for official transactions.'
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('पासवर्ड', 'پاس ورڈ', 'Password')}
                    </label>
                    <input
                      required={!editingId}
                      type="password"
                      name="plainPassword"
                      value={formData.plainPassword || ''}
                      onChange={handleChange}
                      placeholder={editingId ? tr('अपरिवर्तित रखने के लिए खाली छोड़ें', 'تبدیل نہ کرنے کے لیے خالی چھوڑیں', 'Leave blank to keep unchanged') : tr('लॉगिन पासवर्ड दर्ज करें', 'لاگ ان پاس ورڈ درج کریں', 'Set login password')}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('ईमेल पता', 'ای میل ایڈریس', 'Email Address')}
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="user@example.com"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors disabled:opacity-50"
                      disabled={!!editingId}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('फ़ोन नंबर', 'فون نمبر', 'Phone Number')}
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors disabled:opacity-50"
                      disabled={!!editingId}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('शहर', 'شہر', 'City')}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder={tr('उदा. बरेली', 'مثلاً بریلی', 'e.g. Bareilly')}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('जिला', 'ضلع', 'District')}
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district || ''}
                      onChange={handleChange}
                      placeholder={tr('उदा. बरेली / लखनऊ', 'مثلاً بریلی / لکھنؤ', 'e.g. Bareilly / Lucknow')}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('जिला भूमिका (District Role)', 'ضلعی عہدہ', 'District Role')}
                    </label>
                    <select
                      name="districtRole"
                      value={formData.districtRole || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          districtRole: val,
                          ...(val ? { role: val as UserRole } : {}),
                        }));
                      }}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="">{tr('-- कोई जिला भूमिका नहीं (None) --', '-- کوئی ضلعی عہدہ نہیں --', '-- No District Role (None) --')}</option>
                      <option value="district_president">{tr('जिला अध्यक्ष (District President)', 'ضلعی صدر', 'District President')}</option>
                      <option value="district_coordinator">{tr('जिला सहयोजक (District Coordinator)', 'ضلعی کوآرڈینیٹر', 'District Coordinator')}</option>
                      <option value="district_gen_secretary">{tr('जिला महासचिव (District Gen Sec)', 'ضلعی جنرل سیکرٹری', 'District General Secretary')}</option>
                      <option value="district_secretary">{tr('जिला सचिव (District Secretary)', 'ضلعی سیکرٹری', 'District Secretary')}</option>
                      <option value="district_finance_coord">{tr('जिला वित्त समन्वयक (District Finance Coord)', 'ضلعی فنانس کوآرڈینیٹر', 'District Finance Coordinator')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('राज्य', 'ریاست', 'State')}
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder={tr('उदा. उत्तर प्रदेश', 'مثلاً اتر پردیش', 'e.g. Uttar Pradesh')}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('समुदाय चुनें', 'کمیونٹی منتخب کریں', 'Select Community')}
                    </label>
                    <select
                      name="communityId"
                      value={formData.communityId || ''}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="">{tr('कोई समुदाय नहीं', 'کوئی کمیونٹی نہیں', 'No Community')}</option>
                      {communities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('धर्म', 'مذہب', 'Religion')}
                    </label>
                    <select
                      name="religion"
                      value={formData.religion || ''}
                      onChange={(e) => {
                        const rel = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          religion: rel as any,
                          isMalikENisab: rel === 'Muslim' ? prev.isMalikENisab : undefined,
                          helpType: rel === 'Muslim' ? prev.helpType : '',
                          helpDetails: rel === 'Muslim' ? prev.helpDetails : '',
                        }));
                      }}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="">{tr('-- धर्म चुनें --', '-- مذہب منتخب کریں --', '-- Select Religion --')}</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Christian">Christian</option>
                    </select>
                  </div>

                  {formData.religion === 'Muslim' && (
                    <div className="md:col-span-2 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-300 mb-1">
                          {tr('क्या मालिक-ए-निसब हैं?', 'کیا مالکِ نصاب ہیں؟', 'Is Malik-e-Nisab (Sahib-e-Nisab)?')}
                        </label>
                        <select
                          value={formData.isMalikENisab === true ? 'yes' : formData.isMalikENisab === false ? 'no' : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              isMalikENisab: val === 'yes' ? true : val === 'no' ? false : undefined,
                              helpType: val === 'yes' ? '' : prev.helpType,
                              helpDetails: val === 'yes' ? '' : prev.helpDetails,
                            }));
                          }}
                          className="w-full bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                        >
                          <option value="">{tr('-- स्थिति चुनें --', '-- منتخب کریں --', '-- Select Nisab Status --')}</option>
                          <option value="yes">{tr('हाँ (मालिक-ए-निसब - सक्षम दाता)', 'ہاں (صاحبِ نصاب - ڈونر)', 'Yes (Malik-e-Nisab / Donor)')}</option>
                          <option value="no">{tr('नहीं (गैर-निसबदार - सहायता पात्र)', 'نہیں (غیر نصاب دار - امداد کے مستحق)', 'No (Non-Nisab / Aid Eligible)')}</option>
                        </select>
                      </div>

                      {formData.isMalikENisab === false && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-300 mb-1">
                              {tr('सहायता का प्रकार', 'امداد کی قسم', 'Help Type Needed')}
                            </label>
                            <select
                              name="helpType"
                              value={formData.helpType || ''}
                              onChange={handleChange}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                            >
                              <option value="">{tr('-- सहायता प्रकार चुनें --', '-- امداد کی قسم منتخب کریں --', '-- Select Help Type --')}</option>
                              <option value="Zakat">Zakat (ज़कात)</option>
                              <option value="Sadaka">Sadaka (सदका)</option>
                              <option value="Fitra">Fitra (फ़ितरा)</option>
                              <option value="Other">Other (अन्य)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-300 mb-1">
                              {tr('सहायता विवरण / आवश्यकता', 'امداد کی تفصیل', 'Help Details / Purpose')}
                            </label>
                            <input
                              type="text"
                              name="helpDetails"
                              value={formData.helpDetails || ''}
                              onChange={handleChange}
                              placeholder={tr('उदा. चिकित्सा खर्च, राशन', 'مثلاً راشن، علاج', 'e.g. Medical, ration')}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('यूटीआर नंबर (वैकल्पिक)', 'یو ٹی آر نمبر (اختیاری)', 'UTR Number (Optional)')}
                    </label>
                    <input
                      type="text"
                      name="paymentUtr"
                      value={formData.paymentUtr || ''}
                      onChange={handleChange}
                      placeholder="e.g. 420199381029"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('प्रोफ़ाइल फोटो', 'پروفائل تصویر', 'Profile Photo')}
                    </label>
                    <label
                      className={`p-3 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center relative h-20 ${avatarFile || existingAvatar
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                      {existingAvatar && !existingAvatar.includes('ui-avatars') && !avatarFile && (
                        <div className="absolute inset-0 p-1">
                          <img src={existingAvatar} className="w-full h-full object-cover rounded-xl opacity-40" />
                        </div>
                      )}
                      <Upload className="w-4 h-4 mb-1 z-10" />
                      <span className="text-[10px] font-bold z-10">
                        {avatarFile
                          ? tr('✓ नई फोटो', '✓ نئی تصویر', '✓ New Photo')
                          : existingAvatar && !existingAvatar.includes('ui-avatars')
                            ? tr('फोटो बदलें', 'تصویر تبدیل کریں', 'Change Photo')
                            : tr('फोटो अपलोड करें', 'تصویر اپ لوڈ کریں', 'Upload Photo')}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('आधार / पहचान पत्र', 'آدھار / شناختی کارڈ', 'Aadhaar/ID')}
                    </label>
                    <label
                      className={`p-3 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center relative h-20 ${documentFile || existingDoc
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                      {existingDoc && !documentFile && existingDoc.startsWith('http') && (
                        <div className="absolute inset-0 p-1">
                          {existingDoc.includes('.pdf') ? (
                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center opacity-40">PDF</div>
                          ) : (
                            <img src={existingDoc} className="w-full h-full object-cover rounded-xl opacity-40" />
                          )}
                        </div>
                      )}
                      <Upload className="w-4 h-4 mb-1 z-10" />
                      <span className="text-[10px] font-bold z-10">
                        {documentFile
                          ? tr('✓ नया दस्तावेज़', '✓ نیا شناختی کارڈ', '✓ New ID')
                          : existingDoc
                            ? tr('दस्तावेज़ बदलें', 'شناختی کارڈ تبدیل کریں', 'Change ID')
                            : tr('दस्तावेज़ अपलोड करें', 'شناختی کارڈ اپ لوڈ کریں', 'Upload ID')}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('भुगतान स्क्रीनशॉट', 'ادائیگی کا اسکرین شاٹ', 'Payment Screenshot')}
                    </label>
                    <label
                      className={`p-3 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center relative h-20 ${screenshotFile || existingScreenshot
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} />
                      {existingScreenshot && !screenshotFile && existingScreenshot.startsWith('http') && (
                        <div className="absolute inset-0 p-1">
                          <img src={existingScreenshot} className="w-full h-full object-cover rounded-xl opacity-40" />
                        </div>
                      )}
                      <Upload className="w-4 h-4 mb-1 z-10" />
                      <span className="text-[10px] font-bold z-10">
                        {screenshotFile
                          ? tr('✓ नया स्क्रीनशॉट', '✓ نیا اسکرین شاٹ', '✓ New SS')
                          : existingScreenshot
                            ? tr('स्क्रीनशॉट बदलें', 'اسکرین شاٹ تبدیل کریں', 'Change SS')
                            : tr('स्क्रीनशॉट अपलोड करें', 'اسکرین شاٹ اپ لوڈ کریں', 'Upload SS')}
                      </span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3 transition-colors">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="cursor-pointer px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                type="submit"
                form="user-form"
                disabled={isSaving}
                className="cursor-pointer px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{tr('सुरक्षित हो रहा है...', 'محفوظ ہو رہا ہے...', 'Saving User...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr('उपयोगकर्ता सुरक्षित करें', 'صارف محفوظ کریں', 'Save User')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl my-8 max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {tr('उपयोगकर्ता विवरण', 'صارف کی تفصیلات', 'User Details')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    ID: {viewUser.membershipId || viewUser.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="cursor-pointer p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <img
                  src={
                    (viewUser.avatar && !viewUser.avatar.startsWith('file://'))
                      ? viewUser.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(viewUser.name || 'User')}&background=random`
                  }
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(viewUser.name || 'User')}&background=random`;
                  }}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {viewUser.name}
                    </h4>
                    {viewUser.isVerified && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {tr('सत्यापित', 'تصدیق شدہ', 'Verified')}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    {tr('शामिल हुए:', 'شامل ہوئے:', 'Joined:')} {viewUser.joinDate ? new Date(viewUser.joinDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {viewUser.role?.toUpperCase()}
                    </span>
                    {(viewUser.districtRole || viewUser.district_role) && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        {translateDistrictRole(viewUser.districtRole || viewUser.district_role || '', language)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    {tr('जिला', 'ضلع', 'District')}
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{viewUser.district || viewUser.city || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    {tr('शहर व राज्य', 'شہر اور ریاست', 'City & State')}
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {[viewUser.city, viewUser.state].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    {tr('फोन नंबर', 'فون نمبر', 'Phone')}
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{viewUser.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    {tr('ईमेल', 'ای میل', 'Email')}
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{viewUser.email || 'N/A'}</span>
                  </div>
                </div>

                {viewUser.communityName && (
                  <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      {tr('समुदाय', 'کمیونٹی', 'Community')}
                    </span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{viewUser.communityName}</span>
                    </div>
                  </div>
                )}

                {viewUser.paymentUtr && (
                  <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      {tr('भुगतान यूटीआर (Payment UTR)', 'ادائیگی یو ٹی آر', 'Payment UTR')}
                    </span>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {viewUser.paymentUtr}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const targetUser = viewUser;
                  setViewUser(null);
                  handleOpenAssignRole(targetUser);
                }}
                className="cursor-pointer px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{tr('भूमिका सौंपें', 'عہدہ تفویض کریں', 'Assign Role')}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="cursor-pointer px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
              >
                {tr('बंद करें', 'بند کریں', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal (Only Two Fields: District and Role) */}
      {assignRoleUser && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {tr('भूमिका व जिला सौंपें', 'عہدہ اور ضلع تفویض کریں', 'Assign Role & District')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {assignRoleUser.name} ({assignRoleUser.membershipId || assignRoleUser.phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssignRoleUser(null)}
                className="cursor-pointer p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form - Only 2 Fields */}
            <form id="assign-role-form" onSubmit={handleSaveAssignRole} className="p-5 space-y-4">
              {/* Field 1: District (Locked to user's assigned district or default city) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>1. {tr('जिला (District)', 'ضلع', 'District')}</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={assignDistrict}
                    readOnly
                    disabled
                    placeholder={tr('कोई ज़िला / शहर उपलब्ध नहीं', 'کوئی ضلع / شہر دستیاب نہیں', 'No district / city available')}
                    className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 cursor-not-allowed outline-none font-medium select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>2. {tr('भूमिका (Role)', 'کردار / عہدہ', 'Role')}</span>
                </label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-colors"
                >
                  <option value="district_president">{tr('जिला अध्यक्ष (District President)', 'ضلعی صدر', 'District President')}</option>
                  <option value="district_coordinator">{tr('जिला सहयोजक (District Coordinator)', 'ضلعی کوآرڈینیٹر', 'District Coordinator')}</option>
                  <option value="district_gen_secretary">{tr('जिला महासचिव (District Gen Sec)', 'ضلعی جنرل سیکرٹری', 'District General Secretary')}</option>
                  <option value="district_secretary">{tr('जिला सचिव (District Secretary)', 'ضلعی سیکرٹری', 'District Secretary')}</option>
                  <option value="district_finance_coord">{tr('जिला वित्त समन्वयक (District Finance Coord)', 'ضلعی فنانس کوآرڈینیٹر', 'District Finance Coordinator')}</option>
                </select>

                {assignRole === 'district_finance_coord' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-[11px] text-orange-900 dark:text-orange-300">
                    <p className="font-bold uppercase text-[10px] text-orange-700 dark:text-orange-400">
                      {tr('आधिकारिक दायित्व (Official Responsibility):', 'سرکاری ذمہ داری:', 'Official Responsibility:')}
                    </p>
                    <p className="mt-0.5">Financial records and documentary support for official transactions.</p>
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssignRoleUser(null)}
                disabled={isAssigningRole}
                className="cursor-pointer px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                type="submit"
                form="assign-role-form"
                disabled={isAssigningRole}
                className="cursor-pointer px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAssigningRole ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{tr('सुरक्षित हो रहा है...', 'محفوظ ہو رہا ہے...', 'Saving...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr('भूमिका सौंपें', 'عہدہ محفوظ کریں', 'Assign Role')}</span>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-xl">
                {tr('उपयोगकर्ता हटाएं?', 'صارف حذف کریں؟', 'Delete User?')}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tr(
                  'क्या आप वाकई इस उपयोगकर्ता को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
                  'کیا آپ واقعی اس صارف کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
                  'Are you sure you want to delete this user? This action cannot be undone.'
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
                className="cursor-pointer px-6 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 dark:shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Toast Notification */}
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
