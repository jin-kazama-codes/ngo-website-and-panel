import React, { useState } from 'react';
import { Heart, QrCode, Phone, Mail, MapPin, ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface FooterProps {
  onPageChange: (page: string) => void;
  onOpenDonate: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onPageChange, onOpenDonate, onNavigateToAdmin }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-xl shadow-md">
                M
              </div>
              <div>
                <span className="font-black text-xl text-white tracking-tight">MFCT</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Community Platform
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              MFCT is India’s premier transparent, inclusive, religion-neutral community fundraising platform. Every member joins with a nominal ₹50 fee to both support others and receive verified community aid.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Section 8 Registered NGO | 80G Tax Exemption Certified
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <button
                  onClick={() => {
                    if (onNavigateToAdmin) {
                      onNavigateToAdmin();
                    } else {
                      window.history.pushState({}, '', '/admin');
                      window.dispatchEvent(new Event('popstate'));
                    }
                  }}
                  className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Admin & Member Portal (/admin)</span>
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('home')} className="hover:text-emerald-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('campaigns')} className="hover:text-emerald-400 transition-colors">
                  Verified Campaigns
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('communities')} className="hover:text-emerald-400 transition-colors">
                  Local Communities
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('about')} className="hover:text-emerald-400 transition-colors">
                  Transparency Model
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('gallery')} className="hover:text-emerald-400 transition-colors">
                  Relief Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('testimonials')} className="hover:text-emerald-400 transition-colors">
                  Success Stories
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories & Causes */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Support Categories</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>Medical & Emergency Operations</li>
              <li>Higher Education & Orphan Girls</li>
              <li>Dignified Marriage Aid</li>
              <li>Zakat Eligible Verified Causes</li>
              <li>Sadakah & General Relief</li>
              <li>Disability & Widow Welfare</li>
            </ul>
          </div>

          {/* Col 4: App Download & Newsletter */}
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Mobile App & QR</h4>
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shrink-0">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-white">Scan for MFCT App</p>
                <p className="text-slate-400 text-[10px]">Android & iOS Instant Download</p>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <span className="block text-slate-400 text-[11px]">Subscribe for Audit Transparency Reports</span>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  required
                  placeholder="Your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-emerald-500 flex-1"
                />
                <button
                  type="submit"
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  {subscribed ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Emergency Hotline Bar */}
        <div className="py-6 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Phone className="w-4 h-4" /> Helpline: +91 1800 200 MFCT (6328)
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" /> help@mfct.org
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" /> Central Secretariat, New Delhi, India
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Refund & Audit Policy</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 MFCT Community Foundation. All Rights Reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for Indian Community Empowerment & 100% Transparency.</p>
        </div>
      </div>
    </footer>
  );
};
