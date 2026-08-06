'use client';

import React, { useState, useEffect } from 'react';
import { PendingVerificationItem } from '../../types';
import { UserCheck, Check, Eye, CheckCircle2 } from 'lucide-react';
import { getPendingVerifications, approveVerification, rejectVerification } from '../../services/adminService';

export const ExecutiveDashboard: React.FC = () => {
  const [queue, setQueue] = useState<PendingVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  useEffect(() => {
    getPendingVerifications()
      .then(setQueue)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, approve: boolean) => {
    try {
      if (approve) {
        await approveVerification(id, 'Executive Officer');
      } else {
        await rejectVerification(id, 'Executive Officer');
      }
      setQueue((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 mb-2">
              <UserCheck className="w-4 h-4 text-purple-400" /> Executive Verification Officer
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Compliance &amp; Verification Portal
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Verify KYC documents, approve medical campaigns &amp; match bank UTR receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-purple-900/60 text-purple-200 text-xs font-bold border border-purple-400/30">
              Queue: {queue.length} Items Pending
            </span>
          </div>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900">Verification Work Queue</h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading queue from database...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">All Queue Items Verified!</p>
            <p className="text-xs">No pending KYC, campaigns or UTR screenshots.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold uppercase text-[10px]">
                      {item.type}
                    </span>
                    <span className="text-slate-400">• {item.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-slate-600 font-medium">{item.details}</p>
                  <p className="text-slate-400 text-[11px]">Submitted by: {item.submittedBy}</p>
                </div>

                <div className="flex items-center gap-2">
                  {item.documentUrl && (
                    <button
                      onClick={() => setSelectedDoc(item.documentUrl!)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Proof
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(item.id, true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve &amp; Issue Receipt
                  </button>
                  <button
                    onClick={() => handleAction(item.id, false)}
                    className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Inspector Lightbox Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full text-center space-y-4">
            <h4 className="font-bold text-base text-slate-900">Document Verification Inspector</h4>
            <div className="rounded-2xl overflow-hidden max-h-80 border border-slate-200">
              <img src={selectedDoc} alt="Document" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
