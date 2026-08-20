import React, { useState, useEffect } from 'react';
import { User, Community } from '../../types';
import { Building2, MapPin, Users, Activity, ShieldCheck, Heart, UserCircle, IndianRupee, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getCommunityById } from '../../services/communityService';
import { Announcement, getAnnouncementsByCommunity } from '../../services/announcementService';

interface MyCommunityTabProps {
  activeUser: User;
}

export const MyCommunityTab: React.FC<MyCommunityTabProps> = ({ activeUser }) => {
  const { isHindi } = useLanguage();
  const [community, setCommunity] = useState<Community | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">{isHindi ? 'डेटा लोड हो रहा है...' : 'Loading community data...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl dark:shadow-none">
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 shrink-0 border border-emerald-400/20">
              <Building2 className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
                {activeUser.communityName || (isHindi ? 'अज्ञात समुदाय' : 'Unknown Community')}
              </h2>
              <div className="flex items-center gap-2 text-slate-300 dark:text-slate-400 text-sm font-medium">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{activeUser.city || 'City'}, {activeUser.state || 'State'}</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl px-4 py-2 flex flex-col items-end shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              {isHindi ? 'समुदाय आईडी' : 'Community ID'}
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              #{activeUser.communityId || '---'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Card 1: Admin Name */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <UserCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Admin Name
            </h3>
            <p className="text-slate-900 dark:text-white font-bold capitalize">
              {community?.adminName}
            </p>
          </div>
        </div>

        {/* Card 2: Active Campaign */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Active Campaign
            </h3>
            <p className="text-slate-900 dark:text-white font-bold">
              {community?.activeCampaigns}
            </p>
          </div>
        </div>

        {/* Card 3: Total Released */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Total Released
            </h3>
            <p className="text-slate-900 dark:text-white font-bold">
              ₹{community?.totalRaisedINR?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 4: Health Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Heart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Health Score
            </h3>
            <p className="text-slate-900 dark:text-white font-bold">
              {community?.healthScore}%
            </p>
          </div>
        </div>

        {/* Card 5: Establish Year */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Establish Year
            </h3>
            <p className="text-slate-900 dark:text-white font-bold">
              {community?.establishedYear}
            </p>
          </div>
        </div>

        {/* Card 6: Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Status
            </h3>
            <p className="text-slate-900 dark:text-white font-bold">
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
            {isHindi ? 'समुदाय गतिविधि' : 'Community Activity'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">
            {isHindi
              ? 'आपके समुदाय की नवीनतम गतिविधियां, अभियान और सूचनाएं यहां दिखाई देंगी।'
              : 'Recent activities, campaigns, and announcements from your community will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {isHindi ? 'नवीनतम सूचनाएं' : 'Recent Announcements'}
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
