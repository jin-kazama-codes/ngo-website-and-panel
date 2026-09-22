'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Donation, User, UserRole, Community, Campaign } from '../../types';
import { getDonations, updateDonationStatus } from '../../services/donationService';
import { getCommunities } from '../../services/communityService';
import { getCampaigns } from '../../services/campaignService';
import { STANDARD_DISTRICTS } from '../../data/districtsData';
import { useAppState } from '../../providers/AppStateProvider';
import { CheckCircle, XCircle, X, Search, FileText, Image as ImageIcon, AlertTriangle, IndianRupee, Award, Filter, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateCategory } from '../../lib/translateEntity';

interface UtrAuditTabProps {
  activeUser?: User;
  currentRole?: UserRole;
}

type PaymentFilter = 'pending' | 'verified' | 'rejected' | 'all';

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
      <td className="px-4 py-4 whitespace-nowrap">
        {donation.status === 'verified' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{tr('सत्यापित', 'تصدیق شدہ', 'Verified')}</span>
          </span>
        ) : donation.status === 'rejected' ? (
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
              <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>{tr('अस्वीकृत', 'مسترد', 'Rejected')}</span>
            </span>
            {(donation.rejectionReason || donation.rejection_reason) && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 truncate max-w-[140px]" title={donation.rejectionReason || donation.rejection_reason}>
                {donation.rejectionReason || donation.rejection_reason}
              </p>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{tr('लंबित', 'زیر التواء', 'Pending')}</span>
          </span>
        )}
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
              {donation.status !== 'rejected' && (
                <button
                  onClick={() => onReject(donation.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors cursor-pointer"
                  title={tr('अस्वीकार करें', 'مسترد کریں', 'Reject Payment')}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              {donation.status !== 'verified' && (
                <button
                  onClick={() => onVerify(donation.id)}
                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors cursor-pointer"
                  title={tr('सत्यापित करें', 'تصدیق کریں', 'Verify Payment')}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
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
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>('pending');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'verify' | 'reject' } | null>(null);
  const [rejectModalDonation, setRejectModalDonation] = useState<Donation | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [rejectionReasonError, setRejectionReasonError] = useState('');

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchDonations();
  }, [currentRole, activeUser?.communityName]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const [allDonations, comms, camps] = await Promise.all([
        getDonations(),
        getCommunities().catch(() => []),
        getCampaigns().catch(() => []),
      ]);
      setCommunities(comms || []);
      setCampaigns(camps || []);

      let list = allDonations;
      if (currentRole === 'community_admin' && activeUser?.communityName) {
        list = list.filter((d) => d.communityName === activeUser.communityName);
      }

      setDonations(list);
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

  const counts = useMemo(() => {
    return {
      all: districtFilteredDonations.length,
      pending: districtFilteredDonations.filter(
        (d) => d.status === 'pending_verification' || d.status === 'pending'
      ).length,
      verified: districtFilteredDonations.filter((d) => d.status === 'verified').length,
      rejected: districtFilteredDonations.filter((d) => d.status === 'rejected').length,
    };
  }, [districtFilteredDonations]);

  const handleVerify = (id: string) => {
    if (!canPerformUtrAction) return;
    setConfirmAction({ id, type: 'verify' });
  };

  const handleReject = (id: string) => {
    if (!canPerformUtrAction) return;
    const target = donations.find((d) => d.id === id) || (selectedDonation?.id === id ? selectedDonation : null);
    if (!target) return;
    setRejectModalDonation(target);
    setRejectionReasonInput(target.rejectionReason || target.rejection_reason || '');
    setRejectionReasonError('');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalDonation || !canPerformUtrAction) return;
    const trimmedReason = rejectionReasonInput.trim();
    if (!trimmedReason) {
      setRejectionReasonError(
        tr(
          'अस्वीकृति का कारण अनिवार्य है। कृपया कारण दर्ज करें।',
          'مسترد کرنے کی وجہ لازمی ہے۔ براہ کرم وجہ درج کریں۔',
          'Rejection reason is mandatory. Please provide a reason.'
        )
      );
      return;
    }

    setProcessing(true);
    const id = rejectModalDonation.id;
    try {
      await updateDonationStatus(id, 'rejected', trimmedReason);
      setDonations((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, status: 'rejected', rejectionReason: trimmedReason, rejection_reason: trimmedReason }
            : d
        )
      );
      if (selectedDonation?.id === id) {
        setSelectedDonation((prev) =>
          prev
            ? { ...prev, status: 'rejected', rejectionReason: trimmedReason, rejection_reason: trimmedReason }
            : null
        );
      }
      setRejectModalDonation(null);
      setRejectionReasonInput('');
      setRejectionReasonError('');
      showToast(
        tr('भुगतान अस्वीकृत कर दिया गया।', 'ادائیگی مسترد کر دی گئی۔', 'Payment rejected.'),
        'success'
      );
    } catch (err) {
      console.error('Failed to reject payment:', err);
      showToast(tr('कार्रवाई विफल रही', 'عمل ناکام رہا', 'Failed to update payment status.'));
    } finally {
      setProcessing(false);
    }
  };

  const executeAction = async () => {
    if (!confirmAction || !canPerformUtrAction) return;
    setProcessing(true);
    const { id } = confirmAction;
    try {
      await updateDonationStatus(id, 'verified');
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'verified' } : d))
      );
      if (selectedDonation?.id === id) {
        setSelectedDonation((prev) => (prev ? { ...prev, status: 'verified' } : null));
      }
      showToast(
        tr('भुगतान सफलतापूर्वक सत्यापित किया गया!', 'ادائیگی کی کامیابی سے تصدیق ہو گئی!', 'Payment verified successfully!'),
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(tr('कार्रवाई विफल रही', 'عمل ناکام रहा', 'Failed to update payment status.'));
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  const filteredDonations = useMemo(() => {
    return districtFilteredDonations.filter((d) => {
      const isPending = d.status === 'pending_verification' || d.status === 'pending';
      const isVerified = d.status === 'verified';
      const isRejected = d.status === 'rejected';

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'pending' && isPending) ||
        (activeFilter === 'verified' && isVerified) ||
        (activeFilter === 'rejected' && isRejected);

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        d.donorName?.toLowerCase().includes(query) ||
        d.utrNumber?.toLowerCase().includes(query) ||
        d.campaignTitle?.toLowerCase().includes(query) ||
        (d.communityName && d.communityName.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [districtFilteredDonations, activeFilter, searchQuery]);

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
      </div>

      {/* Main UTR Audit & Verification Queue Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
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
                    `Showing only UTR payments belonging to your designated district (${userDistrict || 'Assigned District'}).`
                  )}
                  {!canPerformUtrAction && (
                    <span className="block mt-0.5 font-semibold text-rose-700 dark:text-rose-400">
                      {tr(
                        '(केवल दृश्य मोड: यूटीआर सत्यापन कार्रवाई केवल जिला वित्त समन्वयक या केंद्रीय व्यवस्थापक कर सकते हैं)',
                        '(صرف دیکھنے کا موڈ: یو ٹی آر کی تصدیق صرف ڈسٹرکٹ فنانس کوآرڈینیٹر या مرکزی ایڈمن कर सकते हैं)',
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

        {/* Filter Pills & Controls Bar (Identical UX to KYC Tab) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{tr('लंबित सत्यापन', 'زیر التواء', 'Pending Approval')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeFilter === 'pending'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                }`}
              >
                {counts.pending}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('verified')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'verified'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tr('सत्यापित / स्वीकृत', 'تصدیق شدہ', 'Approved & Verified')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeFilter === 'verified'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                {counts.verified}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('rejected')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{tr('अस्वीकृत', 'مسترد شدہ', 'Rejected')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeFilter === 'rejected'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                }`}
              >
                {counts.rejected}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{tr('सभी भुगतान', 'تمام ادائیگیاں', 'All Donations')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeFilter === 'all'
                    ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {counts.all}
              </span>
            </button>
          </div>

          {/* Right Controls: District Filter Dropdown & Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {!isRestrictedToDistrict && (
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="">{tr('सभी जिले (All Districts)', 'تمام اضلاع', 'All Districts')}</option>
                  {STANDARD_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'hi' ? d.nameHi : language === 'ur' ? d.nameUr : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={tr('यूटीआर, दानदाता, अभियान खोजें...', 'یو ٹی آر، ڈونر یا مہم تلاش کریں...', 'Search UTR, Donor, Campaign...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Content Table / Loading / Empty State */}
        {loading ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-pulse">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></th>
                    <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></th>
                    <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></th>
                    <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></th>
                    <th className="px-4 py-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                  {[1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                      <td className="px-4 py-4"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-2"></div><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2"></div></td>
                      <td className="px-4 py-4 text-right flex justify-end gap-2"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
            <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeFilter === 'pending'
                ? tr('कोई लंबित भुगतान नहीं है', 'کوئی زیر التواء ادائیگی نہیں ہے', 'No Pending Payments')
                : activeFilter === 'verified'
                ? tr('कोई सत्यापित भुगतान नहीं है', 'کوئی تصدیق شدہ ادائیگی नहीं है', 'No Verified Payments')
                : activeFilter === 'rejected'
                ? tr('कोई अस्वीकृत भुगतान नहीं है', 'کوئی مسترد شدہ ادائیگی नहीं है', 'No Rejected Payments')
                : tr('कोई भुगतान रिकॉर्ड नहीं मिला', 'کوئی ادائیگی نہیں ملی', 'No Payments Found')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {activeFilter === 'pending'
                ? tr('सभी यूटीआर भुगतानों को सत्यापित या संसाधित कर लिया गया है।', 'تمام یو ٹی آر ادائیگیوں کی تصدیق ہو چکی ہے۔', 'All UTR payments have been reviewed.')
                : tr('इस श्रेणी में वर्तमान में कोई भुगतान उपलब्ध नहीं है।', 'اس زمرے میں فی الحال کوئی ریکارڈ موجود نہیں ہے۔', 'No payments match the selected criteria.')}
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-4 whitespace-nowrap">{tr('दानदाता विवरण', 'ڈونر کی تفصیلات', 'Donor Details')}</th>
                    <th className="px-4 py-4 whitespace-nowrap">{tr('भुगतान विवरण', 'ادائیگی کی معلومات', 'Payment Info')}</th>
                    <th className="px-4 py-4 whitespace-nowrap">{tr('अभियान', 'مہم', 'Campaign')}</th>
                    <th className="px-4 py-4 whitespace-nowrap">{tr('स्थिति', 'حیثیت', 'Status')}</th>
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
      </div>

      {/* Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {tr('भुगतान विवरण', 'ادائیگی کی تفصیلات', 'Payment Details')}
                </h3>
                <p className="text-xs text-slate-500">ID: {selectedDonation.id}</p>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Status Banner */}
              <div className={`p-3 rounded-2xl flex items-center justify-between border ${
                selectedDonation.status === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : selectedDonation.status === 'rejected'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs">
                  {selectedDonation.status === 'verified' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{tr('भुगतान सत्यापित एवं स्वीकृत है', 'ادائیگی تصدیق شدہ اور منظور شدہ ہے', 'Payment is Approved & Verified')}</span>
                    </>
                  ) : selectedDonation.status === 'rejected' ? (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>{tr('भुगतान अस्वीकृत कर दिया गया है', 'ادائیگی مسترد कर دی گئی ہے', 'Payment is Rejected')}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{tr('सत्यापन लंबित है', 'تصدیق زیر التواء ہے', 'Verification Pending')}</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 uppercase font-bold">
                  {selectedDonation.status}
                </span>
              </div>

              {/* Rejection Reason Alert if Rejected */}
              {selectedDonation.status === 'rejected' && (selectedDonation.rejectionReason || selectedDonation.rejection_reason) && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>{tr('अस्वीकृति का कारण:', 'مسترد کرنے کی وجہ:', 'Rejection Reason:')}</span>
                  </div>
                  <p className="text-rose-800 dark:text-rose-200 text-xs pl-5 font-medium">
                    {selectedDonation.rejectionReason || selectedDonation.rejection_reason}
                  </p>
                </div>
              )}

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
                  <span className="text-sm font-mono text-slate-900 dark:text-slate-200 select-all font-bold">{selectedDonation.utrNumber}</span>
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
                  {selectedDonation.status !== 'rejected' && (
                    <button
                      onClick={() => handleReject(selectedDonation.id)}
                      className="flex-1 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{tr('अस्वीकार करें', 'مسترد کریں', 'Reject')}</span>
                    </button>
                  )}
                  {selectedDonation.status !== 'verified' && (
                    <button
                      onClick={() => handleVerify(selectedDonation.id)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/20 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{tr('भुगतान सत्यापित करें', 'ادائیگی की تصدیق करें', 'Verify Payment')}</span>
                    </button>
                  )}
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

      {/* Mandatory Payment Rejection Reason Modal */}
      {rejectModalDonation && (
        <div className="fixed inset-0 bg-slate-950/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/60 dark:bg-rose-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {tr('भुगतान अस्वीकृति का कारण दर्ज करें', 'ادائیگی مسترد کرنے کی وجہ درج کریں', 'Enter Payment Rejection Reason')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {rejectModalDonation.donorName} • UTR: {rejectModalDonation.utrNumber} • ₹{rejectModalDonation.amountINR.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRejectModalDonation(null);
                  setRejectionReasonError('');
                }}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {tr(
                  'भुगतान अस्वीकार करने के लिए कारण अनिवार्य है। यह कारण दानदाता को उनके रिकॉर्ड में दिखाई देगा ताकि वे इसे ठीक कर सकें:',
                  'ادائیگی مسترد کرنے کی وجہ لازمی ہے۔ یہ وجہ عطیہ دہندہ کو نظر آئے گی تاکہ وہ اسے درست کر سکیں:',
                  'A reason is mandatory when rejecting a payment. This will be recorded and shown to the donor so they can review and correct their details:'
                )}
              </p>

              {/* Quick Preset Reason Chips */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {tr('त्वरित कारण चुनें:', 'فوری وجوہات منتخب کریں:', 'Quick select common reasons:')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    tr('गलत या अमान्य UTR संख्या', 'غلط UTR نمبر', 'Invalid or mismatched UTR number'),
                    tr('धुंधला या अपठनीय भुगतान स्क्रीनशॉट', 'دھندلا اسکرین شاٹ', 'Blurry or unreadable payment screenshot'),
                    tr('स्क्रीनशॉट में राशि का बेमेल होना', 'رقم میں فرق', 'Amount mismatch in payment screenshot'),
                    tr('बैंक खाते में भुगतान प्राप्त नहीं हुआ', 'بینک اکاؤنٹ میں رقم نہیں آئی', 'Payment not credited to NGO bank account'),
                    tr('डुप्लिकेट या पहले से उपयोग किया गया UTR', 'پہلے سے استعمال شدہ UTR', 'Duplicate or already verified UTR number'),
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setRejectionReasonInput((prev) => (prev ? `${prev}. ${preset}` : preset));
                        setRejectionReasonError('');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-rose-100 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  {tr('विस्तृत कारण *', 'تفصیلی وجہ *', 'Detailed Rejection Reason *')}
                </label>
                <textarea
                  value={rejectionReasonInput}
                  onChange={(e) => {
                    setRejectionReasonInput(e.target.value);
                    if (rejectionReasonError) setRejectionReasonError('');
                  }}
                  rows={4}
                  placeholder={tr(
                    'उदा. यूटीआर संख्या बैंक रिकॉर्ड से मेल नहीं खा रही है और रसीद साफ नहीं है...',
                    'مثال کے طور پر UTR بینک ریکارڈ سے مماثل نہیں ہے...',
                    'e.g. UTR number does not match bank statement and the screenshot is unclear...'
                  )}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-slate-400 resize-none font-medium"
                />
                {rejectionReasonError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{rejectionReasonError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setRejectModalDonation(null);
                  setRejectionReasonError('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={processing}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {processing ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>{tr('अस्वीकार की पुष्टि करें', 'مسترد کرنے کی تصدیق کریں', 'Confirm Rejection')}</span>
              </button>
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
              {tr('क्या आप वाकई इस भुगतान को सत्यापित करना चाहते हैं?', 'کیا آپ واقعی اس ادائیگی کی تصدیق کرنا चाहते हैं?', 'Are you sure you want to verify this payment?')}
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
