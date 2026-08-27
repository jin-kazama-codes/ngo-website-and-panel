'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, UserRole } from '../types';
import { Heart, UserPlus, Menu, X, Shield, Sparkles, Building2, UserCheck, ChevronDown, Award, LayoutDashboard, Calculator, LogIn, LogOut, User as UserIcon } from 'lucide-react';
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
  const { t, isHindi } = useLanguage();

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
    { id: 'about', label: t('nav.about', 'About'), path: '/about' },
    { id: 'gallery', label: t('nav.gallery', 'Gallery'), path: '/gallery' },
    { id: 'contact', label: t('nav.contact', 'Contact'), path: '/contact' },
    { id: 'testimonials', label: t('nav.testimonials', 'Impact Stories'), path: '/testimonials' },
  ];

  return (
    <header className="sticky top-0 z-50" style={{ boxShadow: isScrolled ? 'var(--shadow-strong)' : '0 2px 8px rgba(26,60,44,0.12)' }}>
      {/* ── Top Gold Ticker ── */}
      <div style={{ background: 'var(--mfct-dark-green)', borderBottom: '1px solid var(--mfct-gold-dark)' }} className="py-1.5 overflow-hidden">
        <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-wider" style={{ color: 'var(--mfct-gold)' }}>
          <span style={{ fontSize: '14px' }}>✦</span>
          <span>याद उनकी, सेवा हमारी</span>
          <span style={{ fontSize: '14px' }}>✦</span>
          <span className="hidden sm:inline mx-4 opacity-60">|</span>
          <span className="hidden sm:inline" style={{ color: '#e0c068' }}>Regd. No.: 258/2026</span>
          <span className="hidden md:inline mx-4 opacity-60">|</span>
          <span className="hidden md:inline" style={{ color: '#e0c068' }}>+91 82180 17226</span>
        </div>
      </div>

      {/* ── Main Nav Bar ── */}
      <div style={{ background: 'var(--mfct-dark-green)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2.5">

          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => onPageChange('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="/mfct-logo.jpeg"
              alt="Mohammad Faeem Charitable Trust (MFCT)"
              className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-[var(--mfct-gold)] shadow-md group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-extrabold text-base tracking-tight leading-tight block" style={{ color: 'var(--mfct-gold)', fontFamily: 'serif' }}>
                Mohammad Faeem
              </span>
              <span className="font-bold text-xs tracking-wide leading-tight block" style={{ color: '#e0c068' }}>
                Charitable Trust (MFCT)
              </span>
              <span className="text-[10px] font-medium block" style={{ color: 'rgba(200,168,75,0.6)' }}>
                याद उनकी, सेवा हमारी
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.path}
                  onClick={() => onPageChange(link.id)}
                  className="px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer relative"
                  style={{
                    color: isActive ? 'var(--mfct-gold)' : 'rgba(255,255,255,0.85)',
                    borderBottom: isActive ? '2px solid var(--mfct-gold)' : '2px solid transparent',
                    background: isActive ? 'rgba(200,168,75,0.10)' : 'transparent',
                    borderRadius: '4px 4px 0 0',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Donate Now button */}
            {/* <button
              onClick={onOpenDonate}
              className="mfct-btn-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{t('nav.donate', 'Donate Now')}</span>
            </button> */}

            {/* Become a Member */}
            {/* <button
              onClick={onOpenRegister}
              className="mfct-btn-outline px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isHindi ? 'सदस्य बनें' : 'Become a Member'}</span>
            </button> */}

            {/* Language Selector */}
            <LanguageSelector compact mode="website" />

            {/* Admin Portal */}
            <Link
              href="/admin"
              onClick={onNavigateToAdmin}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}
              title="Open Admin & Member Portal Desk"
            >
              <LayoutDashboard className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
              <span className="hidden md:inline">{t('nav.adminPortal', 'Admin Portal')}</span>
            </Link>

            {/* Login / User Profile */}
            {onLogout ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-1.5 p-1 pr-2 rounded-full transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(200,168,75,0.4)' }}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'rgba(200,168,75,0.2)', border: '2px solid var(--mfct-gold)' }}>
                    {currentUser.avatar && currentUser.avatar !== 'https://via.placeholder.com/150' ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
                </button>

                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl z-50 overflow-hidden" style={{ background: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}>
                      <div className="p-3" style={{ borderBottom: '1px solid rgba(200,168,75,0.2)', background: 'rgba(0,0,0,0.2)' }}>
                        <p className="text-sm font-bold text-white truncate">{currentUser.name || 'No name'}</p>
                        <p className="text-xs truncate" style={{ color: 'rgba(200,168,75,0.8)' }}>{currentUser.email || 'No email provided'}</p>
                      </div>
                      <div className="p-2">
                        <div className="px-2 py-1.5 mb-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)' }}>
                          {(() => {
                            let icon = <Heart className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />;
                            let lbl = 'Member / Volunteer';
                            if (currentUser.role === 'super_admin') { icon = <Shield className="w-3.5 h-3.5 text-indigo-400" />; lbl = 'Super Admin'; }
                            else if (currentUser.role === 'executive_admin') { icon = <Building2 className="w-3.5 h-3.5 text-blue-400" />; lbl = 'NGO Admin'; }
                            else if (currentUser.role === 'community_admin') { icon = <Award className="w-3.5 h-3.5 text-purple-400" />; lbl = 'Community Admin'; }
                            else if (currentUser.isPremium) { icon = <Sparkles className="w-3.5 h-3.5 text-amber-400" />; lbl = 'Premium Donor'; }
                            return <>{icon}<span className="text-xs font-bold text-white">{lbl}</span></>;
                          })()}
                        </div>
                        <button
                          onClick={() => { setProfileMenuOpen(false); onLogout(); }}
                          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors text-xs font-bold text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="mfct-btn-dark px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Login with any of the 4 roles"
                >
                  <LogIn className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
                  <span>Login</span>
                </button>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageSelector compact mode="website" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'var(--mfct-gold)', border: '1px solid rgba(200,168,75,0.3)' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Nav underline bar for desktop ── */}
      <div className="hidden lg:block h-0.5" style={{ background: 'linear-gradient(90deg, var(--mfct-gold-dark), var(--mfct-gold), var(--mfct-gold-dark))' }} />

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 space-y-3 animate-fade-in" style={{ background: 'var(--mfct-dark-green)', borderTop: '1px solid rgba(200,168,75,0.2)' }}>
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
              <Shield className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> {t('nav.myCard', 'View ID Card')} ({currentUser.name})
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
    </header>
  );
};
