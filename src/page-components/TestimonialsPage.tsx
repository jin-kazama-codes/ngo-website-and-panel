'use client';

import React, { useState, useEffect } from 'react';
import { getTestimonials } from '../services/testimonialService';
import { Testimonial } from '../types';
import { Quote, MapPin } from 'lucide-react';

export const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonials()
      .then(setTestimonials)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Voices of Our Community</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authentic stories from beneficiary families, community administrators, and generous patrons.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading testimonials...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
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
    </div>
  );
};
