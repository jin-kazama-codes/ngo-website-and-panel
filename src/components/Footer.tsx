'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, MapPin, ShieldCheck, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onPageChange: (page: string) => void;
  onOpenDonate: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { isHindi } = useLanguage();

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
                  {isHindi ? 'सामुदायिक मंच' : 'کمیونٹی پلیٹ فارم'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {isHindi
                ? 'MFCT भारत का प्रमुख पारदर्शी, समावेशी सामुदायिक धन उगाहने वाला मंच है। प्रत्येक सदस्य दूसरों का समर्थन करने और सत्यापित सामुदायिक सहायता प्राप्त करने के लिए मात्र ₹50 शुल्क के साथ जुड़ता है।'
                : 'ایم ایف سی ٹی ہندوستان کا اولین شفاف اور براہ راست فلاحی نیٹ ورک ہے۔ ہر ممبر دوسروں کی مدد کرنے اور ایمرجنسی میں امداد حاصل کرنے کے لیے صرف ₹50 فیس کے ساتھ شامل ہوتا ہے۔'}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> {isHindi ? 'धारा 8 पंजीकृत एनजीओ | 80G कर छूट प्रमाणित' : 'سیکشن 8 رجسٹرڈ این جی او | 80G ٹیکس چھوٹ تصدیق شدہ'}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{isHindi ? 'त्वरित नेविगेशन' : 'فوری لنکس'}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <Link
                  href="/admin"
                  className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>{isHindi ? 'व्यवस्थापक और सदस्य पोर्टल (/admin)' : 'ایڈمن اور ممبر پورٹل (/admin)'}</span>
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'होम मुख्य पृष्ठ' : 'مرکزی صفحہ'}
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'सत्यापित अभियान' : 'تصدیق شدہ مہمات'}
                </Link>
              </li>
              <li>
                <Link href="/communities" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'स्थानीय समुदाय' : 'مقامی کمیونٹیز'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'पारदर्शिता मॉडल' : 'ہمارے بارے میں'}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'राहत गैलरी' : 'تصویری گیلری'}
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-emerald-400 transition-colors">
                  {isHindi ? 'सफलता की कहानियाँ' : 'اثرات کی کہانیاں'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories & Causes */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{isHindi ? 'सहायता श्रेणियाँ' : 'امدادی شعبے'}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>{isHindi ? 'चिकित्सा और आपातकालीन सहायता' : 'طبی اور ہنگامی سرجری امداد'}</li>
              <li>{isHindi ? 'उच्च शिक्षा और अनाथ बच्चे' : 'اعلیٰ تعلیم اور یتیم طلباء'}</li>
              <li>{isHindi ? 'गरिमापूर्ण विवाह सहायता' : 'باعزت نکاح و شادی امداد'}</li>
              <li>{isHindi ? 'ज़कात पात्र सत्यापित कारण' : 'شرعی زکوٰۃ مستحقین'}</li>
              <li>{isHindi ? 'सदका और सामान्य राहत' : 'صدقہ اور عمومی امداد'}</li>
              <li>{isHindi ? 'जनाज़ा और क़ब्रिस्तान सेवा' : 'جنازہ، کفن اور میت ایمبولینس'}</li>
            </ul>
          </div>

          {/* Col 4: App Download & QR */}
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{isHindi ? 'मोबाइल ऐप और क्यूआर' : 'موبائل ایپ اور کیو آر'}</h4>
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shrink-0">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-white">{isHindi ? 'MFCT ऐप के लिए स्कैन करें' : 'ایپ ڈاؤن لوڈ کے لیے اسکین کریں'}</p>
                <p className="text-slate-400 text-[10px]">{isHindi ? 'Android और iOS त्वरित डाउनलोड' : 'اینڈرائیڈ اور آئی او ایس ایپ'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-6 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Phone className="w-4 h-4" /> {isHindi ? 'हेल्पलाइन: +91 1800 200 MFCT (6328)' : 'ہیلپ لائن: +91 1800 200 6328'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" /> {isHindi ? 'बरेली उत्तर प्रदेश भारत' : 'بریلی، اتر پردیش، ہندوستان'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <Link href="/privacy" className="hover:text-slate-300 cursor-pointer">{isHindi ? 'गोपनीयता नीति' : 'پرائیویسی پالیسی'}</Link>
            <Link href="/terms" className="hover:text-slate-300 cursor-pointer">{isHindi ? 'सेवा की शर्तें' : 'شرائط و ضوابط'}</Link>
            <Link href="/refund" className="hover:text-slate-300 cursor-pointer">{isHindi ? 'रिफंड और ऑडिट नीति' : 'ریفنڈ اور آڈٹ پالیسی'}</Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>{isHindi ? '© 2026 MFCT कम्युनिटी फाउंडेशन। सर्वाधिकार सुरक्षित।' : '© 2026 MFCT کمیونٹی فاؤنڈیشن۔ جملہ حقوق محفوظ ہیں۔'}</p>
          <p className="mt-2 sm:mt-0">{isHindi ? '100% पारदर्शिता और सामुदायिक सशक्तिकरण।' : '100% شفافیت اور کمیونٹی فلاح۔'}</p>
        </div>
      </div>
    </footer>
  );
};
