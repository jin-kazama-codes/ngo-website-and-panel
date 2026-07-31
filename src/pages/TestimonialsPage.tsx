import React from 'react';
import { MOCK_TESTIMONIALS } from '../data/mockData';
import { Quote, Heart, MapPin, CheckCircle2 } from 'lucide-react';

export const TestimonialsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Voices of Our Community</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authentic stories from beneficiary families, community administrators, and generous patrons.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_TESTIMONIALS.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <Quote className="w-8 h-8 text-emerald-600/30" />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "{t.quote}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                <p className="text-xs text-slate-500">{t.role} • {t.city}</p>
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
    </div>
  );
};
