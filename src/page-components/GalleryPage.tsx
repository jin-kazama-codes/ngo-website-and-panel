'use client';

import React, { useState, useEffect } from 'react';
import { getGalleryPhotos, GalleryPhoto } from '../services/galleryService';
import { MapPin } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGalleryPhotos()
      .then(setPhotos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Relief Work &amp; Impact Gallery</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authentic photos and stories from local community field drives across India.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading gallery...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {photos.map((p) => (
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
                  {p.category}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {p.city}
                  </span>
                  <h3 className="font-bold text-base text-white mt-1">{p.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
