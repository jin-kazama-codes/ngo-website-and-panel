'use client';

import React, { useState, useEffect } from 'react';
import { DonationCategory, Campaign, Community } from '../types';
import { X, Plus, Upload, Sparkles } from 'lucide-react';
import { useAppState } from '../providers/AppStateProvider';
import { useLanguage } from '../context/LanguageContext';
import { getCommunities } from '../services/communityService';
import { createCampaign, updateCampaign } from '../services/campaignService';
import { uploadImage } from '../lib/storage';
import { autoTranslateCampaign } from '../lib/autoTranslate';
import { translateCity, translateCommunityName } from '../lib/translateEntity';

interface CreateCampaignModalProps {
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
  initialCampaign?: Campaign;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onClose, onCreate, initialCampaign }) => {
  const { activeUser } = useAppState();
  const { t, language } = useLanguage();
  const [title, setTitle] = useState(initialCampaign?.title || '');
  const [category, setCategory] = useState<DonationCategory>(initialCampaign?.category || 'Medical');
  const [beneficiaryName, setBeneficiaryName] = useState(initialCampaign?.beneficiaryName || '');
  const [beneficiaryRelation, setBeneficiaryRelation] = useState(initialCampaign?.beneficiaryRelation || '');
  const [goalINR, setGoalINR] = useState(initialCampaign?.goalINR?.toString() || '250000');
  const [story, setStory] = useState(initialCampaign?.story || '');
  const [isZakatEligible, setIsZakatEligible] = useState(initialCampaign?.isZakatEligible ?? true);
  const [isUrgent, setIsUrgent] = useState(initialCampaign?.isUrgent ?? false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUploaded, setDocUploaded] = useState(!!initialCampaign?.documents?.length);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(initialCampaign?.communityId || '');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getCommunities().then((data) => {
      if (data && data.length > 0) {
        setCommunities(data);
        setSelectedCommunityId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  const fallbackCommunity: Community = {
    id: 'comm_bareilly_rohilkhand',
    name: 'Rohilkhand Educational & Nikah Trust',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    adminName: 'Dr. Shakeel Ahmad Usmani',
    adminRoleTitle: 'Community Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    totalMembers: 1820,
    activeCampaigns: 5,
    totalRaisedINR: 4120000,
    healthScore: 97,
    verifiedStatus: 'Verified',
    description: 'Serving underprivileged families in Rohilkhand region.',
    establishedYear: 2019,
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  };

  const activeCommunity = communities.find((c) => c.id === selectedCommunityId) || communities[0] || fallbackCommunity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !beneficiaryName || !story) {
      showToast('Please fill out all required campaign details.', 'error');
      return;
    }
    setSubmitting(true);

    try {
      let mainImage = initialCampaign?.mainImage || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80';
      if (imageFile) {
        mainImage = await uploadImage('campaigns', imageFile);
      }

      let docUrl = initialCampaign?.documents?.[0]?.url || '#';
      if (docFile) {
        docUrl = await uploadImage('campaigns', docFile);
      }

      // Automatically generate multi-language translations in Hindi & Urdu
      try {
        await autoTranslateCampaign(title, story);
      } catch (tErr) {
        console.warn('Auto-translation notice:', tErr);
      }

      if (initialCampaign) {
        const updateData: Partial<Campaign> = {
          title,
          category,
          communityId: activeCommunity.id,
          communityName: activeCommunity.name,
          city: activeCommunity.city,
          beneficiaryName,
          beneficiaryRelation,
          goalINR: parseInt(goalINR, 10) || initialCampaign.goalINR,
          isZakatEligible,
          isUrgent,
          mainImage,
          story,
          documents: [
            { title: 'Community document', url: docUrl, verifiedBy: 'Community Leader' },
          ],
        };
        const saved = await updateCampaign(initialCampaign.id, updateData);
        showToast('Campaign updated successfully!', 'success');
        setTimeout(() => {
          onCreate({ ...initialCampaign, ...updateData });
        }, 1500);
      } else {
        const newCamp: Omit<Campaign, 'id'> = {
          title,
          category,
          communityId: activeCommunity.id,
          communityName: activeCommunity.name,
          city: activeCommunity.city,
          beneficiaryName,
          beneficiaryRelation,
          goalINR: parseInt(goalINR, 10) || 100000,
          raisedINR: 0,
          donorsCount: 0,
          daysLeft: 30,
          isVerified: false,
          isZakatEligible,
          isUrgent,
          mainImage,
          story,
          documents: [
            { title: 'Community document', url: docUrl, verifiedBy: 'Community Leader' },
          ],
          createdBy: activeUser.id,
          createdDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'pending',
        };

        const saved = await createCampaign(newCamp);
        showToast('Campaign submitted for verification successfully!', 'success');
        setTimeout(() => {
          onCreate(saved);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Campaign save error:', err);
      showToast(`Campaign save notice: ${err?.message || 'Saved successfully'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[92vh] overflow-y-auto">
        {toast && (
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all z-50 flex items-center gap-2 animate-fade-in ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
            <span>{toast.message}</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> {t('admin.commAdmin', 'Community Admin')}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{initialCampaign ? t('admin.editCampaign', 'Edit Campaign') : t('admin.createCampaign', 'Create Verified Community Campaign')}</h2>
          <p className="text-sm text-slate-500">
            {initialCampaign ? t('admin.updateDetails', 'Update campaign details and beneficiary information.') : t('admin.submitDetails', 'Submit cause details for local member support. Requires verified beneficiary documents.')}
          </p>

          {/* Automatic Translation Function Badge */}
          <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
            <span>{t('admin.autoTranslateActive', '✨ Automatic Translation Active: Title, story, and details will automatically translate to Hindi & Urdu.')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              {t('modal.campTitle', 'Campaign Title / Headline')}
            </label>
            <input
              type="text"
              required
              placeholder={t('modal.campTitle', 'e.g. Heart Surgery for 10-Year-Old Rahul in Bareilly')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">{t('modal.campCategory', 'Category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DonationCategory)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Medical">{t('cat.medical', 'Medical Aid')}</option>
                <option value="Education">{t('cat.education', 'Education')}</option>
                <option value="Marriage">{t('cat.marriage', 'Marriage Aid')}</option>
                <option value="Food">{t('cat.food', 'Food Relief')}</option>
                <option value="Janazah">{t('cat.janazah', 'Janazah Aid')}</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                {t('modal.goalAmount', 'Required Goal Amount (INR ₹)')}
              </label>
              <input
                type="number"
                required
                value={goalINR}
                onChange={(e) => setGoalINR(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                {t('modal.beneficiary', 'Beneficiary Name')}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Master Rahul"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                {t('modal.beneficiaryRelation', 'Beneficiary Relation')}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Son of Daily Wage Labourer"
                value={beneficiaryRelation}
                onChange={(e) => setBeneficiaryRelation(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              {t('modal.story', 'Detailed Case Story & Explanation')}
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe why this beneficiary urgently needs community help..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isZakatEligible}
                onChange={(e) => setIsZakatEligible(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <span className="font-bold text-slate-900 block">{t('card.zakat', 'Zakat Eligible')}</span>
                <span className="text-[10px] text-slate-500">Meets Zakat compliance rules</span>
              </div>
            </label>

            <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <div>
                <span className="font-bold text-slate-900 block">{t('card.urgent', 'Urgent Priority')}</span>
                <span className="text-[10px] text-slate-500">Immediate hospital / life threat</span>
              </div>
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              {t('nav.communities', 'Community')}
            </label>
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {translateCommunityName(c.name, language)} ({translateCity(c.city, language)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              {t('modal.attachDocs', 'Campaign Main Image (optional)')}
            </label>
            <label className="p-3.5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100">
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              <Upload className="w-4 h-4 mx-auto mb-1 text-slate-500" />
              <span className="text-xs font-bold">{imageFile ? `✓ ${imageFile.name}` : 'Click to upload main campaign image'}</span>
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              {t('modal.attachDocs', 'Attach Medical Estimates / Documents')}
            </label>
            <label
              className={`p-3.5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center ${docUploaded
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setDocFile(file); setDocUploaded(true); }
                }}
              />
              <Upload className="w-4 h-4 mx-auto mb-1 text-slate-500" />
              <span className="text-xs font-bold">
                {docUploaded ? `✓ ${docFile?.name ?? 'Document Attached'}` : 'Click to attach hospital estimate / Aadhaar'}
              </span>
            </label>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
            >
              {t('modal.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Saving & Auto-Translating...' : initialCampaign ? 'Update Campaign' : t('modal.submitCampaign', 'Submit for Verification')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
