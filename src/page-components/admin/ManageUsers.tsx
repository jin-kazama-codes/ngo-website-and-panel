'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole, Community } from '../../types';
import { getUsers, createUser, deleteUser, updateUser } from '../../services/userService';
import { getCommunities } from '../../services/communityService';
import { hashPassword } from '../../lib/auth';
import { PlusCircle, Edit2, X, Users, CheckCircle2, Search, Upload, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';

// Interactive Dynamic User Row with real-time language conversion for Desktop Table
const UserRow: React.FC<{
  user: User;
  onEdit: (u: User) => void;
  onDelete: (id: string) => void;
}> = ({ user, onEdit, onDelete }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(user.name, language);
  const displayCity = useDynamicTranslatedText(user.city, language);
  const displayState = useDynamicTranslatedText(user.state, language);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return tr('सुपर एडमिन', 'سپر ایڈمن', 'SUPER ADMIN');
      case 'executive_admin':
        return tr('कार्यकारी एडमिन', 'ایگزیکٹو ایڈمن', 'EXECUTIVE ADMIN');
      case 'community_admin':
        return tr('सामुदायिक एडमिन', 'کمیونٹی ایڈمن', 'COMMUNITY ADMIN');
      case 'premium_donor':
        return tr('प्रीमियम दानदाता', 'پریمیم ڈونر', 'PREMIUM DONOR');
      default:
        return tr('सदस्य', 'ممبر', 'MEMBER');
    }
  };

  const locationText = [displayCity, displayState].filter(Boolean).join(', ') || '-';

  const safeAvatar = (user.avatar && !user.avatar.startsWith('file://'))
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;

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
        <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">{user.email || '-'}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{user.phone || '-'}</p>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded text-[10px] font-bold ${user.role === 'super_admin'
            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
            : user.role === 'executive_admin'
              ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50'
              : user.role === 'community_admin'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
        >
          {getRoleLabel(user.role)}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
        {locationText}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(user)}
            className="cursor-pointer p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors inline-flex"
            title={tr('संपादित करें', 'ترمیم', 'Edit User')}
          >
            <Edit2 className="w-3.5 h-3.5" />
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
  onEdit: (u: User) => void;
  onDelete: (id: string) => void;
}> = ({ user, onEdit, onDelete }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(user.name, language);
  const displayCity = useDynamicTranslatedText(user.city, language);
  const displayState = useDynamicTranslatedText(user.state, language);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return tr('सुपर एडमिन', 'سپر ایڈمن', 'SUPER ADMIN');
      case 'executive_admin':
        return tr('कार्यकारी एडमिन', 'ایگزیکٹو ایڈمن', 'EXECUTIVE ADMIN');
      case 'community_admin':
        return tr('सामुदायिक एडमिन', 'کمیونٹی ایڈمن', 'COMMUNITY ADMIN');
      case 'premium_donor':
        return tr('प्रीमियम दानदाता', 'پریمیم ڈونر', 'PREMIUM DONOR');
      default:
        return tr('सदस्य', 'ممبر', 'MEMBER');
    }
  };

  const locationText = [displayCity, displayState].filter(Boolean).join(', ') || '-';
  const safeAvatar = (user.avatar && !user.avatar.startsWith('file://'))
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;

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

        <span
          className={`shrink-0 px-2.5 py-0.5 rounded text-[10px] font-extrabold ${user.role === 'super_admin'
            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
            : user.role === 'executive_admin'
              ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50'
              : user.role === 'community_admin'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
        >
          {getRoleLabel(user.role)}
        </span>
      </div>

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
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <button
          onClick={() => onEdit(user)}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{tr('संपादित करें', 'ترمیم', 'Edit')}</span>
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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
    state: '',
    plainPassword: '',
    communityId: '',
    paymentUtr: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
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
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      city: user.city,
      state: user.state,
      communityId: user.communityId || '',
      paymentUtr: user.paymentUtr || '',
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
          state: formData.state,
          communityId: comm?.id || '',
          communityName: comm?.name || '',
          avatar: avatarUrl,
          documentUrl: docUrl,
          paymentUtr: formData.paymentUtr || undefined,
          paymentScreenshotUrl: screenshotUrl,
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
          avatar: avatarUrl,
          communityId: comm?.id || '',
          communityName: comm?.name || '',
          membershipId: `MEM-${Date.now().toString().slice(-4)}`,
          city: formData.city || '',
          state: formData.state || '',
          isVerified: true,
          joinDate: new Date().toISOString(),
          passwordHash: formData.plainPassword ? await hashPassword(formData.plainPassword) : undefined,
          documentUrl: docUrl,
          paymentUtr: formData.paymentUtr || undefined,
          paymentScreenshotUrl: screenshotUrl,
        };
        await createUser(newUser);
        showToast(tr('नया उपयोगकर्ता सुरक्षित हो गया', 'نیا صارف کامیابی سے محفوظ ہو گیا', 'User created successfully'), 'success');
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.membershipId && u.membershipId.toLowerCase().includes(q)) ||
      (u.city && u.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm flex flex-col min-h-[500px] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span>{tr('उपयोगकर्ता प्रबंधन', 'صارفین کا انتظام', 'Manage Users')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tr('सभी पंजीकृत उपयोगकर्ताओं को देखें और प्रबंधित करें।', 'تمام رجسٹرڈ صارفین کو دیکھیں اور ان کا انتظام کریں۔', 'View and manage all registered platform users.')}
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={tr('उपयोगकर्ता खोजें...', 'صارف تلاش کریں...', 'Search users...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 lg:w-64 pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{tr('+ नया उपयोगकर्ता जोड़ें', '+ نیا صارف شامل کریں', '+ Add User')}</span>
          </button>
        </div>
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
                    <th className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></th>
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
                      <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
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
                  onEdit={handleOpenEdit}
                  onDelete={(id) => setDeleteConfirmId(id)}
                />
              ))}
            </div>
            <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">{tr('उपयोगकर्ता', 'صارف', 'User')}</th>
                    <th className="px-4 py-3">{tr('संपर्क', 'رابطہ', 'Contact')}</th>
                    <th className="px-4 py-3">{tr('भूमिका', 'کردار', 'Role')}</th>
                    <th className="px-4 py-3">{tr('स्थान', 'مقام', 'Location')}</th>
                    <th className="px-4 py-3 text-right">{tr('कार्रवाई', 'کارروائی', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50">
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onEdit={handleOpenEdit}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-black text-slate-900 dark:text-white text-lg">
                {editingId ? tr('उपयोगकर्ता संपादित करें', 'صارف में ترمیم کریں', 'Edit User') : tr('नया उपयोगकर्ता बनाएं', 'نیا صارف بنائیں', 'Create New User')}
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
                      <option value="community_admin">{tr('सामुदायिक एडमिन (Community Admin)', 'کمیونٹی ایڈمن (Community Admin)', 'Community Admin')}</option>
                      <option value="executive_admin">{tr('कार्यकारी एडमिन (Executive Admin)', 'ایگزیکٹو ایڈمن (Executive Admin)', 'Executive Admin')}</option>
                      <option value="super_admin">{tr('सुपर एडमिन (Super Admin)', 'سپر ایڈمن (Super Admin)', 'Super Admin')}</option>
                    </select>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
