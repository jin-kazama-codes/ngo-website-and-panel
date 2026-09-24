'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  AlertCircle,
  X,
  ChevronRight,
  Shield,
  FileCheck2,
  CalendarDays,
  Loader2,
  Megaphone,
  MessageSquare,
} from 'lucide-react';

import { Meeting, getMeetings, createMeeting, approveMeeting } from '../../services/meetingService';
import { Announcement, createAnnouncement, getAllAnnouncements, getAnnouncementsBycity } from '../../services/announcementService';
import { STANDARD_DISTRICTS } from '../../data/districtsData';
import { MeetingCardSkeleton } from '../../components/Skeletons';

// MeetingsTab connected to Supabase DB via meetingService

interface MeetingsTabProps {
  activeUser: User;
  currentRole: UserRole;
}

export const MeetingsTab: React.FC<MeetingsTabProps> = ({ activeUser, currentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  // Role checks (matches KycTab pattern)
  const rawDistRole = (
    activeUser?.district_role ||
    activeUser?.districtRole ||
    (activeUser?.role as string) ||
    ''
  ).toLowerCase().trim().replace(/\s+/g, '_');

  const isSuperOrExecutive =
    currentRole === 'super_admin' ||
    currentRole === 'executive_admin' ||
    activeUser?.role === 'super_admin' ||
    activeUser?.role === 'executive_admin';

  // Only District Secretary (and Super Admin / Executive Admin) can schedule and record meetings
  const userDistRole = rawDistRole || (currentRole as string || '').toLowerCase().trim();
  const canCreateMeeting =
    isSuperOrExecutive ||
    currentRole === 'district_secretary' ||
    userDistRole === 'district_secretary' ||
    (userDistRole.includes('secretary') && !userDistRole.includes('gen'));

  // District President can approve meetings
  const isDistrictPresident =
    currentRole === 'district_president' ||
    rawDistRole === 'district_president' ||
    userDistRole.includes('president');

  const userCity = (activeUser?.district || activeUser?.city || '').trim();

  const [meetings, setMeetings] = useState<Meeting[]>([])


  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'meetings' | 'announcements'>('meetings');
  const [cityFilter, setCityFilter] = useState<string>('all'); // for super/executive admin

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isAnnouncementSubmitting, setIsAnnouncementSubmitting] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    message: '',
  });
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.message.trim()) return;
    setIsAnnouncementSubmitting(true);
    try {
      const city = activeUser?.district || activeUser?.city || 'Unknown City';
      const newAnn = await createAnnouncement({
        sentBy: activeUser?.name || 'Admin',
        city: city,
        message: announcementForm.message,
        sentAt: new Date().toISOString(),
      });
      setAnnouncements((prev) => [newAnn, ...prev]);
      showToast(tr('घोषणा सफलतापूर्वक भेजी गई!', 'اعلان کامیابی سے بھیج دیا گیا!', 'Announcement sent successfully!'), 'success');
      setIsAnnouncementOpen(false);
      setAnnouncementForm({ message: '' });
    } catch (err: any) {
      showToast(err?.message || tr('घोषणा भेजने में त्रुटि', 'خرابی', 'Failed to send announcement'), 'error');
    } finally {
      setIsAnnouncementSubmitting(false);
    }
  };

  const handleApproveMeeting = async (meetingId: string) => {
    setApprovingId(meetingId);
    try {
      const updated = await approveMeeting(meetingId);
      setMeetings((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      showToast(tr('बैठक स्वीकृत हो गई!', 'اجلاس منظور ہوگیا!', 'Meeting approved!'), 'success');
    } catch (err: any) {
      showToast(err?.message || tr('स्वीकृति में त्रुटि', 'خرابی', 'Failed to approve'), 'error');
    } finally {
      setApprovingId(null);
    }
  };

  // Fetch meetings from Supabase DB on component mount
  useEffect(() => {
    const fetchDbMeetings = async () => {
      setLoading(true);
      try {
        // Super/executive admin: fetch all meetings (no district filter)
        const data = isSuperOrExecutive
          ? await getMeetings()
          : await getMeetings(userCity || undefined);
        if (data && data.length > 0) {
          setMeetings(data);
        }
      } catch (err) {
        console.warn('Could not load meetings from DB:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDbMeetings();
  }, [activeUser.district, activeUser.city]);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setAnnouncementsLoading(true);
      try {
        const data = isSuperOrExecutive
          ? await getAllAnnouncements()
          : await getAnnouncementsBycity(userCity);
        setAnnouncements(data);
      } catch (err) {
        console.warn('Could not load announcements:', err);
      } finally {
        setAnnouncementsLoading(false);
      }
    };
    fetchAnnouncements();
  }, [activeUser.district, activeUser.city]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Helper to convert 24h format (HH:mm) to 12h format (hh:mm AM/PM)
  const formatTime12h = (t24: string) => {
    if (!t24) return '';
    const [hStr, mStr] = t24.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return t24;
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    agenda: '',
    date: '',
    startTime: '11:00',
    endTime: '13:00',
    venue: '',
  });

  // Derived: city-filtered meetings for super admin
  const cityFilteredMeetings = isSuperOrExecutive && cityFilter !== 'all'
    ? meetings.filter((m) => (m.district || '').toLowerCase().includes(cityFilter.toLowerCase()))
    : meetings;

  const filteredMeetings = cityFilteredMeetings.filter((m) => {
    const matchQuery =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchQuery && matchStatus;
  });

  // Derived: city-filtered announcements for super admin
  const filteredAnnouncements = isSuperOrExecutive && cityFilter !== 'all'
    ? announcements.filter((a) => a.city?.toLowerCase().includes(cityFilter.toLowerCase()))
    : announcements;

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    setIsSubmitting(true);
    try {
      const resolvedTime =
        formData.startTime && formData.endTime
          ? `${formatTime12h(formData.startTime)} - ${formatTime12h(formData.endTime)}`
          : formData.startTime
            ? formatTime12h(formData.startTime)
            : '11:00 AM - 01:00 PM';

      const meetingPayload: Omit<Meeting, 'id'> = {
        title: formData.title,
        agenda: formData.agenda,
        date: formData.date,
        time: resolvedTime,
        venue: formData.venue,
        status: 'pending' as any,
        district: activeUser?.district,
      };

      const savedMeeting = await createMeeting(meetingPayload);
      setMeetings((prev) => [savedMeeting, ...prev.filter((m) => m.id !== savedMeeting.id)]);
      showToast(tr('बैठक विवरण Supabase में सुरक्षित हो गया!', 'اجلاس کی کارروائی ڈیٹا بیس میں محفوظ ہوگئی!', 'Meeting successfully saved to Supabase DB!'), 'success');

      setIsCreateOpen(false);
      setFormData({
        title: '',
        agenda: '',
        date: '',
        startTime: '11:00',
        endTime: '13:00',
        venue: '',
      });
    } catch (err: any) {
      console.error('Failed to create meeting:', err);
      showToast(err?.message || tr('सुरक्षित करने में त्रुटि', 'خرابی', 'Failed to save meeting'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification (Top & Center) */}
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

      {/* Header */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        style={{
          background:
            'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0a1c12 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Decorative Glow */}
        <div
          className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
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
            <CalendarDays
              className="w-6 h-6"
              style={{
                color: 'var(--mfct-gold)',
              }}
            />
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr(
                'जिला बैठकें एवं घोषणाएं',
                'ضلعی اجلاس اور اعلانات',
                'District Meetings & Announcements'
              )}
            </h1>

            <p
              className="text-xs sm:text-sm mt-1 max-w-4xl"
              style={{
                color: 'rgba(200,168,75,0.9)',
              }}
            >
              {tr(
                'जिला बैठकों का निर्धारण, आधिकारिक एजेंडा, उपस्थिति कोरम एवं पारित प्रस्तावों का आधिकारिक रिकॉर्ड।',
                'ضلعی اجلاسات کی ترتیب، باضابطہ ایجنڈا، حاضری کورم اور منظور شدہ قراردادوں کا باضابطہ ریکارڈ۔',
                'Official register for scheduling district assemblies, quorum attendance, proceedings, and resolutions passed.'
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-3 shrink-0 flex-wrap">
          {/* Announcement Button */}
          {canCreateMeeting && (
            <button
              onClick={() => setIsAnnouncementOpen(true)}
              className="cursor-pointer px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:brightness-110 active:scale-95 border border-white/20"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: 'white',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Megaphone className="w-4 h-4" />
              <span>{tr('घोषणा भेजें', 'اعلان بھیجیں', 'Send Announcement')}</span>
            </button>
          )}

          {canCreateMeeting && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:brightness-110 active:scale-95"
              style={{
                background:
                  'linear-gradient(135deg, var(--mfct-gold) 0%, #d4af37 100%)',
                color: 'var(--mfct-dark-green)',
                boxShadow: '0 4px 15px rgba(200,168,75,0.35)',
              }}
            >
              <Plus className="w-4 h-4" />
              <span>
                {tr(
                  'नई बैठक दर्ज करें',
                  'نیا اجلاس درج کریں',
                  'Schedule New Meeting'
                )}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Tabs + City Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('meetings')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'meetings' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {tr('बैठकें', 'اجلاس', 'Meetings')}
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">{meetings.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'announcements' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            {tr('घोषणाएँ', 'اعلانات', 'Announcements')}
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">{announcements.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
          {/* City Filter (super/executive admin only) */}
          {isSuperOrExecutive && (
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">{tr('सभी जिले', 'تمام اضلاع', 'All Districts')}</option>
              {STANDARD_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          )}

          {/* Status Filter (meetings tab only) */}
          {activeTab === 'meetings' && (
            <div className="flex items-center gap-1.5">
              {(['all', 'pending', 'upcoming', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${statusFilter === st
                    ? 'text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  style={statusFilter === st ? {
                    background: (st as string) === 'pending' ? '#f59e0b' : st === 'upcoming' ? 'var(--mfct-mid-green)' : '#10b981'
                  } : undefined}
                >
                  {st === 'all' ? tr('सभी', 'تمام', 'All')
                    : st === 'pending' ? tr('लंबित', 'زیر التواء', 'Pending')
                      : st === 'upcoming' ? tr('आगामी', 'آئندہ', 'Upcoming')
                        : tr('सम्पन्न', 'مکمل', 'Completed')}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          {activeTab === 'meetings' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={tr('खोजें...', 'تلاش...', 'Search...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 w-36"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Meetings List */}
      {activeTab === 'meetings' && (
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <MeetingCardSkeleton key={i} />
              ))}
            </>
          ) : filteredMeetings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-700 dark:text-slate-300 font-bold">{tr('कोई बैठक रिकॉर्ड नहीं मिली', 'کوئی اجلاس نہیں ملا', 'No meetings found')}</p>
              <p className="text-xs text-slate-500 mt-1">{tr('नया विवरण जोड़ने के लिए ऊपर दिए बटन पर क्लिक करें।', 'نیا اجلاس درج کرنے کے لیے بٹن پر کلک کریں۔', 'Click "+ Schedule / Record Meeting" to add the first record.')}</p>
            </div>
          ) : (
            filteredMeetings.map((m) => (
              <div
                key={m.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all ${m.status === 'pending'
                  ? 'border-amber-300 dark:border-amber-700/60 hover:border-amber-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50'
                  }`}
              >
                <div
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                  onClick={() => setSelectedMeeting(m)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${m.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          : m.status === 'upcoming'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}
                      >
                        {m.status === 'pending' ? tr('लंबित अनुमोदन', 'زیر التواء', 'Pending Approval')
                          : m.status === 'upcoming' ? tr('आगामी बैठक', 'آئندہ اجلاس', 'Upcoming')
                            : tr('सम्पन्न', 'مکمل شدہ', 'Completed')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">• {m.district}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {m.title}
                    </h3>
                  </div>
                </div>

                {/* Agenda & Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-xs text-slate-600 dark:text-slate-300" onClick={() => setSelectedMeeting(m)}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <span><strong>{tr('तारीख:', 'تاریخ:', 'Date:')}</strong> {m.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>{tr('समय:', 'وقت:', 'Time:')}</strong> {m.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate" title={m.venue}><strong>{tr('स्थान:', 'مقام:', 'Venue:')}</strong> {m.venue}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 cursor-pointer" onClick={() => setSelectedMeeting(m)}>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong className="text-slate-900 dark:text-slate-200">{tr('मुख्य एजेंडा (Agenda):', 'ایجنڈا:', 'Key Agenda:')}</strong> {m.agenda}
                  </p>
                </div>

                {/* Approve Button (super/executive admin + district president, pending meetings) */}
                {(isSuperOrExecutive || isDistrictPresident) && m.status === 'pending' && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleApproveMeeting(m.id)}
                      disabled={approvingId === m.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60 transition-all active:scale-95 shadow"
                      style={{
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        color: 'white',
                      }}
                    >
                      {approvingId === m.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {tr('बैठक अनुमोदित करें', 'اجلاس منظور کریں', 'Approve Meeting')}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Announcements List */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 gap-4">
          {announcementsLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <MeetingCardSkeleton key={i} />
              ))}
            </>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-700 dark:text-slate-300 font-bold">{tr('कोई घोषणा नहीं मिली', 'کوئی اعلان نہیں ملا', 'No announcements found')}</p>
              <p className="text-xs text-slate-500 mt-1">{tr('घोषणा भेजने के लिए ऊपर का बटन दबाएं।', 'اعلان بھیجنے کے لیے بٹن دبائیں۔', 'Click "Send Announcement" above to create one.')}</p>
            </div>
          ) : (
            filteredAnnouncements.map((a) => (
              <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-amber-400/60 transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl shrink-0" style={{ background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.3)' }}>
                      <Megaphone className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{a.sentBy}</span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {a.city}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(a.sentAt).toLocaleString(language === 'hi' ? 'hi-IN' : language === 'ur' ? 'ur-PK' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-3">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{a.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedMeeting(null)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${selectedMeeting.status === 'upcoming'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}
              >
                {selectedMeeting.status}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{selectedMeeting.district}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pr-8">
              {selectedMeeting.title}
            </h2>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-4 text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">{tr('तारीख व समय', 'تاریخ و وقت', 'Date & Time')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMeeting.date} ({selectedMeeting.time})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">{tr('बैठक स्थल', 'مقام', 'Venue')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMeeting.venue}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{tr('एजेंडा (Agenda):', 'ایجنڈا:', 'Meeting Agenda:')}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedMeeting.agenda}
                </p>
              </div>

              {/* {selectedMeeting.minutes && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{tr('कार्यवाही विवरण (Minutes of Meeting):', 'کارروائی تفصیل:', 'Minutes of the Meeting:')}</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedMeeting.minutes}
                  </p>
                </div>
              )} */}

            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {tr('बंद करें', 'بند کریں', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Schedule / Record Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {tr('नई बैठक दर्ज करें', 'نیا اجلاس درج کریں', 'Schedule / Record Meeting')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {tr('जिला सचिव कार्यवाही रजिस्टर में नया विवरण प्रविष्ट करें।', 'ضلعی سیکرٹری کارروائی رجسٹر میں نیا اندراج کریں۔', 'Enter official proceedings and agenda into the District Secretary Register.')}
            </p>

            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('बैठक का शीर्षक / नाम *', 'عنوان *', 'Meeting Title *')}
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Monthly Executive Review Meeting"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              {/* Enhanced Interactive Date & Time Picker Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                {/* 1. Date Picker Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{tr('बैठक तारीख (Date Picker) *', 'میٹنگ کی تاریخ *', 'Meeting Date *')}</span>
                    </label>
                  </div>

                  <div className="relative flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-xs hover:border-emerald-500 focus-within:border-emerald-600 dark:focus-within:border-emerald-500 transition-colors">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2.5 shrink-0 pointer-events-none" />
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker?.();
                        } catch { }
                      }}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                    />
                  </div>

                  {formData.date && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-1">
                      📅 {new Date(formData.date + 'T00:00:00').toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'ur' ? 'ur-PK' : 'en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* 2. Time Picker Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{tr('समय (Time Picker) *', 'وقت (ٹائم پکر) *', 'Meeting Time *')}</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                      {formatTime12h(formData.startTime)} - {formatTime12h(formData.endTime)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Start Time */}
                    <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-xs hover:border-amber-500 focus-within:border-amber-600 transition-colors">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          {tr('प्रारंभ', 'شروع', 'Start')}
                        </span>
                        <input
                          required
                          type="time"
                          value={formData.startTime}
                          onClick={(e) => {
                            try {
                              e.currentTarget.showPicker?.();
                            } catch { }
                          }}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                      </div>
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1 pointer-events-none" />
                    </div>

                    {/* End Time */}
                    <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-xs hover:border-amber-500 focus-within:border-amber-600 transition-colors">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          {tr('समाप्त', 'اختتام', 'End')}
                        </span>
                        <input
                          type="time"
                          value={formData.endTime}
                          onClick={(e) => {
                            try {
                              e.currentTarget.showPicker?.();
                            } catch { }
                          }}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                      </div>
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('बैठक स्थल / लिंक', 'مقام / لنک', 'Venue / Meeting Link')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. MFCT District Secretariat Office, Bareilly"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('मुख्य एजेंडा (Key Agenda)', 'ایجنڈا', 'Key Agenda')}
                </label>
                <textarea
                  rows={2}
                  placeholder={tr('बैठक के विचारणीय बिंदु...', 'غور طلب نکات...', 'Key points for discussion...')}
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                >
                  {tr('रद्द करें', 'منسوخ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mfct-btn-gold px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isSubmitting
                      ? tr('सुरक्षित हो रहा है...', 'محفوظ ہو رہا ہے...', 'Saving to DB...')
                      : tr('सुरक्षित करें', 'محفوظ کریں', 'Save Meeting Record')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {isAnnouncementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAnnouncementOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2.5 rounded-xl shrink-0"
                style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.35)' }}
              >
                <Megaphone className="w-5 h-5" style={{ color: 'var(--mfct-gold)' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {tr('जिला घोषणा भेजें', 'ضلعی اعلان بھیجیں', 'Send District Announcement')}
                </h3>
                <p className="text-xs text-slate-500">
                  {tr('अपने जिले के सभी सदस्यों को सूचित करें।', 'اپنے ضلع کے تمام اراکین کو مطلع کریں۔', 'Notify all members of your district.')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">

              {/* City (auto-filled, read-only) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {tr('जिला / शहर', 'ضلع / شہر', 'District / City')}
                </label>
                <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400">📍</span>
                  {activeUser?.district || activeUser?.city || 'N/A'}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                  {tr('घोषणा संदेश *', 'اعلان کا پیغام *', 'Announcement Message *')}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={tr(
                    'यहाँ अपना संदेश लिखें जो सभी सदस्यों को भेजा जाएगा...',
                    'یہاں اپنا پیغام لکھیں جو تمام اراکین کو بھیجا جائے گا...',
                    'Write the message to be sent to all district members...'
                  )}
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500 resize-none leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">
                  {announcementForm.message.length} {tr('अक्षर', 'حروف', 'characters')}
                </p>
              </div>

              {/* Sent By (read-only) */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                  {tr('प्रेषक:', 'بھیجنے والے:', 'Sent by:')} <span className="font-bold">{activeUser?.name || 'Admin'}</span>
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                >
                  {tr('रद्द करें', 'منسوخ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isAnnouncementSubmitting || !announcementForm.message.trim()}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, var(--mfct-gold) 0%, #d4af37 100%)',
                    color: 'var(--mfct-dark-green)',
                  }}
                >
                  {isAnnouncementSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>
                    {isAnnouncementSubmitting
                      ? tr('भेजा जा रहा है...', 'بھیجا جا رہا ہے...', 'Sending...')
                      : tr('घोषणा भेजें', 'اعلان بھیجیں', 'Send Announcement')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
