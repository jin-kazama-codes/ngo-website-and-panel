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
    UserCheck,
    UserPlus,
    Shield,
    MapPin,
    CheckCircle2,
    AlertCircle,
    Printer,
    ChevronRight,
    ExternalLink,
    Edit3,
    X,
    FileText,
    Calendar,
    Building,
    TrendingUp,
    HeartHandshake,
    Clock,
    Layers,
    Sparkles,
    Check,
    BookOpen,
    DollarSign,
    ShieldCheck,
    Briefcase,
    Building2,
    FileCheck2,
    IndianRupee,
    FileCheck,
} from 'lucide-react';
import { DistrictTeamUnit, getTeams } from '../../services/teamService';
import { Meeting, getMeetings } from '../../services/meetingService';

export interface DistrictDashboardProps {
    activeUser: User;
    currentRole: UserRole;
    scopedDistrict?: string;
    onNavigateTab?: (tab: string) => void;
}

// Hardcoded Default Core Committee Profiles for All District Roles
const DEFAULT_DISTRICT_OFFICERS: Record<
    DistrictRoleKey,
    {
        name: string;
        phone: string;
        email: string;
        appointedDate: string;
        term: string;
        bio: string;
    }
> = {
    district_president: {
        name: 'Maulana Qari Arshad Ali',
        phone: '+91 98370 00112',
        email: 'president.bareilly@mfct.org',
        appointedDate: '2025-01-10',
        term: '2025 - 2027',
        bio: 'Presiding officer responsible for district executive governance, strategic oversight, and emergency aid authorizations.',
    },
    district_coordinator: {
        name: 'Dr. Shakeel Farooqui',
        phone: '+91 99270 44102',
        email: 'coordinator.bareilly@mfct.org',
        appointedDate: '2025-02-15',
        term: '2025 - 2027',
        bio: 'Chief field liaison coordinating hospital tie-ups, public grievances, volunteer deployments, and state team reporting.',
    },
    district_gen_secretary: {
        name: 'Chaudhary Shahid Hasan',
        phone: '+91 98376 77889',
        email: 'gensec.bareilly@mfct.org',
        appointedDate: '2025-01-20',
        term: '2025 - 2027',
        bio: 'Administrative head supervising block unit chartering, city chapter expansions, and volunteer induction drives.',
    },
    district_secretary: {
        name: 'Zubair Ahmad Qureshi',
        phone: '+91 94120 88712',
        email: 'secretary.bareilly@mfct.org',
        appointedDate: '2025-03-01',
        term: '2025 - 2027',
        bio: 'Custodian of official proceedings register, meeting notices, agendas, resolution documentation, and quorum tracking.',
    },
    district_finance_coord: {
        name: 'Haji Mukhtar Husain',
        phone: '+91 98375 66710',
        email: 'finance.bareilly@mfct.org',
        appointedDate: '2025-01-15',
        term: '2025 - 2027',
        bio: 'Treasurer ensuring Sadakah fund audit compliance, voucher scrutiny, UTR reconciliation, and bank transfer verifications.',
    },
};

// Hardcoded district overview statistics
const DISTRICT_STATS = {
    totalMembers: '4,850+',
    memberGrowth: '+14% this month',
    activeUnits: '12 Units',
    activeBlocks: '8 Blocks & 4 City Wards',
    volunteersCount: '320+',
    totalDisbursed: '₹18,45,000',
    beneficiaryCount: '142 Families',
    meetingsCount: '14 Recorded',
    resolutionsCount: '48 Approved',
    aidSuccessRate: '94.2%',
    pendingApplications: '18 in review',
};

// Sample Block Units
const DISTRICT_UNITS_SAMPLE = [
    { id: 'u1', name: 'Nawabganj Block Unit (नवाबगंज ब्लॉक इकाई)', president: 'Mohammad Rashid Khan', volunteers: 28, status: 'Active', zone: 'Rural Tehsil' },
    { id: 'u2', name: 'Baheri Tehsil & Block Unit (बहेड़ी ब्लॉक इकाई)', president: 'Haji Mukhtar Husain', volunteers: 34, status: 'Active', zone: 'Rural Tehsil' },
    { id: 'u3', name: 'Bareilly Central City Unit (बरेली नगर केंद्रीय)', president: 'Syed Arshad Ali', volunteers: 45, status: 'Active', zone: 'Urban Zone' },
    { id: 'u4', name: 'Faridpur Block Unit (फरीदपुर ब्लॉक इकाई)', president: 'Chaudhary Shahid Hasan', volunteers: 22, status: 'In Formation', zone: 'Rural Tehsil' },
    { id: 'u5', name: 'Qilla & Civil Lines Town Chapter (किला मंडल)', president: 'Advocate Sohail Ahmed', volunteers: 26, status: 'Active', zone: 'Urban Zone' },
];

// Sample Recent Meetings
const RECENT_MEETINGS_SAMPLE = [
    { id: 'm1', title: 'Monthly District Executive Coordination Meeting', date: '05 Sep 2026', venue: 'Secretariat, Bareilly', attendees: 18, decisions: 'Approved 15 medical aid sanctions' },
    { id: 'm2', title: 'Education Grant & Scholarship Committee Review', date: '10 Aug 2026', venue: 'Care Society Hall', attendees: 14, decisions: '39 orphan student aid verified' },
    { id: 'm3', title: 'District Relief & Disaster Response Briefing', date: '22 Jul 2026', venue: 'Chapter Office', attendees: 16, decisions: '5 block rapid response teams formed' },
];

export const DistrictDashboard: React.FC<DistrictDashboardProps> = ({
    activeUser,
    currentRole,
    scopedDistrict,
    onNavigateTab,
}) => {
    const { language } = useLanguage();
    const tr = (hi: string, ur: string, en: string) => {
        if (language === 'hi') return hi;
        if (language === 'ur') return ur;
        return en;
    };

    const userDistRole = (
        activeUser.districtRole ||
        (activeUser as any).district_role ||
        (activeUser.role as string) ||
        (currentRole as string) ||
        ''
    ).toLowerCase().trim().replace(/\s+/g, '_');

    let effectiveRoleKey = currentRole as string;
    if (userDistRole.includes('gen_sec') || userDistRole.includes('general')) {
        effectiveRoleKey = 'district_gen_secretary';
    } else if (userDistRole.includes('secretary')) {
        effectiveRoleKey = 'district_secretary';
    } else if (userDistRole.includes('coordinator')) {
        effectiveRoleKey = 'district_coordinator';
    } else if (userDistRole.includes('president')) {
        effectiveRoleKey = 'district_president';
    } else if (userDistRole.includes('finance')) {
        effectiveRoleKey = 'district_finance_coord';
    }

    const isDistrictPresident = effectiveRoleKey === 'district_president';
    const isGenSecretary = effectiveRoleKey === 'district_gen_secretary';
    const isSecretary = effectiveRoleKey === 'district_secretary';
    const isFinanceCoordinator = effectiveRoleKey === 'district_finance_coord';
    const canManageOfficers = isDistrictPresident;

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Active overview tab
    const [overviewSubTab, setOverviewSubTab] = useState<'committee' | 'units' | 'meetings' | 'finances'>('committee');

    // Teams state & calculation for district_gen_secretary
    const [teams, setTeams] = useState<DistrictTeamUnit[]>([]);

    // Meetings state & calculation for district_secretary
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    useEffect(() => {
        const loadTeamsAndMeetings = async () => {
            const dist = selectedDistrict || scopedDistrict || activeUser.district || activeUser.city;
            try {
                const tData = await getTeams(dist);
                if (tData && tData.length > 0) setTeams(tData);
            } catch (err) {
                console.warn('Teams load warning:', err);
            }
            try {
                const mData = await getMeetings(dist);
                if (mData && mData.length > 0) setMeetings(mData);
            } catch (err) {
                console.warn('Meetings load warning:', err);
            }
        };
        loadTeamsAndMeetings();
    }, [selectedDistrict, scopedDistrict, activeUser.district, activeUser.city]);

    const totalUnits = teams.length;
    const totalOfficersCount = teams.reduce((acc, t) => acc + (t.members?.length || 0) + 2, 0);

    const upcomingCount = meetings.filter((m) => m.status === 'upcoming').length;
    const completedCount = meetings.filter((m) => m.status === 'completed').length;
    const totalResolutions = meetings.reduce((sum, m) => sum + (m.resolutions?.length || 0), 0);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ text, type });
        setTimeout(() => setToastMsg(null), 3500);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers(undefined, undefined);
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

    useEffect(() => {
        if (scopedDistrict) {
            setSelectedDistrict(scopedDistrict);
        }
    }, [scopedDistrict]);

    // Map each of the 5 positions to its assigned user in the selected district, with fallback to hardcoded default
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
                const uDistRole = u.districtRole || (u as any).district_role || '';

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

    const candidatePool = useMemo(() => {
        const q = candidateSearch.toLowerCase().trim();
        return allUsers.filter((u) => {
            const matchQuery =
                !q ||
                (u.name && u.name.toLowerCase().includes(q)) ||
                (u.phone && u.phone.includes(q)) ||
                (u.membershipId && u.membershipId.toLowerCase().includes(q));

            return matchQuery;
        });
    }, [allUsers, candidateSearch]);

    const handleOpenAppoint = (slotKey: DistrictRoleKey) => {
        setActiveSlotKey(slotKey);
        setCandidateSearch('');
        setAppointModalOpen(true);
    };

    const handleConfirmAppoint = async (selectedUser: User) => {
        if (!activeSlotKey) return;
        setIsSubmitting(true);
        try {
            await updateUser(selectedUser.id, {
                district: selectedDistrict,
                role: activeSlotKey,
                districtRole: activeSlotKey,
                district_role: activeSlotKey,
            });

            showToast(
                tr(
                    `${selectedUser.name} को पद पर सफलतापूर्वक नियुक्त किया गया।`,
                    `${selectedUser.name} کو عہدے پر کامیابی سے مقرر کیا گیا۔`,
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

    const activePostDefinition = DISTRICT_POSTS.find((p) => p.key === activeSlotKey);

    // Role info for currently logged in user
    const currentRoleInfo = useMemo(() => {
        const targetKey = effectiveRoleKey || currentRole;
        const post = DISTRICT_POSTS.find((p) => p.key === targetKey);
        if (post) {
            return {
                title: language === 'hi' ? post.titleHi : language === 'ur' ? post.titleUr : post.titleEn,
                duty: language === 'hi' ? post.dutyHi : language === 'ur' ? post.dutyUr : post.dutyEn,
                slotNumber: post.slotNumber,
            };
        }
        return {
            title: tr('जिला कार्यकारिणी पदाधिकारी', 'ضلعی مجلس عاملہ عہدیدار', 'District Executive Officer'),
            duty: tr('जिले में MFCT के मुख्य कार्यों, बैठकों और जनसेवा का संचालन।', 'ضلع میں ٹرسٹ کی سرگرمیوں کا انتظام۔', 'Supervising MFCT district welfare and field operations.'),
            slotNumber: 1,
        };
    }, [effectiveRoleKey, currentRole, language]);

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
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

            {/* Header Banner - Official MFCT Green & Gold Standard */}
            <div
                className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
                style={{
                    background:
                        'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0a1c12 100%)',
                    border: '1px solid rgba(200,168,75,0.3)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                {/* Decorative Glow */}
                <div
                    className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
                    style={{
                        background: 'rgba(200,168,75,0.18)',
                    }}
                />

                {/* Header Content */}
                <div className="flex items-start gap-4 relative z-10">
                    {/* Icon */}
                    <div
                        className="p-3.5 rounded-2xl shrink-0 mt-0.5"
                        style={{
                            background: 'rgba(200,168,75,0.15)',
                            border: '1px solid rgba(200,168,75,0.35)',
                        }}
                    >
                        <ShieldCheck
                            className="w-8 h-8"
                            style={{
                                color: 'var(--mfct-gold)',
                            }}
                        />
                    </div>

                    {/* Title & Description */}
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                            {tr(
                                `${selectedDistrict} जिला कार्यकारिणी समग्र अवलोकन`,
                                `${selectedDistrict} ضلعی مجلس عاملہ جائزہ ڈیش بورڈ`,
                                `${selectedDistrict} District Executive Overview Dashboard`
                            )}
                        </h1>

                        <p
                            className="text-xs sm:text-sm mt-1 max-w-4xl"
                            style={{
                                color: 'rgba(200,168,75,0.9)',
                            }}
                        >
                            {tr(
                                'जिला स्तर पर MFCT के 5 प्रमुख पदों, ब्लॉक इकाइयों, बैठक कार्यवृत्त, स्वयंसेवकों और राहत वितरण का एकीकृत केंद्रीय डैशबोर्ड।',
                                'ضلع کی سطح پر ٹرسٹ کے 5 اہم عہدوں، بلاک ٹیموں، اجلاسوں اور امدادی کاموں کا مشترکہ ڈیش بورڈ۔',
                                'Unified executive dashboard overseeing all 5 district posts, chartered block units, proceedings, field volunteers, and Sadakah aid.'
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Key Metrics / Stats Row according to District Role */}
            {isGenSecretary ? (
                /* 2. Key Metrics Row for District General Secretary (Units & Formations) */
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('कुल गठित इकाइयाँ', 'کل تشکیل شدہ یونٹس', 'Total Units')}</span>
                            <Layers className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{totalUnits}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('जिले में अधिकृत इकाइयाँ', 'ضلع میں مجاز یونٹس', 'Authorized Chapters')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('ब्लॉक टीमें (ग्रामीण)', 'بلاک ٹیمیں (دیہی)', 'Block Units')}</span>
                            <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalUnits}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('तहसील/ग्रामीण पंचायत क्षेत्र', 'دیہی پنچایت زونز', 'Rural Block Units')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('नगर / शहर टीमें', 'شہری یونٹس', 'City / Nagar Units')}</span>
                            <Building2 className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalUnits}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('शहरी वार्ड व पालिका मंडल', 'شہری وارڈ اور بلدیہ', 'Urban Ward Chapters')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('नियुक्त पदाधिकारी', 'مقرر عہدیداران', 'Appointed Leaders')}</span>
                            <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalOfficersCount}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('अध्यक्ष, सचिव व कार्यकारिणी', 'صدور، سیکرٹریز اور اراکین', 'Presidents, Secs & Execs')}</p>
                    </div>
                </div>
            ) : isSecretary ? (
                /* 2. Key Stats Row for District Secretary (Meetings & Minutes) */
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('कुल बैठकें', 'کل اجلاس', 'Total Meetings')}</span>
                            <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{meetings.length}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('रिकॉर्डेड बैठकों का संग्रह', 'محفوظ شدہ اجلاسات', 'Archived & Live')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('आगामी बैठकें', 'آئندہ اجلاس', 'Upcoming')}</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{upcomingCount}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('निर्धारित एवं सक्रिय एजेंडा', 'طے شدہ اور فعال ایجنڈا', 'Scheduled on Calendar')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('सम्पन्न बैठकें', 'مکمل شدہ', 'Completed')}</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('कार्यवृत्त व हस्ताक्षर सहित', 'دستخط شدہ کارروائی', 'With Signed Minutes')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('पारित प्रस्ताव', 'منظور قراردادیں', 'Resolutions')}</span>
                            <FileCheck2 className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalResolutions}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('आधिकारिक नीतिगत निर्णय', 'سرکاری پالیسی فیصلے', 'Action Items & Policies')}</p>
                    </div>
                </div>
            ) : isFinanceCoordinator ? (
                /* 2. Key Stats Row for District Finance Coordinator (Financial Records & Audit) */
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('कुल राहत संवितरण', 'کل مالیاتی امداد', 'Total Relief Aid')}</span>
                            <IndianRupee className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{DISTRICT_STATS.totalDisbursed}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{DISTRICT_STATS.beneficiaryCount} {tr('सत्यापित लाभार्थी', 'مستفیدین', 'Verified Beneficiaries')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('यूटीआर व भुगतान ऑडिट', 'یو ٹی آر و آڈٹ', 'UTR & Payment Audit')}</span>
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">100%</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('डिजिटल मिलान व संपुष्टि', 'ڈیجیٹل تصدیق شدہ', 'Audited & Verified')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('वित्तीय दस्तावेज व रसीदें', 'مالیاتی ریکارڈ و رسیدیں', 'Official Records')}</span>
                            <FileCheck className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{tr('पूर्ण पारदर्शी', 'مکمل شفاف', '100% Documented')}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('लेखा-जोखा व प्रमाणक', 'کھاتہ اور واؤچرز', 'Receipts & Ledgers')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('निस्तारण व प्रभाव दर', 'کامیابی کی شرح', 'Success Rate')}</span>
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{DISTRICT_STATS.aidSuccessRate}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('उच्च प्रभाव (High Impact)', 'اعلی کارکردگی', 'High Impact Relief')}</p>
                    </div>
                </div>
            ) : (
                /* Default Executive Metrics for President and other roles */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* 1. Members */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('पंजीकृत सदस्य (District Members)', 'ممبران', 'District Members')}
                            </span>
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {DISTRICT_STATS.totalMembers}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {DISTRICT_STATS.memberGrowth}
                            </span>
                            <span className="text-slate-500 font-semibold">
                                {tr('42 ब्लॉक व वार्ड में सक्रिय', 'فعال نیٹ ورک', 'Active Network')}
                            </span>
                        </div>
                    </div>

                    {/* 2. Units */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('सक्रिय इकाइयाँ (Active Units)', 'یونٹس', 'Active Units')}
                            </span>
                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                                <Building className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {DISTRICT_STATS.activeUnits}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 font-semibold">
                                {DISTRICT_STATS.activeBlocks}
                            </span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                {tr('100% गठित', 'مکمل تشکیل', '100% Chartered')}
                            </span>
                        </div>
                    </div>

                    {/* 3. Volunteers */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('स्वयंसेवक बल (Volunteers Force)', 'رضاکار فورس', 'Volunteers Force')}
                            </span>
                            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {DISTRICT_STATS.volunteersCount}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                                {tr('KYC सत्यापित', 'تصدیق شدہ', 'KYC Verified')}
                            </span>
                            <span className="text-slate-500 font-semibold">
                                {tr('तहसील स्तर पर सक्रिय', 'فعال کارکنان', 'Tehsil Level')}
                            </span>
                        </div>
                    </div>

                    {/* 4. Relief Disbursed */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('कुल राहत वितरण (Total Relief Aid)', 'کل امداد', 'Total Relief Aid')}
                            </span>
                            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                                <HeartHandshake className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {DISTRICT_STATS.totalDisbursed}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {DISTRICT_STATS.beneficiaryCount} {tr('लाभान्वित', 'مستفید', 'Beneficiaries')}
                            </span>
                            <span className="text-slate-500 font-semibold">
                                {tr('चिकित्सा, शिक्षा व राशन', 'طبی و تعلیمی', 'Medical & Education')}
                            </span>
                        </div>
                    </div>

                    {/* 5. Meetings & Minutes */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('बैठकें व प्रस्ताव (Meetings & Minutes)', 'اجلاس و قراردادیں', 'Meetings & Minutes')}
                            </span>
                            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {DISTRICT_STATS.meetingsCount}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                                {DISTRICT_STATS.resolutionsCount}
                            </span>
                            <span className="text-slate-500 font-semibold">
                                {tr('100% कोरम दर्ज', 'مکمل حاضری', '100% Quorum')}
                            </span>
                        </div>
                    </div>

                    {/* 6. Success Rate */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('राहत निस्तारण दर (Success Rate)', 'کامیابی کی شرح', 'Aid Success Rate')}
                            </span>
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                            {DISTRICT_STATS.aidSuccessRate}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-emerald-600">
                                {tr('उच्च प्रभाव (High Impact)', 'اعلی کارکردگی', 'High Impact')}
                            </span>
                            <span className="text-slate-500 font-semibold">
                                {DISTRICT_STATS.pendingApplications}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. District Finance Coordinator Workspace Desk (When logged in as District Finance Coordinator) */}
            {isFinanceCoordinator && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <FileCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                        {tr('जिला वित्त समन्वयक कार्यक्षेत्र', 'ضلعی فنانس کوآرڈینیٹر ورک اسپیس', 'District Finance Coordinator Workspace')}
                                    </h3>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                        Slot 05
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {tr(
                                        'वित्तीय रिकॉर्ड एवं आधिकारिक लेन-देन के दस्तावेजी सहयोग',
                                        'مالیاتی ریکارڈ اور سرکاری لین دین میں دستاویزی معاونت',
                                        'Official financial record-keeping, voucher reconciliation, and transaction auditing for the district.'
                                    )}
                                </p>
                            </div>
                        </div>

                        {onNavigateTab && (
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => onNavigateTab('financial_analytics')}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    style={{ background: 'var(--mfct-mid-green)' }}
                                >
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>{tr('वित्तीय विश्लेषण', 'مالیاتی تجزیات', 'Financial Analytics')}</span>
                                </button>
                                <button
                                    onClick={() => onNavigateTab('utr_audit')}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                    <span>{tr('यूटीआर डेस्क', 'یو ٹی آر ڈیسک', 'UTR Audit Desk')}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Operational Protocols & Oversight Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{tr('यूटीआर व बैंक मिलान', 'یو ٹی آر و بینک مطابقت', 'UTR Reconciliation')}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {tr(
                                    'जिले से संबंधित सभी ऑनलाइन यूपीआई व बैंक ट्रांसफर दान रसीदों के यूटीआर नंबरों का केंद्रीय सर्वर से 100% सत्यापन।',
                                    'ضلع سے موصول تمام عطیات کی تصدیق اور یو ٹی آر کی جانچ۔',
                                    '100% verification of all district donor UTR numbers and transaction slips against the central ledger.'
                                )}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                                <FileText className="w-4 h-4" />
                                <span>{tr('राहत वाउचर संकलन', 'امدادی واؤچرز کا اندراج', 'Relief Aid Vouchers')}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {tr(
                                    'ब्लॉक एवं नगर इकाइयों द्वारा वितरित राशन, चिकित्सा व शिक्षा सहायता के आधिकारिक व्यय बिल व हस्ताक्षर प्राप्त करना।',
                                    'بلاک ٹیموں کے راشن، علاج اور تعلیمی اخراجات کے دستاویزی ثبوت۔',
                                    'Collection and archiving of signed beneficiary receipts, hospital vouchers, and field distribution logs.'
                                )}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider mb-2">
                                <Award className="w-4 h-4" />
                                <span>{tr('मासिक ऑडिट रिपोर्टिंग', 'ماہانہ آڈٹ رپورٹ', 'Monthly Audit Reporting')}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {tr(
                                    'प्रत्येक माह के अंत में जिला अध्यक्ष एवं केंद्रीय गवर्निंग बोर्ड को प्रस्तुत की जाने वाली आधिकारिक वित्तीय स्थिति।',
                                    'ہر ماہ ضلعی صدر اور مرکزی بورڈ کو فنانس رپورٹ پیش کرنا۔',
                                    'Submitting the compiled district cash flows and audited aid documentation to the District President and Central Board.'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Appointment Modal (District President Authority) */}
            {appointModalOpen && activePostDefinition && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
                        <button
                            onClick={() => setAppointModalOpen(false)}
                            className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

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
                                    {tr('पदाधिकारी नियुक्ति व दायित्व आवंटन', 'عہدیدار کی تعیناتی', 'Appoint District Officer')}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {language === 'hi'
                                        ? `${selectedDistrict} - ${activePostDefinition.titleHi}`
                                        : `${selectedDistrict} - ${activePostDefinition.titleEn}`}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 my-4 text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                {tr('अधिकृत कार्यक्षेत्र (Designated Duty):', 'نامزد ذمہ داری:', 'Designated Responsibility:')}
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {language === 'hi' ? activePostDefinition.dutyHi : activePostDefinition.dutyEn}
                            </p>
                        </div>

                        <div className="relative mb-3">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder={tr('नाम, फोन नंबर या सदस्यता आईडी से खोजें...', 'نام یا فون سے تلاش کریں...', 'Search member by name, phone or ID...')}
                                value={candidateSearch}
                                onChange={(e) => setCandidateSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                            />
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {candidatePool.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    {tr('कोई उपयुक्त सदस्य नहीं मिला', 'کوئی ممبر نہیں ملا', 'No members found matching criteria')}
                                </div>
                            ) : (
                                candidatePool.slice(0, 15).map((cand) => (
                                    <div
                                        key={cand.id}
                                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-white dark:bg-slate-950 flex items-center justify-between gap-3 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                                                {(cand.name || 'U')[0].toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                                        {cand.name}
                                                    </p>
                                                    {cand.isVerified && (
                                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                                                            KYC ✓
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-mono truncate">
                                                    {cand.phone} • {cand.city || cand.district || tr('जिला अनिर्धारित', 'ضلع', 'District')}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            disabled={isSubmitting}
                                            onClick={() => handleConfirmAppoint(cand)}
                                            className="px-3.5 py-1.5 rounded-xl mfct-btn-gold text-[11px] font-bold shrink-0 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {tr('नियुक्त करें', 'نامزد کریں', 'Appoint')}
                                        </button>
                                    </div>
                                ))
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

// Aliases for compatibility
export const DistrictCommitteeTab = DistrictDashboard;
