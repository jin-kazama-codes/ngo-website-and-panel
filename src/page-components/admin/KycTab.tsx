'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, FemaleFamilyMember } from '../../types';
import {
  UserCheck,
  Check,
  Eye,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Receipt,
  Calendar,
  Sparkles,
  Heart,
  Award,
  Search,
  RotateCcw,
  ExternalLink,
  Copy,
  Clock,
  IdCard,
  User as UserIcon,
  Image as ImageIcon,
  AlertCircle,
  Filter,
  XCircle,
  Trash2,
  UserX,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Table as TableIcon,
  Users,
} from 'lucide-react';
import { DarkListSkeleton } from '../../components/Skeletons';
import { getUsers, updateUser, deleteUser } from '../../services/userService';
import { getFemaleFamilyMembers, updateFemaleFamilyMember } from '../../services/memberService';
import { useLanguage } from '../../context/LanguageContext';
import { useAppState } from '../../providers/AppStateProvider';
import { STANDARD_DISTRICTS } from '../../data/districtsData';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateReligion, translateHelpType, translateDistrictRole } from '../../lib/translateEntity';

interface ExecutiveDashboardProps {
  activeUser?: User;
  currentRole?: UserRole;
}

type VerificationFilter = 'all' | 'pending' | 'approved' | 'rejected';

// ─── 1. Subcomponent: Interactive Dynamic KYC User Card ─────────────────────────
const KycUserCard: React.FC<{
  user: User;
  canPerformKycAction: boolean;
  processingId: string | null;
  processingAction: 'approve' | 'reject' | null;
  terminating: boolean;
  onView: (u: User) => void;
  onApprove: (id: string) => void;
  onOpenReject: (u: User) => void;
  onOpenTerminate: (u: User) => void;
}> = ({
  user: u,
  canPerformKycAction,
  processingId,
  processingAction,
  terminating,
  onView,
  onApprove,
  onOpenReject,
  onOpenTerminate,
}) => {
    const { language } = useLanguage();
    const tr = (hi: string, ur: string, en: string) => {
      if (language === 'hi') return hi;
      if (language === 'ur') return ur;
      return en;
    };

    // Dynamic Translations for User Name, City, District, State, and Community
    const displayName = useDynamicTranslatedText(u.name, language) || u.name;
    const displayCity = useDynamicTranslatedText(u.city, language) || u.city;
    const displayDistrict = u.district ? (useDynamicTranslatedText(u.district, language) || u.district) : '';
    const displayState = useDynamicTranslatedText(u.state, language) || u.state;
    const displayCommunity = u.communityName ? (useDynamicTranslatedText(u.communityName, language) || u.communityName) : '';

    const locationText = [displayCity, displayState].filter(Boolean).join(', ');

    const uStatus = u.status || (u.isVerified ? 'approved' : 'pending');
    const isApproved = uStatus === 'approved';
    const isRejected = uStatus === 'reject' || uStatus === 'rejected';
    const hasAadhaar = !!(u.aadhaarFrontUrl || u.aadhaarBackUrl);
    const hasScreenshot = !!u.paymentScreenshotUrl;

    const translatedReligion = translateReligion(u.religion, language);
    const translatedHelpType = translateHelpType(u.helpType, language);

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        {/* Left: Avatar & Member Info */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Avatar */}
          <div className="relative w-12 h-12 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm border border-purple-200 dark:border-purple-800">
            {u.avatar ? (
              <img
                src={u.avatar}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span>{(displayName || 'U').trim().charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Member Details */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">
                {displayName}
              </h4>

              {/* Status Badge */}
              {isApproved ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{tr('स्वीकृत / सत्यापित', 'تصدیق شدہ', 'Approved & Verified')}</span>
                </span>
              ) : isRejected ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-600" />
                  <span>{tr('अस्वीकृत', 'مسترد شدہ', 'Rejected')}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>{tr('स्वीकृति लंबित', 'زیر التواء', 'Pending Approval')}</span>
                </span>
              )}

              {/* Religion Badge */}
              {u.religion && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {translatedReligion || u.religion}
                </span>
              )}

              {/* Malik-e-Nisab Tag */}
              {u.religion === 'Muslim' && (
                u.isMalikENisab ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200">
                    {tr('मालिक-ए-निसाब', 'صاحبِ نصاب', 'Malik-e-Nisab')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200">
                    {tr(
                      `मदद पात्र (${translatedHelpType || tr('सामान्य', 'عام', 'General')})`,
                      `امداد کے اہل (${translatedHelpType || tr('عام', 'عام', 'General')})`,
                      `Eligible for Aid (${translatedHelpType || 'General'})`
                    )}
                  </span>
                )
              )}

              {/* Community badge if available */}
              {displayCommunity && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate max-w-[160px]">{displayCommunity}</span>
                </span>
              )}
            </div>

            {/* Contact & Location Info */}
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              {u.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{u.phone}</span>
                </span>
              )}
              {u.email && (
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{u.email}</span>
                </span>
              )}
              {locationText && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{locationText}</span>
                </span>
              )}
              {u.membershipId && (
                <span className="font-mono text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                  #{u.membershipId}
                </span>
              )}
            </div>

            {/* Payment & Documents mini indicator */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
              {u.paymentUtr && (
                <span className="font-mono bg-slate-200/80 dark:bg-slate-700/80 px-2 py-0.5 rounded text-[10px] text-slate-800 dark:text-slate-200 font-bold">
                  UTR: {u.paymentUtr}
                </span>
              )}
              {hasAadhaar && (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-0.5">
                  <IdCard className="w-3 h-3" /> {tr('आधार संलग्न', 'آدھار منسلک', 'Aadhaar Attached')}
                </span>
              )}
              {hasScreenshot && (
                <span className="text-purple-700 dark:text-purple-400 font-bold text-[10px] flex items-center gap-0.5">
                  <Receipt className="w-3 h-3" /> {tr('भुगतान प्रमाण', 'ادائیگی ثبوت', 'Payment Proof')}
                </span>
              )}
            </div>

            {/* Rejection Reason notice if rejected */}
            {isRejected && (u.rejectionReason || u.rejection_reason) && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-rose-700 dark:text-rose-400 bg-rose-50/90 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 max-w-2xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div>
                  <span className="font-bold">{tr('अस्वीकृति कारण:', 'مسترد کرنے کی وجہ:', 'Rejection Reason:')} </span>
                  <span>{u.rejectionReason || u.rejection_reason}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 justify-end flex-wrap">
          {/* View Details Button */}
          <button
            onClick={() => onView(u)}
            className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{tr('पूर्ण विवरण देखें', 'مکمل تفصیلات', 'View Full Details')}</span>
          </button>

          {/* Action buttons restricted to Super Admin, Executive Admin & District Coordinator */}
          {canPerformKycAction && (
            <>
              {/* Approve Button (Visible for Pending and Rejected) */}
              {!isApproved && (
                <button
                  onClick={() => onApprove(u.id)}
                  disabled={processingId === u.id}
                  className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  {processingId === u.id && processingAction === 'approve' ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{isRejected ? tr('पुनः स्वीकृत करें', 'دوبارہ منظور کریں', 'Re-Approve') : tr('स्वीकृत करें', 'منظور کریں', 'Approve')}</span>
                </button>
              )}

              {/* Reject / Revoke Button */}
              <button
                onClick={() => onOpenReject(u)}
                disabled={processingId === u.id || terminating}
                className="cursor-pointer px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-800/60 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>
                  {isApproved
                    ? tr('सत्यापन हटाएं', 'منسوخ کریں', 'Revoke / Reject')
                    : isRejected
                      ? tr('कारण संपादित करें', 'وجہ تبدیل کریں', 'Edit Reason')
                      : tr('अस्वीकार करें', 'مسترد کریں', 'Reject')}
                </span>
              </button>

              {/* Terminate Button */}
              <button
                onClick={() => onOpenTerminate(u)}
                disabled={processingId === u.id || terminating}
                className="cursor-pointer px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-bold text-xs flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700 hover:border-rose-300 disabled:opacity-50"
                title={tr('खाता समाप्त करें (हटाएं)', 'اکاؤنٹ ختم کریں', 'Terminate & Delete')}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>{tr('समाप्त करें', 'ختم کریں', 'Terminate')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

// ─── 1b. Subcomponent: KYC Table Pagination ──────────────────────────────────
const KycPagination: React.FC<{
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-xs rounded-b-2xl">
      <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400">
        <span>
          {tr('दिखा रहे हैं', 'دکھا رہے ہیں', 'Showing')}{' '}
          <strong className="font-bold text-slate-800 dark:text-slate-200">{startItem}</strong>
          {' - '}
          <strong className="font-bold text-slate-800 dark:text-slate-200">{endItem}</strong>
          {' '}{tr('कुल', 'کل', 'of')}{' '}
          <strong className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</strong>
          {' '}{tr('सदस्य', 'اراکین', 'members')}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-[11px]">{tr('प्रति पृष्ठ:', 'فی صفحہ:', 'Per page:')}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label={tr('प्रति पृष्ठ रिकॉर्ड्स संख्या', 'فی صفحہ ریکارڈز کی تعداد', 'Records per page')}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-white outline-none cursor-pointer focus:border-purple-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 self-center sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-xs'
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
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title={tr('अगला पृष्ठ', 'اگلا صفحہ', 'Next Page')}
        >
          <span className="hidden sm:inline">{tr('अगला', 'اگلا', 'Next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── 1c. Subcomponent: Interactive Dynamic KYC User Table Row ─────────────────
const KycUserTableRow: React.FC<{
  user: User;
  canPerformKycAction: boolean;
  processingId: string | null;
  processingAction: 'approve' | 'reject' | null;
  terminating: boolean;
  onView: (u: User) => void;
  onApprove: (id: string) => void;
  onOpenReject: (u: User) => void;
  onOpenTerminate: (u: User) => void;
  onPreviewImage: (preview: { url: string; title: string }) => void;
}> = ({
  user: u,
  canPerformKycAction,
  processingId,
  processingAction,
  terminating,
  onView,
  onApprove,
  onOpenReject,
  onOpenTerminate,
  onPreviewImage,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(u.name, language) || u.name;
  const displayCity = useDynamicTranslatedText(u.city, language) || u.city;
  const displayDistrict = u.district ? (useDynamicTranslatedText(u.district, language) || u.district) : '';
  const displayState = useDynamicTranslatedText(u.state, language) || u.state;
  const displayCommunity = u.communityName ? (useDynamicTranslatedText(u.communityName, language) || u.communityName) : '';

  const locationText = [displayCity, displayDistrict || displayState].filter(Boolean).join(', ');

  const uStatus = u.status || (u.isVerified ? 'approved' : 'pending');
  const isApproved = uStatus === 'approved';
  const isRejected = uStatus === 'reject' || uStatus === 'rejected';
  const hasAadhaar = !!(u.aadhaarFrontUrl || u.aadhaarBackUrl);
  const hasScreenshot = !!u.paymentScreenshotUrl;

  const translatedReligion = translateReligion(u.religion, language);
  const translatedHelpType = translateHelpType(u.helpType, language);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
      {/* 1. Applicant Details */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs border border-purple-200 dark:border-purple-800">
            {u.avatar ? (
              <img
                src={u.avatar}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span>{(displayName || 'U').trim().charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[180px]">
              {displayName}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {u.membershipId ? (
                <span className="font-mono text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                  #{u.membershipId}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 italic">No ID</span>
              )}
            </div>
            {u.joinDate && (
              <div className="text-[10px] text-slate-400 mt-0.5">
                {u.joinDate}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* 2. Contact & Location */}
      <td className="px-4 py-3.5">
        <div className="space-y-1">
          {u.phone && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{u.phone}</span>
            </div>
          )}
          {u.email && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]" title={u.email}>
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{u.email}</span>
            </div>
          )}
          {locationText && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate max-w-[180px]">{locationText}</span>
            </div>
          )}
          {displayCommunity && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              <Building2 className="w-2.5 h-2.5" />
              <span className="truncate max-w-[140px]">{displayCommunity}</span>
            </span>
          )}
        </div>
      </td>

      {/* 3. Category & Aid */}
      <td className="px-4 py-3.5">
        <div className="space-y-1">
          {u.religion && (
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {translatedReligion || u.religion}
            </span>
          )}
          {u.religion === 'Muslim' && (
            <div>
              {u.isMalikENisab ? (
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {tr('मालिक-ए-निसाब', 'صاحبِ نصاب', 'Malik-e-Nisab')}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {tr(
                    `पात्र (${translatedHelpType || tr('सामान्य', 'عام', 'General')})`,
                    `اہل (${translatedHelpType || tr('عام', 'عام', 'General')})`,
                    `Aid (${translatedHelpType || 'General'})`
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* 4. Documents & Payment / UTR */}
      <td className="px-4 py-3.5">
        <div className="space-y-1.5">
          {/* Aadhaar Indicator / Preview Button */}
          {hasAadhaar ? (
            <button
              type="button"
              onClick={() =>
                onPreviewImage({
                  url: u.aadhaarFrontUrl || u.aadhaarBackUrl || '',
                  title: `${displayName} - ${tr('आधार कार्ड', 'آدھار کارڈ', 'Aadhaar Card')}`,
                })
              }
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <IdCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>{tr('आधार देखें', 'آدھار دیکھیں', 'View Aadhaar')}</span>
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 italic">
              {tr('आधार अनुपलब्ध', 'آدھار موجود نہیں', 'No Aadhaar')}
            </span>
          )}

          {/* Payment & UTR */}
          {u.paymentUtr ? (
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[150px]">
              UTR: {u.paymentUtr}
            </div>
          ) : null}

          {hasScreenshot && (
            <button
              type="button"
              onClick={() =>
                onPreviewImage({
                  url: u.paymentScreenshotUrl!,
                  title: `${displayName} - ${tr('भुगतान रसीद', 'ادائیگی کی رسید', 'Payment Proof')}`,
                })
              }
              className="flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
            >
              <Receipt className="w-3 h-3 text-purple-600" />
              <span>{tr('रसीद प्रमाण', 'رسید دیکھیں', 'Payment Proof')}</span>
            </button>
          )}
        </div>
      </td>

      {/* 5. Status Badge */}
      <td className="px-4 py-3.5">
        <div>
          {isApproved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{tr('सत्यापित', 'تصدیق شدہ', 'Approved')}</span>
            </span>
          ) : isRejected ? (
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <XCircle className="w-3 h-3 text-rose-600" />
                <span>{tr('अस्वीकृत', 'مسترد شدہ', 'Rejected')}</span>
              </span>
              {(u.rejectionReason || u.rejection_reason) && (
                <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 max-w-[160px] truncate" title={u.rejectionReason || u.rejection_reason}>
                  {u.rejectionReason || u.rejection_reason}
                </p>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{tr('लंबित', 'زیر التواء', 'Pending')}</span>
            </span>
          )}
        </div>
      </td>

      {/* 6. Actions */}
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          {/* Eye Icon: View Full Details Modal */}
          <button
            type="button"
            onClick={() => onView(u)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            title={tr('पूर्ण विवरण देखें', 'مکمل تفصیلات', 'View Full Details')}
          >
            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </button>

          {canPerformKycAction && (
            <>
              {/* Approve Button */}
              {!isApproved && (
                <button
                  type="button"
                  onClick={() => onApprove(u.id)}
                  disabled={processingId === u.id}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  title={isRejected ? tr('पुनः स्वीकृत करें', 'دوبارہ منظور کریں', 'Re-Approve') : tr('स्वीकृत करें', 'منظور کریں', 'Approve')}
                >
                  {processingId === u.id && processingAction === 'approve' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Reject / Revoke Button */}
              <button
                type="button"
                onClick={() => onOpenReject(u)}
                disabled={processingId === u.id || terminating}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-colors disabled:opacity-50 cursor-pointer"
                title={
                  isApproved
                    ? tr('सत्यापन हटाएं', 'منسوخ کریں', 'Revoke / Reject')
                    : isRejected
                      ? tr('कारण संपादित करें', 'وجہ تبدیل کریں', 'Edit Reason')
                      : tr('अस्वीकार करें', 'مسترد کریں', 'Reject')
                }
              >
                <X className="w-4 h-4" />
              </button>

              {/* Terminate Button */}
              <button
                type="button"
                onClick={() => onOpenTerminate(u)}
                disabled={processingId === u.id || terminating}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                title={tr('खाता समाप्त करें (हटाएं)', 'اکاؤنٹ ختم کریں', 'Terminate & Delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── 2. Subcomponent: Full KYC & Registration Ledger Details Modal ─────────────
const KycUserDetailModal: React.FC<{
  user: User;
  canPerformKycAction: boolean;
  processingId: string | null;
  processingAction: 'approve' | 'reject' | null;
  terminating: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onOpenReject: (u: User) => void;
  onOpenTerminate: (u: User) => void;
  onPreviewImage: (preview: { url: string; title: string }) => void;
}> = ({
  user,
  canPerformKycAction,
  processingId,
  processingAction,
  terminating,
  onClose,
  onApprove,
  onOpenReject,
  onOpenTerminate,
  onPreviewImage,
}) => {
    const { language } = useLanguage();
    const tr = (hi: string, ur: string, en: string) => {
      if (language === 'hi') return hi;
      if (language === 'ur') return ur;
      return en;
    };
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const copyToClipboard = (text: string, key: string) => {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    };

    // Dynamic Translations for User Name, City, District, State, and Community
    const displayName = useDynamicTranslatedText(user.name, language) || user.name;
    const displayCity = useDynamicTranslatedText(user.city, language) || user.city;
    const displayDistrict = user.district ? (useDynamicTranslatedText(user.district, language) || user.district) : '';
    const displayState = useDynamicTranslatedText(user.state, language) || user.state;
    const rawCommunity = user.communityName || 'Rohilkhand Educational & Nikah Trust';
    const displayCommunity = useDynamicTranslatedText(rawCommunity, language) || rawCommunity;
    const displayAddress = user.address ? (useDynamicTranslatedText(user.address, language) || user.address) : '';

    const translatedReligion = translateReligion(user.religion, language);
    const translatedHelpType = translateHelpType(user.helpType, language);

    const isApproved = user.status === 'approved' || (user.isVerified && user.status !== 'reject' && user.status !== 'rejected');
    const isRejected = user.status === 'reject' || user.status === 'rejected';

    return (
      <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  {tr('सदस्य पूर्ण केवाईसी एवं पंजीकरण विवरण', 'رکن کی مکمل رجسٹریشن اور KYC تفصیلات', 'Full Member KYC & Registration Ledger')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tr('आईडी:', 'شناخت:', 'ID:')} {user.id} • #{user.membershipId || 'N/A'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-xs">
            {/* 1. Member Profile & Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl overflow-hidden shrink-0 border-2 border-purple-300 shadow-md">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                    onClick={() =>
                      onPreviewImage({
                        url: user.avatar!,
                        title: `${displayName} - ${tr('प्रोफ़ाइल फ़ोटो', 'پروفائل تصویر', 'Profile Photo')}`,
                      })
                    }
                  />
                ) : (
                  <span>{(displayName || 'U').trim().charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {displayName}
                  </h4>
                  {user.isVerified ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{tr('सत्यापित सदस्य', 'تصدیق شدہ', 'Verified Member')}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{tr('सत्यापन लंबित', 'زیر التواء', 'Pending Approval')}</span>
                    </span>
                  )}
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  {tr('समुदाय:', 'کمیونٹی:', 'Community:')}{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {displayCommunity}
                  </span>
                  {user.joinDate && ` • ${tr('जॉइनिंग तिथि:', 'شمولیت کی تاریخ:', 'Join Date:')} ${user.joinDate}`}
                </p>
              </div>
            </div>

            {/* 2. Personal & Contact Information */}
            <div className="space-y-3">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{tr('व्यक्तिगत एवं संपर्क विवरण', 'ذاتی اور رابطہ کی معلومات', 'Personal & Contact Information')}</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('पूरा नाम', 'مکمل نام', 'Full Name')}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{displayName}</p>
                </div>

                {(user.fatherName || user.father_name) && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('पिता का नाम', 'والد کا نام', "Father's Name")}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{user.fatherName || user.father_name}</p>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('मोबाइल नंबर', 'موبائل نمبر', 'Mobile Number')}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{user.phone || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('ईमेल आईडी', 'ای میل', 'Email Address')}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">{user.email || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('शहर', 'شہر', 'City')}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{displayCity || 'N/A'}</p>
                </div>

                {displayDistrict && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('जिला', 'ضلع', 'District')}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{displayDistrict}</p>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('राज्य', 'ریاست', 'State')}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{displayState || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('सदस्यता आईडी', 'رکنیت نمبر', 'Membership ID')}</p>
                  <p className="font-bold text-purple-700 dark:text-purple-400 font-mono mt-0.5">{user.membershipId || 'N/A'}</p>
                </div>

                {displayAddress && (
                  <div className="sm:col-span-2 md:col-span-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('पूरा पता', 'مکمل پتہ', 'Full Address')}</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{displayAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Faith & Social Finance Eligibility */}
            <div className="space-y-3">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{tr('धर्म एवं सामाजिक सहायता पात्रता', 'مذہب اور مالی امداد کی حیثیت', 'Religion & Social Finance Status')}</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('धर्म', 'مذہب', 'Religion')}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5 text-sm">{translatedReligion || user.religion || 'N/A'}</p>
                </div>

                {user.religion === 'Muslim' && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      {tr('क्या आप मालिक-ए-निसाब हैं?', 'کیا آپ صاحبِ نصاب ہیں؟', 'Malik-e-Nisab Status')}
                    </p>
                    <p className={`font-bold mt-0.5 text-sm ${user.isMalikENisab ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {user.isMalikENisab
                        ? tr('हाँ (मालिक-ए-निसाब - ज़कात/सदका दाता)', 'ہاں (صاحبِ نصاب)', 'Yes (Malik-e-Nisab - Eligible to Pay Zakat)')
                        : tr('नहीं (सहायता का पात्र - ज़कात/सदका प्राप्तकर्ता)', 'نہیں (امداد का مستحق)', 'No (Eligible to Receive Zakat/Sadqa)')}
                    </p>
                  </div>
                )}

                {user.religion === 'Muslim' && !user.isMalikENisab && user.helpType && (
                  <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-900 dark:text-amber-300">
                        {tr('आवश्यक सहायता का प्रकार:', 'مطلوبہ امداد کی قسم:', 'Assistance Type Requested:')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-extrabold text-[11px]">
                        {translatedHelpType || user.helpType}
                      </span>
                    </div>
                    {user.helpDetails && (
                      <p className="text-slate-700 dark:text-slate-300 text-xs mt-1">
                        <span className="font-semibold">{tr('विवरण:', 'تفصیلات:', 'Details:')} </span>
                        {user.helpDetails}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Aadhaar & Identity Proofs */}
            <div className="space-y-3">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <IdCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{tr('पहचान पत्र एवं आधार दस्तावेज़', 'شناختی دستاویزات اور آدھار', 'Identity & Aadhaar Proofs')}</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Aadhaar Front */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      {tr('आधार कार्ड (सामने का भाग)', 'آدھار کارڈ (سامنے)', 'Aadhaar Card (Front)')}
                    </span>
                    {user.aadhaarFrontUrl && (
                      <a
                        href={user.aadhaarFrontUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-[10px] font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> {tr('खोलें', 'کھولیں', 'Open')}
                      </a>
                    )}
                  </div>

                  <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
                    {user.aadhaarFrontUrl ? (
                      <img
                        src={user.aadhaarFrontUrl}
                        alt="Aadhaar Front"
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() =>
                          onPreviewImage({
                            url: user.aadhaarFrontUrl!,
                            title: `${displayName} - ${tr('आधार सामने का भाग', 'آدھار سامنے', 'Aadhaar Front')}`,
                          })
                        }
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <p className="text-[11px] font-medium">{tr('आधार सामने का भाग संलग्न नहीं है', 'آدھار منسلک نہیں ہے', 'No front image attached')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aadhaar Back */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      {tr('आधार कार्ड (पीछे का भाग)', 'آدھار کارڈ (پیچھے)', 'Aadhaar Card (Back)')}
                    </span>
                    {user.aadhaarBackUrl && (
                      <a
                        href={user.aadhaarBackUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-[10px] font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> {tr('खोलें', 'کھولیں', 'Open')}
                      </a>
                    )}
                  </div>

                  <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
                    {user.aadhaarBackUrl ? (
                      <img
                        src={user.aadhaarBackUrl}
                        alt="Aadhaar Back"
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() =>
                          onPreviewImage({
                            url: user.aadhaarBackUrl!,
                            title: `${displayName} - ${tr('आधार पीछे का भाग', 'آدھار پیچھے', 'Aadhaar Back')}`,
                          })
                        }
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <p className="text-[11px] font-medium">{tr('आधार पीछे का भाग संलग्न नहीं है', 'آدھار منسلک نہیں ہے', 'No back image attached')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Payment & Fee Verification Ledger */}
            <div className="space-y-3">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{tr('पंजीकरण शुल्क एवं भुगतान सत्यापन विवरण', 'رجسٹریشن فیس اور ادائیگی کی تفصیلات', 'Registration Fee & Payment Ledger')}</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payment Details Card */}
                <div className="space-y-2.5">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('भुगतान माध्यम', 'طریقہ ادائیگی', 'Payment Method')}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{user.paymentMethod || tr('यूपीआई ट्रांसफर', 'یو پی آئی ٹرانسفر', 'UPI Transfer')}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('UTR / लेनदेन संख्या', 'ٹرانزیکشن نمبر', 'UTR / Ref Number')}</p>
                      <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{user.paymentUtr || 'N/A'}</p>
                    </div>
                    {user.paymentUtr && (
                      <button
                        onClick={() => copyToClipboard(user.paymentUtr!, 'utr')}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                        title={tr('यूटीआर कॉपी करें', 'یو ٹی آر کاپی کریں', 'Copy UTR')}
                      >
                        {copiedKey === 'utr' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment Screenshot */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      {tr('भुगतान रसीद / स्क्रीनशॉट', 'ادائیگی کی رسید / اسکرین شاٹ', 'Payment Screenshot Proof')}
                    </span>
                    {user.paymentScreenshotUrl && (
                      <a
                        href={user.paymentScreenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-[10px] font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> {tr('खोलें', 'کھولیں', 'Open')}
                      </a>
                    )}
                  </div>

                  <div className="h-36 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
                    {user.paymentScreenshotUrl ? (
                      <img
                        src={user.paymentScreenshotUrl}
                        alt="Payment Proof"
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() =>
                          onPreviewImage({
                            url: user.paymentScreenshotUrl!,
                            title: `${displayName} - ${tr('भुगतान रसीद', 'ادائیگی رسید', 'Payment Receipt')}`,
                          })
                        }
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <p className="text-[11px] font-medium">{tr('कोई स्क्रीनशॉट संलग्न नहीं है', 'کوئی ثبوت منسلک نہیں', 'No payment receipt attached')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {tr('बंद करें', 'بند کریں', 'Close')}
              </button>

              {canPerformKycAction && (
                <button
                  onClick={() => onOpenTerminate(user)}
                  disabled={terminating}
                  className="cursor-pointer px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{tr('खाता समाप्त करें (पुनः पंजीकरण हेतु)', 'اکاؤنٹ ختم کریں', 'Terminate Account')}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {canPerformKycAction ? (
                isApproved ? (
                  <button
                    onClick={() => onOpenReject(user)}
                    disabled={processingId === user.id}
                    className="cursor-pointer px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{tr('अस्वीकार करें (कारण आवश्यक)', 'مسترد کریں (وجہ درکار)', 'Reject (Reason Required)')}</span>
                  </button>
                ) : isRejected ? (
                  <>
                    <button
                      onClick={() => onOpenReject(user)}
                      disabled={processingId === user.id}
                      className="cursor-pointer px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{tr('कारण संपादित करें', 'وجہ تبدیل کریں', 'Edit Rejection Reason')}</span>
                    </button>

                    <button
                      onClick={() => onApprove(user.id)}
                      disabled={processingId === user.id}
                      className="cursor-pointer px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingId === user.id && processingAction === 'approve' ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{tr('स्वीकृत एवं सत्यापित करें', 'منظور اور تصدیق کریں', 'Approve & Verify Member')}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenReject(user)}
                      disabled={processingId === user.id}
                      className="cursor-pointer px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{tr('अस्वीकार करें', 'مسترد کریں', 'Reject')}</span>
                    </button>

                    <button
                      onClick={() => onApprove(user.id)}
                      disabled={processingId === user.id}
                      className="cursor-pointer px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingId === user.id && processingAction === 'approve' ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{tr('स्वीकृत एवं सत्यापित करें', 'منظور اور تصدیق کریں', 'Approve & Verify Member')}</span>
                    </button>
                  </>
                )
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 italic px-2">
                  {tr(
                    'केवल सुपर एडमिन, कार्यकारी एडमिन और जिला संयोजक ही सत्यापन कार्रवाई कर सकते हैं।',
                    'صرف سپر ایڈمن، ایگزیکٹو ایڈمن اور ڈسٹرکٹ کوآرڈینیٹر ہی کارروائی کر سکتے ہیں۔',
                    'Only Super Admin, Executive Admin & District Coordinator can perform KYC actions.'
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

// ─── 3. Subcomponent: Mandatory Rejection Reason Modal ─────────────────────────
const RejectReasonModal: React.FC<{
  user: User;
  processingId: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}> = ({ user, processingId, onClose, onConfirm }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(user.name, language) || user.name;
  const [rejectionReasonInput, setRejectionReasonInput] = useState(user.rejectionReason || user.rejection_reason || '');
  const [rejectionReasonError, setRejectionReasonError] = useState('');

  const handleConfirm = () => {
    const trimmed = rejectionReasonInput.trim();
    if (!trimmed) {
      setRejectionReasonError(
        tr(
          'कृपया अस्वीकृति का कारण अवश्य दर्ज करें।',
          'براہ کرم مسترد کرنے کی وجہ درج کریں۔',
          'Rejection reason is mandatory. Please provide a reason.'
        )
      );
      return;
    }
    onConfirm(trimmed);
  };

  return (
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
                {tr('अस्वीकृति का कारण दर्ज करें', 'مسترد کرنے کی وجہ درج کریں', 'Enter Rejection Reason')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {displayName} • {tr('आईडी:', 'شناخت:', 'ID:')} {user.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {tr(
              'सत्यापन अस्वीकार करने के लिए कारण अनिवार्य है। यह कारण सदस्य को उनके रिकॉर्ड में स्पष्ट रूप से दिखाई देगा:',
              'تصدیق مسترد کرنے کی وجہ لازمی ہے۔ یہ وجہ رکن کے ریکارڈ میں نظر آئے گی:',
              'A reason is mandatory when rejecting verification. This will be clearly recorded on the member’s profile:'
            )}
          </p>

          {/* Quick Preset Reason Chips */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {tr('त्वरित कारण चुनें:', 'فوری وجوہات منتخب کریں:', 'Quick select common reasons:')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                tr('धुंधला या अस्पष्ट आधार कार्ड', 'دھندلا شناختی کارڈ', 'Blurry / Unreadable ID or Aadhaar card'),
                tr('विवरण और पहचान पत्र में बेमेल', 'تفصیلات میں فرق', 'Details do not match submitted ID'),
                tr('अमान्य या अपठनीय भुगतान रसीद', 'غلط ادائیگی کی رسید', 'Invalid or unreadable payment receipt'),
                tr('अधूरे दस्तावेज या पृष्ठ गायब', 'نامکمل دستاویزات', 'Incomplete documents / Missing back page'),
                tr('अमान्य या अनुचित प्रोफाइल फोटो', 'غلط پروفائل تصویر', 'Invalid or improper profile photo'),
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setRejectionReasonInput((prev) => (prev ? `${prev}. ${preset}` : preset));
                    setRejectionReasonError('');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-purple-100 hover:text-purple-700 dark:bg-slate-800 dark:hover:bg-purple-950/60 dark:hover:text-purple-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
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
                'उदा. आधार कार्ड का पिछला भाग गायब है और रसीद साफ नहीं दिख रही है...',
                'مثلاً شناختی کارڈ کی پشت غائب ہے...',
                'e.g. Back side of Aadhaar card is missing and payment screenshot is illegible...'
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
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processingId === user.id}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {processingId === user.id ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>{tr('अस्वीकार की पुष्टि करें', 'مسترد کرنے کی تصدیق کریں', 'Confirm Rejection')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── 4. Subcomponent: Account Termination Confirmation Modal ───────────────────
const TerminateUserModal: React.FC<{
  user: User;
  terminating: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}> = ({ user, terminating, onClose, onConfirm }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(user.name, language) || user.name;
  const [terminationReasonInput, setTerminationReasonInput] = useState('');
  const [terminationReasonError, setTerminationReasonError] = useState('');

  const handleConfirm = () => {
    const reason = terminationReasonInput.trim();
    if (!reason) {
      setTerminationReasonError(
        tr(
          'कृपया खाता समाप्त करने का कारण अवश्य दर्ज करें।',
          'براہ کرم اکاؤنٹ ختم کرنے کی وجہ درج کریں۔',
          'Termination reason is mandatory. Please provide a reason.'
        )
      );
      return;
    }
    onConfirm(reason);
  };

  const suggestions = [
    tr('अमान्य / अस्पष्ट आधार पहचान दस्तावेज', 'دھندلا یا ناقابل شناخت شناختی کارڈ', 'Invalid / unreadable Aadhaar identity proof'),
    tr('फर्जी या डुप्लीकेट खाता पंजीकरण', 'جعلی یا ڈپلیکیٹ اکاؤنٹ', 'Fake or duplicate account registration'),
    tr('गलत या अस्वीकार्य सदस्यता विवरण', 'غلط معلومات', 'Incorrect or inadmissible membership details'),
    tr('सदस्य के अनुरोध पर नया पंजीकरण हेतु', 'رکن کی درخواست پر', 'Member requested termination for fresh registration'),
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-rose-300 dark:border-rose-900 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-rose-100 dark:border-rose-950/60 bg-rose-50/60 dark:bg-rose-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center font-bold">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-rose-900 dark:text-rose-200">
                {tr('सदस्य खाता समाप्त करें', 'اکاؤنٹ ختم کریں', 'Terminate Member Account')}
              </h3>
              <p className="text-xs text-rose-700/80 dark:text-rose-400">
                {displayName} ({user.phone || user.email || user.id.slice(0, 8)})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!terminating) onClose();
            }}
            disabled={terminating}
            className="p-1.5 rounded-full hover:bg-rose-200/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{tr('स्थायी खाता निष्कासन सूचना', 'مستقل خاتمے کی اطلاع', 'Permanent Account Deletion Notice')}</span>
            </p>
            {tr(
              'इस सदस्य को समाप्त करने पर उनका रिकॉर्ड डेटाबेस से पूरी तरह हटा दिया जाएगा। इससे उनका मोबाइल नंबर व ईमेल मुक्त हो जाएगा ताकि वे सही विवरण के साथ पुनः पंजीकरण कर सकें। सदस्य को कारण सहित ईमेल भेजा जाएगा।',
              'اس رکن کو ختم کرنے پر ان کا ریکارڈ ڈیٹا بیس سے ہٹا دیا جائے گا تاکہ وہ درست معلومات کے ساتھ دوبارہ رجسٹر کر سکیں۔',
              'Terminating this member will permanently delete their account from the database. Their phone and email will be freed so they can submit a fresh registration with correct details. A notice email will be sent explaining the reason.'
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {tr('समाप्त करने का अनिवार्य कारण *', 'ختم کرنے کی لازمی وجہ *', 'Mandatory Termination Reason *')}
            </label>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setTerminationReasonInput(sug);
                    setTerminationReasonError('');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-700 dark:text-slate-300 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={terminationReasonInput}
              onChange={(e) => {
                setTerminationReasonInput(e.target.value);
                if (e.target.value.trim()) setTerminationReasonError('');
              }}
              placeholder={tr(
                'कृपया विस्तार से बताएं कि इस सदस्य का खाता क्यों समाप्त किया जा रहा है...',
                'براہ کرم وجہ تفصیل سے لکھیں...',
                'Please describe why this member account is being terminated...'
              )}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-slate-400 resize-none font-medium"
            />
            {terminationReasonError && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{terminationReasonError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={terminating}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={terminating}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {terminating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{tr('समाप्त कर रहे हैं...', 'ختم کر رہے ہیں...', 'Terminating...')}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{tr('खाता समाप्त एवं हटाएं', 'اکاؤنٹ ختم اور حذف کریں', 'Terminate & Delete Account')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Subcomponent: Female Member Verification Card ───────────────────────────
const FemaleMemberCard: React.FC<{
  member: FemaleFamilyMember;
  primaryUser?: User;
  canPerformKycAction: boolean;
  processingId: string | null;
  processingAction: 'approve' | 'reject' | null;
  onApprove: (m: FemaleFamilyMember) => void;
  onOpenReject: (m: FemaleFamilyMember) => void;
  onPreviewImage: (img: { url: string; title: string }) => void;
}> = ({
  member: m,
  primaryUser,
  canPerformKycAction,
  processingId,
  processingAction,
  onApprove,
  onOpenReject,
  onPreviewImage,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const isApproved = m.status === 'approved';
  const isRejected = m.status === 'rejected';
  const isPending = !isApproved && !isRejected;
  const isBusy = processingId === m.id;

  const [copiedUtr, setCopiedUtr] = useState(false);
  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
        isApproved
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-sm'
          : isRejected
            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            {m.photo_url ? (
              <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Heart className="w-5 h-5 fill-white/80" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{m.name}</h3>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50">
                {m.relation}
              </span>
              {m.age ? (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  • {m.age} {tr('वर्ष', 'سال', 'Yrs')}
                </span>
              ) : null}
            </div>
            {primaryUser ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{tr('मुख्य सदस्य:', 'بنیادی ممبر:', 'Primary Member:')}</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{primaryUser.name}</span>
                {primaryUser.membershipId && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                    {primaryUser.membershipId}
                  </span>
                )}
                {primaryUser.district && (
                  <span className="text-[10px] text-slate-400">• {primaryUser.district}</span>
                )}
              </p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                {tr('सदस्य आईडी:', 'ممبر شناختی نمبر:', 'User ID:')} {m.user_id}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="self-start sm:self-auto shrink-0">
          {isApproved ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{tr('सत्यापित / स्वीकृत', 'تصدیق شدہ', 'VERIFIED')}</span>
            </span>
          ) : isRejected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{tr('अस्वीकृत', 'مسترد شدہ', 'REJECTED')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{tr('लंबित सत्यापन', 'زیر التواء', 'PENDING')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-3.5 text-xs text-slate-600 dark:text-slate-300">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{tr('फ़ोन नंबर', 'فون نمبر', 'Phone Number')}</span>
          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{m.phone || '—'}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{tr('आधार संख्या', 'آدھار نمبر', 'Aadhaar Number')}</span>
          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{m.aadhaar_number || '—'}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{tr('पंजीकरण शुल्क', 'فیس', 'Enrollment Fee')}</span>
          <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{m.fee_amount || 50} ({m.payment_method || 'UPI'})</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{tr('आवेदन तिथि', 'تاریخ', 'Registered At')}</span>
          <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            {m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      {/* Payment UTR & Screenshot Verification Bar */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-bold text-slate-700 dark:text-slate-300">UTR / Ref:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            {m.payment_utr || tr('उपलब्ध नहीं', 'دستیاب نہیں', 'N/A')}
          </span>
          {m.payment_utr && (
            <button
              onClick={() => handleCopyUtr(m.payment_utr)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title={tr('कॉपी करें', 'کاپی کریں', 'Copy UTR')}
            >
              {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Screenshot View button */}
        {m.payment_screenshot_url ? (
          <button
            onClick={() => onPreviewImage({ url: m.payment_screenshot_url!, title: `${m.name} - ₹${m.fee_amount || 50} Payment Proof` })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{tr('भुगतान रसीद देखें', 'ادائیگی کی رسید دیکھیں', 'View Payment Receipt')}</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 italic">
            {tr('रसीद अपलोड नहीं है', 'رسید اپ لوڈ نہیں', 'No receipt uploaded')}
          </span>
        )}
      </div>

      {/* Rejection Note if any */}
      {m.rejection_reason && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{tr('अस्वीकृति कारण:', 'مسترد کرنے کی وجہ:', 'Rejection Reason:')} </span>
            <span>{m.rejection_reason}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {canPerformKycAction && (
        <div className="flex items-center justify-end gap-2.5 pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800">
          {(!isApproved || isRejected) && (
            <button
              onClick={() => onApprove(m)}
              disabled={isBusy}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isBusy && processingAction === 'approve' ? tr('स्वीकृत हो रहा...', 'منظور ہو رہا...', 'Approving...') : tr('स्वीकृत करें', 'منظور کریں', 'Approve')}</span>
            </button>
          )}

          {(!isRejected || isApproved) && (
            <button
              onClick={() => onOpenReject(m)}
              disabled={isBusy}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/80 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>{tr('अस्वीकृत करें', 'مسترد کریں', 'Reject')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Subcomponent: Female Member Table Row ────────────────────────────────────
const FemaleMemberTableRow: React.FC<{
  member: FemaleFamilyMember;
  primaryUser?: User;
  canPerformKycAction: boolean;
  processingId: string | null;
  processingAction: 'approve' | 'reject' | null;
  onApprove: (m: FemaleFamilyMember) => void;
  onOpenReject: (m: FemaleFamilyMember) => void;
  onPreviewImage: (img: { url: string; title: string }) => void;
}> = ({
  member: m,
  primaryUser,
  canPerformKycAction,
  processingId,
  processingAction,
  onApprove,
  onOpenReject,
  onPreviewImage,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const isApproved = m.status === 'approved';
  const isRejected = m.status === 'rejected';
  const isBusy = processingId === m.id;

  const [copiedUtr, setCopiedUtr] = useState(false);
  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
      {/* 1. Female Member */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 flex items-center justify-center font-bold text-sm shrink-0">
            {m.photo_url ? (
              <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-slate-900 dark:text-white">{m.name}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300">
                {m.relation}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {m.age ? `${m.age} ${tr('वर्ष', 'سال', 'Yrs')}` : ''}
              {m.created_at ? ` • ${new Date(m.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : ''}
            </p>
          </div>
        </div>
      </td>

      {/* 2. Primary Member */}
      <td className="px-4 py-3.5">
        {primaryUser ? (
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{primaryUser.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {primaryUser.membershipId || primaryUser.phone || primaryUser.id}
            </p>
            {primaryUser.district && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {primaryUser.district}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500">{m.user_id}</span>
        )}
      </td>

      {/* 3. Contact & Aadhaar */}
      <td className="px-4 py-3.5">
        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{m.phone || '—'}</p>
        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{m.aadhaar_number || '—'}</p>
      </td>

      {/* 4. Fee & Payment Proof */}
      <td className="px-4 py-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">₹{m.fee_amount || 50}</span>
            <span className="text-[10px] text-slate-500">({m.payment_method || 'UPI'})</span>
          </div>
          {m.payment_utr && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                {m.payment_utr}
              </span>
              <button
                onClick={() => handleCopyUtr(m.payment_utr)}
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Copy UTR"
              >
                {copiedUtr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
          {m.payment_screenshot_url && (
            <button
              onClick={() => onPreviewImage({ url: m.payment_screenshot_url!, title: `${m.name} - ₹50 Payment Proof` })}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <ImageIcon className="w-3 h-3" />
              <span>{tr('रसीद देखें', 'رسید دیکھیں', 'View Proof')}</span>
            </button>
          )}
        </div>
      </td>

      {/* 5. KYC Status */}
      <td className="px-4 py-3.5">
        {isApproved ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{tr('स्वीकृत', 'منظور شدہ', 'Approved')}</span>
          </span>
        ) : isRejected ? (
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <XCircle className="w-3 h-3 text-rose-600" />
              <span>{tr('अस्वीकृत', 'مسترد', 'Rejected')}</span>
            </span>
            {m.rejection_reason && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 max-w-[150px] truncate" title={m.rejection_reason}>
                {m.rejection_reason}
              </p>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>{tr('लंबित', 'زیر التواء', 'Pending')}</span>
          </span>
        )}
      </td>

      {/* 6. Actions */}
      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        {canPerformKycAction ? (
          <div className="inline-flex items-center gap-1.5">
            {(!isApproved || isRejected) && (
              <button
                onClick={() => onApprove(m)}
                disabled={isBusy}
                className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title={tr('स्वीकृत करें', 'منظور کریں', 'Approve')}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{tr('स्वीकृत', 'منظور', 'Approve')}</span>
              </button>
            )}

            {(!isRejected || isApproved) && (
              <button
                onClick={() => onOpenReject(m)}
                disabled={isBusy}
                className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title={tr('अस्वीकृत करें', 'مسترد کریں', 'Reject')}
              >
                <X className="w-3.5 h-3.5" />
                <span>{tr('अस्वीकृत', 'مسترد', 'Reject')}</span>
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">{tr('केवल दृश्य', 'صرف دیکھیں', 'View Only')}</span>
        )}
      </td>
    </tr>
  );
};

// ─── Subcomponent: Female Member Reject Reason Modal ─────────────────────────
const FemaleMemberRejectModal: React.FC<{
  member: FemaleFamilyMember;
  processingId: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}> = ({ member, processingId, onClose, onConfirm }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [reasonInput, setReasonInput] = useState(member.rejection_reason || '');
  const [error, setError] = useState('');

  const quickReasons = [
    { hi: 'अमान्य UTR नंबर / भुगतान प्राप्त नहीं हुआ', ur: 'غلط UTR نمبر / ادائیگی موصول نہیں ہوئی', en: 'Invalid UTR Number / Payment not received' },
    { hi: 'भुगतान रसीद अस्पष्ट या गलत है', ur: 'ادائیگی کی رسید واضح نہیں ہے', en: 'Payment receipt screenshot unclear or invalid' },
    { hi: 'गलत आधार कार्ड विवरण', ur: 'غلط آدھار کارڈ کی تفصیلات', en: 'Incorrect Aadhaar details' },
    { hi: 'अधूरी जानकारी दर्ज की गई है', ur: 'نامکمل معلومات درج کی گئی ہیں', en: 'Incomplete female member information' },
  ];

  const handleConfirm = () => {
    const trimmed = reasonInput.trim();
    if (!trimmed) {
      setError(
        tr(
          'कृपया अस्वीकृति का कारण दर्ज करें।',
          'براہ کرم مسترد کرنے کی وجہ درج کریں۔',
          'Please enter a rejection reason.'
        )
      );
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/60 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {tr('महिला सदस्य अस्वीकृति कारण', 'خاتون رکن مسترد کرنے کی وجہ', 'Female Member Rejection')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {member.name} ({member.relation}) • ₹{member.fee_amount || 50}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {tr(
              'कृपया अस्वीकार करने का कारण चुनें या दर्ज करें। यह सदस्य को दिखाई देगा:',
              'براہ کرم مسترد کرنے کی وجہ منتخب کریں یا درج کریں۔ یہ ممبر کو نظر آئے گی:',
              'Select or type the reason for rejecting this female family member registration:'
            )}
          </p>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {tr('त्वरित कारण चुनें', 'فوری وجوہات منتخب کریں', 'Quick Select Reason')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setReasonInput(language === 'hi' ? r.hi : language === 'ur' ? r.ur : r.en);
                    setError('');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all text-left cursor-pointer"
                >
                  + {language === 'hi' ? r.hi : language === 'ur' ? r.ur : r.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              value={reasonInput}
              onChange={(e) => {
                setReasonInput(e.target.value);
                if (error) setError('');
              }}
              placeholder={tr('अस्वीकृति का विस्तृत कारण यहाँ लिखें...', 'تفصیلی وجہ یہاں لکھیں...', 'Provide detailed rejection reason here...')}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processingId === member.id}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{processingId === member.id ? tr('प्रक्रिया जारी...', 'پروسیسنگ...', 'Processing...') : tr('अस्वीकार करें', 'مسترد کریں', 'Confirm Reject')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── 5. Main Component: Executive KYC Tab Dashboard ────────────────────────────
export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ activeUser, currentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  // Safe fallback to AppStateProvider context if props are not explicitly supplied
  let contextUser: User | undefined;
  let contextRole: UserRole | undefined;
  try {
    const appState = useAppState();
    contextUser = appState?.activeUser;
    contextRole = appState?.currentRole;
  } catch {
    // Outside AppStateProvider fallback
  }

  const user = activeUser || contextUser;
  const role = currentRole || contextRole;

  const rawDistRole = (
    user?.district_role ||
    user?.districtRole ||
    (user?.role as string) ||
    ''
  ).toLowerCase().trim().replace(/\s+/g, '_');

  const isSuperOrExecutive =
    role === 'super_admin' ||
    role === 'executive_admin' ||
    user?.role === 'super_admin' ||
    user?.role === 'executive_admin';

  const isDistrictCoordinator =
    role === 'district_coordinator' ||
    rawDistRole === 'district_coordinator' ||
    rawDistRole.includes('coordinator');

  const canPerformKycAction = isSuperOrExecutive || isDistrictCoordinator;

  const districtRoleKeys = [
    'district_president',
    'district_coordinator',
    'district_gen_secretary',
    'district_secretary',
    'district_finance_coord',
  ];

  const isDistrictRole =
    districtRoleKeys.includes(role as string) ||
    districtRoleKeys.includes(rawDistRole) ||
    (typeof role === 'string' && role.startsWith('district_')) ||
    rawDistRole.startsWith('district_') ||
    rawDistRole.includes('president') ||
    rawDistRole.includes('coordinator') ||
    rawDistRole.includes('secretary') ||
    rawDistRole.includes('finance');

  const isRestrictedToDistrict = !isSuperOrExecutive && isDistrictRole;

  const districtRoleTitle =
    role === 'district_president' || rawDistRole.includes('president')
      ? tr('जिला अध्यक्ष दृश्य', 'ضلعی صدر منظر', 'District President View')
      : role === 'district_coordinator' || rawDistRole.includes('coordinator')
        ? tr('जिला संयोजक दृश्य', 'ضلعی کوآرڈینیٹر منظر', 'District Coordinator View')
        : role === 'district_gen_secretary' || rawDistRole.includes('gen_sec')
          ? tr('जिला महासचिव दृश्य', 'ضلعی جنرل سیکرٹری منظر', 'District General Secretary View')
          : role === 'district_secretary' || rawDistRole.includes('secretary')
            ? tr('जिला सचिव दृश्य', 'ضلعی سیکرٹری منظر', 'District Secretary View')
            : role === 'district_finance_coord' || rawDistRole.includes('finance')
              ? tr('जिला वित्त समन्वयक दृश्य', 'ضلعی فنانس کوآرڈینیٹر منظر', 'District Finance Coordinator View')
              : tr('जिला स्तरीय दृश्य', 'ضلعی سطحی منظر', 'District Level View');

  const userDistrict = (user?.district || '').trim();
  const cleanDistrict = userDistrict
    ? userDistrict.replace(/\s+(district|chapter|city|block|zone).*$/i, '').trim() || userDistrict
    : '';

  // Dynamic translated display for the active user's district
  const displayUserDistrict = userDistrict ? (useDynamicTranslatedText(userDistrict, language) || userDistrict) : '';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<VerificationFilter>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Mandatory rejection reason modal state
  const [rejectModalUser, setRejectModalUser] = useState<User | null>(null);

  // Account Termination Modal state
  const [terminateModalUser, setTerminateModalUser] = useState<User | null>(null);
  const [terminating, setTerminating] = useState(false);

  // Pagination & View Mode state (defaults to 10 records per page, tabular form)
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Segmented view: Primary User KYC vs Female Family Members KYC
  const [kycSection, setKycSection] = useState<'primary' | 'female_members'>('primary');

  // Female Family Members State
  const [femaleMembers, setFemaleMembers] = useState<FemaleFamilyMember[]>([]);
  const [loadingFemaleMembers, setLoadingFemaleMembers] = useState(false);
  const [femaleProcessingId, setFemaleProcessingId] = useState<string | null>(null);
  const [femaleProcessingAction, setFemaleProcessingAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectFemaleMember, setRejectFemaleMember] = useState<FemaleFamilyMember | null>(null);

  // Reset page to 1 whenever filters, search, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, selectedDistrictFilter, searchQuery, pageSize, kycSection]);

  const loadFemaleMembers = async () => {
    try {
      setLoadingFemaleMembers(true);
      const data = await getFemaleFamilyMembers();
      setFemaleMembers(data || []);
    } catch (err) {
      console.error('Failed to load female family members:', err);
    } finally {
      setLoadingFemaleMembers(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Super Admin and Executive Admin: view all registered users across all districts.
      // District President, General Secretary, Coordinator, and other district-level roles:
      // strictly view and fetch data pertaining to their specific district.
      let fetchedUsers: User[] = [];
      if (isRestrictedToDistrict && userDistrict) {
        fetchedUsers = await getUsers(cleanDistrict || userDistrict);
      } else {
        fetchedUsers = await getUsers();
      }
      setUsers(fetchedUsers || []);
    } catch (err) {
      console.error('Failed to load users for KYC verification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadFemaleMembers();
  }, [role, isRestrictedToDistrict, userDistrict, cleanDistrict]);

  const handleApprove = async (id: string) => {
    if (!canPerformKycAction) return;
    try {
      setProcessingId(id);
      setProcessingAction('approve');
      const targetUser = users.find((u) => u.id === id) || (selectedUser?.id === id ? selectedUser : null);
      await updateUser(id, { status: 'approved', rejectionReason: '' });

      // Send approval notification email if email is present
      if (targetUser?.email) {
        try {
          fetch('/api/auth/send-kyc-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: targetUser.email,
              name: targetUser.name,
              status: 'approved',
            }),
          }).catch((e) => console.warn('Failed to send KYC approval email:', e));
        } catch (emailErr) {
          console.warn('KYC approval email call error:', emailErr);
        }
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'approved', isVerified: true, rejectionReason: undefined, rejection_reason: undefined } : u))
      );

      if (selectedUser?.id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: 'approved', isVerified: true, rejectionReason: undefined, rejection_reason: undefined } : null));
      }
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const openRejectModal = (u: User) => {
    setRejectModalUser(u);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectModalUser || !canPerformKycAction) return;

    const targetUser = rejectModalUser;
    const id = targetUser.id;
    try {
      setProcessingId(id);
      setProcessingAction('reject');
      await updateUser(id, { status: 'reject', rejectionReason: reason });

      // Send rejection notification email if email is present
      if (targetUser?.email) {
        try {
          fetch('/api/auth/send-kyc-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: targetUser.email,
              name: targetUser.name,
              status: 'rejected',
              reason,
            }),
          }).catch((e) => console.warn('Failed to send KYC rejection email:', e));
        } catch (emailErr) {
          console.warn('KYC rejection email call error:', emailErr);
        }
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'reject', isVerified: false, rejectionReason: reason, rejection_reason: reason } : u))
      );

      if (selectedUser?.id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: 'reject', isVerified: false, rejectionReason: reason, rejection_reason: reason } : null));
      }

      setRejectModalUser(null);
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const openTerminateModal = (u: User) => {
    setTerminateModalUser(u);
  };

  const handleConfirmTerminate = async (reason: string) => {
    if (!terminateModalUser || !canPerformKycAction) return;

    const targetUser = terminateModalUser;
    setTerminating(true);
    try {
      // 1. Send notification email if email exists
      if (targetUser.email) {
        try {
          await fetch('/api/auth/send-termination-notice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: targetUser.email,
              name: targetUser.name,
              reason,
            }),
          });
        } catch (emailErr) {
          console.warn('Failed to send termination email notice:', emailErr);
        }
      }

      // 2. Delete user from database
      await deleteUser(targetUser.id);

      // 3. Remove user from local state
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));

      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(null);
      }

      setTerminateModalUser(null);
    } catch (err: any) {
      console.error('Terminate user error:', err);
    } finally {
      setTerminating(false);
    }
  };

  // District filtering
  const districtFilteredUsers = useMemo(() => {
    let list = users;

    if (isRestrictedToDistrict && userDistrict) {
      const target = userDistrict.toLowerCase().trim();
      const cleanTarget = (cleanDistrict || target).toLowerCase().trim();
      list = list.filter((u) => {
        const uDistrict = (u.district || '').toLowerCase().trim();
        const uCity = (u.city || '').toLowerCase().trim();
        const uComm = (u.communityName || '').toLowerCase().trim();
        return (
          uDistrict === target ||
          uDistrict === cleanTarget ||
          (uDistrict && (target.includes(uDistrict) || cleanTarget.includes(uDistrict) || uDistrict.includes(cleanTarget))) ||
          uCity === target ||
          uCity === cleanTarget ||
          (uCity && (target.includes(uCity) || cleanTarget.includes(uCity) || uCity.includes(cleanTarget))) ||
          (uComm && (target.includes(uComm) || cleanTarget.includes(uComm) || uComm.includes(cleanTarget)))
        );
      });
    } else if (selectedDistrictFilter) {
      const target = selectedDistrictFilter.toLowerCase().trim();
      list = list.filter((u) => {
        const uDistrict = (u.district || '').toLowerCase().trim();
        const uCity = (u.city || '').toLowerCase().trim();
        return (
          uDistrict === target ||
          (uDistrict && target.includes(uDistrict)) ||
          (target && uDistrict.includes(target)) ||
          uCity === target ||
          (uCity && target.includes(uCity)) ||
          (target && uCity.includes(target))
        );
      });
    }

    return list;
  }, [users, isRestrictedToDistrict, userDistrict, cleanDistrict, selectedDistrictFilter]);

  // Fast lookup map for primary users by id and membershipId
  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((u) => {
      map.set(u.id, u);
      if (u.membershipId) map.set(u.membershipId, u);
    });
    return map;
  }, [users]);

  // Counts based on active district scope for Primary Users
  const counts = {
    all: districtFilteredUsers.length,
    pending: districtFilteredUsers.filter((u) => {
      const s = u.status || (u.isVerified ? 'approved' : 'pending');
      return s === 'pending';
    }).length,
    approved: districtFilteredUsers.filter((u) => {
      const s = u.status || (u.isVerified ? 'approved' : 'pending');
      return s === 'approved';
    }).length,
    rejected: districtFilteredUsers.filter((u) => {
      const s = u.status;
      return s === 'reject' || s === 'rejected';
    }).length,
  };

  // Female Family Members Counts
  const femaleCounts = useMemo(() => {
    const pending = femaleMembers.filter((m) => (m.status || 'pending') === 'pending').length;
    const approved = femaleMembers.filter((m) => m.status === 'approved').length;
    const rejected = femaleMembers.filter((m) => m.status === 'rejected').length;
    return {
      all: femaleMembers.length,
      pending,
      approved,
      rejected,
    };
  }, [femaleMembers]);

  // Filtered list with status and search for Primary Users
  const filteredUsers = useMemo(() => {
    return districtFilteredUsers.filter((u) => {
      const uStatus = u.status || (u.isVerified ? 'approved' : 'pending');
      const isRejected = uStatus === 'reject' || uStatus === 'rejected';
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'pending' && uStatus === 'pending') ||
        (activeFilter === 'approved' && uStatus === 'approved') ||
        (activeFilter === 'rejected' && isRejected);

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        u.name?.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.city?.toLowerCase().includes(query) ||
        u.district?.toLowerCase().includes(query) ||
        u.communityName?.toLowerCase().includes(query) ||
        u.membershipId?.toLowerCase().includes(query) ||
        u.paymentUtr?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [districtFilteredUsers, activeFilter, searchQuery]);

  // Filtered list with status, search, and district filter for Female Family Members
  const filteredFemaleMembers = useMemo(() => {
    return femaleMembers.filter((m) => {
      const mStatus = m.status || 'pending';
      let matchesFilter = true;
      if (activeFilter === 'pending') matchesFilter = mStatus === 'pending';
      else if (activeFilter === 'approved') matchesFilter = mStatus === 'approved';
      else if (activeFilter === 'rejected') matchesFilter = mStatus === 'rejected';

      const pUser = usersMap.get(m.user_id);

      // District filter: check primary user's district
      if (isRestrictedToDistrict && userDistrict && pUser) {
        const uDist = (pUser.district || '').toLowerCase();
        const target = (cleanDistrict || userDistrict).toLowerCase();
        if (!uDist.includes(target) && !target.includes(uDist)) return false;
      } else if (selectedDistrictFilter && pUser) {
        const uDist = (pUser.district || '').toLowerCase();
        const target = selectedDistrictFilter.toLowerCase();
        if (!uDist.includes(target) && !target.includes(uDist)) return false;
      }

      if (!searchQuery.trim()) return matchesFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.relation.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        (m.aadhaar_number && m.aadhaar_number.toLowerCase().includes(q)) ||
        (m.payment_utr && m.payment_utr.toLowerCase().includes(q)) ||
        (pUser && pUser.name.toLowerCase().includes(q)) ||
        (pUser && pUser.phone?.toLowerCase().includes(q)) ||
        (pUser && pUser.membershipId?.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [femaleMembers, activeFilter, searchQuery, selectedDistrictFilter, isRestrictedToDistrict, userDistrict, cleanDistrict, usersMap]);

  // Primary Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, startIndex, pageSize]);

  // Female Pagination calculations
  const totalFemaleItems = filteredFemaleMembers.length;
  const totalFemalePages = Math.max(1, Math.ceil(totalFemaleItems / pageSize));
  const validFemalePage = Math.min(currentPage, totalFemalePages);
  const startFemaleIndex = (validFemalePage - 1) * pageSize;
  const paginatedFemaleMembers = useMemo(() => {
    return filteredFemaleMembers.slice(startFemaleIndex, startFemaleIndex + pageSize);
  }, [filteredFemaleMembers, startFemaleIndex, pageSize]);

  // Female Member Action Handlers
  const handleApproveFemaleMember = async (member: FemaleFamilyMember) => {
    if (!canPerformKycAction) return;
    try {
      setFemaleProcessingId(member.id);
      setFemaleProcessingAction('approve');
      await updateFemaleFamilyMember(member.id, { status: 'approved', rejection_reason: '' });
      setFemaleMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: 'approved', rejection_reason: '' } : m))
      );
    } catch (err) {
      console.error('Failed to approve female family member:', err);
    } finally {
      setFemaleProcessingId(null);
      setFemaleProcessingAction(null);
    }
  };

  const handleOpenRejectFemaleMember = (member: FemaleFamilyMember) => {
    setRejectFemaleMember(member);
  };

  const handleConfirmRejectFemaleMember = async (reason: string) => {
    if (!rejectFemaleMember || !canPerformKycAction) return;
    const member = rejectFemaleMember;
    try {
      setFemaleProcessingId(member.id);
      setFemaleProcessingAction('reject');
      await updateFemaleFamilyMember(member.id, { status: 'rejected', rejection_reason: reason });
      setFemaleMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: 'rejected', rejection_reason: reason } : m))
      );
      setRejectFemaleMember(null);
    } catch (err) {
      console.error('Failed to reject female family member:', err);
    } finally {
      setFemaleProcessingId(null);
      setFemaleProcessingAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
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
            <ShieldCheck className="w-6 h-6" style={{ color: 'var(--mfct-gold)' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr('सदस्य पंजीकरण एवं केवाईसी सत्यापन', 'اراکین رجسٹریشن اور KYC تصدیق', 'Member Registrations & KYC Verification')}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-4xl" style={{ color: 'rgba(200,168,75,0.9)' }}>
              {tr(
                'नए पंजीकृत सदस्यों के दस्तावेज़, आधार कार्ड और भुगतान सत्यापन की समीक्षा करें।',
                'نئے رجسٹرڈ اراکین کے دستاویزات، آدھار کارڈ اور ادائیگی کا جائزہ لیں۔',
                'Review member documents, Aadhaar identity proofs, and fee payment verification records.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Queue Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Section Switcher: Primary User KYC vs Female Family Members KYC */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => {
                setKycSection('primary');
                setCurrentPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                kycSection === 'primary'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{tr('मुख्य सदस्य पंजीकरण (₹100)', 'بنیادی ممبران رجسٹریشن (100 روپے)', 'Primary Members KYC (₹100)')}</span>
              {counts.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                  {counts.pending}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setKycSection('female_members');
                setCurrentPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                kycSection === 'female_members'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm ring-1 ring-pink-200 dark:ring-pink-800/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-white/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" />
              <span>{tr('महिला पारिवारिक सदस्य (₹50)', 'خواتین فیملی ممبرز (50 روپے)', 'Female Family Members (₹50)')}</span>
              {femaleCounts.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white">
                  {femaleCounts.pending}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-end px-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {kycSection === 'primary' ? (
              <span>{counts.all} {tr('पंजीकरण कुल', 'کل رجسٹریشنز', 'Total Registrations')}</span>
            ) : (
              <span>{femaleCounts.all} {tr('महिला सदस्य कुल', 'کل خواتین ممبرز', 'Total Female Members')}</span>
            )}
          </div>
        </div>

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
                  {displayUserDistrict && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                      {displayUserDistrict}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  {tr(
                    `केवल आपके जिले (${displayUserDistrict || 'निर्दिष्ट जिला'}) के सदस्यों का केवाईसी दिखाया जा रहा है।`,
                    `صرف آپ کے ضلع (${displayUserDistrict || 'مخصوص ضلع'}) کے اراکین کی کے وائی سی دکھائی جا رہی ہے۔`,
                    `Showing only member KYC registrations belonging to your designated district (${displayUserDistrict || 'Assigned District'}).`
                  )}
                  {!canPerformKycAction && (
                    <span className="block mt-0.5 font-semibold text-rose-700 dark:text-rose-400">
                      {tr(
                        '(केवल दृश्य मोड: सत्यापन की कार्रवाई केवल जिला संयोजक या केंद्रीय व्यवस्थापक कर सकते हैं)',
                        '(صرف دیکھنے کا موڈ: صرف ڈسٹرکٹ کوآرڈینیٹر یا سینٹرل ایڈمن تصدیق کر سکتے ہیں)',
                        '(View Only: KYC actions can only be performed by District Coordinator or Central Admins)'
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold text-[11px] shrink-0">
              {districtFilteredUsers.length} {tr('सदस्य', 'اراکین', districtFilteredUsers.length === 1 ? 'Member' : 'Members')}
            </span>
          </div>
        )}

        {/* Filter Pills & Controls Bar */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${activeFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{tr('लंबित सत्यापन', 'زیر التواء', 'Pending Approval')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                }`}>
                {kycSection === 'primary' ? counts.pending : femaleCounts.pending}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('approved')}
              className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${activeFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tr('सत्यापित / स्वीकृत', 'تصدیق شدہ', 'Approved & Verified')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                }`}>
                {kycSection === 'primary' ? counts.approved : femaleCounts.approved}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('rejected')}
              className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${activeFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100'
                }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{tr('अस्वीकृत', 'مسترد شدہ', 'Rejected')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                }`}>
                {kycSection === 'primary' ? counts.rejected : femaleCounts.rejected}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${activeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{tr('सभी रिकॉर्ड', 'تمام ریکارڈز', 'All Records')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'all' ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                {kycSection === 'primary' ? counts.all : femaleCounts.all}
              </span>
            </button>
          </div>

          {/* Right Controls: District Filter Dropdown & Search Box */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isRestrictedToDistrict && (
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-emerald-500 outline-none cursor-pointer"
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

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={tr('नाम, फ़ोन, ईमेल, UTR या शहर खोजें...', 'نام، فون، ای میل، UTR تلاش کریں...', 'Search name, phone, email, UTR...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Table vs Cards */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={tr('तालिका दृश्य (Tabular View)', 'ٹیبل کا منظر', 'Table View')}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={tr('कार्ड दृश्य (Card View)', 'کارڈ کا منظر', 'Card View')}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Primary Users List OR Female Family Members List ─── */}
        {kycSection === 'primary' ? (
          loading ? (
            <DarkListSkeleton items={4} />
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="max-w-sm space-y-1">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {searchQuery
                  ? tr('कोई मिलान नहीं मिला', 'کوئی نتیجہ نہیں ملا', 'No matching members found')
                  : activeFilter === 'pending'
                    ? tr('सब कुछ अद्यतन है! कोई लंबित सत्यापन नहीं', 'سب مکمل ہے! کوئی زیر التواء تصدیق نہیں', 'All caught up! No pending verifications')
                    : activeFilter === 'rejected'
                      ? tr('कोई अस्वीकृत आवेदन नहीं है', 'کوئی مسترد شدہ درخواست نہیں', 'No rejected applications')
                      : tr('कोई सदस्य नहीं मिला', 'کوئی ممبر نہیں ملا', 'No members found')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {searchQuery
                  ? tr('कृपया अलग खोज शब्द का प्रयास करें।', 'براہ کرم کوئی دوسرا لفظ تلاش کریں۔', 'Try adjusting your search criteria.')
                  : activeFilter === 'pending'
                    ? tr('सभी सदस्य सफलतापूर्वक सत्यापित किए जा चुके हैं।', 'تمام اراکین کی تصدیق مکمل ہو چکی ہے۔', 'All registered members have been reviewed.')
                    : activeFilter === 'rejected'
                      ? tr('कोई अस्वीकृत सदस्य रिकॉर्ड उपलब्ध नहीं है।', 'کوئی مسترد شدہ ریکارڈ موجود نہیں ہے۔', 'No rejected member applications.')
                      : tr('इस श्रेणी में अभी कोई रिकॉर्ड नहीं है।', 'اس کیٹیگری میں ابھی کوئی ریکارڈ موجود نہیں ہے۔', 'No records found in this category.')}
              </p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* TABULAR FORM VIEW */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {tr('आवेदक विवरण', 'امیدوار کی تفصیلات', 'Applicant / Member')}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {tr('संपर्क एवं स्थान', 'رابطہ اور مقام', 'Contact & Location')}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {tr('श्रेणी एवं पात्रता', 'کیٹیگری اور اہلیت', 'Category & Aid')}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {tr('दस्तावेज एवं UTR', 'دستاویزات اور UTR', 'Documents & UTR')}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {tr('सत्यापन स्थिति', 'تصدیق کی حیثیت', 'KYC Status')}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-right">
                      {tr('कार्रवाई', 'کارروائی', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedUsers.map((u) => (
                    <KycUserTableRow
                      key={u.id}
                      user={u}
                      canPerformKycAction={canPerformKycAction}
                      processingId={processingId}
                      processingAction={processingAction}
                      terminating={terminating}
                      onView={setSelectedUser}
                      onApprove={handleApprove}
                      onOpenReject={openRejectModal}
                      onOpenTerminate={openTerminateModal}
                      onPreviewImage={setPreviewImage}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <KycPagination
              currentPage={validPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => setPageSize(size)}
            />
          </div>
        ) : (
          /* CARD LIST VIEW */
          <div className="space-y-4">
            <div className="space-y-3.5">
              {paginatedUsers.map((u) => (
                <KycUserCard
                  key={u.id}
                  user={u}
                  canPerformKycAction={canPerformKycAction}
                  processingId={processingId}
                  processingAction={processingAction}
                  terminating={terminating}
                  onView={setSelectedUser}
                  onApprove={handleApprove}
                  onOpenReject={openRejectModal}
                  onOpenTerminate={openTerminateModal}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <KycPagination
              currentPage={validPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => setPageSize(size)}
            />
          </div>
        )
      ) : (
        /* FEMALE FAMILY MEMBERS KYC SECTION */
          loadingFemaleMembers ? (
            <DarkListSkeleton items={4} />
          ) : filteredFemaleMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-pink-50 dark:bg-pink-950/40 rounded-full flex items-center justify-center text-pink-500">
                <Heart className="w-8 h-8 fill-pink-500/30 text-pink-500" />
              </div>
              <div className="max-w-sm space-y-1">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {searchQuery
                    ? tr('कोई मिलान नहीं मिला', 'کوئی نتیجہ نہیں ملا', 'No matching female members found')
                    : activeFilter === 'pending'
                      ? tr('कोई लंबित महिला सदस्य सत्यापन नहीं है', 'کوئی زیر التواء خواتین تصدیق نہیں ہے', 'No pending female member approvals')
                      : activeFilter === 'rejected'
                        ? tr('कोई अस्वीकृत महिला सदस्य नहीं है', 'کوئی مسترد شدہ خواتین ممبر नहीं है', 'No rejected female members')
                        : tr('कोई महिला पारिवारिक सदस्य नहीं मिला', 'کوئی خاتون فیملی ممبر نہیں ملا', 'No female family members found')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery
                    ? tr('कृपया अलग खोज शब्द का प्रयास करें।', 'براہ کرم کوئی دوسرا لفظ تلاش کریں۔', 'Try adjusting your search criteria.')
                    : activeFilter === 'pending'
                      ? tr('सभी पंजीकृत महिला सदस्यों की समीक्षा पूरी हो चुकी है।', 'تمام رجسٹرڈ خواتین ممبران کی تصدیق مکمل ہے۔', 'All submitted female family members have been approved.')
                      : tr('इस श्रेणी में अभी कोई रिकॉर्ड उपलब्ध नहीं है।', 'اس کیٹیگری میں فی الحال کوئی ریکارڈ موجود نہیں ہے۔', 'No records found in this category.')}
                </p>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* FEMALE MEMBERS TABULAR FORM VIEW */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3.5 whitespace-nowrap">
                        {tr('महिला सदस्य', 'خاتون رکن', 'Female Member')}
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap">
                        {tr('मुख्य सदस्य (पंजीकर्ता)', 'بنیادی رکن (رجسٹر کنندہ)', 'Primary Member')}
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap">
                        {tr('संपर्क एवं आधार', 'رابطہ اور آدھار', 'Contact & Aadhaar')}
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap">
                        {tr('शुल्क एवं भुगतान (₹50)', 'فیس اور ادائیگی (50 روپے)', 'Fee & Payment (₹50)')}
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap">
                        {tr('सत्यापन स्थिति', 'تصدیق کی حیثیت', 'KYC Status')}
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap text-right">
                        {tr('कार्रवाई', 'کارروائی', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedFemaleMembers.map((m) => (
                      <FemaleMemberTableRow
                        key={m.id}
                        member={m}
                        primaryUser={usersMap.get(m.user_id)}
                        canPerformKycAction={canPerformKycAction}
                        processingId={femaleProcessingId}
                        processingAction={femaleProcessingAction}
                        onApprove={handleApproveFemaleMember}
                        onOpenReject={handleOpenRejectFemaleMember}
                        onPreviewImage={setPreviewImage}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Female Pagination Controls */}
              <KycPagination
                currentPage={validFemalePage}
                totalPages={totalFemalePages}
                totalItems={totalFemaleItems}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => setPageSize(size)}
              />
            </div>
          ) : (
            /* FEMALE MEMBERS CARD LIST VIEW */
            <div className="space-y-4">
              <div className="space-y-3.5">
                {paginatedFemaleMembers.map((m) => (
                  <FemaleMemberCard
                    key={m.id}
                    member={m}
                    primaryUser={usersMap.get(m.user_id)}
                    canPerformKycAction={canPerformKycAction}
                    processingId={femaleProcessingId}
                    processingAction={femaleProcessingAction}
                    onApprove={handleApproveFemaleMember}
                    onOpenReject={handleOpenRejectFemaleMember}
                    onPreviewImage={setPreviewImage}
                  />
                ))}
              </div>

              {/* Female Pagination Controls */}
              <KycPagination
                currentPage={validFemalePage}
                totalPages={totalFemalePages}
                totalItems={totalFemaleItems}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => setPageSize(size)}
              />
            </div>
          )
        )}
      </div>

      {/* Comprehensive User Registration Details Modal */}
      {selectedUser && (
        <KycUserDetailModal
          user={selectedUser}
          canPerformKycAction={canPerformKycAction}
          processingId={processingId}
          processingAction={processingAction}
          terminating={terminating}
          onClose={() => setSelectedUser(null)}
          onApprove={handleApprove}
          onOpenReject={openRejectModal}
          onOpenTerminate={openTerminateModal}
          onPreviewImage={setPreviewImage}
        />
      )}

      {/* Mandatory Rejection Reason Modal */}
      {rejectModalUser && (
        <RejectReasonModal
          user={rejectModalUser}
          processingId={processingId}
          onClose={() => setRejectModalUser(null)}
          onConfirm={handleConfirmReject}
        />
      )}

      {/* Female Member Reject Reason Modal */}
      {rejectFemaleMember && (
        <FemaleMemberRejectModal
          member={rejectFemaleMember}
          processingId={femaleProcessingId}
          onClose={() => setRejectFemaleMember(null)}
          onConfirm={handleConfirmRejectFemaleMember}
        />
      )}

      {/* Account Termination Confirmation Modal */}
      {terminateModalUser && (
        <TerminateUserModal
          user={terminateModalUser}
          terminating={terminating}
          onClose={() => setTerminateModalUser(null)}
          onConfirm={handleConfirmTerminate}
        />
      )}

      {/* Image Zoom Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-slate-950/90 z-[120] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="max-w-4xl max-h-[90vh] relative flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-rose-400 p-2 text-sm font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-5 h-5" /> {tr('बंद करें', 'بند کریں', 'Close')}
            </button>
            <p className="text-white text-xs font-bold mb-2">{previewImage.title}</p>
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain ring-1 ring-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const KycTab = ExecutiveDashboard;
