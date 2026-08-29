'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Community } from '../types';
import { getCommunities } from '../services/communityService';
import { Users, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CardSkeleton } from '../components/Skeletons';
import { MembershipBanner } from '../components/MembershipBanner';
import { translateCommunity } from '../lib/translateEntity';

interface CommunitiesPageProps {
  onOpenRegister: () => void;
}

export const CommunitiesPage: React.FC<CommunitiesPageProps> = ({ onOpenRegister }) => {
  const { t, language } = useLanguage();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    getCommunities()
      .then(setCommunities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(communities.length / ITEMS_PER_PAGE);
  const paginatedCommunities = communities.slice(0, currentPage * ITEMS_PER_PAGE);

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
        <h1 className="text-3xl font-black" style={{ color: 'var(--mfct-dark-green)' }}>
          {language === 'hi' ? 'स्थानीय समुदाय एवं शाखाएं' : language === 'ur' ? 'مقامی کمیونٹیز' : 'Local Communities & Chapters'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--mfct-text-muted)' }}>
          {t('communities.page_desc', 'Each community is managed by a trusted local administrator and backed by our national solidarity escrow.')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCommunities.map((rawComm, index) => {
            const comm = translateCommunity(rawComm, language);
            const isLast = index === paginatedCommunities.length - 1;
            return (
              <div
                key={comm.id}
                ref={isLast ? lastElementRef : null}
                className="rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="relative h-48 overflow-hidden bg-slate-900" style={{ background: 'linear-gradient(135deg, #0d3822 0%, #061c11 100%)' }}>
                  <img
                    src={comm.coverImage || "https://images.unsplash.com/photo-1593113563332-e147ce367df0?q=80&w=600&auto=format&fit=crop"}
                    alt={comm.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1593113563332-e147ce367df0?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--mfct-gold)' }}>
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {comm.city}, {comm.state}
                    </span>
                    <h3 className="font-bold text-base text-white truncate drop-shadow-sm">{comm.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--mfct-text-muted)' }}>{comm.description}</p>

                  <div className="pt-3 space-y-2 text-xs" style={{ borderTop: '1px solid var(--mfct-border)' }}>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--mfct-text-muted)' }}>{t('communities.admin_label', 'Admin')}:</span>
                      <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>{comm.adminName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--mfct-text-muted)' }}>{t('communities.active_members', 'Active Members')}:</span>
                      <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>{comm.totalMembers.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--mfct-text-muted)' }}>{t('communities.raised', 'Total Raised')}:</span>
                      <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>₹{comm.totalRaisedINR.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--mfct-text-muted)' }}>{t('communities.health_score', 'Health Score')}:</span>
                      <span className="font-bold" style={{ color: 'var(--mfct-gold-dark)' }}>{comm.healthScore}% {t('communities.grade_a', 'Grade A')}</span>
                    </div>
                  </div>

                  <button
                    onClick={onOpenRegister}
                    className="mfct-btn-dark w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> {t('communities.join_btn', 'Join Community (₹50)')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MembershipBanner />
    </div>
  );
};
