'use client';

import React from 'react';
import { ShieldCheck, Users, Award } from 'lucide-react';
import { MembershipBanner } from '../components/MembershipBanner';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { isHindi } = useLanguage();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in text-slate-800">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          {isHindi ? 'हमारा विज़न और पारदर्शिता मॉडल' : 'ہمارا وژن اور شفافیت کا ماڈل'}
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
          {isHindi ? 'पूरे भारत में सामुदायिक एकजुटता की नई शुरुआत' : 'پورے ہندوستان میں کمیونٹی یکجہتی کا نیا فلاحی نظام'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {isHindi
            ? 'MFCT की स्थापना एक सरल मानवीय विश्वास पर की गई थी: हर स्थानीय पड़ोस आत्मनिर्भर बन सकता है जब सदस्य एक पारदर्शी ढांचे के तहत एकजुट हों।'
            : 'ایم ایف سی ٹی کی بنیاد ایک سادہ انسانی نظریے پر رکھی گئی ہے: ہر محلہ خود کفیل بن سکتا ہے جب تمام افراد ایک شفاف فلاحی نظام کے تحت متحد ہوں۔'}
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">{isHindi ? '100% एस्क्रो पारदर्शिता' : '100% براہ راست ادائیگی کی شفافیت'}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isHindi
              ? 'दान कभी भी असत्यापित व्यक्तिगत बैंक खातों में स्थानांतरित नहीं किया जाता है। सभी धन सीधे अस्पतालों, चिकित्सा आपूर्तिकर्ताओं, या विक्रेताओं के खातों में भुगतान किया जाता है।'
              : 'عطیات غیر تصدیق شدہ کھاتوں میں نہیں بھیجے جاتے۔ تمام فنڈز براہ راست ہسپتالوں، میڈیکل سپلائرز اور مستحقین تک پہنچائے جاتے ہیں۔'}
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">{isHindi ? 'आपसी सदस्य लाभ' : 'باہمی ممبرشپ کے فوائد'}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isHindi
              ? 'एक छोटा ₹50 सदस्यता शुल्क सदस्यों को दोहरी स्थिति प्रदान करता है: वापस देने का अवसर और व्यक्तिगत आपात स्थिति के दौरान गारंटीकृत प्राथमिकता सहायता।'
              : 'صرف ₹50 کی سالانہ رکنیت فلاحی کاموں میں حصہ لینے کے ساتھ ساتھ ذاتی ایمرجنسی میں فوری ترجیحی امداد کی ضمانت دیتی ہے۔'}
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">{isHindi ? 'ज़कात और 80G कर छूट' : 'شرعی زکوٰۃ اور 80G ٹیکس چھوٹ'}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isHindi
              ? 'सख्त सिस्टम नियम सुनिश्चित करते हैं कि ज़कात केवल पात्र लाभार्थियों तक पहुँचे, जबकि सभी योगदानकर्ताओं को तत्काल 80G कर लाभ रसीदें प्राप्त हों।'
              : 'سخت اصولوں کے تحت زکوٰۃ صرف شرعی مستحقین تک پہنچائی جاتی ہے اور تمام عطیہ دہندگان کو فوری 80G ٹیکس چھوٹ کی رسید ملتی ہے۔'}
          </p>
        </div>
      </div>

      <MembershipBanner />
    </div>
  );
};
