'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Community } from '../../types';
import { getCommunities, createCommunity, updateCommunity, deleteCommunity } from '../../services/communityService';
import { PlusCircle, Edit2, Trash2, X, Building2, CheckCircle2, Camera, Upload, ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translateCommunityName, translateCity } from '../../lib/translateEntity';
import { uploadImage } from '../../lib/storage';

export const SuperAdminCommunities: React.FC = () => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Community>>({
    name: '',
    establishedYear: new Date().getFullYear(),
    city: '',
    state: 'Uttar Pradesh',
    adminName: '',
    adminRoleTitle: 'Community Administrator',
    description: '',
    totalMembers: 0,
    activeCampaigns: 0,
    totalRaisedINR: 0,
    healthScore: 100,
    verifiedStatus: 'Verified',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCommunities();
      setCommunities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setAvatarFile(null);
    setAvatarPreview('');
    setCoverFile(null);
    setCoverPreview('');
    setFormData({
      name: '',
      establishedYear: new Date().getFullYear(),
      city: '',
      state: 'Uttar Pradesh',
      adminName: '',
      adminRoleTitle: 'Community Administrator',
      description: '',
      totalMembers: 0,
      activeCampaigns: 0,
      totalRaisedINR: 0,
      healthScore: 100,
      verifiedStatus: 'Verified',
      coverImage: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comm: Community) => {
    setEditingId(comm.id);
    setAvatarFile(null);
    setAvatarPreview(comm.avatar || '');
    setCoverFile(null);
    setCoverPreview(comm.coverImage || '');
    setFormData(comm);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(tr('क्या आप इस समुदाय को हटाना चाहते हैं?', 'کیا آپ اس کمیونٹی کو حذف کرنا چاہتے ہیں؟', 'Are you sure you want to delete this community?'))) {
      try {
        await deleteCommunity(id);
        fetchData();
      } catch (err: any) {
        console.error(err);
        alert(err.message || tr('हटाने में त्रुटि', 'حذف کرنے میں خرابی', 'Failed to delete community'));
      }
    }
  };

  const uploadFileWithFallback = async (file: File, folder: string): Promise<string> => {
    try {
      const url = await uploadImage(folder, file);
      if (url && !url.includes('unsplash.com')) return url;
    } catch {
      // ignore, fall through to base64
    }
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Avatar image must be less than 5MB');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Cover image must be less than 5MB');
      return;
    }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setCoverPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let resolvedAvatar = formData.avatar || '';
      if (avatarFile) {
        resolvedAvatar = await uploadFileWithFallback(avatarFile, 'community-avatars');
      }
      let resolvedCover = formData.coverImage || '';
      if (coverFile) {
        resolvedCover = await uploadFileWithFallback(coverFile, 'community-covers');
      }
      const finalFormData = { ...formData, avatar: resolvedAvatar, coverImage: resolvedCover };

      if (editingId) {
        await updateCommunity(editingId, finalFormData);
      } else {
        await createCommunity(finalFormData as Omit<Community, 'id'>);
      }
      setIsModalOpen(false);
      fetchData();
      fetchData();
    } catch (err) {
      console.error(err);
      alert(tr('सुरक्षित करने में त्रुटि', 'محفوظ کرنے میں خرابی', 'Failed to save community'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>{tr('सभी समुदायों का प्रबंधन (Super Admin)', 'تمام کمیونٹیز کا انتظام (Super Admin)', 'Manage All Communities (Super Admin)')}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {tr('समग्र प्रणाली में सभी पंजीकृत समुदायों और अध्यायों को नियंत्रित करें।', 'پورے سسٹم میں رجسٹرڈ کمیونٹیز اور چیپٹرز کو کنٹرول کریں۔', 'Full oversight of all registered NGO communities across the state.')}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="cursor-pointer px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{tr('+ नया समुदाय जोड़ें', '+ نئی کمیونٹی شامل کریں', '+ Add Community')}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => (
            <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-900/40">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white line-clamp-1" title={c.name}>
                      {translateCommunityName(c.name, language)}
                    </h4>
                    <p className="text-xs text-slate-400">{translateCity(c.city, language)}, {c.state}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong className="text-slate-300">{tr('प्रशासक:', 'ایڈمن:', 'Admin:')}</strong> {c.adminName} ({c.adminRoleTitle})</p>
                  <p><strong className="text-slate-300">{tr('सदस्य:', 'ممبران:', 'Members:')}</strong> {c.totalMembers.toLocaleString('en-IN')}</p>
                  <p><strong className="text-slate-300">{tr('एकत्रित:', 'جمع شدہ:', 'Raised:')}</strong> ₹{c.totalRaisedINR.toLocaleString('en-IN')}</p>
                  <p><strong className="text-slate-300">{tr('स्थिति:', 'حیثیت:', 'Status:')}</strong> 
                    <span className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.verifiedStatus === 'Verified' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' :
                      c.verifiedStatus === 'Pending' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50' : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                    }`}>
                      {c.verifiedStatus === 'Verified' ? tr('सत्यापित', 'تصدیق شدہ', 'Verified') : c.verifiedStatus === 'Pending' ? tr('लंबित', 'زیر التواء', 'Pending') : tr('अस्वीकृत', 'مسترد', 'Rejected')}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="cursor-pointer flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{tr('संपादित करें', 'ترمیم', 'Edit')}</span>
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="cursor-pointer flex-1 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{tr('हटाएं', 'حذف کریں', 'Delete')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-black text-white text-lg">
                {editingId ? 'Edit Community' : 'Add New Community'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="community-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Details */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-1">Basic Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Community Name</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Established Year</label>
                      <input required type="number" name="establishedYear" value={formData.establishedYear} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">City</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">State</label>
                      <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Admin Details */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-1">Admin Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Admin Name</label>
                      <input required type="text" name="adminName" value={formData.adminName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Admin Role Title</label>
                      <input required type="text" name="adminRoleTitle" value={formData.adminRoleTitle} onChange={handleChange} placeholder="e.g. Community Administrator" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-1">Metrics & Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Total Members</label>
                      <input type="number" name="totalMembers" value={formData.totalMembers} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Active Campaigns</label>
                      <input type="number" name="activeCampaigns" value={formData.activeCampaigns} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Total Raised (INR)</label>
                      <input type="number" name="totalRaisedINR" value={formData.totalRaisedINR} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Health Score (0-100)</label>
                      <input type="number" name="healthScore" min="0" max="100" value={formData.healthScore} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Verified Status</label>
                      <select name="verifiedStatus" value={formData.verifiedStatus} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending</option>
                        <option value="Flagged">Flagged</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Media & Description */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-1">Avatar & Media</h4>
                  <div className="space-y-4">
                    {/* Avatar Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">Avatar / Logo Image</label>
                      <div className="flex items-start gap-4">
                        {/* Preview */}
                        <div className="relative shrink-0">
                          <img
                            src={
                              avatarPreview ||
                              formData.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'C')}&background=059669&color=fff`
                            }
                            alt="Avatar Preview"
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'C')}&background=059669&color=fff`;
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
                            title="Change avatar"
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
                        {/* URL + Upload */}
                        <div className="flex-1 space-y-2">
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
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                            />
                            <span className="text-slate-500 text-xs font-bold shrink-0">OR</span>
                            <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap">
                              <Upload className="w-3.5 h-3.5" />
                              Upload
                              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
                            </label>
                          </div>
                          {avatarFile && (
                            <p className="text-xs text-emerald-400 font-medium">✓ {avatarFile.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Cover Image Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">Cover / Banner Image</label>
                      {(coverPreview || formData.coverImage) && (
                        <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-700 mb-2">
                          <img
                            src={coverPreview || formData.coverImage}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
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
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                        />
                        <span className="text-slate-500 text-xs font-bold shrink-0">OR</span>
                        <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap">
                          <Upload className="w-3.5 h-3.5" />
                          Upload
                          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFileChange} />
                        </label>
                      </div>
                      {coverFile && (
                        <p className="text-xs text-emerald-400 font-medium mt-1">✓ {coverFile.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                      <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="cursor-pointer px-4 py-2 rounded-xl text-slate-300 font-bold text-sm hover:bg-slate-800 transition-all">
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button type="submit" form="community-form" className="cursor-pointer px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>{tr('समुदाय सुरक्षित करें', 'کمیونٹی محفوظ کریں', 'Save Community')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
