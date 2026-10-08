import React, { useState, useEffect } from 'react';
import { User, Community } from '../../types';
import { Building2, MapPin, Activity, ShieldCheck, Heart, UserCircle, IndianRupee, Calendar } from 'lucide-react';
import { useLanguage, Language } from '../../context/LanguageContext';
import { getCommunityById } from '../../services/communityService';
import { Announcement, getAnnouncementsByCommunity } from '../../services/announcementService';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';

interface MyCommunityTabProps {
  activeUser: User;
}

interface AnnouncementItemProps {
  announcement: Announcement;
  language: Language;
}

const AnnouncementItem: React.FC<AnnouncementItemProps> = ({ announcement, language }) => {
  const { t } = useLanguage();
  const displayAuthor = useDynamicTranslatedText(announcement.sentBy, language) || announcement.sentBy;
  const displayMessage = useDynamicTranslatedText(announcement.message, language) || announcement.message;

  const locale = language === 'hi' ? 'hi-IN' : language === 'ur' ? 'ur-PK' : 'en-IN';
  const formattedDate = announcement.sentAt ? new Date(announcement.sentAt).toLocaleString(locale) : '';

  const channelText = announcement.channel?.toLowerCase() === 'all'
    ? t('admin.channelAll', 'All')
    : (announcement.channel || t('admin.channelAll', 'All'));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shrink-0">
            <UserCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-bold text-sm">{displayAuthor}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {formattedDate}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
          {channelText}
        </span>
      </div>
      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
        {displayMessage}
      </p>
    </div>
  );
};

export const MyCommunityTab: React.FC<MyCommunityTabProps> = ({ activeUser }) => {
  const { t, language } = useLanguage();
  const [community, setCommunity] = useState<Community | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const commName = community?.name || activeUser.communityName || '';
  const commCity = community?.city || activeUser.city || '';
  const commState = community?.state || activeUser.state || '';
  const commAdmin = community?.adminName || '';

  const displayCommName = useDynamicTranslatedText(commName, language) || commName;
  const displayCity = useDynamicTranslatedText(commCity, language) || commCity;
  const displayState = useDynamicTranslatedText(commState, language) || commState;
  const displayAdminName = useDynamicTranslatedText(commAdmin, language) || commAdmin;

  const fallbackLocation = language === 'hi' ? 'बरेली, उत्तर प्रदेश' : language === 'ur' ? 'بریلی، اتر پردیش' : 'Bareilly, Uttar Pradesh';
  const locationText = [displayCity, displayState].filter(Boolean).join(', ') || fallbackLocation;

  useEffect(() => {
    if (activeUser.communityId) {
      setLoading(true);
      Promise.all([
        getCommunityById(activeUser.communityId).then(setCommunity),
        getAnnouncementsByCommunity(activeUser.communityId).then(setAnnouncements)
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [activeUser.communityId]);

  const getStatusLabel = (status?: string) => {
    if (status === 'Verified') return t('admin.verified', 'Verified');
    if (status === 'Pending') return t('admin.pending', 'Pending');
    if (status === 'Flagged') return t('admin.flagged', 'Flagged');
    return status || t('admin.verified', 'Verified');
  };

  const statusColorClass = community?.verifiedStatus === 'Pending'
    ? 'text-amber-600 dark:text-amber-400'
    : community?.verifiedStatus === 'Flagged'
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-emerald-600 dark:text-emerald-400';

  const statusIconBgClass = community?.verifiedStatus === 'Pending'
    ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20 text-amber-600 dark:text-amber-400'
    : community?.verifiedStatus === 'Flagged'
      ? 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20 text-rose-600 dark:text-rose-400'
      : 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-800 rounded" />
              <div className="h-4 w-32 bg-slate-800/70 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-xl bg-slate-800" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>

        {/* Content Box Skeleton */}
        <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded" />
            <div className="h-4 w-4/6 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Header Card */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d2017 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-gold)',
        }}
      >
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.15)' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--mfct-gold) 0%, var(--mfct-gold-dark) 100%)',
                border: '2px solid var(--mfct-gold-light)',
                color: 'var(--mfct-dark-green)',
              }}
            >
              <Building2 className="w-8 h-8 drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1 tracking-tight">
                {displayCommName || t('admin.communityHub', 'Community Hub')}
              </h2>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(200,168,75,0.85)' }}>
                <MapPin className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                <span>{locationText}</span>
              </div>
            </div>
          </div>
          <div
            className="rounded-xl px-4 py-2 flex flex-col items-end shadow-inner"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(200,168,75,0.25)',
            }}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'rgba(200,168,75,0.7)' }}>
              {t('admin.communityId', 'Community ID')}
            </span>
            <span className="font-mono font-bold" style={{ color: 'var(--mfct-gold)' }}>
              #{activeUser.communityId || community?.id || '---'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Card 1: Admin Name */}
        <div className="rounded-2xl p-6 flex items-start gap-4 transition-all group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500 dark:text-slate-400">
              {t('admin.adminName', 'Admin Name')}
            </h3>
            <p className="font-bold capitalize text-base text-slate-900 dark:text-white">
              {displayAdminName || '---'}
            </p>
          </div>
        </div>

        {/* Card 2: Total Released */}
        <div className="rounded-2xl p-6 flex items-start gap-4 transition-all group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500 dark:text-slate-400">
              {t('admin.totalReleased', 'Total Released')}
            </h3>
            <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
              ₹{(community?.totalRaisedINR || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 3: Health Score */}
        <div className="rounded-2xl p-6 flex items-start gap-4 transition-all group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500 dark:text-slate-400">
              {t('communities.health_score', 'Health Score')}
            </h3>
            <p className="font-bold text-base text-slate-900 dark:text-white">
              {community?.healthScore ?? 100}%
            </p>
          </div>
        </div>

        {/* Card 4: Establish Year */}
        <div className="rounded-2xl p-6 flex items-start gap-4 transition-all group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500 dark:text-slate-400">
              {t('admin.establishYear', 'Establish Year')}
            </h3>
            <p className="font-bold text-base text-slate-900 dark:text-white">
              {community?.establishedYear || '---'}
            </p>
          </div>
        </div>

        {/* Card 5: Status */}
        <div className="rounded-2xl p-6 flex items-start gap-4 transition-all group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 border ${statusIconBgClass}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500 dark:text-slate-400">
              {t('admin.status', 'Status')}
            </h3>
            <p className={`font-bold text-base ${statusColorClass}`}>
              {getStatusLabel(community?.verifiedStatus)}
            </p>
          </div>
        </div>
      </div>

      {/* Announcements Section or Empty State */}
      {announcements.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-inner">
            <Activity className="w-10 h-10 text-slate-400 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {t('admin.communityActivity', 'Community Activity')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">
            {t('admin.noCommunityActivity', 'Recent activities, campaigns, and announcements from your community will appear here.')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t('admin.recentAnnouncements', 'Recent Announcements')}
          </h3>
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <AnnouncementItem key={announcement.id} announcement={announcement} language={language} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

