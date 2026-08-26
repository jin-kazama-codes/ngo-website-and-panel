'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, ShieldCheck, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onPageChange: (page: string) => void;
  onOpenDonate: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { t } = useLanguage();

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
                <span className="font-extrabold text-2xl tracking-tight text-white">MFCT</span>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('footer.platform_label', 'Community Platform')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footer.aboutText', 'MFCT is a transparent, grassroots welfare network providing medical aid, Nikah support, education, and Janazah services.')}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t('footer.ngo_badge', 'Section 8 Registered NGO | 80G Tax Exemption Certified')}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{t('footer.quickLinks', 'Quick Navigation')}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <Link href="/admin" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                  <span>{t('footer.admin_portal', 'Admin & Member Portal (/admin)')}</span>
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  {t('nav.home', 'Home')}
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="hover:text-emerald-400 transition-colors">
                  {t('nav.campaigns', 'Verified Campaigns')}
                </Link>
              </li>
              <li>
                <Link href="/communities" className="hover:text-emerald-400 transition-colors">
                  {t('nav.communities', 'Local Communities')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  {t('nav.about', 'About Us')}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-emerald-400 transition-colors">
                  {t('nav.gallery', 'Gallery')}
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-emerald-400 transition-colors">
                  {t('nav.testimonials', 'Impact Stories')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories & Causes */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{t('footer.causes', 'Aid Categories')}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>{t('cat.medical', 'Medical Aid')}</li>
              <li>{t('cat.education', 'Education & Books')}</li>
              <li>{t('cat.marriage', 'Marriage & Nikah Support')}</li>
              <li>{t('cat.zakat', 'Zakat Eligible')}</li>
              <li>{t('cat.sadakah', 'Sadaqah & General Relief')}</li>
              <li>{t('cat.janazah', 'Janazah & Cemetery')}</li>
            </ul>
          </div>

          {/* Col 4: App Download & QR */}
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{t('footer.app_qr', 'Mobile App & QR')}</h4>
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shrink-0">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-white">{t('footer.scan_app', 'Scan for MFCT App')}</p>
                <p className="text-slate-400 text-[10px]">{t('footer.android_ios', 'Android & iOS quick download')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-6 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Phone className="w-4 h-4" /> {t('footer.helpline', 'Helpline: +91 1800 200 MFCT (6328)')}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" /> {t('footer.bareillyAddress', 'Bareilly, Uttar Pradesh, India')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <Link href="/privacy" className="hover:text-slate-300 cursor-pointer">{t('footer.privacy', 'Privacy Policy')}</Link>
            <Link href="/terms" className="hover:text-slate-300 cursor-pointer">{t('footer.terms', 'Terms of Service')}</Link>
            <Link href="/refund" className="hover:text-slate-300 cursor-pointer">{t('footer.refund', 'Refund & Audit Policy')}</Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>{t('footer.copyright', '© 2026 MFCT Community Foundation. All rights reserved.')}</p>
          <p className="mt-2 sm:mt-0">{t('footer.rights', '100% Transparency and Community Empowerment.')}</p>
        </div>
      </div>
    </footer>
  );
};
