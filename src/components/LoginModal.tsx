'use client';

import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { X, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authenticateUser } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';

interface LoginModalProps {
  onClose: () => void;
  onLoginRole: (role: UserRole, email?: string, userObj?: User) => void;
  currentRole: UserRole;
  onOpenRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginRole, currentRole, onOpenRegister }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthenticating(true);

    try {
      if (!phone || !password) {
        setAuthError(tr('मोबाइल नंबर और पासवर्ड आवश्यक हैं।', 'موبائل نمبر اور پاس ورڈ درکار ہے۔', 'Phone number and password are required.'));
        setAuthenticating(false);
        return;
      }

      const result = await authenticateUser(phone, password);
      if (result.success && result.user) {
        setLoggedInUser(result.user);
        onLoginRole(result.user.role, result.user.email || result.user.phone, result.user);
        setLoggedIn(true);
        setTimeout(() => onClose(), 1200);
      } else {
        setAuthError(result.error || tr('लॉगिन विफल रहा। कृपया विवरण जांचें।', 'لاگ ان ناکام رہا۔ تفصیلات چیک کریں۔', 'Authentication failed. Please check your credentials.'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setAuthError(tr('लॉगिन के दौरान त्रुटि हुई। पुनः प्रयास करें।', 'لاگ ان کے دوران خرابی پیش آئی۔ دوبارہ کوشش کریں۔', 'An error occurred during login. Please try again.'));
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl shadow-emerald-900/20 relative overflow-hidden border border-white/20">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/80 to-transparent -z-10" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-60 -z-10" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 bg-white/50 hover:bg-slate-100 rounded-full backdrop-blur-sm transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {tr('वापसी पर स्वागत है', 'خوش آمدید', 'Welcome Back')}
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {tr('अपने MFCT सेवा-संगम खाते में लॉगिन करें', 'اپنے MFCT سیوا سنگم اکاؤنٹ میں لاگ ان کریں', 'Log in to your MFCT account')}
          </p>
        </div>

        {loggedIn ? (
          <div className="text-center py-8 space-y-4 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {tr('सफलतापूर्वक लॉगिन हो गए!', 'کامیابی کے ساتھ لاگ ان ہو گئے!', 'Successfully Logged In!')}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              {tr('डैशबोर्ड पर रीडायरेक्ट किया जा रहा है...', 'ڈیش بورڈ پر ری ڈائریکٹ کیا جا رہا ہے...', 'Redirecting to your dashboard...')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {authError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium flex items-center gap-2">
                  <span className="shrink-0 text-rose-500">⚠️</span> {authError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 ml-1">
                  {tr('मोबाइल नंबर', 'موبائل نمبر', 'Phone Number')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={tr('अपना मोबाइल नंबर दर्ज करें', 'اپنا موبائل نمبر درج کریں', 'Enter your phone number')}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 ml-1">
                  {tr('पासवर्ड', 'پاس ورڈ', 'Password')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={tr('अपना पासवर्ड दर्ज करें', 'اپنا پاس ورڈ درج کریں', 'Enter your password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authenticating}
                className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-70 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {authenticating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{tr('साइन इन करें', 'سائن ان کریں', 'Sign In')}</span>
                    <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
                  </>
                )}
              </button>

              {onOpenRegister && (
                <div className="mt-5 text-center">
                  <p className="text-sm text-slate-500 font-medium">
                    {tr('खाता नहीं है?', 'اکاؤنٹ نہیں ہے؟', "Don't have an account?")}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRegister();
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors underline decoration-2 underline-offset-4"
                    >
                      {tr('कृपया सदस्य बनें / रजिस्टर करें', 'رجسٹر کریں', 'Please sign up')}
                    </button>
                  </p>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
