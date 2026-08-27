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
    <div
      className="p-3.5 rounded-xl flex items-center justify-between text-xs transition-all"
      style={{
        background: 'var(--mfct-warm-bg)',
        border: '1px solid var(--mfct-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <img
          src={safeAvatar}
          alt={member.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`;
          }}
          className="w-9 h-9 rounded-full object-cover shrink-0"
          style={{ border: '2px solid var(--mfct-gold)' }}
        />
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--mfct-dark-green)' }}>{displayName}</p>
          <p className="text-[11px]" style={{ color: 'var(--mfct-text-muted)' }}>
            ID: {member.membershipId || member.id.slice(0, 8)} {locationText ? `• ${locationText}` : ''}
          </p>
        </div>
      </div>
      <span
        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
        style={
          member.isVerified
            ? { background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-gold)' }
            : { background: 'rgba(217,119,6,0.1)', color: '#b45309', border: '1px solid rgba(217,119,6,0.3)' }
        }
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
    <div
      className="rounded-2xl p-6 space-y-4 transition-all"
      style={{
        background: 'var(--mfct-white)',
        border: '1px solid var(--mfct-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--mfct-dark-green)', fontFamily: 'serif' }}>
            {tr('सामुदायिक सदस्य निर्देशिका', 'کمیونٹی ممبران کی ڈائرکٹری', 'Community Members Directory')}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mfct-text-muted)' }}>
            {tr(
              'सक्रिय डिजिटल आईडी कार्ड वाले सत्यापित पंजीकृत सामुदायिक सदस्य।',
              'فعال ڈیجیٹل شناختی کارڈ کے ساتھ تصدیق شدہ رجسٹرڈ کمیونٹی ممبران۔',
              'Verified registered community members with active Digital ID cards.'
            )}
          </p>
        </div>
        <span
          className="text-xs px-3 py-1 rounded-xl font-bold self-start sm:self-auto"
          style={{
            background: 'rgba(200,168,75,0.15)',
            color: 'var(--mfct-dark-green)',
            border: '1px solid var(--mfct-gold)',
          }}
        >
          {tr('कुल सक्रिय सदस्य:', 'کل فعال ممبران:', 'Total Active:')} {members.length}
        </span>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl h-16 w-full flex items-center gap-3"
                style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}
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
          <div className="flex items-center justify-center p-8 text-sm" style={{ color: 'var(--mfct-text-muted)' }}>
            {tr('इस समुदाय के लिए कोई सदस्य नहीं मिला।', 'اس کمیونٹی کے لیے کوئی ممبر نہیں ملا۔', 'No members found for this community.')}
          </div>
        ) : (
          members.map((member) => <MemberItem key={member.id} member={member} />)
        )}
      </div>
    </div>
  );
};
