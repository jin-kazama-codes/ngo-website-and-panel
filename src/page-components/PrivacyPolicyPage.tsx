'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPolicyPage: React.FC = () => {
  const router = useRouter();
  const { language, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in text-slate-800">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> {t('btn.back', 'Back')}
      </button>

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {language === 'hi' ? 'गोपनीयता नीति' : language === 'ur' ? 'پرائیویسی پالیسی' : 'Privacy Policy'}
        </h1>
        <p className="text-sm text-slate-500">
          {language === 'hi' ? 'अंतिम अपडेट:' : language === 'ur' ? 'آخری اپڈیٹ:' : 'Last Updated:'} {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '1. परिचय' : language === 'ur' ? '1. تعارف' : '1. Introduction'}
          </h2>
          <p>
            {language === 'hi'
              ? 'MFCT कम्युनिटी फाउंडेशन में आपका स्वागत है। हम आपकी गोपनीयता का सम्मान करते हैं और आपके व्यक्तिगत डेटा की सुरक्षा के लिए पूरी तरह प्रतिबद्ध हैं।'
              : language === 'ur'
                ? 'ایم ایف سی ٹی فاؤنڈیشن میں آپ کا خیرمقدم ہے۔ ہم آپ کی پرائیویسی کا مکمل احترام کرتے ہیں اور آپ کے ڈیٹا کے تحفظ کے پابند ہیں۔'
                : 'Welcome to the MFCT Community Foundation. We respect your privacy and are committed to protecting your personal data.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '2. हम जो जानकारी एकत्र करते हैं' : language === 'ur' ? '2. جمع کی جانے والی معلومات' : '2. Information We Collect'}
          </h2>
          <p>
            {language === 'hi'
              ? 'हम आपका नाम, ईमेल, फोन नंबर और आयकर नियमों के तहत 80G कर छूट रसीद जारी करने के लिए पैन विवरण एकत्र कर सकते हैं।'
              : language === 'ur'
                ? 'ہم رجسٹریشن اور 80G ٹیکس چھوٹ رسید جاری کرنے کے لیے نام، فون، ای میل اور پین نمبر جیسی بنیادی معلومات حاصل کرتے ہیں۔'
                : 'We may collect your name, phone number, email address, and PAN details as required under Indian income tax regulations for 80G tax receipt issuance.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '3. आपकी जानकारी का उपयोग' : language === 'ur' ? '3. معلومات کا استعمال' : '3. How We Use Information'}
          </h2>
          <p>
            {language === 'hi'
              ? 'एकत्र की गई जानकारी का उपयोग सख्ती से निम्न के लिए किया जाता है:'
              : language === 'ur'
                ? 'معلومات کا استعمال درج ذیل مقاصد کے لیے کیا جاتا ہے:'
                : 'Information collected is strictly used for:'}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {language === 'hi'
                ? 'आपके दान को संसाधित करना और 80G कर छूट रसीदें जारी करना।'
                : language === 'ur'
                  ? 'عطیات کی تصدیق اور 80G رسید کا اجرا۔'
                  : 'Processing your donations and issuing 80G tax exemption receipts.'}
            </li>
            <li>
              {language === 'hi'
                ? 'अभियानों और पारदर्शिता रिपोर्ट पर अपडेट प्रदान करना।'
                : language === 'ur'
                  ? 'فلاحی مہمات اور آڈٹ رپورٹس کی معلومات۔'
                  : 'Providing updates on verified campaigns and transparency reports.'}
            </li>
            <li>
              {language === 'hi'
                ? 'सामुदायिक सदस्यता और आपातकालीन सहायता पात्रता का सत्यापन।'
                : language === 'ur'
                  ? 'ممبرشپ اور ہنگامی امداد کی تصدیق۔'
                  : 'Verifying community membership and emergency solidarity assistance eligibility.'}
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '4. डेटा सुरक्षा' : language === 'ur' ? '4. ڈیٹا کا تحفظ' : '4. Data Security'}
          </h2>
          <p>
            {language === 'hi'
              ? 'हम आपके व्यक्तिगत विवरणों को अनधिकृत पहुंच या प्रकटीकरण से बचाने के लिए सख्त सुरक्षा उपाय लागू करते हैं। हम आपका डेटा तीसरे पक्ष को नहीं बेचते हैं।'
              : language === 'ur'
                ? 'ہم ڈیٹا کی حفاظت اور رازداری کے جدید ترین سیکیورٹی معیارات پر عمل کرتے ہیں اور معلومات کو کسی تیسرے فریق کو فروخت نہیں کرتے۔'
                : 'We implement industry-standard security safeguards to protect your personal details against unauthorized access. We never sell your personal information.'}
          </p>
        </section>
      </div>
    </div>
  );
};
