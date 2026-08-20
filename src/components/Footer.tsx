'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, QrCode, Phone, Mail, MapPin, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onPageChange: (page: string) => void;
  onOpenDonate: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onPageChange, onOpenDonate, onNavigateToAdmin }) => {
  const { isHindi } = useLanguage();
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
                <span className="font-extrabold text-2xl tracking-tight text-white">MFCT</span>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isHindi ? 'सामुदायिक मंच' : 'Community Platform'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {isHindi ? 'MFCT भारत का प्रमुख पारदर्शी, समावेशी, धर्म-तटस्थ सामुदायिक धन उगाहने वाला मंच है। प्रत्येक सदस्य दूसरों का समर्थन करने और सत्यापित सामुदायिक सहायता प्राप्त करने के लिए मात्र ₹50 शुल्क के साथ जुड़ता है।' : 'MFCT is India’s premier transparent, inclusive, religion-neutral community fundraising platform. Every member joins with a nominal ₹50 fee to both support others and receive verified community aid.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> {isHindi ? 'धारा 8 पंजीकृत एनजीओ | 80G कर छूट प्रमाणित' : 'Section 8 Registered NGO | 80G Tax Exemption Certified'}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{isHindi ? 'त्वरित नेविगेशन' : 'Quick Navigation'}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <Link
                  href="/admin"
                  className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>{isHindi ? 'व्यवस्थापक और सदस्य पोर्टल (/admin)' : 'Admin & Member Portal (/admin)'}</span>
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'होम अवलोकन' : 'Home Overview'}
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'सत्यापित अभियान' : 'Verified Campaigns'}
                </Link>
              </li>
              <li>
                <Link href="/communities" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'स्थानीय समुदाय' : 'Local Communities'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'पारदर्शिता मॉडल' : 'Transparency Model'}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'राहत गैलरी' : 'Relief Gallery'}
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'सफलता की कहानियाँ' : 'Success Stories'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories & Causes */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{isHindi ? 'सहायता श्रेणियाँ' : 'Support Categories'}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>{isHindi ? 'चिकित्सा और आपातकालीन संचालन' : 'Medical & Emergency Operations'}</li>
              <li>{isHindi ? 'उच्च शिक्षा और अनाथ लड़कियां' : 'Higher Education & Orphan Girls'}</li>
              <li>{isHindi ? 'गरिमापूर्ण विवाह सहायता' : 'Dignified Marriage Aid'}</li>
              <li>{isHindi ? 'ज़कात पात्र सत्यापित कारण' : 'Zakat Eligible Verified Causes'}</li>
              <li>{isHindi ? 'सदका और सामान्य राहत' : 'Sadakah & General Relief'}</li>
              <li>{isHindi ? 'विकलांगता और विधवा कल्याण' : 'Disability & Widow Welfare'}</li>
            </ul>
          </div>

          {/* Col 4: App Download & Newsletter */}
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{isHindi ? 'मोबाइल ऐप और क्यूआर' : 'Mobile App & QR'}</h4>
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shrink-0">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-white">{isHindi ? 'MFCT ऐप के लिए स्कैन करें' : 'Scan for MFCT App'}</p>
                <p className="text-slate-400 text-[10px]">{isHindi ? 'Android और iOS त्वरित डाउनलोड' : 'Android & iOS Instant Download'}</p>
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

        <div className="py-6 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Phone className="w-4 h-4" /> {isHindi ? 'हेल्पलाइन: +91 1800 200 MFCT (6328)' : 'Helpline: +91 1800 200 MFCT (6328)'}
            </span>
            <span className="flex items-center gap-1.5">
              {/* <Mail className="w-4 h-4 text-slate-500" /> help@mfct.org */}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" /> {isHindi ? 'बरेली उत्तर प्रदेश भारत' : 'Bareilly Uttar Pradesh India'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <Link href="/privacy" className="hover:text-slate-300 cursor-pointer">{isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}</Link>
            <Link href="/terms" className="hover:text-slate-300 cursor-pointer">{isHindi ? 'सेवा की शर्तें' : 'Terms of Service'}</Link>
            <Link href="/refund" className="hover:text-slate-300 cursor-pointer">{isHindi ? 'रिफंड और ऑडिट नीति' : 'Refund & Audit Policy'}</Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>{isHindi ? '© 2026 MFCT कम्युनिटी फाउंडेशन। सर्वाधिकार सुरक्षित।' : '© 2026 MFCT Community Foundation. All Rights Reserved.'}</p>
          <p className="mt-2 sm:mt-0">{isHindi ? 'भारतीय समुदाय सशक्तिकरण और 100% पारदर्शिता के लिए डिज़ाइन किया गया।' : 'Designed for Indian Community Empowerment & 100% Transparency.'}</p>
        </div>
      </div>
    </footer>
  );
};
