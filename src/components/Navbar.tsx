'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, UserRole } from '../types';
import { Heart, UserPlus, Menu, X, Shield, Sparkles, Building2, UserCheck, ChevronDown, Award, LayoutDashboard, Calculator, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  currentUser: User;
  onOpenDonate: () => void;
  onOpenRegister: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenMembershipCard: () => void;
  onNavigateToAdmin: () => void;
  onOpenZakatCalc?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onPageChange,
  currentUser,
  onOpenDonate,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  onOpenMembershipCard,
  onNavigateToAdmin,
  onOpenZakatCalc,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { t, isHindi, language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: t('nav.home', 'Home'), path: '/' },
    { id: 'campaigns', label: t('nav.campaigns', 'Campaigns'), path: '/campaigns' },
    { id: 'communities', label: t('nav.communities', 'Communities'), path: '/communities' },
    { id: 'niyamawali', label: language === 'hi' ? 'नियमावली' : language === 'ur' ? 'قواعد و ضوابط' : 'Niyamawali', path: '/niyamawali' },
    { id: 'rules', label: t('nav.rules', 'Rules & Guidelines'), path: '/rules' },
    { id: 'about', label: t('nav.about', 'About'), path: '/about' },
    { id: 'gallery', label: t('nav.gallery', 'Gallery'), path: '/gallery' },
    { id: 'members', label: language === 'hi' ? 'सदस्य सूची' : language === 'ur' ? 'ممبر لسٹ' : 'Members', path: '/members' },
    { id: 'testimonials', label: t('nav.testimonials', 'Impact Stories'), path: '/testimonials' },
    { id: 'contact', label: t('nav.contact', 'Contact'), path: '/contact' },
  ];

  return (
    <>
      {/* ── Top Header Section (Scrolls naturally with page) ── */}
      <header className="relative z-[60]">

      {/* ── Top Gold Ticker ── */}
      <div style={{ background: 'var(--mfct-dark-green)', borderBottom: '1px solid var(--mfct-gold-dark)' }} className="py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left / Center Info */}
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider" style={{ color: 'var(--mfct-gold)' }}>
            <span style={{ fontSize: '14px' }}>✦</span>
            <span>{language === 'hi' ? 'याद उनकी, सेवा हमारी' : language === 'ur' ? 'یاد ان کی، خدمت ہماری' : 'In Their Memory, In Our Service'}</span>
            <span style={{ fontSize: '14px' }}>✦</span>
            <span className="hidden sm:inline mx-3 opacity-60">|</span>
            <span className="hidden sm:inline" style={{ color: '#e0c068' }}>Regd. No.: 258/2026</span>
            <span className="hidden md:inline mx-3 opacity-60">|</span>
            <span className="hidden md:inline" style={{ color: '#e0c068' }}>+91 82180 17226</span>
          </div>

          {/* Right Corner: Social Handles */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Facebook Handle */}
            <a
              href="https://facebook.com/mfcttrust"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 group hover:opacity-90 transition-opacity"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <FaFacebookF className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[9px] text-white/80 block leading-tight">
                  Facebook Page
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-white block leading-tight">
                  mfcttrust
                </span>
              </div>
            </a>

            <span className="h-4 sm:h-5 w-px bg-white/25" />

            {/* Instagram Handle */}
            <a
              href="https://instagram.com/mfcttrust"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 group hover:opacity-90 transition-opacity"
            >
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
              >
                <FaInstagram className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[9px] text-white/80 block leading-tight">
                  Instagram Page
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-white block leading-tight">
                  mfcttrust
                </span>
              </div>
            </a>

            <span className="h-4 sm:h-5 w-px bg-white/25" />

            {/* WhatsApp Handle */}
            <a
              href="https://wa.me/918218017226"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 group hover:opacity-90 transition-opacity"
            >
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                style={{ background: '#25D366' }}
              >
                <FaWhatsapp className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[9px] text-white/80 block leading-tight">
                  WhatsApp
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-white block leading-tight">
                  +91 82180 17226
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ── White Hero Header Band ── */}
      <div style={{ background: '#ffffff', borderBottom: '3px solid var(--mfct-gold)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">

          {/* Brand Logo + Name */}
          <Link
            href="/"
            onClick={() => onPageChange('home')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <Image
              src="/logo.jpg"
              alt="MFCT Logo"
              width={56}
              height={56}
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--mfct-gold)',
                boxShadow: '0 4px 16px rgba(200,168,75,0.35)',
                transition: 'transform 0.2s',
              }}
              className="shrink-0 group-hover:scale-105"
            />
            <div>
              <span
                className="font-black leading-tight block"
                style={{
                  color: 'var(--mfct-dark-green)',
                  fontSize: '1.35rem',
                  fontFamily: isHindi ? 'inherit' : 'Georgia, serif',
                  letterSpacing: isHindi ? '0.01em' : '0.04em',
                  textTransform: isHindi ? 'none' : 'uppercase',
                }}
              >
                {language === 'hi' ? 'मोहम्मद फ़ईम' : language === 'ur' ? 'محمد فہیم' : 'MOHAMMAD FAEEM'}
              </span>
              <span
                className="font-black leading-tight block"
                style={{
                  color: 'var(--mfct-gold-dark)',
                  fontSize: '1.1rem',
                  fontFamily: isHindi ? 'inherit' : 'Georgia, serif',
                  letterSpacing: isHindi ? '0.01em' : '0.04em',
                  textTransform: isHindi ? 'none' : 'uppercase',
                }}
              >
                {language === 'hi' ? 'चैरिटेबल ट्रस्ट (MFCT)' : language === 'ur' ? 'چیریٹیبل ٹرسٹ (MFCT)' : 'CHARITABLE TRUST (MFCT)'}
              </span>
              <span
                className="font-semibold block mt-0.5"
                style={{ color: '#666', fontSize: '0.82rem', letterSpacing: '0.01em' }}
              >
                {language === 'hi' ? 'याद उनकी, सेवा हमारी' : language === 'ur' ? 'یاد ان کی، خدمت ہماری' : 'In Their Memory, In Our Service'}
              </span>
            </div>
          </Link>

          {/* CTA Buttons + Actions — Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Donate Now */}
            <button
              onClick={onOpenDonate}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md group"
              style={{ border: '2px solid var(--mfct-gold)', background: '#fff8e7', minHeight: '48px' }}
            >
              <Heart className="w-5 h-5 shrink-0" style={{ color: 'var(--mfct-gold-dark)' }} />
              <div className="text-left">
                <div className="font-black text-xs tracking-wider" style={{ color: 'var(--mfct-dark-green)', textTransform: isHindi ? 'none' : 'uppercase' }}>
                  {language === 'hi' ? 'दान करें' : language === 'ur' ? 'عطیہ کریں' : 'DONATE NOW'}
                </div>
                <div className="text-[10px]" style={{ color: '#888' }}>
                  {language === 'hi' ? 'आर्थिक सहयोग करें' : language === 'ur' ? 'مالی تعاون کریں' : 'Support us financially'}
                </div>
              </div>
            </button>

            {/* Become a Member */}
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md"
              style={{ border: '2px solid var(--mfct-gold)', background: '#fff8e7', minHeight: '48px' }}
            >
              <UserPlus className="w-5 h-5 shrink-0" style={{ color: 'var(--mfct-gold-dark)' }} />
              <div className="text-left">
                <div className="font-black text-xs tracking-wider" style={{ color: 'var(--mfct-dark-green)', textTransform: isHindi ? 'none' : 'uppercase' }}>
                  {language === 'hi' ? 'सदस्य बनें' : language === 'ur' ? 'ممبر بنیں' : 'BECOME A MEMBER'}
                </div>
                <div className="text-[10px]" style={{ color: '#888' }}>
                  {language === 'hi' ? 'ट्रस्ट से जुड़ें' : language === 'ur' ? 'ٹرسٹ سے جڑیں' : 'Join the trust'}
                </div>
              </div>
            </button>

            {/* Login / User Info & Dropdown */}
            {onLogout ? (
              <div className="relative">
                {(() => {
                  const displayName = (currentUser.name || 'User').replace(/\s*\([^)]*\)/g, '').trim() || 'User';
                  let roleIcon = <Heart className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />;
                  let roleLabel = t('admin.memberDonor', 'Member');
                  if (currentUser.role === 'super_admin') {
                    roleIcon = <Shield className="w-3.5 h-3.5 text-emerald-400" />;
                    roleLabel = t('admin.superAdmin', 'Super Admin');
                  } else if (currentUser.role === 'executive_admin') {
                    roleIcon = <Building2 className="w-3.5 h-3.5 text-blue-400" />;
                    roleLabel = isHindi ? 'मुख्य प्रशासक' : 'NGO Admin';
                  } else if (currentUser.role === 'community_admin') {
                    roleIcon = <Award className="w-3.5 h-3.5 text-purple-400" />;
                    roleLabel = t('admin.commAdmin', 'Community Admin');
                  } else if (currentUser.isPremium) {
                    roleIcon = <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
                    roleLabel = isHindi ? 'प्रमुख दानदाता' : 'Premium Donor';
                  }

                  return (
                    <>
                      <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md hover:brightness-105"
                        style={{
                          background: 'var(--mfct-dark-green)',
                          borderColor: 'var(--mfct-dark-green)',
                          minHeight: '48px',
                        }}
                        title={displayName}
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: 'rgba(200,168,75,0.2)', border: '1.5px solid var(--mfct-gold)' }}>
                          {currentUser.avatar && currentUser.avatar !== 'https://via.placeholder.com/150' ? (
                            <img
                              src={currentUser.avatar}
                              alt={displayName}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <UserIcon className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                          )}
                        </div>
                        <div className="text-left max-w-[120px]">
                          <div className="font-bold text-xs text-white truncate leading-tight">
                            {displayName}
                          </div>
                          <div className="text-[10px] truncate leading-tight" style={{ color: 'var(--mfct-gold)' }}>
                            {roleLabel}
                          </div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                      </button>

                      {/* Profile Dropdown Menu */}
                      {profileMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                          <div
                            className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in"
                            style={{
                              background: 'var(--mfct-dark-green)',
                              border: '1px solid rgba(200,168,75,0.35)',
                              boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
                            }}
                          >
                            {/* Header Info with Role below email & smaller */}
                            <div className="p-3.5" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)', background: 'rgba(0,0,0,0.25)' }}>
                              <p className="text-sm font-bold text-white truncate">{displayName}</p>
                              <p className="text-xs truncate font-medium mt-0.5" style={{ color: 'var(--mfct-gold)' }}>{currentUser.email || 'superadmin@sevasangam.org'}</p>
                              
                              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(200,168,75,0.25)', color: '#ffffff' }}>
                                {roleIcon}
                                <span>{roleLabel}</span>
                              </div>
                            </div>

                            {/* Body Options */}
                            <div className="p-2.5 space-y-1">
                              {/* Admin Portal Link */}
                              <Link
                                href="/admin"
                                onClick={() => { setProfileMenuOpen(false); onNavigateToAdmin(); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold text-left cursor-pointer"
                              >
                                <LayoutDashboard className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                                <span>{t('nav.adminPortal', 'Admin Portal')}</span>
                              </Link>

                              {/* ID Card Link */}
                              <button
                                onClick={() => { setProfileMenuOpen(false); onOpenMembershipCard(); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold text-left cursor-pointer"
                              >
                                <Shield className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                                <span>{t('nav.myCard', 'View ID Card')}</span>
                              </button>

                              <div className="my-1 border-t" style={{ borderColor: 'rgba(200,168,75,0.15)' }} />

                              {/* Logout Button */}
                              <button
                                onClick={() => { setProfileMenuOpen(false); onLogout(); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors text-xs font-bold text-left cursor-pointer"
                              >
                                <LogOut className="w-4 h-4" />
                                <span>{t('nav.logout', 'Logout')}</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md hover:brightness-110"
                  style={{
                    background: 'var(--mfct-dark-green)',
                    borderColor: 'var(--mfct-dark-green)',
                    color: '#ffffff',
                    minHeight: '48px',
                  }}
                  title="Login / साइन इन"
                >
                  <UserIcon className="w-5 h-5 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  <div className="font-black text-xs tracking-wider flex items-center gap-1.5" style={{ color: '#ffffff' }}>
                    <span>{t('nav.login', 'LOGIN')}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </div>
                </button>
              )
            )}
          </div>

          {/* Mobile: hamburger only */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageSelector compact mode="website" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg transition-all cursor-pointer"
              style={{ background: 'rgba(26,60,44,0.08)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.4)' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* ── Dark Green Nav Links Bar (Sticky across entire page) ── */}
      <nav
        className="sticky top-0 z-50 w-full"
        style={{
          background: 'var(--mfct-dark-green)',
          boxShadow: isScrolled ? '0 4px 18px rgba(0,0,0,0.35)' : '0 2px 6px rgba(0,0,0,0.15)',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.path}
                  onClick={() => onPageChange(link.id)}
                  className="px-4 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer relative"
                  style={{
                    color: isActive ? 'var(--mfct-gold)' : 'rgba(255,255,255,0.88)',
                    borderBottom: isActive ? '3px solid var(--mfct-gold)' : '3px solid transparent',
                    background: isActive ? 'rgba(200,168,75,0.12)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: language selector */}
          <div className="hidden sm:flex items-center gap-2 py-1.5">
            {/* Language Selector */}
            <LanguageSelector compact mode="website" />
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-3 pb-6 space-y-3 animate-fade-in max-h-[calc(100vh-60px)] overflow-y-auto" style={{ background: 'var(--mfct-dark-green)', borderTop: '1px solid rgba(200,168,75,0.2)' }}>
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.15)' }}>
              <span className="text-xs font-bold" style={{ color: 'rgba(200,168,75,0.7)' }}>Language / भाषा</span>
              <LanguageSelector mode="website" />
            </div>
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.path}
                  onClick={() => { onPageChange(link.id); setMobileMenuOpen(false); }}
                  className="text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer"
                  style={{
                    background: currentPage === link.id ? 'rgba(200,168,75,0.15)' : 'transparent',
                    color: currentPage === link.id ? 'var(--mfct-gold)' : 'rgba(255,255,255,0.85)',
                    borderLeft: currentPage === link.id ? '3px solid var(--mfct-gold)' : '3px solid transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(200,168,75,0.15)' }}>
              {onOpenZakatCalc && (
                <button
                  onClick={() => { onOpenZakatCalc(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: 'rgba(200,168,75,0.1)', color: 'var(--mfct-gold)', border: '1px solid rgba(200,168,75,0.3)' }}
                >
                  <Calculator className="w-4 h-4" /> {t('nav.zakatCalc', 'Zakat Calculator (2.5%)')}
                </button>
              )}
              <Link
                href="/admin"
                onClick={() => { onNavigateToAdmin(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <LayoutDashboard className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> {t('nav.adminPortal', 'Admin Portal')}
              </Link>
              <button
                onClick={() => { onOpenMembershipCard(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.80)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <Shield className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> {t('nav.myCard', 'View ID Card')} ({(currentUser.name || '').replace(/\s*\([^)]*\)/g, '').trim() || 'User'})
              </button>
              <button
                onClick={() => { onOpenRegister(); setMobileMenuOpen(false); }}
                className="mfct-btn-outline w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> {t('nav.join', 'Become a Member')}
              </button>
              <button
                onClick={() => { onOpenDonate(); setMobileMenuOpen(false); }}
                className="mfct-btn-gold w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-current" /> {t('nav.donate', 'Donate Now')}
              </button>
              {onLogout ? (
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-lg text-rose-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <LogOut className="w-4 h-4" /> {t('admin.logoutAccount', 'Logout Account')}
                </button>
              ) : (
                onOpenLogin && (
                  <button
                    onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                    className="mfct-btn-dark w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> {t('nav.login', 'Login')}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
