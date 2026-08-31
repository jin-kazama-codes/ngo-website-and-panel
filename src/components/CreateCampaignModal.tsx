'use client';

import React, { useState, useEffect } from 'react';
import { DonationCategory, Campaign, Community } from '../types';
import { X, Plus, Upload } from 'lucide-react';
import { useAppState } from '../providers/AppStateProvider';
import { useLanguage } from '../context/LanguageContext';
import { getCommunities } from '../services/communityService';
import { createCampaign, updateCampaign } from '../services/campaignService';
import { uploadImage } from '../lib/storage';
import { autoTranslateFullCampaign, setMemoryCache } from '../lib/autoTranslate';
import { translateCity, translateCommunityName } from '../lib/translateEntity';

interface CreateCampaignModalProps {
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
  initialCampaign?: Campaign;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onClose, onCreate, initialCampaign }) => {
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
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUploaded, setDocUploaded] = useState(!!initialCampaign?.documents?.length);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
        setSelectedCommunityId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  const fallbackCommunity: Community = {
    id: 'comm_bareilly_rohilkhand',
    name: 'Rohilkhand Educational & Nikah Trust',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    adminName: 'Dr. Shakeel Ahmad Usmani',
    adminRoleTitle: 'Community Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    totalMembers: 1820,
    activeCampaigns: 5,
    totalRaisedINR: 4120000,
    healthScore: 97,
    verifiedStatus: 'Verified',
    description: 'Serving underprivileged families in Rohilkhand region.',
    establishedYear: 2019,
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  };

  const activeCommunity = communities.find((c) => c.id === selectedCommunityId) || communities[0] || fallbackCommunity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !beneficiaryName.trim() || !story.trim()) {
      showToast(tr('कृपया सभी आवश्यक विवरण भरें।', 'براہ کرم تمام لازمی خانے پر کریں۔', 'Please fill out all required campaign details.'), 'error');
      return;
    }
    setSubmitting(true);

    try {
      let mainImage = initialCampaign?.mainImage || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80';
      if (imageFile) {
        mainImage = await uploadImage('campaigns', imageFile);
      }

      let docUrl = initialCampaign?.documents?.[0]?.url || '#';
      if (docFile) {
        docUrl = await uploadImage('campaigns', docFile);
      }

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

      if (initialCampaign) {
        const updateData: Partial<Campaign> = {
          title,
          category,
          communityId: activeCommunity.id,
          communityName: activeCommunity.name,
          city: activeCommunity.city,
          beneficiaryName,
          beneficiaryRelation,
          goalINR: parseInt(goalINR, 10) || initialCampaign.goalINR,
          isZakatEligible,
          isSadqaEligible,
          isFitrahEligible,
          isUrgent,
          mainImage,
          story,
          documents: [
            { title: 'Community document', url: docUrl, verifiedBy: 'Community Leader' },
          ],
        };
        await updateCampaign(initialCampaign.id, updateData);
        showToast(tr('अभियान सफलतापूर्वक अपडेट हो गया!', 'مہم کامیابی سے اپ ڈیٹ ہو گئی!', 'Campaign updated successfully!'), 'success');
        setTimeout(() => {
          onCreate({ ...initialCampaign, ...updateData });
        }, 1200);
      } else {
        const newCamp: Omit<Campaign, 'id'> = {
          title,
          category,
          communityId: activeCommunity.id,
          communityName: activeCommunity.name,
          city: activeCommunity.city,
          beneficiaryName,
          beneficiaryRelation,
          goalINR: parseInt(goalINR, 10) || 100000,
          raisedINR: 0,
          donorsCount: 0,
          daysLeft: 30,
          isVerified: false,
          isZakatEligible,
          isSadqaEligible,
          isFitrahEligible,
          isUrgent,
          mainImage,
          story,
          documents: [
            { title: 'Community document', url: docUrl, verifiedBy: 'Community Leader' },
          ],
          createdBy: activeUser.id,
          createdDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'pending',
        };

        const saved = await createCampaign(newCamp);
        showToast(tr('सत्यापित समुदाय अभियान सफलतापूर्वक बन गया!', 'تصدیق شدہ کمیونٹی مہم کامیابی سے بن گئی!', 'Campaign submitted for verification successfully!'), 'success');
        setTimeout(() => {
          onCreate(saved);
        }, 1200);
      }
    } catch (err: any) {
      console.error('Campaign save error:', err);
      showToast(`Campaign save notice: ${err?.message || 'Saved successfully'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        {toast && (
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all z-50 flex items-center gap-2 animate-fade-in ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
            <span>{toast.message}</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> {tr('समुदाय एडमिन', 'کمیونٹی ایڈمن', 'Community Admin')}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {initialCampaign ? tr('अभियान संपादित करें', 'مہم میں ترمیم کریں', 'Edit Campaign') : tr('सत्यापित समुदाय अभियान बनाएं', 'تصدیق شدہ کمیونٹی مہم بنائیں', 'Create Verified Community Campaign')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {initialCampaign 
              ? tr('अभियान का विवरण और लाभार्थी की जानकारी अपडेट करें।', 'مہم کی تفصیلات और مستحق کی معلومات اپ ڈیٹ کریں۔', 'Update campaign details and beneficiary information.') 
              : tr('स्थानीय सदस्यों की सहायता के लिए अभियान विवरण दर्ज करें। लाभार्थी के दस्तावेज़ आवश्यक हैं।', 'مقامی اراکین کی مدد के लिए مہم کی تفصیلات درج کریں۔ مستحق کے دستاویزات درکار ہیں۔', 'Submit cause details for local member support. Requires verified beneficiary documents.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
              {tr('अभियान का शीर्षक / हेडलाइन', 'مہم کا عنوان / ہیڈ لائن', 'Campaign Title / Headline')}
            </label>
            <input
              type="text"
              required
              placeholder={tr('उदा. बरेली में 10 वर्षीय राहुल के दिल का ऑपरेशन', 'مثلاً بریلی میں 10 سالہ راہل کے دل کا آپریشن', 'e.g. Heart Surgery for 10-Year-Old Rahul in Bareilly')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
                {tr('श्रेणी', 'کیٹیگری', 'Category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DonationCategory)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Medical">{tr('चिकित्सा सहायता', 'طبی امداد', 'Medical Aid')}</option>
                <option value="Education">{tr('शिक्षा सहायता', 'تعلیمی امداد', 'Education Aid')}</option>
                <option value="Marriage">{tr('विवाह सहायता', 'نکاح معاونت', 'Marriage Aid')}</option>
                <option value="Food">{tr('राशन / भोजन राहत', 'राशन و خوراک', 'Food Relief')}</option>
                <option value="Janazah">{tr('जनाज़ा व कफ़न सहायता', 'جنازہ و تجہیز و تکفین', 'Janazah Aid')}</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
                {tr('आवश्यक लक्ष्य राशि (₹)', 'مطلوبہ ہدف کی رقم (₹)', 'Required Goal Amount (INR ₹)')}
              </label>
              <input
                type="number"
                required
                value={goalINR}
                onChange={(e) => setGoalINR(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
                {tr('लाभार्थी का नाम', 'مستحق کا نام', 'Beneficiary Name')}
              </label>
              <input
                type="text"
                required
                placeholder={tr('उदा. मास्टर राहुल', 'مثلاً ماسٹر راہل', 'e.g. Master Rahul')}
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
                {tr('लाभार्थी का संबंध / विवरण', 'مستحق کا رشتہ / تفصیل', 'Beneficiary Relation')}
              </label>
              <input
                type="text"
                required
                placeholder={tr('उदा. दिहाड़ी मजदूर का पुत्र', 'مثلاً دیہاڑی دار مزدور کا بیٹا', 'e.g. Son of Daily Wage Labourer')}
                value={beneficiaryRelation}
                onChange={(e) => setBeneficiaryRelation(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
              {tr('विस्तृत कारण एवं विवरण', 'تفصیلی روداد اور وضاحت', 'Detailed Case Story & Explanation')}
            </label>
            <textarea
              rows={4}
              required
              placeholder={tr('बताएं कि इस लाभार्थी को समुदाय की तत्काल सहायता की आवश्यकता क्यों है...', 'وضاحت کریں کہ اس مستحق کو کمیونٹی کی فوری مدد की क्यों ضرورت ہے...', 'Describe why this beneficiary urgently needs community help...')}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={isZakatEligible}
                onChange={(e) => setIsZakatEligible(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-xs">
                  {tr('ज़कात पात्र', 'زکوٰۃ کے اہل', 'Zakat Eligible')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {tr('ज़कात नियमों के अनुरूप', 'شرعی زکوٰۃ کے شرائط پر پورا اترتا ہے', 'Meets Zakat compliance rules')}
                </span>
              </div>
            </label>

            <label className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={isSadqaEligible}
                onChange={(e) => setIsSadqaEligible(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-xs">
                  {tr('सदका पात्र', 'صدقہ کے اہل', 'Sadqa Eligible')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {tr('सामान्य सदका व खैरात स्वीकार्य', 'عام صدقہ اور خیرات کے لیے درست', 'Accepts general Sadaqah & charity')}
                </span>
              </div>
            </label>

            <label className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={isFitrahEligible}
                onChange={(e) => setIsFitrahEligible(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-xs">
                  {tr('फ़ितरा पात्र', 'فطرہ کے اہل', 'Fitrah Eligible')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {tr('ईद-उल-फ़ित्र फ़ितरा व फ़िद्या पात्र', 'صدقۃ الفطر اور فدیہ کے مستحقین کے لیے', 'Eligible for Fitrah & Fidya contributions')}
                </span>
              </div>
            </label>

            <label className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-xs">
                  {tr('अति आवश्यक (इमरजेंसी)', 'انتہائی ہنگامی (ارجنٹ)', 'Urgent Priority')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {tr('अस्पताल / जीवन रक्षा हेतु तत्काल', 'ہسپتال / جان بچانے کے لیے فوری', 'Immediate hospital / life threat')}
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
              {tr('समुदाय चुनें', 'کمیونٹی منتخب کریں', 'Community')}
            </label>
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {translateCommunityName(c.name, language)} ({translateCity(c.city, language)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
              {tr('अभियान की मुख्य तस्वीर (वैकल्पिक)', 'مہم کی مرکزی تصویر (اختیاری)', 'Campaign Main Image (optional)')}
            </label>
            <label className="p-3.5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              <Upload className="w-4 h-4 mx-auto mb-1 text-slate-500" />
              <span className="text-xs font-bold">
                {imageFile 
                  ? `✓ ${imageFile.name}` 
                  : tr('मुख्य अभियान की तस्वीर अपलोड करने के लिए क्लिक करें', 'مرکزی تصویر اپلوڈ کرنے کے لیے کلک کریں', 'Click to upload main campaign image')}
              </span>
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
              {tr('अस्पताल का बिल / आधार / दस्तावेज़ संलग्न करें', 'ہسپتال کا بل / آدھار / دستاویزات منسلک کریں', 'Attach Medical Estimates / Documents')}
            </label>
            <label
              className={`p-3.5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center ${docUploaded
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setDocFile(file); setDocUploaded(true); }
                }}
              />
              <Upload className="w-4 h-4 mx-auto mb-1 text-slate-500" />
              <span className="text-xs font-bold">
                {docUploaded 
                  ? `✓ ${docFile?.name ?? tr('दस्तावेज़ संलग्न किए गए', 'دستاویزات منسلک ہو گئے', 'Document Attached')}` 
                  : tr('अस्पताल का एस्टीमेट या आधार जोड़ें', 'ہسپتال کا تخمینہ یا آدھار منسلک کریں', 'Click to attach hospital estimate / Aadhaar')}
              </span>
            </label>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting 
                ? tr('सुरक्षित किया जा रहा है...', 'محفوظ ہو رہا ہے...', 'Saving Campaign...') 
                : initialCampaign 
                ? tr('अभियान अपडेट करें', 'مہم اپ ڈیٹ کریں', 'Update Campaign') 
                : tr('सत्यापन हेतु जमा करें', 'تصدیق کے لیے جمع کریں', 'Submit for Verification')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
