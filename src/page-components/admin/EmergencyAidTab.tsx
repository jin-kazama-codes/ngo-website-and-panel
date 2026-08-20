import React, { useState, useEffect } from 'react';
import { User, Community } from '../../types';
import { CheckCircle2, PlusCircle, Clock, X } from 'lucide-react';
import { updateEmergencyAidStatus, submitEmergencyAidRequest, getEmergencyAidRequests } from '../../services/adminService';
import { getCommunities } from '../../services/communityService';

interface EmergencyAidTabProps {
  activeUser: User;
  currentRole?: string;
}

export const EmergencyAidTab: React.FC<EmergencyAidTabProps> = ({ activeUser, currentRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(activeUser.communityId || '');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = currentRole === 'super_admin' || currentRole === 'executive_admin' || currentRole === 'community_admin';

  const fetchRequests = async () => {
    try {
      const allReqs = await getEmergencyAidRequests();
      let userReqs = allReqs;
      
      if (!isAdmin) {
        userReqs = allReqs.filter(r => 
          r.member_id === activeUser.id || 
          r.memberId === activeUser.id || 
          r.created_by === activeUser.id || 
          r.createdBy === activeUser.id
        );
      } else if (currentRole === 'community_admin') {
        userReqs = allReqs.filter(r => 
          r.community_id === activeUser.communityId || 
          r.communityId === activeUser.communityId
        );
      }
      setRequests(userReqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string | number, isApprove: boolean) => {
    try {
      setProcessingId(id.toString());
      const newStatus = isApprove ? 'approved' : 'rejected';
      await updateEmergencyAidStatus(id, newStatus);
      showToast(`Request ${isApprove ? 'approved' : 'rejected'} successfully`, 'success');
      fetchRequests();
    } catch (err) {
      console.error('Failed to update request status:', err);
      showToast('Failed to update request status.');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
    getCommunities().then((data) => {
      if (data && data.length > 0) {
        setCommunities(data);
        if (!selectedCommunityId || !data.find(c => c.id === selectedCommunityId)) {
          setSelectedCommunityId(data[0].id);
        }
      }
    }).catch(console.error);
  }, [activeUser.id]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] text-sm font-bold text-white transition-all transform duration-300 ease-out ${
          toastMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
        }`}>
          {toastMessage.message}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Verified Member Privilege</span>
          <h2 className="text-xl font-black text-white">{isAdmin ? 'Manage Emergency Aid' : 'Emergency Aid Requests'}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin ? 'Review and manage community aid requests.' : 'Track your community aid requests or apply for urgent assistance.'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Create Request
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
            <p className="text-slate-400 text-sm">You haven't submitted any emergency aid requests yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div key={req.id as string} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {(req.aid_category || req.aidCategory) as string}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${req.status === 'pending' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      req.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                    {req.status === 'pending' && <Clock className="w-3 h-3" />}
                    {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                    {(req.status as string).toUpperCase()}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white mt-1">₹{((req.estimated_amount_inr || req.estimatedAmountINR) as number).toLocaleString('en-IN')}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{req.description as string}</p>
                <div className="text-[10px] font-bold text-slate-500 mt-2">
                  Community: {(req.community_name || req.communityName) as string}
                </div>
                <div className="text-[10px] font-bold text-slate-500">
                  Applied on: {new Date((req.created_at || req.createdAt) as string).toLocaleDateString('en-IN')}
                </div>
                {isAdmin && (
                  <div className="text-[10px] font-bold text-slate-500 mt-1">
                    Member Name: {(req.member_name || req.memberName) as string}
                  </div>
                )}
                {isAdmin && req.status === 'pending' && (
                  <div className="pt-3 mt-auto border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleAction(req.id as string | number, true)}
                      disabled={processingId === String(req.id)}
                      className="px-3 py-1.5 text-[10px] font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id as string | number, false)}
                      disabled={processingId === String(req.id)}
                      className="px-3 py-1.5 text-[10px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-800 max-h-[92vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Verified Member Privilege</span>
              <h2 className="text-xl font-black text-white mt-1">Apply for Community Emergency Aid</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your active ₹50 membership qualifies your family for urgent medical, education, or funeral assistance.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const category = (form.elements.namedItem('aidCategory') as HTMLSelectElement).value;
                const amount = parseInt((form.elements.namedItem('aidAmount') as HTMLInputElement).value, 10) || 0;
                const desc = (form.elements.namedItem('aidDesc') as HTMLTextAreaElement).value;

                const activeCommunity = communities.find(c => c.id === selectedCommunityId) || { id: activeUser.communityId, name: activeUser.communityName };

                try {
                  await submitEmergencyAidRequest({
                    memberId: activeUser.id,
                    memberName: activeUser.name,
                    communityId: activeCommunity.id,
                    communityName: activeCommunity.name,
                    aidCategory: category,
                    estimatedAmountINR: amount,
                    description: desc,
                  });
                  fetchRequests(); // Refresh the list
                  showToast('Aid Request Submitted Successfully!', 'success');
                  handleCloseModal();
                } catch (err) {
                  console.error(err);
                  showToast('Failed to submit aid request. Please try again.', 'error');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Community</label>
                <select
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl outline-none focus:border-emerald-500"
                >
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Aid Category</label>
                <select name="aidCategory" className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl outline-none focus:border-emerald-500">
                  <option>Medical Surgery / ICU Emergency</option>
                  <option>Janazah Funeral Expenses & Ambulance</option>
                  <option>Bridal Dignity & Nikah Aid</option>
                  <option>School / Orphan Education Fees</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Estimated Amount Required (₹)</label>
                <input
                  name="aidAmount"
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Detailed Explanation & Hospital Details</label>
                <textarea
                  name="aidDesc"
                  rows={3}
                  required
                  placeholder="Describe the medical condition or emergency..."
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                >
                  Submit Emergency Aid Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
