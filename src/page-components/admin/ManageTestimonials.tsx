'use client';

import React, { useState, useEffect } from 'react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../services/testimonialService';
import { MessageSquareQuote, PlusCircle, Edit, Trash2, Check, X, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { DarkCardSkeleton } from '../../components/Skeletons';
import { Testimonial, User } from '../../types';
import { useLanguage, Language } from '../../context/LanguageContext';
import { autoTranslateText, autoTranslateStory, setMemoryCache, useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateRole } from '../../lib/translateEntity';

interface ManageTestimonialsProps {
  activeUser: User;
}

// Interactive Dynamic Testimonial Card with instant Language Translation
const AdminTestimonialCard: React.FC<{
  testimonial: Testimonial;
  normalizedRole: string;
  approvingId: string | null;
  onApprove: (id: string) => void;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: string) => void;
}> = ({ testimonial, normalizedRole, approvingId, onApprove, onEdit, onDelete }) => {
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
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{displayCity}</p>
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
        {testimonial.status === 'pending' && ['community_admin', 'executive_admin', 'super_admin'].includes(normalizedRole) && (
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
            <span>{approvingId === testimonial.id ? tr('स्वीकार हो रहा है...', 'منظور ہو رہا ہے...', 'Approving...') : tr('स्वीकार करें', 'منظور کریں', 'Approve')}</span>
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

export const ManageTestimonials: React.FC<ManageTestimonialsProps> = ({ activeUser }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const rawRole = activeUser.role || 'member';
  let normalizedRole = rawRole.toLowerCase().trim().replace(' ', '_');
  if (normalizedRole.includes('executive')) normalizedRole = 'executive_admin';
  else if (normalizedRole.includes('community')) normalizedRole = 'community_admin';
  else if (normalizedRole.includes('super')) normalizedRole = 'super_admin';
  else if (normalizedRole.includes('premium')) normalizedRole = 'premium_donor';

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

  // Story Input State
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    quote: '',
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

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', city: '', quote: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setFormData({ name: t.name || '', city: t.city || '', quote: t.quote || '' });
    setIsModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await updateTestimonial(id, { status: 'approved' });
      showToast(tr('कहानी स्वीकृत कर दी गई', 'کہانی کامیابی سے منظور کر لی گئی', 'Impact story approved successfully'), 'success');
      await fetchData(false);
    } catch (err) {
      console.error(err);
      showToast(tr('स्वीकृति विफल रही', 'منظوری ناکام رہی', 'Failed to approve impact story'));
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTestimonial(id);
      showToast(tr('कहानी हटा दी गई', 'کہانی کامیابی سے حذف کر دی گئی', 'Impact story deleted successfully'), 'success');
      await fetchData(false);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      showToast(tr('कहानी हटाने में त्रुटि', 'حذف करने में خرابی', 'Failed to delete impact story'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) {
      showToast(tr('नाम और कहानी आवश्यक हैं।', 'نام اور تاثرات درکار ہیں۔', 'Name and Story Quote are required.'));
      return;
    }

    setIsSaving(true);
    try {
      // Auto-translate in background via Groq AI
      autoTranslateStory(formData.name, formData.city || 'Bareilly', formData.quote)
        .then((transResult) => {
          if (transResult.hi.quote) setMemoryCache(`hi:${formData.quote.trim()}`, transResult.hi.quote);
          if (transResult.ur.quote) setMemoryCache(`ur:${formData.quote.trim()}`, transResult.ur.quote);
          if (transResult.en.quote) setMemoryCache(`en:${formData.quote.trim()}`, transResult.en.quote);

          if (transResult.hi.name) setMemoryCache(`hi:${formData.name.trim()}`, transResult.hi.name);
          if (transResult.ur.name) setMemoryCache(`ur:${formData.name.trim()}`, transResult.ur.name);
          if (transResult.en.name) setMemoryCache(`en:${formData.name.trim()}`, transResult.en.name);
        })
        .catch((err) => console.warn('Background translation notice:', err));

      const payload = {
        name: formData.name,
        city: formData.city || 'Bareilly',
        quote: formData.quote,
      };

      if (editingId) {
        await updateTestimonial(editingId, payload);
        showToast(tr('कहानी सफलतापूर्वक अपडेट हो गई', 'کہانی اپ ڈیٹ کر دی گئی', 'Impact story updated successfully'), 'success');
      } else {
        const newStoryData = {
          ...payload,
          avatar: activeUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          createdBy: activeUser.id,
          communityId: activeUser.communityId,
          status: normalizedRole === 'member' || normalizedRole === 'premium_donor' ? ('pending' as const) : ('approved' as const),
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{tr('असर और प्रेरणादायक कहानियों का प्रबंधन', 'اثرات کی کہانیاں کا انتظام', 'Manage Impact Stories')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tr(
              'हिंदी, उर्दू या अंग्रेजी में लिखें। पूरी वेबसाइट पर स्वचालित अनुवाद लागू होता है।',
              'ہندی، اردو یا انگریزی میں لکھیں۔ پوری ویب سائٹ پر خودکار ترجمہ لاگو ہوتا ہے۔',
              'Write in Hindi, Urdu, or English. Dynamic language translation is applied automatically across the entire site.'
            )}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="cursor-pointer px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{tr('+ नई कहानी जोड़ें', '+ نئی کہانی شامل کریں', '+ Add Story')}</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <DarkCardSkeleton key={i} />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <MessageSquareQuote className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-300 mb-2">
            {tr('अभी कोई कहानी नहीं है', 'ابھی تک کوئی کہانی نہیں ہے', 'No Impact Stories Yet')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm mx-auto mb-6">
            {tr(
              'इस समय प्रदर्शित करने के लिए कोई कहानी नहीं है। किसी भी भाषा में वास्तविक अनुभव साझा करें!',
              'اس وقت دکھانے کے لیے کوئی کہانی موجود نہیں ہے۔ کسی بھی زبان میں تاثرات شامل کریں!',
              'There are no impact stories to display at the moment. Share real stories in any language!'
            )}
          </p>
          <button
            onClick={handleOpenAdd}
            className="cursor-pointer px-6 py-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-600/20 flex items-center gap-2 mx-auto transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{tr('अपनी पहली कहानी जोड़ें', 'اپنی پہلی کہانی شامل کریں', 'Add Your First Story')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <AdminTestimonialCard
              key={t.id}
              testimonial={t}
              normalizedRole={normalizedRole}
              approvingId={approvingId}
              onApprove={handleApprove}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Impact Story Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {editingId
                      ? tr('कहानी संपादित करें', 'کہانی میں ترمیم کریں', 'Edit Impact Story')
                      : tr('नई कहानी जोड़ें', 'نئی کہانی شامل کریں', 'Add Impact Story')}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('नाम (Name)', 'نام (Name)', 'Name')}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={tr('उदा. हाफ़िज़ मोहम्मद', 'مثلاً حافظ محمد', 'e.g. Hafiz Mohammed')}
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('शहर (City)', 'شہر (City)', 'City')}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={tr('उदा. बरेली, लखनऊ', 'مثلاً بریلی، لکھنؤ', 'e.g. Bareilly, Lucknow')}
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
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
                  'کیا آپ واقعی اس اثر انگیز کہانی کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
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
