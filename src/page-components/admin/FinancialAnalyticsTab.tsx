import React, { useState, useEffect } from 'react';
import { Donation, User, UserRole } from '../../types';
import { getDonations } from '../../services/donationService';
import { Search, TrendingUp, IndianRupee, Users, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateCommunityName, translateCategory } from '../../lib/translateEntity';

interface FinancialAnalyticsTabProps {
  activeUser: User;
  currentRole: UserRole;
}

const FinancialDonationRow: React.FC<{ donation: Donation }> = ({ donation }) => {
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
        {donation.utrNumber && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono truncate max-w-[160px]">
            UTR: {donation.utrNumber}
          </div>
        )}
      </td>
    </tr>
  );
};

export const FinancialAnalyticsTab: React.FC<FinancialAnalyticsTabProps> = ({ activeUser, currentRole }) => {
  const { t, language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const allDonations = await getDonations();
      let filtered = allDonations;
      
      if (currentRole === 'community_admin' && activeUser?.communityName) {
        filtered = allDonations.filter(d => d.communityName === activeUser.communityName);
      }
      
      setDonations(filtered);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(
    (d) =>
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.utrNumber && d.utrNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.communityName && d.communityName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalAmount = filteredDonations.reduce((sum, d) => sum + (Number(d.amountINR) || 0), 0);
  const uniqueDonors = new Set(filteredDonations.map(d => d.donorId)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {tr('वित्तीय विश्लेषण', 'مالیاتی تجزیات', 'Financial Analytics')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tr('सभी दान लेन-देन एवं वित्तीय मैट्रिक्स का संपूर्ण अवलोकन।', 'تمام عطیات کے لین دین اور مالیاتی میٹرکس کا مکمل جائزہ۔', 'Overview of all donation transactions and financial metrics.')}
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('लेन-देन या यूटीआर खोजें...', 'لین دین یا UTR تلاش کریں...', 'Search transactions or UTR...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {tr('एकत्रित राशि', 'جمع شدہ رقم', 'Total Raised')}
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {tr('कुल दान', 'کل عطیات', 'Total Donations')}
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{filteredDonations.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {tr('सक्रिय दानदाता', 'فعال عطیہ دہندگان', 'Unique Donors')}
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{uniqueDonors}</p>
          </div>
        </div>
      </div>

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
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {tr('कोई लेनदेन नहीं मिला', 'کوئی لین دین نہیں ملا', 'No Transactions Found')}
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
                {filteredDonations.map((d) => (
                  <FinancialDonationRow key={d.id} donation={d} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
