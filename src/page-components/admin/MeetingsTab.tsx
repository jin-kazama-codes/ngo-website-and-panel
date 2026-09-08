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
} from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  venue: string;
  chairperson: string;
  recordedBy: string;
  attendeesCount: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  minutes?: string;
  resolutions?: string[];
  district?: string;
}

const DEFAULT_MEETINGS: Meeting[] = [
  {
    id: 'meet-101',
    title: 'Monthly District Executive Assembly (मासिक जिला कार्यकारी बैठक)',
    agenda: 'Review of emergency winter relief campaign, widow stipend approvals, and community volunteer alignment.',
    date: '2026-09-15',
    time: '11:00 AM - 01:30 PM',
    venue: 'MFCT District Central Office, Civil Lines, Bareilly',
    chairperson: 'Mohammad Faeem (District President)',
    recordedBy: 'District Secretary (जिला सचिव)',
    attendeesCount: 18,
    status: 'upcoming',
    district: 'Bareilly District Chapter',
    resolutions: [
      'Finalize beneficiary quota for 5 local wards in Bareilly.',
      'Audit documentary proof before funds disbursement.',
    ],
  },
  {
    id: 'meet-100',
    title: 'Quarterly Welfare Review & Account Verification (त्रैमासिक कल्याण एवं खाता सत्यापन)',
    agenda: 'Verification of UTR slips, disbursement of medical emergency assistance, and local volunteer mobilization.',
    date: '2026-08-28',
    time: '03:00 PM - 05:30 PM',
    venue: 'Community Center Hall, Mohalla Qilla, Bareilly',
    chairperson: 'District President',
    recordedBy: 'District Secretary',
    attendeesCount: 24,
    status: 'completed',
    district: 'Bareilly District Chapter',
    minutes: 'The meeting commenced with recitation and welcome address. 32 medical cases were verified with valid hospital billing documents. Resolution was passed unanimously to approve 15 high-urgency patients.',
    resolutions: [
      'Unanimous approval of 15 emergency surgery funds.',
      'Mandatory physical Aadhaar verification by volunteer team prior to release.',
      'Next core review scheduled for mid-September 2026.',
    ],
  },
  {
    id: 'meet-99',
    title: 'Education Grant & Scholarship Committee (शिक्षा अनुदान एवं छात्रवृत्ति समिति)',
    agenda: 'Scrutiny of school fee aid applications for orphans and single-parent households for academic session 2026-27.',
    date: '2026-08-10',
    time: '10:30 AM - 01:00 PM',
    venue: 'Bareilly Central Care Society Meeting Room',
    chairperson: 'Executive Officer',
    recordedBy: 'District Secretary',
    attendeesCount: 14,
    status: 'completed',
    district: 'Bareilly District Chapter',
    minutes: 'All 48 applicant files were audited with fee vouchers and report cards. 39 orphan students qualified under merit-cum-means criteria.',
    resolutions: [
      'Disburse tuition fees directly to designated school bank accounts via NEFT.',
      'Obtain official receipt stamped by school administration.',
    ],
  },
];

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

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mfct_district_meetings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch { }
      }
    }
    return DEFAULT_MEETINGS;
  });

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
    chairperson: '',
    attendeesCount: 10,
    status: 'upcoming' as 'upcoming' | 'completed',
    minutes: '',
    resolutions: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mfct_district_meetings', JSON.stringify(meetings));
    }
  }, [meetings]);

  const filteredMeetings = meetings.filter((m) => {
    const matchQuery =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const upcomingCount = meetings.filter((m) => m.status === 'upcoming').length;
  const completedCount = meetings.filter((m) => m.status === 'completed').length;
  const totalResolutions = meetings.reduce((sum, m) => sum + (m.resolutions?.length || 0), 0);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    const resolvedTime =
      formData.startTime && formData.endTime
        ? `${formatTime12h(formData.startTime)} - ${formatTime12h(formData.endTime)}`
        : formData.startTime
        ? formatTime12h(formData.startTime)
        : '11:00 AM - 01:00 PM';

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title: formData.title,
      agenda: formData.agenda,
      date: formData.date,
      time: resolvedTime,
      venue: formData.venue || 'District Chapter Secretariat, Bareilly',
      chairperson: formData.chairperson || 'District President',
      recordedBy: activeUser?.name || 'District Secretary',
      attendeesCount: Number(formData.attendeesCount) || 12,
      status: formData.status,
      district: activeUser?.city ? `${activeUser.city} District Chapter` : 'Bareilly District Chapter',
      minutes: formData.minutes,
      resolutions: formData.resolutions
        ? formData.resolutions.split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    setMeetings([newMeeting, ...meetings]);
    setIsCreateOpen(false);
    setFormData({
      title: '',
      agenda: '',
      date: '',
      startTime: '11:00',
      endTime: '13:00',
      venue: '',
      chairperson: '',
      attendeesCount: 10,
      status: 'upcoming',
      minutes: '',
      resolutions: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0c2016 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.15)' }} />

        <div className="flex items-start gap-4 relative z-10">
          <div
            className="p-3.5 rounded-2xl shrink-0 mt-0.5"
            style={{
              background: 'rgba(200,168,75,0.15)',
              border: '1px solid rgba(200,168,75,0.35)',
            }}
          >
            <CalendarDays className="w-7 h-7" style={{ color: 'var(--mfct-gold)' }} />
          </div>
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2"
              style={{
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--mfct-gold)',
                border: '1px solid rgba(200,168,75,0.3)',
              }}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
              <span>{tr('जिला सचिव कार्यक्षेत्र', 'ضلعی سیکرٹری ورک اسپیس', 'District Secretary Workspace')}</span>
              <span>•</span>
              <span>{tr('कार्यवाही रजिस्टर', 'کارروائی رجسٹر', 'Proceedings & Minutes')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {tr('जिला बैठकें एवं कार्यवृत्त (Meetings & Minutes)', 'ضلعی اجلاس اور کارروائی', 'District Meetings & Minutes Register')}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: 'rgba(200,168,75,0.85)' }}>
              {tr(
                'जिला बैठकों का निर्धारण, आधिकारिक एजेंडा, उपस्थिति कोरम एवं पारित प्रस्तावों का आधिकारिक रिकॉर्ड।',
                'ضلعی اجلاسات کی ترتیب، باضابطہ ایجنڈا، حاضری کورم اور منظور شدہ قراردادوں کا باضابطہ ریکارڈ۔',
                'Official register for scheduling district assemblies, quorum attendance, proceedings, and resolutions passed.'
              )}
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mfct-btn-gold py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{tr('नई बैठक दर्ज करें', 'نیا اجلاس درج کریں', 'Schedule / Record Meeting')}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Stats Row */}
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

      {/* 3. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('बैठक का शीर्षक, एजेंडा या स्थान खोजें...', 'اجلاس کا عنوان، ایجنڈا یا مقام تلاش کریں...', 'Search meetings by title, agenda, venue...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto shrink-0">
          {(['all', 'upcoming', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={statusFilter === st ? { background: 'var(--mfct-mid-green)' } : undefined}
            >
              {st === 'all' ? tr('सभी', 'تمام', 'All') : st === 'upcoming' ? tr('आगामी', 'आئندہ', 'Upcoming') : tr('सम्पन्न', 'مکمل', 'Completed')}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Meetings List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMeetings.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-300 font-bold">{tr('कोई बैठक रिकॉर्ड नहीं मिली', 'کوئی اجلاس نہیں ملا', 'No meetings found')}</p>
            <p className="text-xs text-slate-500 mt-1">{tr('नया विवरण जोड़ने के लिए ऊपर दिए बटन पर क्लिक करें।', 'نیا اجلاس درج کرنے کے لیے بٹن پر کلک کریں۔', 'Click "+ Schedule / Record Meeting" to add the first record.')}</p>
          </div>
        ) : (
          filteredMeetings.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer"
              onClick={() => setSelectedMeeting(m)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${m.status === 'upcoming'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}
                    >
                      {m.status === 'upcoming' ? tr('आगामी बैठक (Upcoming)', 'آئندہ اجلاس', 'Upcoming') : tr('सम्पन्न (Completed)', 'مکمل شدہ', 'Completed')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• {m.district}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {m.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-start lg:self-auto">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{m.attendeesCount} {tr('उपस्थित पदाधिकारी', 'حاضرین', 'Attendees')}</span>
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Agenda & Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-xs text-slate-600 dark:text-slate-300">
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

              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-900 dark:text-slate-200">{tr('मुख्य एजेंडा (Agenda):', 'ایجنڈا:', 'Key Agenda:')}</strong> {m.agenda}
                </p>
              </div>

              {m.resolutions && m.resolutions.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    {tr('पारित निर्णय:', 'منظور شدہ فیصلے:', 'Key Decisions:')}
                  </span>
                  {m.resolutions.slice(0, 2).map((res, i) => (
                    <span key={i} className="text-[11px] bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 truncate max-w-xs">
                      ✓ {res}
                    </span>
                  ))}
                  {m.resolutions.length > 2 && (
                    <span className="text-[10px] text-slate-400 font-bold">+{m.resolutions.length - 2} more</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

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
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">{tr('अध्यक्षता', 'صدارت', 'Chairperson')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMeeting.chairperson}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">{tr('कार्यवाही लेखक', 'کارروائی کنندہ', 'Recorded By')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMeeting.recordedBy}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{tr('एजेंडा (Agenda):', 'ایجنڈا:', 'Meeting Agenda:')}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedMeeting.agenda}
                </p>
              </div>

              {selectedMeeting.minutes && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{tr('कार्यवाही विवरण (Minutes of Meeting):', 'کارروائی تفصیل:', 'Minutes of the Meeting:')}</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedMeeting.minutes}
                  </p>
                </div>
              )}

              {selectedMeeting.resolutions && selectedMeeting.resolutions.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">{tr('पारित प्रस्ताव व निर्णय (Resolutions):', 'منظور شدہ فیصلے:', 'Official Resolutions & Action Items:')}</h4>
                  <ul className="space-y-2">
                    {selectedMeeting.resolutions.map((res, i) => (
                      <li key={i} className="flex items-start gap-2 bg-purple-50/60 dark:bg-purple-950/30 p-2.5 rounded-xl border border-purple-200/60 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <span>{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('तारीख *', 'تاریخ *', 'Date *')}
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('समय (Time Picker) *', 'وقت (ٹائم پکر) *', 'Time (Time Picker) *')}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        required
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500 cursor-pointer text-xs"
                        title={tr('प्रारंभ समय', 'شروع وقت', 'Start Time')}
                      />
                    </div>
                    <span className="text-slate-400 font-bold text-xs">-</span>
                    <div className="flex-1 relative">
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500 cursor-pointer text-xs"
                        title={tr('समाप्ति समय', 'اختتامی وقت', 'End Time')}
                      />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('अध्यक्षता (Chairperson)', 'صدر اجلاس', 'Chairperson')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. District President"
                    value={formData.chairperson}
                    onChange={(e) => setFormData({ ...formData, chairperson: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('स्थिति (Status)', 'حیثیت', 'Status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  >
                    <option value="upcoming">{tr('आगामी (Upcoming)', 'آئندہ', 'Upcoming')}</option>
                    <option value="completed">{tr('सम्पन्न (Completed)', 'مکمل شدہ', 'Completed')}</option>
                  </select>
                </div>
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

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('कार्यवाही विवरण (Minutes of Meeting - यदि सम्पन्न हो चुकी है)', 'کارروائی کی تفصیل', 'Minutes of Meeting (If completed)')}
                </label>
                <textarea
                  rows={2}
                  placeholder={tr('बैठक में हुई चर्चा एवं कार्यवाही...', 'ہوئی گفتگو اور کارروائی...', 'Summary of discussions and proceedings...')}
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('पारित प्रस्ताव / निर्णय (प्रति पंक्ति एक निर्णय दर्ज करें)', 'منظور فیصلے (ہر سطر میں ایک)', 'Resolutions Passed (1 per line)')}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Unanimous approval of winter relief kit distribution."
                  value={formData.resolutions}
                  onChange={(e) => setFormData({ ...formData, resolutions: e.target.value })}
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
                  className="mfct-btn-gold px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  {tr('सुरक्षित करें', 'محفوظ کریں', 'Save Meeting Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
