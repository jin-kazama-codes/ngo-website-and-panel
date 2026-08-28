'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, Mail, Globe, ArrowRight, UserPlus, Heart, ShieldCheck, Facebook, Youtube } from 'lucide-react';
import { FaHandsHoldingChild, FaHandHoldingHeart, FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa6';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onPageChange: (page: string) => void;
  onOpenDonate: () => void;
  onOpenRegister?: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDonate, onOpenRegister, onPageChange }) => {
  const { t, language } = useLanguage();

  return (
    <footer style={{ background: '#092115', color: 'rgba(255,255,255,0.85)' }} className="pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ── 1. Top Hero Card Banner (Become a Member / Center Logo / Support Our Cause) ── */}
        <div
          className="relative rounded-2xl md:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl overflow-visible"
          style={{
            background: 'radial-gradient(ellipse at center, #103825 0%, #082115 100%)',
            border: '1.5px solid rgba(200, 168, 75, 0.45)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Become a Member */}
            <div className="lg:col-span-5 flex items-start gap-4 sm:gap-5">
              <div className="shrink-0 pt-1">
                <FaHandsHoldingChild
                  className="w-10 h-10 sm:w-12 sm:h-12"
                  style={{ color: '#d4af37' }}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    {language === 'hi' ? 'सदस्य बनें' : language === 'ur' ? 'ممبر بنیں' : 'Become a Member'}
                  </h3>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {language === 'hi'
                      ? 'MFCT से जुड़ें और समाज सेवा का हिस्सा बनें।'
                      : language === 'ur'
                      ? 'ایم ایف سی ٹی سے جڑیں اور فلاحی کاموں کا حصہ بنیں۔'
                      : 'Join MFCT and be a part of community service.'}
                  </p>
                </div>
                <button
                  onClick={onOpenRegister}
                  className="mfct-btn-gold px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <span>{language === 'hi' ? 'अभी जुड़ें' : language === 'ur' ? 'ابھی جڑیں' : 'JOIN NOW'}</span>
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Column: Prominent Circular Logo */}
            <div className="lg:col-span-2 flex justify-center -my-4 lg:-my-8">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-2xl p-1 bg-white"
                style={{
                  border: '3px solid #d4af37',
                  boxShadow: '0 0 25px rgba(212, 175, 55, 0.35)',
                }}
              >
                <img
                  src="/mfct-logo.jpeg"
                  alt="Mohammad Faeem Charitable Trust (MFCT)"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* Right Column: Support Our Cause */}
            <div className="lg:col-span-5 flex items-start justify-start lg:justify-end gap-4 sm:gap-5">
              <div className="shrink-0 pt-1 lg:order-2">
                <FaHandHoldingHeart
                  className="w-10 h-10 sm:w-12 sm:h-12"
                  style={{ color: '#d4af37' }}
                />
              </div>
              <div className="space-y-3 lg:text-right lg:order-1">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    {language === 'hi' ? 'सहयोग करें' : language === 'ur' ? 'مدد کریں' : 'Support Our Cause'}
                  </h3>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {language === 'hi'
                      ? 'आपका छोटा सा सहयोग किसी की ज़िंदगी बदल सकता है।'
                      : language === 'ur'
                      ? 'آپ کا چھوٹا سا تعاون کسی کی زندگی بدل سکتا ہے۔'
                      : 'Your small support can change someone’s life.'}
                  </p>
                </div>
                <div className="flex lg:justify-end">
                  <button
                    onClick={onOpenDonate}
                    className="mfct-btn-gold px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{language === 'hi' ? 'दान करें' : language === 'ur' ? 'عطیہ کریں' : 'DONATE NOW'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 2. Main 4-Column Footer Section ── */}
        <div className="pt-4 pb-10" style={{ borderBottom: '1px solid rgba(200,168,75,0.15)' }}>
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
                  <span className="font-extrabold text-white text-sm block">
                    {language === 'hi' ? 'मोहम्मद फ़ईम' : language === 'ur' ? 'محمد فہیم' : 'Mohammad Faeem'}
                  </span>
                  <span className="text-xs block" style={{ color: 'var(--mfct-gold)' }}>
                    {language === 'hi' ? 'चैरिटेबल ट्रस्ट' : language === 'ur' ? 'چیریٹیبل ٹرسٹ' : 'Charitable Trust'}
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {language === 'hi'
                  ? 'एमएफसीटी (मोहम्मद फ़ईम चैरिटेबल ट्रस्ट) एक पारदर्शी, ज़मीनी स्तर का कल्याणकारी नेटवर्क है जो गरीब परिवारों को चिकित्सा सहायता, निकाह सहायता, शिक्षा और जनाज़ा सेवाएं प्रदान करता है।'
                  : language === 'ur'
                  ? 'ایم ایف سی ٹی (محمد فہیم چیریٹیبل ٹرسٹ) ایک شفاف، زمینی فلاحی نیٹ ورک ہے جو ضرورت مند خاندانوں کو طبی امداد، نکاح امداد، تعلیم اور جنازہ خدمات فراہم کرتا ہے۔'
                  : 'MFCT (Mohammad Faeem Charitable Trust) is a transparent, grassroots welfare network providing medical aid, Nikah support, education, and Janazah services to poor families.'}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--mfct-gold)' }}>
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {language === 'hi'
                    ? 'धारा 8 पंजीकृत एनजीओ | 80G कर छूट प्रमाणित'
                    : language === 'ur'
                    ? 'سیکشن 8 رجسٹرڈ این جی او | 80G ٹیکس چھوٹ تصدیق شدہ'
                    : 'Section 8 Registered NGO | 80G Tax Exemption Certified'}
                </span>
              </div>

              {/* Social Icons */}
              <div className="flex gap-2.5 pt-1">
                {[
                  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com/mfcttrust' },
                  { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com/mfcttrust' },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    title={label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                    style={{
                      background: 'rgba(200,168,75,0.12)',
                      border: '1px solid rgba(200,168,75,0.28)',
                      color: 'var(--mfct-gold)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
                {/* WhatsApp */}
                <a
                  href="https://wa.me/918218017226"
                  target="_blank"
                  rel="noreferrer"
                  title="WhatsApp"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                  style={{
                    background: 'rgba(200,168,75,0.12)',
                    border: '1px solid rgba(200,168,75,0.28)',
                    color: 'var(--mfct-gold)',
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.41              <ul className="space-y-2" style={{ color: 'rgba(255,255,255,0.70)' }}>
                <li><Link href="/admin" className="font-bold transition-colors hover:opacity-100" style={{ color: 'var(--mfct-gold)' }}>{language === 'hi' ? 'व्यवस्थापक और सदस्य पोर्टल (/admin)' : language === 'ur' ? 'ایڈمن اور ممبر پورٹل (/admin)' : 'Admin & Member Portal (/admin)'}</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">{language === 'hi' ? 'मुख्य पृष्ठ' : language === 'ur' ? 'ہوم' : 'Home'}</Link></li>
                <li><Link href="/campaigns" className="hover:text-white transition-colors">{language === 'hi' ? 'सभी अभियान' : language === 'ur' ? 'تمام مہمات' : 'Verified Campaigns'}</Link></li>
                <li><Link href="/communities" className="hover:text-white transition-colors">{language === 'hi' ? 'समुदाय नेटवर्क' : language === 'ur' ? 'کمیونٹی نیٹ ورک' : 'Local Communities'}</Link></li>
                <li><Link href="/niyamawali" className="hover:text-white transition-colors">{language === 'hi' ? 'नियमावली एवं नियम' : language === 'ur' ? 'قواعد و ضوابط' : 'Rules & Niyamawali'}</Link></li>
                <li><Link href="/rules" className="hover:text-white transition-colors text-emerald-300 font-medium">{language === 'hi' ? 'ट्रस्ट नियमावली (27 नियम)' : language === 'ur' ? 'ٹرسٹ قواعد و ضوابط' : 'Trust Rules & Guidelines'}</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">{language === 'hi' ? 'हमारे बारे में' : language === 'ur' ? 'ہمارے بارے میں' : 'About Us'}</Link></li>
                <li><Link href="/gallery" className="hover:text-white transition-colors">{language === 'hi' ? 'गैलरी एवं फोटो' : language === 'ur' ? 'گیلری' : 'Gallery'}</Link></li>
                <li><Link href="/members" className="hover:text-white transition-colors">{language === 'hi' ? 'सदस्य सूची' : language === 'ur' ? 'ممبر لسٹ' : 'Member Directory'}</Link></li>
                <li><Link href="/testimonials" className="hover:text-white transition-colors">{language === 'hi' ? 'प्रभाव गाथाएं' : language === 'ur' ? 'اثرات کی کہانیاں' : 'Impact Stories'}</Link></li>
              </ul>
            </div>

            {/* Col 3: Key Programs */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm pb-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)' }}>
                {language === 'hi' ? 'हमारी प्रमुख सेवाएं' : language === 'ur' ? 'ہماری اہم خدمات' : 'Our Key Services'}
              </h4>
              <ul className="space-y-2" style={{ color: 'rgba(255,255,255,0.70)' }}>
                <li className="hover:text-white transition-colors cursor-default">{language === 'hi' ? 'चिकित्सा सहायता' : language === 'ur' ? 'طبی امداد' : 'Medical Aid'}</li>
                <li className="hover:text-white transition-colors cursor-default">{language === 'hi' ? 'शिक्षा एवं पुस्तकें' : language === 'ur' ? 'تعلیم اور کتب' : 'Education & Books'}</li>
                <li className="hover:text-white transition-colors cursor-default">{language === 'hi' ? 'विवाह एवं निकाह सहायता' : language === 'ur' ? 'شادی اور نکاح امداد' : 'Marriage & Nikah Support'}</li>
                <li className="hover:text-white transition-colors cursor-default">{language === 'hi' ? 'ज़कात योग्य' : language === 'ur' ? 'زکوٰۃ के مستحق' : 'Zakat Eligible'}</li>
                <li className="hover:text-white transition-colors cursor-default">{language === 'hi' ? 'सदक़ा एवं सामान्य राहत' : language === 'ur' ? 'صدقہ और عام ریلیف' : 'Sadaqah & General Relief'}</li>
                <li className="hover:text-white transition-colors cursor-default">{language === 'hi' ? 'जनाज़ा एवं क़ब्रिस्तान' : language === 'ur' ? 'جنازہ اور قبرستان' : 'Janazah & Cemetery'}</li>
              </ul>
            </div>

            {/* Col 4: Contact Info */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm pb-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)' }}>
                {language === 'hi' ? 'संपर्क एवं पता' : language === 'ur' ? 'رابطہ और پتہ' : 'Contact Info'}
              </h4>
              <div className="space-y-3" style={{ color: 'rgba(255,255,255,0.70)' }}>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <span>
                    {language === 'hi'
                      ? 'ग्राम पिपरिया, पोस्ट बिलवा, बरेली, उत्तर प्रदेश – 243202, भारत'
                      : language === 'ur'
                      ? 'گاؤں پپریہ، پوسٹ بلوا، بریلی، اتر پردیش – 243202، بھارت'
                      : 'Village Pipariya, Post Bilwa, Bareilly, Uttar Pradesh – 243202, India'}
                  </span>
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

          </div>
        </div>

      </div>

      {/* ── 4. Bottom Copyright & Legal Links Bar ── */}
      <div className="mt-4 py-4" style={{ background: '#05140d', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <p>© 2026 Mohammad Faeem Charitable Trust (MFCT). {language === 'hi' ? 'सर्वाधिकार सुरक्षित।' : language === 'ur' ? 'جملہ حقوق محفوظ ہیں۔' : 'All Rights Reserved.'}</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/rules" className="hover:text-white transition-colors text-emerald-300 font-semibold">
              {language === 'hi' ? 'नियम एवं दिशानिर्देश' : language === 'ur' ? 'قواعد و ضوابط' : 'Rules & Guidelines'}
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {language === 'hi' ? 'गोपनीयता नीति' : language === 'ur' ? 'پرائیویسی پالیسی' : 'Privacy Policy'}
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              {language === 'hi' ? 'सेवा की शर्तें' : language === 'ur' ? 'شرائط و ضوابط' : 'Terms & Conditions'}
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/refund" className="hover:text-white transition-colors">
              {language === 'hi' ? 'रिफंड और ऑडिट नीति' : language === 'ur' ? 'ریفنڈ پالیسی' : 'Refund Policy'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
