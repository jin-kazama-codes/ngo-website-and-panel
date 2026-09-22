'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Donation, User, UserRole, Community, Campaign } from '../../types';
import { getDonations, updateDonationStatus } from '../../services/donationService';
import { getCommunities } from '../../services/communityService';
import { getCampaigns } from '../../services/campaignService';
import { STANDARD_DISTRICTS } from '../../data/districtsData';
import { useAppState } from '../../providers/AppStateProvider';
import { CheckCircle, XCircle, Search, FileText, Image as ImageIcon, AlertTriangle, IndianRupee, Award, Filter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateCategory } from '../../lib/translateEntity';

interface UtrAuditTabProps {
  activeUser?: User;
  currentRole?: UserRole;
}

const DonationAuditRow: React.FC<{
  donation: Donation;
  canPerformAction?: boolean;
  onViewDetails: (d: Donation) => void;
  onReject: (id: string) => void;
  onVerify: (id: string) => void;
}> = ({ donation, canPerformAction, onViewDetails, onReject, onVerify }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayDonorName = useDynamicTranslatedText(donation.donorName, language);
  const displayCampaign = useDynamicTranslatedText(donation.campaignTitle, language);
  const displayCategory = translateCategory(donation.category, language) || useDynamicTranslatedText(donation.category, language);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-4">
        <div className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{displayDonorName}</div>
        <div className="text-[11px] text-slate-500 font-mono">{new Date(donation.date).toLocaleString()}</div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-400/10 px-2 py-0.5 rounded text-xs">
            ₹{donation.amountINR.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
          UTR: {donation.utrNumber}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="text-slate-900 dark:text-white max-w-[200px] truncate text-xs font-semibold" title={donation.campaignTitle}>
          {displayCampaign}
        </div>
        <div className="text-[11px] text-slate-500">{displayCategory}</div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onViewDetails(donation)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 rounded-xl transition-colors text-xs font-bold cursor-pointer"
            title={tr('विवरण देखें', 'تفصیلات دیکھیں', 'View Details')}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{tr('विवरण देखें', 'تفصیلات دیکھیں', 'View Details')}</span>
          </button>
          {canPerformAction && (
            <>
              <button
                onClick={() => onReject(donation.id)}
                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors cursor-pointer"
                title={tr('अस्वीकार करें', 'مسترد کریں', 'Reject Payment')}
              >
                <XCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onVerify(donation.id)}
                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors cursor-pointer"
                title={tr('सत्यापित करें', 'تصدیق करें', 'Verify Payment')}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export const UtrAuditTab: React.FC<UtrAuditTabProps> = ({ activeUser: propActiveUser, currentRole: propCurrentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  let contextUser: User | undefined;
  let contextRole: UserRole | undefined;
  try {
    const appState = useAppState();
    contextUser = appState?.activeUser;
    contextRole = appState?.currentRole;
  } catch {
    // Outside AppStateProvider fallback
  }

  const activeUser = propActiveUser || contextUser;
  const currentRole = propCurrentRole || contextRole;

  const rawDistRole = (
    activeUser?.district_role ||
    activeUser?.districtRole ||
    (activeUser?.role as string) ||
    ''
  ).toLowerCase().trim().replace(/\s+/g, '_');

  const isSuperOrExecutive =
    currentRole === 'super_admin' ||
    currentRole === 'executive_admin' ||
    activeUser?.role === 'super_admin' ||
    activeUser?.role === 'executive_admin';

  const isDistrictFinanceCoord =
    currentRole === 'district_finance_coord' ||
    rawDistRole === 'district_finance_coord' ||
    rawDistRole.includes('finance');

  const canPerformUtrAction = isSuperOrExecutive || isDistrictFinanceCoord;

  const districtRoleKeys = [
    'district_president',
    'district_coordinator',
    'district_gen_secretary',
    'district_secretary',
    'district_finance_coord',
  ];

  const isDistrictRole =
    districtRoleKeys.includes(currentRole as string) ||
    districtRoleKeys.includes(rawDistRole) ||
    (typeof currentRole === 'string' && currentRole.startsWith('district_')) ||
    rawDistRole.startsWith('district_') ||
    rawDistRole.includes('president') ||
    rawDistRole.includes('coordinator') ||
    rawDistRole.includes('secretary') ||
    rawDistRole.includes('finance');

  const isRestrictedToDistrict = !isSuperOrExecutive && isDistrictRole;

  const districtRoleTitle =
    currentRole === 'district_president' || rawDistRole.includes('president')
      ? tr('जिला अध्यक्ष दृश्य', 'ضلعی صدر منظر', 'District President View')
      : currentRole === 'district_coordinator' || rawDistRole.includes('coordinator')
        ? tr('जिला संयोजक दृश्य', 'ضلعی کوآرڈینیٹر منظر', 'District Coordinator View')
        : currentRole === 'district_gen_secretary' || rawDistRole.includes('gen_sec')
          ? tr('जिला महासचिव दृश्य', 'ضلعی جنرل سیکرٹری منظر', 'District General Secretary View')
          : currentRole === 'district_secretary' || rawDistRole.includes('secretary')
            ? tr('जिला सचिव दृश्य', 'ضلعی سیکرٹری منظر', 'District Secretary View')
            : currentRole === 'district_finance_coord' || rawDistRole.includes('finance')
              ? tr('जिला वित्त समन्वयक दृश्य', 'ضلعی فنانس کوآرڈینیٹر منظر', 'District Finance Coordinator View')
              : tr('जिला स्तरीय दृश्य', 'ضلعی سطحی منظر', 'District Level View');

  const userDistrict = (activeUser?.district || activeUser?.city || '').trim();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'verify' | 'reject' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchPendingDonations();
  }, [currentRole, activeUser?.communityName]);

  const fetchPendingDonations = async () => {
    setLoading(true);
    try {
      const [allDonations, comms, camps] = await Promise.all([
        getDonations(),
        getCommunities().catch(() => []),
        getCampaigns().catch(() => []),
      ]);
      setCommunities(comms || []);
      setCampaigns(camps || []);

      let pending = allDonations.filter((d) => d.status === 'pending_verification');

      if (currentRole === 'community_admin' && activeUser?.communityName) {
        pending = pending.filter((d) => d.communityName === activeUser.communityName);
      }

      setDonations(pending);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const commMap = useMemo(() => {
    const map = new Map<string, Community>();
    communities.forEach((c) => {
      map.set(c.id, c);
      map.set(c.name.toLowerCase().trim(), c);
    });
    return map;
  }, [communities]);

  const campMap = useMemo(() => {
    const map = new Map<string, Campaign>();
    campaigns.forEach((c) => {
      map.set(c.id, c);
    });
    return map;
  }, [campaigns]);

  const getDonationDistrict = (d: Donation): string => {
    if ((d as any).district) return String((d as any).district);
    if (d.communityName && commMap.has(d.communityName.toLowerCase().trim())) {
      const comm = commMap.get(d.communityName.toLowerCase().trim())!;
      return comm.district || comm.city || '';
    }
    if (d.campaignId && campMap.has(d.campaignId)) {
      const camp = campMap.get(d.campaignId)!;
      return (camp as any).district || camp.city || '';
    }
    return '';
  };

  const districtFilteredDonations = useMemo(() => {
    let list = donations;

    if (isRestrictedToDistrict && userDistrict) {
      const target = userDistrict.toLowerCase().trim();
      list = list.filter((d) => {
        const dDistrict = getDonationDistrict(d).toLowerCase().trim();
        return dDistrict === target || (dDistrict && target.includes(dDistrict)) || (target && dDistrict.includes(target));
      });
    } else if (selectedDistrictFilter) {
      const target = selectedDistrictFilter.toLowerCase().trim();
      list = list.filter((d) => {
        const dDistrict = getDonationDistrict(d).toLowerCase().trim();
        return dDistrict === target || (dDistrict && target.includes(dDistrict)) || (target && dDistrict.includes(target));
      });
    }

    return list;
  }, [donations, isRestrictedToDistrict, userDistrict, selectedDistrictFilter, commMap, campMap]);

  const handleVerify = (id: string) => {
    if (!canPerformUtrAction) return;
    setConfirmAction({ id, type: 'verify' });
  };

  const handleReject = (id: string) => {
    if (!canPerformUtrAction) return;
    setConfirmAction({ id, type: 'reject' });
  };

  const executeAction = async () => {
    if (!confirmAction || !canPerformUtrAction) return;
    setProcessing(true);
    const { id, type } = confirmAction;
    try {
      await updateDonationStatus(id, type === 'verify' ? 'verified' : 'rejected');
      setDonations(donations.filter((d) => d.id !== id));
      if (selectedDonation?.id === id) setSelectedDonation(null);
      showToast(
        type === 'verify'
          ? tr('भुगतान सफलतापूर्वक सत्यापित किया गया!', 'ادائیگی کی کامیابی سے تصدیق ہو گئی!', 'Payment verified successfully!')
          : tr('भुगतान अस्वीकृत कर दिया गया।', 'ادائیگی مسترد کر دی گئی۔', 'Payment rejected.'),
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(tr('कार्रवाई विफल रही', 'عمل ناکام رہا', 'Failed to update payment status.'));
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  const filteredDonations = useMemo(() => {
    return districtFilteredDonations.filter(
      (d) =>
        d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.communityName && d.communityName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [districtFilteredDonations, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0a1c12 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.18)' }} />

        <div className="flex items-start gap-4 relative z-10">
          <div
            className="p-3.5 rounded-2xl shrink-0 mt-0.5"
            style={{
              background: 'rgba(200,168,75,0.15)',
              border: '1px solid rgba(200,168,75,0.35)',
            }}
          >
            <IndianRupee className="w-6 h-6" style={{ color: 'var(--mfct-gold)' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr('यूटीआर भुगतान डेस्क', 'یو ٹی آر ادائیگی ڈیسک', 'UTR Payment Desk')}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-4xl" style={{ color: 'rgba(200,168,75,0.9)' }}>
              {tr(
                'मैन्युअल यूपीआई और बैंक ट्रांसफर भुगतानों को सत्यापित और ऑडिट करें।',
                'دستی یو پی آئی اور بینک ٹرانسفر ادائیگیوں کی تصدیق اور آڈٹ کریں۔',
                'Verify and audit manual UPI / Bank transfer payments.'
              )}
            </p>
          </div>
        </div>

        {/* Right Controls: District Filter & Search Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {!isRestrictedToDistrict && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[var(--mfct-gold)] shrink-0" />
              <select
                value={selectedDistrictFilter}
                onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                className="bg-black/30 border border-[rgba(200,168,75,0.3)] text-xs text-white rounded-xl px-3 py-2.5 focus:border-[var(--mfct-gold)] outline-none cursor-pointer backdrop-blur-sm shadow-inner"
              >
                <option value="" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                  {tr('सभी जिले (All Districts)', 'تمام اضلاع', 'All Districts')}
                </option>
                {STANDARD_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                    {language === 'hi' ? d.nameHi : language === 'ur' ? d.nameUr : d.nameEn}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={tr('यूटीआर, दानदाता, अभियान खोजें...', 'یو ٹی آر، ڈونر یا مہم تلاش کریں...', 'Search UTR, Donor, Campaign...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/30 border border-[rgba(200,168,75,0.3)] text-xs text-white placeholder:text-slate-300 focus:border-[var(--mfct-gold)] outline-none backdrop-blur-sm transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* District Role Filter Indicator Banner */}
      {isRestrictedToDistrict && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <span>{districtRoleTitle}</span>
                {userDistrict && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                    {userDistrict}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                {tr(
                  `केवल आपके जिले (${userDistrict || 'निर्दिष्ट जिला'}) के यूटीआर भुगतान दिखाए जा रहे हैं।`,
                  `صرف آپ کے ضلع (${userDistrict || 'مخصوص ضلع'}) کی یو ٹی آر ادائیگیاں دکھائی جا रही हैं।`,
                  `Showing only pending UTR payments belonging to your designated district (${userDistrict || 'Assigned District'}).`
                )}
                {!canPerformUtrAction && (
                  <span className="block mt-0.5 font-semibold text-rose-700 dark:text-rose-400">
                    {tr(
                      '(केवल दृश्य मोड: यूटीआर सत्यापन कार्रवाई केवल जिला वित्त समन्वयक या केंद्रीय व्यवस्थापक कर सकते हैं)',
                      '(صرف دیکھنے کا موڈ: یو ٹی آر کی تصدیق صرف ڈسٹرکٹ فنانس کوآرڈینیٹر یا مرکزی ایڈمن کر سکتے ہیں)',
                      '(View Only: UTR action can only be performed by District Finance Coordinator or Central Admins)'
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold text-[11px] shrink-0">
            {filteredDonations.length} {tr('भुगतान', 'ادائیگیاں', filteredDonations.length === 1 ? 'Payment' : 'Payments')}
          </span>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></th>
                  <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></th>
                  <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></th>
                  <th className="px-4 py-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                    <td className="px-4 py-4"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-2"></div><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                    <td className="px-4 py-4 text-right flex justify-end gap-2"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm transition-colors">
          <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {tr('कोई लंबित भुगतान नहीं है', 'کوئی زیر التواء ادائیگی نہیں ہے', 'No Pending Payments')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {tr('सभी यूटीआर भुगतानों को सत्यापित कर लिया गया है।', 'تمام یو ٹی آر ادائیگیوں کی تصدیق ہو چکی ہے۔', 'All UTR payments have been verified.')}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4 whitespace-nowrap">{tr('दानदाता विवरण', 'ڈونر کی تفصیلات', 'Donor Details')}</th>
                  <th className="px-4 py-4 whitespace-nowrap">{tr('भुगतान विवरण', 'ادائیگی کی معلومات', 'Payment Info')}</th>
                  <th className="px-4 py-4 whitespace-nowrap">{tr('अभियान', 'مہم', 'Campaign')}</th>
                  <th className="px-4 py-4 whitespace-nowrap text-right">{tr('कार्रवाई', 'کارروائی', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {filteredDonations.map((d) => (
                  <DonationAuditRow
                    key={d.id}
                    donation={d}
                    canPerformAction={canPerformUtrAction}
                    onViewDetails={(donation) => setSelectedDonation(donation)}
                    onReject={(id) => handleReject(id)}
                    onVerify={(id) => handleVerify(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {tr('भुगतान विवरण', 'ادائیگی کی تفصیلات', 'Payment Details')}
              </h3>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                    {tr('दानदाता का नाम', 'ڈونر کا نام', 'Donor Name')}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{selectedDonation.donorName}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                    {tr('राशि', 'رقم', 'Amount')}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{selectedDonation.amountINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                    {tr('यूटीआर नंबर', 'یو ٹی آر نمبر', 'UTR Number')}
                  </span>
                  <span className="text-sm font-mono text-slate-900 dark:text-slate-200 select-all">{selectedDonation.utrNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                    {tr('दिनांक', 'تاریخ', 'Date')}
                  </span>
                  <span className="text-sm text-slate-900 dark:text-slate-200">{new Date(selectedDonation.date).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl col-span-2">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                    {tr('लक्षित अभियान', 'مطلوبہ مہم', 'Target Campaign')}
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{selectedDonation.campaignTitle}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold mb-2">
                  {tr('भुगतान स्क्रीनशॉट', 'ادائیگی کا اسکرین شاٹ', 'Payment Screenshot')}
                </span>
                {selectedDonation.paymentScreenshotUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[200px]">
                    <img
                      src={selectedDonation.paymentScreenshotUrl}
                      alt="Payment Screenshot"
                      className="max-w-full max-h-[400px] object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center text-slate-500">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">{tr('कोई स्क्रीनशॉट उपलब्ध नहीं है', 'کوئی اسکرین شاٹ فراہم نہیں کیا گیا', 'No screenshot provided')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex gap-3 items-center justify-between">
              {canPerformUtrAction ? (
                <>
                  <button
                    onClick={() => handleReject(selectedDonation.id)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer"
                  >
                    {tr('अस्वीकार करें', 'مسترد کریں', 'Reject')}
                  </button>
                  <button
                    onClick={() => handleVerify(selectedDonation.id)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/20 cursor-pointer"
                  >
                    {tr('भुगतान सत्यापित करें', 'ادائیگی کی تصدیق करें', 'Verify Payment')}
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 italic px-2">
                  {tr(
                    'केवल सुपर एडमिन, कार्यकारी एडमिन और जिला वित्त समन्वयक ही यूटीआर सत्यापन कार्रवाई कर सकते हैं।',
                    'صرف سپر ایڈمن، ایگزیکٹو ایڈمن اور ڈسٹرکٹ فنانس کوآرڈینیٹر ہی کارروائی کر سکتے ہیں۔',
                    'Only Super Admin, Executive Admin & District Finance Coordinator can verify/reject payments.'
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white mb-2 text-lg">
              {tr('कार्रवाई की पुष्टि करें', 'عمل کی تصدیق کریں', 'Confirm Action')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {confirmAction.type === 'verify'
                ? tr('क्या आप वाकई इस भुगतान को सत्यापित करना चाहते हैं?', 'کیا آپ واقعی اس ادائیگی کی تصدیق کرنا چاہتے ہیں؟', 'Are you sure you want to verify this payment?')
                : tr('क्या आप वाकई इस भुगतान को अस्वीकार करना चाहते हैं?', 'کیا آپ واقعی اس ادائیگی کو مسترد کرنا چاہتے ہیں؟', 'Are you sure you want to reject this payment?')}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmAction(null)}
                className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                disabled={processing}
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                onClick={executeAction}
                className={`cursor-pointer px-6 py-2 rounded-xl text-white font-bold text-xs transition-colors flex items-center justify-center min-w-[120px] ${
                  confirmAction.type === 'verify' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
                disabled={processing}
              >
                {processing
                  ? tr('प्रक्रिया जारी है...', 'جاری ہے...', 'Processing...')
                  : confirmAction.type === 'verify'
                  ? tr('हाँ, सत्यापित करें', 'ہاں، تصدیق کریں', 'Yes, Verify')
                  : tr('हाँ, अस्वीकार करें', 'ہاں، مسترد کریں', 'Yes, Reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg z-[100] text-xs font-bold text-white transition-all transform duration-300 ease-out ${
            toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        >
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};
