'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
  isHindi: boolean;
  formatCurrency: (amount: number) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.campaigns': 'Campaigns',
    'nav.communities': 'Communities',
    'nav.about': 'About',
    'nav.gallery': 'Gallery',
    'nav.testimonials': 'Impact Stories',
    'nav.contact': 'Contact',
    'nav.adminPortal': 'Admin & Member Desk',
    'nav.donate': 'Donate Now',
    'nav.join': 'Join as Volunteer',
    'nav.myCard': 'My ID Card',

    // Hero
    'hero.badge': 'Verified Direct Charity Network in India',
    'hero.title': 'Empowering Local Communities Through Transparent Direct Relief',
    'hero.subtitle': 'Direct support for healthcare, orphan education, dignified Nikah assistance, Janazah funeral services, and ration kits across local mohallas in Uttar Pradesh & NCR.',
    'hero.exploreCampaigns': 'Explore Campaigns',
    'hero.quickDonate': 'Quick Zakat & Sadaqah',
    'hero.totalRaised': 'Total Raised for Relief',
    'hero.campaignsCount': 'Verified Campaigns',
    'hero.communitiesCount': 'Active Mohalla Units',
    'hero.volunteersCount': 'Registered Volunteers',

    // Categories
    'cat.title': 'Explore Causes & Support Categories',
    'cat.subtitle': 'Direct transparent funding channels verified by local mohalla elders and executive admins.',
    'cat.all': 'All Categories',
    'cat.medical': 'Medical Aid',
    'cat.education': 'Education & Books',
    'cat.marriage': 'Marriage & Nikah Support',
    'cat.food': 'Food & Ration Kits',
    'cat.community': 'Community Works',
    'cat.janazah': 'Janazah & Qabristan',
    'cat.zakat': 'Zakat Eligible',
    'cat.sadakah': 'Sadaqah & General',

    // Campaign Cards & Common
    'card.urgent': 'Urgent Relief',
    'card.verified': 'Verified',
    'card.zakat': 'Zakat Eligible',
    'card.raised': 'Raised',
    'card.ofGoal': 'of',
    'card.daysLeft': 'days left',
    'card.donors': 'donors',
    'card.donateNow': 'Donate Now',
    'card.viewDetail': 'View Details',
    'card.share': 'Share Campaign',

    // Sections
    'sec.urgentTitle': 'Urgent Emergency Relief Needed',
    'sec.urgentSubtitle': 'Immediate medical, surgical, and emergency survival drives requiring fast community response.',
    'sec.featuredTitle': 'Featured Community Drives',
    'sec.featuredSubtitle': 'Verified high-impact initiatives changing lives in Bareilly, Lucknow, Delhi & NCR.',
    'sec.viewAllCampaigns': 'View All Active Campaigns',

    'sec.nikahTitle': 'Dignified Marriage & Nikah Support',
    'sec.nikahSubtitle': 'Assisting orphan daughters and low-income families with simple dowry-free Nikah essentials, bridal trunks, and household starter items.',

    'sec.janazahTitle': 'Dignified Janazah Mortuary & Qabristan Aid',
    'sec.janazahSubtitle': 'Ensuring 24/7 free mortuary ambulance transport, burial shrouds (Kafan), grave preparation, and cemetery maintenance for poor families.',

    'sec.communityTitle': 'Our Verified Mohalla Communities',
    'sec.communitySubtitle': 'Direct ground-level grassroots organizations driving transparent door-to-door welfare.',

    'sec.impactTitle': 'Ground Verified Impact & Transparency',
    'sec.impactSubtitle': 'Photos, audit documents, and video updates from field volunteers delivering direct relief.',

    // Footer
    'footer.aboutText': 'MFCT (Mohalla Foundation Charity Trust) is a transparent, grassroots welfare network empowering needy families with medical aid, Nikah support, education, and Janazah services.',
    'footer.quickLinks': 'Quick Navigation',
    'footer.causes': 'Our Primary Causes',
    'footer.contactUs': 'Contact & Location',
    'footer.bareillyAddress': 'Central HQ: Civil Lines, Bareilly, UP 243001',
    'footer.helpline': '24/7 Support Helpline: +91 98765 43210',
    'footer.email': 'Email: info@sevasangam.org / helpline@mfct.org',
    'footer.rights': 'All rights reserved. MFCT Welfare Foundation Trust.',

    // Admin Panel
    'admin.title': 'Admin & Member Desk Portal',
    'admin.switchRole': 'Switch View Role:',
    'admin.execAdmin': 'Executive Admin',
    'admin.commAdmin': 'Community Admin',
    'admin.premDonor': 'Premium Donor',
    'admin.memberDonor': 'Member',
    'admin.backToWeb': 'Back to Public Website',
    'admin.createNew': 'Create New Campaign',
    'admin.downloadCard': 'Download ID Card',
    'admin.myReceipts': 'My Tax Receipts (80G)',

    'admin.tabOverview': 'Overview & Stats',
    'admin.tabCampaigns': 'Manage Campaigns',
    'admin.tabApprovals': 'Pending Approvals',
    'admin.tabDonations': 'All Donations',
    'admin.tabMembers': 'Volunteers & Members',
    'admin.tabAudit': 'Audit & Receipts',

    'admin.statTotalRaised': 'Total Funds Collected',
    'admin.statActiveCampaigns': 'Active Live Campaigns',
    'admin.statVerifiedDocs': '100% Audit Verified',
    'admin.statVolunteers': 'Ground Volunteers',

    // Modals
    'modal.donateTitle': 'Make a Direct Contribution',
    'modal.selectAmount': 'Select Donation Amount',
    'modal.customAmount': 'Or enter custom amount in ₹',
    'modal.fullName': 'Full Name',
    'modal.email': 'Email Address',
    'modal.phone': 'WhatsApp / Phone Number',
    'modal.paymentMethod': 'Select Payment Option',
    'modal.upi': 'UPI / GPay / PhonePe / Paytm',
    'modal.card': 'Debit / Credit Card / NetBanking',
    'modal.bank': 'Direct Bank NEFT / RTGS Transfer',
    'modal.isZakat': 'This contribution is from my Zakat',
    'modal.isAnonymous': 'Keep my identity anonymous on public board',
    'modal.proceedPayment': 'Proceed to Pay ₹',
    'modal.close': 'Close',

    'modal.regTitle': 'Register as Volunteer or Donor Member',
    'modal.regSubtitle': 'Join our network to verify ground campaigns, distribute relief kits, or pledge monthly Sadaqah.',
    'modal.cityMohalla': 'City & Mohalla Address',
    'modal.roleSelect': 'Primary Interest',
    'modal.roleVolunteer': 'Ground Field Volunteer',
    'modal.roleDonor': 'Monthly Regular Donor',
    'modal.roleAdmin': 'Community Admin Organizer',
    'modal.submitReg': 'Complete Registration',

    'modal.createCampTitle': 'Create New Welfare Campaign',
    'modal.campName': 'Campaign Title',
    'modal.campCategory': 'Category',
    'modal.goalAmount': 'Goal Amount (INR ₹)',
    'modal.city': 'City / Mohalla Location',
    'modal.beneficiary': 'Beneficiary Details',
    'modal.story': 'Detailed Story & Need Description',
    'modal.mainImage': 'Main Photo URL',
    'modal.submitCamp': 'Submit for Executive Approval',

    'modal.receiptTitle': 'Official Donation Receipt (80G Tax Exemption)',
    'modal.receiptId': 'Receipt No.',
    'modal.receiptDate': 'Date',
    'modal.panNumber': 'Trust PAN: AABTM8912E | 80G Registration: AAATM9081EF20214',
    'modal.downloadPdf': 'Download Tax Exemption Receipt (PDF)',

    // Common Buttons
    'btn.apply': 'Apply',
    'btn.clear': 'Clear Filters',
    'btn.search': 'Search',
    'btn.loading': 'Processing...',
  },
  hi: {
    // Nav
    'nav.home': 'मुख्य पृष्ठ',
    'nav.campaigns': 'सभी अभियान',
    'nav.communities': 'समुदाय नेटवर्क',
    'nav.about': 'हमारे बारे में',
    'nav.gallery': 'गैलरी एवं फोटो',
    'nav.testimonials': 'प्रभाव गाथाएं',
    'nav.contact': 'संपर्क करें',
    'nav.adminPortal': 'एडमिन एवं सदस्य पोर्टल',
    'nav.donate': 'अभी दान करें',
    'nav.join': 'स्वयंसेवक बनें',
    'nav.myCard': 'मेरा पहचान पत्र',

    // Hero
    'hero.badge': 'भारत में 100% सत्यापित प्रत्यक्ष दान नेटवर्क',
    'hero.title': 'पारदर्शी प्रत्यक्ष दान से स्थानीय समुदायों को सशक्त बनाना',
    'hero.subtitle': 'उत्तर प्रदेश और एनसीआर के स्थानीय मोहल्लों में स्वास्थ्य, अनाथ शिक्षा, गरिमापूर्ण निकाह सहायता, जनाज़ा दफ़न सेवाओं और राशन सामग्री के लिए सीधी सहायता।',
    'hero.exploreCampaigns': 'अभियान देखें',
    'hero.quickDonate': 'त्वरित ज़कात एवं सदक़ा',
    'hero.totalRaised': 'राहत हेतु कुल एकत्रित राशि',
    'hero.campaignsCount': 'सत्यापित अभियान',
    'hero.communitiesCount': 'सक्रिय मोहल्ला इकाइयां',
    'hero.volunteersCount': 'पंजीकृत स्वयंसेवक',

    // Categories
    'cat.title': 'सहायता श्रेणियां एवं कारण देखें',
    'cat.subtitle': 'स्थानीय मोहल्ला प्रमुखों और मुख्य प्रशासकों द्वारा 100% सत्यापित पारदर्शी सहायता चैनल।',
    'cat.all': 'सभी श्रेणियां',
    'cat.medical': 'चिकित्सा सहायता',
    'cat.education': 'शिक्षा एवं पुस्तकें',
    'cat.marriage': 'विवाह एवं निकाह सहायता',
    'cat.food': 'भोजन एवं राशन किट',
    'cat.community': 'सामुदायिक कार्य',
    'cat.janazah': 'जनाज़ा एवं क़ब्रिस्तान',
    'cat.zakat': 'ज़कात योग्य',
    'cat.sadakah': 'सदक़ा एवं सामान्य राहत',

    // Campaign Cards & Common
    'card.urgent': 'अति आवश्यक राहत',
    'card.verified': '100% सत्यापित',
    'card.zakat': 'ज़कात हेतु योग्य',
    'card.raised': 'एकत्रित',
    'card.ofGoal': 'लक्ष्य',
    'card.daysLeft': 'दिन शेष',
    'card.donors': 'दानदाता',
    'card.donateNow': 'अभी दान करें',
    'card.viewDetail': 'विवरण देखें',
    'card.share': 'शेयर करें',

    // Sections
    'sec.urgentTitle': 'अति आवश्यक आपातकालीन चिकित्सा राहत',
    'sec.urgentSubtitle': 'तत्काल अस्पताल, सर्जरी और जीवन रक्षक उपचार हेतु त्वरित सामुदायिक सहायता।',
    'sec.featuredTitle': 'प्रमुख सामुदायिक अभियान',
    'sec.featuredSubtitle': 'बरेली, लखनऊ, दिल्ली एवं एनसीआर में जीवन बदलने वाले सत्यापित प्रयास।',
    'sec.viewAllCampaigns': 'सभी सक्रिय अभियान देखें',

    'sec.nikahTitle': 'गरिमापूर्ण विवाह एवं निकाह सहायता',
    'sec.nikahSubtitle': 'अनाथ बेटियों और जरूरतमंद परिवारों को दहेज-मुक्त निकाह सामग्री, दुल्हन ट्रंक और बुनियादी गृहस्थी का सामान प्रदान करना।',

    'sec.janazahTitle': 'जनाज़ा एम्बुलेंस एवं क़ब्रिस्तान सहायता',
    'sec.janazahSubtitle': 'निःशुल्क 24/7 मर्चुरी एम्बुलेंस, कफ़न कपड़ा, क़ब्र की तैयारी और क़ब्रिस्तान रखरखाव की व्यवस्था।',

    'sec.communityTitle': 'हमारे सत्यापित मोहल्ला समुदाय',
    'sec.communitySubtitle': 'पारदर्शी घर-घर कल्याण सेवाएं चलाने वाले ज़मीनी स्तर के संगठन।',

    'sec.impactTitle': 'ज़मीनी सत्यापन और पारदर्शिता रिपोर्ट',
    'sec.impactSubtitle': 'फील्ड वालंटियर्स द्वारा प्रस्तुत प्रत्यक्ष राहत तस्वीरें, बिल एवं ऑडिट दस्तावेज़।',

    // Footer
    'footer.aboutText': 'एमएफसीटी (मोहल्ला फाउंडेशन चैरिटी ट्रस्ट) एक पारदर्शी, ज़मीनी स्तर का कल्याणकारी नेटवर्क है जो गरीब परिवारों को चिकित्सा सहायता, निकाह सहायता, शिक्षा और जनाज़ा सेवाएं प्रदान करता है।',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.causes': 'हमारी प्रमुख सेवाएं',
    'footer.contactUs': 'संपर्क एवं पता',
    'footer.bareillyAddress': 'केंद्रीय कार्यालय: सिविल लाइंस, बरेली, उ.प्र. 243001',
    'footer.helpline': '24/7 हेल्पलाइन नंबर: +91 98765 43210',
    'footer.email': 'ईमेल: info@sevasangam.org / helpline@mfct.org',
    'footer.rights': 'सर्वाधिकार सुरक्षित। एमएफसीटी वेलफेयर फाउंडेशन ट्रस्ट।',

    // Admin Panel
    'admin.title': 'प्रशासनिक एवं सदस्य डेस्क पोर्टल',
    'admin.switchRole': 'दृष्टिकोण/भूमिका बदलें:',
    'admin.execAdmin': 'मुख्य प्रशासक (Executive Admin)',
    'admin.commAdmin': 'समुदाय एडमिन',
    'admin.premDonor': 'प्रमुख दानदाता (Premium)',
    'admin.memberDonor': 'सदस्य',
    'admin.backToWeb': 'मुख्य वेबसाइट पर लौटें',
    'admin.createNew': 'नया अभियान बनाएं',
    'admin.downloadCard': 'आईडी कार्ड डाउनलोड करें',
    'admin.myReceipts': 'मेरी कर रसीदें (80G)',

    'admin.tabOverview': 'सिंहावलोकन एवं आंकड़े',
    'admin.tabCampaigns': 'अभियान प्रबंधन',
    'admin.tabApprovals': 'लंबित स्वीकृतियां',
    'admin.tabDonations': 'सभी प्राप्त दान',
    'admin.tabMembers': 'स्वयंसेवक व सदस्य',
    'admin.tabAudit': 'ऑडिट एवं रसीदें',

    'admin.statTotalRaised': 'कुल एकत्र फंड',
    'admin.statActiveCampaigns': 'सक्रिय लाइव अभियान',
    'admin.statVerifiedDocs': '100% ऑडिट सत्यापित',
    'admin.statVolunteers': 'ज़मीनी स्वयंसेवक',

    // Modals
    'modal.donateTitle': 'प्रत्यक्ष सहायता राशि जमा करें',
    'modal.selectAmount': 'दान राशि चुनें',
    'modal.customAmount': 'या अपनी इच्छानुसार राशि (₹) दर्ज करें',
    'modal.fullName': 'पूरा नाम',
    'modal.email': 'ईमेल पता',
    'modal.phone': 'व्हाट्सएप / फोन नंबर',
    'modal.paymentMethod': 'भुगतान विधि चुनें',
    'modal.upi': 'यूपीआई / जीपे / फोनपे / पेटीएम',
    'modal.card': 'डेबिट/क्रेडिट कार्ड/नेटबैंकिंग',
    'modal.bank': 'बैंक एनईएफटी / आरटीजीएस ट्रांसफर',
    'modal.isZakat': 'यह राशि मेरी ज़कात से दी जा रही है',
    'modal.isAnonymous': 'सार्वजनिक बोर्ड पर मेरा नाम गुप्त रखें',
    'modal.proceedPayment': 'भुगतान हेतु आगे बढ़ें ₹',
    'modal.close': 'बंद करें',

    // Registration
    'modal.regTitle': 'स्वयंसेवक या सदस्य के रूप में जुड़ें',
    'modal.regSubtitle': 'ज़मीनी अभियानों का सत्यापन करने, राहत किट बांटने या मासिक सदक़ा देने के लिए हमारे नेटवर्क से जुड़ें।',
    'modal.cityMohalla': 'शहर एवं मोहल्ले का पता',
    'modal.roleSelect': 'प्राथमिक रुचि चुनें',
    'modal.roleVolunteer': 'ज़मीनी फील्ड स्वयंसेवक',
    'modal.roleDonor': 'मासिक नियमित दानदाता',
    'modal.roleAdmin': 'सामुदायिक आयोजक',
    'modal.submitReg': 'पंजीकरण पूरा करें',

    'modal.createCampTitle': 'नया राहत अभियान शुरू करें',
    'modal.campName': 'अभियान का शीर्षक',
    'modal.campCategory': 'श्रेणी',
    'modal.goalAmount': 'लक्ष्य राशि (₹)',
    'modal.city': 'शहर / मोहल्ला स्थान',
    'modal.beneficiary': 'लाभार्थी का विवरण',
    'modal.story': 'विस्तृत कहानी एवं आवश्यकता',
    'modal.mainImage': 'मुख्य फोटो का यूआरएल (Image URL)',
    'modal.submitCamp': 'स्वीकृति हेतु भेजें',

    'modal.receiptTitle': 'आधिकारिक दान रसीद (80G कर छूट)',
    'modal.receiptId': 'रसीद संख्या',
    'modal.receiptDate': 'दिनांक',
    'modal.panNumber': 'ट्रस्ट पैन: AABTM8912E | 80G पंजीकरण: AAATM9081EF20214',
    'modal.downloadPdf': 'कर छूट रसीद (PDF) डाउनलोड करें',

    // Common
    'btn.apply': 'लागू करें',
    'btn.clear': 'फ़िल्टर हटाएं',
    'btn.search': 'खोजें',
    'btn.loading': 'प्रक्रिया जारी है...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mfct_lang');
      return (saved === 'hi' || saved === 'en') ? saved : 'en';
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mfct_lang', lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.en[key]) {
      return translations.en[key];
    }
    return defaultText || key;
  };

  const formatCurrency = (amount: number): string => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isHindi: language === 'hi',
        formatCurrency,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
