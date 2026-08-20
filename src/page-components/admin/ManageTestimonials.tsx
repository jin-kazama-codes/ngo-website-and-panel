'use client';

import React, { useState, useEffect } from 'react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../services/testimonialService';
import { MessageSquareQuote, PlusCircle, Edit, Trash2, Check, X, CheckCircle2, Clock } from 'lucide-react';
import { DarkCardSkeleton } from '../../components/Skeletons';
import { Testimonial, User } from '../../types';

interface ManageTestimonialsProps {
  activeUser: User;
}

export const ManageTestimonials: React.FC<ManageTestimonialsProps> = ({ activeUser }) => {
  const rawRole = activeUser.role || 'member';
  let normalizedRole = rawRole.toLowerCase().trim().replace(' ', '_');
  if (normalizedRole.includes('executive')) normalizedRole = 'executive_admin';
  else if (normalizedRole.includes('community')) normalizedRole = 'community_admin';
  else if (normalizedRole.includes('super')) normalizedRole = 'super_admin';
  else if (normalizedRole.includes('premium')) normalizedRole = 'premium_donor';

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '', city: '', quote: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

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
        filteredData = data.filter(t => t.createdBy === activeUser.id);
      } else if (normalizedRole === 'community_admin') {
        filteredData = data.filter(t => t.communityId === activeUser.communityId);
      }
      setTestimonials(filteredData);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', city: '', quote: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setFormData(t);
    setIsModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await updateTestimonial(id, { status: 'approved' });
      showToast('Impact story approved successfully', 'success');
      await fetchData(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to approve impact story');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTestimonial(id);
      showToast('Impact story deleted successfully', 'success');
      await fetchData(false);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete impact story');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateTestimonial(editingId, formData);
        showToast('Impact story updated successfully', 'success');
      } else {
        const newStoryData = {
          ...formData,
          avatar: activeUser.avatar,
          createdBy: activeUser.id,
          communityId: activeUser.communityId,
          status: (normalizedRole === 'member' || normalizedRole === 'premium_donor') ? 'pending' as const : 'approved' as const
        };
        await createTestimonial(newStoryData as Omit<Testimonial, 'id'>);
        showToast('Impact story created successfully', 'success');
      }
      setIsModalOpen(false);
      await fetchData(false);
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'Failed to save impact story');
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Manage Impact Stories
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Add, edit, or remove voices from the community shown on the testimonials page.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add Story
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <DarkCardSkeleton key={i} />)}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <MessageSquareQuote className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-300 mb-2">No Impact Stories Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm mx-auto mb-6">
            There are no impact stories to display at the moment. {['community_admin', 'executive_admin', 'super_admin'].includes(normalizedRole) ? 'As an admin, you can add new stories or approve pending ones when they arrive.' : 'Share your experience to inspire others!'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-6 py-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 text-sm font-bold hover:bg-emerald-600/20 flex items-center gap-2 mx-auto transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Your First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group p-4 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700 shrink-0">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.city}</p>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 italic line-clamp-4">"{t.quote}"</p>

                {t.status === 'pending' && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100/50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded text-[10px] font-bold">
                    <Clock className="w-3 h-3" /> Pending Approval
                  </div>
                )}
                {t.status === 'approved' && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                {t.status === 'pending' && ['community_admin', 'executive_admin', 'super_admin'].includes(normalizedRole) && (
                  <button
                    onClick={() => handleApprove(t.id)}
                    disabled={approvingId === t.id}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {approvingId === t.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {approvingId === t.id ? 'Approving...' : 'Approve'}
                  </button>
                )}
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirmId(t.id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editingId ? 'Edit Impact Story' : 'Add Impact Story'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Quote</label>
                  <textarea required name="quote" rows={4} value={formData.quote} onChange={handleChange} className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"></textarea>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer" disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" form="testimonial-form" disabled={isSaving} className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Story
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-rose-600 dark:text-rose-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-xl">Delete Impact Story?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Are you sure you want to delete this impact story? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer" disabled={deletingId !== null}>
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)} 
                disabled={deletingId !== null} 
                className="px-6 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl text-white font-bold text-sm z-[100] animate-bounce ${toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
          }`}>
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};
