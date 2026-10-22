import React, { useState, useEffect } from 'react';
import { Donation, User, UserRole } from '../../types';
import { getDonations } from '../../services/donationService';
import { getUsers } from '../../services/userService';
import {
  Search,
  TrendingUp,
  IndianRupee,
  UserCheck,
  FileText,
  FileCheck,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateCommunityName } from '../../lib/translateEntity';

interface FinancialAnalyticsTabProps {
  activeUser: User;
  currentRole: UserRole;
}

const TablePagination: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}> = ({ currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-xs">
      {/* Left: Summary & Per-page selector */}
      <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400">
        <span>
          {tr('दिखा रहे हैं', 'دکھا رہے ہیں', 'Showing')}{' '}
          <strong className="font-bold text-slate-800 dark:text-slate-200">{startItem}</strong>
          {' - '}
          <strong className="font-bold text-slate-800 dark:text-slate-200">{endItem}</strong>
          {' '}{tr('कुल', 'کل', 'of')}{' '}
          <strong className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</strong>
          {' '}{tr('प्रविष्टियाँ', 'اندراجات', 'records')}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-[11px]">{tr('प्रति पृष्ठ:', 'فی صفحہ:', 'Per page:')}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label={tr('प्रति पृष्ठ रिकॉर्ड्स संख्या', 'فی صفحہ ریکارڈز کی تعداد', 'Records per page')}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-white outline-none cursor-pointer focus:border-emerald-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title={tr('पिछला पृष्ठ', 'پچھلا صفحہ', 'Previous Page')}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{tr('पिछला', 'پچھلا', 'Prev')}</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 font-bold">
                  ...
                </span>
              );
            }
            const pageNum = Number(page);
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg font-bold text-xs transition-colors cursor-pointer ${isActive
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title={tr('अगला पृष्ठ', 'اگلا صفحہ', 'Next Page')}
        >
          <span className="hidden sm:inline">{tr('अगला', 'اگلا', 'Next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const FinancialDonationRow: React.FC<{
  donation: Donation;
  onViewProof?: (url: string, title: string) => void;
}> = ({ donation, onViewProof }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayDonorName = useDynamicTranslatedText(
    donation.donorName || tr('गुमनाम समर्थक', 'گمنام مددگار', 'Anonymous Supporter'),
    language
  );
  const displayCampaign = useDynamicTranslatedText(donation.campaignTitle || '', language);
  const displayCommunity = translateCommunityName(donation.communityName || '', language);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          label: tr('सत्यापित', 'تصدیق شدہ', 'Verified'),
          cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
        };
      case 'pending_verification':
      case 'pending':
        return {
          label: tr('सत्यापन लंबित', 'زیر التواء تصدیق', 'Pending Verification'),
          cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
        };
      default:
        return {
          label: tr('अस्वीकृत', 'مسترد', 'Rejected'),
          cls: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50',
        };
    }
  };

  const getPaymentMethodLabel = (pm?: string) => {
    if (!pm) return 'UPI';
    if (pm === 'Bank Transfer') return tr('बैंक ट्रांसफर', 'بینک ٹرانسفر', 'Bank Transfer');
    if (pm === 'QR Code') return tr('क्यूआर कोड', 'کیو آر کوڈ', 'QR Code');
    if (pm === 'Card') return tr('कार्ड', 'کارڈ', 'Card');
    return pm;
  };

  const statusInfo = getStatusBadge(donation.status);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-4">
        <div className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{displayDonorName}</div>
        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{new Date(donation.date).toLocaleString()}</div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-400/10 px-2.5 py-1 rounded-lg text-xs md:text-sm">
            ₹{donation.amountINR.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="mt-1.5">
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="text-slate-900 dark:text-white max-w-[220px] truncate text-xs md:text-sm font-semibold" title={donation.campaignTitle}>
          {displayCampaign || tr('सामान्य दान', 'عام عطیہ', 'General Donation')}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 max-w-[220px] truncate" title={donation.communityName}>
          {displayCommunity || tr('लागू नहीं', 'غیر معقول', 'N/A')}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">
          {getPaymentMethodLabel(donation.paymentMethod)}
        </div>
        {donation.utrNumber ? (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono truncate max-w-[160px]">
            UTR: {donation.utrNumber}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 mt-1 italic">
            {tr('यूटीआर नहीं', 'کوئی UTR نہیں', 'No UTR')}
          </div>
        )}
        {donation.paymentScreenshotUrl && (
          <div className="mt-1.5">
            {onViewProof ? (
              <button
                type="button"
                onClick={() => onViewProof(donation.paymentScreenshotUrl!, `${donation.donorName || 'Donor'} - ₹${donation.amountINR}`)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <span>{tr('रसीद देखें', 'رسید دیکھیں', 'View Receipt')}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            ) : (
              <a
                href={donation.paymentScreenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>{tr('रसीद देखें', 'رسید دیکھیں', 'View Receipt')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

const FinancialRegistrationRow: React.FC<{
  member: User;
  onViewProof?: (url: string, title: string) => void;
}> = ({ member, onViewProof }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(member.name || tr('अज्ञात सदस्य', 'نامعلوم رکن', 'Unknown Member'), language);
  const displayCommunity = translateCommunityName(member.communityName || '', language);
  const feeAmount = Number(member.membershipFee) || 100;

  const getPaymentMethodLabel = (pm?: string) => {
    if (!pm) return 'UPI';
    if (pm === 'Bank Transfer') return tr('बैंक ट्रांसफर', 'بینک ٹرانسفر', 'Bank Transfer');
    if (pm === 'QR Code') return tr('क्यूआर कोड', 'کیو آر کوڈ', 'QR Code');
    if (pm === 'Card') return tr('कार्ड', 'کارڈ', 'Card');
    if (pm === 'Cash') return tr('नकद', 'نقد', 'Cash');
    return pm;
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-4">
        <div className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{displayName}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-semibold">
            {member.membershipId || tr('आईडी नहीं', 'کوئی ID नहीं', 'No ID')}
          </span>
          {member.phone && (
            <span className="text-[11px] text-slate-400 font-mono">
              • {member.phone}
            </span>
          )}
        </div>
        {member.joinDate && (
          <div className="text-[10px] text-slate-400 mt-0.5">
            {tr('शामिल तिथि:', 'شمولیت کی تاریخ:', 'Joined:')} {member.joinDate}
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-400/10 px-2.5 py-1 rounded-lg text-xs md:text-sm">
            ₹{feeAmount.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="mt-1.5">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            {tr('सत्यापित पंजीकरण', 'تصدیق شدہ رجسٹریشن', 'Verified Registration')}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="text-slate-900 dark:text-white max-w-[220px] truncate text-xs md:text-sm font-semibold" title={member.communityName}>
          {displayCommunity || tr('सामान्य समुदाय', 'عام برادری', 'General Community')}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 max-w-[220px] truncate" title={member.district || member.city}>
          {member.district || member.city || tr('लागू नहीं', 'غیر معقول', 'N/A')}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">
          {getPaymentMethodLabel(member.paymentMethod)}
        </div>
        {member.paymentUtr ? (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono truncate max-w-[180px]">
            UTR: {member.paymentUtr}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 mt-1 italic">
            {tr('यूटीआर उपलब्ध नहीं', 'UTR دستیاب نہیں', 'No UTR')}
          </div>
        )}
        {member.paymentScreenshotUrl && (
          <div className="mt-1.5">
            {onViewProof ? (
              <button
                type="button"
                onClick={() => onViewProof(member.paymentScreenshotUrl!, `${member.name} - ${member.membershipId}`)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <span>{tr('भुगतान रसीद देखें', 'ادائیگی کی رسید دیکھیں', 'View Payment Proof')}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            ) : (
              <a
                href={member.paymentScreenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>{tr('भुगतान रसीद देखें', 'ادائیگی کی رسید دیکھیں', 'View Payment Proof')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const FinancialAnalyticsTab: React.FC<FinancialAnalyticsTabProps> = ({ activeUser, currentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [donations, setDonations] = useState<Donation[]>([]);
  const [registrationPayments, setRegistrationPayments] = useState<User[]>([]);
  const [registrationPaymentsError, setRegistrationPaymentsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'donations' | 'registrations'>('donations');
  const [previewProof, setPreviewProof] = useState<{ url: string; title: string } | null>(null);

  // Pagination states (defaults to 10 per page as requested)
  const [pageSize, setPageSize] = useState<number>(10);
  const [donationsPage, setDonationsPage] = useState<number>(1);
  const [registrationsPage, setRegistrationsPage] = useState<number>(1);

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      try {
        const allDonations = await getDonations();
        let filteredDon = allDonations;

        if (currentRole === 'community_admin' && activeUser?.communityName) {
          filteredDon = allDonations.filter((d) => d.communityName === activeUser.communityName);
        }

        setDonations(filteredDon);

        try {
          const allUsers = await getUsers();
          let eligibleUsers = allUsers.filter(
            (user) => user.status === 'approved' && Boolean(user.paymentUtr?.trim())
          );

          if (currentRole === 'community_admin' && activeUser?.communityName) {
            eligibleUsers = eligibleUsers.filter((u) => u.communityName === activeUser.communityName);
          } else if (activeUser?.district && currentRole.startsWith('district_')) {
            eligibleUsers = eligibleUsers.filter(
              (u) => u.district === activeUser.district || u.city === activeUser.district
            );
          }

          setRegistrationPayments(eligibleUsers);
          setRegistrationPaymentsError(false);
        } catch (err) {
          console.error('Failed to fetch registration payments:', err);
          setRegistrationPaymentsError(true);
        }
      } catch (err) {
        console.error('Failed to fetch financial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancialData();
  }, [activeUser?.communityName, activeUser?.district, currentRole]);

  // Reset page to 1 when search query or page size changes
  useEffect(() => {
    setDonationsPage(1);
    setRegistrationsPage(1);
  }, [searchQuery, pageSize]);

  // Filtered collections based on search query
  const query = searchQuery.trim().toLowerCase();

  const filteredDonations = donations.filter((d) => {
    if (!query) return true;
    return (
      (d.donorName && d.donorName.toLowerCase().includes(query)) ||
      (d.utrNumber && d.utrNumber.toLowerCase().includes(query)) ||
      (d.campaignTitle && d.campaignTitle.toLowerCase().includes(query)) ||
      (d.communityName && d.communityName.toLowerCase().includes(query))
    );
  });

  const filteredRegistrationPayments = registrationPayments.filter((u) => {
    if (!query) return true;
    return (
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.membershipId && u.membershipId.toLowerCase().includes(query)) ||
      (u.paymentUtr && u.paymentUtr.toLowerCase().includes(query)) ||
      (u.phone && u.phone.toLowerCase().includes(query)) ||
      (u.communityName && u.communityName.toLowerCase().includes(query)) ||
      (u.district && u.district.toLowerCase().includes(query)) ||
      (u.city && u.city.toLowerCase().includes(query))
    );
  });

  // Overall Financial Calculations (calculated over all matching records)
  const totalDonationAmount = filteredDonations.reduce((sum, d) => sum + (Number(d.amountINR) || 0), 0);
  const totalRegistrationAmount = filteredRegistrationPayments.reduce(
    (sum, u) => sum + (Number(u.membershipFee) || 100),
    0
  );
  const grandTotal = totalDonationAmount + totalRegistrationAmount;

  // Pagination calculations for Donations
  const totalDonationItems = filteredDonations.length;
  const totalDonationPages = Math.max(1, Math.ceil(totalDonationItems / pageSize));
  const validDonationsPage = Math.min(donationsPage, totalDonationPages);
  const startDonationIdx = (validDonationsPage - 1) * pageSize;
  const paginatedDonations = filteredDonations.slice(startDonationIdx, startDonationIdx + pageSize);

  // Pagination calculations for Registrations
  const totalRegistrationItems = filteredRegistrationPayments.length;
  const totalRegistrationPages = Math.max(1, Math.ceil(totalRegistrationItems / pageSize));
  const validRegistrationsPage = Math.min(registrationsPage, totalRegistrationPages);
  const startRegistrationIdx = (validRegistrationsPage - 1) * pageSize;
  const paginatedRegistrations = filteredRegistrationPayments.slice(
    startRegistrationIdx,
    startRegistrationIdx + pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {tr('वित्तीय विश्लेषण', 'مالیاتی تجزیات', 'Financial Analytics')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tr(
              'दान एवं पंजीकरण शुल्क लेन-देन और वित्तीय मैट्रिक्स का संपूर्ण अवलोकन।',
              'عطیات اور رجسٹریشن فیس کے لین دین اور مالیاتی میٹرکس کا مکمل جائزہ۔',
              'Overview of donation and registration fee transactions and financial metrics.'
            )}
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'donations'
                ? tr('दानदाता, यूटीआर या अभियान खोजें...', 'عطیہ دہندہ، UTR یا مہم تلاش کریں...', 'Search donor, UTR, campaign...')
                : tr('सदस्य, सदस्यता आईडी या यूटीआर खोजें...', 'رکن، رکنیت ID یا UTR تلاش کریں...', 'Search member, ID, UTR...')
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Analytics Cards (3 Cards: Total Donations, Registration Fees, Total) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Donations */}
        <div
          onClick={() => setActiveTab('donations')}
          className={`bg-white dark:bg-slate-900 border p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${activeTab === 'donations'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
            }`}
          title={tr('दान तालिका देखने के लिए क्लिक करें', 'عطیات کا جدول دیکھنے کے لیے کلک کریں', 'Click to view Donations table')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {tr('कुल दान', 'کل عطیات', 'Total Donations')}
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                ₹{totalDonationAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {filteredDonations.length} {tr('दान प्रविष्टियाँ', 'عطیات کے اندراجات', 'donations')}
              </p>
            </div>
          </div>
          {activeTab === 'donations' && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {tr('सक्रिय', 'فعال', 'Active')}
            </span>
          )}
        </div>

        {/* Card 2: Registration Fees */}
        <div
          onClick={() => setActiveTab('registrations')}
          className={`bg-white dark:bg-slate-900 border p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${activeTab === 'registrations'
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
            }`}
          title={tr('पंजीकरण शुल्क तालिका देखने के लिए क्लिक करें', 'رجسٹریشن فیس کا جدول دیکھنے کے لیے کلک کریں', 'Click to view Registration Fees table')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {tr('पंजीकरण शुल्क', 'رجسٹریشن فیس', 'Registration Fees')}
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                ₹{totalRegistrationAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {filteredRegistrationPayments.length} {tr('पंजीकृत सदस्य', 'رجسٹرڈ ارکان', 'members')}
              </p>
            </div>
          </div>
          {activeTab === 'registrations' && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {tr('सक्रिय', 'فعال', 'Active')}
            </span>
          )}
        </div>

        {/* Card 3: Grand Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {tr('कुल योग', 'کل میزان', 'Total Collection')}
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                ₹{grandTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {tr('दान + पंजीकरण शुल्क', 'عطیات + رجسٹریشن فیس', 'Donations + Reg. Fees')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Tab Navigation (Donation & Registration Fees) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('donations');
              setDonationsPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'donations'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>{tr('दान विवरण', 'عطیات کی تفصیلات', 'Donations')}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'donations'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
            >
              {filteredDonations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('registrations');
              setRegistrationsPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'registrations'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{tr('पंजीकरण शुल्क', 'رجسٹریشن فیس', 'Registration Fees')}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'registrations'
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
            >
              {filteredRegistrationPayments.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {activeTab === 'donations' ? (
            <span>
              {tr('कुल प्राप्त दान:', 'کل وصول شدہ عطیات:', 'Total Received Donations:')}{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                ₹{totalDonationAmount.toLocaleString('en-IN')}
              </strong>
            </span>
          ) : (
            <span>
              {tr('कुल प्राप्त पंजीकरण शुल्क:', 'کل وصول شدہ رجسٹریشن فیس:', 'Total Received Registration Fees:')}{' '}
              <strong className="text-blue-600 dark:text-blue-400 font-bold">
                ₹{totalRegistrationAmount.toLocaleString('en-IN')}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></th>
                  <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></th>
                  <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></th>
                  <th className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'donations' ? (
        /* DONATIONS TAB CONTENT */
        filteredDonations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
            <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {tr('कोई दान लेनदेन नहीं मिला', 'کوئی عطیہ لین دین نہیں ملا', 'No Donations Found')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {tr('आपके मानदंडों से मेल खाने वाला कोई दान नहीं है।', 'آپ کے معیار سے مماثل کوئی عطیہ نہیں ہے۔', 'There are no donations matching your criteria.')}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-4 whitespace-nowrap">
                      {tr('दानदाता विवरण', 'عطیہ دہندہ کی تفصیلات', 'Donor Details')}
                    </th>
                    <th className="px-4 py-4 whitespace-nowrap">
                      {tr('राशि एवं स्थिति', 'رقم اور حیثیت', 'Amount & Status')}
                    </th>
                    <th className="px-4 py-4 whitespace-nowrap">
                      {tr('अभियान एवं समुदाय', 'مہم اور برادری', 'Campaign & Community')}
                    </th>
                    <th className="px-4 py-4 whitespace-nowrap">
                      {tr('भुगतान विधि', 'ادائیگی کا طریقہ', 'Payment Method')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                  {paginatedDonations.map((d) => (
                    <FinancialDonationRow
                      key={d.id}
                      donation={d}
                      onViewProof={(url, title) => setPreviewProof({ url, title })}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <TablePagination
              currentPage={validDonationsPage}
              totalPages={totalDonationPages}
              totalItems={totalDonationItems}
              pageSize={pageSize}
              onPageChange={(page) => setDonationsPage(page)}
              onPageSizeChange={(size) => setPageSize(size)}
            />
          </div>
        )
      ) : (
        /* REGISTRATION FEES TAB CONTENT */
        registrationPaymentsError ? (
          <div role="alert" className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-6 text-sm text-rose-700 dark:text-rose-300">
            {tr(
              'पंजीकरण भुगतान डेटा लोड नहीं किया जा सका। कृपया बाद में पुनः प्रयास करें।',
              'رجسٹریشن کی ادائیگی کا ڈیٹا لوڈ نہیں ہو سکا۔ براہ کرم بعد میں دوبارہ کوشش کریں۔',
              'Registration payments could not be loaded. Please try again later.'
            )}
          </div>
        ) : filteredRegistrationPayments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
            <UserCheck className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {tr('कोई पंजीकरण शुल्क नहीं मिला', 'کوئی رجسٹریشن فیس نہیں ملی', 'No Registration Payments Found')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {tr(
                'रिकॉर्ड किए गए यूटीआर के साथ कोई अनुमोदित पंजीकरण नहीं मिला।',
                'ریکارڈ شدہ UTR کے ساتھ کوئی منظور شدہ رجسٹریشن نہیں ملی۔',
                'No approved registrations with a recorded UTR found matching your criteria.'
              )}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-4 whitespace-nowrap">
                      {tr('सदस्य विवरण', 'رکن کی تفصیلات', 'Member Details')}
                    </th>
                    <th className="px-4 py-4 whitespace-nowrap">
                      {tr('शुल्क एवं स्थिति', 'فیس اور حیثیت', 'Fee & Status')}
                    </th>
                    <th className="px-4 py-4 whitespace-nowrap">
                      {tr('समुदाय एवं जिला', 'برادری اور ضلع', 'Community & District')}
                    </th>
                    <th className="px-4 py-4 whitespace-nowrap">
                      {tr('भुगतान विधि एवं प्रमाण', 'ادائیگی کا طریقہ اور ثبوت', 'Payment & Reference')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                  {paginatedRegistrations.map((member) => (
                    <FinancialRegistrationRow
                      key={member.id}
                      member={member}
                      onViewProof={(url, title) => setPreviewProof({ url, title })}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <TablePagination
              currentPage={validRegistrationsPage}
              totalPages={totalRegistrationPages}
              totalItems={totalRegistrationItems}
              pageSize={pageSize}
              onPageChange={(page) => setRegistrationsPage(page)}
              onPageSizeChange={(size) => setPageSize(size)}
            />
          </div>
        )
      )}

      {/* Proof Lightbox Modal */}
      {previewProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate pr-2">
                {previewProof.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewProof.url}
                alt={previewProof.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="p-4 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {tr('भुगतान रसीद प्रमाण', 'ادائیگی کی رسید کا ثبوت', 'Payment Receipt Proof')}
              </span>
              <a
                href={previewProof.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <span>{tr('नई विंडो में खोलें', 'نئی ونڈو میں کھولیں', 'Open Full Image')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
