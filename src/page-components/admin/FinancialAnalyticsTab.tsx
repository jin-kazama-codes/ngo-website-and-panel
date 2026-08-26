import React, { useState, useEffect } from 'react';
import { Donation, User, UserRole } from '../../types';
import { getDonations } from '../../services/donationService';
import { Search, TrendingUp, IndianRupee, Users, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FinancialAnalyticsTabProps {
  activeUser: User;
  currentRole: UserRole;
}

export const FinancialAnalyticsTab: React.FC<FinancialAnalyticsTabProps> = ({ activeUser, currentRole }) => {
  const { t } = useLanguage();
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('admin.tabFinancialAnalytics', 'Financial Analytics')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('admin.platformMasterDesc', 'Overview of all donation transactions and financial metrics.')}</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('admin.searchPlaceholder', 'Search transactions...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t('card.raised', 'Total Raised')}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t('admin.statTotalCampaigns', 'Total Donations')}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{filteredDonations.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t('admin.statActiveMembers', 'Unique Donors')}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{uniqueDonors}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors animate-pulse">
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Transactions Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">There are no donations matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4 whitespace-nowrap">Donor Details</th>
                  <th className="px-4 py-4 whitespace-nowrap">Amount & Status</th>
                  <th className="px-4 py-4 whitespace-nowrap">Campaign & Community</th>
                  <th className="px-4 py-4 whitespace-nowrap">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{d.donorName}</div>
                      <div className="text-xs text-slate-500">{new Date(d.date).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-400/10 px-2 py-0.5 rounded">
                          ₹{d.amountINR.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          d.status === 'verified' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          d.status === 'pending_verification' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-slate-900 dark:text-white max-w-[200px] truncate" title={d.campaignTitle}>
                        {d.campaignTitle}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={d.communityName}>
                        {d.communityName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-700 dark:text-slate-300">{d.paymentMethod}</div>
                      {d.utrNumber && (
                        <div className="text-xs text-slate-500 mt-1 font-mono truncate max-w-[150px]">
                          UTR: {d.utrNumber}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
