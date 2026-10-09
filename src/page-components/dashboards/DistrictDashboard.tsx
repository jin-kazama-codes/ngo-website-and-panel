'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, DistrictRoleKey, Campaign, Community, Donation } from '../../types';
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
    XCircle,
    Megaphone,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import { DistrictTeamUnit, getTeams } from '../../services/teamService';
import { Meeting, getMeetings } from '../../services/meetingService';
import { Announcement, getAllAnnouncements } from '../../services/announcementService';
import { getDonations } from '../../services/donationService';
import { getCampaigns } from '../../services/campaignService';
import { getCommunities } from '../../services/communityService';

export interface DistrictDashboardProps {
    activeUser: User;
    currentRole: UserRole;
    scopedDistrict?: string;
    onNavigateTab?: (tab: string) => void;
}


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

    const isDistrictCoordinator = effectiveRoleKey === 'district_coordinator';
    const isGenSecretary = effectiveRoleKey === 'district_gen_secretary';
    const isSecretary = effectiveRoleKey === 'district_secretary';
    const isFinanceCoordinator = effectiveRoleKey === 'district_finance_coord';

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
    const [meetingsLoading, setMeetingsLoading] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [totalDonations, setTotalDonations] = useState(0);
    const [pendingDonations, setPendingDonations] = useState(0);

    const totalUnits = teams.length;
    const totalOfficersCount = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

    const upcomingCount = meetings.filter((m) => m.status === 'upcoming').length;
    const completedCount = meetings.filter((m) => m.status === 'completed').length;

    useEffect(() => {
        const loadTeamsAndMeetings = async () => {
            const dist = selectedDistrict || scopedDistrict || activeUser.district || activeUser.city;
            const cleanDist = (dist || '').replace(/district/gi, '').trim();

            try {
                const tData = await getTeams(cleanDist || dist);
                if (tData && tData.length > 0) setTeams(tData);
            } catch (err) {
                console.warn('Teams load warning:', err);
            }

            setMeetingsLoading(true);
            try {
                const mData = await getMeetings(cleanDist || dist);
                if (mData && mData.length > 0) {
                    setMeetings(mData);
                } else {
                    setMeetings([]);
                }
            } catch (err) {
                console.warn('Meetings load warning:', err);
            } finally {
                setMeetingsLoading(false);
            }

            setAnnouncementsLoading(true);
            try {
                const aData = await getAllAnnouncements();
                if (aData && aData.length > 0) {
                    setAnnouncements(aData);
                } else {
                    setAnnouncements([]);
                }
            } catch (err) {
                console.warn('Announcements load warning:', err);
            } finally {
                setAnnouncementsLoading(false);
            }
        };
        loadTeamsAndMeetings();
    }, [selectedDistrict, scopedDistrict, activeUser.district, activeUser.city]);


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

    const fetchDonations = async () => {
        setLoading(true);

        try {
            const allDonations = await getDonations();
            setDonations(allDonations);
            // Total donation amount
            const total = allDonations.reduce(
                (sum, donation: any) => sum + Number(donation.amountINR || 0),
                0
            );

            // Pending donation count
            const pending = allDonations.filter(
                (donation: any) => donation.status?.toLowerCase() === 'pending'
            ).length;

            setTotalDonations(total);
            setPendingDonations(pending);

        } catch (err) {
            console.error('Failed to fetch donations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaignsAndCommunities = async () => {
        try {
            const camps = await getCampaigns();
            if (camps && camps.length > 0) setCampaigns(camps);
        } catch (err) {
            console.warn('Failed to fetch campaigns for district dashboard:', err);
        }
        try {
            const comms = await getCommunities();
            if (comms && comms.length > 0) setCommunities(comms);
        } catch (err) {
            console.warn('Failed to fetch communities for district dashboard:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDonations();
        fetchCampaignsAndCommunities();
    }, []);

    useEffect(() => {
        if (scopedDistrict) {
            setSelectedDistrict(scopedDistrict);
        }
    }, [scopedDistrict]);

    // Active district users & KYC counts for District Coordinator & oversight
    const targetDistrictClean = useMemo(() => {
        return (selectedDistrict || scopedDistrict || activeUser.district || activeUser.city || '')
            .toLowerCase()
            .replace(/district/gi, '')
            .trim();
    }, [selectedDistrict, scopedDistrict, activeUser.district, activeUser.city]);

    const districtUsers = useMemo(() => {
        return allUsers.filter((u) => {
            const uDistrict = (u.district || '').toLowerCase().replace(/district/gi, '').trim();
            const uCity = (u.city || '').toLowerCase().replace(/district/gi, '').trim();
            if (!targetDistrictClean) return true;
            return (
                uDistrict === targetDistrictClean ||
                (uDistrict && targetDistrictClean.includes(uDistrict)) ||
                (targetDistrictClean && uDistrict.includes(targetDistrictClean)) ||
                uCity === targetDistrictClean ||
                (uCity && targetDistrictClean.includes(uCity)) ||
                (targetDistrictClean && uCity.includes(targetDistrictClean))
            );
        });
    }, [allUsers, targetDistrictClean]);

    const kycStats = useMemo(() => {
        const pending = districtUsers.filter((u) => {
            const s = u.status || (u.isVerified ? 'approved' : 'pending');
            return s === 'pending';
        }).length;

        const approved = districtUsers.filter((u) => {
            const s = u.status || (u.isVerified ? 'approved' : 'pending');
            return s === 'approved';
        }).length;

        const rejected = districtUsers.filter((u) => {
            const s = u.status;
            return s === 'reject' || s === 'rejected';
        }).length;

        return { pending, approved, rejected, total: districtUsers.length };
    }, [districtUsers]);

    // Announcements filtered for active district
    const districtAnnouncements = useMemo(() => {
        return announcements.filter((a) => {
            if (!a) return false;
            const aCity = (a.city || '').toLowerCase().replace(/district/gi, '').trim();
            if (!aCity || aCity === 'all' || aCity === 'all districts') return true;
            if (!targetDistrictClean) return true;
            return (
                aCity === targetDistrictClean ||
                aCity.includes(targetDistrictClean) ||
                targetDistrictClean.includes(aCity)
            );
        });
    }, [announcements, targetDistrictClean]);

    // District-filtered campaigns
    const districtCampaigns = useMemo(() => {
        if (!targetDistrictClean) return campaigns;
        return campaigns.filter((c) => {
            const cCity = (c.city || '').toLowerCase().replace(/district/gi, '').trim();
            const cComm = (c.communityName || '').toLowerCase().replace(/district/gi, '').trim();
            return (
                cCity === targetDistrictClean ||
                cCity.includes(targetDistrictClean) ||
                targetDistrictClean.includes(cCity) ||
                cComm === targetDistrictClean ||
                cComm.includes(targetDistrictClean) ||
                targetDistrictClean.includes(cComm)
            );
        });
    }, [campaigns, targetDistrictClean]);

    const districtCampaignsRaised = useMemo(() => {
        return districtCampaigns.reduce((acc, c) => acc + (Number(c.raisedINR) || 0), 0);
    }, [districtCampaigns]);

    const districtActiveCampaigns = useMemo(() => {
        return districtCampaigns.filter((c) => (c.daysLeft === undefined || c.daysLeft > 0)).length;
    }, [districtCampaigns]);

    // District-filtered communities
    const districtCommunities = useMemo(() => {
        if (!targetDistrictClean) return communities;
        return communities.filter((c) => {
            const cDist = (c.district || '').toLowerCase().replace(/district/gi, '').trim();
            const cCity = (c.city || '').toLowerCase().replace(/district/gi, '').trim();
            const cName = (c.name || '').toLowerCase().replace(/district/gi, '').trim();
            return (
                cDist === targetDistrictClean ||
                cDist.includes(targetDistrictClean) ||
                targetDistrictClean.includes(cDist) ||
                cCity === targetDistrictClean ||
                cCity.includes(targetDistrictClean) ||
                targetDistrictClean.includes(cCity) ||
                cName.includes(targetDistrictClean)
            );
        });
    }, [communities, targetDistrictClean]);

    const districtCommunitiesMembers = useMemo(() => {
        return districtCommunities.reduce((acc, c) => acc + (Number(c.totalMembers) || 0), 0);
    }, [districtCommunities]);

    // District-filtered donations
    const districtDonations = useMemo(() => {
        if (!targetDistrictClean) return donations;
        const districtUserIds = new Set(districtUsers.map((u) => u.id));
        const districtCampaignIds = new Set(districtCampaigns.map((c) => c.id));
        const districtCommNames = new Set(districtCommunities.map((c) => c.name.toLowerCase().trim()));

        const matched = donations.filter((d) => {
            if (d.donorId && districtUserIds.has(d.donorId)) return true;
            if (d.campaignId && districtCampaignIds.has(d.campaignId)) return true;
            if (d.communityName && districtCommNames.has(d.communityName.toLowerCase().trim())) return true;
            const cName = (d.communityName || '').toLowerCase().replace(/district/gi, '').trim();
            if (cName && (cName === targetDistrictClean || cName.includes(targetDistrictClean) || targetDistrictClean.includes(cName))) return true;
            return false;
        });

        return matched.length > 0 ? matched : donations;
    }, [donations, districtUsers, districtCampaigns, districtCommunities, targetDistrictClean]);

    const districtDonationsRaised = useMemo(() => {
        return districtDonations.reduce((sum, d) => sum + (Number(d.amountINR) || 0), 0);
    }, [districtDonations]);

    const districtPendingDonations = useMemo(() => {
        return districtDonations.filter((d) => d.status?.toLowerCase() === 'pending').length;
    }, [districtDonations]);

    // Volunteers calculation for teams
    const totalVolunteersCount = useMemo(() => {
        return teams.reduce((acc, t) => {
            const vol = Number((t as any).activeVolunteersCount) || 0;
            return acc + (vol > 0 ? vol : (t.members?.length || 0));
        }, 0);
    }, [teams]);


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
            {isDistrictCoordinator ? (
                /* 2. Key Metrics Row for District Coordinator: 3 Cards (Pending KYC, Approved KYC, Reject KYC) */
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* 1. Pending KYC Card */}
                        <div
                            onClick={() => onNavigateTab && onNavigateTab('kyc_queue')}
                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-all hover:shadow-md ${onNavigateTab ? 'cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/50 group' : ''}`}
                        >
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                    {tr('लंबित केवाईसी (Pending KYC)', 'زیر التواء کے وائی سی', 'Pending KYC')}
                                </span>
                                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
                                {loading ? '...' : kycStats.pending}
                            </p>
                            <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                <span className="font-semibold text-slate-500 dark:text-slate-400">
                                    {tr('सत्यापन हेतु प्रतीक्षारत', 'تصدیق کے منتظر', 'Awaiting Verification')}
                                </span>
                                {onNavigateTab && (
                                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 text-[11px] group-hover:translate-x-1 transition-transform">
                                        {tr('समीक्षा करें', 'جائزہ لیں', 'Review')} →
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 2. Approved KYC Card */}
                        <div
                            onClick={() => onNavigateTab && onNavigateTab('kyc_queue')}
                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-all hover:shadow-md ${onNavigateTab ? 'cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/50 group' : ''}`}
                        >
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                    {tr('स्वीकृत केवाईसी (Approved KYC)', 'منظور شدہ کے وائی سی', 'Approved KYC')}
                                </span>
                                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {loading ? '...' : kycStats.approved}
                            </p>
                            <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                <span className="font-semibold text-slate-500 dark:text-slate-400">
                                    {tr('सत्यापित सक्रिय सदस्य', 'تصدیق شدہ ممبران', 'Verified Active Members')}
                                </span>
                                {onNavigateTab && (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 text-[11px] group-hover:translate-x-1 transition-transform">
                                        {tr('सूची देखें', 'فہرست دیکھیں', 'View List')} →
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 3. Reject KYC Card */}
                        <div
                            onClick={() => onNavigateTab && onNavigateTab('kyc_queue')}
                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-all hover:shadow-md ${onNavigateTab ? 'cursor-pointer hover:border-rose-400 dark:hover:border-rose-500/50 group' : ''}`}
                        >
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                                    {tr('अस्वीकृत केवाईसी (Reject KYC)', 'مسترد شدہ کے وائی سی', 'Reject KYC')}
                                </span>
                                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                    <XCircle className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-rose-600 dark:text-rose-400">
                                {loading ? '...' : kycStats.rejected}
                            </p>
                            <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                <span className="font-semibold text-slate-500 dark:text-slate-400">
                                    {tr('पुनः आवेदन / त्रुटिपूर्ण', 'دوبارہ درخواست مطلوب', 'Re-application Needed')}
                                </span>
                                {onNavigateTab && (
                                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5 text-[11px] group-hover:translate-x-1 transition-transform">
                                        {tr('विवरण देखें', 'تفصیل دیکھیں', 'Details')} →
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* District Coordinator Desk Quick Bar */}
                    <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-amber-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-amber-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                                <UserCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {tr('जिला समन्वयक कार्यक्षेत्र (KYC Desk)', 'ضلعی کوآرڈینیٹر ورک اسپیس', 'District Coordinator Desk')}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                    {tr(
                                        'जिले के सभी नए सदस्यों के पहचान पत्र, आधार एवं सदस्यता आवेदनों का सत्यापन व अनुमोदन।',
                                        'ضلع کے تمام نئے ممبران کی شناختی تصدیق اور کے وائی سی منظوری۔',
                                        'Review and process identity proofs, Aadhaar documents, and membership verifications for the district.'
                                    )}
                                </p>
                            </div>
                        </div>
                        {onNavigateTab && (
                            <button
                                onClick={() => onNavigateTab('kyc_queue')}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 flex items-center gap-1.5 transition-all shadow-xs hover:opacity-90 active:scale-95 cursor-pointer self-start sm:self-auto"
                                style={{ background: 'var(--mfct-mid-green)' }}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>{tr('केवाईसी अनुमोदन डेस्क खोलें', 'کے وائی سی ڈیسک کھولیں', 'Open KYC Desk')}</span>
                            </button>
                        )}
                    </div>
                </div>
            ) : isGenSecretary ? (
                /* 2. Key Metrics Row for District General Secretary (Units & Formations) */
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-10">
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
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('नियुक्त पदाधिकारी', 'مقرر عہدیداران', 'Appointed Leaders')}</span>
                            <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalOfficersCount}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('अध्यक्ष, सचिव व कार्यकारिणी', 'صدور، سیکرٹریز اور اراکین', 'Presidents, Secs & Execs')}</p>
                    </div>
                </div>
            ) : isSecretary ? (
                /* 2. Key Stats Row for District Secretary (Meetings & Minutes) */
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-10">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('सम्पन्न बैठकें', 'مکمل شدہ', 'Completed')}</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr('कार्यवृत्त व हस्ताक्षर सहित', 'دستخط شدہ کارروائی', 'With Signed Minutes')}</p>
                    </div>
                </div>
            ) : isFinanceCoordinator ? (
                /* 2. Key Stats Row for District Finance Coordinator (Financial Records & Audit) */
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-10">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('कुल राहत संवितरण', 'کل مالیاتی امداد', 'Total Relief Aid')}</span>
                            <IndianRupee className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{totalDonations}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">{tr('सत्यापन के अंतर्गत', 'زیر التواء ادائیگیاں', 'Under Verification')}</span>
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{pendingDonations}</p>
                    </div>
                </div>
            ) : (
                /* Dynamic Executive Metrics for District President covering all 6 district features */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* 1. User KYC & District Members */}
                    <div
                        onClick={() => onNavigateTab && onNavigateTab('community_members')}
                        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all ${onNavigateTab ? 'cursor-pointer hover:border-emerald-500/50 group' : ''}`}
                    >
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('पंजीकृत सदस्य व केवाईसी', 'ممبران اور کے وائی سی', 'District Members & KYC')}
                            </span>
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {loading ? '...' : `${districtUsers.length} ${tr('सदस्य', 'اراکین', 'Members')}`}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {kycStats.approved} {tr('KYC सत्यापित', 'تصدیق شدہ', 'KYC Verified')}
                            </span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                {kycStats.pending} {tr('लंबित केवाईसी (Pending KYC)', 'زیر التواء کے وائی سی', 'Pending KYC')}
                            </span>
                        </div>
                    </div>

                    {/* 2. Block & City Teams */}
                    <div
                        onClick={() => onNavigateTab && onNavigateTab('teams_manage')}
                        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all ${onNavigateTab ? 'cursor-pointer hover:border-blue-500/50 group' : ''}`}
                    >
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('सक्रिय इकाइयाँ व टीमें', 'فعال یونٹس اور ٹیمیں', 'Active Units & Teams')}
                            </span>
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                                <Building className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {`${teams.length} ${tr('इकाइयाँ', 'یونٹس', 'Units')}`}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                {totalVolunteersCount}+ {tr('स्वयंसेवक', 'رضاکار', 'Volunteers')}
                            </span>
                            <span className="text-slate-500 font-semibold">
                                {totalOfficersCount} {tr('पदाधिकारी नियुक्त', 'عہدیداران', 'Officers')}
                            </span>
                        </div>
                    </div>

                    {/* 3. Meetings & Announcements */}
                    <div
                        onClick={() => onNavigateTab && onNavigateTab('meetings_manage')}
                        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all ${onNavigateTab ? 'cursor-pointer hover:border-amber-500/50 group' : ''}`}
                    >
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('बैठकें एवं घोषणाएँ', 'اجلاس اور اعلانات', 'Meetings & Notices')}
                            </span>
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {`${meetings.length} ${tr('बैठकें', 'اجلاس', 'Meetings')}`}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                                {upcomingCount} {tr('आगामी बैठकें', 'آئندہ', 'Upcoming')}
                            </span>
                            <span className="text-slate-500 font-semibold">
                                {districtAnnouncements.length} {tr('सक्रिय घोषणाएँ', 'اعلانات', 'Notices')}
                            </span>
                        </div>
                    </div>

                    {/* 4. Donations & Relief Aid */}
                    <div
                        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all`}
                    >
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('कुल दान एवं राहत कोष', 'کل امداد اور عطیات', 'Total Donations & Aid')}
                            </span>
                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                                <IndianRupee className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {districtDonationsRaised.toLocaleString('en-IN')}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {districtDonations.length} {tr('दान प्राप्तियाँ', 'رسیدات', 'Transactions')}
                            </span>
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                {districtPendingDonations} {tr('सत्यापन अधीन', 'زیر تصدیق', 'In Verification')}
                            </span>
                        </div>
                    </div>

                    {/* 5. District Campaigns */}
                    <div
                        onClick={() => onNavigateTab && onNavigateTab('campaigns')}
                        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all ${onNavigateTab ? 'cursor-pointer hover:border-purple-500/50 group' : ''}`}
                    >
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('जिला राहत अभियान', 'ضلعی مہمات', 'District Campaigns')}
                            </span>
                            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                                <HeartHandshake className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {`${districtCampaigns.length} ${tr('अभियान', 'مہمات', 'Campaigns')}`}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                                ₹{districtCampaignsRaised.toLocaleString('en-IN')} {tr('संकलित', 'جمع شدہ', 'Raised')}
                            </span>
                            <span className="text-slate-500 font-semibold">
                                {districtActiveCampaigns} {tr('सक्रिय', 'فعال', 'Active')}
                            </span>
                        </div>
                    </div>

                    {/* 6. Communities */}
                    <div
                        onClick={() => onNavigateTab && onNavigateTab('communities_manage')}
                        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all ${onNavigateTab ? 'cursor-pointer hover:border-teal-500/50 group' : ''}`}
                    >
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('स्थानीय समुदाय', 'مقامی کمیونٹیز', 'Local Communities')}
                            </span>
                            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                                <Building2 className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {`${districtCommunities.length} ${tr('समुदाय', 'کمیونٹیز', 'Communities')}`}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-teal-600 dark:text-teal-400">
                                {districtCommunitiesMembers} {tr('सदस्य', 'اراکین', 'Members')}
                            </span>
                            <span className="text-slate-500 font-semibold">
                                100% {tr('सक्रिय नेटवर्क', 'فعال نیٹ ورک', 'Chartered')}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('बैठकें व प्रस्ताव', 'اجلاس و قراردادیں', 'Meetings & Resolutions')}
                            </span>
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
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
                                {tr('100% कोरम', '100% کورم', '100% Quorum')}
                            </span>
                        </div>
                    </div>

                    {/* 6. Success Rate */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {tr('सहायता सफलता दर', 'امداد کامیابی کی شرح', 'Aid Success Rate')}
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
                                {tr('उच्च प्रभाव', 'اعلی کارکردگی', 'High Impact')}
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

            {/* 4. Unified District Meetings & Announcements Section (Rendered by default for EVERY district role) */}
            <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span>{tr('जिला बैठकें एवं आधिकारिक घोषणाएँ', 'ضلعی اجلاسات اور اعلانات', 'District Meetings & Announcements')}</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {tr(
                                `${selectedDistrict} जिले की आधिकारिक बैठकों और घोषणाओं का वास्तविक समय विवरण`,
                                `${selectedDistrict} ضلع کے اجلاسات اور اعلانات کی تفصیلات`,
                                `Official scheduled meetings and announcements for ${selectedDistrict}`
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: District Meetings Information */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {tr('बैठक विवरण (Meeting Information)', 'اجلاس کی معلومات', 'Meeting Information')}
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            {tr('जिले की आगामी एवं हालिया बैठकें', 'آئندہ اور حالیہ اجلاس', 'Scheduled & recent meetings')}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                    {meetings.length} {tr('बैठकें', 'اجلاس', 'Meetings')}
                                </span>
                            </div>

                            {meetingsLoading ? (
                                <div className="space-y-3 py-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 animate-pulse h-24" />
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 animate-pulse h-24" />
                                </div>
                            ) : meetings.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {tr('वर्तमान में कोई बैठक निर्धारित नहीं है', 'فی الحال کوئی اجلاس طے نہیں ہے', 'No meetings scheduled yet')}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        {tr(`${selectedDistrict} जिले में नई बैठक निर्धारित होने पर यहाँ प्रदर्शित होगी।`, 'نئے اجلاس کی اطلاع یہاں دکھائی جائے گی۔', `New meetings for ${selectedDistrict} will appear here.`)}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {meetings.slice(0, 4).map((m) => (
                                        <div
                                            key={m.id}
                                            onClick={() => onNavigateTab && onNavigateTab('meetings_manage')}
                                            className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-blue-400/50 transition-all ${onNavigateTab ? 'cursor-pointer' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                                    {m.title}
                                                </h4>
                                                <span
                                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${m.status === 'upcoming'
                                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                        : m.status === 'completed'
                                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                        }`}
                                                >
                                                    {m.status === 'upcoming'
                                                        ? tr('आगामी बैठकें', 'آئندہ', 'Upcoming')
                                                        : m.status === 'completed'
                                                            ? tr('सम्पन्न बैठकें', 'مکمل شدہ', 'Completed')
                                                            : tr('प्रतीक्षारत', 'زیر التواء', 'Pending')}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 my-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                    <span className="truncate">{m.date} {m.time ? `• ${m.time}` : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                    <span className="truncate">{m.venue || selectedDistrict}</span>
                                                </div>
                                            </div>

                                            {m.agenda && (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <strong className="text-slate-700 dark:text-slate-300">{tr('एजेंडा:', 'ایجنڈا:', 'Agenda:')}</strong> {m.agenda}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* {onNavigateTab && (
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
                                <button
                                    onClick={() => onNavigateTab('meetings_manage')}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <span>{tr('सभी बैठकें देखें', 'تمام اجلاس دیکھیں', 'View All Meetings')}</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )} */}
                    </div>

                    {/* Right Column: District Announcements & Broadcasts */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                        <Megaphone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {tr('आधिकारिक घोषणाएँ (Announcements)', 'سرکاری اعلانات', 'Official Announcements')}
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            {tr('नेतृत्व द्वारा जारी महत्वपूर्ण सूचनाएँ', 'اہم اعلانات و ہدایات', 'Notices and district broadcasts')}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                    {districtAnnouncements.length} {tr('सक्रिय घोषणाएँ', 'اعلانات', 'Notices')}
                                </span>
                            </div>

                            {announcementsLoading ? (
                                <div className="space-y-3 py-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 animate-pulse h-24" />
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 animate-pulse h-24" />
                                </div>
                            ) : districtAnnouncements.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {tr('वर्तमान में कोई घोषणा उपलब्ध नहीं है', 'فی الحال کوئی اعلان نہیں ہے', 'No announcements published')}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        {tr(`${selectedDistrict} जिले हेतु नई घोषणाएँ यहाँ प्रदर्शित होंगी।`, 'نئے اعلانات یہاں دکھائی دیں گے۔', `Notices broadcast for ${selectedDistrict} will appear here.`)}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {districtAnnouncements.slice(0, 4).map((a) => (
                                        <div
                                            key={a.id}
                                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-amber-400/50 transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {a.sentBy}
                                                    </span>
                                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
                                                        <MapPin className="w-2 h-2" /> {a.city}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {a.sentAt ? new Date(a.sentAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'ur' ? 'ur-PK' : 'en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }) : ''}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                                {a.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
