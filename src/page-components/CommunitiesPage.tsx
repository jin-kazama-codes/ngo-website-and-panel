'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Community } from '../types';
import { getCommunities } from '../services/communityService';
import { Users, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CardSkeleton } from '../components/Skeletons';
import { MembershipBanner } from '../components/MembershipBanner';

interface CommunitiesPageProps {
  onOpenRegister: () => void;
}

export const CommunitiesPage: React.FC<CommunitiesPageProps> = ({ onOpenRegister }) => {
  const { isHindi } = useLanguage();
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
        <h1 className="text-3xl font-black text-slate-900">{isHindi ? 'स्थानीय सामुदायिक नेटवर्क' : 'مقامی کمیونٹی نیٹ ورک'}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isHindi ? 'प्रत्येक समुदाय एक विश्वसनीय स्थानीय प्रशासक द्वारा प्रबंधित किया जाता है और हमारे राष्ट्रीय एकजुटता एस्क्रो द्वारा समर्थित है।' : 'ہر محلہ ایک مقامی ذمہ دار کے زیر نگرانی اور 100% شفاف فنڈنگ کے تحت کام کرتا ہے۔'}
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
          {paginatedCommunities.map((comm, index) => {
            const isLast = index === paginatedCommunities.length - 1;
            return (
              <div
                key={comm.id}
                ref={isLast ? lastElementRef : null}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img src={comm.coverImage || "https://images.unsplash.com/photo-1593113563332-e147ce367df0?q=80&w=400&auto=format&fit=crop"} alt={comm.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {comm.city}, {comm.state}
                    </span>
                    <h3 className="font-bold text-base text-white">{comm.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 leading-relaxed">{comm.description}</p>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isHindi ? 'प्रशासक:' : 'ایڈمن:'}</span>
                      <span className="font-bold text-slate-800">{comm.adminName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isHindi ? 'सक्रिय सदस्य:' : 'فعال ممبران:'}</span>
                      <span className="font-bold text-slate-900">{comm.totalMembers.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isHindi ? 'कुल वितरित धनराशि:' : 'کل جمع شدہ رقم:'}</span>
                      <span className="font-bold text-emerald-700">₹{comm.totalRaisedINR.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isHindi ? 'सामुदायिक स्वास्थ्य:' : 'کمیونٹی ہیلتھ:'}</span>
                      <span className="font-bold text-emerald-600">{comm.healthScore}% {isHindi ? 'ग्रेड ए' : 'گریڈ اے'}</span>
                    </div>
                  </div>

                  <button
                    onClick={onOpenRegister}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-emerald-400" /> {isHindi ? 'समुदाय से जुड़ें (₹50)' : 'کمیونٹی سے جڑیں (₹50)'}
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
