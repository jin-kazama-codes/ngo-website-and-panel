'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Campaign, DonationCategory } from '../types';
import { getCampaigns, sortCampaignsByLatest } from '../services/campaignService';
import { CampaignCard } from '../components/CampaignCard';
import { CampaignSkeleton } from '../components/CampaignSkeleton';
import { Search, Grid, List } from 'lucide-react';
import { MembershipBanner } from '../components/MembershipBanner';
import { useLanguage } from '../context/LanguageContext';
import { translateCity, translateCategory } from '../lib/translateEntity';

interface CampaignsPageProps {
  onDonate: (campaign: Campaign) => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({ onDonate }) => {
  const { t, language } = useLanguage();
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
        setCampaigns(sortCampaignsByLatest(cData));
      } catch (err) {
        console.error(err);
        setError(t('campaigns.load_error', 'Failed to load campaigns. Please try again.'));
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

  const availableCities = Array.from(
    new Set(['Delhi', 'Lucknow', 'Hyderabad', 'Bareilly', 'Mumbai', ...campaigns.map((c) => c.city).filter(Boolean)])
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black" style={{ color: 'var(--mfct-dark-green)' }}>
          {language === 'hi' ? 'सत्यापित सहायता अभियान' : language === 'ur' ? 'تصدیق شدہ مہمات' : 'Verified Relief Campaigns'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--mfct-text-muted)' }}>
          {t('campaigns.page_desc', 'Every campaign is verified on-site by local administrators and executive officers.')}
        </p>
      </div>

      {/* Sticky Filters & Controls Bar */}
      <div
        className="p-4 rounded-2xl space-y-3"
        style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--mfct-gold)' }} />
            <input
              type="text"
              placeholder={t('campaigns.search_placeholder', 'Search by patient name, city or cause...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium outline-none"
              style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 rounded-xl text-xs font-semibold outline-none"
              style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
            >
              <option value="All">{t('cat.all', 'All Categories')}</option>
              <option value="Zakat">{t('cat.zakat', 'Zakat Eligible')}</option>
              <option value="Medical">{translateCategory('Medical', language)}</option>
              <option value="Education">{translateCategory('Education', language)}</option>
              <option value="Marriage">{translateCategory('Marriage', language)}</option>
              <option value="Food">{translateCategory('Food', language)}</option>
              <option value="Janazah">{translateCategory('Janazah', language)}</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="p-2 rounded-xl text-xs font-semibold outline-none"
              style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
            >
              <option value="All">{t('campaigns.all_cities', 'All Indian Cities')}</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {translateCity(city, language)}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--mfct-warm-bg-2)', border: '1px solid var(--mfct-border)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="p-1.5 rounded-lg transition-all"
                style={viewMode === 'grid' ? { background: 'var(--mfct-dark-green)', color: '#fff' } : { color: 'var(--mfct-text-muted)' }}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-1.5 rounded-lg transition-all"
                style={viewMode === 'list' ? { background: 'var(--mfct-dark-green)', color: '#fff' } : { color: 'var(--mfct-text-muted)' }}
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
        <div className="text-center py-16 rounded-3xl p-8" style={{ background: 'var(--mfct-white)', border: '1px solid #fecaca' }}>
          <p className="font-bold text-red-600">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl p-8" style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-text-muted)' }}>
          <p className="font-bold">{t('campaigns.no_results', 'No campaigns found matching your search filters.')}</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedCity('All'); }}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'var(--mfct-warm-bg-2)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-border)' }}
          >
            {t('btn.clear', 'Clear Filters')}
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
