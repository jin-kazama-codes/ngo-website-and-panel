'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Community, User } from '../../types';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { getCommunities } from '../../services/communityService';
import { Meeting, getMeetings } from '../../services/meetingService';
import { Announcement, getAllAnnouncements } from '../../services/announcementService';
import {
  ShieldCheck as ShieldCheckIcon,
  IndianRupee,
  Activity,
  Heart,
  Users,
  Megaphone,
  Calendar,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface CommunityAdminDashboardProps {
  activeUser: User;
  onNavigateTab?: (tab: string) => void;
}

// Subcomponent for Meeting Card with dynamic translation
const MeetingCard: React.FC<{
  meeting: Meeting;
  defaultDistrict: string;
  language: Language;
  tr: (hi: string, ur: string, en: string) => string;
  onNavigateTab?: (tab: string) => void;
}> = ({ meeting, defaultDistrict, language, tr, onNavigateTab }) => {
  const rawVenue = meeting.venue || defaultDistrict;
  const translatedVenue = useDynamicTranslatedText(rawVenue, language);
  const displayVenue = translatedVenue || rawVenue;

  return (
    <div
      onClick={() => onNavigateTab && onNavigateTab('meetings_manage')}
      className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-blue-400/50 transition-all ${onNavigateTab ? 'cursor-pointer' : ''
        }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
          {meeting.title}
        </h4>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${meeting.status === 'upcoming'
            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            : meeting.status === 'completed'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
        >
          {meeting.status === 'upcoming'
            ? tr('आगामी बैठकें', 'آئندہ', 'Upcoming')
            : meeting.status === 'completed'
              ? tr('सम्पन्न बैठकें', 'مکمل شدہ', 'Completed')
              : tr('प्रतीक्षारत', 'زیر التواء', 'Pending')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 my-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">
            {meeting.date} {meeting.time ? `• ${meeting.time}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate">{displayVenue}</span>
        </div>
      </div>

      {meeting.agenda && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <strong className="text-slate-700 dark:text-slate-300">{tr('एजेंडा:', 'ایجنڈا:', 'Agenda:')}</strong>{' '}
          {meeting.agenda}
        </p>
      )}
    </div>
  );
};

// Subcomponent for Announcement Card with dynamic translation
const AnnouncementCard: React.FC<{
  announcement: Announcement;
  language: string;
  tr: (hi: string, ur: string, en: string) => string;
}> = ({ announcement, language, tr }) => {
  const rawSender = announcement.sentBy || '';
  const translatedSender = useDynamicTranslatedText(rawSender, language);
  const senderName = translatedSender || rawSender;

  const rawCity = announcement.city || '';
  const translatedCity = useDynamicTranslatedText(rawCity, language);
  const cityName = translatedCity || rawCity;

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-amber-400/50 transition-all space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {senderName}
          </span>
          {cityName && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" /> {cityName}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {announcement.sentAt
            ? new Date(announcement.sentAt).toLocaleDateString(
              language === 'hi' ? 'hi-IN' : language === 'ur' ? 'ur-PK' : 'en-IN',
              {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }
            )
            : ''}
        </span>
      </div>

      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
        {announcement.message}
      </p>
    </div>
  );
};

export const CommunityAdminDashboard: React.FC<CommunityAdminDashboardProps> = ({
  activeUser,
  onNavigateTab,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [community, setCommunity] = useState<Community | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolve target district for this community
  const targetDistrict =
    community?.district ||
    activeUser.district ||
    community?.city ||
    activeUser.city ||
    'Sitapur';

  const cleanDist = (targetDistrict || '').replace(/district/gi, '').trim();

  // Translated names for UI
  const rawCommunityName = community?.name || activeUser.communityName || 'Community Admin Hub';
  const displayCommunityName = useDynamicTranslatedText(rawCommunityName, language) || rawCommunityName;

  const rawAdminName = community?.adminName || activeUser.name || 'Admin';
  const displayAdminName = useDynamicTranslatedText(rawAdminName, language) || rawAdminName;

  const displayDistrict = useDynamicTranslatedText(targetDistrict, language) || targetDistrict;
  const rawCity = community?.city || activeUser.city || 'Chapter';
  const displayCity = useDynamicTranslatedText(rawCity, language) || rawCity;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getCommunities()
        .then((comms) => {
          if (!isMounted) return;
          if (comms.length > 0) {
            const userCommunity = comms.find(
              (c) => c.id === activeUser.communityId || (activeUser.communityName && c.name === activeUser.communityName)
            );
            setCommunity(userCommunity || comms[0] || null);
          }
        })
        .catch(console.error),

      getMeetings(cleanDist || targetDistrict)
        .then((mData) => {
          if (!isMounted) return;
          if (Array.isArray(mData)) setMeetings(mData);
        })
        .catch(console.error),

      getAllAnnouncements()
        .then((aData) => {
          if (!isMounted) return;
          if (Array.isArray(aData)) setAnnouncements(aData);
        })
        .catch(console.error),
    ]).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [activeUser.communityId, activeUser.communityName, targetDistrict, cleanDist]);

  // Filter announcements for target district
  const districtAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      if (!a) return false;
      const aCity = (a.city || '').toLowerCase().replace(/district/gi, '').trim();
      if (!aCity || aCity === 'all' || aCity === 'all districts') return true;
      if (!cleanDist) return true;
      const dLower = cleanDist.toLowerCase();
      return (
        aCity === dLower ||
        aCity.includes(dLower) ||
        dLower.includes(aCity)
      );
    });
  }, [announcements, cleanDist]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Top Banner Skeleton */}
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800" />
          ))}
        </div>

        {/* Meetings & Announcements Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800" />
          <div className="h-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Top Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0c2016 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(200,168,75,0.15)' }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2"
              style={{
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--mfct-gold)',
                border: '1px solid rgba(200,168,75,0.3)',
              }}
            >
              <ShieldCheckIcon className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
              <span>{tr('समुदाय व्यवस्थापक', 'کمیونٹی ایڈمن', 'Community Admin')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {displayCommunityName}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(200,168,75,0.85)' }}>
              {tr('व्यवस्थापक:', 'ایڈمن:', 'Admin:')}{' '}
              <strong className="text-white">{displayAdminName}</strong> • {displayCity}{' '}
              {tr('शाखा', 'شاخ', 'Chapter')} •{' '}
              <span className="font-semibold text-white/90">
                {displayDistrict} {tr('जिला', 'ضلع', 'District')}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all flex items-center justify-between group overflow-hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tr('कुल सदस्य', 'کل اراکین', 'Total Members')}
            </p>
            <h3 className="text-2xl font-black mt-1 mb-1 text-slate-900 dark:text-white">
              {community?.totalMembers || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Causes */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all flex items-center justify-between group overflow-hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tr('सक्रिय अभियान', 'فعال مہمات', 'Active Causes')}
            </p>
            <h3 className="text-2xl font-black mt-1 mb-1 text-slate-900 dark:text-white">
              {community?.activeCampaigns || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Total Funds Raised */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all flex items-center justify-between group overflow-hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tr('कुल संकलित निधि', 'کل جمع شدہ فنڈز', 'Total Funds Raised')}
            </p>
            <h3 className="text-2xl font-black mt-1 mb-1 text-emerald-600 dark:text-emerald-400">
              ₹{(community?.totalRaisedINR || 0).toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Health Score */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all flex items-center justify-between group overflow-hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {tr('समुदाय सक्रियता', 'کمیونٹی سرگرمی', 'Community Health')}
            </p>
            <h3 className="text-2xl font-black mt-1 mb-1 text-slate-900 dark:text-white">
              {community?.healthScore || 100}%
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Unified District Meetings & Announcements Section (Like DistrictDashboard) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {tr(
                  'जिला बैठकें एवं आधिकारिक घोषणाएँ',
                  'ضلعی اجلاسات اور اعلانات',
                  'District Meetings & Announcements'
                )}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tr(
                `${displayDistrict} जिले की आधिकारिक बैठकों और घोषणाओं का वास्तविक समय विवरण`,
                `${displayDistrict} ضلع کے اجلاسات اور اعلانات کی تفصیلات`,
                `Official scheduled meetings and announcements for ${displayDistrict}`
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: District Meetings Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
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
                      {tr(
                        `${displayDistrict} जिले की आगामी एवं हालिया बैठकें`,
                        `${displayDistrict} ضلع کے آئندہ اور حالیہ اجلاس`,
                        `Scheduled & recent meetings in ${displayDistrict}`
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {meetings.length} {tr('बैठकें', 'اجلاس', 'Meetings')}
                </span>
              </div>

              {meetings.length === 0 ? (
                <div className="mt-4 p-8 text-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {tr('वर्तमान में कोई बैठक निर्धारित नहीं है', 'فی الحال کوئی اجلاس طے نہیں ہے', 'No meetings scheduled yet')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {tr(
                      `${displayDistrict} जिले में नई बैठक निर्धारित होने पर यहाँ प्रदर्शित होगी।`,
                      `نئے اجلاس کی اطلاع یہاں دکھائی جائے گی۔`,
                      `New meetings for ${displayDistrict} will appear here.`
                    )}
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {meetings.slice(0, 4).map((m) => (
                    <MeetingCard
                      key={m.id}
                      meeting={m}
                      defaultDistrict={displayDistrict}
                      language={language}
                      tr={tr}
                      onNavigateTab={onNavigateTab}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: District Announcements & Broadcasts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
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
                      {tr(
                        `${displayDistrict} नेतृत्व द्वारा जारी महत्वपूर्ण सूचनाएँ`,
                        `${displayDistrict} قیادت کی طرف سے جاری کردہ اعلانات`,
                        `Notices and broadcasts for ${displayDistrict}`
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  {districtAnnouncements.length} {tr('सक्रिय घोषणाएँ', 'اعلانات', 'Notices')}
                </span>
              </div>

              {districtAnnouncements.length === 0 ? (
                <div className="mt-4 p-8 text-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {tr('वर्तमान में कोई घोषणा उपलब्ध नहीं है', 'فی الحال کوئی اعلان नहीं है', 'No announcements published')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {tr(
                      `${displayDistrict} जिले हेतु नई घोषणाएँ यहाँ प्रदर्शित होंगी।`,
                      `نئے اعلانات یہاں دکھائی دیں گے۔`,
                      `Notices broadcast for ${displayDistrict} will appear here.`
                    )}
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {districtAnnouncements.slice(0, 4).map((a) => (
                    <AnnouncementCard
                      key={a.id}
                      announcement={a}
                      language={language}
                      tr={tr}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
