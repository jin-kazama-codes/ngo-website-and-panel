'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPolicyPage: React.FC = () => {
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
        <h1 className="text-3xl font-extrabold text-slate-900">{isHindi ? 'गोपनीयता नीति' : 'پرائیویسی پالیسی'}</h1>
        <p className="text-sm text-slate-500">{isHindi ? 'अंतिम अपडेट:' : 'آخری اپڈیٹ:'} {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '1. परिचय' : '1. تعارف'}</h2>
          <p>
            {isHindi
              ? 'MFCT कम्युनिटी फाउंडेशन में आपका स्वागत है। हम आपकी गोपनीयता का सम्मान करते हैं और आपके व्यक्तिगत डेटा की सुरक्षा के लिए पूरी तरह प्रतिबद्ध हैं।'
              : 'ایم ایف سی ٹی فاؤنڈیشن میں آپ کا خیرمقدم ہے۔ ہم آپ کی پرائیویسی کا مکمل احترام کرتے ہیں اور آپ کے ڈیٹا کے تحفظ کے پابند ہیں۔'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '2. हम जो जानकारी एकत्र करते हैं' : '2. جمع کی جانے والی معلومات'}</h2>
          <p>
            {isHindi
              ? 'हम आपका नाम, ईमेल, फोन नंबर और आयकर नियमों के तहत 80G कर छूट रसीद जारी करने के लिए पैन विवरण एकत्र कर सकते हैं।'
              : 'ہم رجسٹریشن اور 80G ٹیکس چھوٹ رسید جاری کرنے کے لیے نام، فون، ای میل اور پین نمبر جیسی بنیادی معلومات حاصل کرتے ہیں۔'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '3. आपकी जानकारी का उपयोग' : '3. معلومات کا استعمال'}</h2>
          <p>
            {isHindi ? 'एकत्र की गई जानकारी का उपयोग सख्ती से निम्न के लिए किया जाता है:' : 'معلومات کا استعمال درج ذیل مقاصد کے لیے کیا جاتا ہے:'}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{isHindi ? 'आपके दान को संसाधित करना और 80G कर छूट रसीदें जारी करना।' : 'عطیات کی تصدیق اور 80G رسید کا اجرا۔'}</li>
            <li>{isHindi ? 'अभियानों और पारदर्शिता रिपोर्ट पर अपडेट प्रदान करना।' : 'فلاحی مہمات اور آڈٹ رپورٹس کی معلومات۔'}</li>
            <li>{isHindi ? 'सामुदायिक सदस्यता और आपातकालीन सहायता पात्रता का सत्यापन।' : 'ممبرشپ اور ہنگامی امداد کی تصدیق۔'}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '4. डेटा सुरक्षा' : '4. ڈیٹا کا تحفظ'}</h2>
          <p>
            {isHindi
              ? 'हम तीसरे पक्ष को आपकी व्यक्तिगत जानकारी कभी नहीं बेचते हैं।'
              : 'ہم آپ کی ذاتی معلومات کسی تیسرے فریق کو فروخت یا شیئر نہیں کرتے۔'}
          </p>
        </section>
      </div>
    </div>
  );
};
