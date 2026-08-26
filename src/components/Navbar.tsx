'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, UserRole } from '../types';
import { Heart, UserPlus, Menu, X, Shield, Sparkles, Building2, UserCheck, ChevronDown, Award, LayoutDashboard, Calculator, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { label } from 'motion/react-client';

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
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-200 border-b border-slate-200 ${isScrolled ? 'shadow-md py-3' : 'py-3.5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => onPageChange('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            <div className="w-4 h-4 border-2 border-white rounded-sm flex items-center justify-center text-[10px]">M</div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-emerald-950 group-hover:text-emerald-700 transition-colors">
              MFCT
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
              Community Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-500">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <Link
                key={link.id}
                href={link.path}
                onClick={() => onPageChange(link.id)}
                className={`px-3 py-2 rounded-lg transition-colors duration-150 cursor-pointer ${isActive
                  ? 'text-emerald-700 font-bold bg-emerald-50 border border-emerald-100'
                  : 'hover:text-emerald-600 hover:bg-slate-50'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Language Selector */}
        <div className="hidden sm:flex items-center gap-2.5">

          {/* Zakat Calculator Button */}
          {/* {onOpenZakatCalc && (
            <button
              onClick={onOpenZakatCalc}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200/80 shadow-sm cursor-pointer"
              title="Open Zakat Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-700" />
              <span>{isHindi ? 'ज़कात कैलकुलेटर' : 'Zakat Calcu'}</span>
            </button>
          )} */}

          {/* Member / Admin Portal Link */}
          <Link
            href="/admin"
            onClick={onNavigateToAdmin}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200/80 shadow-sm cursor-pointer"
            title="Open Admin & Member Portal Desk"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('nav.adminPortal', 'Admin Portal')}</span>
          </Link>

          {/* <button
            onClick={onOpenRegister}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200/80 shadow-sm cursor-pointer"
          >
            <UserPlus className="" />
            <span>{isHindi ? 'सदस्य बनें' : 'Become a Member'}</span>
          </button> */}

          {/* <button
            onClick={onOpenDonate}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200/80 shadow-sm cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{t('nav.donate', 'Donate Now')}</span>
          </button> */}

          {/* Language Selector */}
          <LanguageSelector compact mode="website" />

          {/* Login / User Profile Button */}
          {onLogout ? (
            <div className="relative ml-1">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                  {currentUser.avatar && currentUser.avatar !== 'https://via.placeholder.com/150' ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-800 bg-slate-950/50">
                      <p className="text-sm font-bold text-white truncate">{currentUser.name || "No name"}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email || 'No email provided'}</p>
                    </div>
                    <div className="p-2">
                      <div className="px-2 py-1.5 mb-2 rounded-lg bg-slate-800/50 flex items-center gap-2 border border-slate-800">
                        {(() => {
                          let icon = <Heart className="w-3.5 h-3.5 text-emerald-400" />;
                          let label = 'Member / Volunteer';
                          if (currentUser.role === 'super_admin') { icon = <Shield className="w-3.5 h-3.5 text-indigo-400" />; label = 'Super Admin'; }
                          else if (currentUser.role === 'executive_admin') { icon = <Building2 className="w-3.5 h-3.5 text-blue-400" />; label = 'NGO Admin'; }
                          else if (currentUser.role === 'community_admin') { icon = <Award className="w-3.5 h-3.5 text-purple-400" />; label = 'Community Admin'; }
                          else if (currentUser.role === 'premium_donor') { icon = <Sparkles className="w-3.5 h-3.5 text-amber-400" />; label = 'Premium Donor'; }
                          return (
                            <>
                              {icon}
                              <span className="text-xs font-bold text-slate-300">{label}</span>
                            </>
                          );
                        })()}
                      </div>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onLogout();
                        }}
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
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Login with any of the 4 roles"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
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
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">Language / भाषा</span>
            <LanguageSelector mode="website" />
          </div>
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.path}
                onClick={() => {
                  onPageChange(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors duration-150 cursor-pointer ${currentPage === link.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {onOpenZakatCalc && (
              <button
                onClick={() => {
                  onOpenZakatCalc();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-amber-700" /> {t('nav.zakatCalc', 'Zakat Calculator (2.5%)')}
              </button>
            )}
            <Link
              href="/admin"
              onClick={() => {
                onNavigateToAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" /> {t('nav.adminPortal', 'Admin Portal')} (/admin)
            </Link>
            <button
              onClick={() => {
                onOpenMembershipCard();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Shield className="w-4 h-4 text-emerald-600" /> {t('nav.myCard', 'View ID Card')} ({currentUser.name})
            </button>
            <button
              onClick={() => {
                onOpenRegister();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> {t('nav.join', 'Become a Member')}
            </button>
            <button
              onClick={() => {
                onOpenDonate();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current" /> {t('nav.donate', 'Donate Now')}
            </button>
            {onLogout ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-white" /> {t('admin.logoutAccount', 'Logout Account')}
              </button>
            ) : (
              onOpenLogin && (
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" /> {t('nav.login', 'Login')}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

