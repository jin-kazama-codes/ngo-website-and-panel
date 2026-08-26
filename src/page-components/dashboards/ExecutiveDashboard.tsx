'use client';

import React, { useState, useEffect } from 'react';
import { PendingVerificationItem, User, UserRole } from '../../types';
import { UserCheck, Check, Eye, CheckCircle2, X, FileText, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { DarkListSkeleton } from '../../components/Skeletons';
import { getUnverifiedUsers, updateUser } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';

interface ExecutiveDashboardProps {
  activeUser?: User;
  currentRole?: UserRole;
}

interface KycItemWithUser extends PendingVerificationItem {
  rawUser?: User;
}

const KycQueueItem: React.FC<{
  item: KycItemWithUser;
  processingId: string | null;
  processingAction: 'approve' | 'reject' | null;
  onViewDetails: (item: KycItemWithUser) => void;
  onAction: (id: string, approve: boolean) => void;
}> = ({ item, processingId, processingAction, onViewDetails, onAction }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(item.submittedBy || '', language);
  const displayCity = useDynamicTranslatedText(item.rawUser?.city || '', language);
  const displayState = useDynamicTranslatedText(item.rawUser?.state || '', language);

  return (
    <div className="group p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
      <div className="flex items-start gap-4 flex-1">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
              {tr('सदस्य केवाईसी', 'صارف KYC', 'USER KYC')}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" /> {item.date}
            </span>
          </div>

          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
            {tr('नया सदस्य सत्यापन:', 'نئے صارف کی تصدیق:', 'New User Verification:')}{' '}
            <span className="text-purple-600 dark:text-purple-400">{displayName}</span>
          </h4>

          {item.rawUser ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {item.rawUser.email && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-400 font-semibold">{tr('ईमेल:', 'ای میل:', 'Email:')}</span>{' '}
                  {item.rawUser.email}
                </span>
              )}
              {item.rawUser.phone && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-400 font-semibold">{tr('फ़ोन:', 'فون:', 'Phone:')}</span>{' '}
                  {item.rawUser.phone}
                </span>
              )}
              {item.rawUser.city && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-400 font-semibold">{tr('शहर:', 'شہر:', 'City:')}</span>{' '}
                  {displayCity}
                </span>
              )}
              {item.rawUser.state && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-400 font-semibold">{tr('राज्य:', 'ریاست:', 'State:')}</span>{' '}
                  {displayState}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">{item.details}</p>
          )}

          <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{tr('द्वारा प्रस्तुत:', 'کی طرف سے جمع کردہ:', 'Submitted by:')}</span>
            <span className="text-slate-800 dark:text-slate-200">{displayName}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0">
        <button
          onClick={() => onViewDetails(item)}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>{tr('विवरण देखें', 'تفصیلات دیکھیں', 'View Details')}</span>
        </button>
        <button
          onClick={() => onAction(item.id, true)}
          disabled={processingId === item.id}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-2 shadow-md shadow-emerald-900/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {processingId === item.id && processingAction === 'approve' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{tr('स्वीकृत करें', 'منظور کریں', 'Approve')}</span>
        </button>
        <button
          onClick={() => onAction(item.id, false)}
          disabled={processingId === item.id}
          className="px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-500/20 hover:bg-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          {processingId === item.id && processingAction === 'reject' ? (
            <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          <span>{tr('अस्वीकार करें', 'مسترد کریں', 'Reject')}</span>
        </button>
      </div>
    </div>
  );
};

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ activeUser, currentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [queue, setQueue] = useState<KycItemWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<KycItemWithUser | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    getUnverifiedUsers()
      .then((users) => {
        let filteredUsers = users;
        if (currentRole === 'community_admin' && activeUser?.communityId) {
          filteredUsers = users.filter((u) => u.communityId === activeUser.communityId);
        }

        const mapped: KycItemWithUser[] = filteredUsers.map((u) => ({
          id: u.id,
          rawUser: u,
          type: 'kyc' as any,
          title: `New User Verification: ${u.name}`,
          submittedBy: u.name,
          date: u.joinDate || new Date().toISOString().split('T')[0],
          status: 'pending' as any,
          details: `Email: ${u.email || ''}\nPhone: ${u.phone || ''}\nCity: ${u.city || ''}\nState: ${u.state || ''}`,
          documentUrl: u.documentUrl,
          paymentMethod: u.paymentMethod,
          utr: u.paymentUtr,
          paymentScreenshotUrl: u.paymentScreenshotUrl,
        }));
        setQueue(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentRole, activeUser?.communityId]);

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
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                {tr('सदस्य केवाईसी सत्यापन', 'صارف KYC تصدیق', 'Member KYC Approvals')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {tr('आपके ध्यान की आवश्यकता वाले मामले', 'آپ کی توجہ کے طلب گار کیسز', 'Items requiring your administrative review')}
              </p>
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
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                {tr('सब कुछ अद्यतन है!', 'سب مکمل ہے!', 'All Caught Up!')}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                {tr('वर्तमान में कोई लंबित केवाईसी अनुरोध नहीं है।', 'اس وقت کوئی زیر التواء KYC درخواست نہیں ہے۔', 'No pending KYC verification requests at this moment.')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((item) => (
              <KycQueueItem
                key={item.id}
                item={item}
                processingId={processingId}
                processingAction={processingAction}
                onViewDetails={setSelectedItem}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Verification Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-3xl w-full shadow-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              <div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                  {tr('केवाईसी सत्यापन विवरण', 'KYC تصدیق کی تفصیلات', 'KYC Verification Details')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  {tr('आईडी:', 'شناخت:', 'ID:')} {selectedItem.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {tr('सदस्य नाम', 'صارف کا نام', 'Member Name')}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedItem.submittedBy}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {tr('ईमेल / फ़ोन', 'ای میل / فون', 'Email / Phone')}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedItem.rawUser?.email || selectedItem.rawUser?.phone || 'N/A'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {tr('जमा करने की तिथि', 'جمع کرانے کی تاریخ', 'Submission Date')}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">{selectedItem.date}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {tr('शहर एवं राज्य', 'شہر اور ریاست', 'City & State')}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                    {selectedItem.rawUser?.city || 'N/A'}, {selectedItem.rawUser?.state || 'N/A'}
                  </p>
                </div>
              </div>

              {selectedItem.documentUrl && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {tr('संलग्न केवाईसी दस्तावेज़ / प्रमाण', 'منسلک KYC دستاویز / ثبوت', 'Attached KYC Proof Document')}
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[220px]">
                    {selectedItem.documentUrl.toLowerCase().endsWith('.pdf') ? (
                      <div className="flex flex-col items-center gap-3 py-8 text-slate-500 dark:text-slate-400">
                        <FileText className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">PDF Document Attached</p>
                        <a
                          href={selectedItem.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-colors"
                        >
                          {tr('PDF नए टैब में खोलें', 'PDF کو نئے ٹیب میں کھولیں', 'Open PDF in New Tab')}
                        </a>
                      </div>
                    ) : (
                      <img
                        src={selectedItem.documentUrl}
                        alt="Document Proof"
                        className="max-w-full rounded-xl shadow-sm object-contain max-h-[45vh]"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3 shrink-0 bg-white dark:bg-slate-900">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {tr('बंद करें', 'بند کریں', 'Close')}
              </button>
              <button
                onClick={() => handleAction(selectedItem.id, false)}
                disabled={processingId === selectedItem.id}
                className="px-6 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-sm border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {processingId === selectedItem.id && processingAction === 'reject' ? (
                  <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span>{tr('अस्वीकार करें', 'مسترد کریں', 'Reject')}</span>
              </button>
              <button
                onClick={() => handleAction(selectedItem.id, true)}
                disabled={processingId === selectedItem.id}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 shadow-md shadow-emerald-500/20 dark:shadow-emerald-900/50 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {processingId === selectedItem.id && processingAction === 'approve' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span>{tr('स्वीकृत एवं सत्यापित करें', 'منظور اور تصدیق کریں', 'Approve & Verify')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
