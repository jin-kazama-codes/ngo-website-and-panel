'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

export const RefundPolicyPage: React.FC = () => {
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
        <h1 className="text-3xl font-extrabold text-slate-900">{isHindi ? 'रिफंड और ऑडिट नीति' : 'ریفنڈ اور آڈٹ پالیسی'}</h1>
        <p className="text-sm text-slate-500">{isHindi ? 'अंतिम अपडेट:' : 'آخری اپڈیٹ:'} {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '1. दान वापसी नीति' : '1. عطیات کی واپسی کی پالیسی'}</h2>
          <p>
            {isHindi
              ? 'MFCT कम्युनिटी फाउंडेशन उम्मीद करता है कि सभी दाता दान करते समय उचित सावधानी बरतेंगे। आमतौर पर, दान वापस नहीं किया जाता है क्योंकि उन्हें तुरंत सक्रिय अभियानों में आवंटित किया जाता है।'
              : 'ایم ایف سی ٹی فاؤنڈیشن کو دیا گیا عطیہ عام طور پر ناقابل واپسی ہوتا ہے کیونکہ یہ فوری طور پر ہسپتالوں اور مستحقین کے علاج کے لیے مختص ہو جاتا ہے۔'}
          </p>
          <p
            dangerouslySetInnerHTML={{
              __html: isHindi
                ? 'यदि कोई गलत दान (उदा. डुप्लिकेट लेनदेन) किया जाता है, तो दाता <strong>7 दिनों</strong> के भीतर धनवापसी का अनुरोध कर सकता है।'
                : 'اگر غلطی سے رقم منتقل ہو جائے تو صارف <strong>7 دنوں</strong> کے اندر واپسی کی درخواست دے سکتا ہے۔'
            }}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '2. धनवापसी अनुरोध प्रक्रिया' : '2. ریفنڈ کا طریقہ کار'}</h2>
          <p
            dangerouslySetInnerHTML={{
              __html: isHindi
                ? 'धनवापसी का अनुरोध करने के लिए, कृपया <strong>refunds@mfct.org</strong> पर विवरण भेजें:'
                : 'ریفنڈ کے لیے <strong>refunds@mfct.org</strong> پر تفصیلات ارسال کریں:'
            }}
          />
          <ul className="list-disc pl-5 space-y-1">
            <li>{isHindi ? 'दान की तिथि' : 'عطیہ کی تاریخ'}</li>
            <li>{isHindi ? 'दान की राशि' : 'عطیہ کی رقم'}</li>
            <li>{isHindi ? 'लेनदेन आईडी / यूटीआर नंबर' : 'ٹرانزیکشن / یو ٹی آر نمبر'}</li>
            <li>{isHindi ? 'धनवापसी अनुरोध का कारण' : 'واپسی کی وجہ'}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '3. ऑडिट और पारदर्शिता नीति' : '3. آڈٹ اور شفافیت'}</h2>
          <p>
            {isHindi
              ? 'MFCT कम्युनिटी फाउंडेशन 100% पारदर्शिता के लिए प्रतिबद्ध है। सभी खातों का स्वतंत्र सीए द्वारा वार्षिक ऑडिट किया जाता है।'
              : 'ایم ایف سی ٹی فاؤنڈیشن تمام فنڈز کے خرچ کی 100% شفافیت فراہم کرتی ہے اور ہر سال چارٹرڈ اکاؤنٹنٹ سے آڈٹ کرایا جاتا ہے۔'}
          </p>
        </section>
      </div>
    </div>
  );
};
