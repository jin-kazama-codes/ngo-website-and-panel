'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Campaign, DonationCategory } from '../types';
import { getCampaigns } from '../services/campaignService';
import { CampaignCard } from '../components/CampaignCard';
import { CampaignSkeleton } from '../components/CampaignSkeleton';
import { Search, Grid, List } from 'lucide-react';
import { MembershipBanner } from '../components/MembershipBanner';

interface CampaignsPageProps {
  onDonate: (campaign: Campaign) => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({ onDonate }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const cData = await getCampaigns({ status: 'active' });
        setCampaigns(cData);
      } catch (err) {
        console.error(err);
        setError('Failed to load campaigns. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.beneficiaryName.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' ||
      c.category === selectedCategory ||
      (selectedCategory === 'Zakat' && c.isZakatEligible);
    const matchesCity = selectedCity === 'All' || c.city === selectedCity;
    return matchesSearch && matchesCat && matchesCity;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedCity]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedCampaigns = filtered.slice(0, currentPage * ITEMS_PER_PAGE);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && currentPage < totalPages) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, currentPage, totalPages]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Explore Verified Campaigns</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every campaign is verified on-site by local administrators and executive officers.
        </p>
      </div>

      {/* Sticky Filters & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by patient name, city or cause..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Zakat">Zakat Eligible Only</option>
              <option value="Medical">Medical</option>
              <option value="Education">Education</option>
              <option value="Marriage">Marriage</option>
              <option value="Food">Food</option>
              <option value="Janazah">Janazah</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 outline-none"
            >
              <option value="All">All Indian Cities</option>
              <option value="Delhi">Delhi</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bareilly">Bareilly</option>
              <option value="Mumbai">Mumbai</option>
            </select>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CampaignSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-red-100 p-8">
          <p className="font-bold text-red-600">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-100 p-8">
          <p className="font-bold text-slate-700">No campaigns found matching your search filters.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedCity('All'); }}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {paginatedCampaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onDonate={onDonate}
            />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && currentPage < totalPages && (
        <div ref={lastElementRef} className="w-full flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <MembershipBanner />
    </div>
  );
};
