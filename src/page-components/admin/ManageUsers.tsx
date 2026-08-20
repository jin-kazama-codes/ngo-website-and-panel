'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { getUsers, createUser, deleteUser, updateUser } from '../../services/userService';
import { getCommunities } from '../../services/communityService';
import { Community } from '../../types';
import { hashPassword } from '../../lib/auth';
import { PlusCircle, Edit2, X, Users, CheckCircle2, Search, Upload, Trash2 } from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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
    name: '', email: '', phone: '', role: 'member',
    city: '', state: '', plainPassword: '', communityId: '', paymentUtr: ''
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
      reader.onerror = error => reject(error);
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteUser(id);
      showToast('User deleted successfully', 'success');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const comm = communities.find(c => c.id === formData.communityId);
      
      let avatarUrl = existingAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || '')}&background=random`;
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
        showToast('User updated successfully', 'success');
      } else {
        const newUser: User = {
          id: `usr_${Date.now()}`,
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || '',
          role: formData.role as UserRole,
          avatar: avatarUrl,
          communityId: comm?.id || '',
          communityName: comm?.name || '',
          membershipId: `MEM-${Date.now().toString().slice(-4)}`,
          isVerified: true,
          isPremium: false,
          joinDate: new Date().toISOString(),
          city: formData.city || '',
          state: formData.state || '',
          passwordHash: formData.plainPassword ? await hashPassword(formData.plainPassword) : undefined,
          documentUrl: docUrl,
          paymentUtr: formData.paymentUtr || undefined,
          paymentScreenshotUrl: screenshotUrl,
        };
        await createUser(newUser);
        showToast('User created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save user');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery)
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col h-full max-h-[85vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            Manage Users
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">View and manage all registered platform users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-500 w-48 lg:w-64 transition-colors"
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {loading ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse bg-white dark:bg-slate-900">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></th>
                  <th className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></th>
                  <th className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></th>
                  <th className="px-4 py-3 hidden lg:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></th>
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
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 hidden md:table-cell">Contact</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Location</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{user.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">ID: {user.membershipId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs">{user.email}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold ${user.role === 'super_admin' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' :
                        (user.role === 'executive_admin') ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' :
                          user.role === 'community_admin' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs">
                      {user.city ? `${user.city}, ${user.state}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors inline-flex cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(user.id)}
                        className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors inline-flex cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-black text-slate-900 dark:text-white text-lg">
                {editingId ? 'Edit User' : 'Create New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Full Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors">
                      <option value="member">Member</option>
                      <option value="community_admin">Community Admin</option>
                      <option value="executive">Executive Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Password</label>
                    <input required={!editingId} type="password" name="plainPassword" value={formData.plainPassword || ''} onChange={handleChange} placeholder={editingId ? "Leave blank to keep unchanged" : "Set login password"} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors disabled:opacity-50" disabled={!!editingId} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Phone Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors disabled:opacity-50" disabled={!!editingId} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Select Community</label>
                    <select name="communityId" value={formData.communityId || ''} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors">
                      <option value="">No Community</option>
                      {communities.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">UTR Number</label>
                    <input type="text" name="paymentUtr" value={formData.paymentUtr || ''} onChange={handleChange} placeholder="e.g. 420199381029" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Profile Photo</label>
                      <label className={`p-3 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center relative h-20 ${avatarFile || existingAvatar ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                        {existingAvatar && !existingAvatar.includes('ui-avatars') && !avatarFile && (
                          <div className="absolute inset-0 p-1">
                            <img src={existingAvatar} className="w-full h-full object-cover rounded-lg opacity-40" />
                          </div>
                        )}
                        <Upload className="w-4 h-4 mb-1 z-10" />
                        <span className="text-[10px] font-bold z-10">{avatarFile ? '✓ New Photo' : (existingAvatar && !existingAvatar.includes('ui-avatars')) ? 'Change Photo' : 'Upload Photo'}</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Aadhaar/ID</label>
                      <label className={`p-3 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center relative h-20 ${documentFile || existingDoc ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                        {existingDoc && !documentFile && existingDoc.startsWith('http') && (
                          <div className="absolute inset-0 p-1">
                            {existingDoc.includes('.pdf') ? (
                              <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center opacity-40">PDF</div>
                            ) : (
                              <img src={existingDoc} className="w-full h-full object-cover rounded-lg opacity-40" />
                            )}
                          </div>
                        )}
                        <Upload className="w-4 h-4 mb-1 z-10" />
                        <span className="text-[10px] font-bold z-10">{documentFile ? '✓ New ID' : existingDoc ? 'Change ID' : 'Upload ID'}</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Payment Screenshot</label>
                      <label className={`p-3 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center relative h-20 ${screenshotFile || existingScreenshot ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} />
                        {existingScreenshot && !screenshotFile && existingScreenshot.startsWith('http') && (
                          <div className="absolute inset-0 p-1">
                            <img src={existingScreenshot} className="w-full h-full object-cover rounded-lg opacity-40" />
                          </div>
                        )}
                        <Upload className="w-4 h-4 mb-1 z-10" />
                        <span className="text-[10px] font-bold z-10">{screenshotFile ? '✓ New SS' : existingScreenshot ? 'Change SS' : 'Upload SS'}</span>
                      </label>
                    </div>
                  </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3 transition-colors">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="user-form" className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer">
                <CheckCircle2 className="w-4 h-4" /> Save User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-xl">Delete User?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this user? This action cannot be undone.
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
