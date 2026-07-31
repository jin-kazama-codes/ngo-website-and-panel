import React from 'react';
import { MOCK_STORIES } from '../data/mockData';
import { Image, Play, Heart, MapPin } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const photos = [
    {
      title: 'Dignified Nikah Essentials & Bridal Trunk Drive - Qutubkhana, Bareilly (UP)',
      city: 'Bareilly',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      category: 'Nikah Support',
    },
    {
      title: 'Schooling Kit & Book Distribution for Orphan Girls - Bareilly (UP)',
      city: 'Bareilly',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
      category: 'Child Education',
    },
    {
      title: 'Emergency Medical & Dialysis Consultation Drive - Bareilly District Hospital',
      city: 'Bareilly',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
      category: 'Medical Aid',
    },
    {
      title: 'Monthly Food Grocery Ration Kits Distribution - CB Ganj, Bareilly',
      city: 'Bareilly',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
      category: 'Food Relief',
    },
    {
      title: 'Bareilly District Qabristan Maintenance & Free Janazah Mortuary Van Service',
      city: 'Bareilly',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
      category: 'Janazah & Qabristan',
    },
    {
      title: 'Collective Dowry-Free Nikah Ceremony Drive - Rohilkhand, Bareilly',
      city: 'Bareilly',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
      category: 'Mass Nikah Support',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Relief Work & Impact Gallery</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authentic photos and stories from local community field drives across India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {photos.map((p, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
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
    </div>
  );
};
