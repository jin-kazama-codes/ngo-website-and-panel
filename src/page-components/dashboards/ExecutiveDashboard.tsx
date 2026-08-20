'use client';

import React, { useState, useEffect } from 'react';
import { PendingVerificationItem, User, UserRole } from '../../types';
import { UserCheck, Check, Eye, CheckCircle2, X, FileText, ShieldCheck } from 'lucide-react';
import { DarkListSkeleton } from '../../components/Skeletons';
import { getUnverifiedUsers, updateUser } from '../../services/userService';

interface ExecutiveDashboardProps {
  activeUser?: User;
  currentRole?: UserRole;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ activeUser, currentRole }) => {
  const [queue, setQueue] = useState<PendingVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PendingVerificationItem | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);


  useEffect(() => {
    getUnverifiedUsers()
      .then((users) => {
        let filteredUsers = users;
        if (currentRole === 'community_admin' && activeUser?.communityId) {
          filteredUsers = users.filter(u => u.communityId === activeUser.communityId);
        }

        const mapped = filteredUsers.map(u => ({
          id: u.id,
          type: 'kyc' as any,
          title: `New User Verification: ${u.name}`,
          submittedBy: u.name,
          date: u.joinDate || new Date().toISOString().split('T')[0],
          status: 'pending' as any,
          details: `Email: ${u.email}\nPhone: ${u.phone}\nCity: ${u.city}\nState: ${u.state}`,
          documentUrl: u.documentUrl,
          paymentMethod: u.paymentMethod,
          utr: u.paymentUtr,
          paymentScreenshotUrl: u.paymentScreenshotUrl,
        }));
        setQueue(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, approve: boolean) => {
    try {
      setProcessingId(id);
      setProcessingAction(approve ? 'approve' : 'reject');
      if (approve) {
        await updateUser(id, { isVerified: true });
      }
      setQueue((prev) => prev.filter((q) => q.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };



  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* Verification Queue Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-6">

        {/* Header & Filters */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Members Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Items requiring your attention</p>
            </div>
          </div>


        </div>

        {/* Queue Items */}
        {loading ? (
          <DarkListSkeleton items={4} />
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">All Caught Up!</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">No pending items in the queue. Great job keeping the platform verified.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((item) => (
              <div
                key={item.id}
                className="group p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"
              >
                {/* Decorative side bar */}


                <div className="flex items-start gap-4 flex-1 pl-2">


                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20`}>
                        USER KYC
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" /> {item.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{item.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">{item.details}</p>

                    <div className="flex items-center gap-1.5 mt-2 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <UserCheck className="w-3.5 h-3.5" />
                      Submitted by: <span className="text-slate-800 dark:text-slate-200">{item.submittedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0 pl-2 lg:pl-0">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500 flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" /> View Details
                  </button>
                  <button
                    onClick={() => handleAction(item.id, true)}
                    disabled={processingId === item.id}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-2 shadow-md shadow-emerald-900/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === item.id && processingAction === 'approve' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(item.id, false)}
                    disabled={processingId === item.id}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {processingId === item.id && processingAction === 'reject' ? (
                      <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-[2rem] max-w-3xl w-full shadow-2xl relative overflow-hidden border border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
              <div className="flex items-center gap-3">

                <div>
                  <h4 className="font-bold text-lg text-white">Verification Details</h4>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{selectedItem.type} • {selectedItem.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Title</p>
                  <p className="text-sm font-semibold text-white">{selectedItem.title}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Submitted By</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    {selectedItem.submittedBy}
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Submission Date</p>
                  <p className="text-sm font-semibold text-slate-300">{selectedItem.date}</p>
                </div>

                {selectedItem.amountINR && (
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Amount (INR)</p>
                    <p className="text-sm font-semibold text-emerald-400">₹{selectedItem.amountINR.toLocaleString()}</p>
                  </div>
                )}

                {selectedItem.paymentMethod && (
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Payment Method</p>
                    <p className="text-sm font-semibold text-emerald-400">{selectedItem.paymentMethod}</p>
                  </div>
                )}

                {selectedItem.utr && (
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500">UTR / Reference No.</p>
                    <p className="text-sm font-mono text-slate-300">{selectedItem.utr}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500">Additional Details</p>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">{selectedItem.details}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedItem.documentUrl && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Attached Proof / Document</p>
                    <div className="bg-slate-950 flex items-center justify-center p-2 rounded-2xl border border-slate-700 overflow-hidden min-h-[200px]">
                      {selectedItem.documentUrl.toLowerCase().endsWith('.pdf') ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
                          <FileText className="w-12 h-12 text-slate-500" />
                          <p className="text-sm font-semibold text-white">PDF Document Attached</p>
                          <a href={selectedItem.documentUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-colors">
                            Open PDF in New Tab
                          </a>
                        </div>
                      ) : (
                        <img src={selectedItem.documentUrl} alt="Document Proof" className="max-w-full rounded-xl shadow-sm object-contain max-h-[40vh]" />
                      )}
                    </div>
                  </div>
                )}

                {selectedItem.paymentScreenshotUrl && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Payment Screenshot</p>
                    <div className="bg-slate-950 flex items-center justify-center p-2 rounded-2xl border border-slate-700 overflow-hidden min-h-[200px]">
                      {selectedItem.paymentScreenshotUrl.toLowerCase().endsWith('.pdf') ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
                          <FileText className="w-12 h-12 text-slate-500" />
                          <p className="text-sm font-semibold text-white">PDF Screenshot Attached</p>
                          <a href={selectedItem.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-colors">
                            Open PDF in New Tab
                          </a>
                        </div>
                      ) : (
                        <img src={selectedItem.paymentScreenshotUrl} alt="Payment Screenshot" className="max-w-full rounded-xl shadow-sm object-contain max-h-[40vh]" />
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="p-4 sm:p-6 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3 shrink-0 bg-slate-900">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAction(selectedItem.id, false);
                }}
                disabled={processingId === selectedItem.id}
                className="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-bold text-sm border border-rose-500/20 hover:bg-rose-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {processingId === selectedItem.id && processingAction === 'reject' ? (
                  <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                ) : null}
                Reject
              </button>
              <button
                onClick={() => {
                  handleAction(selectedItem.id, true);
                }}
                disabled={processingId === selectedItem.id}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 shadow-md shadow-emerald-900/50 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {processingId === selectedItem.id && processingAction === 'approve' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Approve & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
