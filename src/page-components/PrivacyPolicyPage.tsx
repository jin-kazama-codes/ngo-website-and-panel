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
        <ArrowLeft className="w-4 h-4" /> {isHindi ? 'वापस' : 'Back'}
      </button>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">{isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}</h1>
        <p className="text-sm text-slate-500">{isHindi ? 'अंतिम अपडेट:' : 'Last updated:'} {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '1. परिचय' : '1. Introduction'}</h2>
          <p>
            {isHindi ? 'MFCT कम्युनिटी फाउंडेशन ("हम", "हमारा", "हमें") में आपका स्वागत है। हम आपकी गोपनीयता का सम्मान करते हैं और सूचना प्रौद्योगिकी अधिनियम, 2000 और भारत के सूचना प्रौद्योगिकी (उचित सुरक्षा प्रथाओं और प्रक्रियाओं और संवेदनशील व्यक्तिगत डेटा या सूचना) नियम, 2011 के अनुपालन में आपके व्यक्तिगत डेटा की सुरक्षा के लिए प्रतिबद्ध हैं।' : 'Welcome to MFCT Community Foundation ("we", "our", "us"). We respect your privacy and are committed to protecting your personal data in compliance with the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '2. हम जो जानकारी एकत्र करते हैं' : '2. Information We Collect'}</h2>
          <p>
            {isHindi ? 'हम आपकी व्यक्तिगत जानकारी जैसे आपका नाम, ईमेल पता, फोन नंबर, पता और भुगतान/लेनदेन विवरण (जैसे पैन/आधार) एकत्र कर सकते हैं जब आप सदस्य के रूप में पंजीकरण करते हैं, दान करते हैं, या हमारे सामुदायिक हब में भाग लेते हैं। आयकर नियमों के अनुसार 80G कर छूट प्रमाण पत्र जारी करने के लिए पैन की जानकारी अनिवार्य है।' : 'We may collect personal information such as your name, email address, phone number, address, and payment/transaction details (like PAN/Aadhaar) when you register as a member, make a donation, or participate in our community hubs. PAN information is mandatory for issuing 80G tax exemption certificates as per Income Tax rules.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '3. आपकी जानकारी का उपयोग' : '3. Use of Your Information'}</h2>
          <p>
            {isHindi ? 'एकत्र की गई जानकारी का उपयोग सख्ती से निम्न के लिए किया जाता है:' : 'The information collected is strictly used for:'}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{isHindi ? 'आपके दान को संसाधित करना और 80G कर छूट रसीदें जारी करना।' : 'Processing your donations and issuing 80G tax exemption receipts.'}</li>
            <li>{isHindi ? 'अभियानों, सामुदायिक हब और पारदर्शिता रिपोर्ट पर अपडेट प्रदान करना।' : 'Providing updates on campaigns, community hubs, and transparency reports.'}</li>
            <li>{isHindi ? 'सामुदायिक सदस्यता और आपातकालीन सहायता पात्रता के लिए अपनी पहचान सत्यापित करना।' : 'Verifying your identity for community membership and emergency aid eligibility.'}</li>
            <li>{isHindi ? 'वैधानिक कानूनों और ऑडिट का अनुपालन।' : 'Complying with statutory laws and audits.'}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '4. डेटा साझाकरण और संरक्षण' : '4. Data Sharing and Protection'}</h2>
          <p>
            {isHindi ? 'हम तीसरे पक्ष को आपकी व्यक्तिगत जानकारी बेचते, किराए पर या लीज़ पर नहीं देते हैं। हम कानूनी और कर अनुपालन उद्देश्यों के लिए आपके डेटा को विश्वसनीय भुगतान गेटवे या सरकारी अधिकारियों के साथ साझा कर सकते हैं। हम अनधिकृत पहुंच से आपके डेटा की सुरक्षा के लिए उचित सुरक्षा प्रथाओं को नियोजित करते हैं।' : 'We do not sell, rent, or lease your personal information to third parties. We may share your data with trusted payment gateways or government authorities for legal and tax compliance purposes. We employ reasonable security practices to protect your data against unauthorized access.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '5. शिकायत अधिकारी' : '5. Grievance Officer'}</h2>
          <p>
            {isHindi ? 'सूचना प्रौद्योगिकी अधिनियम 2000 और उसके तहत बनाए गए नियमों के अनुसार, शिकायत अधिकारी का नाम और संपर्क विवरण नीचे दिया गया है:' : 'In accordance with Information Technology Act 2000 and rules made there under, the name and contact details of the Grievance Officer are provided below:'}
          </p>
          <p className="font-semibold text-slate-800">
            Email: grievance@mfct.org <br />
            Phone: +91 1800 200 MFCT (6328)
          </p>
        </section>
      </div>
    </div>
  );
};
