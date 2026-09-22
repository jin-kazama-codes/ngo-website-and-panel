import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DonationCategory, Campaign, Community } from '../../types';
import { Plus, Upload, ArrowLeft, Trash2, Image as ImageIcon, Building2, MapPin } from 'lucide-react';
import { useAppState } from '../../providers/AppStateProvider';
import { useLanguage } from '../../context/LanguageContext';
import { getCommunities } from '../../services/communityService';
import { createCampaign, updateCampaign, getCategoryFallbackImage, CATEGORY_FALLBACK_IMAGES, extractImages } from '../../services/campaignService';
import { uploadImage } from '../../lib/storage';
import { autoTranslateFullCampaign, setMemoryCache } from '../../lib/autoTranslate';
import { translateCity, translateCommunityName } from '../../lib/translateEntity';

interface CreateCampaignTabProps {
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
  initialCampaign?: Campaign;
}

interface SelectedPhoto {
  id: string;
  previewUrl: string;
  file?: File;
  title?: string;
}

export const CreateCampaignTab: React.FC<CreateCampaignTabProps> = ({ onClose, onCreate, initialCampaign }) => {
  const { activeUser } = useAppState();
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [title, setTitle] = useState(initialCampaign?.title || '');
  const [category, setCategory] = useState<DonationCategory>(initialCampaign?.category || 'Medical');
  const [beneficiaryName, setBeneficiaryName] = useState(initialCampaign?.beneficiaryName || '');
  const [beneficiaryRelation, setBeneficiaryRelation] = useState(initialCampaign?.beneficiaryRelation || '');
  const [goalINR, setGoalINR] = useState(initialCampaign?.goalINR?.toString() || '250000');
  const [story, setStory] = useState(initialCampaign?.story || '');
  const [isZakatEligible, setIsZakatEligible] = useState(initialCampaign?.isZakatEligible ?? true);
  const [isSadqaEligible, setIsSadqaEligible] = useState(initialCampaign?.isSadqaEligible ?? false);
  const [isFitrahEligible, setIsFitrahEligible] = useState(initialCampaign?.isFitrahEligible ?? false);
  const [isUrgent, setIsUrgent] = useState(initialCampaign?.isUrgent ?? false);
  const [daysLeft, setDaysLeft] = useState(initialCampaign?.daysLeft ?? 30);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docUploaded, setDocUploaded] = useState(!!initialCampaign?.documents?.length);

  // Initialize selected photos cleanly using extractImages helper
  const [photos, setPhotos] = useState<SelectedPhoto[]>(() => {
    if (!initialCampaign) return [];
    try {
      const { mainImage, galleryImages } = extractImages(initialCampaign as any);
      const all = [mainImage, ...galleryImages].filter(u => u && typeof u === 'string' && !u.startsWith('file://') && !u.startsWith('content://'));
      return all.map((url, idx) => ({
        id: `init_${idx}_${Date.now()}`,
        previewUrl: url,
        title: idx === 0 ? 'Main Cover' : `Image ${idx + 1}`,
      }));
    } catch {
      return [];
    }
  });

  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(initialCampaign?.communityId || '');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getCommunities().then((data) => {
      if (data && data.length > 0) {
        setCommunities(data);
      }
    }).catch(console.error);
  }, []);

  // Active user's city scope
  const userCity = (activeUser?.district || '').trim();

  // Filter communities: only show community belonging to active user's city
  const displayedCommunities = useMemo(() => {
    if (!userCity) {
      return communities.length > 0 ? communities : [];
    }
    const target = userCity.toLowerCase().trim();
    const filtered = communities.filter((c) => {
      const commCity = (c.city || '').toLowerCase().trim();
      const commDistrict = (c.district || '').toLowerCase().trim();
      return commCity === target || commDistrict === target;
    });

    if (filtered.length > 0) {
      return filtered;
    }

    // If no community exists for this city yet, provide a local city chapter
    const cityChapter: Community = {
      id: `comm_${userCity.toLowerCase().replace(/\s+/g, '_')}`,
      name: `${userCity} Community Chapter`,
      city: userCity,
      state: activeUser?.state || 'Uttar Pradesh',
      adminName: activeUser?.name || 'Community Admin',
      adminRoleTitle: 'Community Admin',
      avatar: activeUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      totalMembers: 1,
      activeCampaigns: 0,
      totalRaisedINR: 0,
      healthScore: 100,
      verifiedStatus: 'Verified',
      description: `Local relief chapter for ${userCity}.`,
      establishedYear: new Date().getFullYear(),
      coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    };
    return [cityChapter];
  }, [communities, userCity, activeUser]);

  useEffect(() => {
    if (displayedCommunities.length > 0) {
      const match = displayedCommunities.find(c => c.id === selectedCommunityId);
      if (!match) {
        const initialMatch = initialCampaign?.communityId ? displayedCommunities.find(c => c.id === initialCampaign.communityId) : null;
        setSelectedCommunityId(initialMatch ? initialMatch.id : displayedCommunities[0].id);
      }
    }
  }, [displayedCommunities, selectedCommunityId, initialCampaign]);

  const activeCommunity = displayedCommunities.find((c) => c.id === selectedCommunityId) || displayedCommunities[0];
  const campaignCity = userCity || activeCommunity?.city || activeUser?.city || '';

  // Refs for file inputs — avoids label double-trigger issue in some browsers
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Memory-safe, instant upload handler
  const handlePhotosSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const newPhotos: SelectedPhoto[] = files.map(file => ({
        id: `photo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        previewUrl: URL.createObjectURL(file),
        file,
        title: file.name,
      }));

      setPhotos(prev => [...prev, ...newPhotos]);
    } catch (err) {
      console.error('Photo selection error:', err);
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleMakeCover = (index: number) => {
    setPhotos(prev => {
      const target = prev[index];
      if (!target) return prev;
      const remaining = prev.filter((_, i) => i !== index);
      return [target, ...remaining];
    });
    showToast(tr('मुख्य कवर फोटो सेट की गई', 'مرکزی کور تصویر مقرر کی گئی', 'Set as Main Cover Photo'), 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !beneficiaryName.trim() || !story.trim()) {
      showToast(tr('कृपया शीर्षक, लाभार्थी का नाम और विवरण भरें।', 'براہ کرم عنوان، مستحق का नाम और تفصیل درج کریں۔', 'Please fill out all required campaign details.'), 'error');
      return;
    }
    if (!docUploaded && docFiles.length === 0) {
      showToast(tr('कृपया कम से कम एक दस्तावेज़ या अनुमान संलग्न करें।', 'براہ کرم کم از कम ایک دستاویز منسلک کریں۔', 'Please attach at least one medical estimate or document.'), 'error');
      return;
    }
    setSubmitting(true);

    try {
      const defaultImage = getCategoryFallbackImage(category);

      // Upload selected photos
      const uploadedPhotoUrls: string[] = [];
      for (const p of photos) {
        if (p.file) {
          const url = await uploadImage('campaigns', p.file);
          if (url) uploadedPhotoUrls.push(url);
        } else if (p.previewUrl) {
          uploadedPhotoUrls.push(p.previewUrl);
        }
      }

      const mainImage = uploadedPhotoUrls[0] || defaultImage;
      const galleryImages = uploadedPhotoUrls.slice(1);

      const uploadedDocs = [];
      for (const file of docFiles) {
        const url = await uploadImage('campaigns', file);
        uploadedDocs.push({ title: file.name, url, verifiedBy: 'Community Leader' });
      }

      const existingDocs = initialCampaign?.documents || [];
      const combinedDocs = [...existingDocs, ...uploadedDocs];

      // Automatic background multi-language translation via Groq AI
      autoTranslateFullCampaign(title, beneficiaryName, beneficiaryRelation, story)
        .then((transResult) => {
          if (transResult.hi.title) setMemoryCache(`hi:${title.trim()}`, transResult.hi.title);
          if (transResult.ur.title) setMemoryCache(`ur:${title.trim()}`, transResult.ur.title);
          if (transResult.en.title) setMemoryCache(`en:${title.trim()}`, transResult.en.title);

          if (transResult.hi.story) setMemoryCache(`hi:${story.trim()}`, transResult.hi.story);
          if (transResult.ur.story) setMemoryCache(`ur:${story.trim()}`, transResult.ur.story);
          if (transResult.en.story) setMemoryCache(`en:${story.trim()}`, transResult.en.story);

          if (transResult.hi.beneficiaryName) setMemoryCache(`hi:${beneficiaryName.trim()}`, transResult.hi.beneficiaryName);
          if (transResult.ur.beneficiaryName) setMemoryCache(`ur:${beneficiaryName.trim()}`, transResult.ur.beneficiaryName);
          if (transResult.en.beneficiaryName) setMemoryCache(`en:${beneficiaryName.trim()}`, transResult.en.beneficiaryName);
        })
        .catch((err) => console.warn('Background translation notice:', err));

      const isAdmin = activeUser?.role === 'super_admin' || activeUser?.role === 'executive_admin' || !activeUser;

      if (initialCampaign) {
        const updateData: Partial<Campaign> = {
          title,
          category,
          communityId: activeCommunity.id,
          communityName: activeCommunity.name,
          city: campaignCity,
          beneficiaryName,
          beneficiaryRelation,
          goalINR: parseInt(goalINR, 10) || initialCampaign.goalINR,
          isZakatEligible,
          isSadqaEligible,
          isFitrahEligible,
          isUrgent,
          mainImage,
          galleryImages,
          story,
          daysLeft: daysLeft,
          documents: combinedDocs.length > 0 ? combinedDocs : [{ title: 'Community document', url: '#', verifiedBy: 'Community Leader' }],
          createdBy: initialCampaign.createdBy || activeUser?.id || 'admin',
          createdDate: initialCampaign.createdDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
        const saved = await updateCampaign(initialCampaign.id, updateData);
        showToast(tr('अभियान सफलतापूर्वक अपडेट हो गया!', 'مہم کامیابی سے اپ ڈیٹ ہو گئی!', 'Campaign updated successfully!'), 'success');
        setTimeout(() => {
          onCreate({ ...initialCampaign, ...updateData, ...saved });
        }, 1200);
      } else {
        const createdDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const createdBy = activeUser?.id || 'admin';

        const newCamp: Omit<Campaign, 'id'> = {
          title,
          category,
          communityId: activeCommunity.id,
          communityName: activeCommunity.name,
          city: campaignCity,
          beneficiaryName,
          beneficiaryRelation,
          goalINR: parseInt(goalINR, 10) || 100000,
          raisedINR: 0,
          donorsCount: 0,
          daysLeft: daysLeft,
          isVerified: isAdmin,
          isZakatEligible,
          isSadqaEligible,
          isFitrahEligible,
          isUrgent,
          mainImage,
          galleryImages,
          story,
          documents: combinedDocs.length > 0 ? combinedDocs : [{ title: 'Community document', url: '#', verifiedBy: 'Community Leader' }],
          createdBy,
          createdDate,
          status: isAdmin ? 'active' : 'pending',
        };

        const saved = await createCampaign(newCamp);
        showToast(tr('सत्यापित समुदाय अभियान सफलतापूर्वक बन गया!', 'تصدیق شدہ کمیونٹی مہم کامیابی سے بن گئی!', 'Campaign created successfully!'), 'success');
        setTimeout(() => {
          onCreate(saved);
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Campaign save notice: ${err?.message || 'Saved successfully'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {initialCampaign ? tr('अभियान संपादित करें', 'مہم میں ترمیم کریں', 'Edit Verified Campaign') : tr('नया समुदाय अभियान बनाएं', 'نئی تصدیق شدہ مہم بنائیں', 'Create Community Campaign')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tr('सभी विवरण निष्पक्ष जांच और समुदाय अनुमोदन के लिए दर्ज करें।', 'تمام تفصیلات شفافیت اور کمیونٹی منظوری کے لیے درج کریں۔', 'Enter all details for transparent community relief verification.')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 text-xs">
            {tr('अभियान शीर्षक', 'مہم کا عنوان', 'Campaign Title')}
          </label>
          <input
            type="text"
            required
            placeholder={tr('उदा. मास्टर अयान के लिए तात्कालिक ओपन हार्ट सर्जरी', 'مثلاً ماسٹر ایان کے دل کے فوری آپریشن کے لیے', 'e.g. Urgent Open Heart Surgery Support for Master Ayaan')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 text-xs">
              {tr('श्रेणी', 'زمرہ', 'Category')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DonationCategory)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Medical">{tr('चिकित्सा सहायता (Medical)', 'طبی امداد', 'Medical')}</option>
              <option value="Food">{tr('खाद्य व राशन (Food)', 'خوراک و راشن', 'Food & Ration')}</option>
              <option value="Education">{tr('शिक्षा (Education)', 'تعلیم', 'Education')}</option>
              <option value="Marriage">{tr('निकाह शगुन (Marriage)', 'نکاح شگون', 'Marriage')}</option>
              <option value="Janazah">{tr('जनाज़ा सहायता (Janazah)', 'جنازہ امداد', 'Janazah Assistance')}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 text-xs">
              {tr('आवश्यक कुल धनराशि (₹ INR)', 'مطلوبہ کل رقم (روپے)', 'Required Goal Amount (INR ₹)')}
            </label>
            <input
              type="number"
              required
              min="1000"
              value={goalINR}
              onChange={(e) => setGoalINR(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 text-xs">
              {tr('अभियान अवधि (दिन)', 'مہم کی مدت (دن)', 'Campaign Duration (Days)')}
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                max="365"
                value={daysLeft}
                onChange={(e) => setDaysLeft(Math.max(1, parseInt(e.target.value, 10) || 30))}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none pr-14"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                {tr('दिन', 'دن', 'days')}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {tr('दिन स्वचालित रूप से घटते हैं', 'دن خود بخود کم ہوتے ہیں', 'Days auto-countdown from creation date')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 text-xs">
              {tr('लाभार्थी का नाम', 'مستحق کا نام', 'Beneficiary Name')}
            </label>
            <input
              type="text"
              required
              placeholder={tr('उदा. मोहम्मद राशिद', 'مثلاً محمد راشد', 'e.g. Mohammad Rashid')}
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 text-xs">
              {tr('लाभार्थी से संबंध', 'مستحق سے رشتہ', 'Relationship with Beneficiary')}
            </label>
            <input
              type="text"
              placeholder={tr('उदा. स्वयं / पिता / पुत्र', 'مثلاً خود / والد / بیٹا', 'e.g. Self / Father / Son')}
              value={beneficiaryRelation}
              onChange={(e) => setBeneficiaryRelation(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={isZakatEligible}
              onChange={(e) => setIsZakatEligible(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-base">
                {tr('ज़कात पात्र (100% Zakat)', 'زکوٰۃ کا اہل', 'Zakat Eligible')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {tr('100% शरीयत सम्मत प्रत्यक्ष सहायता', '100% شریعت کے مطابق', '100% Sharia compliant verified cause')}
              </span>
            </div>
          </label>

          <label className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={isSadqaEligible}
              onChange={(e) => setIsSadqaEligible(e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-base">
                {tr('सदका पात्र (Sadqa)', 'صدقہ کا اہل', 'Sadqa Eligible')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {tr('सामान्य सदका व ऐच्छिक दान हेतु', 'عام صدقات اور عطیات', 'Accepts general Sadqa & voluntary charity')}
              </span>
            </div>
          </label>

          <label className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={isFitrahEligible}
              onChange={(e) => setIsFitrahEligible(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-base">
                {tr('फ़ितरा / फ़िद्या (Fitrah)', 'فطرہ / فدیہ', 'Fitrah / Fidyah Eligible')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {tr('रमज़ान फ़ितरा व फ़िद्या राशन वितरण', 'رمضان فطرہ اور فدیہ راشن', 'Eligible for Ramadan Fitrah / Fidyah')}
              </span>
            </div>
          </label>

          <label className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-5 h-5 text-rose-600 rounded cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-base">
                {tr('अति आवश्यक (इमरजेंसी)', 'انتہائی ہنگامی (ارجنٹ)', 'Urgent Priority')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {tr('अस्पताल / जीवन रक्षा हेतु तत्काल', 'ہسپتال / جان بچانے کے لیے فوری', 'Immediate hospital / life threat')}
              </span>
            </div>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
              {tr('समुदाय चुनें', 'کمیونٹی منتخب کریں', 'Community')}
            </label>
            {campaignCity && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {tr('शहर:', 'شہر:', 'City:')} {translateCity(campaignCity, language)}
              </span>
            )}
          </div>
          <select
            value={selectedCommunityId}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            {displayedCommunities.map((c) => (
              <option key={c.id} value={c.id}>
                {translateCommunityName(c.name, language)} ({translateCity(c.city || campaignCity, language)})
              </option>
            ))}
          </select>

          {/* Community Location display */}
          <div className="mt-2.5 flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold truncate">{translateCommunityName(activeCommunity.name, language)}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg shrink-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{tr('स्थान:', 'مقام:', 'Location:')} {translateCity(activeCommunity.city || campaignCity, language)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 text-xs">
            {tr('विस्तृत कारण एवं विवरण', 'تفصیلی روداد اور وضاحت', 'Detailed Case Story & Explanation')}
          </label>
          <textarea
            rows={5}
            required
            placeholder={tr('बताएं कि इस लाभार्थी को समुदाय की तत्काल सहायता की आवश्यकता क्यों है...', 'وضاحت کریں کہ اس مستحق کو کمیونٹی کی فوری مدد کی کیوں ضرورت ہے...', 'Describe why this beneficiary urgently needs community help...')}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          ></textarea>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
              {tr('अभियान की मुख्य तस्वीर (वैकल्पिक)', 'مہم کی مرکزی تصویر (اختیاری)', 'CAMPAIGN MAIN IMAGE (OPTIONAL)')}
            </label>
            {photos.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-600">
                {photos.length} {tr('तस्वीर(ें) चुनी गईं', 'تصاویر منتخب کی گئیں', 'image(s) selected')}
              </span>
            )}
          </div>

          {/* Hidden file input controlled via ref — prevents double-dialog on label click */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handlePhotosSelected}
          />
          <div
            role="button"
            tabIndex={0}
            onClick={() => photoInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') photoInputRef.current?.click(); }}
            className="p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Upload className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {photos.length > 0
                ? tr(`✓ ${photos.length} तस्वीर(ें) चुनी गईं (+ और जोड़ें)`, `✓ ${photos.length} تصاویر منتخب کی گئیں`, `✓ ${photos.length} image(s) selected (+ Add more)`)
                : tr('तस्वीर अपलोड करने के लिए क्लिक करें', 'تصویر اپلوڈ کرنے کے لیے کلک کریں', 'Click to upload campaign images')}
            </span>
            <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP (Multiple images supported)</span>
          </div>

          {photos.length > 0 && (
            <div className="flex items-center gap-3 mt-3 flex-wrap p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {photos.map((p, idx) => (
                <div key={p.id} className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group shadow-sm bg-slate-900">
                  <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                  {idx === 0 ? (
                    <div className="absolute top-0 left-0 bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-br">
                      ★ Cover
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMakeCover(idx)}
                      className="absolute bottom-0 inset-x-0 bg-black/75 hover:bg-emerald-600 text-white text-[8px] font-bold py-0.5 text-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Make Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(idx)}
                    className="cursor-pointer absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 text-xs">
            {tr('अस्पताल का बिल / आधार / दस्तावेज़ संलग्न करें *', 'ہسپتال کا بل / آدھار / دستاویزات منسلک کریں *', 'Attach Medical Estimates / Documents *')}
          </label>
          {/* Hidden doc input controlled via ref — prevents double-dialog on label click */}
          <input
            ref={docInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            className="sr-only"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                setDocFiles(prev => [...prev, ...files]);
                setDocUploaded(true);
              }
              if (docInputRef.current) docInputRef.current.value = '';
            }}
          />
          <div
            role="button"
            tabIndex={0}
            onClick={() => docInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') docInputRef.current?.click(); }}
            className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center ${docUploaded || docFiles.length > 0
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
            <span className="text-sm font-bold">
              {docFiles.length > 0
                ? tr(`✓ ${docFiles.length} दस्तावेज़ संलग्न किए गए`, `✓ ${docFiles.length} دستاویزات منسلک ہو گئے`, `✓ ${docFiles.length} file(s) attached`)
                : docUploaded
                  ? tr('✓ दस्तावेज़ संलग्न हैं', '✓ دستاویزات منسلک ہیں', '✓ Documents attached')
                  : tr('अस्पताल का एस्टीमेट या आधार जोड़ें (अधिकतम 1MB)', 'ہسپتال کا تخمینہ یا آدھار منسلک کریں (زیادہ سے زیادہ 1MB)', 'Click to attach hospital estimate / Aadhaar (Max 1MB)')}
            </span>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="py-3.5 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none cursor-pointer"
          >
            {submitting
              ? tr('सुरक्षित किया जा रहा है...', 'محفوظ ہو رہا ہے...', 'Saving Campaign...')
              : initialCampaign
                ? tr('अभियान अपडेट करें', 'مہم اپ ڈیٹ کریں', 'Update Campaign')
                : tr('सत्यापित अभियान प्रकाशित करें', 'تصدیق شدہ مہم شائع کریں', 'Publish Verified Campaign')}
          </button>
        </div>
      </form>
    </div>
  );
};
