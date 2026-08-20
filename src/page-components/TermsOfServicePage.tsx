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
        <ArrowLeft className="w-4 h-4" /> {isHindi ? 'वापस' : 'Back'}
      </button>

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">{isHindi ? 'सेवा की शर्तें' : 'Terms of Service'}</h1>
        <p className="text-sm text-slate-500">{isHindi ? 'अंतिम अपडेट:' : 'Last updated:'} {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '1. शर्तों की स्वीकृति' : '1. Acceptance of Terms'}</h2>
          <p>
            {isHindi ? 'MFCT कम्युनिटी फाउंडेशन प्लेटफॉर्म तक पहुँचने और उसका उपयोग करने से, आप इन सेवा की शर्तों से बाध्य होने के लिए सहमत हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारी सेवाओं का उपयोग न करें।' : 'By accessing and using the MFCT Community Foundation platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '2. पात्रता' : '2. Eligibility'}</h2>
          <p>
            {isHindi ? 'सदस्य बनने या दान करने के लिए, आपको भारतीय अनुबंध अधिनियम, 1872 के तहत एक बाध्यकारी अनुबंध में प्रवेश करने के लिए कानूनी रूप से सक्षम होना चाहिए। नाबालिगों से दान की निगरानी माता-पिता या कानूनी अभिभावक द्वारा की जानी चाहिए।' : 'To become a member or make a donation, you must be legally capable of entering into a binding contract under the Indian Contract Act, 1872. Donations from minors must be supervised by a parent or legal guardian.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '3. दान और 80G कर छूट' : '3. Donations & 80G Tax Exemption'}</h2>
          <p>
            {isHindi ? 'MFCT कम्युनिटी फाउंडेशन को दिए गए सभी दान आयकर अधिनियम, 1961 की धारा 80G के तहत कर कटौती के पात्र हैं। इस कटौती का दावा करने के लिए दाताओं को अपने वैध पैन कार्ड का विवरण देना होगा। धन की सफल प्राप्ति पर रसीदें स्वचालित रूप से जारी की जाएंगी।' : 'All donations made to MFCT Community Foundation are eligible for tax deduction under Section 80G of the Income Tax Act, 1961. Donors must provide their valid PAN card details to claim this deduction. Receipts will be issued automatically upon successful realization of funds.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '4. निषिद्ध आचरण' : '4. Prohibited Conduct'}</h2>
          <p>
            {isHindi ? 'उपयोगकर्ता सहमत हैं कि वे:' : 'Users agree not to:'}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{isHindi ? 'झूठे या भ्रामक केवाईसी दस्तावेज जमा नहीं करेंगे।' : 'Submit false or misleading KYC documents.'}</li>
            <li>{isHindi ? 'किसी भी धोखाधड़ी या गैरकानूनी गतिविधियों के लिए मंच का उपयोग नहीं करेंगे।' : 'Use the platform for any fraudulent or unlawful activities.'}</li>
            <li>{isHindi ? 'सामुदायिक धन का दुरुपयोग या आपातकालीन सहायता आवश्यकताओं को गलत तरीके से प्रस्तुत नहीं करेंगे।' : 'Misuse community funds or misrepresent emergency aid requirements.'}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? '5. देयता की सीमा और अधिकार क्षेत्र' : '5. Limitation of Liability and Jurisdiction'}</h2>
          <p>
            {isHindi ? 'MFCT कम्युनिटी फाउंडेशन आपके मंच के उपयोग से उत्पन्न होने वाले किसी भी प्रत्यक्ष, अप्रत्यक्ष, आकस्मिक या परिणामी नुकसान के लिए उत्तरदायी नहीं होगा। ये शर्तें भारत के कानूनों द्वारा शासित हैं, और कोई भी विवाद नई दिल्ली में अदालतों के अनन्य अधिकार क्षेत्र के अधीन होगा।' : 'MFCT Community Foundation shall not be liable for any direct, indirect, incidental, or consequential damages arising out of your use of the platform. These terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi.'}
          </p>
        </section>
      </div>
    </div>
  );
};
