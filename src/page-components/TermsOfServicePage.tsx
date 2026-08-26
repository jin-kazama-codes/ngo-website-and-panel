'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

export const TermsOfServicePage: React.FC = () => {
  const router = useRouter();
  const { isHindi } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in text-slate-800">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {isHindi ? 'वापस' : 'واپس'}
      </button>

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">{isHindi ? 'सेवा की शर्तें' : 'شرائط و ضوابط'}</h1>
        <p className="text-sm text-slate-500">{isHindi ? 'अंतिम अपडेट:' : 'آخری اپڈیٹ:'} {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '1. शर्तों की स्वीकृति' : '1. شرائط کی قبولیت'}</h2>
          <p>
            {isHindi
              ? 'MFCT कम्युनिटी फाउंडेशन प्लेटफॉर्म तक पहुँचने और उसका उपयोग करने से, आप इन सेवा की शर्तों से बाध्य होने के लिए सहमत हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारी सेवाओं का उपयोग न करें।'
              : 'ایم ایف سی ٹی پلیٹ فارم کا استعمال کر کے آپ ان تمام شرائط و ضوابط کے پابند ہونے پر رضامندی ظاہر کرتے ہیں۔'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '2. पात्रता' : '2. اہلیت'}</h2>
          <p>
            {isHindi
              ? 'सदस्य बनने या दान करने के लिए, आपको भारतीय अनुबंध अधिनियम, 1872 के तहत एक बाध्यकारी अनुबंध में प्रवेश करने के लिए कानूनी रूप से सक्षम होना चाहिए।'
              : 'ممبر بننے یا عطیہ دینے کے لیے قانونی طور پر اہل ہونا لازمی ہے۔'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '3. दान और 80G कर छूट' : '3. عطیات اور 80G ٹیکس چھوٹ'}</h2>
          <p>
            {isHindi
              ? 'MFCT कम्युनिटी फाउंडेशन को दिए गए सभी दान आयकर अधिनियम, 1961 की धारा 80G के तहत कर कटौती के पात्र हैं। इस कटौती का दावा करने के लिए दाताओं को अपने वैध पैन कार्ड का विवरण देना होगा।'
              : 'ایم ایف سی ٹی کو دیے گئے تمام عطیات انکم ٹیکس ایکٹ کے سیکشن 80G کے تحت ٹیکس چھوٹ کے اہل ہیں۔ اس کے لیے درست پین کارڈ فراہم کرنا ضروری ہے۔'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '4. निषिद्ध आचरण' : '4. ممنوعہ سرگرمیاں'}</h2>
          <p>
            {isHindi ? 'उपयोगकर्ता सहमत हैं कि वे:' : 'صارفین درج ذیل پر رضامند ہیں کہ وہ:'}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{isHindi ? 'झूठे या भ्रामक केवाईसी दस्तावेज जमा नहीं करेंगे।' : 'کوئی غلط یا جعلی کے وائی سی دستاویزات جمع نہیں کروائیں گے۔'}</li>
            <li>{isHindi ? 'किसी भी धोखाधड़ी या गैरकानूनी गतिविधियों के लिए मंच का उपयोग नहीं करेंगे।' : 'پلیٹ فارم کو کسی غیر قانونی سرگرمی کے لیے استعمال نہیں کریں گے۔'}</li>
            <li>{isHindi ? 'सामुदायिक धन का दुरुपयोग या आपातकालीन सहायता आवश्यकताओं को गलत तरीके से प्रस्तुत नहीं करेंगे।' : 'فلاحی فنڈز کا غلط استعمال نہیں کریں گے۔'}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '5. देयता की सीमा' : '5. دائرہ اختیار'}</h2>
          <p>
            {isHindi
              ? 'ये शर्तें भारत के कानूनों द्वारा शासित हैं, और कोई भी विवाद संबंधित अधिकार क्षेत्र के अधीन होगा।'
              : 'تمام شرائط ہندوستانی قوانین کے تابع ہیں اور تمام قانونی معاملات کا دائرہ اختیار عدالتوں کے ماتحت ہوگا۔'}
          </p>
        </section>
      </div>
    </div>
  );
};
