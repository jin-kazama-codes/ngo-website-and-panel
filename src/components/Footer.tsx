'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, ShieldCheck, QrCode, Mail, Globe, Facebook, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onPageChange: (page: string) => void;
  onOpenDonate: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDonate }) => {
  const { t } = useLanguage();

  return (
    <footer style={{ background: 'var(--mfct-dark-green)', color: 'rgba(255,255,255,0.85)' }}>
      {/* ── Membership CTA Band ── */}
      <div style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(200,168,75,0.2)' }} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left: Member */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(200,168,75,0.15)', border: '2px solid rgba(200,168,75,0.4)' }}>
                <ShieldCheck className="w-5 h-5" style={{ color: 'var(--mfct-gold)' }} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{t('footer.become_member', 'Become a Member')}</p>
                <p className="text-xs" style={{ color: 'rgba(200,168,75,0.7)' }}>{t('footer.member_desc', 'MFCT से जुड़ें और समाज सेवा का हिस्सा बनें।')}</p>
              </div>
            </div>

            {/* Center: Logo */}
            <div className="flex flex-col items-center gap-2 text-center">
              <img
                src="/mfct-logo.jpeg"
                alt="Mohammad Faeem Charitable Trust"
                className="w-16 h-16 rounded-full object-cover border-2 border-[var(--mfct-gold)] shadow-lg"
              />
              <p className="text-xs font-medium" style={{ color: 'rgba(200,168,75,0.6)' }}>Mohammad Faeem Charitable Trust</p>
              <p className="text-[10px]" style={{ color: 'rgba(200,168,75,0.5)' }}>Bareilly, Uttar Pradesh</p>
            </div>

            {/* Right: Donate */}
            <div className="flex items-center gap-4 md:justify-end">
              <div>
                <p className="font-bold text-white text-sm text-right">{t('footer.support_cause', 'Support Our Cause')}</p>
                <p className="text-xs text-right" style={{ color: 'rgba(200,168,75,0.7)' }}>{t('footer.support_desc', 'आपका छोटा सा सहयोग किसी की ज़िंदगी बदल सकता है।')}</p>
              </div>
              <button
                onClick={onOpenDonate}
                className="mfct-btn-gold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                ♥ {t('nav.donate', 'Donate Now')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Content ── */}
      <div className="py-10" style={{ borderBottom: '1px solid rgba(200,168,75,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Col 1: Brand & Mission */}
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-3">
                <img
                  src="/mfct-logo.jpeg"
                  alt="MFCT Logo"
                  className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-[var(--mfct-gold)]"
                />
                <div>
                  <span className="font-extrabold text-white text-sm block" style={{ fontFamily: 'serif' }}>Mohammad Faeem</span>
                  <span className="text-xs block" style={{ color: 'var(--mfct-gold)' }}>Charitable Trust</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {t('footer.aboutText', 'MFCT is a transparent, grassroots welfare network providing medical aid, Nikah support, education, and Janazah services.')}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--mfct-gold)' }}>
                <ShieldCheck className="w-4 h-4" /> {t('footer.ngo_badge', 'Section 8 Registered NGO')}
              </div>
              {/* Social Icons */}
              <div className="flex gap-2 pt-1">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Youtube, label: 'YouTube' },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} title={label} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer" style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.25)', color: 'var(--mfct-gold)' }}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
                {/* WhatsApp */}
                <button title="WhatsApp" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer" style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.25)', color: 'var(--mfct-gold)' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12.004 2C6.477 2 2 6.484 2 12.017c0 1.99.52 3.853 1.428 5.467L2 22l4.656-1.394C8.016 21.451 9.964 22 12.004 22 17.53 22 22 17.516 22 11.983 22 6.462 17.531 2 12.004 2zm0 18.18c-1.717 0-3.402-.462-4.877-1.338l-.35-.207-3.624 1.085 1.085-3.543-.228-.364C3.017 14.51 2.72 13.27 2.72 12c0-5.122 4.16-9.28 9.284-9.28 5.116 0 9.276 4.158 9.276 9.28 0 5.12-4.16 9.18-9.276 9.18z" /></svg>
                </button>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm pb-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)' }}>
                {t('footer.quickLinks', 'Quick Navigation')}
              </h4>
              <ul className="space-y-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <li><Link href="/admin" className="font-bold transition-colors hover:opacity-100" style={{ color: 'var(--mfct-gold)' }}>{t('footer.admin_portal', 'Admin & Member Portal')}</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">{t('nav.home', 'Home')}</Link></li>
                <li><Link href="/campaigns" className="hover:text-white transition-colors">{t('nav.campaigns', 'Verified Campaigns')}</Link></li>
                <li><Link href="/communities" className="hover:text-white transition-colors">{t('nav.communities', 'Local Communities')}</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">{t('nav.about', 'About Us')}</Link></li>
                <li><Link href="/gallery" className="hover:text-white transition-colors">{t('nav.gallery', 'Gallery')}</Link></li>
                <li><Link href="/testimonials" className="hover:text-white transition-colors">{t('nav.testimonials', 'Impact Stories')}</Link></li>
              </ul>
            </div>

            {/* Col 3: Programs */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm pb-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)' }}>
                {t('footer.causes', 'Our Programs')}
              </h4>
              <ul className="space-y-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <li className="hover:text-white transition-colors cursor-default">{t('cat.medical', '🏥 Medical Aid')}</li>
                <li className="hover:text-white transition-colors cursor-default">{t('cat.education', '📚 Education & Books')}</li>
                <li className="hover:text-white transition-colors cursor-default">{t('cat.marriage', '💍 Marriage & Nikah Support')}</li>
                <li className="hover:text-white transition-colors cursor-default">{t('cat.zakat', '🤲 Zakat Eligible')}</li>
                <li className="hover:text-white transition-colors cursor-default">{t('cat.sadakah', '❤️ Sadaqah & General Relief')}</li>
                <li className="hover:text-white transition-colors cursor-default">{t('cat.janazah', '🕌 Janazah & Cemetery')}</li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm pb-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)' }}>
                {t('footer.contact_info', 'Contact Info')}
              </h4>
              <div className="space-y-3" style={{ color: 'rgba(255,255,255,0.70)' }}>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <span>{t('footer.address', 'Village Pipariya, Post Bilwa, Bareilly, Uttar Pradesh – 243202, India')}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                    <span style={{ color: 'var(--mfct-gold)' }}>+91 82180 17226</span>
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <span>+91 97569 19430</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <span>info@mfcttrust.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <span>www.mfcttrust.com</span>
                </div>
              </div>
            </div>

            {/* <form onSubmit={handleSubscribe} className="space-y-2">
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
            </form> */}
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="py-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <p>© 2025 Mohammad Faeem Charitable Trust (MFCT). All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">{t('footer.privacy', 'Privacy Policy')}</Link>
            <span className="opacity-30">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">{t('footer.terms', 'Terms & Conditions')}</Link>
            <span className="opacity-30">|</span>
            <Link href="/refund" className="hover:text-white transition-colors">{t('footer.refund', 'Refund Policy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
