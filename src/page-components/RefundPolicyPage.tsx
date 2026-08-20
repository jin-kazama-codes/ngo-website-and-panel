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
        <ArrowLeft className="w-4 h-4" /> {isHindi ? 'वापस' : 'Back'}
      </button>

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">{isHindi ? 'रिफंड और ऑडिट नीति' : 'Refund & Audit Policy'}</h1>
        <p className="text-sm text-slate-500">{isHindi ? 'अंतिम अपडेट:' : 'Last updated:'} {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '1. दान वापसी नीति' : '1. Donation Refund Policy'}</h2>
          <p>
            {isHindi ? 'भारत में एक पंजीकृत गैर-लाभकारी संगठन के रूप में, MFCT कम्युनिटी फाउंडेशन उम्मीद करता है कि सभी दाता दान करते समय उचित देखभाल और परिश्रम का प्रयोग करेंगे। आम तौर पर, दान वापस नहीं किया जाता है क्योंकि उन्हें तुरंत सक्रिय अभियानों या सामुदायिक एस्क्रो को आवंटित किया जाता है।' : 'As a registered non-profit organization in India, MFCT Community Foundation expects all donors to exercise due care and diligence while making donations. Generally, donations are non-refundable since they are immediately allocated to active campaigns or the community escrow.'}
          </p>
          <p
            dangerouslySetInnerHTML={{
              __html: isHindi ? 'हालाँकि, हम मानते हैं कि त्रुटियाँ हो सकती हैं। यदि कोई गलत दान किया जाता है (उदा. डुप्लिकेट प्रसंस्करण या गलत राशि), तो दाता लेनदेन के <strong>7 दिनों</strong> के भीतर धनवापसी का अनुरोध कर सकता है।' : 'However, we recognize that errors can happen. If an erroneous donation is made (e.g., duplicate processing or wrong amount), the donor may request a refund within <strong>7 days</strong> of the transaction.'
            }}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '2. धनवापसी अनुरोध प्रक्रिया' : '2. Refund Request Process'}</h2>
          <p
            dangerouslySetInnerHTML={{
              __html: isHindi ? 'धनवापसी का अनुरोध करने के लिए, कृपया निम्नलिखित विवरणों के साथ <strong>refunds@mfct.org</strong> पर लिखें:' : 'To request a refund, please write to <strong>refunds@mfct.org</strong> with the following details:'
            }}
          />
          <ul className="list-disc pl-5 space-y-1">
            <li>{isHindi ? 'दान की तिथि' : 'Date of donation'}</li>
            <li>{isHindi ? 'दान की राशि' : 'Donation amount'}</li>
            <li>{isHindi ? 'लेनदेन आईडी / यूटीआर नंबर' : 'Transaction ID / UTR number'}</li>
            <li>{isHindi ? 'धनवापसी अनुरोध का कारण' : 'Reason for refund request'}</li>
          </ul>
          <p>
            {isHindi ? 'यदि दान के लिए धारा 80G कर रसीद पहले ही जारी की जा चुकी है, तो धनवापसी अनुरोध अस्वीकार किया जा सकता है या रसीद अमान्य कर दी जाएगी।' : 'If a Section 80G tax receipt has already been issued for the donation, the refund request may be declined or the receipt will be invalidated.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '3. ऑडिट और पारदर्शिता नीति' : '3. Audit & Transparency Policy'}</h2>
          <p>
            {isHindi ? 'MFCT कम्युनिटी फाउंडेशन सामुदायिक धन की तैनाती में 100% पारदर्शिता के लिए प्रतिबद्ध है। हमारी ऑडिट नीति के हिस्से के रूप में:' : 'MFCT Community Foundation is committed to 100% transparency in the deployment of community funds. As part of our audit policy:'}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{isHindi ? 'सभी खातों का वार्षिक रूप से एक स्वतंत्र चार्टर्ड एकाउंटेंट (सीए) द्वारा ऑडिट किया जाता है।' : 'All accounts are audited annually by an independent Chartered Accountant (CA).'}</li>
            <li>{isHindi ? 'वार्षिक ऑडिट रिपोर्ट हमारे मंच पर प्रकाशित की जाती हैं और सभी पंजीकृत सदस्यों के लिए सुलभ हैं।' : 'Annual audit reports are published on our platform and accessible to all registered members.'}</li>
            <li>{isHindi ? 'सभी अभियानों में पारदर्शी "जुटाई गई धनराशि बनाम लक्ष्य" मेट्रिक्स सार्वजनिक रूप से दिखाई देते हैं।' : 'All campaigns have transparent "Funds Raised vs. Target" metrics visible publicly.'}</li>
            <li>{isHindi ? 'जहाँ भी संभव हो, धन सीधे सत्यापित लाभार्थियों या विक्रेताओं को वितरित किया जाता है।' : 'Funds are disbursed directly to verified beneficiaries or vendors wherever possible.'}</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
