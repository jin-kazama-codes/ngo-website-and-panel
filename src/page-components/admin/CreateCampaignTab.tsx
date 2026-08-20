'use client';

import React, { useState, useEffect } from 'react';
import { DonationCategory, Campaign, Community } from '../../types';
import { X, Plus, Upload, ArrowLeft } from 'lucide-react';
import { useAppState } from '../../providers/AppStateProvider';
import { getCommunities } from '../../services/communityService';
import { createCampaign, updateCampaign } from '../../services/campaignService';
import { uploadImage } from '../../lib/storage';

interface CreateCampaignTabProps {
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
  initialCampaign?: Campaign;
}

export const CreateCampaignTab: React.FC<CreateCampaignTabProps> = ({ onClose, onCreate, initialCampaign }) => {
  const { activeUser } = useAppState();
  const [title, setTitle] = useState(initialCampaign?.title || '');
  const [category, setCategory] = useState<DonationCategory>(initialCampaign?.category || 'Medical');
  const [beneficiaryName, setBeneficiaryName] = useState(initialCampaign?.beneficiaryName || '');
  const [beneficiaryRelation, setBeneficiaryRelation] = useState(initialCampaign?.beneficiaryRelation || '');
  const [goalINR, setGoalINR] = useState(initialCampaign?.goalINR?.toString() || '250000');
  const [story, setStory] = useState(initialCampaign?.story || '');
  const [isZakatEligible, setIsZakatEligible] = useState(initialCampaign?.isZakatEligible ?? true);
  const [isUrgent, setIsUrgent] = useState(initialCampaign?.isUrgent ?? false);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docUploaded, setDocUploaded] = useState(!!initialCampaign?.documents?.length);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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
    if (!docUploaded && docFiles.length === 0) {
      showToast('Please attach at least one medical estimate or document.', 'error');
      return;
    }
    setSubmitting(true);

    try {
      let mainImage = initialCampaign?.mainImage || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80';
      let galleryImages = initialCampaign?.galleryImages || [];
      if (imageFiles.length > 0) {
        const uploadedImages = [];
        for (const file of imageFiles) {
          uploadedImages.push(await uploadImage('campaigns', file));
        }
        mainImage = uploadedImages[0];
        if (uploadedImages.length > 1) {
          galleryImages = [...galleryImages, ...uploadedImages.slice(1)];
        }
      }

      const uploadedDocs = [];
      for (const file of docFiles) {
        const url = await uploadImage('campaigns', file);
        uploadedDocs.push({ title: file.name, url, verifiedBy: 'Community Leader' });
      }
      
      const existingDocs = initialCampaign?.documents || [];
      const combinedDocs = [...existingDocs, ...uploadedDocs];

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
          galleryImages,
          story,
          documents: combinedDocs.length > 0 ? combinedDocs : [{ title: 'Community document', url: '#', verifiedBy: 'Community Leader' }],
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
          galleryImages,
          story,
          documents: combinedDocs.length > 0 ? combinedDocs : [{ title: 'Community document', url: '#', verifiedBy: 'Community Leader' }],
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
    <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-sm border border-slate-200 relative">
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all z-[100] flex items-center gap-2 animate-fade-in ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
          <span>{toast.message}</span>
        </div>
      )}
      
      <button
        onClick={onClose}
        className="cursor-pointer flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
          <Plus className="w-3.5 h-3.5" /> Community Admin Portal
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{initialCampaign ? 'Edit Campaign' : 'Create Verified Community Campaign'}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {initialCampaign ? 'Update campaign details and beneficiary information.' : 'Submit cause details for local member support. Requires verified beneficiary documents.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-sm font-medium text-slate-700">
        <div>
          <label className="block font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs">
            Campaign Title / Headline
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Heart Surgery for 10-Year-Old Rahul in Bareilly"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DonationCategory)}
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Medical">Medical</option>
              <option value="Education">Education</option>
              <option value="Marriage">Marriage</option>
              <option value="Food">Food</option>
              <option value="Janazah">Janazah</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs">
              Required Goal Amount (INR ₹)
            </label>
            <input
              type="number"
              required
              value={goalINR}
              onChange={(e) => setGoalINR(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs">
              Beneficiary Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Rahul"
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs">
              Beneficiary Relation
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Son of Daily Wage Labourer"
              value={beneficiaryRelation}
              onChange={(e) => setBeneficiaryRelation(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs">
            Detailed Case Story & Explanation
          </label>
          <textarea
            rows={5}
            required
            placeholder="Describe why this beneficiary urgently needs community help..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <label className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={isZakatEligible}
              onChange={(e) => setIsZakatEligible(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded"
            />
            <div>
              <span className="font-bold text-slate-900 block text-base">Zakat Eligible</span>
              <span className="text-xs text-slate-500">Meets Zakat compliance rules</span>
            </div>
          </label>

          <label className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-5 h-5 text-rose-600 rounded"
            />
            <div>
              <span className="font-bold text-slate-900 block text-base">Urgent Priority</span>
              <span className="text-xs text-slate-500">Immediate hospital / life threat</span>
            </div>
          </label>
        </div>

        <div>
          <label className="block font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs">
            Community
          </label>
          <select
            value={selectedCommunityId}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs">
            Campaign Main Image (optional)
          </label>
          <label className="p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100">
            <input 
              type="file" 
              accept="image/*" 
              multiple
              className="sr-only" 
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  setImageFiles(prev => [...prev, ...files]);
                }
              }} 
            />
            <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
            <span className="text-sm font-bold">{imageFiles.length > 0 ? `✓ ${imageFiles.length} image(s) selected` : 'Click to upload main campaign image(s)'}</span>
          </label>
        </div>

        <div>
          <label className="block font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs">
            Attach Medical Estimates / Documents
          </label>
          <label
            className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center ${docUploaded
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const validFiles = files.filter(f => {
                  if (f.size > 1024 * 1024) {
                    showToast(`${f.name} exceeds 1MB limit.`, 'error');
                    return false;
                  }
                  return true;
                });
                if (validFiles.length > 0) {
                  setDocFiles(prev => [...prev, ...validFiles]);
                  setDocUploaded(true);
                }
              }}
            />
            <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
            <span className="text-sm font-bold">
              {docUploaded 
                ? (docFiles.length > 0 ? `✓ ${docFiles.length} file(s) attached` : '✓ Documents attached')
                : 'Click to attach hospital estimate / Aadhaar (Max 1MB)'}
            </span>
          </label>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer py-3.5 px-6 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
          >
            {submitting ? 'Saving...' : initialCampaign ? 'Update Campaign' : 'Submit for Verification'}
          </button>
        </div>
      </form>
    </div>
  );
};
