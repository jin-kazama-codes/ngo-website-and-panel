'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Campaign, DonationCategory, Donation, User, AccountDetails, WakalahInformation } from '../types';
import { X, QrCode, Upload, ArrowRight, ShieldCheck, Sparkles, Building2, CheckCircle2, FileCheck, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCampaigns } from '../services/campaignService';
import { createDonation } from '../services/donationService';
import { uploadImage } from '../lib/storage';
import { getAccountDetails } from '../services/adminService';
import { useLanguage } from '../context/LanguageContext';
import { translateCampaignTitle, translateCategory } from '../lib/translateEntity';
import { autoTranslateText, useDynamicTranslatedText } from '../lib/autoTranslate';
import { ZakatWakalahForm } from './ZakatWakalahForm';

const hindiNumbers: Record<number, string> = {
  1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पाँच', 6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ', 10: 'दस',
  11: 'ग्यारह', 12: 'बारह', 13: 'तेरह', 14: 'चौदह', 15: 'पंद्रह', 16: 'सोलह', 17: 'सत्रह', 18: 'अठारह', 19: 'उन्नीस', 20: 'बीस',
  21: 'इक्कीस', 22: 'बाईस', 23: 'तेईस', 24: 'चौबीस', 25: 'पच्चीस', 26: 'छब्बीस', 27: 'सत्ताईस', 28: 'अट्ठाईस', 29: 'उनतीस', 30: 'तीस',
  31: 'इकत्तीस', 32: 'बत्तीस', 33: 'तैंतीस', 34: 'चौंतीस', 35: 'पैंतीस', 36: 'छत्तीस', 37: 'सैंतीस', 38: 'अड़तीस', 39: 'उनतालीस', 40: 'चालीस',
  41: 'इकतालीस', 42: 'बयालीस', 43: 'तैंतालीस', 44: 'चवालीस', 45: 'पैंतालीस', 46: 'छियालीस', 47: 'सैंतालीस', 48: 'अड़तालीस', 49: 'उनचास', 50: 'पचास',
  51: 'इक्यावन', 52: 'बावन', 53: 'तिरपन', 54: 'चौवन', 55: 'पचपन', 56: 'छप्पन', 57: 'सत्तावन', 58: 'अट्ठावन', 59: 'उनसठ', 60: 'साठ',
  61: 'इकसठ', 62: 'बासठ', 63: 'तिरसठ', 64: 'चौंसठ', 65: 'पैंसठ', 66: 'छियासठ', 67: 'सरसठ', 68: 'अड़सठ', 69: 'उनहत्तर', 70: 'सत्तर',
  71: 'इकहत्तर', 72: 'बहत्तर', 73: 'तिहत्तर', 74: 'चौहत्तर', 75: 'पचहत्तर', 76: 'छिहत्तर', 77: 'सतहत्तर', 78: 'अठहत्तर', 79: 'उनासी', 80: 'अस्सी',
  81: 'इक्यासी', 82: 'बयासी', 83: 'तिरासी', 84: 'चौरासी', 85: 'पचासी', 86: 'छियासी', 87: 'सत्तासी', 88: 'अट्ठासी', 89: 'नवासी', 90: 'नब्बे',
  91: 'इक्यानवे', 92: 'बानवे', 93: 'तिरानवे', 94: 'चौरानवे', 95: 'पंचानवे', 96: 'छियानवे', 97: 'सत्तानवे', 98: 'अट्ठानवे', 99: 'निन्यानवे'
};

function numberToWordsINR(amount: number, lang: 'hi' | 'en' = 'hi'): string {
  if (!amount || isNaN(amount) || amount <= 0) return '';
  const num = Math.floor(amount);

  const onesEn = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tensEn = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const convertLessThanOneThousandEn = (n: number): string => {
    let current = '';
    if (n >= 100) {
      current += onesEn[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      current += tensEn[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      current += onesEn[n] + ' ';
    }
    return current.trim();
  };

  const convertLessThanOneThousandHi = (n: number): string => {
    let current = '';
    if (n >= 100) {
      const h = Math.floor(n / 100);
      current += (hindiNumbers[h] || '') + ' सौ ';
      n %= 100;
    }
    if (n > 0) {
      current += (hindiNumbers[n] || '') + ' ';
    }
    return current.trim();
  };

  if (lang === 'hi') {
    if (num === 0) return 'शून्य रुपये मात्र';
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;
    let result = '';
    if (crore > 0) result += convertLessThanOneThousandHi(crore) + ' करोड़ ';
    if (lakh > 0) result += convertLessThanOneThousandHi(lakh) + ' लाख ';
    if (thousand > 0) result += convertLessThanOneThousandHi(thousand) + ' हज़ार ';
    if (remainder > 0) result += convertLessThanOneThousandHi(remainder);
    return (result.trim() + ' रुपये मात्र').replace(/\s+/g, ' ');
  } else {
    if (num === 0) return 'Zero Rupees Only';
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;
    let result = '';
    if (crore > 0) result += convertLessThanOneThousandEn(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanOneThousandEn(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanOneThousandEn(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanOneThousandEn(remainder);
    return (result.trim() + ' Rupees Only').replace(/\s+/g, ' ');
  }
}

interface DonationModalProps {
  campaign?: Campaign;
  initialAmount?: number;
  initialCategory?: DonationCategory;
  currentUser?: User;
  onClose: () => void;
  onDonationSuccess: (donation: Donation) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  campaign,
  initialAmount,
  initialCategory,
  currentUser,
  onClose,
  onDonationSuccess,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<DonationCategory>(
    initialCategory || campaign?.category || 'General'
  );
  const [amount, setAmount] = useState<number>(initialAmount || 2500);
  const [customAmount, setCustomAmount] = useState<string>(
    initialAmount ? initialAmount.toString() : ''
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaign ? [campaign] : []);
  const [campaignsLoading, setCampaignsLoading] = useState<boolean>(!campaign);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaign?.id || '');
  const [isOutsideCommunity, setIsOutsideCommunity] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUploaded, setScreenshotUploaded] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>(
    currentUser?.name || tr('उदार दानदाता', 'عطیہ دہندہ', 'Generous Member')
  );
  const [zakatGuardianName, setZakatGuardianName] = useState<string>('');
  const [zakatAddress, setZakatAddress] = useState<string>(
    currentUser?.address || currentUser?.city || ''
  );
  const [zakatMobile, setZakatMobile] = useState<string>(
    currentUser?.phone || ''
  );
  const [zakatAmountWords, setZakatAmountWords] = useState<string>('');
  const [zakatAgreed, setZakatAgreed] = useState<boolean>(true);
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [translatedTitles, setTranslatedTitles] = useState<Record<string, string>>({});

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const userCity = (currentUser?.city || '').trim();
  const isPreselectedCampaign = Boolean(campaign);

  // Flexible city/community matching for donor's locality
  const isMatchUserCity = useCallback(
    (c: Campaign | null | undefined) => {
      if (!c || !userCity) return false;
      const uCity = userCity.toLowerCase().trim();
      const cCity = (c.city || '').toLowerCase().trim();
      const cDistrict = ((c as any).district || '').toLowerCase().trim();
      const cComm = (c.communityName || '').toLowerCase().trim();
      return (
        cCity === uCity ||
        (cCity && (cCity.includes(uCity) || uCity.includes(cCity))) ||
        (cDistrict && (cDistrict.includes(uCity) || uCity.includes(cDistrict))) ||
        (cComm && (cComm.includes(uCity) || uCity.includes(cComm)))
      );
    },
    [userCity]
  );

  useEffect(() => {
    if (!campaign) {
      setCampaignsLoading(true);
      getCampaigns({ status: 'active' }).then((data) => {
        setCampaigns(data);
        if (data.length > 0) {
          // Select local city campaign first to avoid defaulting to outside city
          const localCamp = userCity ? data.find(isMatchUserCity) : null;
          const targetId = localCamp ? localCamp.id : data[0].id;
          setSelectedCampaignId(targetId);
        }
      }).catch(console.error).finally(() => setCampaignsLoading(false));
    }
    getAccountDetails().then((data) => {
      if (data && data.length > 0) {
        setAccountDetails(data[0]);
      }
    }).catch(console.error);
  }, [campaign, userCity, isMatchUserCity]);

  // Ensure default campaign matches user city when available and not toggled to outside
  useEffect(() => {
    if (!campaign && userCity && campaigns.length > 0 && !isOutsideCommunity) {
      const currentActive = campaigns.find((c) => c.id === selectedCampaignId);
      const isCurrentLocal = currentActive ? isMatchUserCity(currentActive) : false;
      if (!isCurrentLocal) {
        const localCamp = campaigns.find(isMatchUserCity);
        if (localCamp) {
          setSelectedCampaignId(localCamp.id);
        }
      }
    }
  }, [campaign, userCity, campaigns, selectedCampaignId, isOutsideCommunity, isMatchUserCity]);

  useEffect(() => {
    if (language === 'en' || !campaigns.length) return;
    let isMounted = true;
    campaigns.forEach((c) => {
      autoTranslateText(c.title, language).then((t) => {
        if (isMounted && t) {
          setTranslatedTitles((prev) => ({ ...prev, [c.id]: t }));
        }
      });
    });
    return () => { isMounted = false; };
  }, [campaigns, language]);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];
  const dynamicActiveTitle = useDynamicTranslatedText(activeCampaign?.title, language);
  const dynamicActiveCommunity = useDynamicTranslatedText(activeCampaign?.communityName, language);

  // Zakat Rule check
  const isZakatSelected = selectedCategory === 'Zakat';
  const filteredCampaigns = isZakatSelected ? campaigns.filter((c) => c.isZakatEligible) : campaigns;
  const activeCampaignCity = (activeCampaign?.city || campaign?.city || '').trim();

  // Local city campaigns vs outside campaigns
  const localCityCampaigns = useMemo(
    () => (userCity ? filteredCampaigns.filter(isMatchUserCity) : []),
    [userCity, filteredCampaigns, isMatchUserCity]
  );

  // Show user city campaigns only; other cities are not shown
  const manualCampaigns = useMemo(() => {
    if (localCityCampaigns.length > 0) return localCityCampaigns;
    return filteredCampaigns;
  }, [localCityCampaigns, filteredCampaigns]);

  const isCampaignInUserCity = Boolean(
    userCity &&
    activeCampaign &&
    isMatchUserCity(activeCampaign)
  );

  // When a user selects a campaign from the 'All Campaigns' list—specifically one that does not appear in the local city list—the 'Help from Community' option will not be displayed.
  // Also, for general donation (!campaign), display only if local city campaigns exist to toggle from.
  const showOutsideCommunityToggle = !isPreselectedCampaign
    ? localCityCampaigns.length > 0
    : isCampaignInUserCity;

  const handleToggleOutsideCommunity = (enabled: boolean) => {
    setIsOutsideCommunity(enabled);
    if (enabled) {
      // Auto-select outside campaign
      const outsideCamp = filteredCampaigns.find((c) => !isMatchUserCity(c)) || filteredCampaigns[0];
      if (outsideCamp) {
        setSelectedCampaignId(outsideCamp.id);
      }
    } else {
      // Revert to local city campaign
      const localCamp = localCityCampaigns[0] || filteredCampaigns[0];
      if (localCamp) {
        setSelectedCampaignId(localCamp.id);
      }
    }
  };

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    const chosen = campaigns.find((c) => c.id === id);
    if (chosen && userCity) {
      const isLocal = isMatchUserCity(chosen);
      setIsOutsideCommunity(!isLocal);
    }
  };

  // Sync Zakat Amount in words when amount or language changes
  useEffect(() => {
    if (selectedCategory === 'Zakat') {
      const targetLang = language === 'en' ? 'en' : 'hi';
      setZakatAmountWords(numberToWordsINR(amount, targetLang));
    }
  }, [amount, selectedCategory, language]);

  // Sync current user details if available
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && (!donorName || donorName === 'Generous Member' || donorName === 'उदार दानदाता')) {
        setDonorName(currentUser.name);
      }
      if (currentUser.phone && !zakatMobile) {
        setZakatMobile(currentUser.phone);
      }
      if ((currentUser.address || currentUser.city) && !zakatAddress) {
        setZakatAddress(currentUser.address || currentUser.city);
      }
    }
  }, [currentUser]);

  const handleAmountClick = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  const handleProceedToPayment = () => {
    if (selectedCategory === 'Zakat') {
      if (!donorName || !donorName.trim()) {
        showToast(
          tr('कृपया अपना पूरा नाम दर्ज करें।', 'براہ کرم اپنا پورا نام درج کریں۔', 'Please enter your full name.')
        );
        return;
      }
      if (!zakatGuardianName || !zakatGuardianName.trim()) {
        showToast(
          tr(
            'कृपया पिता या पति का नाम दर्ज करें।',
            'براہ کرم والد یا شوہر کا نام درج کریں۔',
            "Please enter father's or husband's name."
          )
        );
        return;
      }
      if (!zakatMobile || !zakatMobile.trim()) {
        showToast(
          tr(
            'कृपया मोबाइल नंबर दर्ज करें।',
            'براہ کرم موبائل نمبر درج کریں۔',
            'Please enter mobile number.'
          )
        );
        return;
      }
      if (!amount || amount <= 0) {
        showToast(
          tr('कृपया वैध ज़कात राशि दर्ज करें।', 'براہ کرم درست رقم درج کریں۔', 'Please enter a valid Zakat amount.')
        );
        return;
      }
      if (!zakatAgreed) {
        showToast(
          tr(
            'कृपया वकालात वचनबद्धता स्वीकार करें।',
            'براہ کرم وکالت اقرار نامہ قبول کریں۔',
            'Please accept the Wakalah Undertaking declaration.'
          )
        );
        return;
      }
    } else {
      if (!amount || amount <= 0) {
        showToast(
          tr('कृपया वैध राशि चुनें।', 'براہ کرم درست رقم منتخب کریں۔', 'Please select a valid amount.')
        );
        return;
      }
    }
    setStep(2);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorName.trim()) {
      showToast(
        tr(
          'कृपया अपना पूरा नाम दर्ज करें।',
          'براہ کرم اپنا پورا نام درج کریں۔',
          'Please enter your full name.'
        )
      );
      return;
    }
    if (!utrNumber || !utrNumber.trim()) {
      showToast(
        tr(
          'कृपया बैंक UTR / संदर्भ संख्या दर्ज करें।',
          'براہ کرم بینک UTR / ٹرانزیکشن نمبر درج کریں۔',
          'Please enter Bank UTR / Transaction Ref No.'
        )
      );
      return;
    }
    if (!screenshotFile && !screenshotUploaded) {
      showToast(
        tr(
          'कृपया भुगतान स्क्रीनशॉट अपलोड करें।',
          'براہ کرم ادائیگی کی رسید اپلوڈ کریں۔',
          'Please upload payment screenshot.'
        )
      );
      return;
    }
    if (!activeCampaign) return;
    setSubmitting(true);

    try {
      let screenshotUrl: string | undefined;
      if (screenshotFile) {
        screenshotUrl = await uploadImage('donations', screenshotFile);
      }

      const finalUtr = utrNumber.trim();
      const donationData: Omit<Donation, 'id'> = {
        transactionId: `TXN${Math.floor(100000000 + Math.random() * 900000000)}`,
        utrNumber: finalUtr,
        donorName: donorName.trim(),
        donorId: currentUser?.id || 'anonymous',
        donorRole: currentUser?.role || 'member',
        donorAvatar: currentUser?.avatar || undefined,
        campaignId: activeCampaign.id,
        campaignTitle: activeCampaign.title,
        communityName: activeCampaign.communityName,
        amountINR: amount,
        category: selectedCategory,
        isOutsideCommunity: isOutsideCommunity || Boolean(
          userCity &&
          activeCampaign &&
          !isMatchUserCity(activeCampaign)
        ),
        paymentMethod,
        paymentScreenshotUrl: screenshotUrl,
        status: 'pending_verification',
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        receiptNumber: `RCP-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        district: currentUser?.city || 'FBD',
        wakalahInformation: selectedCategory === 'Zakat' ? [
          {
            donorName: donorName.trim() || 'Anonymous',
            guardianName: zakatGuardianName.trim(),
            address: zakatAddress.trim(),
            mobile: zakatMobile.trim(),
            amountINR: amount,
            amountInWords: zakatAmountWords || numberToWordsINR(amount, language === 'en' ? 'en' : 'hi'),
            isAccepted: true,
            undertakingTitle: 'ZAKAT AUTHORISATION & WAKALAH UNDERTAKING',
            declarationText: 'यह घोषित करता/करती हूँ कि उपरोक्त राशि मेरी ज़कात की राशि है।',
            authorizationText: 'मैं MOHAMMAD FAEEM CHARITABLE TRUST (MFCT) को अपनी ओर से इस राशि को वकील/अमीन के रूप में प्राप्त करने तथा शरीअत के अनुसार योग्य ज़कात लाभार्थियों तक पहुँचाने के लिए अधिकृत करता/करती हूँ।',
            trustName: 'MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)',
            date: new Date().toISOString(),
          }
        ] : undefined,
      };

      const savedDonation = await createDonation(donationData);

      setCreatedDonation(savedDonation);
      onDonationSuccess(savedDonation);
      setStep(3);
      showToast(
        tr('दान सफलतापूर्वक जमा किया गया!', 'عطیہ کامیابی کے ساتھ جمع ہو گیا!', 'Donation submitted successfully!'),
        'success'
      );

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch { }
    } catch (err) {
      console.error('Donation error:', err);
      showToast(
        tr(
          'दान जमा करने में विफल। कृपया पुन: प्रयास करें।',
          'عطیہ جمع کرنے میں ناکامی۔ دوبارہ کوشش کریں۔',
          'Failed to submit donation. Please try again.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: DonationCategory) => {
    switch (cat) {
      case 'General': return tr('सामान्य', 'عام عطیہ', 'General');
      case 'Sadaqah': return tr('सदक़ा', 'صدقہ', 'Sadaqah');
      case 'Zakat': return tr('ज़कात', 'زکوٰۃ', 'Zakat');
      case 'Fitra': return tr('फ़ितरा', 'فطرہ', 'Fitra');
      default: return cat;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
      <div
        className="rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-text-dark)' }}
      >

        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[60] text-sm font-bold text-white transition-all transform duration-300 ease-out ${toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'
            }`}>
            {toastMessage.message}
          </div>
        )}

        <button
          onClick={onClose}
          className="cursor-pointer absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 transition-colors"
          style={{ color: 'var(--mfct-text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--mfct-gold)' }}></span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-dark-green)' }}>
              {tr('पारदर्शी सामुदायिक एस्क्रो', 'شفاف کمیونٹی اسکرو', 'Transparent Community Escrow')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--mfct-dark-green)' }}>
            {step === 3
              ? tr('दान सफल! 🎉', 'عطیہ کامیاب! 🎉', 'Donation Successful! 🎉')
              : tr('सत्यापित दान करें', 'تصدیق شدہ عطیہ دیں', 'Make a Verified Donation')}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--mfct-text-muted)' }}>
            {tr(
              'आपके दान का 100% सीधे सत्यापित लाभार्थियों तक पहुंचता है।',
              'آپ کے عطیہ کا 100% براہ راست تصدیق شدہ مستحقین تک پہنچتا ہے۔',
              '100% of your donation directly reaches verified beneficiaries.'
            )}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">

            {/* Campaign Loading Skeleton */}
            {campaignsLoading && (
              <div className="space-y-3 animate-pulse">
                {/* Skeleton: outside community toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: 'rgba(200,168,75,0.15)' }} />
                    <div className="space-y-1.5">
                      <div className="h-3 w-36 rounded-md" style={{ background: 'rgba(200,168,75,0.2)' }} />
                      <div className="h-2.5 w-52 rounded-md" style={{ background: 'rgba(200,168,75,0.12)' }} />
                    </div>
                  </div>
                  <div className="w-11 h-6 rounded-full shrink-0" style={{ background: 'rgba(200,168,75,0.15)' }} />
                </div>

                {/* Skeleton: campaign select box */}
                <div className="space-y-2">
                  <div className="h-3 w-44 rounded-md" style={{ background: 'rgba(10,46,29,0.12)' }} />
                  <div className="h-12 w-full rounded-xl" style={{ background: 'rgba(10,46,29,0.08)', border: '1px solid var(--mfct-border)' }} />
                </div>

                {/* Skeleton: category pills */}
                <div className="space-y-2">
                  <div className="h-3 w-40 rounded-md" style={{ background: 'rgba(10,46,29,0.12)' }} />
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-2xl" style={{ background: 'rgba(10,46,29,0.07)', border: '1px solid var(--mfct-border)' }} />
                    ))}
                  </div>
                </div>

                {/* Skeleton: amount buttons */}
                <div className="space-y-2">
                  <div className="h-3 w-44 rounded-md" style={{ background: 'rgba(10,46,29,0.12)' }} />
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-11 rounded-xl" style={{ background: 'rgba(10,46,29,0.07)', border: '1px solid var(--mfct-border)' }} />
                    ))}
                  </div>
                  <div className="h-10 w-full rounded-xl" style={{ background: 'rgba(10,46,29,0.07)', border: '1px solid var(--mfct-border)' }} />
                </div>

                {/* Skeleton: proceed button */}
                <div className="h-14 w-full rounded-2xl" style={{ background: 'rgba(200,168,75,0.25)' }} />
              </div>
            )}

            {!campaignsLoading && (
              <>

            {/* Help Outside Community Toggle - hidden when selecting campaign from All Campaigns outside community */}
            {showOutsideCommunityToggle && (
              <div
                className="flex items-center justify-between p-3.5 rounded-2xl transition-all"
                style={{
                  background: isOutsideCommunity ? 'rgba(10,46,29,0.06)' : 'var(--mfct-warm-bg)',
                  border: isOutsideCommunity ? '1.5px solid var(--mfct-gold)' : '1px solid var(--mfct-border)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl shrink-0"
                    style={{
                      background: isOutsideCommunity ? 'var(--mfct-dark-green)' : 'rgba(200,168,75,0.15)',
                      color: isOutsideCommunity ? '#fff' : 'var(--mfct-dark-green)'
                    }}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold" style={{ color: 'var(--mfct-dark-green)' }}>
                        {tr('समुदाय से बाहर सहायता करें', 'کمیونٹی سے باہر امداد', 'Help Outside Community')}
                      </h4>
                      {isOutsideCommunity && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {tr('स्वतः चयनित ✓', 'خودکار منتخب ✓', 'Auto-Selected ✓')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--mfct-text-muted)' }}>
                      {isOutsideCommunity
                        ? tr(
                          'बाहरी समुदाय सहायता सक्षम: अभियान ट्रस्ट द्वारा स्वतः चयनित है।',
                          'بیرونی کمیونٹی امداد فعال: مہم ٹرسٹ کے ذریعے خود بخود منتخب ہے۔',
                          'Outside assistance enabled: Campaign is automatically selected by Trust.'
                        )
                        : tr(
                          'अन्यथा अभियान मैन्युअली अपने शहर/समुदाय से चुनें।',
                          'بصورت دیگر अपने شہر/کمیونٹی کی مہم دستی طور پر منتخب کریں۔',
                          'Otherwise select campaign manually from your city/community.'
                        )}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={isOutsideCommunity}
                    onChange={(e) => handleToggleOutsideCommunity(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style={{ background: isOutsideCommunity ? 'var(--mfct-dark-green)' : '#cbd5e1' }}
                  ></div>
                </label>
              </div>
            )}

            {/* Target Campaign Selection / Auto-Selected Display */}
            {isOutsideCommunity ? (
              <div className="p-4 rounded-2xl border" style={{ background: 'rgba(10,46,29,0.04)', borderColor: 'var(--mfct-gold)' }}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {tr('लक्षित अभियान (स्वतः चयनित):', 'ہدف مہم (خودکار منتخب):', 'Target Campaign (Auto-Selected):')}
                  </span>
                  {activeCampaign?.city && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200" style={{ color: 'var(--mfct-dark-green)' }}>
                      {tr('शहर', 'شہر', 'City')}: {activeCampaign.city}
                    </span>
                  )}
                </div>
                <span className="text-sm font-extrabold block truncate" style={{ color: 'var(--mfct-dark-green)' }}>
                  {dynamicActiveTitle || translateCampaignTitle(activeCampaign?.title, language)}
                </span>
                {activeCampaign?.communityName && (
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {tr('समुदाय:', 'کمیونٹی:', 'Community:')} {activeCampaign.communityName}
                  </span>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mfct-dark-green)' }}>
                    {tr('2. लक्षित अभियान चुनें', '2. ہدف مہم منتخب کریں', '2. Select Target Campaign')}
                  </label>
                  {userCity && isCampaignInUserCity ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {tr('आपका शहर:', 'آپ کا شہر:', 'Your City:')} {userCity}
                    </span>
                  ) : activeCampaign?.city ? (
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {tr('शहर:', 'شہر:', 'City:')} {activeCampaign.city.trim()}
                    </span>
                  ) : null}
                </div>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => handleSelectCampaign(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm font-medium transition-all outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                >
                  {manualCampaigns.map((c) => {
                    const cCity = c.city ? c.city.trim() : (c.communityName ? c.communityName.trim() : '');
                    return (
                      <option key={c.id} value={c.id}>
                        {translatedTitles[c.id] || translateCampaignTitle(c.title, language)}
                        {cCity ? ` — (${tr('शहर', 'شہر', 'City')}: ${cCity})` : ''}
                        {c.isZakatEligible ? ` (${tr('ज़कात पात्र ✓', 'زکوٰۃ اہل ✓', 'Zakat Eligible ✓')})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--mfct-dark-green)' }}>
                {tr('1. दान का प्रकार चुनें', '1. عطیہ کی قسم منتخب کریں', '1. Select Donation Type')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    'General',
                    'Sadaqah',
                    'Zakat',
                    'Fitra',
                  ] as DonationCategory[]
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (cat === 'Zakat' && activeCampaign && !activeCampaign.isZakatEligible) {
                        const zakatCamp = campaigns.find((c) => c.isZakatEligible);
                        if (zakatCamp) setSelectedCampaignId(zakatCamp.id);
                      }
                    }}
                    className="cursor-pointer py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between"
                    style={selectedCategory === cat ? {
                      background: 'var(--mfct-dark-green)',
                      color: '#fff',
                      borderColor: 'var(--mfct-gold)',
                      boxShadow: 'var(--shadow-card)'
                    } : {
                      background: 'var(--mfct-warm-bg)',
                      color: 'var(--mfct-text-dark)',
                      borderColor: 'var(--mfct-border)'
                    }}
                  >
                    <span>{getCategoryLabel(cat)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--mfct-dark-green)' }}>
                {tr('3. \u0930\u093E\u0936\u093F \u091a\u0941\u0928\u0947\u0902 (INR \u20B9)', '3. \u0631\u0642\u0645 \u0645\u0646\u062A\u062E\u0628 \u06A9\u0631\u06CC\u06BA (INR \u20B9)', '3. Choose Amount (INR \u20B9)')}
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[500, 1000, 2500, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAmountClick(val)}
                    className="cursor-pointer py-3 rounded-xl font-bold text-sm border transition-all"
                    style={amount === val && !customAmount ? {
                      background: 'var(--mfct-dark-green)', color: '#fff', borderColor: 'var(--mfct-gold)'
                    } : {
                      background: 'var(--mfct-warm-bg)', color: 'var(--mfct-dark-green)', borderColor: 'var(--mfct-border)'
                    }}
                  >
                    {'\u20B9'}{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 font-bold" style={{ color: 'var(--mfct-gold)' }}>{'\u20B9'}</span>
                <input
                  type="number"
                  placeholder={tr('\u0907\u091a\u094D\u091B\u093E\u0928\u0941\u0938\u093E\u0930 \u0930\u093E\u0936\u093F \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902...', '\u0627\u067E\u0646\u06CC \u0645\u0631\u0636\u06CC \u06A9\u06CC \u0631\u0642\u0645 \u062F\u0631\u062C \u06A9\u0631\u06CC\u06BA...', 'Enter custom amount...')}
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>
            </div>
            {selectedCategory === 'Zakat' && (
              <ZakatWakalahForm
                donorName={donorName}
                setDonorName={setDonorName}
                guardianName={zakatGuardianName}
                setGuardianName={setZakatGuardianName}
                address={zakatAddress}
                setAddress={setZakatAddress}
                mobile={zakatMobile}
                setMobile={setZakatMobile}
                amount={amount}
                customAmount={customAmount}
                onAmountClick={handleAmountClick}
                onCustomAmountChange={handleCustomAmountChange}
                amountInWords={zakatAmountWords}
                setAmountInWords={setZakatAmountWords}
                isAgreed={zakatAgreed}
                setIsAgreed={setZakatAgreed}
                campaigns={manualCampaigns}
                selectedCampaignId={selectedCampaignId}
                setSelectedCampaignId={handleSelectCampaign}
                translatedTitles={translatedTitles}
                onProceed={handleProceedToPayment}
              />
            )}

            {/* Proceed Step 1 Button */}
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="mfct-btn-gold cursor-pointer w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
            >
              <span>{tr('\u092D\u0941\u0917\u0924\u093E\u0928 \u0939\u0947\u0924\u0941 \u0906\u0917\u0947 \u092C\u0922\u093C\u0947\u0902', '\u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC \u06A9\u06D2 \u0644\u0626\u06D2 \u0622\u06AF\u06D2 \u0628\u0691\u06BE\u06CC\u06BA', 'Proceed to Payment')} ({'\u20B9'}{amount.toLocaleString('en-IN')})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
          )}

          </div>
        )}

        {step === 2 && activeCampaign && (
          <form onSubmit={handleSubmitPayment} className="space-y-6">
            <div className="p-4 rounded-2xl flex items-center justify-between text-sm" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
              <div>
                <span className="text-xs block" style={{ color: 'var(--mfct-text-muted)' }}>{tr('चयनित अभियान:', 'منتخب مہم:', 'Selected Campaign:')}</span>
                <span className="font-bold truncate max-w-[280px] block" style={{ color: 'var(--mfct-dark-green)' }}>
                  {dynamicActiveTitle || translateCampaignTitle(activeCampaign.title, language)}
                  {activeCampaign.city ? ` — (${activeCampaign.city})` : ''}
                </span>
                {isOutsideCommunity && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1 inline-block">
                    {tr('बाहरी समुदाय सहायता', 'بیرونی کمیونٹی امداد', 'Outside Community Relief')}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs block" style={{ color: 'var(--mfct-text-muted)' }}>{tr('कुल राशि:', 'کل رقم:', 'Total Amount:')}</span>
                <span className="font-bold text-lg" style={{ color: 'var(--mfct-dark-green)' }}>₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Zakat Wakalah confirmation badge */}
            {selectedCategory === 'Zakat' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs font-bold text-amber-950">
                <FileCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {tr(
                    'ज़कात वकालात वचनबद्धता अधिकृत ✓ (वकील/अमीन: MFCT)',
                    'زکوٰۃ وکالت اقرار نامہ مجاز ✓ (وکیل/امین: MFCT)',
                    'Zakat Wakalah Undertaking Authorized ✓ (Wakil/Amin: MFCT)'
                  )}
                </span>
              </div>
            )}

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: 'var(--mfct-warm-bg-2)', border: '1px solid var(--mfct-border)' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className="cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all"
                style={paymentMethod === 'UPI' ? { background: 'var(--mfct-dark-green)', color: '#fff' } : { color: 'var(--mfct-text-muted)' }}
              >
                {tr('तत्काल यूपीआई / क्यूआर स्कैन', 'فوری یو پی آئی / کیو آر اسکین', 'Instant UPI / QR Scan')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className="cursor-pointer py-2.5 rounded-xl text-xs font-bold transition-all"
                style={paymentMethod === 'Bank Transfer' ? { background: 'var(--mfct-dark-green)', color: '#fff' } : { color: 'var(--mfct-text-muted)' }}
              >
                {tr('प्रत्यक्ष बैंक NEFT / RTGS', 'براہ راست بینک NEFT / RTGS', 'Direct Bank NEFT / RTGS')}
              </button>
            </div>

            {paymentMethod === 'UPI' ? (
              <div className="p-6 text-white rounded-3xl text-center space-y-4 shadow-xl" style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d2017 100%)', border: '1px solid rgba(200,168,75,0.3)' }}>
                <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                  {accountDetails?.qr_code_url ? (
                    <img src={accountDetails.qr_code_url} alt="QR Code" className="w-36 h-36 object-contain mx-auto" />
                  ) : (
                    <QrCode className="w-36 h-36 mx-auto" style={{ color: 'var(--mfct-dark-green)' }} />
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--mfct-gold)' }}>{tr('सीधे एस्क्रो के लिए UPI ID', 'براہ راست اسکرو کے لیے یو پی آئی آئی ڈی', 'UPI ID for Direct Escrow')}</p>
                  <p className="font-mono text-white font-bold text-lg select-all">
                    {accountDetails?.upi_id || 'mfct@okicici'}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {tr(
                      'Google Pay, PhonePe, Paytm या BHIM UPI द्वारा स्कैन करें',
                      'Google Pay, PhonePe, Paytm یا BHIM ایپ سے اسکین کریں',
                      'Scan using Google Pay, PhonePe, Paytm, or BHIM UPI'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 text-white rounded-3xl space-y-3 text-xs font-mono" style={{ background: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span style={{ color: 'rgba(200,168,75,0.8)' }}>{tr('बैंक का नाम:', 'بینک کا نام:', 'Bank Name:')}</span>
                  <span className="text-white">{accountDetails?.bank_name || 'ICICI Bank Ltd'}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span style={{ color: 'rgba(200,168,75,0.8)' }}>{tr('खाता संख्या:', 'اکاؤنٹ نمبر:', 'Account Number:')}</span>
                  <span className="font-bold select-all" style={{ color: 'var(--mfct-gold)' }}>{accountDetails?.account_number || '000405018892'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(200,168,75,0.8)' }}>{tr('IFSC कोड:', 'آئی ایف ایس سی کوڈ:', 'IFSC Code:')}</span>
                  <span className="font-bold select-all" style={{ color: 'var(--mfct-gold)' }}>{accountDetails?.ifsc_code || 'ICIC0000004'}</span>
                </div>
              </div>
            )}

            {/* UTR and Receipt Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('आपका पूरा नाम', 'آپ کا پورا نام', 'Your Full Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm font-medium outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('12 अंकों का बैंक UTR / संदर्भ संख्या', '12 ہندسوں کا بینک UTR / ٹرانزیکشن نمبر', '12-Digit Bank UTR / Transaction Ref No')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={tr('उदा. 420199381029', 'مثال: 420199381029', 'e.g. 420199381029')}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full p-3 rounded-xl font-mono text-sm font-semibold outline-none"
                  style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-dark-green)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mfct-dark-green)' }}>
                  {tr('या भुगतान स्क्रीनशॉट अपलोड करें', 'یا ادائیگی کی رسید اپلوڈ کریں', 'Or Upload Payment Screenshot')} <span className="text-red-500">*</span>
                </label>
                <label
                  className="p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center"
                  style={screenshotUploaded ? {
                    background: 'rgba(200,168,75,0.12)', borderColor: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)'
                  } : {
                    background: 'var(--mfct-warm-bg)', borderColor: 'var(--mfct-border)', color: 'var(--mfct-text-muted)'
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { setScreenshotFile(file); setScreenshotUploaded(true); }
                    }}
                  />
                  <Upload className="w-5 h-5 mb-1" style={{ color: 'var(--mfct-gold)' }} />
                  <span className="text-xs font-bold">
                    {screenshotUploaded
                      ? `✓ ${screenshotFile?.name ?? tr('स्क्रीनशॉट संलग्न है', 'رسید منسلک ہے', 'Screenshot Attached')}`
                      : tr('भुगतान स्क्रीनशॉट अपलोड करने के लिए क्लिक करें', 'ادائیگی کی رسید اپلوڈ کریں', 'Click to upload payment screenshot')}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="cursor-pointer py-3.5 px-5 rounded-2xl font-bold text-xs transition-colors"
                style={{ background: 'var(--mfct-warm-bg-2)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-border)' }}
              >
                {tr('वापस', 'واپس', 'Back')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="mfct-btn-gold cursor-pointer flex-1 py-4 rounded-2xl disabled:opacity-60 font-bold text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  tr('भुगतान जमा करें और रसीद प्राप्त करें', 'ادائیگی جمع کروائیں اور رسید حاصل کریں', 'Submit Payment & Generate Receipt')
                )}
              </button>
            </div>
          </form>
        )}

        {step === 3 && createdDonation && (
          <div className="text-center py-4 space-y-6 animate-fade-in">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md"
              style={{ background: 'rgba(200,168,75,0.2)', border: '2px solid var(--mfct-gold)', color: 'var(--mfct-dark-green)' }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--mfct-gold)' }} />
            </div>

            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--mfct-dark-green)' }}>
                {tr('धन्यवाद! आपका दान प्राप्त हुआ', 'شکریہ! آپ کا عطیہ موصول ہوا', 'JazakAllah! Donation Recorded')}
              </h3>
              <p className="text-sm mt-1 max-w-md mx-auto" style={{ color: 'var(--mfct-text-muted)' }}>
                {language === 'hi' ? (
                  <>आपकी <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>₹{createdDonation.amountINR.toLocaleString('en-IN')}</span> की दान राशि एस्क्रो के तहत दर्ज कर ली गई है और कर-छूट रसीद तैयार कर दी गई है।</>
                ) : language === 'ur' ? (
                  <>آپ کا <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>₹{createdDonation.amountINR.toLocaleString('en-IN')}</span> کا عطیہ موصول ہو گیا ہے اور ٹیکس چھوٹ رسید تیار کر دی گئی ہے۔</>
                ) : (
                  <>Your donation of <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>₹{createdDonation.amountINR.toLocaleString('en-IN')}</span> has been submitted under escrow and a tax-exempt receipt has been generated.</>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl text-left text-xs space-y-2" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('रसीद संख्या:', 'رسید نمبر:', 'Receipt No:')}</span>
                <span className="font-bold font-mono" style={{ color: 'var(--mfct-dark-green)' }}>{createdDonation.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('यूटीआर संदर्भ:', 'یو ٹی آر ریفرنس:', 'UTR Reference:')}</span>
                <span className="font-mono" style={{ color: 'var(--mfct-dark-green)' }}>{createdDonation.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('श्रेणी:', 'کیٹیگری:', 'Category:')}</span>
                <span className="font-semibold" style={{ color: 'var(--mfct-dark-green)' }}>{getCategoryLabel(createdDonation.category)}</span>
              </div>
              {createdDonation.isOutsideCommunity && (
                <div className="flex justify-between border-t pt-2" style={{ borderColor: 'rgba(200,168,75,0.2)' }}>
                  <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('सहायता क्षेत्र:', 'امداد کا علاقہ:', 'Relief Scope:')}</span>
                  <span className="font-semibold text-emerald-800">{tr('बाहरी समुदाय', 'بیرونی کمیونٹی', 'Outside Community')}</span>
                </div>
              )}
              {createdDonation.category === 'Zakat' && createdDonation.wakalahInformation?.some(w => w.isAccepted) && (
                <div className="flex justify-between border-t pt-2" style={{ borderColor: 'rgba(200,168,75,0.2)' }}>
                  <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('वकालात स्थिति:', 'وکالت کی حیثیت:', 'Wakalah Status:')}</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    {tr('वकील/अमीन अधिकृत ✓', 'وکیل/امین مجاز ✓', 'Wakalah Executed ✓')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="mfct-btn-dark cursor-pointer flex-1 py-3.5 rounded-2xl font-bold text-sm"
              >
                {tr('मुख्य मंच पर वापस जाएं', 'پلیٹ فارم پر واپس جائیں', 'Return to Platform')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
