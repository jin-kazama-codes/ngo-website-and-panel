'use client';

import React, { useState, useEffect } from 'react';
import { Community } from '../../types';
import { getCommunities, createCommunity, updateCommunity, deleteCommunity } from '../../services/communityService';
import { getUsers, updateUser } from '../../services/userService';
import { PlusCircle, Edit2, Trash2, X, Building2, CheckCircle2 } from 'lucide-react';

export const Communities: React.FC = () => {
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
    name: '', city: '', state: '', adminName: '', adminRoleTitle: '',
    avatar: '', totalMembers: 0, activeCampaigns: 0, totalRaisedINR: 0,
    healthScore: 100, verifiedStatus: 'Verified', description: '',
    establishedYear: new Date().getFullYear(), coverImage: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [data, usersData] = await Promise.all([
        getCommunities(),
        getUsers()
      ]);
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
      name: '', city: '', state: '', adminName: '', adminRoleTitle: 'community_admin', adminId: '',
      avatar: '', totalMembers: 0, activeCampaigns: 0, totalRaisedINR: 0,
      healthScore: 100, verifiedStatus: 'Verified', description: '',
      establishedYear: new Date().getFullYear(), coverImage: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comm: Community) => {
    setEditingId(comm.id);
    setFormData({
      ...comm,
      adminRoleTitle: comm.adminRoleTitle || 'community_admin'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCommunity(id);
      showToast('Community deleted successfully', 'success');
      await fetchData(false);
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to delete community');
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
        savedCommunity = await createCommunity(formData as Omit<Community, 'id'>);
      }
      
      if (formData.adminId) {
        await updateUser(formData.adminId, { 
          role: 'community_admin',
          communityId: savedCommunity.id,
          communityName: savedCommunity.name
        });
      }

      setIsModalOpen(false);
      showToast('Community saved successfully', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save community');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'adminId') {
      const selectedUser = availableUsers.find(u => u.id === value);
      setFormData(prev => ({
        ...prev,
        adminId: value,
        adminName: selectedUser ? selectedUser.name : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
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
        setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Manage Communities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Add, edit, or remove communities from the platform.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add Community
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm transition-colors animate-pulse">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm transition-colors">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img src={c.avatar || 'https://via.placeholder.com/150'} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1" title={c.name}>{c.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.city}, {c.state}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p><strong className="text-slate-800 dark:text-slate-300">Admin:</strong> {c.adminName} ({c.adminRoleTitle})</p>
                  <p><strong className="text-slate-800 dark:text-slate-300">Members:</strong> {c.totalMembers.toLocaleString()}</p>
                  <p><strong className="text-slate-800 dark:text-slate-300">Raised:</strong> ₹{c.totalRaisedINR.toLocaleString()}</p>
                  <p><strong className="text-slate-800 dark:text-slate-300">Status:</strong>
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${c.verifiedStatus === 'Verified' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' :
                      c.verifiedStatus === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400'
                      }`}>
                      {c.verifiedStatus}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirmId(c.id)}
                  className="flex-1 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-black text-slate-900 dark:text-white text-lg">
                {editingId ? 'Edit Community' : 'Add New Community'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-transparent">
              <form id="community-form" onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Details */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">Basic Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Community Name</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Established Year</label>
                      <input required type="number" name="establishedYear" value={formData.establishedYear} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">City</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">State</label>
                      <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Admin Details */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">Assign Admin</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">If the user is not listed here, please create their account first in the Manage Users tab.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Select User (Admin)</label>
                      <select required name="adminId" value={formData.adminId || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none">
                        <option value="" disabled>-- Select a registered user --</option>
                        {availableUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email || u.phone})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Admin Role Title</label>
                      <input 
                        readOnly 
                        type="text" 
                        name="adminRoleTitle" 
                        value={formData.adminRoleTitle === 'community_admin' ? 'community admin' : formData.adminRoleTitle || 'community admin'} 
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-500 cursor-not-allowed outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">Metrics & Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Health Score (0-100)</label>
                      <input type="number" name="healthScore" min="0" max="100" value={formData.healthScore} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Verified Status</label>
                      <select name="verifiedStatus" value={formData.verifiedStatus} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none">
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending</option>
                        <option value="Flagged">Flagged</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Media & Description */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">Media & Description</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Cover Image URL or Upload</label>
                      <div className="flex items-center gap-3">
                        <input type="text" name="coverImage" value={formData.coverImage?.startsWith('data:') ? '' : formData.coverImage} onChange={handleChange} placeholder="e.g. https://images.unsplash.com/..." className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none" />
                        <span className="text-slate-500 text-xs font-bold">OR</span>
                        <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-bold transition-all whitespace-nowrap">
                          Upload
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                      {formData.coverImage && (
                        <div className="mt-3">
                          <img src={formData.coverImage} alt="Preview" className="h-32 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Description</label>
                      <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer">
                Cancel
              </button>
              <button disabled={isSubmitting} type="submit" form="community-form" className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Community
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-rose-600 dark:text-rose-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-xl">Delete Community?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this community? This action cannot be undone and will affect all associated data.
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer" disabled={deletingId !== null}>
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)} 
                disabled={deletingId !== null} 
                className="px-6 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 dark:shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deletingId === deleteConfirmId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] text-sm font-bold text-white transition-all transform duration-300 ease-out ${
          toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
        }`}>
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};
