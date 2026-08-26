'use client';

import React, { useState, useEffect } from 'react';
import { User, Donation } from '../types';
import { ShieldCheck, Download, CheckCircle2, QrCode, X, Sparkles, Building2 } from 'lucide-react';
import { getUserById } from '../services/userService';

interface MembershipCardModalProps {
  user: User;
  onClose: () => void;
}

export const MembershipCardModal: React.FC<MembershipCardModalProps> = ({ user: initialUser, onClose }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [loading, setLoading] = useState(true);

  console.log("initial user from card modal", initialUser);

  useEffect(() => {
    let isMounted = true;
    getUserById(initialUser.id)
      .then((realUser) => {
        if (isMounted && realUser) {
          setUser(realUser);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [initialUser.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Government Recognized NGO Card
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Digital Membership Card</h3>
          <p className="text-sm text-slate-500">Official MFCT Community ID</p>
        </div>

        {/* Digital Card Preview */}
        <div className="p-6 rounded-2xl text-white shadow-xl relative overflow-hidden transition-all bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30">
          {loading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Card Glass Accent */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-lg shadow-md">
                M
              </div>
              <div>
                <h4 className="font-bold text-base tracking-tight text-white leading-none">MFCT</h4>
                <span className="text-[10px] text-slate-300 tracking-wider uppercase font-medium">Community Network</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Member
            </span>
          </div>

          <div className="flex items-start gap-4 mb-6 relative z-10">
            <img
              src={user.avatar || 'https://via.placeholder.com/150'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-md bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-lg text-white truncate">{user.name}</h5>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{user.communityName || 'Unassigned Community'}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{user.city || 'Unknown City'}, {user.state || 'Unknown State'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Member ID</span>
              <span className="font-mono font-bold text-emerald-300">{user.membershipId}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Member Since</span>
              <span className="font-semibold text-slate-200">{user.joinDate || 'N/A'}</span>
            </div>
            <div className="bg-white p-1 rounded-lg">
              <QrCode className="w-8 h-8 text-slate-900" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Download / Print ID
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReceiptModalProps {
  donation: Donation;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ donation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl relative border border-slate-200 text-slate-800 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xl shadow-md">
              S
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900 leading-tight">MFCT Foundation</h3>
              <p className="text-xs text-slate-500">Regd NGO under Section 8 | 80G Tax Exempted</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
              OFFICIAL RECEIPT
            </span>
            <p className="text-xs font-mono text-slate-500 mt-1">{donation.receiptNumber}</p>
          </div>
        </div>

        {/* Donation Summary Table */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100 text-sm space-y-3">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Donor Name:</span>
            <span className="font-semibold text-slate-900">{donation.donorName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Campaign / Cause:</span>
            <span className="font-semibold text-slate-900 text-right max-w-[280px]">{donation.campaignTitle}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Donation Category:</span>
            <span className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-medium text-xs">
              {donation.category}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="font-mono text-xs text-slate-800">{donation.transactionId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Bank UTR Number:</span>
            <span className="font-mono text-xs text-slate-800">{donation.utrNumber}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Payment Date:</span>
            <span className="text-slate-800">{donation.date}</span>
          </div>
          <div className="flex justify-between pt-2 text-base">
            <span className="font-bold text-slate-900">Total Donated Amount:</span>
            <span className="font-bold text-emerald-700 text-xl">₹{donation.amountINR.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Verification Stamp */}
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Audit & Verification Complete</p>
              <p className="text-[11px] text-emerald-700">Verified by Executive Team & Bank Escrow</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <span className="font-serif italic font-bold text-slate-700 text-xs block">SevaSangam Audit Seal</span>
            <span>Digitally Signed</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF Receipt
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
