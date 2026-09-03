import React, { useState, useEffect } from 'react';
import { User, Community } from '../../types';
import { Building2, MapPin, Users, Activity, ShieldCheck, Heart, UserCircle, IndianRupee, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getCommunityById } from '../../services/communityService';
import { Announcement, getAnnouncementsByCommunity } from '../../services/announcementService';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';

interface MyCommunityTabProps {
  activeUser: User;
}

export const MyCommunityTab: React.FC<MyCommunityTabProps> = ({ activeUser }) => {
  const { t, language } = useLanguage();
  const [community, setCommunity] = useState<Community | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const displayCommName = useDynamicTranslatedText(activeUser.communityName, language) || activeUser.communityName;
  const displayCity = useDynamicTranslatedText(activeUser.city, language) || activeUser.city;
  const displayState = useDynamicTranslatedText(activeUser.state, language) || activeUser.state;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
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
                {displayCommName || t('admin.tabCommunityHub', 'Community Hub')}
              </h2>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(200,168,75,0.85)' }}>
                <MapPin className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
                <span>{[displayCity, displayState].filter(Boolean).join(', ') || 'Bareilly, Uttar Pradesh'}</span>
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
              {t('admin.tabCommunityHub', 'Community ID')}
            </span>
            <span className="font-mono font-bold" style={{ color: 'var(--mfct-gold)' }}>
              #{activeUser.communityId || '---'}
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
              Admin Name
            </h3>
            <p className="font-bold capitalize text-base text-slate-900 dark:text-white">
              {community?.adminName}
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
              Total Released
            </h3>
            <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
              ₹{community?.totalRaisedINR?.toLocaleString()}
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
              Health Score
            </h3>
            <p className="font-bold text-base text-slate-900 dark:text-white">
              {community?.healthScore}%
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
              Establish Year
            </h3>
            <p className="font-bold text-base text-slate-900 dark:text-white">
              {community?.establishedYear}
            </p>
          </div>
        </div>

        {/* Card 5: Status */}
        <div className="rounded-2xl p-6 flex items-start gap-4 transition-all group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500 dark:text-slate-400">
              Status
            </h3>
            <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
              {community?.verifiedStatus}
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
            {t('admin.tabCommunityHub', 'Community Activity')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">
            {t('admin.no_pending_kyc', 'Recent activities, campaigns, and announcements from your community will appear here.')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t('admin.tabContactMessages', 'Recent Announcements')}
          </h3>
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shrink-0">
                      <UserCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold text-sm">{announcement.sentBy}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                        {new Date(announcement.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                    {announcement.channel}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {announcement.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
