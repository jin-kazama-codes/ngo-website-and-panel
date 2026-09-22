'use client';

import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
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

  const locationText = [displayCity, displayState]
    .filter(Boolean)
    .join(', ');

  const safeAvatar =
    member.avatar && !member.avatar.startsWith('file://')
      ? member.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        member.name || 'User'
      )}&background=random`;

  return (
    <div className="p-3.5 rounded-xl flex items-center justify-between text-xs transition-all bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <img
          src={safeAvatar}
          alt={member.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                member.name || 'User'
              )}&background=random`;
          }}
          className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-amber-500/40"
        />

        <div>
          <p className="font-bold text-sm text-slate-900 dark:text-white">
            {displayName}
          </p>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            ID: {member.membershipId || member.id.slice(0, 8)}{' '}
            {locationText ? `• ${locationText}` : ''}
          </p>
        </div>
      </div>

      <span
        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
        style={
          member.isVerified
            ? {
              background: 'rgba(200,168,75,0.15)',
              color: 'var(--mfct-gold)',
              border: '1px solid var(--mfct-gold)',
            }
            : {
              background: 'rgba(217,119,6,0.1)',
              color: '#f59e0b',
              border: '1px solid rgba(217,119,6,0.3)',
            }
        }
      >
        {member.isVerified
          ? tr(
            '✓ केवाईसी सत्यापित',
            '✓ کے وائی سی تصدیق شدہ',
            '✓ KYC Verified'
          )
          : tr(
            'केवाईसी लंबित',
            'کے وائی سی زیر التواء',
            'Pending KYC'
          )}
      </span>
    </div>
  );
};

export const CommunityMembersTab: React.FC<CommunityMembersTabProps> = ({
  activeUser,
}) => {
  const { language } = useLanguage();

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const districtRoleKeys = [
    'district_president',
    'district_coordinator',
    'district_gen_secretary',
    'district_secretary',
    'district_finance_coord',
  ];

  const rawDistRole = (
    activeUser?.district_role ||
    activeUser?.districtRole ||
    (activeUser?.role as string) ||
    ''
  ).toLowerCase().trim().replace(/\s+/g, '_');

  const isDistrictRole =
    districtRoleKeys.includes(activeUser?.role as string) ||
    districtRoleKeys.includes(rawDistRole) ||
    (typeof activeUser?.role === 'string' && activeUser.role.startsWith('district_')) ||
    rawDistRole.startsWith('district_') ||
    districtRoleKeys.some((k) => rawDistRole.includes(k.replace('district_', '')));

  const userDistrict = (activeUser?.district || activeUser?.city || '').trim();
  const cleanDistrict = userDistrict
    ? userDistrict.replace(/\s+(district|chapter|city|block|zone).*$/i, '').trim() || userDistrict
    : '';

  const userCity = (activeUser?.city || activeUser?.district || '').trim();
  const cleanCity = userCity
    ? userCity.replace(/\s+(district|chapter|city|block|zone).*$/i, '').trim() || userCity
    : '';

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);

        let data: User[] = [];

        if (isDistrictRole && (cleanDistrict || userDistrict)) {
          // Active user has a district role: fetch all users currently in their district
          data = await getUsers(cleanDistrict || userDistrict);
        } else {
          // Otherwise: fetch by active user's city WITH community ID
          const targetCity = cleanCity || userCity || cleanDistrict || userDistrict;
          data = await getUsers(activeUser?.communityId || undefined, targetCity || undefined);
        }

        const filteredMembers = data.filter((member) => {
          if (
            member.role === 'super_admin' ||
            member.role === 'executive_admin'
          ) {
            return false;
          }

          if (isDistrictRole && (cleanDistrict || userDistrict)) {
            const target = userDistrict.toLowerCase().trim();
            const cleanTarget = (cleanDistrict || target).toLowerCase().trim();
            const uDistrict = (member.district || '').toLowerCase().trim();
            const uCity = (member.city || '').toLowerCase().trim();
            const uComm = (member.communityName || '').toLowerCase().trim();

            return (
              uDistrict === target ||
              uDistrict === cleanTarget ||
              (uDistrict && (target.includes(uDistrict) || cleanTarget.includes(uDistrict) || uDistrict.includes(cleanTarget))) ||
              uCity === target ||
              uCity === cleanTarget ||
              (uCity && (target.includes(uCity) || cleanTarget.includes(uCity) || uCity.includes(cleanTarget))) ||
              (uComm && (target.includes(uComm) || cleanTarget.includes(uComm) || uComm.includes(cleanTarget)))
            );
          }

          if (!isDistrictRole) {
            // Must match community ID if present
            if (activeUser?.communityId && member.communityId !== activeUser.communityId) {
              return false;
            }

            // Must match active user's city / district if present
            const targetCity = (cleanCity || userCity || cleanDistrict || userDistrict).toLowerCase().trim();
            if (targetCity) {
              const mCity = (member.city || '').toLowerCase().trim();
              const mDistrict = (member.district || '').toLowerCase().trim();
              const matches =
                mCity === targetCity ||
                mCity.includes(targetCity) ||
                targetCity.includes(mCity) ||
                mDistrict === targetCity ||
                mDistrict.includes(targetCity) ||
                targetCity.includes(mDistrict);
              if (!matches) {
                return false;
              }
            }

            return true;
          }

          return true;
        });

        setMembers(filteredMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [
    isDistrictRole,
    cleanDistrict,
    userDistrict,
    cleanCity,
    userCity,
    activeUser?.communityId,
    activeUser?.district,
    activeUser?.city,
    activeUser?.role,
    activeUser?.district_role,
    activeUser?.districtRole,
  ]);

  return (
    <div className="space-y-4">
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
            <Users
              className="w-6 h-6"
              style={{
                color: 'var(--mfct-gold)',
              }}
            />
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isDistrictRole
                ? tr(
                  `${activeUser.district || activeUser.city || ''} जिला सदस्य निर्देशिका`,
                  'ضلعی ممبرز ڈائرکٹری',
                  `${activeUser.district || activeUser.city || ''} District Members Directory`
                )
                : tr(
                  'समुदाय सदस्य निर्देशिका',
                  'کمیونٹی ممبرز ڈائرکٹری',
                  'Community Members Directory'
                )}
            </h1>

            <p
              className="text-xs sm:text-sm mt-1 max-w-4xl"
              style={{
                color: 'rgba(200,168,75,0.9)',
              }}
            >
              {isDistrictRole
                ? tr(
                  'जिले में पंजीकृत एवं सक्रिय सदस्य व स्वयंसेवक।',
                  'ضلع میں رجسٹرڈ اور فعال ممبران و رضاکاران۔',
                  'Registered active members and volunteers in this district.'
                )
                : tr(
                  'सक्रिय डिजिटल आईडी कार्ड वाले सत्यापित पंजीकृत सामुदायिक सदस्य।',
                  'فعال ڈیجیٹل شناختی کارڈ کے ساتھ تصدیق شدہ رجسٹرڈ کمیونٹی ممبران۔',
                  'Verified registered community members with active Digital ID cards.'
                )}
            </p>
          </div>
        </div>

        {/* Total Members */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <span
            className="px-4 py-2.5 rounded-xl text-xs font-bold"
            style={{
              background: 'rgba(200,168,75,0.15)',
              color: 'var(--mfct-gold)',
              border: '1px solid rgba(200,168,75,0.4)',
            }}
          >
            {tr(
              'कुल सक्रिय सदस्य:',
              'کل فعال ممبران:',
              'Total Active:'
            )}{' '}
            {members.length}
          </span>
        </div>
      </div>

      {/* Members List */}
      <div className="rounded-2xl p-6 space-y-4 transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl h-16 w-full flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
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
            <div className="flex items-center justify-center p-8 text-sm text-slate-500 dark:text-slate-400">
              {isDistrictRole
                ? tr(
                  'इस जिले के लिए कोई सदस्य नहीं मिला।',
                  'اس ضلع کے لیے کوئی ممبر نہیں ملا۔',
                  'No members found for this district.'
                )
                : tr(
                  'इस समुदाय के लिए कोई सदस्य नहीं मिला।',
                  'اس کمیونٹی کے لیے کوئی ممبر نہیں ملا۔',
                  'No members found for this community.'
                )}
            </div>
          ) : (
            members.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};