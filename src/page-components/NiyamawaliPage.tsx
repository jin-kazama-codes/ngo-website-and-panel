'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Heart,
  Clock,
  Banknote,
  FileCheck,
  AlertTriangle,
  Ban,
  Search,
  Printer,
  Share2,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  HelpCircle,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NiyamawaliPage: React.FC = () => {
  const { isHindi } = useLanguage();
  const [selectedScheme, setSelectedScheme] = useState<'all' | 'death' | 'nikah'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scheme 1: MFCT आकस्मिक निधन परिवार सहारा योजना (30 Rules)
  const deathSchemeRules = useMemo(() => [
    {
      num: 1,
      category: 'foundation',
      titleHi: 'योजना का नाम एवं उद्देश्य',
      titleEn: '1. Scheme Name & Core Objective',
      contentHi: (
        <div className="space-y-2">
          <p>इस योजना का नाम <strong>“MFCT आकस्मिक निधन परिवार सहारा योजना”</strong> होगा। यह योजना <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong> द्वारा सामाजिक, मानवीय एवं पारस्परिक सहयोग की भावना से संचालित की जाएगी।</p>
          <p>योजना का उद्देश्य ट्रस्ट के वैधानिक सदस्य के असामयिक निधन की स्थिति में उसके पात्र नॉमिनी/परिवार को सामूहिक सहयोग के माध्यम से आर्थिक सहारा उपलब्ध कराने का प्रयास करना है।</p>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>This scheme shall be officially named <strong>“MFCT Accidental Death Family Support Scheme” (MFCT आकस्मिक निधन परिवार सहारा योजना)</strong>, administered by <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong> with the spirit of social, humanitarian, and mutual solidarity.</p>
          <p>The primary objective of the scheme is to provide collective mutual financial solace and relief to the eligible nominee/family in the tragic event of an untimely demise of a verified member.</p>
        </div>
      ),
    },
    {
      num: 2,
      category: 'foundation',
      titleHi: 'सदस्यता एवं पात्रता',
      titleEn: '2. Membership & Eligibility',
      contentHi: (
        <div className="space-y-2">
          <p>योजना की सदस्यता ट्रस्ट द्वारा निर्धारित नियमों, पात्रता, पंजीकरण प्रक्रिया एवं आवश्यक दस्तावेजों के आधार पर प्रदान की जाएगी।</p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900">
            ⚠️ सदस्यता प्राप्त कर लेने मात्र से किसी निश्चित आर्थिक सहायता की गारंटी नहीं होगी।
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>Scheme membership is granted strictly on the basis of prescribed regulations, eligibility verification, registration procedures, and validated documentation.</p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900">
            ⚠️ Merely obtaining membership does NOT constitute a commercial guarantee of any fixed monetary aid.
          </div>
        </div>
      ),
    },
    {
      num: 3,
      category: 'foundation',
      titleHi: 'सदस्यता की आयु सीमा',
      titleEn: '3. Membership Age Bracket & Tenure',
      contentHi: (
        <div className="space-y-2">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>वर्तमान व्यवस्था के अनुसार सदस्यता प्राप्त करने की <strong>न्यूनतम आयु 18 वर्ष तथा अधिकतम आयु 60 वर्ष</strong> होगी।</li>
            <li>एक बार वैधानिक सदस्य बनने के बाद सदस्यता <strong>अधिकतम 65 वर्ष की आयु</strong> तक बनाए रखने की अनुमति होगी।</li>
            <li><strong>65 वर्ष की आयु पूर्ण होते ही</strong> सदस्यता स्वतः समाप्त मानी जाएगी।</li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Under current regulations, the <strong>minimum enrollment age is 18 years and maximum is 60 years</strong>.</li>
            <li>Once registered as a verified member, membership can be retained up to a <strong>maximum age of 65 years</strong>.</li>
            <li>Upon reaching <strong>65 years of age</strong>, membership ceases automatically.</li>
          </ul>
        </div>
      ),
    },
    {
      num: 4,
      category: 'support',
      titleHi: 'वार्षिक ₹100 सहयोग',
      titleEn: '4. Annual ₹100 Administrative Support',
      contentHi: (
        <div className="space-y-2">
          <p>वैधानिक सदस्यता बनाए रखने के लिए प्रत्येक सदस्य द्वारा ट्रस्ट को <strong>₹100 वार्षिक सहयोग</strong> देना आवश्यक होगा।</p>
          <p className="text-xs text-slate-600">यह राशि ट्रस्ट के सामाजिक, प्रशासनिक, तकनीकी एवं मानवीय उद्देश्यों के लिए निर्धारित नियमों के अनुसार उपयोग की जाएगी।</p>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>To maintain active and verified membership, every member is required to contribute an <strong>annual administrative support of ₹100</strong> to the Trust.</p>
          <p className="text-xs text-slate-600">This fund is utilized strictly for social, administrative, cloud-tech, and humanitarian operational objectives as governed by bylaws.</p>
        </div>
      ),
    },
    {
      num: 5,
      category: 'support',
      titleHi: 'वार्षिक सहयोग जमा करने की अतिरिक्त अवधि (45 दिन)',
      titleEn: '5. 45-Day Grace Period for Annual Support',
      contentHi: (
        <div className="space-y-2">
          <p>वार्षिक ₹100 सहयोग जमा करने के लिए निर्धारित वार्षिक अवधि समाप्त होने के बाद <strong>45 दिन की अतिरिक्त अवधि (Grace Period)</strong> दी जाएगी।</p>
          <p>सदस्य को सहयोग जमा करके निर्धारित माध्यम से ट्रांजेक्शन विवरण/रसीद अपलोड करनी होगी।</p>
          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs font-semibold text-rose-800">
            निर्धारित अवधि में सहयोग जमा न करने पर सदस्यता समाप्त की जा सकती है तथा संबंधित योजनाओं में अपात्र किया जा सकता है।
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>A <strong>45-day grace period</strong> is granted following the conclusion of the yearly tenure to deposit the annual ₹100 contribution.</p>
          <p>Members must upload the verified transaction receipt/UTR reference through the official portal.</p>
          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs font-semibold text-rose-800">
            Failure to contribute within the grace period may lead to membership termination and ineligibility for scheme benefits.
          </div>
        </div>
      ),
    },
    {
      num: 6,
      category: 'organization',
      titleHi: 'आधिकारिक सूचना माध्यम',
      titleEn: '6. Official Communication Channels',
      contentHi: (
        <p>सदस्यों को ट्रस्ट के आधिकारिक <strong>WhatsApp Group, Telegram Group, वेबसाइट</strong> अथवा अन्य अधिकृत सूचना माध्यमों से जुड़े रहना आवश्यक होगा।</p>
      ),
      contentEn: (
        <p>Members must remain connected with the Trust's official <strong>WhatsApp Groups, Telegram Channel, Official Website</strong>, or other designated communication portals.</p>
      ),
    },
    {
      num: 7,
      category: 'support',
      titleHi: 'सदस्य के निधन पर आर्थिक सहयोग',
      titleEn: '7. Solidarity Appeal Upon Demise',
      contentHi: (
        <p>किसी वैधानिक सदस्य के आकस्मिक/असामयिक निधन की स्थिति में पात्रता एवं दस्तावेजों की जांच के बाद ट्रस्ट द्वारा पात्र सदस्यों से निर्धारित आर्थिक सहयोग का आधिकारिक आह्वान किया जा सकता है।</p>
      ),
      contentEn: (
        <p>Upon the untimely demise of an active verified member, following thorough audit of eligibility and documents, the Trust issues an official collective solidarity appeal to all verified members.</p>
      ),
    },
    {
      num: 8,
      category: 'support',
      titleHi: 'वर्तमान न्यूनतम सहयोग राशि (₹100)',
      titleEn: '8. Current Minimum Contribution (₹100)',
      contentHi: (
        <div className="space-y-2">
          <p>वर्तमान व्यवस्था के अनुसार पात्र दिवंगत सदस्य के मामले में प्रत्येक पात्र सदस्य द्वारा <strong>न्यूनतम ₹100</strong> आर्थिक सहयोग किया जाएगा।</p>
          <p className="text-xs text-slate-600">सदस्य संख्या एवं उपलब्ध संसाधनों के अनुसार सहयोग राशि को घटाने या बढ़ाने का अधिकार सक्षम/संस्थापक मंडल के पास सुरक्षित रहेगा।</p>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>Under the active framework, in the approved demise of a verified member, every verified active member contributes a <strong>minimum of ₹100</strong>.</p>
          <p className="text-xs text-slate-600">The Trust Board reserves the right to modify the contribution quantum based on total active membership count and resource availability.</p>
        </div>
      ),
    },
    {
      num: 9,
      category: 'support',
      titleHi: 'लॉक-इन पीरियड (12 माह)',
      titleEn: '9. Mandatory Lock-in Period (12 Months)',
      contentHi: (
        <div className="space-y-2">
          <p>वर्तमान व्यवस्था के अनुसार सदस्यता लेने वाले सदस्यों के लिए <strong>12 माह (1 वर्ष) का लॉक-इन पीरियड</strong> रहेगा।</p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900">
            लॉक-इन अवधि पूरी होने से पहले सदस्य की मृत्यु होने पर सामान्यतः उसके नॉमिनी को योजना के अंतर्गत आर्थिक सहयोग के लिए पात्र नहीं माना जाएगा।
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>Under active rules, all newly registered members are subject to a <strong>mandatory 12-Month Lock-in Period</strong>.</p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900">
            If a member passes away prior to completing the 12-month lock-in tenure, the nominee shall generally not be eligible for scheme financial aid.
          </div>
        </div>
      ),
    },
    {
      num: 10,
      category: 'support',
      titleHi: 'लॉक-इन अवधि में सहयोग',
      titleEn: '10. Mandatory Contributions During Lock-in',
      contentHi: (
        <p>लॉक-इन अवधि के दौरान जारी सभी निर्धारित सहयोगों में भाग लेना आवश्यक होगा। सहयोग न करने पर सदस्य की वैधानिकता एवं भविष्य की पात्रता प्रभावित हो सकती है।</p>
      ),
      contentEn: (
        <p>Active participation in all collective solidarity appeals issued during the lock-in period is mandatory. Non-participation impacts member standing and future eligibility.</p>
      ),
    },
    {
      num: 11,
      category: 'support',
      titleHi: '90% सहयोग की अनिवार्यता',
      titleEn: '11. Mandatory 90% Contribution Rate',
      contentHi: (
        <div className="space-y-2">
          <p>लॉक-इन अवधि पूर्ण होने के बाद सदस्य को निर्धारित सहयोगों में <strong>कम से कम 90% सहयोग</strong> करना आवश्यक होगा।</p>
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold">
            यदि सदस्यता से मृत्यु तक 2 वर्ष से अधिक समय हो चुका है, तो <strong>मृत्यु से पूर्व के 2 वर्षों में हुए निर्धारित सहयोगों में 90% सहयोग</strong> की पात्रता देखी जाएगी।
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>Upon completing the lock-in period, members must maintain a minimum <strong>90% participation track record</strong> across all official appeals.</p>
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold">
            If the membership tenure exceeds 2 years, eligibility requires <strong>at least 90% contribution compliance during the 2 years immediately preceding the demise</strong>.
          </div>
        </div>
      ),
    },
    {
      num: 12,
      category: 'verification',
      titleHi: 'सहयोग की गणना',
      titleEn: '12. Computation of Contribution Records',
      contentHi: (
        <p>सदस्य के सहयोग की गणना ट्रस्ट के उपलब्ध डिजिटल रिकॉर्ड के आधार पर की जाएगी। तकनीकी समस्या, बैंकिंग समस्या या अन्य वास्तविक परिस्थितियों के संबंध में उपलब्ध साक्ष्यों पर सक्षम मंडल विचार कर सकता है।</p>
      ),
      contentEn: (
        <p>Member contribution track records are verified through the Trust's central digital database. The Board reserves discretion to review genuine banking or technical discrepancies based on verifiable proof.</p>
      ),
    },
    {
      num: 13,
      category: 'verification',
      titleHi: 'नॉमिनी के खाते में सहयोग',
      titleEn: '13. Direct Transfer to Nominee Bank Account',
      contentHi: (
        <p>पात्रता एवं सत्यापन पूर्ण होने के बाद आर्थिक सहयोग दिवंगत सदस्य द्वारा दर्ज किए गए <strong>पात्र नॉमिनी के अधिकृत बैंक खाते</strong> में सीधे भेजने की व्यवस्था की जाएगी।</p>
      ),
      contentEn: (
        <p>Following audit and validation, mutual assistance funds are routed directly into the <strong>authorized bank account of the designated verified nominee</strong>.</p>
      ),
    },
    {
      num: 14,
      category: 'verification',
      titleHi: 'मृत्यु के बाद आवेदन (20 दिन)',
      titleEn: '14. Application Window Post-Demise (20 Days)',
      contentHi: (
        <div className="space-y-2">
          <p>आर्थिक सहयोग हेतु <strong>मृत्यु की तारीख के बाद 20 दिनों के अंदर</strong> ट्रस्ट के निर्धारित ऑनलाइन माध्यम से आवेदन करना आवश्यक होगा।</p>
          <p className="text-xs text-slate-600">विशेष परिस्थितियों में सक्षम मंडल कारण एवं उपलब्ध साक्ष्यों के आधार पर विचार कर सकता है।</p>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>Formal application for mutual relief must be lodged through the official online system <strong>within 20 days of the date of demise</strong>.</p>
          <p className="text-xs text-slate-600">Under extenuating circumstances, the Board may consider condonation of delay based on authentic documentary rationale.</p>
        </div>
      ),
    },
    {
      num: 15,
      category: 'verification',
      titleHi: 'मृत्यु प्रमाण-पत्र उपलब्ध न होने पर',
      titleEn: '15. Procedure When Death Certificate is Pending',
      contentHi: (
        <p>यदि निर्धारित अवधि में मृत्यु प्रमाण-पत्र जारी नहीं हुआ है, तो उपलब्ध वैध प्रमाण के आधार पर प्रारंभिक आवेदन किया जा सकता है। मृत्यु प्रमाण-पत्र जारी होने के बाद उसकी प्रति ट्रस्ट के अधिकृत माध्यम पर उपलब्ध कराना आवश्यक होगा।</p>
      ),
      contentEn: (
        <p>If the official Death Certificate has not been issued within the stipulated window, initial application can be submitted with interim proof (hospital/cremation/burial proof), with mandatory final certificate submission upon issuance.</p>
      ),
    },
    {
      num: 16,
      category: 'verification',
      titleHi: 'आत्महत्या की स्थिति',
      titleEn: '16. Suicide Cases Policy',
      contentHi: (
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-950 space-y-1 font-medium">
          <p><strong>🚫 आत्महत्या की स्थिति:</strong> यदि सदस्य की मृत्यु आत्महत्या के कारण हुई हो, तो इस योजना के अंतर्गत सामान्य आर्थिक सहयोग अपील <strong>नहीं</strong> की जाएगी।</p>
          <p className="text-xs text-slate-700">आत्महत्या के अतिरिक्त अन्य मृत्यु की परिस्थितियों में पात्रता एवं नियमों के अधीन सहयोग हेतु अपील की जा सकती है।</p>
        </div>
      ),
      contentEn: (
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-950 space-y-1 font-medium">
          <p><strong>🚫 Suicide Exclusion:</strong> In cases where member demise results from suicide, collective financial solidarity appeals are <strong>strictly barred</strong>.</p>
          <p className="text-xs text-slate-700">For all other genuine causes of demise, appeals are processed subject to standard verification bylaws.</p>
        </div>
      ),
    },
    {
      num: 17,
      category: 'verification',
      titleHi: 'नॉमिनी द्वारा सदस्य की हत्या',
      titleEn: '17. Demise Caused by Nominee',
      contentHi: (
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-950 space-y-1 font-medium">
          <p><strong>⚖️ कानूनी प्रावधान:</strong> यदि आधिकारिक/विश्वसनीय साक्ष्यों से यह सामने आता है कि दिवंगत सदस्य की हत्या उसके नॉमिनी द्वारा की गई है, तो ऐसे नॉमिनी को आर्थिक सहयोग नहीं दिया जाएगा।</p>
          <p className="text-xs text-slate-700">ऐसी स्थिति में अन्य पात्र परिजन के संबंध में सक्षम मंडल उपलब्ध साक्ष्यों के आधार पर निर्णय ले सकता है।</p>
        </div>
      ),
      contentEn: (
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-950 space-y-1 font-medium">
          <p><strong>⚖️ Legal Exclusion:</strong> If credible judicial/police records indicate that the member was murdered by their nominee, financial aid is strictly prohibited to such nominee.</p>
          <p className="text-xs text-slate-700">The Board may adjudicate aid for other innocent dependent family members based on judicial findings.</p>
        </div>
      ),
    },
    {
      num: 18,
      category: 'transparency',
      titleHi: 'गलती से अधिक राशि भेजे जाने पर',
      titleEn: '18. Inadvertent Excess Remittance',
      contentHi: (
        <p>यदि किसी सदस्य द्वारा गलती से निर्धारित राशि से अधिक धनराशि नॉमिनी के खाते में भेज दी जाती है, तो साक्ष्य प्रस्तुत होने पर अतिरिक्त राशि वापस कराने के लिए नॉमिनी से अनुरोध किया जाएगा। ट्रस्ट वापसी के लिए यथासंभव प्रयास करेगा, लेकिन इसकी पूर्ण गारंटी नहीं देगा।</p>
      ),
      contentEn: (
        <p>If a member inadvertently transfers excess funds to a nominee's account, the Trust will formally request the nominee to refund the excess upon submission of banking proof. The Trust facilitates recovery efforts but cannot provide absolute guarantee.</p>
      ),
    },
    {
      num: 19,
      category: 'support',
      titleHi: 'सहयोग न करने वाले सदस्य की पुनः वैधानिकता',
      titleEn: '19. Reinstatement of Lapsed Membership',
      contentHi: (
        <p>यदि कोई सदस्य निर्धारित सहयोग नहीं करता अथवा 90% सहयोग की पात्रता से बाहर हो जाता है, तो नियमों के अनुसार <strong>लगातार 12 माह सहयोग एवं 12 माह की अवधि पूर्ण करने के बाद</strong> पुनः वैधानिकता के लिए विचार किया जा सकता है।</p>
      ),
      contentEn: (
        <p>If a member defaults on required appeals or drops below the 90% participation threshold, reinstatement of full eligibility may be reviewed only after <strong>12 continuous months of uninterrupted active contributions and tenure</strong>.</p>
      ),
    },
    {
      num: 20,
      category: 'organization',
      titleHi: 'हेल्पलाइन एवं तकनीकी सहायता',
      titleEn: '20. Official Helpdesk & Technical Support',
      contentHi: (
        <p>ट्रस्ट द्वारा सदस्यों की सुविधा के लिए आधिकारिक हेल्पलाइन <strong>(+91 82180 17226)</strong> उपलब्ध कराई जाएगी। हेल्पलाइन से सदस्यता, आवेदन, दस्तावेज, भुगतान एवं तकनीकी सहायता प्राप्त की जा सकेगी।</p>
      ),
      contentEn: (
        <p>The Trust operates an official dedicated Helpdesk <strong>(+91 82180 17226)</strong>. Members can resolve queries concerning enrollment, claims, document uploads, payments, and digital support.</p>
      ),
    },
    {
      num: 21,
      category: 'verification',
      titleHi: 'सत्यापन एवं दस्तावेज',
      titleEn: '21. Verification & Document Auditing',
      contentHi: (
        <p>मृत्यु, सदस्यता, नॉमिनी, बैंक खाता, पहचान एवं अन्य आवश्यक दस्तावेजों की तस्दीक ट्रस्ट द्वारा की जा सकती है। गलत अथवा फर्जी जानकारी मिलने पर आवेदन अस्वीकार अथवा सदस्यता के संबंध में नियमानुसार निर्णय लिया जा सकता है।</p>
      ),
      contentEn: (
        <p>The Trust conducts thorough verification of death records, membership tenure, nominee credentials, bank KYC, and identity documents. Falsified submissions result in outright cancellation and membership termination.</p>
      ),
    },
    {
      num: 22,
      category: 'transparency',
      titleHi: 'आर्थिक सहयोग की प्रकृति',
      titleEn: '22. Nature of Solidarity Assistance',
      contentHi: (
        <div className="space-y-1.5">
          <p>यह आर्थिक सहयोग सामाजिक एवं मानवीय सहयोग होगा। सदस्यता मात्र से किसी निश्चित राशि का गारंटीकृत अधिकार उत्पन्न नहीं होगा।</p>
          <p className="text-xs text-slate-600">वास्तविक सहायता उपलब्ध निधि, पात्र मामलों, सत्यापन एवं लागू नियमों के अनुसार निर्धारित होगी।</p>
        </div>
      ),
      contentEn: (
        <div className="space-y-1.5">
          <p>All mutual assistance is purely voluntary social and humanitarian solidarity. Membership does not create an actionable legal claim or guaranteed financial return.</p>
          <p className="text-xs text-slate-600">Actual relief disbursed depends on active participation pool, verified cases, and operational bylaws.</p>
        </div>
      ),
    },
    {
      num: 23,
      category: 'transparency',
      titleHi: 'व्यक्तिगत खाते एवं निजी UPI का उपयोग निषिद्ध',
      titleEn: '23. Strict Prohibition on Personal UPI/Accounts',
      contentHi: (
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-950 font-semibold space-y-1">
          <p>❌ <strong>कड़ा प्रतिबंध:</strong> योजना के लिए धन संग्रह हेतु किसी पदाधिकारी अथवा सदस्य के निजी बैंक खाते, निजी UPI या निजी QR Code का उपयोग नहीं किया जाएगा।</p>
          <p className="text-xs text-slate-700 font-normal">सभी आधिकारिक भुगतान ट्रस्ट के अधिकृत माध्यम से ही किए जाएंगे।</p>
        </div>
      ),
      contentEn: (
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-950 font-semibold space-y-1">
          <p>❌ <strong>Strict Prohibition:</strong> No office bearer or member is permitted to solicit or collect Trust funds into personal bank accounts, private UPI IDs, or private QR codes.</p>
          <p className="text-xs text-slate-700 font-normal">All official contributions are routed strictly through institutional channels.</p>
        </div>
      ),
    },
    {
      num: 24,
      category: 'organization',
      titleHi: 'दुष्प्रचार एवं गलत सूचना',
      titleEn: '24. Misinformation & Defamation Clause',
      contentHi: (
        <p>यदि कोई सदस्य जानबूझकर ट्रस्ट के संबंध में गलत सूचना, अफवाह अथवा भ्रामक प्रचार करता है और पर्याप्त साक्ष्य उपलब्ध हैं, तो ट्रस्ट नियमों एवं लागू कानून के अनुसार कार्रवाई कर सकता है।</p>
      ),
      contentEn: (
        <p>If any individual knowingly spreads false rumors, disparaging remarks, or misleading propaganda against the Trust, statutory disciplinary and legal actions shall be initiated based on evidence.</p>
      ),
    },
    {
      num: 25,
      category: 'organization',
      titleHi: 'पदाधिकारियों के साथ अभद्र व्यवहार',
      titleEn: '25. Zero Tolerance for Indiscipline & Misbehavior',
      contentHi: (
        <p>यदि कोई सदस्य ट्रस्ट के पदाधिकारी, कर्मचारी अथवा अधिकृत प्रतिनिधि के साथ गंभीर अभद्र व्यवहार करता है या ट्रस्ट की गतिविधियों को नुकसान पहुंचाने वाली गतिविधि में संलिप्त पाया जाता है, तो पर्याप्त साक्ष्य के आधार पर उसकी सदस्यता समाप्त की जा सकती है।</p>
      ),
      contentEn: (
        <p>Zero tolerance is maintained against abuse, harassment, or defamatory conduct towards office bearers, volunteers, or staff. Proven misconduct results in immediate forfeiture of membership.</p>
      ),
    },
    {
      num: 26,
      category: 'transparency',
      titleHi: 'वार्षिक ₹100 सहयोग का उपयोग (A से O)',
      titleEn: '26. Detailed Utilization of Annual ₹100 Fund (A to O)',
      contentHi: (
        <div className="space-y-3">
          <p className="text-xs text-slate-700 font-semibold">वार्षिक ₹100 सहयोग का उपयोग ट्रस्ट के उद्देश्यों के अनुसार निम्न कार्यों में किया जा सकता है:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
            <div className="p-2.5 bg-[#f8faf9] rounded-xl border border-slate-200/80 space-y-1">
              <p><strong>A.</strong> वेबसाइट निर्माण एवं संचालन</p>
              <p><strong>B.</strong> ऐप निर्माण एवं संचालन</p>
              <p><strong>C.</strong> जिला एवं प्रदेश कार्यालय खर्च</p>
              <p><strong>D.</strong> हेल्पलाइन स्टाफ मानदेय व खर्च</p>
              <p><strong>E.</strong> परिवार का स्थलीय सत्यापन</p>
            </div>
            <div className="p-2.5 bg-[#f8faf9] rounded-xl border border-slate-200/80 space-y-1">
              <p><strong>F.</strong> प्रचार-प्रसार व सदस्यता अभियान</p>
              <p><strong>G.</strong> तकनीकी एवं डिजिटल व्यवस्था</p>
              <p><strong>H.</strong> जरूरतमंदों व छात्रों में सहयोग</p>
              <p><strong>I.</strong> ब्लॉक/जिला/प्रदेश कार्यशालाएं</p>
              <p><strong>J.</strong> कंबल एवं राहत वितरण</p>
            </div>
            <div className="p-2.5 bg-[#f8faf9] rounded-xl border border-slate-200/80 space-y-1">
              <p><strong>K.</strong> प्राकृतिक आपदा राहत</p>
              <p><strong>L.</strong> कार्यालय किराया व संचालन</p>
              <p><strong>M.</strong> अनाथ बच्चों की शिक्षा सहयोग</p>
              <p><strong>N.</strong> अंतिम संस्कार हेतु सहायता</p>
              <p><strong>O.</strong> अन्य सामाजिक व मानवीय कार्य</p>
            </div>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p className="text-xs text-slate-700 font-semibold">The annual ₹100 administrative support fund is strictly utilized across the following approved operational facets:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
            <div className="p-2.5 bg-[#f8faf9] rounded-xl border border-slate-200/80 space-y-1">
              <p><strong>A.</strong> Website Development & Cloud Hosting</p>
              <p><strong>B.</strong> Mobile App Maintenance & Security</p>
              <p><strong>C.</strong> District & State Office Running Costs</p>
              <p><strong>D.</strong> Helpdesk Staff Honorarium & Telecom</p>
              <p><strong>E.</strong> Physical Ground Verifications</p>
            </div>
            <div className="p-2.5 bg-[#f8faf9] rounded-xl border border-slate-200/80 space-y-1">
              <p><strong>F.</strong> Public Outreach & Membership Drives</p>
              <p><strong>G.</strong> Digital Server Infrastructure</p>
              <p><strong>H.</strong> Direct Needy Student & Patient Aid</p>
              <p><strong>I.</strong> District & State Level Workshops</p>
              <p><strong>J.</strong> Winter Blanket & Emergency Relief</p>
            </div>
            <div className="p-2.5 bg-[#f8faf9] rounded-xl border border-slate-200/80 space-y-1">
              <p><strong>K.</strong> Disaster Relief & Crisis Response</p>
              <p><strong>L.</strong> Office Rents & Administrative Utilities</p>
              <p><strong>M.</strong> Orphan Education Scholarships</p>
              <p><strong>N.</strong> Funeral & Final Rite Assistance</p>
              <p><strong>O.</strong> Other Humanitarian Welfare Works</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 27,
      category: 'transparency',
      titleHi: 'रिकॉर्ड एवं पारदर्शिता',
      titleEn: '27. Immutable Record Keeping & Transparency',
      contentHi: (
        <p>सदस्यता, वार्षिक सहयोग, मृत्यु संबंधी आवेदन, नॉमिनी, आर्थिक सहयोग, दस्तावेज एवं बैंक/भुगतान रिकॉर्ड पूर्णतः सुरक्षित और पारदर्शी रखा जाएगा।</p>
      ),
      contentEn: (
        <p>All records pertaining to membership rosters, annual contributions, bereavement claims, nominee assignments, digital UTR transactions, and bank statements are digitally maintained with strict transparency.</p>
      ),
    },
    {
      num: 28,
      category: 'verification',
      titleHi: 'पात्रता पर निर्णय',
      titleEn: '28. Board Adjudication on Eligibility',
      contentHi: (
        <p>लॉक-इन, 90% सहयोग, सदस्यता, मृत्यु, नॉमिनी एवं दस्तावेजों की समग्र जांच के बाद सक्षम/संस्थापक मंडल अंतिम निर्णय लेगा।</p>
      ),
      contentEn: (
        <p>Final adjudication on claims is rendered exclusively by the Competent Trust Board following rigorous audit of lock-in compliance, 90% participation ratios, identity verification, and authentic documentation.</p>
      ),
    },
    {
      num: 29,
      category: 'organization',
      titleHi: 'नियमों में संशोधन',
      titleEn: '29. Bylaw Amendment Procedures',
      contentHi: (
        <p>योजना के नियमों में आवश्यकता के अनुसार संशोधन किया जा सकता है। संशोधन Trust Deed, लागू कानून एवं ट्रस्ट की सक्षम संस्था की प्रक्रिया के अनुसार होगा।</p>
      ),
      contentEn: (
        <p>Regulations may be revised periodically in accordance with prevailing circumstances. All amendments remain subject to the registered Trust Deed and statutory regulations.</p>
      ),
    },
    {
      num: 30,
      category: 'foundation',
      titleHi: 'Trust Deed सर्वोपरि',
      titleEn: '30. Supremacy of Registered Trust Deed',
      contentHi: (
        <div className="p-3 bg-[#0a2e1d] text-white rounded-2xl border border-[#c8a84b] text-xs sm:text-sm font-semibold">
          ⚖️ इस नियमावली और Trust Deed अथवा लागू कानून के बीच किसी विरोधाभास की स्थिति में <strong>Trust Deed एवं लागू कानून प्रभावी होंगे</strong>।
        </div>
      ),
      contentEn: (
        <div className="p-3 bg-[#0a2e1d] text-white rounded-2xl border border-[#c8a84b] text-xs sm:text-sm font-semibold">
          ⚖️ In any event of conflict between these bylaws and the registered Trust Deed or prevailing statutory laws, the <strong>registered Trust Deed and Indian law shall prevail supreme</strong>.
        </div>
      ),
    },
  ], []);

  // Scheme 2: MFCT बेटी निकाह सहारा योजना (26 Rules)
  const nikahSchemeRules = useMemo(() => [
    {
      num: 1,
      category: 'foundation',
      titleHi: 'योजना का नाम',
      titleEn: '1. Scheme Name & Objective',
      contentHi: (
        <p>इस योजना का नाम <strong>“MFCT बेटी निकाह सहारा योजना”</strong> होगा। यह योजना <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong> द्वारा सामाजिक सहयोग एवं जरूरतमंद परिवारों की सहायता के उद्देश्य से संचालित की जाएगी।</p>
      ),
      contentEn: (
        <p>This initiative is officially named <strong>“MFCT Daughter Marriage Support Scheme” (MFCT बेटी निकाह सहारा योजना)</strong>, administered by <strong>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</strong> to extend mutual community solidarity to families during daughter marriages.</p>
      ),
    },
    {
      num: 2,
      category: 'support',
      titleHi: 'सदस्यता एवं Lock-in Period (Slabs)',
      titleEn: '2. Tiered Membership Lock-in Period',
      contentHi: (
        <div className="space-y-2">
          <p>सदस्यता की तिथि से सदस्य संख्या के आधार पर निम्न लॉक-इन अवधि लागू होगी:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold">
            <div className="p-3 bg-[#f8faf9] rounded-xl border border-emerald-300">
              <span className="text-emerald-800 block text-[11px]">सदस्य क्रमांक 1 से 1,000</span>
              <span className="text-base font-black text-slate-900 block mt-0.5">180 दिन</span>
              <span className="text-[10px] text-slate-500 font-normal">प्रारंभिक सदस्य</span>
            </div>
            <div className="p-3 bg-[#f8faf9] rounded-xl border border-amber-300">
              <span className="text-amber-800 block text-[11px]">सदस्य क्रमांक 1,001 से 10,000</span>
              <span className="text-base font-black text-slate-900 block mt-0.5">365 दिन (1 वर्ष)</span>
              <span className="text-[10px] text-slate-500 font-normal">द्वितीय चरण</span>
            </div>
            <div className="p-3 bg-[#f8faf9] rounded-xl border border-blue-300">
              <span className="text-blue-800 block text-[11px]">सदस्य क्रमांक 10,001 से आगे</span>
              <span className="text-base font-black text-slate-900 block mt-0.5">2 वर्ष (24 माह)</span>
              <span className="text-[10px] text-slate-500 font-normal">मानक चरण</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            💡 <strong>महत्वपूर्ण:</strong> सदस्यता के समय लागू लॉक-इन अवधि बाद में सदस्य संख्या बढ़ने पर भी नहीं बदलेगी।
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>The lock-in period applies based on the member registration sequence at enrollment:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold">
            <div className="p-3 bg-[#f8faf9] rounded-xl border border-emerald-300">
              <span className="text-emerald-800 block text-[11px]">Member No. 1 to 1,000</span>
              <span className="text-base font-black text-slate-900 block mt-0.5">180 Days</span>
              <span className="text-[10px] text-slate-500 font-normal">Early Phase</span>
            </div>
            <div className="p-3 bg-[#f8faf9] rounded-xl border border-amber-300">
              <span className="text-amber-800 block text-[11px]">Member No. 1,001 to 10,000</span>
              <span className="text-base font-black text-slate-900 block mt-0.5">365 Days (1 Yr)</span>
              <span className="text-[10px] text-slate-500 font-normal">Phase II</span>
            </div>
            <div className="p-3 bg-[#f8faf9] rounded-xl border border-blue-300">
              <span className="text-blue-800 block text-[11px]">Member No. 10,001 Onwards</span>
              <span className="text-base font-black text-slate-900 block mt-0.5">2 Years (24 Mo)</span>
              <span className="text-[10px] text-slate-500 font-normal">Standard Phase</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            💡 <strong>Grandfather Clause:</strong> The lock-in slab assigned at enrollment remains unchanged even if the total membership scales later.
          </p>
        </div>
      ),
    },
    {
      num: 3,
      category: 'support',
      titleHi: '90% तआवुन (सहयोग) की अनिवार्यता',
      titleEn: '3. Mandatory 90% Ta’awun Compliance',
      contentHi: (
        <p>सदस्यता की तिथि से बेटी के निकाह की तिथि तक निर्धारित सभी सहयोगों में <strong>कम से कम 90% तआवुन (सहयोग)</strong> करना आवश्यक होगा।</p>
      ),
      contentEn: (
        <p>Members must maintain at least <strong>90% active contribution (Ta'awun)</strong> across all official solidarity campaigns from their date of enrollment until the date of the daughter's wedding.</p>
      ),
    },
    {
      num: 4,
      category: 'support',
      titleHi: 'मरहूम सदस्य के परिवार में तआवुन',
      titleEn: '4. Mutual Aid for Bereaved Families',
      contentHi: (
        <p>किसी वैधानिक सदस्य के इंतकाल की स्थिति में योजना के नियमों के अनुसार उसके पात्र परिवार के लिए जारी सहयोग में अन्य पात्र सदस्यों द्वारा निर्धारित सहयोग करना आवश्यक होगा।</p>
      ),
      contentEn: (
        <p>Upon the demise of an active verified member, all verified members must contribute to the mutual assistance appeal issued for the bereaved family under scheme rules.</p>
      ),
    },
    {
      num: 5,
      category: 'verification',
      titleHi: 'बेटी निकाह सहारा की पात्रता',
      titleEn: '5. Daughter Marriage Aid Eligibility',
      contentHi: (
        <div className="space-y-1.5">
          <p>सदस्य की <strong>जैविक बेटी (Biological Daughter)</strong> के निकाह के लिए निर्धारित लॉक-इन पूरा होना तथा 90% सहयोग की शर्त पूरी होना आवश्यक होगा।</p>
          <p className="text-xs text-slate-600">सहायता की वास्तविक राशि उपलब्ध निधि, पात्रता, दस्तावेजों की तस्दीक एवं लागू नियमों के आधार पर निर्धारित होगी।</p>
        </div>
      ),
      contentEn: (
        <div className="space-y-1.5">
          <p>Assistance applies exclusively for the marriage of a member's <strong>biological daughter</strong>, subject to completion of the applicable lock-in period and 90% contribution compliance.</p>
          <p className="text-xs text-slate-600">Disbursed amount depends on collective voluntary pool, case audit, and operational bylaws.</p>
        </div>
      ),
    },
    {
      num: 6,
      category: 'verification',
      titleHi: 'अधिकतम दो बेटियों की पात्रता',
      titleEn: '6. Maximum Two Daughters Benefit Limit',
      contentHi: (
        <p>एक सदस्य की <strong>अधिकतम दो जैविक बेटियों (Max 2 Daughters)</strong> के निकाह के लिए पात्रता हो सकती है। प्रत्येक बेटी के मामले में निर्धारित शर्तों का पालन आवश्यक होगा।</p>
      ),
      contentEn: (
        <p>A verified member is eligible to apply for aid for a <strong>maximum of two biological daughters</strong> during their lifetime membership, subject to independent fulfillment of all criteria for each daughter.</p>
      ),
    },
    {
      num: 7,
      category: 'verification',
      titleHi: 'भाई के लिए विशेष पात्रता',
      titleEn: '7. Special Eligibility for Biological Brothers',
      contentHi: (
        <div className="space-y-2">
          <p>यदि कोई जैविक भाई अपनी बहन/बहनों अथवा बेटियों की जिम्मेदारी निभा रहा है, तो वह नियमों के अनुसार सदस्य बन सकता है।</p>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-semibold space-y-1">
            <p><strong>अधिकतम पात्रता सीमा:</strong></p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>2 बहनें, अथवा</li>
              <li>2 बेटियाँ, अथवा</li>
              <li>1 बहन + 1 बेटी।</li>
            </ul>
            <p className="text-[11px] text-slate-600 font-normal pt-1">संबंध का वैध प्रमाण (दस्तावेज) अनिवार्य होगा।</p>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p>If a biological brother is maintaining and supporting dependent sisters/daughters as head of household, he may register under special provisions.</p>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-semibold space-y-1">
            <p><strong>Maximum Benefit Cap:</strong></p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>2 Sisters, OR</li>
              <li>2 Daughters, OR</li>
              <li>1 Sister + 1 Daughter.</li>
            </ul>
            <p className="text-[11px] text-slate-600 font-normal pt-1">Valid proof of biological kinship is mandatory.</p>
          </div>
        </div>
      ),
    },
    {
      num: 8,
      category: 'verification',
      titleHi: 'माता-पिता के इंतकाल की स्थिति',
      titleEn: '8. Both Parents Deceased Provision',
      contentHi: (
        <p>यदि दोनों माता-पिता का इंतकाल हो चुका है और कोई वयस्क जैविक भाई बहन की जिम्मेदारी निभा रहा है, तो निर्धारित लॉक-इन एवं 90% सहयोग की शर्तों के अधीन पात्रता पर विचार किया जा सकता है।</p>
      ),
      contentEn: (
        <p>In tragic circumstances where both parents are deceased and an adult biological brother assumes guardianship of unmarried sisters, eligibility may be sanctioned under standard lock-in and 90% compliance rules.</p>
      ),
    },
    {
      num: 9,
      category: 'verification',
      titleHi: 'माता-पिता की आयु 60 वर्ष से अधिक',
      titleEn: '9. Parents Aged Above 60 Years Provision',
      contentHi: (
        <p>यदि दोनों माता-पिता की आयु 60 वर्ष से अधिक है और जैविक भाई परिवार की जिम्मेदारी निभा रहा है, तो निर्धारित शर्तों के अनुसार पात्रता पर विचार किया जा सकता है।</p>
      ),
      contentEn: (
        <p>Where both parents have crossed 60 years of age and the biological brother bears sole family responsibility, the scheme accommodates eligibility under standard verification bylaws.</p>
      ),
    },
    {
      num: 10,
      category: 'verification',
      titleHi: 'बेटी की सदस्यता',
      titleEn: '10. Daughter Enrollment Protocol',
      contentHi: (
        <div className="space-y-1.5">
          <p>जहाँ योजना के अनुसार आवश्यक हो, संबंधित बेटी की सदस्यता भी निर्धारित प्रक्रिया के अनुसार आवश्यक होगी।</p>
          <p className="text-xs text-slate-600">योजना का उद्देश्य बेटियों को योजना से जोड़ना तथा कानूनी विवाह योग्य आयु में ही निकाह को प्रोत्साहित करना है।</p>
        </div>
      ),
      contentEn: (
        <div className="space-y-1.5">
          <p>Where prescribed by bylaws, registration of the beneficiary daughter is required under standard onboarding protocols.</p>
          <p className="text-xs text-slate-600">The objective is empowering daughters and strictly encouraging weddings within legally permissible marriageable ages.</p>
        </div>
      ),
    },
    {
      num: 11,
      category: 'verification',
      titleHi: 'निकाह की आयु (कानूनी आयु)',
      titleEn: '11. Legal Age of Marriage Compliance',
      contentHi: (
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-950 font-semibold space-y-1">
          <p>⚖️ <strong>वैधानिक आयु अनिवार्यता:</strong> सहायता तभी विचारणीय होगी जब बेटी ने लागू कानून के अनुसार विवाह की वैधानिक आयु पूरी कर ली हो।</p>
          <p className="text-xs text-slate-700 font-normal">आयु प्रमाण (Aadhaar/10th Certificate/Birth Certificate) की गहन तस्दीक की जाएगी।</p>
        </div>
      ),
      contentEn: (
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-950 font-semibold space-y-1">
          <p>⚖️ <strong>Statutory Age Compliance:</strong> Applications are sanctioned ONLY if the bride has fulfilled the minimum statutory legal age of marriage under prevailing Indian law.</p>
          <p className="text-xs text-slate-700 font-normal">Rigorous verification of official age proof (Aadhaar/Birth Certificate) is mandatory.</p>
        </div>
      ),
    },
    {
      num: 12,
      category: 'verification',
      titleHi: 'पति-पत्नी दोनों सदस्य होने पर',
      titleEn: '12. Single Claim Policy for Spouses',
      contentHi: (
        <p>यदि पति और पत्नी दोनों सदस्य हैं, तो <strong>एक ही बेटी के निकाह के लिए दोनों में से केवल एक सदस्य</strong> आवेदन कर सकेगा। एक ही बेटी के लिए दोहरा लाभ नहीं दिया जाएगा।</p>
      ),
      contentEn: (
        <p>If both husband and wife are registered members, <strong>only one parent can claim assistance for a given daughter</strong>. Dual claims for the same wedding are strictly prohibited.</p>
      ),
    },
    {
      num: 13,
      category: 'support',
      titleHi: 'सदस्य के स्वयं के निकाह पर इमदाद',
      titleEn: '13. Self-Marriage Aid Policy',
      contentHi: (
        <p>सदस्य के <strong>अपने स्वयं के निकाह</strong> के लिए इस योजना के अंतर्गत सामान्यतः आर्थिक सहायता उपलब्ध नहीं होगी।</p>
      ),
      contentEn: (
        <p>Assistance under this scheme is strictly oriented towards daughters/sisters and is <strong>not applicable for a member's own wedding</strong>.</p>
      ),
    },
    {
      num: 14,
      category: 'support',
      titleHi: 'तआवुन की राशि (अधिकतम ₹50)',
      titleEn: '14. Maximum Contribution Quantum (₹50)',
      contentHi: (
        <div className="space-y-1.5">
          <p>प्रत्येक पात्र बेटी के निकाह के मामले में प्रत्येक पात्र सदस्य द्वारा वर्तमान व्यवस्था के अनुसार <strong>अधिकतम ₹50 तक</strong> निर्धारित आर्थिक सहयोग किया जा सकता है।</p>
          <p className="text-xs text-slate-600">सभी सहयोग ट्रस्ट के अधिकृत माध्यम से किए जाएंगे।</p>
        </div>
      ),
      contentEn: (
        <div className="space-y-1.5">
          <p>For each sanctioned daughter wedding appeal, every active verified member contributes a <strong>maximum of ₹50</strong> under active operational bylaws.</p>
          <p className="text-xs text-slate-600">All contributions must flow via verified Trust payment gateways.</p>
        </div>
      ),
    },
    {
      num: 15,
      category: 'verification',
      titleHi: 'निकाह से पहले आवेदन (कम से कम 30 दिन)',
      titleEn: '15. Prior Application Notice (Min 30 Days)',
      contentHi: (
        <p>निकाह की प्रस्तावित तिथि से <strong>कम से कम 30 दिन पहले</strong> आवेदन करना आवश्यक होगा। विशेष परिस्थितियों में सक्षम समिति विचार कर सकती है।</p>
      ),
      contentEn: (
        <p>Applications must be submitted at least <strong>30 days prior to the scheduled date of Nikah</strong> to permit field audit and campaign scheduling.</p>
      ),
    },
    {
      num: 16,
      category: 'verification',
      titleHi: 'आवश्यक दस्तावेज',
      titleEn: '16. Compulsory Documentation Checklist',
      contentHi: (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-semibold">आवश्यकतानुसार निम्न दस्तावेज प्रस्तुत करने होंगे:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">1. सदस्यता प्रमाण व KYC</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">2. सदस्य पहचान पत्र</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">3. बेटी का आयु व आधार</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">4. अभिभावक दस्तावेज</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">5. वैध संबंध प्रमाण</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">6. निकाहनामा / कार्ड</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">7. बैंक खाता पासबुक/चेक</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">8. ग्राउंड सत्यापन रिपोर्ट</span>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-semibold">Standard document verification audit checklist:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">1. Member KYC & ID</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">2. Member ID Proof</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">3. Bride Age & Aadhaar</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">4. Guardian Documents</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">5. Proof of Kinship</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">6. Wedding Card / Proof</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">7. Bank Passbook / KYC</span>
            <span className="p-2 bg-[#f8faf9] rounded-xl border border-slate-200">8. Ground Audit Report</span>
          </div>
        </div>
      ),
    },
    {
      num: 17,
      category: 'verification',
      titleHi: 'दस्तावेजों की तस्दीक',
      titleEn: '17. Multi-Tier Verification Audit',
      contentHi: (
        <p>ट्रस्ट द्वारा प्रस्तुत दस्तावेजों एवं जानकारी की तस्दीक की जाएगी। गलत, अधूरी अथवा फर्जी जानकारी मिलने पर आवेदन रोकने, अस्वीकार करने अथवा सदस्यता के संबंध में नियमानुसार निर्णय लिया जा सकता है।</p>
      ),
      contentEn: (
        <p>The Trust undertakes stringent physical and digital audits of all submissions. Incomplete, dubious, or forged records invite summary rejection and membership revocation.</p>
      ),
    },
    {
      num: 18,
      category: 'transparency',
      titleHi: 'इमदाद की प्रकृति',
      titleEn: '18. Humanitarian Nature of Imdaad',
      contentHi: (
        <p>इस योजना के अंतर्गत आर्थिक सहायता सामाजिक एवं मानवीय सहयोग के रूप में होगी। सदस्यता लेने मात्र से किसी निश्चित राशि की गारंटी नहीं होगी।</p>
      ),
      contentEn: (
        <p>Assistance under this scheme is voluntary mutual solidarity (Imdaad). Enrollment does not create any contractual guarantee or entitlement of fixed financial returns.</p>
      ),
    },
    {
      num: 19,
      category: 'support',
      titleHi: 'इमदाद प्राप्त करने के बाद सदस्य की जिम्मेदारी (10 वर्ष)',
      titleEn: '19. Post-Aid Member Commitment (10 Years 90% Support)',
      contentHi: (
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs sm:text-sm text-emerald-950 font-semibold space-y-1">
          <p>🤝 <strong>10 वर्ष निरंतर सहयोग संकल्प:</strong> बेटी के निकाह की सहायता प्राप्त करने के बाद सदस्य से अपेक्षा होगी कि वह <strong>कम से कम 10 वर्षों तक 90% सहयोग की व्यवस्था में भाग लेता रहे</strong>।</p>
          <p className="text-xs text-slate-700 font-normal">नियमित सहयोग न करने पर भविष्य की पात्रता एवं अन्य पारिवारिक योजनाओं की वैधानिकता प्रभावित हो सकती है।</p>
        </div>
      ),
      contentEn: (
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs sm:text-sm text-emerald-950 font-semibold space-y-1">
          <p>🤝 <strong>10-Year Solidarity Commitment:</strong> Upon receiving daughter wedding financial assistance, the beneficiary member is committed to <strong>participating in at least 90% of all future mutual appeals for a minimum of 10 continuous years</strong>.</p>
          <p className="text-xs text-slate-700 font-normal">Failure to maintain participation affects future eligibility and standing.</p>
        </div>
      ),
    },
    {
      num: 20,
      category: 'transparency',
      titleHi: 'व्यक्तिगत खाते या निजी UPI का उपयोग निषिद्ध',
      titleEn: '20. Prohibition on Private Bank Accounts/UPI',
      contentHi: (
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-950 font-semibold space-y-1">
          <p>❌ <strong>निजी खाते प्रतिबंधित:</strong> ट्रस्ट की योजना के अंतर्गत किसी पदाधिकारी अथवा सदस्य के निजी बैंक खाते, निजी UPI अथवा निजी QR Code के माध्यम से धन संग्रह नहीं किया जाएगा।</p>
        </div>
      ),
      contentEn: (
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-950 font-semibold space-y-1">
          <p>❌ <strong>Prohibition on Private Channels:</strong> Solicitation or collection of scheme contributions via private personal bank accounts, private UPI IDs, or personal QR codes is strictly prohibited.</p>
        </div>
      ),
    },
    {
      num: 21,
      category: 'transparency',
      titleHi: 'सामूहिक सहयोग की व्यवस्था',
      titleEn: '21. Collective Social Assistance Model',
      contentHi: (
        <p>सदस्यों का सहयोग सामूहिक सामाजिक सहायता व्यवस्था का हिस्सा होगा। किसी सदस्य द्वारा दिया गया सहयोग किसी विशेष व्यक्ति को व्यक्तिगत भुगतान नहीं माना जाएगा।</p>
      ),
      contentEn: (
        <p>Contributions form part of an institutional collective social solidarity ecosystem and cannot be treated as private personal transactions between individual members.</p>
      ),
    },
    {
      num: 22,
      category: 'transparency',
      titleHi: 'रिकॉर्ड एवं पारदर्शिता',
      titleEn: '22. Records & Complete Transparency',
      contentHi: (
        <p>सदस्यता, सहयोग, सहायता प्राप्त मामलों, लाभार्थियों, दस्तावेजों एवं बैंक/भुगतान संबंधी रिकॉर्ड सुरक्षित रखे जाएंगे।</p>
      ),
      contentEn: (
        <p>All records regarding member directories, case approvals, beneficiaries, disbursement proofs, and bank accounts are securely archived with full digital transparency.</p>
      ),
    },
    {
      num: 23,
      category: 'verification',
      titleHi: 'पात्रता पर अंतिम निर्णय',
      titleEn: '23. Board Adjudication on Marriage Aid',
      contentHi: (
        <p>सदस्यता मात्र से सहायता का अधिकार स्वतः उत्पन्न नहीं होगा। लॉक-इन, 90% सहयोग, दस्तावेज, संबंध, आयु एवं निकाह संबंधी शर्तों की जांच के बाद सक्षम मंडल निर्णय लेगा।</p>
      ),
      contentEn: (
        <p>Membership does not confer automatic right to financial aid. Sanctions are governed by Board review following verification of lock-in compliance, 90% contribution records, kinship proofs, and marriage eligibility.</p>
      ),
    },
    {
      num: 24,
      category: 'organization',
      titleHi: 'गलत जानकारी एवं धोखाधड़ी',
      titleEn: '24. Fraud & Misrepresentation Clause',
      contentHi: (
        <p>फर्जी दस्तावेज, गलत जानकारी अथवा धोखाधड़ी पाए जाने पर आवेदन अस्वीकार किया जा सकता है तथा सदस्यता एवं भविष्य की पात्रता के संबंध में नियमानुसार निर्णय लिया जा सकता है।</p>
      ),
      contentEn: (
        <p>Any falsification, counterfeit documentation, or fraud leads to immediate disqualification, cancellation of membership, and potential legal actions under prevailing laws.</p>
      ),
    },
    {
      num: 25,
      category: 'organization',
      titleHi: 'नियमों में संशोधन',
      titleEn: '25. Bylaw Amendments',
      contentHi: (
        <p>योजना के नियमों में आवश्यकता के अनुसार संशोधन किया जा सकता है। संशोधन Trust Deed, लागू कानून एवं ट्रस्ट की सक्षम संस्था की प्रक्रिया के अनुसार होगा।</p>
      ),
      contentEn: (
        <p>The Trust Board reserves the right to amend scheme rules in line with operational requirements, subject to the registered Trust Deed and applicable statutory laws.</p>
      ),
    },
    {
      num: 26,
      category: 'foundation',
      titleHi: 'Trust Deed सर्वोपरि',
      titleEn: '26. Supremacy of Registered Trust Deed',
      contentHi: (
        <div className="p-3 bg-[#0a2e1d] text-white rounded-2xl border border-[#c8a84b] text-xs sm:text-sm font-semibold">
          ⚖️ इस नियमावली और Trust Deed अथवा लागू कानून के बीच विरोधाभास होने पर <strong>Trust Deed एवं लागू कानून प्रभावी होंगे</strong>।
        </div>
      ),
      contentEn: (
        <div className="p-3 bg-[#0a2e1d] text-white rounded-2xl border border-[#c8a84b] text-xs sm:text-sm font-semibold">
          ⚖️ In any circumstance of divergence between this policy and the registered Trust Deed or statutory enactments, the <strong>registered Trust Deed and Indian law shall prevail supreme</strong>.
        </div>
      ),
    },
  ], []);

  // Filter categories
  const categories = [
    { id: 'all', labelHi: 'सभी नियम', labelEn: 'All Clauses' },
    { id: 'foundation', labelHi: 'उद्देश्य व सदस्यता', labelEn: 'Objectives & Membership' },
    { id: 'support', labelHi: 'सहयोग व लॉक-इन', labelEn: 'Support & Lock-in' },
    { id: 'verification', labelHi: 'पात्रता, नॉमिनी व दस्तावेज', labelEn: 'Eligibility & Documents' },
    { id: 'organization', labelHi: 'संगठन व आचार संहिता', labelEn: 'Organization & Conduct' },
    { id: 'transparency', labelHi: 'पारदर्शिता व नियम', labelEn: 'Transparency & Audit' },
  ];

  // Filtered rules for Scheme 1
  const filteredDeathRules = useMemo(() => {
    return deathSchemeRules.filter((rule) => {
      const matchesCategory = activeCategory === 'all' || rule.category === activeCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const numMatch = rule.num.toString().includes(query);
      const titleMatch = rule.titleHi.toLowerCase().includes(query) || rule.titleEn.toLowerCase().includes(query);
      return numMatch || titleMatch;
    });
  }, [deathSchemeRules, activeCategory, searchQuery]);

  // Filtered rules for Scheme 2
  const filteredNikahRules = useMemo(() => {
    return nikahSchemeRules.filter((rule) => {
      const matchesCategory = activeCategory === 'all' || rule.category === activeCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const numMatch = rule.num.toString().includes(query);
      const titleMatch = rule.titleHi.toLowerCase().includes(query) || rule.titleEn.toLowerCase().includes(query);
      return numMatch || titleMatch;
    });
  }, [nikahSchemeRules, activeCategory, searchQuery]);

  const totalFilteredCount = (selectedScheme === 'all' || selectedScheme === 'death' ? filteredDeathRules.length : 0) +
    (selectedScheme === 'all' || selectedScheme === 'nikah' ? filteredNikahRules.length : 0);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MOHAMMAD FAEEM CHARITABLE TRUST (MFCT) — नियमावली',
          text: 'MFCT नियमावली एवं संचालन नियम — “याद उनकी, सेवा हमारी”',
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isHindi ? 'लिंक कॉपी कर लिया गया है!' : 'Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 pb-24">

      {/* ── 1. Grand Luxury Hero Header ── */}
      <section
        className="relative overflow-hidden text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 print:bg-white print:text-black print:pb-6"
        style={{ background: 'radial-gradient(ellipse at top, #0f3322 0%, #061910 100%)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:24px_24px] print:hidden" />

        <div className="relative max-w-7xl mx-auto text-center space-y-4">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest shadow-md print:border-slate-800 print:text-black"
            style={{
              background: 'rgba(200,168,75,0.12)',
              border: '1.5px solid #c8a84b',
              color: '#f0c868',
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-300 print:hidden" />
            <span>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white pt-1 print:text-black">
            {isHindi ? 'नियमावली एवं संचालन नियम' : 'Official Rules, Regulations & Bylaws'}
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-2xl font-black tracking-wide" style={{ color: '#e0c068' }}>
            {isHindi ? '“याद उनकी, सेवा हमारी”' : '“In Their Memory, In Our Service”'}
          </p>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-normal print:text-slate-700">
            {isHindi
              ? 'मोहम्मद फ़ईम चैरिटेबल ट्रस्ट (MFCT) की वैधानिक नियमावली, सामूहिक सहयोग संरचना, सदस्यता दायित्व एवं पारदर्शिता दिशानिर्देश।'
              : 'Official bylaws, mutual welfare support frameworks, membership responsibilities, and transparency guidelines of Mohammad Faeem Charitable Trust (MFCT).'}
          </p>

          {/* Quick Stat Highlight Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-6xl mx-auto pt-6 text-left print:hidden">
            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'वार्षिक संचालन सहयोग' : 'Annual System Support'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">₹100</span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? '45 दिन अतिरिक्त अवधि' : '45-day grace period'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'आकस्मिक निधन योजना' : 'Bereavement Scheme'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {isHindi ? 'न्यूनतम ₹100' : 'Min ₹100'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? '12 माह लॉक-इन • 90% सहयोग' : '12-Mo Lock-in • 90% Aid'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'बेटी निकाह सहारा' : 'Marriage Support'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {isHindi ? 'अधिकतम ₹50' : 'Max ₹50'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? '180d / 365d / 2yr लॉक-इन' : 'Tiered Lock-in • 2 Daughters'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {isHindi ? 'पारदर्शिता व भुगतान' : '100% Direct Transfer'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                {isHindi ? '100% प्रत्यक्ष' : '100% Direct'}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                {isHindi ? 'सीधे नॉमिनी खाते में' : 'Direct into Nominee Bank'}
              </span>
            </div>
          </div>

          {/* Action Bar (Print / Share / Helpline) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/15"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHindi ? 'नियमावली प्रिंट करें' : 'Print Bylaws'}</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/15"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'शेयर करें' : 'Share Bylaws'}</span>
            </button>
            <a
              href="tel:+918218017226"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-emerald-500/30"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHindi ? 'हेल्पलाइन: +91 82180 17226' : 'Helpline: +91 82180 17226'}</span>
            </a>
          </div>

        </div>
      </section>

      {/* ── 2. Scheme Switcher & Search Bar ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 print:hidden">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200/80 space-y-4">

          {/* Primary Scheme Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => setSelectedScheme('all')}
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer border ${
                selectedScheme === 'all'
                  ? 'bg-[#0a2e1d] text-[#e0c068] border-[#c8a84b] shadow-md scale-[1.02]'
                  : 'bg-[#f8faf9] text-slate-700 border-slate-200 hover:bg-[#ebf3ef]'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{isHindi ? '🌟 दोनों योजनाएं (सभी 56 नियम)' : '🌟 Both Schemes (All 56 Rules)'}</span>
            </button>

            <button
              onClick={() => setSelectedScheme('death')}
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer border ${
                selectedScheme === 'death'
                  ? 'bg-[#0a2e1d] text-[#e0c068] border-[#c8a84b] shadow-md scale-[1.02]'
                  : 'bg-[#f8faf9] text-slate-700 border-slate-200 hover:bg-[#ebf3ef]'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>{isHindi ? '🕊️ आकस्मिक निधन सहारा (30 नियम)' : '🕊️ Bereavement Scheme (30 Rules)'}</span>
            </button>

            <button
              onClick={() => setSelectedScheme('nikah')}
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer border ${
                selectedScheme === 'nikah'
                  ? 'bg-[#0a2e1d] text-[#e0c068] border-[#c8a84b] shadow-md scale-[1.02]'
                  : 'bg-[#f8faf9] text-slate-700 border-slate-200 hover:bg-[#ebf3ef]'
              }`}
            >
              <Heart className="w-4 h-4 text-amber-400" />
              <span>{isHindi ? '💍 बेटी निकाह सहारा (26 नियम)' : '💍 Daughter Marriage Scheme (26 Rules)'}</span>
            </button>
          </div>

          {/* Search and Category Filter Row */}
          <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">

            {/* Live Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? 'नियम खोजें (उदा. 90%, लॉक-इन, नॉमिनी, ₹100)...' : 'Search rules (e.g. 90%, lock-in, nominee, ₹100)...'}
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a2e1d] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#0a2e1d] text-[#e0c068] shadow-sm'
                      : 'bg-[#ebf3ef] text-[#2c4035] hover:bg-[#deede5]'
                  }`}
                >
                  {isHindi ? cat.labelHi : cat.labelEn}
                </button>
              ))}
            </div>

          </div>

          {/* Results Counter if Filtered */}
          {(searchQuery || activeCategory !== 'all') && (
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-1">
              <span>
                {isHindi
                  ? `कुल ${totalFilteredCount} नियम प्रदर्शित हो रहे हैं`
                  : `Showing ${totalFilteredCount} matching clauses`}
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-emerald-700 hover:underline text-[11px] font-bold"
              >
                {isHindi ? 'फ़िल्टर हटाएं' : 'Clear Filters'}
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ── 3. Main Content Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">

        {/* ══════════════════════════════════════════════════════════════
            SCHEME 1: MFCT आकस्मिक निधन परिवार सहारा योजना
        ══════════════════════════════════════════════════════════════ */}
        {(selectedScheme === 'all' || selectedScheme === 'death') && (
          <section className="space-y-6">

            {/* Scheme 1 Luxury Header Banner */}
            <div
              className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0a2e1d 0%, #124029 60%, #061910 100%)',
                border: '2px solid #c8a84b',
              }}
            >
              <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-black select-none pointer-events-none text-amber-200">
                01
              </div>

              <div className="relative space-y-3 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <span>{isHindi ? 'योजना 1 • SCHEME 01' : 'SCHEME 01 • BEREAVEMENT'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {isHindi
                    ? 'MFCT आकस्मिक निधन परिवार सहारा योजना'
                    : 'MFCT Accidental Death Family Support Scheme'}
                </h2>

                <p className="text-base sm:text-xl font-extrabold text-[#f5d77f]">
                  {isHindi ? 'टैगलाइन — “याद उनकी, सेवा हमारी”' : 'Tagline — “In Their Memory, In Our Service”'}
                </p>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {isHindi
                    ? 'ट्रस्ट के वैधानिक सदस्य के असामयिक निधन की स्थिति में उसके पात्र नॉमिनी/परिवार को सामूहिक सहयोग के माध्यम से आर्थिक सहारा उपलब्ध कराने की आधिकारिक नियमावली (नियम 1 से 30)।'
                    : 'Official bylaws governing collective mutual financial support to the bereaved family / verified nominee upon the untimely demise of a verified member (Rules 1 to 30).'}
                </p>

                {/* Highlights Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">{isHindi ? 'वार्षिक सहयोग' : 'Annual Fee'}</span>
                    <span className="text-sm font-black text-white">₹100 / {isHindi ? 'वर्ष' : 'yr'}</span>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">{isHindi ? 'न्यूनतम सहयोग' : 'Min Appeal'}</span>
                    <span className="text-sm font-black text-white">₹100 / {isHindi ? 'सदस्य' : 'member'}</span>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">{isHindi ? 'लॉक-इन अवधि' : 'Lock-in'}</span>
                    <span className="text-sm font-black text-white">12 {isHindi ? 'माह' : 'Months'}</span>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">{isHindi ? 'अनिवार्य सहयोग' : 'Required Aid'}</span>
                    <span className="text-sm font-black text-white">90% {isHindi ? 'सहयोग' : 'Compliance'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheme 1 Rules Grid */}
            <div className="space-y-4">
              {filteredDeathRules.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
                  {isHindi ? 'इस श्रेणी/खोज में कोई नियम नहीं मिला।' : 'No rules found matching the criteria in Scheme 1.'}
                </div>
              ) : (
                filteredDeathRules.map((rule) => (
                  <div
                    key={rule.num}
                    id={`death-rule-${rule.num}`}
                    className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 hover:border-emerald-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3">
                      <span className="w-8 h-8 rounded-xl bg-[#0a2e1d] text-[#f5d77f] font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {rule.num}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {isHindi ? rule.titleHi : rule.titleEn}
                      </h3>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {isHindi ? rule.contentHi : rule.contentEn}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Scheme 1 Special Declaration Quote Banner */}
            <div
              className="rounded-3xl p-7 sm:p-9 text-white shadow-xl text-center space-y-4 relative overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at center, #0f3322 0%, #061910 100%)',
                border: '2px solid #c8a84b',
              }}
            >
              <span className="text-xs font-bold tracking-widest uppercase text-[#e0c068] block">
                {isHindi ? 'विशेष घोषणा (SPECIAL DECLARATION)' : 'SPECIAL DECLARATION'}
              </span>

              <blockquote className="text-lg sm:text-2xl font-black text-white italic leading-relaxed max-w-3xl mx-auto">
                {isHindi
                  ? '“आज हम किसी जरूरतमंद परिवार के साथ खड़े हों, ताकि कल जरूरत के समय समाज हमारे साथ खड़ा हो।”'
                  : '“Stand with a family in need today, so tomorrow in your hour of need, society stands united with you.”'}
              </blockquote>

              <div className="pt-2 flex flex-col items-center justify-center">
                <span className="text-sm sm:text-base font-extrabold text-amber-200">
                  MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)
                </span>
                <span className="text-xs sm:text-sm font-black text-[#f5d77f] tracking-wider mt-1">
                  {isHindi ? '“याद उनकी, सेवा हमारी”' : '“In Their Memory, In Our Service”'}
                </span>
              </div>
            </div>

          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SCHEME 2: MFCT बेटी निकाह सहारा योजना
        ══════════════════════════════════════════════════════════════ */}
        {(selectedScheme === 'all' || selectedScheme === 'nikah') && (
          <section className="space-y-6 pt-6">

            {/* Scheme 2 Luxury Header Banner */}
            <div
              className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0a2e1d 0%, #124029 60%, #061910 100%)',
                border: '2px solid #c8a84b',
              }}
            >
              <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-black select-none pointer-events-none text-amber-200">
                02
              </div>

              <div className="relative space-y-3 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <span>{isHindi ? 'योजना 2 • SCHEME 02' : 'SCHEME 02 • DAUGHTER MARRIAGE'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {isHindi
                    ? 'MFCT बेटी निकाह सहारा योजना'
                    : 'MFCT Daughter Marriage Support Scheme'}
                </h2>

                <p className="text-base sm:text-xl font-extrabold text-[#f5d77f]">
                  {isHindi ? 'टैगलाइन — “याद उनकी, सेवा हमारी”' : 'Tagline — “In Their Memory, In Our Service”'}
                </p>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {isHindi
                    ? 'पात्र एवं सक्रिय सदस्य की जैविक बेटी/बहन के निकाह के अवसर पर सामूहिक आर्थिक सहयोग एवं सहायता की आधिकारिक नियमावली (नियम 1 से 26)।'
                    : 'Official bylaws governing mutual community solidarity and financial aid for the marriage of biological daughters/sisters of verified members (Rules 1 to 26).'}
                </p>

                {/* Highlights Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">{isHindi ? 'तआवुन सहयोग' : 'Ta’awun Support'}</span>
                    <span className="text-sm font-black text-white">₹50 {isHindi ? 'अधिकतम' : 'Max / member'}</span>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">{isHindi ? 'लॉक-इन स्लैब' : 'Lock-in Slabs'}</span>
                    <span className="text-sm font-black text-white">180d / 365d / 2yr</span>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">{isHindi ? 'अधिकतम सीमा' : 'Benefit Cap'}</span>
                    <span className="text-sm font-black text-white">2 {isHindi ? 'बेटियाँ / बहनें' : 'Daughters/Sisters'}</span>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">{isHindi ? 'सहयोग जिम्मेदारी' : 'Post-Aid Duty'}</span>
                    <span className="text-sm font-black text-white">10 {isHindi ? 'वर्ष 90% तआवुन' : 'Yrs 90% Support'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheme 2 Rules Grid */}
            <div className="space-y-4">
              {filteredNikahRules.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
                  {isHindi ? 'इस श्रेणी/खोज में कोई नियम नहीं मिला।' : 'No rules found matching the criteria in Scheme 2.'}
                </div>
              ) : (
                filteredNikahRules.map((rule) => (
                  <div
                    key={rule.num}
                    id={`nikah-rule-${rule.num}`}
                    className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 hover:border-emerald-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3">
                      <span className="w-8 h-8 rounded-xl bg-[#0a2e1d] text-[#f5d77f] font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {rule.num}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {isHindi ? rule.titleHi : rule.titleEn}
                      </h3>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {isHindi ? rule.contentHi : rule.contentEn}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Scheme 2 Special Declaration Quote Banner */}
            <div
              className="rounded-3xl p-7 sm:p-9 text-white shadow-xl text-center space-y-4 relative overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at center, #0f3322 0%, #061910 100%)',
                border: '2px solid #c8a84b',
              }}
            >
              <span className="text-xs font-bold tracking-widest uppercase text-[#e0c068] block">
                {isHindi ? 'विशेष घोषणा (SPECIAL DECLARATION)' : 'SPECIAL DECLARATION'}
              </span>

              <blockquote className="text-lg sm:text-2xl font-black text-white italic leading-relaxed max-w-3xl mx-auto">
                {isHindi
                  ? '“आज हम किसी की बेटी के निकाह में सहारा बनें, ताकि कल जरूरत के वक्त समाज हमारे साथ खड़ा हो।”'
                  : '“Be a supporting pillar in someone’s daughter’s wedding today, so tomorrow in your time of need, society stands with you.”'}
              </blockquote>

              <div className="pt-2 flex flex-col items-center justify-center">
                <span className="text-sm sm:text-base font-extrabold text-amber-200">
                  MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)
                </span>
                <span className="text-xs sm:text-sm font-black text-[#f5d77f] tracking-wider mt-1">
                  {isHindi ? '“याद उनकी, सेवा हमारी”' : '“In Their Memory, In Our Service”'}
                </span>
              </div>
            </div>

          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            GRAND CLOSING PLEDGE & CONTACT
        ══════════════════════════════════════════════════════════════ */}
        <section
          className="rounded-3xl p-7 sm:p-10 text-white shadow-xl text-center space-y-5 relative overflow-hidden print:hidden"
          style={{
            background: 'radial-gradient(ellipse at center, #0f2d1e 0%, #04120b 100%)',
            border: '2px solid #c8a84b',
          }}
        >
          <span className="text-xs font-bold tracking-widest uppercase text-[#e0c068] block">
            {isHindi ? 'MFCT का अंतिम संकल्प' : 'MFCT SOLEMN PLEDGE'}
          </span>

          <p className="text-xl sm:text-3xl font-black text-white">
            {isHindi ? 'MFCT का संकल्प है:' : 'The solemn pledge of MFCT:'}{' '}
            <span className="text-[#f5d77f]">
              {isHindi ? 'कोई परिवार मुश्किल में अकेला न रहे।' : 'No family shall face calamity alone.'}
            </span>
          </p>

          <p className="text-xs sm:text-sm text-slate-300">
            {isHindi ? 'हमारी कोशिश है कि:' : 'Our sacred endeavor:'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-200 pt-1">
            <span className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
              {isHindi ? 'यादें → सेवा बनें' : 'Memories → Service'}
            </span>
            <span className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
              {isHindi ? 'मोहब्बत → मदद बने' : 'Compassion → Support'}
            </span>
            <span className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
              {isHindi ? 'सदस्यता → जिम्मेदारी बने' : 'Membership → Duty'}
            </span>
            <span className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
              {isHindi ? 'एकता → ताकत बने' : 'Unity → Strength'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 pt-2 max-w-2xl mx-auto">
            {isHindi
              ? 'और मरहूम मोहम्मद फ़ईम साहब की याद समाज के लिए निरंतर भलाई और इंसानियत का माध्यम बने।'
              : 'And the cherished memory of Marhoom Mohammad Faeem Sahab remains an eternal source of goodness and humanity for all.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/918218017226"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isHindi ? 'WhatsApp हेल्पलाइन से संपर्क करें' : 'Contact WhatsApp Helpdesk'}</span>
            </a>
            <a
              href="tel:+918218017226"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-black transition-all border border-white/20"
            >
              <PhoneCall className="w-4 h-4 text-amber-300" />
              <span>+91 82180 17226</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-400 tracking-widest pt-2">
            MOHAMMAD FAEEM CHARITABLE TRUST (MFCT) • {isHindi ? '“याद उनकी, सेवा हमारी”' : '“In Their Memory, In Our Service”'}
          </p>
        </section>

      </main>

    </div>
  );
};
