'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campaign } from '../types';
import { getCampaignById } from '../services/campaignService';
import { ShieldCheck, Sparkles, Clock, Users, Building2, Heart, Share2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppState } from '../providers/AppStateProvider';

export const CampaignDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { handleOpenDonate } = useAppState();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      getCampaignById(id)
        .then(data => setCampaign(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  useEffect(() => {
    if (!campaign) return;
    const allImages = [campaign.mainImage, ...(campaign.galleryImages || [])].filter(Boolean);
    if (allImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [campaign]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-20 h-5 bg-slate-200 rounded animate-pulse mb-6"></div>
        <div className="bg-white rounded-3xl w-full p-6 sm:p-8 shadow-sm border border-slate-100">
          {/* Hero Image Skeleton */}
          <div className="h-64 sm:h-80 rounded-2xl bg-slate-200 animate-pulse mb-8"></div>
          
          {/* Progress Bar & CTA Skeleton */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 mb-8 space-y-4">
            <div className="flex justify-between items-baseline">
              <div className="w-48 h-8 bg-slate-200 rounded animate-pulse"></div>
              <div className="w-12 h-8 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="flex justify-between pt-1">
              <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:flex-1 h-14 bg-slate-200 rounded-xl animate-pulse"></div>
              <div className="w-full sm:w-16 h-14 bg-slate-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Story Section Skeleton */}
          <div className="space-y-4">
            <div className="w-1/3 h-6 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="w-full h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-slate-500">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Campaign Not Found</h2>
        <p>The campaign you are looking for does not exist or has been removed.</p>
        <button onClick={() => router.push('/campaigns')} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold">
          View All Campaigns
        </button>
      </div>
    );
  }

  const percentRaised = Math.min(100, Math.round((campaign.raisedINR / campaign.goalINR) * 100));
  const allImages = [campaign.mainImage, ...(campaign.galleryImages || [])].filter(Boolean);
  const currentImg = allImages[currentImageIdx] || allImages[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: `Support this verified campaign on SevaSangam: ${campaign.title}`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Campaign link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-3xl w-full p-6 sm:p-8 shadow-sm border border-slate-100">
        {/* Hero Image & Tags */}
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 bg-slate-100 shadow-md group">
          <img
            key={currentImg}
            src={currentImg}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=60' }}
            alt={campaign.title}
            className="w-full h-full object-cover animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

          {/* Carousel Indicators & Controls */}
          {allImages.length > 1 && (
            <>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, idx) => (
                  <div 
                    key={idx} 
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(idx); }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentImageIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={handlePrevImage} 
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all z-10 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handleNextImage} 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all z-10 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap z-10">
            <span className="px-3 py-1 rounded-full bg-white/90 text-slate-900 font-bold text-xs shadow-sm">
              {campaign.category}
            </span>
            {campaign.isZakatEligible && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Zakat Eligible
              </span>
            )}
            {campaign.isVerified && (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> On-site Verified
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs text-emerald-300 font-medium flex items-center gap-1">
              <Building2 className="w-4 h-4 shrink-0" /> {campaign.communityName} • {campaign.city}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mt-1">
              {campaign.title}
            </h2>
          </div>
        </div>

        {/* Progress Bar & CTA Bar */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 mb-8 space-y-4">
          <div className="flex items-baseline justify-between text-sm">
            <div>
              <span className="text-3xl font-extrabold text-emerald-700">
                ₹{campaign.raisedINR.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-slate-500 ml-1.5 font-normal">
                raised of ₹{campaign.goalINR.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="font-extrabold text-emerald-600 text-xl">{percentRaised}%</span>
          </div>

          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentRaised}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600 font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" /> {campaign.donorsCount} Supporters
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> {campaign.daysLeft} Days Remaining
            </span>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleOpenDonate(campaign)}
              className="w-full sm:flex-1 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Heart className="w-5 h-5 fill-current" /> Donate to This Cause
            </button>
            <button
              onClick={handleShare}
              className="w-full sm:w-auto p-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center justify-center gap-2"
              title="Share Campaign"
            >
              <Share2 className="w-5 h-5" />
              <span className="sm:hidden font-medium">Share Campaign</span>
            </button>
          </div>
        </div>

        {/* Story Section */}
        <div className="space-y-8 text-slate-800 text-base leading-relaxed">
          <div>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
              Beneficiary Background & Story
            </h3>
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 font-medium text-slate-700">
              <strong className="text-slate-900 block mb-1">Beneficiary: {campaign.beneficiaryName}</strong>
              <span className="text-sm text-slate-500 block mb-4">{campaign.beneficiaryRelation}</span>
              <p className="whitespace-pre-line">{campaign.story}</p>
            </div>
          </div>

          {/* Need Breakdown Table */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
              Itemized Financial Breakdown
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-4">Expense Item</th>
                    <th className="p-4 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-emerald-50/60 font-bold text-emerald-900 text-base">
                    <td className="p-4">Total Verified Goal</td>
                    <td className="p-4 text-right">
                      ₹{campaign.goalINR.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Documents */}
          {campaign.documents && campaign.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                Verified Documents & Proofs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {campaign.documents.map((doc, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex flex-col items-start gap-1">
                      <p className="font-bold text-slate-900">{doc.title}</p>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded">
                        Verified by {doc.verifiedBy}
                      </span>
                    </div>
                    {doc.url && (
                      <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
                        <img 
                          src={doc.url} 
                          alt={doc.title}
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=60' }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
