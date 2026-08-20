'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTestimonials } from '../services/testimonialService';
import { Testimonial } from '../types';
import { Quote, MapPin } from 'lucide-react';
import { TestimonialSkeleton } from '../components/Skeletons';
import { MembershipBanner } from '../components/MembershipBanner';

export const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    getTestimonials()
      .then(data => setTestimonials(data.filter(t => !t.status || t.status === 'approved')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);
  const paginatedTestimonials = testimonials.slice(0, currentPage * ITEMS_PER_PAGE);

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
        <h1 className="text-3xl font-black text-slate-900">Voices of Our Community</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authentic stories from beneficiary families, community administrators, and generous patrons.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TestimonialSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paginatedTestimonials.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <Quote className="w-8 h-8 text-emerald-600/30" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    {t.role} <span className="text-slate-300">•</span>
                    <MapPin className="w-3 h-3" /> {t.city}
                  </p>
                  {t.amountReceivedINR && (
                    <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                      Verified Aid: ₹{t.amountReceivedINR.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && testimonials.length > 0 && currentPage < totalPages && (
        <div ref={lastElementRef} className="w-full flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <MembershipBanner />
    </div>
  );
};
