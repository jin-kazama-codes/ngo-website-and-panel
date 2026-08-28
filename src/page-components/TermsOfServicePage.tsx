'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

export const TermsOfServicePage: React.FC = () => {
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
          {language === 'hi' ? 'सेवा की शर्तें' : language === 'ur' ? 'شرائط و ضوابط' : 'Terms of Service'}
        </h1>
        <p className="text-sm text-slate-500">
          {language === 'hi' ? 'अंतिम अपडेट:' : language === 'ur' ? 'آخری اپڈیٹ:' : 'Last Updated:'} {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '1. शर्तों की स्वीकृति' : language === 'ur' ? '1. شرائط کی قبولیت' : '1. Acceptance of Terms'}
          </h2>
          <p>
            {language === 'hi'
              ? 'MFCT कम्युनिटी प्लेटफॉर्म का उपयोग करके, आप इन नियमों और शर्तों से कानूनी रूप से बंधे होने के लिए सहमत हैं।'
              : language === 'ur'
                ? 'ایم ایف سی ٹی پلیٹ فارم کا استعمال کرتے ہوئے آپ ان تمام شرائط و ضوابط کے پابند ہونے کا اقرار کرتے ہیں۔'
                : 'By accessing or using the MFCT Community Platform, you agree to be bound by these Terms of Service.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '2. पात्रता' : language === 'ur' ? '2. اہلیت' : '2. Eligibility'}
          </h2>
          <p>
            {language === 'hi'
              ? 'दानकर्ता और सदस्य भारत के लागू कानूनों के अनुसार कानूनी अनुबंध करने में सक्षम होने चाहिए।'
              : language === 'ur'
                ? 'صارفین اور ممبران کے پاس ہندوستانی قانون کے تحت قانونی معاہدے کی اہلیت ہونی چاہیے۔'
                : 'Donors and community members must have legal capacity to form binding agreements under Indian law.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '3. दान और 80G कर छूट' : language === 'ur' ? '3. عطیات اور 80G ٹیکس چھوٹ' : '3. Donations & 80G Tax Exemption'}
          </h2>
          <p>
            {language === 'hi'
              ? 'सभी सत्यापित दान सीधे पात्र लाभार्थियों या संबद्ध अस्पतालों को वितरित किए जाते हैं। 80G रसीदें वित्तीय वर्ष के अंत में दाखिल की जाती हैं।'
              : language === 'ur'
                ? 'تمام عطیات براہ راست مستحقین یا اسپتال کے اسکرو کھاتے میں منتقل کیے جاتے ہیں۔ 80G رسیدیں تصدیق کے بعد فوری جاری کی جاتی ہیں۔'
                : 'All donations are distributed directly to verified beneficiaries or escrow hospital accounts. Official 80G exemption certificates are generated upon verification.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '4. निषिद्ध आचरण' : language === 'ur' ? '4. ممنوعہ سرگرمیاں' : '4. Prohibited Conduct'}
          </h2>
          <p>
            {language === 'hi' ? 'उपयोगकर्ता सहमत हैं कि वे:' : language === 'ur' ? 'صارفین درج ذیل پر رضامند ہیں کہ وہ:' : 'Users agree that they shall not:'}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {language === 'hi'
                ? 'झूठे या भ्रामक केवाईसी दस्तावेज जमा नहीं करेंगे।'
                : language === 'ur'
                  ? 'کوئی غلط یا جعلی کے وائی سی دستاویزات جمع نہیں کروائیں گے۔'
                  : 'Submit fraudulent, forged, or misleading KYC documents.'}
            </li>
            <li>
              {language === 'hi'
                ? 'किसी भी धोखाधड़ी या गैरकानूनी गतिविधियों के लिए मंच का उपयोग नहीं करेंगे।'
                : language === 'ur'
                  ? 'پلیٹ فارم کو کسی غیر قانونی سرگرمی کے لیے استعمال نہیں کریں گے۔'
                  : 'Misuse the platform for unauthorized, fraudulent, or unlawful activities.'}
            </li>
            <li>
              {language === 'hi'
                ? 'सामुदायिक धन का दुरुपयोग या आपातकालीन सहायता आवश्यकताओं को गलत तरीके से प्रस्तुत नहीं करेंगे।'
                : language === 'ur'
                  ? 'فلاحی فنڈز کا غلط استعمال نہیں کریں گے۔'
                  : 'Misrepresent emergency medical or financial aid claims.'}
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '5. देयता की सीमा' : language === 'ur' ? '5. دائرہ اختیار' : '5. Limitation of Liability'}
          </h2>
          <p>
            {language === 'hi'
              ? 'MFCT पूरी पारदर्शिता सुनिश्चित करता है लेकिन अस्पताल के उपचार के परिणामों या तीसरे पक्ष की तकनीकी त्रुटियों के लिए उत्तरदायी नहीं है।'
              : language === 'ur'
                ? 'ایم ایف سی ٹی مکمل شفافیت کو یقینی بناتا ہے لیکن اسپتال کے طبی نتائج کا ذمہ دار نہیں ہے۔'
                : 'MFCT provides a transparent giving platform with thorough field verification but is not liable for medical treatment outcomes or third-party service delays.'}
          </p>
        </section>
      </div>
    </div>
  );
};
