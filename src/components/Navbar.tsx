'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, UserRole } from '../types';
import { Heart, UserPlus, Menu, X, Shield, Sparkles, Building2, UserCheck, ChevronDown, Award, LayoutDashboard, Calculator, LogIn, LogOut } from 'lucide-react';
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
    { id: 'testimonials', label: t('nav.testimonials', 'Impact Stories'), path: '/testimonials' },
    { id: 'contact', label: t('nav.contact', 'Contact'), path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-200 border-b border-slate-200 ${
        isScrolled ? 'shadow-md py-3' : 'py-3.5'
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
                className={`px-3 py-2 rounded-lg transition-all ${
                  isActive
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
          {/* Language Selector */}
          <LanguageSelector compact />

          {/* Zakat Calculator Button */}
          {onOpenZakatCalc && (
            <button
              onClick={onOpenZakatCalc}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-300/80 shadow-xs"
              title="Open Zakat Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-700" />
              <span>{isHindi ? 'ज़कात कैलकुलेटर' : 'Zakat Calc'}</span>
            </button>
          )}

          {/* Member / Admin Portal Link */}
          <Link
            href="/admin"
            onClick={onNavigateToAdmin}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200/80 shadow-sm"
            title="Open Admin & Member Portal Desk"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('nav.adminPortal', 'Admin Portal')}</span>
          </Link>

          <button
            onClick={onOpenRegister}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200/80 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('nav.join', 'Join (₹50)')}</span>
          </button>

          <button
            onClick={onOpenDonate}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{t('nav.donate', 'Donate Now')}</span>
          </button>

          {/* Login / Logout Button */}
          {onLogout ? (
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-rose-200/80 shadow-xs cursor-pointer"
              title="Logout Account"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Logout</span>
            </button>
          ) : (
            onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
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
          <LanguageSelector compact />
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
            <LanguageSelector />
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
                className={`text-left px-4 py-2.5 rounded-xl font-bold text-sm ${
                  currentPage === link.id
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
                className="w-full py-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <Calculator className="w-4 h-4 text-amber-700" /> {isHindi ? 'ज़कात कैलकुलेटर (2.5%)' : 'Zakat Calculator (2.5%)'}
              </button>
            )}
            <Link
              href="/admin"
              onClick={() => {
                onNavigateToAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" /> {t('nav.adminPortal', 'Open Admin Portal')} (/admin)
            </Link>
            <button
              onClick={() => {
                onOpenMembershipCard();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-emerald-600" /> {t('nav.myCard', 'View ID Card')} ({currentUser.name})
            </button>
            <button
              onClick={() => {
                onOpenRegister();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> {t('nav.join', 'Become Member (₹50)')}
            </button>
            <button
              onClick={() => {
                onOpenDonate();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
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
                <LogOut className="w-4 h-4 text-white" /> Logout Account
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
                  <LogIn className="w-4 h-4 text-emerald-400" /> Login
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

