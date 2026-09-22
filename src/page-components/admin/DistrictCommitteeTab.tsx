'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, DistrictRoleKey } from '../../types';
import { DISTRICT_POSTS, STANDARD_DISTRICTS } from '../../data/districtsData';
import { useLanguage } from '../../context/LanguageContext';
import { getUsers, updateUser } from '../../services/userService';
import {
  Award,
  Users,
  Search,
  Phone,
  MessageCircle,
  UserPlus,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Printer,
  Edit3,
  X,
  Trash2,
  Loader2,
} from 'lucide-react';
import { autoTranslateText } from '../../lib/autoTranslate';
import { DistrictCommitteeBoardSkeleton } from '../../components/Skeletons';

interface DistrictCommitteeTabProps {
  activeUser: User;
  currentRole: UserRole;
  scopedDistrict?: string;
}

export const DistrictCommitteeTab: React.FC<DistrictCommitteeTabProps> = ({
  activeUser,
  currentRole,
  scopedDistrict,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const rawDistRole = (
    activeUser.districtRole ||
    (activeUser as any).district_role ||
    (currentRole as string) ||
    ''
  ).toLowerCase().trim().replace(/\s+/g, '_');

  // const isSuperOrExec =
  //   currentRole === 'super_admin' ||
  //   currentRole === 'executive_admin' ||
  //   activeUser.role === 'super_admin' ||
  //   activeUser.role === 'executive_admin';

  const isDistrictPresident =
    currentRole === 'district_president' ||
    rawDistRole === 'district_president' ||
    rawDistRole.includes('president');

  // Other district roles (Coordinator, General Secretary, Secretary, Finance Coordinator) can only view the committee list.
  const canManageOfficers = isDistrictPresident;

  // Initial district
  const initialDist =
    scopedDistrict ||
    activeUser.district ||
    activeUser.city ||
    STANDARD_DISTRICTS[0].id;

  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDist);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Appoint modal state
  const [appointModalOpen, setAppointModalOpen] = useState(false);
  const [activeSlotKey, setActiveSlotKey] = useState<DistrictRoleKey | null>(null);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateScope, setCandidateScope] = useState<'district' | 'all'>('district');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch users for the active district
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(undefined);
      setAllUsers(data);
    } catch (err) {
      console.error('Failed to load users for committee:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update selected district when scopedDistrict changes
  useEffect(() => {
    if (scopedDistrict) {
      setSelectedDistrict(scopedDistrict);
    }
  }, [scopedDistrict]);

  // Filter users belonging to the currently selected district (President's district)
  const usersInDistrict = useMemo(() => {
    const dLower = (selectedDistrict || '').toLowerCase().trim();
    if (!dLower) return allUsers;
    return allUsers.filter((u) => {
      const uDist = (u.district || '').toLowerCase().trim();
      const uCity = (u.city || '').toLowerCase().trim();
      return (
        uDist === dLower ||
        uCity === dLower ||
        uDist.includes(dLower) ||
        dLower.includes(uDist)
      );
    });
  }, [allUsers, selectedDistrict]);

  // Map each of the 5 positions to its assigned user in the selected district
  const committeeAssignments = useMemo(() => {
    const map: Partial<Record<DistrictRoleKey, User>> = {};

    DISTRICT_POSTS.forEach((post) => {
      const assigned = allUsers.find((u) => {
        const uDist = (u.district || u.city || '').toLowerCase().trim();
        const dLower = selectedDistrict.toLowerCase().trim();
        const matchesDist =
          uDist === dLower ||
          uDist.includes(dLower) ||
          dLower.includes(uDist);

        const uRole = (u.role as string) || '';
        const uDistRole = u.districtRole || u.district_role || '';

        return (
          matchesDist &&
          (uRole === post.key ||
            uDistRole === post.key ||
            (post.key === 'district_president' && (uRole.includes('president') || uDistRole.includes('president'))) ||
            (post.key === 'district_coordinator' && (uRole.includes('coordinator') || uDistRole.includes('coordinator'))) ||
            (post.key === 'district_gen_secretary' && (uRole.includes('gen_sec') || uDistRole.includes('gen_sec') || uRole.includes('general'))) ||
            (post.key === 'district_secretary' && (uRole === 'district_secretary' || uDistRole === 'district_secretary')) ||
            (post.key === 'district_finance_coord' && (uRole.includes('finance') || uDistRole.includes('finance'))))
        );
      });

      if (assigned) {
        map[post.key] = assigned;
      }
    });

    return map;
  }, [allUsers, selectedDistrict]);

  // Candidate pool for appointment: filtered according to the president's district by default
  const candidatePool = useMemo(() => {
    const baseList = candidateScope === 'district' ? usersInDistrict : allUsers;
    const q = candidateSearch.toLowerCase().trim();
    return baseList.filter((u) => {
      const matchQuery =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.membershipId && u.membershipId.toLowerCase().includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q)) ||
        (u.district && u.district.toLowerCase().includes(q));

      return matchQuery;
    });
  }, [candidateScope, usersInDistrict, allUsers, candidateSearch]);

  const handleOpenAppoint = (slotKey: DistrictRoleKey) => {
    if (!canManageOfficers) {
      showToast(
        tr(
          'केवल जिला अध्यक्ष को पदाधिकारी नियुक्त या बदलने का अधिकार है।',
          'صرف ضلعی صدر کو عہدیدار نامزد یا تبدیل کرنے کا اختیار ہے۔',
          'Only District President can appoint or change officers.'
        ),
        'error'
      );
      return;
    }
    setActiveSlotKey(slotKey);
    setCandidateSearch('');
    setCandidateScope('district');
    setAppointModalOpen(true);
  };

  const handleConfirmAppoint = async (selectedUser: User) => {
    if (!activeSlotKey) return;
    if (!canManageOfficers) {
      showToast(
        tr(
          'केवल जिला अध्यक्ष को पदाधिकारी नियुक्त करने का अधिकार है।',
          'صرف ضلعی صدر کو عہدیدار نامزد کرنے کا اختیار ہے۔',
          'Only District President can appoint officers.'
        ),
        'error'
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];

      // 1. If another user in this district currently holds this position, unassign them first so there's no conflict
      const existingOfficer = committeeAssignments[activeSlotKey];
      if (existingOfficer && existingOfficer.id !== selectedUser.id) {
        await updateUser(existingOfficer.id, {
          districtRole: null as any,
          district_role: null as any,
          role: distRoleKeys.includes(existingOfficer.role) ? 'member' : existingOfficer.role,
        }).catch((err) => console.warn('Previous officer unassign error:', err));
      }

      // 2. Update selected user with district and post (matching ManageUsers.tsx pattern)
      await updateUser(selectedUser.id, {
        district: selectedDistrict,
        role: activeSlotKey,
        districtRole: activeSlotKey,
        district_role: activeSlotKey,
      });

      if (selectedDistrict) {
        autoTranslateText(selectedDistrict, 'hi').catch(() => { });
        autoTranslateText(selectedDistrict, 'ur').catch(() => { });
      }

      showToast(
        tr(
          `${selectedUser.name} को ${activePostDefinition?.titleHi || 'पद'} पर सफलतापूर्वक नियुक्त किया गया।`,
          `${selectedUser.name} کو کامیابی سے عہدے پر مقرر کیا گیا۔`,
          `${selectedUser.name} appointed successfully to the post.`
        ),
        'success'
      );
      setAppointModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.message || tr('नियुक्ति में त्रुटि हुई', 'تعیناتی میں خرابی', 'Failed to appoint officer'),
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOfficer = async (slotKey: DistrictRoleKey) => {
    if (!canManageOfficers) {
      showToast(
        tr(
          'केवल जिला अध्यक्ष को पदाधिकारी हटाने का अधिकार है।',
          'صرف ضلعی صدر کو عہدیدار ہٹانے کا اختیار ہے۔',
          'Only District President can unassign officers.'
        ),
        'error'
      );
      return;
    }
    const currentOfficer = committeeAssignments[slotKey];
    if (!currentOfficer) return;
    if (!window.confirm(tr(
      `क्या आप निश्चित रूप से ${currentOfficer.name} को इस पद से अवमुक्त करना चाहते हैं?`,
      `کیا آپ واقعی اس عہدیدار کو سبکدوش کرنا چاہتے ہیں؟`,
      `Are you sure you want to unassign ${currentOfficer.name} from this post?`
    ))) {
      return;
    }

    setIsSubmitting(true);
    try {
      const distRoleKeys = ['district_president', 'district_coordinator', 'district_gen_secretary', 'district_secretary', 'district_finance_coord'];
      await updateUser(currentOfficer.id, {
        districtRole: null as any,
        district_role: null as any,
        role: distRoleKeys.includes(currentOfficer.role) ? 'member' : currentOfficer.role,
      });

      showToast(
        tr('पदाधिकारी को पद से अवमुक्त किया गया।', 'عہدیدار کو سبکدوش کیا گیا۔', 'Officer unassigned successfully.'),
        'success'
      );
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || tr('त्रुटि हुई', 'خرابی', 'Failed to unassign officer'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePostDefinition = DISTRICT_POSTS.find((p) => p.key === activeSlotKey);


  return (
    <div className="space-y-6  animate-fade-in pb-12">
      {/* Toast Notification (Top & Center Pill Standard) */}
      {toastMsg && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4"
          style={{ maxWidth: '90vw' }}
        >
          <div
            className={`px-5 py-3 rounded-2xl shadow-2xl text-white text-xs sm:text-sm font-bold flex items-center gap-3 border backdrop-blur-md ${toastMsg.type === 'success'
              ? 'bg-emerald-700/95 border-emerald-500/50 shadow-emerald-950/40'
              : 'bg-rose-700/95 border-rose-500/50 shadow-rose-950/40'
              }`}
          >
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />
            )}
            <span className="leading-snug">{toastMsg.text}</span>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="ml-2 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
            <Award className="w-6 h-6" style={{ color: 'var(--mfct-gold)' }} />
          </div>
          <div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr('जिला टीम पद एवं जिम्मेदारियाँ', 'ضلعی ٹیم عہدے اور ذمہ داریاں', 'District Team Posts & Responsibilities')}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-4xl" style={{ color: 'rgba(200,168,75,0.9)' }}>
              {tr(
                'जिले में MFCT की गतिविधियों के संचालन, सदस्यता विस्तार, बैठक कार्यवाही, और आधिकारिक वित्तीय लेन-देन हेतु अधिकृत 5-सदस्यीय कोर टीम।',
                'ضلع میں ٹرسٹ کی سرگرمیوں کے انتظام، رکنیت سازی، میٹنگ کارروائی اور مالیاتی امور کے لیے نامزد 5 رکنی کور کمیٹی۔',
                'Official 5-member core executive council overseeing leadership, coordination, block expansion, meeting records, and finance.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. The 5-Slot Committee Board (Exact Layout from Image 1) */}
      {loading ? (
        <DistrictCommitteeBoardSkeleton />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {/* Board Title Header */}
          <div
            className="py-4 px-6 text-center text-white font-extrabold text-base sm:text-lg tracking-wide flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(90deg, #0f2e1e 0%, #16432b 50%, #0f2e1e 100%)' }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: 'var(--mfct-gold)' }}
            />
            <h2 className="tracking-wide">
              {tr(
                `${selectedDistrict} जिला टीम पद एवं जिम्मेदारियाँ`,
                `${selectedDistrict} ضلعی ٹیم عہدے اور ذمہ داریاں`,
                `${selectedDistrict} District Team Posts & Responsibilities`
              )}
            </h2>
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: 'var(--mfct-gold)' }}
            />
          </div>

          {/* List of 5 Core Posts */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {DISTRICT_POSTS.map((post) => {
              const officer = committeeAssignments[post.key];
              const title = language === 'hi' ? post.titleHi : language === 'ur' ? post.titleUr : post.titleEn;
              const duty = language === 'hi' ? post.dutyHi : language === 'ur' ? post.dutyUr : post.dutyEn;

              return (
                <div
                  key={post.key}
                  className="p-4 sm:p-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Left: Slot Number, Role Title & Responsibility */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Slot Number Badge */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm"
                      style={{
                        background: 'rgba(200, 168, 75, 0.2)',
                        color: 'var(--mfct-gold)',
                        border: '1.5px solid rgba(200, 168, 75, 0.4)',
                      }}
                    >
                      {post.slotNumber}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {title}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {post.titleEn}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                        <strong className="text-slate-800 dark:text-slate-200">
                          {tr('जिम्मेदारी (Responsibility):', 'ذمہ داری:', 'Duty:')}{' '}
                        </strong>
                        {duty}
                      </p>
                    </div>
                  </div>

                  {/* Right: Officer Profile or Vacant Indicator */}
                  <div className="lg:w-80 shrink-0 bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {officer ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          {officer.avatar && !officer.avatar.startsWith('file://') ? (
                            <img
                              src={officer.avatar}
                              alt={officer.name}
                              className="w-11 h-11 rounded-full object-cover border-2 shrink-0"
                              style={{ borderColor: 'var(--mfct-gold)' }}
                            />
                          ) : (
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
                              style={{ background: 'var(--mfct-mid-green)' }}
                            >
                              {(officer.name || 'U')[0].toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                {officer.name}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{officer.phone || '-'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Communication & Manage Buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                          {officer.phone && (
                            <>
                              <a
                                href={`tel:${officer.phone}`}
                                className="flex-1 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                                title="Call"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{tr('कॉल', 'کال', 'Call')}</span>
                              </a>
                              <a
                                href={`https://wa.me/${officer.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          )}

                          {canManageOfficers && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenAppoint(post.key)}
                                className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                                title={tr('पदाधिकारी बदलें', 'عہدیدار تبدیل کریں', 'Change Officer')}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveOfficer(post.key)}
                                disabled={isSubmitting}
                                className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                title={tr('पद रिक्त करें / अवमुक्त करें', 'عہدہ خالی کریں', 'Unassign / Vacate Post')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Vacant Post Indicator */
                      <div className="text-center py-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-2">
                          ⚠️ {tr('रिक्त पद (Vacant Slot)', 'خالی عہدہ', 'Vacant Position')}
                        </span>
                        <p className="text-[11px] text-slate-500 mb-3">
                          {tr(
                            'इस जिले के लिए अभी तक कोई पदाधिकारी नियुक्त नहीं है।',
                            'اس ضلع کے لیے کوئی عہدیدار نامزد نہیں ہے۔',
                            'No officer appointed for this post yet in this district.'
                          )}
                        </p>

                        {canManageOfficers && (
                          <button
                            onClick={() => handleOpenAppoint(post.key)}
                            className="w-full mfct-btn-gold py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{tr('पदाधिकारी नियुक्त करें', 'عہدیدار نامزد کریں', 'Appoint Officer')}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Appointment Modal */}
      {appointModalOpen && activePostDefinition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setAppointModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                style={{
                  background: 'rgba(200, 168, 75, 0.2)',
                  color: 'var(--mfct-gold)',
                  border: '1px solid rgba(200, 168, 75, 0.4)',
                }}
              >
                {activePostDefinition.slotNumber}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {tr('पदाधिकारी नियुक्ति', 'عہدیدار کی تعیناتی', 'Appoint District Officer')}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'hi'
                    ? `${selectedDistrict} - ${activePostDefinition.titleHi}`
                    : `${selectedDistrict} - ${activePostDefinition.titleEn}`}
                </p>
              </div>
            </div>

            {/* Post Responsibility Card */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 my-4 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {tr('अधिकृत कार्यक्षेत्र (Designated Duty):', 'نامزد ذمہ داری:', 'Designated Responsibility:')}
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'hi' ? activePostDefinition.dutyHi : activePostDefinition.dutyEn}
              </p>
            </div>

            {/* Candidate Scope Selector & Search */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCandidateScope('district')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center truncate ${candidateScope === 'district'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{selectedDistrict} {tr('के सदस्य', 'کے ممبران', 'Members')} ({usersInDistrict.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCandidateScope('all')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center truncate ${candidateScope === 'all'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{tr('सभी सदस्य', 'تمام ممبران', 'All Members')} ({allUsers.length})</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    candidateScope === 'district'
                      ? tr(`${selectedDistrict} में नाम, फोन नंबर से खोजें...`, `${selectedDistrict} میں تلاش کریں...`, `Search within ${selectedDistrict}...`)
                      : tr('सभी सदस्यों में नाम, फोन नंबर से खोजें...', 'تمام ممبران میں تلاش کریں...', 'Search all members...')
                  }
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Candidate List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {candidatePool.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <p>{tr('कोई उपयुक्त सदस्य नहीं मिला', 'کوئی ممبر नहीं मिला', 'No members found matching criteria')}</p>
                  {candidateScope === 'district' && (
                    <button
                      type="button"
                      onClick={() => setCandidateScope('all')}
                      className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer inline-block"
                    >
                      {tr('सभी सदस्यों में से चुनें →', 'تمام ممبران میں تلاش کریں →', 'Browse all registered members →')}
                    </button>
                  )}
                </div>
              ) : (
                candidatePool.slice(0, 15).map((cand) => {
                  const existingPost = cand.districtRole || cand.district_role;
                  return (
                    <div
                      key={cand.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-white dark:bg-slate-950 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {cand.avatar && !cand.avatar.startsWith('file://') ? (
                          <img
                            src={cand.avatar}
                            alt={cand.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                            {(cand.name || 'U')[0].toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {cand.name}
                            </p>
                            {cand.isVerified && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                                KYC ✓
                              </span>
                            )}
                            {existingPost && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                                {existingPost}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            {cand.phone} • {cand.district || cand.city || tr('जिला अनिर्धारित', 'ضلع غیر متعین', 'District unassigned')}
                          </p>
                        </div>
                      </div>

                      <button
                        disabled={isSubmitting}
                        onClick={() => handleConfirmAppoint(cand)}
                        className="px-3.5 py-1.5 rounded-xl mfct-btn-gold text-[11px] font-bold shrink-0 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          tr('नियुक्त करें', 'نامزد کریں', 'Appoint')
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setAppointModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                {tr('रद्द करें', 'منسوخ', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
