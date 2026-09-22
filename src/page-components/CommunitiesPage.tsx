'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Community } from '../types';
import { getCommunities } from '../services/communityService';
import { Users, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CardSkeleton } from '../components/Skeletons';
import { MembershipBanner } from '../components/MembershipBanner';
import { translateCity, translateState } from '../lib/translateEntity';
import { useDynamicTranslatedText } from '../lib/autoTranslate';

interface CommunitiesPageProps {
  onOpenRegister: () => void;
}

const DynamicCommunityCard: React.FC<{
  rawComm: Community;
  isLast: boolean;
  lastElementRef: (node: HTMLDivElement | null) => void;
  onOpenRegister: () => void;
}> = ({ rawComm, isLast, lastElementRef, onOpenRegister }) => {
  const { t, language } = useLanguage();
  const displayName = useDynamicTranslatedText(rawComm.name, language);
  const displayDescription = useDynamicTranslatedText(rawComm.description, language);
  const displayAdminName = useDynamicTranslatedText(rawComm.adminName, language);
  const displayCity = useDynamicTranslatedText(rawComm.city, language) || translateCity(rawComm.city, language);
  const displayState = useDynamicTranslatedText(rawComm.state, language) || translateState(rawComm.state, language);

  const healthPct = Math.min(100, rawComm.healthScore ?? 80);
  const healthColor = healthPct >= 80 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div
      ref={isLast ? lastElementRef : null}
      className="rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
      style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* ── Cover Image Section ── */}
      <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d3822 0%, #061c11 100%)' }}>
        <img
          src={rawComm.coverImage || "https://images.unsplash.com/photo-1593113563332-e147ce367df0?q=80&w=600&auto=format&fit=crop"}
          alt={displayName}
          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1593113563332-e147ce367df0?q=80&w=600&auto=format&fit=crop";
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Top-right: Verified badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${rawComm.verifiedStatus === 'Verified' ? 'bg-emerald-600/80 text-white'
              : rawComm.verifiedStatus === 'Pending' ? 'bg-amber-500/80 text-white'
                : 'bg-rose-600/80 text-white'
            }`}>
            {rawComm.verifiedStatus === 'Verified'
              ? (language === 'hi' ? 'सत्यापित' : language === 'ur' ? 'تصدیق شدہ' : '✓ Verified')
              : rawComm.verifiedStatus === 'Pending'
                ? (language === 'hi' ? 'लंबित' : language === 'ur' ? 'زیر التواء' : 'Pending')
                : (language === 'hi' ? 'चिह्नित' : language === 'ur' ? 'نشان زدہ' : 'Flagged')}
          </span>
        </div>

        {/* Bottom: avatar + community name + city */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
          <img
            src={rawComm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawComm.name || 'C')}&background=059669&color=fff`}
            alt=""
            className="w-11 h-11 rounded-xl object-cover border-2 border-white shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rawComm.name || 'C')}&background=059669&color=fff`;
            }}
          />
          <div className="min-w-0">
            <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--mfct-gold)' }}>
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {displayCity}, {displayState}
            </span>
            <h3 className="font-bold text-base text-white truncate drop-shadow-sm">{displayName}</h3>
          </div>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">

        {/* Description */}
        {displayDescription && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--mfct-text-muted)' }}>
            {displayDescription}
          </p>
        )}

        <div className="space-y-3">
          {/* Admin row with role title */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'var(--mfct-bg)', border: '1px solid var(--mfct-border)' }}
          >
            <span style={{ color: 'var(--mfct-text-muted)' }}>{t('communities.admin_label', 'Admin')}:</span>
            <span className="font-bold truncate flex-1" style={{ color: 'var(--mfct-dark-green)' }}>{displayAdminName}</span>
            {rawComm.adminRoleTitle && (
              <span className="text-[10px] font-semibold shrink-0 ml-1" style={{ color: 'var(--mfct-gold-dark)' }}>
                • {rawComm.adminRoleTitle}
              </span>
            )}
          </div>

          {/* 4-metric grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl" style={{ background: 'var(--mfct-bg)', border: '1px solid var(--mfct-border)' }}>
              <span className="font-black text-sm" style={{ color: 'var(--mfct-dark-green)' }}>
                {rawComm.totalMembers.toLocaleString('en-IN')}
              </span>
              <span style={{ color: 'var(--mfct-text-muted)' }}>{t('communities.active_members', 'Members')}</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl" style={{ background: 'var(--mfct-bg)', border: '1px solid var(--mfct-border)' }}>
              <span className="font-black text-sm" style={{ color: 'var(--mfct-dark-green)' }}>
                ₹{rawComm.totalRaisedINR >= 100000
                  ? `${(rawComm.totalRaisedINR / 100000).toFixed(1)}L`
                  : rawComm.totalRaisedINR.toLocaleString('en-IN')}
              </span>
              <span style={{ color: 'var(--mfct-text-muted)' }}>{t('communities.raised', 'Total Raised')}</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl" style={{ background: 'var(--mfct-bg)', border: '1px solid var(--mfct-border)' }}>
              <span className="font-black text-sm text-amber-500">
                {rawComm.activeCampaigns ?? 0}
              </span>
              <span style={{ color: 'var(--mfct-text-muted)' }}>
                {language === 'hi' ? 'सक्रिय अभियान' : language === 'ur' ? 'فعال مہمات' : 'Campaigns'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl" style={{ background: 'var(--mfct-bg)', border: '1px solid var(--mfct-border)' }}>
              <span className="font-black text-sm text-violet-500">
                {rawComm.establishedYear || 2024}
              </span>
              <span style={{ color: 'var(--mfct-text-muted)' }}>
                {language === 'hi' ? 'स्थापना वर्ष' : language === 'ur' ? 'سال قیام' : 'Est. Year'}
              </span>
            </div>
          </div>

          {/* Health score bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: 'var(--mfct-text-muted)' }}>{t('communities.health_score', 'Health Score')}</span>
              <span className="font-bold" style={{ color: healthColor }}>
                {healthPct}% {healthPct >= 80 ? t('communities.grade_a', 'Grade A') : ''}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--mfct-border)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${healthPct}%`, background: healthColor, transition: 'width 0.5s ease' }}
              />
            </div>
          </div>
        </div>

        {/* Join button */}
        <button
          onClick={onOpenRegister}
          className="mfct-btn-dark w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Users className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> {t('communities.join_btn')}
        </button>
      </div>
    </div>
  );
};

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
            const isLast = index === paginatedCommunities.length - 1;
            return (
              <DynamicCommunityCard
                key={rawComm.id}
                rawComm={rawComm}
                isLast={isLast}
                lastElementRef={lastElementRef}
                onOpenRegister={onOpenRegister}
              />
            );
          })}
        </div>
      )}

      <MembershipBanner />
    </div>
  );
};
