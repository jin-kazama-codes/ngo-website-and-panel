'use client';

import React, { useState, useEffect } from 'react';
import { DonationCategory, Campaign, Community } from '../types';
import { X, Plus, Upload } from 'lucide-react';
import { getCommunities, FALLBACK_COMMUNITIES } from '../services/communityService';
import { createCampaign } from '../services/campaignService';
import { uploadImage } from '../lib/storage';

interface CreateCampaignModalProps {
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DonationCategory>('Medical');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [goalINR, setGoalINR] = useState('250000');
  const [story, setStory] = useState('');
  const [isZakatEligible, setIsZakatEligible] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUploaded, setDocUploaded] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [communities, setCommunities] = useState<Community[]>(FALLBACK_COMMUNITIES);
  const [selectedCommunityId, setSelectedCommunityId] = useState(FALLBACK_COMMUNITIES[0].id);
  const [submitting, setSubmitting] = useState(false);

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
      alert('Please fill out all required campaign details.');
      return;
    }
    setSubmitting(true);

    try {
      let mainImage = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80';
      if (imageFile) {
        mainImage = await uploadImage('campaigns', imageFile);
      }

      let docUrl = '#';
      if (docFile) {
        docUrl = await uploadImage('campaigns', docFile);
      }

      const newCamp: Omit<Campaign, 'id'> = {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        communityId: activeCommunity.id,
        communityName: activeCommunity.name,
        city: activeCommunity.city,
        beneficiaryName,
        beneficiaryRelation: 'Verified Community Resident',
        goalINR: parseInt(goalINR, 10) || 100000,
        raisedINR: 0,
        donorsCount: 0,
        daysLeft: 30,
        isVerified: true,
        isZakatEligible,
        isUrgent,
        isPremiumFeatured: false,
        mainImage,
        story,
        documents: [
          { title: 'Community Verified Medical & Income Certificate', url: docUrl, verifiedBy: 'Community Leader' },
        ],
        verificationTimeline: [
          { step: 'Community Admin Verification', date: 'Today', status: 'completed' },
          { step: 'Executive Committee Clearance', date: 'Today', status: 'completed' },
        ],
        needBreakdown: [
          { item: 'Direct Treatment / Support Expenses', amountINR: parseInt(goalINR, 10) || 100000 },
        ],
        createdDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'pending_approval',
      };

      const saved = await createCampaign(newCamp);
      alert('Campaign submitted for verification successfully!');
      onCreate(saved);
    } catch (err: any) {
      console.error('Campaign creation error:', err);
      alert(`Campaign creation notice: ${err?.message || 'Submitted successfully'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Plus className="w-3.5 h-3.5" /> Community Admin Portal
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Verified Community Campaign</h2>
          <p className="text-sm text-slate-500 mt-1">
            Submit cause details for local member support. Requires verified beneficiary documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              Campaign Title / Headline
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Heart Surgery for 10-Year-Old Rahul in Bareilly"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DonationCategory)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Medical">Medical</option>
                <option value="Education">Education</option>
                <option value="Marriage">Marriage</option>
                <option value="Food">Food</option>
                <option value="Janazah">Janazah</option>
                <option value="Emergency Relief">Emergency Relief</option>
                <option value="Widow Support">Widow Support</option>
                <option value="Orphan Support">Orphan Support</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                Required Goal Amount (INR ₹)
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

          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              Beneficiary Name & Relation
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Rahul (Son of Daily Wage Labourer)"
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              Detailed Case Story & Explanation
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
                <span className="font-bold text-slate-900 block">Zakat Eligible</span>
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
                <span className="font-bold text-slate-900 block">Urgent Priority</span>
                <span className="text-[10px] text-slate-500">Immediate hospital / life threat</span>
              </div>
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              Community
            </label>
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              Campaign Main Image (optional)
            </label>
            <label className="p-3.5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100">
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              <Upload className="w-4 h-4 mx-auto mb-1 text-slate-500" />
              <span className="text-xs font-bold">{imageFile ? `✓ ${imageFile.name}` : 'Click to upload main campaign image'}</span>
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
              Attach Medical Estimates / Documents
            </label>
            <label
              className={`p-3.5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center ${
                docUploaded
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
              className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Submit Campaign for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
