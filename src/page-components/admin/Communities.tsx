'use client';

import React, { useState, useEffect } from 'react';
import { Community } from '../../types';
import { getCommunities, createCommunity, updateCommunity, deleteCommunity } from '../../services/communityService';
import { getUsers, updateUser } from '../../services/userService';
import { PlusCircle, Edit2, Trash2, X, Building2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';

const CommunityCard: React.FC<{
  community: Community;
  onEdit: (c: Community) => void;
  onDelete: (id: string) => void;
}> = ({ community: c, onEdit, onDelete }) => {
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

  const getStatusBadge = (status: string) => {
    if (status === 'Verified') {
      return (
        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
          {tr('सत्यापित', 'تصدیق شدہ', 'Verified')}
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
          {tr('लंबित', 'زیر التواء', 'Pending')}
        </span>
      );
    }
    return (
      <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400">
        {tr('चिह्नित', 'نشان زدہ', 'Flagged')}
      </span>
    );
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm transition-colors">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={c.avatar || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150'}
            alt={c.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`;
            }}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1" title={c.name}>
              {displayName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {displayCity}, {displayState}
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            <strong className="text-slate-800 dark:text-slate-300">{tr('व्यवस्थापक:', 'ایڈمن:', 'Admin:')}</strong>{' '}
            {displayAdminName || '-'}
          </p>
          <p>
            <strong className="text-slate-800 dark:text-slate-300">{tr('कुल सदस्य:', 'کل ممبران:', 'Members:')}</strong>{' '}
            {c.totalMembers.toLocaleString()}
          </p>
          <p>
            <strong className="text-slate-800 dark:text-slate-300">{tr('एकत्रित राशि:', 'جمع شدہ رقم:', 'Raised:')}</strong>{' '}
            ₹{c.totalRaisedINR.toLocaleString()}
          </p>
          <p>
            <strong className="text-slate-800 dark:text-slate-300">{tr('स्थिति:', 'حیثیت:', 'Status:')}</strong>
            {getStatusBadge(c.verifiedStatus)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
  );
};

export const Communities: React.FC = () => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [formData, setFormData] = useState<Partial<Community> & { adminId?: string }>({
    name: '',
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

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      city: '',
      state: '',
      adminName: '',
      adminRoleTitle: 'community_admin',
      adminId: '',
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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Community) => {
    setEditingId(c.id);
    const existingAdmin = availableUsers.find((u) => u.name === c.adminName || u.id === (c as any).adminId);
    setFormData({
      ...c,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let savedCommunity: Community;
      if (editingId) {
        savedCommunity = await updateCommunity(editingId, formData);
      } else {
        savedCommunity = await createCommunity({
          ...formData,
          avatar: formData.avatar || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150',
          totalMembers: Number(formData.totalMembers) || 0,
          activeCampaigns: Number(formData.activeCampaigns) || 0,
          totalRaisedINR: Number(formData.totalRaisedINR) || 0,
          healthScore: Number(formData.healthScore) || 100,
          verifiedStatus: formData.verifiedStatus || 'Verified',
          description: formData.description || '',
          establishedYear: Number(formData.establishedYear) || new Date().getFullYear(),
        } as Omit<Community, 'id'>);
      }

      if (formData.adminId) {
        await updateUser(formData.adminId, {
          role: 'community_admin',
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{tr('समुदाय प्रबंधन', 'کمیونٹیز کا انتظام', 'Manage Communities')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tr(
              'प्लेटफ़ॉर्म से समुदाय जोड़ें, संपादित करें या हटाएं।',
              'پلیٹ فارم سے کمیونٹیز شامل کریں، ترمیم کریں یا حذف کریں۔',
              'Add, edit, or remove communities from the platform.'
            )}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{tr('+ नया समुदाय जोड़ें', '+ نئی کمیونٹی شامل کریں', '+ Add Community')}</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-48"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => (
            <CommunityCard
              key={c.id}
              community={c}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                        {tr('शहर', 'شہر', 'City')}
                      </label>
                      <input
                        required
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      />
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
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email || u.phone})
                          </option>
                        ))}
                      </select>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg z-[100] text-xs font-bold text-white transition-all transform duration-300 ease-out ${
            toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        >
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};
