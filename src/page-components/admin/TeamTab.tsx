'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getUsers } from '../../services/userService';
import {
  getTeams,
  createTeam,
  updateTeam,
  DistrictTeamUnit,
  TeamMember,
} from '../../services/teamService';
import { STANDARD_DISTRICTS } from '../../data/districtsData';

import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  Shield,
  Award,
  Layers,
  Calendar,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Network,
  ExternalLink,
  Trash2,
  UserCheck,
  Sparkles,
  CheckSquare,
  Square,
  Check,
} from 'lucide-react';

export interface NewMemberDraft {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface TeamTabProps {
  activeUser: User;
  currentRole: UserRole;
}

export const TeamTab: React.FC<TeamTabProps> = ({ activeUser, currentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  // Role-based access flags
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

  const isGenSecretary = currentRole === 'district_gen_secretary';
  const isDistrictPresident = currentRole === 'district_president';

  const userCity = (activeUser?.district || '').trim();

  const [teams, setTeams] = useState<DistrictTeamUnit[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [approvingTeamId, setApprovingTeamId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>('all');

  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  // Load teams from API + registered users on mount
  useEffect(() => {
    let isMounted = true;

    getTeams()
      .then((fetched) => {
        if (isMounted) setTeams(fetched);
      })
      .catch(() => { })
      .finally(() => {
        if (isMounted) setIsLoadingTeams(false);
      });

    getUsers(userCity)
      .then((users) => {
        if (isMounted && Array.isArray(users)) {
          const districtRoles = [
            'district_president',
            'district_coordinator',
            'district_gen_secretary',
            'district_secretary',
            'district_finance_coord'
          ];
          const filteredUsers = users.filter(
            (user) => !districtRoles.includes(user.districtRole || '')
          );
          setRegisteredUsers(filteredUsers);
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, [userCity]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Create Unit Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formUnitName, setFormUnitName] = useState('');
  const [formTehsil, setFormTehsil] = useState('');
  const [formPresidentUserId, setFormPresidentUserId] = useState('');
  const [formPresidentName, setFormPresidentName] = useState('');
  const [formPresidentPhone, setFormPresidentPhone] = useState('');
  const [formFormedDate, setFormFormedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<'active' | 'in_formation' | 'pending'>('pending');
  const [formObjectives, setFormObjectives] = useState('');
  const [formInitialMembers, setFormInitialMembers] = useState<NewMemberDraft[]>([]);

  // Create Modal Multi-Select State
  const [isCreateMultiSelectOpen, setIsCreateMultiSelectOpen] = useState(false);
  const [createMultiSearchQuery, setCreateMultiSearchQuery] = useState('');
  const [createSelectedUserIds, setCreateSelectedUserIds] = useState<string[]>([]);
  const [createBatchRole, setCreateBatchRole] = useState('कार्यकारिणी सदस्य (Executive Member)');

  // Add Member Modal State
  const [selectedTeamForMember, setSelectedTeamForMember] = useState<DistrictTeamUnit | null>(null);
  const [memberModalMode, setMemberModalMode] = useState<'multi' | 'manual'>('multi');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('')

  // Single manual add state
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('कार्यकारिणी सदस्य (Executive Member)');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  const handleAddInitialMemberRow = () => {
    setFormInitialMembers((prev) => [
      ...prev,
      {
        id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        role: 'कार्यकारिणी सदस्य (Executive Member)',
        phone: '',
      },
    ]);
  };

  const handleUpdateInitialMemberRow = (id: string, field: keyof NewMemberDraft, val: string) => {
    setFormInitialMembers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveInitialMemberRow = (id: string) => {
    setFormInitialMembers((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectUserForInitialMember = (draftId: string, userId: string) => {
    const foundUser = registeredUsers.find((u) => u.id === userId);
    if (!foundUser) return;
    setFormInitialMembers((prev) =>
      prev.map((item) =>
        item.id === draftId
          ? {
            ...item,
            name: foundUser.name || item.name,
            phone: foundUser.phone || item.phone,
          }
          : item
      )
    );
  };

  const handleBatchAddInitialMembers = () => {
    if (createSelectedUserIds.length === 0) return;
    const newDrafts: NewMemberDraft[] = createSelectedUserIds.map((uId) => {
      const u = registeredUsers.find((user) => user.id === uId);
      return {
        id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: u?.name || '',
        role: createBatchRole,
        phone: u?.phone || '',
      };
    });
    setFormInitialMembers((prev) => [...prev, ...newDrafts]);
    setCreateSelectedUserIds([]);
    setIsCreateMultiSelectOpen(false);
    setCreateMultiSearchQuery('');
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUnitName.trim() || !formPresidentName.trim()) {
      setSaveError(tr(
        'टीम का नाम और अध्यक्ष का नाम आवश्यक है।',
        'ٹیم کا نام اور صدر کا نام ضروری ہے۔',
        'Team Name and President Name are required.'
      ));
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    const validInitialMembers: TeamMember[] = formInitialMembers
      .filter((m) => m.name.trim().length > 0)
      .map((m) => ({
        id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: m.name.trim(),
        role: (m as NewMemberDraft).role || 'कार्यकारिणी सदस्य (Executive Member)',
        phone: m.phone.trim() || '+91 98000 00000',
        appointedDate: formFormedDate,
      }));

    const newUnitData: Omit<DistrictTeamUnit, 'id'> = {
      unitName: formUnitName.trim(),
      tehsilOrZone: formTehsil.trim(),
      district: activeUser?.city ? `${activeUser.city} District` : (activeUser?.district || 'Bareilly District'),
      HeadName: formPresidentName.trim(),
      HeadPhone: formPresidentPhone.trim() || '+91 98000 00000',
      formedDate: formFormedDate,
      activeVolunteersCount: validInitialMembers.length,
      status: 'pending', // always starts pending until District President approves
      objectives: formObjectives.trim() || 'Organizational expansion, volunteer coordination, and local public welfare initiatives.',
      members: validInitialMembers,
    };

    try {
      const created = await createTeam(newUnitData);
      setTeams((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);

      // Reset Form
      setFormUnitName('');
      setFormTehsil('');
      setFormPresidentUserId('');
      setFormPresidentName('');
      setFormPresidentPhone('');
      setFormStatus('active');
      setFormObjectives('');
      setFormInitialMembers([]);
      setIsCreateMultiSelectOpen(false);
      setCreateSelectedUserIds([]);
    } catch (err: any) {
      setSaveError(err?.message || tr(
        'टीम सहेजने में त्रुटि हुई। पुनः प्रयास करें।',
        'ٹیم محفوظ کرنے میں خرابی۔ دوبارہ کوشش کریں۔',
        'Failed to save team. Please try again.'
      ));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSingleMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamForMember || !newMemberName.trim()) return;

    setSaveError(null);
    setIsSaving(true);

    const newMem: TeamMember = {
      // Use the real registered user's ID if selected, otherwise generate one
      id: newMemberUserId || `mem-${Date.now()}`,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || '+91 98000 00000',
      appointedDate: new Date().toISOString().split('T')[0],
    };

    const updatedMembers = [...(selectedTeamForMember.members || []), newMem];
    const updatedCount = updatedMembers.length;

    try {
      const updatedTeam = await updateTeam(selectedTeamForMember.id, {
        members: updatedMembers,
        activeVolunteersCount: updatedCount,
      });
      setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
      setSelectedTeamForMember(null);
      setNewMemberUserId('');
      setNewMemberName('');
      setNewMemberPhone('');
    } catch (err: any) {
      setSaveError(err?.message || tr(
        'सदस्य जोड़ने में त्रुटि हुई।',
        'رکن شامل کرنے میں خرابی۔',
        'Failed to add member. Please try again.'
      ));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBatchAddMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamForMember || selectedUserIds.length === 0) return;

    setSaveError(null);
    setIsSaving(true);

    const today = new Date().toISOString().split('T')[0];

    const newMembers: TeamMember[] = selectedUserIds.map((uId) => {
      const u = registeredUsers.find((user) => user.id === uId);
      return {
        id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: u?.name || 'सदस्य',
        role: 'सदस्य (Member)',
        phone: u?.phone || '+91 98000 00000',
        appointedDate: today,
      };
    });

    const updatedMembers = [...(selectedTeamForMember.members || []), ...newMembers];
    const updatedCount = updatedMembers.length;

    try {
      const updatedTeam = await updateTeam(selectedTeamForMember.id, {
        members: updatedMembers,
        activeVolunteersCount: updatedCount,
      });
      setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
      setSelectedTeamForMember(null);
      setSelectedUserIds([]);
      setUserSearchQuery('');
    } catch (err: any) {
      setSaveError(err?.message || tr(
        'सदस्यों को जोड़ने में त्रुटि हुई।',
        'اراکین شامل کرنے میں خرابی۔',
        'Failed to add members. Please try again.'
      ));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (teamId: string, memberId: string) => {
    if (!window.confirm(tr('क्या आप इस सदस्य को हटाना चाहते हैं?', 'کیا آپ اس رکن کو ہٹانا चाहते हैं؟', 'Are you sure you want to remove this member?'))) {
      return;
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const updatedMembers = (team.members || []).filter((m) => m.id !== memberId);
    const updatedCount = updatedMembers.length;

    // Optimistic UI update
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, members: updatedMembers, activeVolunteersCount: updatedCount }
          : t
      )
    );

    try {
      await updateTeam(teamId, {
        members: updatedMembers,
        activeVolunteersCount: updatedCount,
      });
    } catch (err: any) {
      // Revert on failure
      setTeams((prev) => prev.map((t) => (t.id === teamId ? team : t)));
      alert(tr(
        'सदस्य हटाने में त्रुटि हुई।',
        'رکن ہٹانے میں خرابی۔',
        'Failed to remove member. Please try again.'
      ));
    }
  };

  const handleApproveTeam = async (teamId: string) => {
    setApprovingTeamId(teamId);
    // Optimistic update
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status: 'active' as const } : t))
    );
    try {
      await updateTeam(teamId, { status: 'active' });
    } catch (err: any) {
      // Revert on failure
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, status: 'pending' as const } : t))
      );
      alert(tr(
        'अनुमोदन में त्रुटि हुई। पुनः प्रयास करें।',
        'منظوری میں خرابی۔ دوبارہ کوشش کریں۔',
        'Failed to approve team. Please try again.'
      ));
    } finally {
      setApprovingTeamId(null);
    }
  };

  const cityFilteredTeams = isSuperOrExecutive && cityFilter !== 'all'
    ? teams.filter((t) => (t.district || '').toLowerCase().includes(cityFilter.toLowerCase()))
    : teams;

  const filteredTeams = cityFilteredTeams.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.unitName.toLowerCase().includes(q);
      const matchTehsil = t.tehsilOrZone.toLowerCase().includes(q);
      const matchPres = t.HeadName.toLowerCase().includes(q);
      const matchPhone = (t.HeadPhone).includes(q);
      const matchMembers = t.members?.some((m) => m.name.toLowerCase().includes(q) || (m.role || '').toLowerCase().includes(q));
      if (!matchName && !matchTehsil && !matchPres && !matchPhone && !matchMembers) return false;
    }
    return true;
  });


  return (
    <div className="space-y-6">
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
            <Network
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
                'ब्लॉक एवं नगर कार्यकारिणी टीम गठन',
                'بلاک اور شہری تنظیمی ٹیمیں',
                'Block & City Teams Register'
              )}
            </h1>

            <p
              className="text-xs sm:text-sm mt-1 max-w-4xl"
              style={{
                color: 'rgba(200,168,75,0.9)',
              }}
            >
              {tr(
                'जिला महासचिव द्वारा ब्लॉक (Block), तहसील, नगर पालिका एवं वार्ड इकाइयों का विधिवत गठन, अध्यक्ष/सचिव नियुक्ति व स्वयंसेवकों का संधारण।',
                'ضلعی جنرل سیکرٹری کے زیر اہتمام بلاک، تحصیل، بلدیہ اور وارڈ یونٹوں کی باضابطہ تشکیل اور عہدیداران کی تعیناتی۔',
                'Official register for District General Secretary to form, organize, and assign leadership across Tehsil, Block, Nagar Palika, and Ward units.'
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          {isGenSecretary && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
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
                  'नई ब्लॉक / नगर टीम गठित करें',
                  'نئی بلاک / شہری ٹیم تشکیل دیں',
                  ' New Block / City Team'
                )}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Gen Secretary approval-workflow notice */}
      {isGenSecretary && (
        <div
          className="rounded-2xl px-4 py-3 text-xs font-semibold flex items-start gap-2.5"
          style={{
            background: 'rgba(217,119,6,0.08)',
            border: '1px solid rgba(217,119,6,0.3)',
            color: 'rgb(180,83,9)',
          }}
        >
          <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'rgb(217,119,6)' }} />
          <span>
            {tr(
              'आप जिला महासचिव हैं — केवल आप ही टीम गठित कर सकते हैं और सदस्य जोड़/हटा सकते हैं। नई टीम "अनुमोदन हेतु लंबित" स्थिति में रहेगी जब तक जिला अध्यक्ष द्वारा अनुमोदित न हो।',
              'آپ ضلعی جنرل سیکرٹری ہیں — صرف آپ ہی ٹیم بنا سکتے ہیں اور اراکین شامل/ہٹا سکتے ہیں۔ نئی ٹیم ضلعی صدر کی منظوری تک "زیر التواء" رہے گی۔',
              'You are the District General Secretary — only you can form teams and add/remove members. New teams remain Pending until approved by the District President.'
            )}
          </span>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('टीम का नाम, तहसील, अध्यक्ष या सचिव खोजें...', 'ٹیم کا نام، تحصیل، صدر یا سیکرٹری تلاش کریں...', 'Search team name, tehsil, president or secretary...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
          />
        </div>

        {/* City Filter — super/executive admin only */}
        {isSuperOrExecutive && (
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">{tr('सभी जिले', 'تمام اضلاع', 'All Districts')}</option>
              {STANDARD_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4. Teams List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoadingTeams ? (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-pulse"
              >
                {/* Badge row */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-5 w-36 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                {/* Title */}
                <div className="h-5 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800 mb-4" />
                {/* President card */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800 mb-3">
                  <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                  <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700 mb-1.5" />
                  <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                {/* Objectives strip */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 mb-3 space-y-1.5">
                  <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                {/* Footer row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </>
        ) : filteredTeams.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Network className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-300 font-bold">{tr('कोई टीम रिकॉर्ड नहीं मिली', 'کوئی ٹیم ریکارڈ نہیں ملا', 'No team units found')}</p>
            <p className="text-xs text-slate-500 mt-1">
              {tr('नया ब्लॉक या शहर मंडल जोड़ने के लिए ऊपर दिए बटन पर क्लिक करें।', 'نیا بلاک یا شہری یونٹ درج کرنے کے لیے بٹن پر کلک کریں۔', 'Click "+ Form Block / City Team" to create a new team unit.')}
            </p>
          </div>
        ) : (
          filteredTeams.map((team) => {
            const isExpanded = expandedTeamId === team.id;

            return (
              <div
                key={team.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-emerald-500/50 transition-all"
              >
                {/* Top Info Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border `}
                      >
                        <Building2 className="w-3 h-3" />
                        {tr('ब्लॉक / शहर टीम', 'بلاک / شہری ٹیم', 'Block / City Team')}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${team.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : team.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                      >
                        {team.status === 'active'
                          ? tr('सक्रिय इकाई (Active)', 'فعال', 'Active')
                          : team.status === 'pending'
                            ? tr('अनुमोदन हेतु लंबित', 'منظوری زیر التواء', 'Pending Approval')
                            : tr('गठन प्रक्रियाधीन', 'زیر تشکیل', 'In Formation')}
                      </span>

                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{team.tehsilOrZone} • {team.district}</span>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {team.unitName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start lg:self-auto">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{team.activeVolunteersCount} {tr('सक्रिय कार्यकर्ता', 'رضاکار', 'Volunteers')}</span>
                    </span>

                    {/* District President: Approve button for pending teams */}
                    {isDistrictPresident && team.status === 'pending' && (
                      <button
                        onClick={() => handleApproveTeam(team.id)}
                        disabled={approvingTeamId === team.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title={tr('इस टीम को स्वीकृत करें', 'اس ٹیم کو منظور کریں', 'Approve this team')}
                      >
                        {approvingTeamId === team.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>{tr('अनुमोदन...', 'منظوری...', 'Approving...')}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{tr('स्वीकृत करें', 'منظور کریں', 'Approve')}</span>
                          </>
                        )}
                      </button>
                    )}

                    {isGenSecretary && (
                      <button
                        onClick={() => setSelectedTeamForMember(team)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title={tr('नया पदाधिकारी नियुक्त करें', 'عہدیدار کا تقرر کریں', 'Appoint Officer')}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{tr('+ सदस्य जोड़ें', '+ رکن شامل کریں', '+ Member')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Core Leadership Roster Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                  {/* President */}
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {tr('इकाई अध्यक्ष (President)', 'صدر', 'Unit President')}
                      </span>
                      <Shield className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {team.HeadName}
                    </p>
                    <a
                      href={`tel:${team.HeadPhone}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{team.HeadPhone}</span>
                    </a>
                  </div>

                </div>

                {/* Objectives summary */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong className="text-slate-800 dark:text-slate-200">
                      {tr('कार्यक्षेत्र व उद्देश्य:', 'مقاصد:', 'Jurisdiction & Focus:')}{' '}
                    </strong>
                    {team.objectives}
                  </p>
                </div>

                {/* Toggle Appointed Members */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {tr('गठन तिथि:', 'تاریخ تشکیل:', 'Formed:')} {team.formedDate}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <span>
                      {isExpanded
                        ? tr('कार्यकारिणी छुपाएं', 'تفصیل چھپائیں', 'Hide Members')
                        : tr(`कार्यकारिणी देखें (${team.members?.length || 0})`, `اراکین دیکھیں (${team.members?.length || 0})`, `View Members (${team.members?.length || 0})`)}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Members Accordion */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {tr('नियुक्त टीम सदस्य:', 'مقرر کردہ ٹیم کے اراکین:', 'Appointed Team Members:')}
                      </h4>
                      {isGenSecretary && (
                        <button
                          onClick={() => setSelectedTeamForMember(team)}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{tr('नया सदस्य जोड़ें', 'نیا رکن شامل کریں', 'Add Members')}</span>
                        </button>
                      )}
                    </div>

                    {team.members && team.members.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {team.members.map((mem) => (
                          <div
                            key={mem.id}
                            className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{mem.name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{mem.role}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${mem.phone}`}
                                className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1 hover:underline"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{mem.phone}</span>
                              </a>
                              {isGenSecretary && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMember(team.id, mem.id)}
                                  title={tr('सदस्य हटाएं', 'رکن کو ہٹائیں', 'Remove Member')}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        {tr('अभी अन्य सदस्य नहीं जोड़े गए हैं। "नया सदस्य जोड़ें" पर क्लिक करें।', 'ابھی مزید اراکین شامل نہیں کیے گئے۔', 'No additional members added yet. Click "Add Member" to appoint members.')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Create Block / City Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {tr('नई ब्लॉक / नगर टीम गठित करें', 'نئی بلاک / شہری ٹیم تشکیل دیں', 'Form New Block / City Team')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {tr('जिला महासचिव रजिस्टर में नई क्षेत्रीय इकाई का गठन व नेतृत्व निर्धारित करें।', 'ضلعی جنرل سیکرٹری رجسٹر میں نئی تنظیمی اکائی کا اندراج کریں۔', 'Official appointment and establishment of regional unit.')}
            </p>

            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">

              {/* Team Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('टीम का नाम *', 'ٹیم کا نام *', 'Team Name *')}
                </label>
                <input
                  required
                  type="text"
                  placeholder={tr('उदाहरण: बहेरी ब्लॉक कार्यकारी समिति', 'مثال: بہیری بلاک ایگزیکٹو کمیٹی', 'Example: Baheri Block Executive Committee')}
                  value={formUnitName}
                  onChange={(e) => setFormUnitName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              {/* Tehsil / Zone & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('तहसील / नगर क्षेत्र (Tehsil / Zone) *', 'تحصیل / زون *', 'Tehsil / Zone *')}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={tr('उदाहरण: नवाबगंज तहसील / पुराना शहर', 'مثال: نواب گنج تحصیل / پرانا شہر', 'Example: Nawabganj Tehsil / Old City')}
                    value={formTehsil}
                    onChange={(e) => setFormTehsil(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('गठन तिथि (Formation Date) *', 'تاریخ تشکیل *', 'Formation Date *')}
                  </label>
                  <input
                    required
                    type="date"
                    value={formFormedDate}
                    onChange={(e) => setFormFormedDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Head Details */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    {tr('टीम प्रमुख (Team Head) *', 'ٹیم ہیڈ *', 'Team Head *')}
                  </span>
                  {formPresidentUserId && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormPresidentUserId('');
                        setFormPresidentName('');
                        setFormPresidentPhone('');
                      }}
                      className="text-[11px] text-rose-500 hover:underline font-semibold cursor-pointer"
                    >
                      {tr('हटाएं', 'صاف کریں', 'Clear')}
                    </button>
                  )}
                </div>

                {registeredUsers.length > 0 ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {tr('⚡ पंजीकृत सदस्यों में से टीम प्रमुख चुनें (Select Member as Head):', '⚡ رجسٹرڈ رکن میں سے ہیڈ منتخب کریں:', '⚡ Select Member as Head:')}
                    </label>
                    <select
                      required
                      value={formPresidentUserId}
                      onChange={(e) => {
                        const uId = e.target.value;
                        setFormPresidentUserId(uId);
                        if (uId) {
                          const u = registeredUsers.find((user) => user.id === uId);
                          if (u) {
                            setFormPresidentName(u.name || '');
                            setFormPresidentPhone(u.phone || '');
                          }
                        } else {
                          setFormPresidentName('');
                          setFormPresidentPhone('');
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-600 dark:focus:border-emerald-500 cursor-pointer font-medium shadow-2xs"
                    >
                      <option value="">
                        {tr('⚡ सदस्य चुनें...', '⚡ رکن منتخب کریں...', '⚡ Select a member...')}
                      </option>
                      {registeredUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          👤 {u.name} {u.phone ? `(${u.phone})` : ''} {u.city ? `• ${u.city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {tr('कोई पंजीकृत सदस्य नहीं मिला।', 'کوئی رجسٹرڈ رکن نہیں ملا۔', 'No registered members available.')}
                  </p>
                )}

                {/* Head Name and Phone shown ONLY when a user is selected */}
                {formPresidentUserId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5 animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {tr('प्रमुख का नाम *', 'ہیڈ کا نام *', 'Head Name *')}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Mohammad Rashid Khan"
                        value={formPresidentName}
                        onChange={(e) => setFormPresidentName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {tr('प्रमुख मोबाइल नंबर', 'ہیڈ فون *', 'Head Phone')}
                      </label>
                      <input
                        type="text"
                        placeholder="+91 98000 00000"
                        value={formPresidentPhone}
                        onChange={(e) => setFormPresidentPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>



              {/* Members & Officers Section */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/80 dark:bg-slate-950/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs sm:text-sm">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{tr('टीम सदस्य', 'ٹیم اراکین', 'Team Members')}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {formInitialMembers.length}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {tr('गठन के समय ही कई सदस्यों को एक साथ चुनें।', 'تشکیل کے وقت ایک ساتھ کئی اراکین منتخب کریں۔', 'Select multiple members at once.')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                    {registeredUsers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCreateMultiSelectOpen(!isCreateMultiSelectOpen)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs ${isCreateMultiSelectOpen
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>
                          {isCreateMultiSelectOpen
                            ? tr('चयन बंद करें', 'بند کریں', 'Close Picker')
                            : tr('सदस्य जोड़ें', 'اراکین شامل کریں', 'Add Members')}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Multi-Select User Picker Panel (Expanded) */}
                {isCreateMultiSelectOpen && (
                  <div className="p-3.5 rounded-2xl border-2 border-emerald-500/50 bg-white dark:bg-slate-900 space-y-3 shadow-md animate-fade-in">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {tr('पंजीकृत सदस्यों से चुनें', 'رجسٹرڈ اراکین میں سے منتخب کریں', 'Select Registered Users')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            const availableUsers = registeredUsers.filter((u) => {
                              if (!createMultiSearchQuery.trim()) return true;
                              const q = createMultiSearchQuery.toLowerCase();
                              return (
                                (u.name && u.name.toLowerCase().includes(q)) ||
                                (u.phone && u.phone.includes(q)) ||
                                (u.city && u.city.toLowerCase().includes(q))
                              );
                            });
                            setFormInitialMembers((prev) => {
                              const existingIds = new Set(prev.map((m) => m.id));
                              const toAdd = availableUsers
                                .filter((u) => !existingIds.has(u.id))
                                .map((u) => ({
                                  id: u.id,
                                  name: u.name || '',
                                  role: 'सदस्य (Member)',
                                  phone: u.phone || '',
                                }));
                              return [...prev, ...toAdd];
                            });
                          }}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                        >
                          {tr('सभी चुनें', 'سب منتخب کریں', 'Select All')}
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setFormInitialMembers([])}
                          className="text-slate-500 hover:underline font-semibold cursor-pointer"
                        >
                          {tr('हटाएं', 'صاف کریں', 'Clear')}
                        </button>
                      </div>
                    </div>

                    {/* Search inside picker */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={tr('सदस्यों को खोजें...', 'اراکین تلاش کریں...', 'Search members by name, phone or city...')}
                        value={createMultiSearchQuery}
                        onChange={(e) => setCreateMultiSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                      />
                    </div>

                    {/* Checkable List */}
                    <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 dark:border-slate-800 rounded-xl p-1.5 bg-slate-50/50 dark:bg-slate-950/30">
                      {registeredUsers
                        .filter((u) => {
                          if (!createMultiSearchQuery.trim()) return true;
                          const q = createMultiSearchQuery.toLowerCase();
                          return (
                            (u.name && u.name.toLowerCase().includes(q)) ||
                            (u.phone && u.phone.includes(q)) ||
                            (u.city && u.city.toLowerCase().includes(q))
                          );
                        })
                        .map((user) => {
                          const isSelected = formInitialMembers.some((m) => m.id === user.id || (m.name === user.name && m.phone === user.phone));
                          return (
                            <div
                              key={user.id}
                              onClick={() => {
                                if (isSelected) {
                                  setFormInitialMembers((prev) =>
                                    prev.filter((m) => m.id !== user.id && !(m.name === user.name && m.phone === user.phone))
                                  );
                                } else {
                                  setFormInitialMembers((prev) => [
                                    ...prev,
                                    {
                                      id: user.id,
                                      name: user.name || '',
                                      role: 'सदस्य (Member)',
                                      phone: user.phone || '',
                                    },
                                  ]);
                                }
                              }}
                              className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all ${isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-2xs font-semibold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="shrink-0 text-emerald-600 dark:text-emerald-400">
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-slate-900 dark:text-white truncate block">
                                    {user.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 truncate block">
                                    {user.phone || '+91 98000 00000'} {user.city ? `• ${user.city}` : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Completion Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {tr(`${formInitialMembers.length} सदस्य चयनित`, `${formInitialMembers.length} اراکین منتخب`, `${formInitialMembers.length} members selected`)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreateMultiSelectOpen(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{tr('पूर्ण करें (Done)', 'مکمل کریں', 'Done')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* List of Initial Members Added to Draft */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {tr('जोड़े गए सदस्य:', 'شامل کردہ اراکین:', 'Added Members:')} ({formInitialMembers.length})
                    </span>
                    {formInitialMembers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormInitialMembers([])}
                        className="text-[11px] text-rose-500 hover:underline font-semibold cursor-pointer"
                      >
                        {tr('सभी हटाएं', 'تمام حذف کریں', 'Clear All')}
                      </button>
                    )}
                  </div>

                  {formInitialMembers.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-white/60 dark:bg-slate-900/40">
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        {tr('अभी कोई सदस्य नहीं जोड़ा गया है। ऊपर "सदस्य जोड़ें" पर क्लिक करके सदस्य चुनें।', 'ابھی تک کوئی رکن شامل نہیں کیا گیا ہے۔ اوپر بٹن پر کلک کریں۔', 'No members added yet. Click "Add Members" above to select.')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {formInitialMembers.map((draft, idx) => (
                        <div
                          key={draft.id}
                          className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs text-xs animate-fade-in"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {draft.name}
                              </p>
                              {draft.phone && (
                                <p className="text-[10px] text-slate-500 truncate">
                                  {draft.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveInitialMemberRow(draft.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                            title={tr('हटाएं', 'حذف', 'Remove')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>



              {/* Error Message */}
              {saveError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
                  <X className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); setSaveError(null); }}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                  disabled={isSaving}
                >
                  {tr('रद्द करें', 'منسوخ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="mfct-btn-gold px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      <span>{tr('सहेजा जा रहा है...', 'محفوظ ہو رہا ہے...', 'Saving...')}</span>
                    </>
                  ) : (
                    <span>{tr('टीम गठित करें', 'ٹیم تشکیل دیں', 'Create Team')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Member Modal */}
      {selectedTeamForMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setSelectedTeamForMember(null);
                setSelectedUserIds([]);
                setUserSearchQuery('');
              }}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 pr-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{tr('इकाई में सदस्य / पदाधिकारी नियुक्त करें', 'یونٹ میں اراکین / عہدیداران شامل کریں', 'Appoint Members & Officers')}</span>
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {selectedTeamForMember.unitName} • {selectedTeamForMember.tehsilOrZone}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMemberModalMode('multi')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${memberModalMode === 'multi'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{tr('एक साथ कई सदस्य चुनें (Multi-Select)', 'کئی اراکین منتخب کریں', 'Multi-Select Users')}</span>
                {selectedUserIds.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {selectedUserIds.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMemberModalMode('manual')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${memberModalMode === 'manual'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tr('एक सदस्य मैन्युअल (Single Manual)', 'ایک رکن دستی', 'Single Manual Add')}</span>
              </button>
            </div>

            {memberModalMode === 'multi' ? (
              <form onSubmit={handleBatchAddMembers} className="space-y-4 text-xs">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={tr('नाम, फोन नंबर या शहर से खोजें...', 'نام، فون یا شہر سے تلاش کریں...', 'Search by name, phone or city...')}
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 text-xs"
                  />
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Selection Controls */}
                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {tr(
                        `${selectedUserIds.length} सदस्य चयनित`,
                        `${selectedUserIds.length} اراکین منتخب`,
                        `${selectedUserIds.length} members selected`
                      )}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const existingNames = new Set((selectedTeamForMember?.members || []).map(m => m.name.toLowerCase()));
                        const available = registeredUsers
                          .filter(u => !existingNames.has((u.name || '').toLowerCase()))
                          .filter(u => {
                            if (!userSearchQuery.trim()) return true;
                            const q = userSearchQuery.toLowerCase();
                            return (
                              (u.name && u.name.toLowerCase().includes(q)) ||
                              (u.phone && u.phone.includes(q)) ||
                              (u.city && u.city.toLowerCase().includes(q))
                            );
                          })
                          .map(u => u.id);
                        setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...available])));
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                    >
                      {tr('सभी चुनें', 'سب منتخب کریں', 'Select All')}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedUserIds([])}
                      className="text-slate-500 hover:underline font-semibold cursor-pointer"
                    >
                      {tr('हटाएं', 'صاف کریں', 'Clear')}
                    </button>
                  </div>
                </div>

                {/* User Cards Checklist */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-2 max-h-56 overflow-y-auto space-y-1.5 bg-slate-50/50 dark:bg-slate-950/40">
                  {registeredUsers
                    .filter((u) => {
                      if (!userSearchQuery.trim()) return true;
                      const q = userSearchQuery.toLowerCase();
                      return (
                        (u.name && u.name.toLowerCase().includes(q)) ||
                        (u.phone && u.phone.includes(q)) ||
                        (u.city && u.city.toLowerCase().includes(q))
                      );
                    })
                    .map((user) => {
                      const isAlreadyInTeam = selectedTeamForMember.members?.some(
                        (m) => (m.name && m.name.toLowerCase() === (user.name || '').toLowerCase()) || (m.phone && m.phone === user.phone)
                      );
                      const isSelected = selectedUserIds.includes(user.id);

                      return (
                        <div
                          key={user.id}
                          onClick={() => {
                            if (isAlreadyInTeam) return;
                            setSelectedUserIds((prev) =>
                              prev.includes(user.id)
                                ? prev.filter((id) => id !== user.id)
                                : [...prev, user.id]
                            );
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${isAlreadyInTeam
                            ? 'opacity-50 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                            : isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500/80 cursor-pointer shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="shrink-0 text-emerald-600 dark:text-emerald-400">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {user.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {user.phone || '+91 98000 00000'} {user.city ? `• ${user.city}` : ''}
                              </p>
                            </div>
                          </div>

                          {isAlreadyInTeam && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {tr('पहले से नियुक्त', 'پہلے سے شامل', 'In Unit')}
                            </span>
                          )}
                        </div>
                      );
                    })}

                  {registeredUsers.length === 0 && (
                    <p className="text-center text-slate-400 py-6">
                      {tr('कोई पंजीकृत उपयोगकर्ता नहीं मिला।', 'کوئی صارف نہیں ملا', 'No registered users found.')}
                    </p>
                  )}
                </div>

                {saveError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
                    <X className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{saveError}</span>
                  </div>
                )}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTeamForMember(null);
                      setSelectedUserIds([]);
                      setUserSearchQuery('');
                      setSaveError(null);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                    disabled={isSaving}
                  >
                    {tr('रद्द करें', 'منسوخ', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={selectedUserIds.length === 0 || isSaving}
                    className="mfct-btn-gold px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <span>{tr('नियुक्त किया जा रहा है...', 'شامل ہو رہا ہے...', 'Appointing...')}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>
                          {selectedUserIds.length > 0
                            ? tr(`चयनित ${selectedUserIds.length} सदस्य नियुक्त करें`, `منتخب ${selectedUserIds.length} اراکین شامل کریں`, `Appoint ${selectedUserIds.length} Members`)
                            : tr('सदस्य चुनें', 'اراکین منتخب کریں', 'Select Members')}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Single Manual Add Form */
              <form onSubmit={handleAddSingleMember} className="space-y-4 text-xs">

                {/* User Picker */}
                {registeredUsers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        {tr('पंजीकृत सदस्य चुनें (वैकल्पिक)', 'رجسٹرڈ رکن منتخب کریں (اختیاری)', 'Select Registered User (Optional)')}
                      </label>
                      {newMemberUserId && (
                        <button
                          type="button"
                          onClick={() => { setNewMemberUserId(''); setNewMemberName(''); setNewMemberPhone(''); }}
                          className="text-[11px] text-rose-500 hover:underline font-semibold cursor-pointer"
                        >
                          {tr('हटाएं', 'صاف کریں', 'Clear')}
                        </button>
                      )}
                    </div>
                    <select
                      value={newMemberUserId}
                      onChange={(e) => {
                        const uid = e.target.value;
                        setNewMemberUserId(uid);
                        if (uid) {
                          const u = registeredUsers.find((u) => u.id === uid);
                          if (u) {
                            setNewMemberName(u.name || '');
                            setNewMemberPhone(u.phone || '');
                          }
                        } else {
                          setNewMemberName('');
                          setNewMemberPhone('');
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-600 dark:focus:border-emerald-500 cursor-pointer font-medium"
                    >
                      <option value="">{tr('⎡ सदस्य चुनें...', '⎡ رکن منتخب کریں...', '⎡ Select a member...')}</option>
                      {registeredUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          👤 {u.name} {u.phone ? `(‪${u.phone}‬)` : ''} {u.city ? `• ${u.city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('पदाधिकारी का नाम *', 'نام *', 'Member Name *')}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Salman Mansoori"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('मोबाइल नंबर *', 'موبائل نمبر *', 'Phone Number *')}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="+91 98370 11223"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>

                {saveError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
                    <X className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{saveError}</span>
                  </div>
                )}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTeamForMember(null);
                      setSaveError(null);
                      setNewMemberUserId('');
                      setNewMemberName('');
                      setNewMemberPhone('');
                    }}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                    disabled={isSaving}
                  >
                    {tr('रद्द करें', 'منسوخ', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mfct-btn-gold px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <span>{tr('नियुक्त किया जा रहा है...', 'شامل ہو رہا ہے...', 'Saving...')}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{tr('नियुक्ति दर्ज करें', 'تقرر محفوظ کریں', 'Confirm Appointment')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
