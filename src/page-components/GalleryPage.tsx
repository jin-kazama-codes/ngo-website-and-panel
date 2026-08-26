'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getGalleryPhotos, GalleryPhoto } from '../services/galleryService';
import { MapPin } from 'lucide-react';
import { CardSkeleton } from '../components/Skeletons';
import { MembershipBanner } from '../components/MembershipBanner';
import { useLanguage } from '../context/LanguageContext';
import { translateGalleryPhoto, translateCategory } from '../lib/translateEntity';

export const GalleryPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    getGalleryPhotos()
      .then(data => setPhotos(data.filter(p => !p.status || p.status === 'approved')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(photos.length / ITEMS_PER_PAGE);
  const paginatedPhotos = photos.slice(0, currentPage * ITEMS_PER_PAGE);

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
        <h1 className="text-3xl font-black text-slate-900">{t('gallery.page_title', 'Relief Work & Impact Gallery')}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('gallery.page_desc', 'Authentic photos and stories from local community field drives across India.')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {paginatedPhotos.map((rawP) => {
            const p = translateGalleryPhoto(rawP, language);
            const displayCat = translateCategory(p.category, language);
            return (
              <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 rounded-full text-slate-900 font-bold text-xs shadow-sm">
                    {displayCat}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {p.city}
                    </span>
                    <h3 className="font-bold text-base text-white mt-1">{p.title}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && photos.length > 0 && currentPage < totalPages && (
        <div ref={lastElementRef} className="w-full flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <MembershipBanner />
    </div>
  );
};
