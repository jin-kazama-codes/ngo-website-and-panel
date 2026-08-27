import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

export const RefundPolicyPage: React.FC = () => {
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
          {language === 'hi' ? 'रिफंड और ऑडिट नीति' : language === 'ur' ? 'ریفنڈ اور آڈٹ پالیسی' : 'Refund & Audit Policy'}
        </h1>
        <p className="text-sm text-slate-500">
          {language === 'hi' ? 'अंतिम अपडेट:' : language === 'ur' ? 'آخری اپڈیٹ:' : 'Last Updated:'} {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '1. दान वापसी नीति' : language === 'ur' ? '1. عطیات کی واپسی کی پالیسی' : '1. Donation Refund Policy'}
          </h2>
          <p>
            {language === 'hi'
              ? 'चूंकि दान तुरंत आपातकालीन सहायता और अस्पताल के भुगतानों के लिए आवंटित किए जाते हैं, इसलिए दान आम तौर पर गैर-वापसी योग्य होते हैं। हालांकि, यदि कोई डुप्लिकेट या अनपेक्षित लेनदेन होता है, तो 7 दिनों के भीतर पूर्ण रिफंड का अनुरोध किया जा सकता है।'
              : language === 'ur'
                ? 'چونکہ تمام عطیات براہ راست ہنگامی امداد اور اسپتال کے واجبات میں لگائے جاتے ہیں اس لیے عام طور پر عطیات ناقابل واپسی ہوتے ہیں۔ تاہم کسی تکنیکی غلطی یا ڈپلیکیٹ ادائیگی پر 7 دنوں کے اندر ریفنڈ کی درخواست دی جا سکتی ہے۔'
                : 'Because donations are deployed directly for critical medical emergencies and relief, donations are generally non-refundable once disbursed. However, duplicate or unauthorized transactions may be refunded if reported within 7 business days.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '2. धनवापसी अनुरोध प्रक्रिया' : language === 'ur' ? '2. ریفنڈ کا طریقہ کار' : '2. Refund Request Process'}
          </h2>
          <p>
            {language === 'hi'
              ? 'रिफंड अनुरोध दर्ज करने के लिए कृपया support@mfct.org पर निम्नलिखित विवरणों के साथ ईमेल करें:'
              : language === 'ur'
                ? 'ریفنڈ کے لیے درج ذیل تفصیلات کے ساتھ support@mfct.org پر رابطہ کریں:'
                : 'To initiate a refund review, please email support@mfct.org with:'}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{language === 'hi' ? 'दान की तिथि' : language === 'ur' ? 'عطیہ کی تاریخ' : 'Date of donation'}</li>
            <li>{language === 'hi' ? 'दान की राशि' : language === 'ur' ? 'عطیہ کی رقم' : 'Amount donated (INR)'}</li>
            <li>{language === 'hi' ? 'लेनदेन आईडी / यूटीआर नंबर' : language === 'ur' ? 'ٹرانزیکشن / یو ٹی آر نمبر' : 'Transaction UTR / Reference ID'}</li>
            <li>{language === 'hi' ? 'धनवापसी अनुरोध का कारण' : language === 'ur' ? 'واپسی کی وجہ' : 'Reason for the refund request'}</li>
          </ul>
          <p>
            {isHindi ? 'यदि दान के लिए धारा 80G कर रसीद पहले ही जारी की जा चुकी है, तो धनवापसी अनुरोध अस्वीकार किया जा सकता है या रसीद अमान्य कर दी जाएगी।' : 'If a Section 80G tax receipt has already been issued for the donation, the refund request may be declined or the receipt will be invalidated.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'hi' ? '3. ऑडिट और पारदर्शिता नीति' : language === 'ur' ? '3. آڈٹ اور شفافیت' : '3. Audit & Transparency Standards'}
          </h2>
          <p>
            {language === 'hi'
              ? 'MFCT हर वित्तीय तिमाही में चार्टर्ड अकाउंटेंट्स द्वारा स्वतंत्र ऑडिट प्रकाशित करता है और सभी व्ययों का 100% सार्वजनिक ब्योरा बनाए रखता है।'
              : language === 'ur'
                ? 'ایم ایف سی ٹی ہر مالی سہ ماہی میں چارٹرڈ اکاؤنٹنٹس کے ذریعے آڈٹ شائع کرتا ہے اور تمام اخراجات کا 100 فیصد عوامی ریکارڈ رکھتا ہے۔'
                : 'MFCT conducts independent quarterly audits with certified Chartered Accountants to ensure 100% transparent fund utilization across all city chapters.'}
          </p>
        </section>
      </div>
    </div>
  );
};
