import React, { useState, useEffect } from 'react';
import { Donation, User, UserRole } from '../../types';
import { getDonations, updateDonationStatus } from '../../services/donationService';
import { CheckCircle, XCircle, Search, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';

interface UtrAuditTabProps {
  activeUser?: User;
  currentRole?: UserRole;
}

export const UtrAuditTab: React.FC<UtrAuditTabProps> = ({ activeUser, currentRole }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
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
  }, []);

  const fetchPendingDonations = async () => {
    setLoading(true);
    try {
      const allDonations = await getDonations();
      let pending = allDonations.filter(d => d.status === 'pending_verification');
      
      if (currentRole === 'community_admin' && activeUser?.communityName) {
        pending = pending.filter(d => d.communityName === activeUser.communityName);
      }
      
      setDonations(pending);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (id: string) => {
    setConfirmAction({ id, type: 'verify' });
  };

  const handleReject = (id: string) => {
    setConfirmAction({ id, type: 'reject' });
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    const { id, type } = confirmAction;
    try {
      await updateDonationStatus(id, type === 'verify' ? 'verified' : 'rejected');
      setDonations(donations.filter(d => d.id !== id));
      if (selectedDonation?.id === id) setSelectedDonation(null);
      showToast(`Payment ${type === 'verify' ? 'verified successfully!' : 'rejected.'}`, 'success');
    } catch (err) {
      console.error(err);
      showToast(`Failed to ${type} payment.`);
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  const filteredDonations = donations.filter(
    (d) =>
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">UTR Payment Desk</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verify manual UPI/Bank transfer payments.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search UTR, Donor, Campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors shadow-sm"
          />
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
                  <th className="px-4 py-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div></th>
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
                    <td className="px-4 py-4 text-right flex justify-end gap-2">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm transition-colors">
          <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Pending Payments</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">All UTR payments have been verified.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4 whitespace-nowrap">Donor Details</th>
                  <th className="px-4 py-4 whitespace-nowrap">Payment Info</th>
                  <th className="px-4 py-4 whitespace-nowrap">Campaign</th>
                  <th className="px-4 py-4 whitespace-nowrap text-right">Actions</th>
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
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                        UTR: {d.utrNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-slate-900 dark:text-white max-w-[200px] truncate" title={d.campaignTitle}>
                        {d.campaignTitle}
                      </div>
                      <div className="text-xs text-slate-500">{d.category}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDonation(d)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-xs font-bold cursor-pointer"
                          title="View Screenshot Details"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleReject(d.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Reject Payment"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleVerify(d.id)}
                          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors cursor-pointer"
                          title="Verify Payment"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Details</h3>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Donor Name</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{selectedDonation.donorName}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Amount</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{selectedDonation.amountINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">UTR Number</span>
                  <span className="text-sm font-mono text-slate-900 dark:text-slate-200 select-all">{selectedDonation.utrNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Date</span>
                  <span className="text-sm text-slate-900 dark:text-slate-200">{new Date(selectedDonation.date).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl col-span-2">
                  <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Target Campaign</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{selectedDonation.campaignTitle}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] uppercase text-slate-500 font-bold mb-2">Payment Screenshot</span>
                {selectedDonation.paymentScreenshotUrl ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[200px]">
                    <img 
                      src={selectedDonation.paymentScreenshotUrl} 
                      alt="Payment Screenshot" 
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center text-slate-500">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">No screenshot provided</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
              <button
                onClick={() => handleReject(selectedDonation.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-500 font-bold text-sm transition-colors border border-rose-200 dark:border-rose-500/20 cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => handleVerify(selectedDonation.id)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/20 cursor-pointer"
              >
                Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Confirm Action</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to {confirmAction.type} this payment? This action cannot be undone.
            </p>
            <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  disabled={processing}
                >Cancel
              </button>
                <button
                  onClick={executeAction}
                  className={`px-6 py-2 rounded-xl text-white font-bold text-sm transition-colors flex items-center justify-center min-w-[120px] cursor-pointer ${
                    confirmAction.type === 'verify' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Yes, ${confirmAction.type === 'verify' ? 'Verify' : 'Reject'}`}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] text-sm font-bold text-white transition-all transform duration-300 ease-out ${
          toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
        }`}>
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};
