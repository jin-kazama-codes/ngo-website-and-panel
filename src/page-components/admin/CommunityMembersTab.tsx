'use client';

import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { getUsers } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';

interface CommunityMembersTabProps {
  activeUser: User;
}

const MemberItem: React.FC<{ member: User }> = ({ member }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const displayName = useDynamicTranslatedText(member.name, language);
  const displayCity = useDynamicTranslatedText(member.city, language);
  const displayState = useDynamicTranslatedText(member.state, language);
  const locationText = [displayCity, displayState].filter(Boolean).join(', ');

  const safeAvatar = (member.avatar && !member.avatar.startsWith('file://'))
    ? member.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`;

  return (
    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3">
        <img
          src={safeAvatar}
          alt={member.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`;
          }}
          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
        />
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            ID: {member.membershipId || member.id.slice(0, 8)} {locationText ? `• ${locationText}` : ''}
          </p>
        </div>
      </div>
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
          member.isVerified
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
        }`}
      >
        {member.isVerified
          ? tr('✓ केवाईसी सत्यापित', '✓ کے وائی سی تصدیق شدہ', '✓ KYC Verified')
          : tr('केवाईसी लंबित', 'کے وائی سی زیر التواء', 'Pending KYC')}
      </span>
    </div>
  );
};

export const CommunityMembersTab: React.FC<CommunityMembersTabProps> = ({ activeUser }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getUsers(activeUser.communityId);
        const filteredMembers = data.filter(
          (member) =>
            member.role !== 'super_admin' &&
            member.role !== 'executive_admin' &&
            member.role !== 'community_admin'
        );
        setMembers(filteredMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeUser?.communityId) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [activeUser?.communityId]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {tr('सामुदायिक सदस्य निर्देशिका', 'کمیونٹی ممبران کی ڈائرکٹری', 'Community Members Directory')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tr(
              'सक्रिय डिजिटल आईडी कार्ड वाले सत्यापित पंजीकृत सामुदायिक सदस्य।',
              'فعال ڈیجیٹل شناختی کارڈ کے ساتھ تصدیق شدہ رجسٹرڈ کمیونٹی ممبران۔',
              'Verified registered community members with active Digital ID cards.'
            )}
          </p>
        </div>
        <span className="text-xs bg-slate-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl font-bold border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          {tr('कुल सक्रिय सदस्य:', 'کل فعال ممبران:', 'Total Active:')} {members.length}
        </span>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 h-16 w-full flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                </div>
                <div className="w-20 h-5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-slate-500 dark:text-slate-500 text-sm">
            {tr('इस समुदाय के लिए कोई सदस्य नहीं मिला।', 'اس کمیونٹی کے لیے کوئی ممبر نہیں ملا۔', 'No members found for this community.')}
          </div>
        ) : (
          members.map((member) => <MemberItem key={member.id} member={member} />)
        )}
      </div>
    </div>
  );
};
