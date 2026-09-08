'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
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
} from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  appointedDate: string;
}

export interface DistrictTeamUnit {
  id: string;
  unitName: string;
  unitType: 'block' | 'city';
  tehsilOrZone: string;
  district: string;
  presidentName: string;
  presidentPhone: string;
  secretaryName: string;
  secretaryPhone: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  formedDate: string;
  activeVolunteersCount: number;
  status: 'active' | 'in_formation';
  objectives: string;
  members: TeamMember[];
}

const DEFAULT_TEAMS: DistrictTeamUnit[] = [
  {
    id: 'team-block-1',
    unitName: 'Nawabganj Block Executive Unit (नवाबगंज ब्लॉक कार्यकारिणी)',
    unitType: 'block',
    tehsilOrZone: 'Nawabganj Tehsil',
    district: 'Bareilly District',
    presidentName: 'Mohammad Rashid Khan',
    presidentPhone: '+91 98371 22410',
    secretaryName: 'Zubair Ahmad Qureshi',
    secretaryPhone: '+91 94120 88712',
    coordinatorName: 'Dr. Shakeel Farooqui',
    coordinatorPhone: '+91 99270 44102',
    formedDate: '2026-06-15',
    activeVolunteersCount: 28,
    status: 'active',
    objectives: 'Rural welfare, emergency medical aid dispatch, orphan scholarship verification, and widow pension drives across 42 village panchayats.',
    members: [
      { id: 'm-1', name: 'Salman Mansoori', role: 'Vice President (उपाध्यक्ष)', phone: '+91 98370 11223', appointedDate: '2026-06-20' },
      { id: 'm-2', name: 'Irfan Ansari', role: 'Youth Coordinator (युवा समन्वयक)', phone: '+91 94111 22334', appointedDate: '2026-07-05' },
      { id: 'm-3', name: 'Haider Ali', role: 'Relief Incharge (राहत प्रभारी)', phone: '+91 98378 99887', appointedDate: '2026-07-12' },
    ],
  },
  {
    id: 'team-block-2',
    unitName: 'Baheri Tehsil & Block Unit (बहेड़ी ब्लॉक व तहसील इकाई)',
    unitType: 'block',
    tehsilOrZone: 'Baheri Tehsil',
    district: 'Bareilly District',
    presidentName: 'Haji Mukhtar Husain',
    presidentPhone: '+91 98375 66710',
    secretaryName: 'Nadeem Akhtar',
    secretaryPhone: '+91 94122 33441',
    coordinatorName: 'Maulana Imran Raza',
    coordinatorPhone: '+91 97580 11980',
    formedDate: '2026-07-10',
    activeVolunteersCount: 34,
    status: 'active',
    objectives: 'Education assistance, hospital referral helpline, free medicine camps, and verification of genuine beneficiaries.',
    members: [
      { id: 'm-4', name: 'Wasim Akram', role: 'Joint Secretary (सह-सचिव)', phone: '+91 99271 88776', appointedDate: '2026-07-15' },
      { id: 'm-5', name: 'Tariq Mehmood', role: 'Treasurer (कोषाध्यक्ष)', phone: '+91 98374 55443', appointedDate: '2026-07-20' },
    ],
  },
  {
    id: 'team-city-1',
    unitName: 'Bareilly Central City Unit (बरेली नगर केंद्रीय कार्यकारिणी)',
    unitType: 'city',
    tehsilOrZone: 'Bareilly City North & South Zone',
    district: 'Bareilly District',
    presidentName: 'Syed Arshad Ali',
    presidentPhone: '+91 98370 00112',
    secretaryName: 'Mohammad Danish',
    secretaryPhone: '+91 94125 77665',
    coordinatorName: 'Farhan Zaidi',
    coordinatorPhone: '+91 98970 22331',
    formedDate: '2026-05-18',
    activeVolunteersCount: 45,
    status: 'active',
    objectives: 'Urban poverty alleviation, ration distribution for destitute households, winter warmth blanket drive, and civic counseling desk.',
    members: [
      { id: 'm-6', name: 'Rehan Siddiqui', role: 'City Vice President (नगर उपाध्यक्ष)', phone: '+91 98372 33445', appointedDate: '2026-05-25' },
      { id: 'm-7', name: 'Bilal Khan', role: 'Media & Public Relations (मीडिया प्रभारी)', phone: '+91 94110 55667', appointedDate: '2026-06-01' },
      { id: 'm-8', name: 'Nasiruddin', role: 'Ward Coordinator (वार्ड समन्वयक)', phone: '+91 98373 66778', appointedDate: '2026-06-10' },
    ],
  },
  {
    id: 'team-block-3',
    unitName: 'Faridpur Block Unit (फरीदपुर ब्लॉक इकाई)',
    unitType: 'block',
    tehsilOrZone: 'Faridpur Tehsil',
    district: 'Bareilly District',
    presidentName: 'Chaudhary Shahid Hasan',
    presidentPhone: '+91 98376 77889',
    secretaryName: 'Mustafa Kamal',
    secretaryPhone: '+91 94121 99887',
    coordinatorName: 'Anwar Husain',
    coordinatorPhone: '+91 99275 66554',
    formedDate: '2026-08-01',
    activeVolunteersCount: 22,
    status: 'in_formation',
    objectives: 'Organization expansion, booth and village level membership drives, youth volunteer induction.',
    members: [
      { id: 'm-9', name: 'Kashif Raza', role: 'Organizing Secretary (संगठन सचिव)', phone: '+91 98379 11224', appointedDate: '2026-08-05' },
    ],
  },
  {
    id: 'team-city-2',
    unitName: 'Qilla & Civil Lines Town Chapter (किला एवं सिविल लाइंस नगर मंडल)',
    unitType: 'city',
    tehsilOrZone: 'Old City & Civil Lines Ward 12-24',
    district: 'Bareilly District',
    presidentName: 'Advocate Sohail Ahmed',
    presidentPhone: '+91 98377 44332',
    secretaryName: 'Rizwan Khan',
    secretaryPhone: '+91 94129 66554',
    coordinatorName: 'Shariq Jameel',
    coordinatorPhone: '+91 98971 77889',
    formedDate: '2026-08-14',
    activeVolunteersCount: 26,
    status: 'active',
    objectives: 'Legal aid camp for underprivileged, identity documentation camp (Aadhaar/Voter), and emergency blood donation circle.',
    members: [
      { id: 'm-10', name: 'Ziaul Haq', role: 'Ward Secretary (वार्ड सचिव)', phone: '+91 98378 22119', appointedDate: '2026-08-20' },
      { id: 'm-11', name: 'Adnan Qazi', role: 'Blood Bank Incharge (रक्तदान प्रभारी)', phone: '+91 94112 88990', appointedDate: '2026-08-25' },
    ],
  },
];

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

  const [teams, setTeams] = useState<DistrictTeamUnit[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mfct_district_teams');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_TEAMS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'block' | 'city' | 'in_formation'>('all');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Create Unit Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formUnitName, setFormUnitName] = useState('');
  const [formUnitType, setFormUnitType] = useState<'block' | 'city'>('block');
  const [formTehsil, setFormTehsil] = useState('');
  const [formPresidentName, setFormPresidentName] = useState('');
  const [formPresidentPhone, setFormPresidentPhone] = useState('');
  const [formSecretaryName, setFormSecretaryName] = useState('');
  const [formSecretaryPhone, setFormSecretaryPhone] = useState('');
  const [formCoordinatorName, setFormCoordinatorName] = useState('');
  const [formCoordinatorPhone, setFormCoordinatorPhone] = useState('');
  const [formFormedDate, setFormFormedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formVolunteers, setFormVolunteers] = useState('20');
  const [formStatus, setFormStatus] = useState<'active' | 'in_formation'>('active');
  const [formObjectives, setFormObjectives] = useState('');

  // Add Member Modal
  const [selectedTeamForMember, setSelectedTeamForMember] = useState<DistrictTeamUnit | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Executive Member (कार्यकारिणी सदस्य)');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mfct_district_teams', JSON.stringify(teams));
    }
  }, [teams]);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUnitName.trim() || !formPresidentName.trim() || !formSecretaryName.trim()) {
      return;
    }

    const newUnit: DistrictTeamUnit = {
      id: `team-${Date.now()}`,
      unitName: formUnitName.trim(),
      unitType: formUnitType,
      tehsilOrZone: formTehsil.trim() || (formUnitType === 'block' ? 'Rural Tehsil' : 'Urban Zone'),
      district: activeUser?.city ? `${activeUser.city} District` : 'Bareilly District',
      presidentName: formPresidentName.trim(),
      presidentPhone: formPresidentPhone.trim() || '+91 98000 00000',
      secretaryName: formSecretaryName.trim(),
      secretaryPhone: formSecretaryPhone.trim() || '+91 94000 00000',
      coordinatorName: formCoordinatorName.trim() || undefined,
      coordinatorPhone: formCoordinatorPhone.trim() || undefined,
      formedDate: formFormedDate,
      activeVolunteersCount: parseInt(formVolunteers, 10) || 15,
      status: formStatus,
      objectives: formObjectives.trim() || 'Organizational expansion, volunteer coordination, and local public welfare initiatives.',
      members: [],
    };

    setTeams([newUnit, ...teams]);
    setIsCreateModalOpen(false);

    // Reset Form
    setFormUnitName('');
    setFormUnitType('block');
    setFormTehsil('');
    setFormPresidentName('');
    setFormPresidentPhone('');
    setFormSecretaryName('');
    setFormSecretaryPhone('');
    setFormCoordinatorName('');
    setFormCoordinatorPhone('');
    setFormVolunteers('20');
    setFormStatus('active');
    setFormObjectives('');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamForMember || !newMemberName.trim()) return;

    const newMem: TeamMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole.trim(),
      phone: newMemberPhone.trim() || '+91 98000 00000',
      appointedDate: new Date().toISOString().split('T')[0],
    };

    const updated = teams.map((t) => {
      if (t.id === selectedTeamForMember.id) {
        return {
          ...t,
          members: [...(t.members || []), newMem],
          activeVolunteersCount: (t.activeVolunteersCount || 0) + 1,
        };
      }
      return t;
    });

    setTeams(updated);
    setSelectedTeamForMember(null);
    setNewMemberName('');
    setNewMemberPhone('');
  };

  const filteredTeams = teams.filter((t) => {
    if (filterType === 'block' && t.unitType !== 'block') return false;
    if (filterType === 'city' && t.unitType !== 'city') return false;
    if (filterType === 'in_formation' && t.status !== 'in_formation') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.unitName.toLowerCase().includes(q);
      const matchTehsil = t.tehsilOrZone.toLowerCase().includes(q);
      const matchPres = t.presidentName.toLowerCase().includes(q);
      const matchSec = t.secretaryName.toLowerCase().includes(q);
      const matchPhone = (t.presidentPhone + t.secretaryPhone).includes(q);
      if (!matchName && !matchTehsil && !matchPres && !matchSec && !matchPhone) return false;
    }
    return true;
  });

  const totalUnits = teams.length;
  const blockUnitsCount = teams.filter((t) => t.unitType === 'block').length;
  const cityUnitsCount = teams.filter((t) => t.unitType === 'city').length;
  const totalOfficersCount = teams.reduce((acc, t) => acc + (t.members?.length || 0) + 2, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner - Official MFCT Green & Gold Standard */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5"
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

        <div className="flex items-start gap-4 relative z-10">
          <div
            className="p-3.5 rounded-2xl shrink-0 mt-0.5"
            style={{
              background: 'rgba(200,168,75,0.15)',
              border: '1px solid rgba(200,168,75,0.35)',
            }}
          >
            <Network className="w-7 h-7" style={{ color: 'var(--mfct-gold)' }} />
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
              <Award className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
              <span>{tr('जिला महासचिव कार्यक्षेत्र', 'ضلعی جنرل سیکرٹری ورک اسپیس', 'District General Secretary Workspace')}</span>
              <span>•</span>
              <span>{tr('संगठन विस्तार एवं इकाई गठन', 'تنظیمی توسیع و تشکیل', 'Unit Formation & Roster')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {tr('ब्लॉक एवं नगर कार्यकारिणी टीम गठन', 'بلاک اور شہری تنظیمی ٹیمیں', 'Block & City Teams Register')}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: 'rgba(200,168,75,0.85)' }}>
              {tr(
                'जिला महासचिव द्वारा ब्लॉक (Block), तहसील, नगर पालिका एवं वार्ड इकाइयों का विधिवत गठन, अध्यक्ष/सचिव नियुक्ति व स्वयंसेवकों का संधारण।',
                'ضلعی جنرل سیکرٹری کے زیر اہتمام بلاک، تحصیل، بلدیہ اور وارڈ یونٹوں کی باضابطہ تشکیل اور عہدیداران کی تعیناتی۔',
                'Official register for District General Secretary to form, organize, and assign leadership across Tehsil, Block, Nagar Palika, and Ward units.'
              )}
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mfct-btn-gold py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{tr('नई ब्लॉक / नगर टीम गठित करें', 'نئی بلاک / شہری ٹیم تشکیل دیں', '+ Form Block / City Team')}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tr('कुल गठित इकाइयाँ', 'کل تشکیل شدہ یونٹس', 'Total Units')}</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalUnits}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{tr('जिले में अधिकृत इकाइयाँ', 'ضلع میں مجاز یونٹس', 'Authorized Chapters')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tr('ब्लॉक टीमें (ग्रामीण)', 'بلاک ٹیمیں (دیہی)', 'Block Units')}</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{blockUnitsCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{tr('तहसील/ग्रामीण पंचायत क्षेत्र', 'دیہی پنچایت زونز', 'Rural Block Units')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tr('नगर / शहर टीमें', 'شہری یونٹس', 'City / Nagar Units')}</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{cityUnitsCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{tr('शहरी वार्ड व पालिका मंडल', 'شہری وارڈ اور بلدیہ', 'Urban Ward Chapters')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{tr('नियुक्त पदाधिकारी', 'مقرر عہدیداران', 'Appointed Leaders')}</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalOfficersCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{tr('अध्यक्ष, सचिव व कार्यकारिणी', 'صدور، سیکرٹریز اور اراکین', 'Presidents, Secs & Execs')}</p>
        </div>
      </div>

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

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto shrink-0 overflow-x-auto">
          {[
            { id: 'all', label: tr('सभी टीमें', 'تمام ٹیمیں', 'All Units') },
            { id: 'block', label: tr('ब्लॉक (ग्रामीण)', 'بلاک', 'Block Units') },
            { id: 'city', label: tr('नगर / शहर', 'شہری', 'City Units') },
            { id: 'in_formation', label: tr('गठन प्रक्रिया में', 'زیر تشکیل', 'In Formation') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap capitalize transition-all cursor-pointer ${
                filterType === item.id
                  ? 'text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={filterType === item.id ? { background: 'var(--mfct-mid-green)' } : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Teams List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTeams.length === 0 ? (
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
            const isBlock = team.unitType === 'block';

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
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isBlock
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {isBlock ? <Layers className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        {isBlock ? tr('ब्लॉक इकाई (Block Unit)', 'بلاک یونٹ', 'Block Unit') : tr('नगर इकाई (City Chapter)', 'شہری چیپٹر', 'City Chapter')}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          team.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {team.status === 'active' ? tr('सक्रिय इकाई (Active)', 'فعال', 'Active') : tr('गठन प्रक्रियाधीन', 'زیر تشکیل', 'In Formation')}
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

                    <button
                      onClick={() => setSelectedTeamForMember(team)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title={tr('नया पदाधिकारी नियुक्त करें', 'عہدیدار کا تقرر کریں', 'Appoint Officer')}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tr('+ सदस्य जोड़ें', '+ رکن شامل کریں', '+ Member')}</span>
                    </button>
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
                      {team.presidentName}
                    </p>
                    <a
                      href={`tel:${team.presidentPhone}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{team.presidentPhone}</span>
                    </a>
                  </div>

                  {/* Secretary */}
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {tr('इकाई सचिव (Secretary)', 'سیکرٹری', 'Unit Secretary')}
                      </span>
                      <Award className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {team.secretaryName}
                    </p>
                    <a
                      href={`tel:${team.secretaryPhone}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{team.secretaryPhone}</span>
                    </a>
                  </div>

                  {/* Coordinator */}
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {tr('समन्वयक / उपाध्यक्ष', 'کوآرڈینیٹر', 'Coordinator / VP')}
                      </span>
                      <Users className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {team.coordinatorName || tr('नियुक्ति प्रक्रिया में', 'تعیناتی جاری', 'Under Appointment')}
                    </p>
                    {team.coordinatorPhone ? (
                      <a
                        href={`tel:${team.coordinatorPhone}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{team.coordinatorPhone}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 block mt-0.5">—</span>
                    )}
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
                        {tr('इकाई के अन्य नियुक्त पदाधिकारी:', 'دیگر نامزد عہدیداران:', 'Appointed Unit Office Bearers:')}
                      </h4>
                      <button
                        onClick={() => setSelectedTeamForMember(team)}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{tr('नया पदाधिकारी जोड़ें', 'نیا عہدیدار شامل کریں', 'Add Officer')}</span>
                      </button>
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
                            <a
                              href={`tel:${mem.phone}`}
                              className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{mem.phone}</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        {tr('अभी अन्य सदस्य नहीं जोड़े गए हैं। "नया पदाधिकारी जोड़ें" पर क्लिक करें।', 'ابھی مزید اراکین شامل نہیں کیے گئے۔', 'No additional members added yet. Click "Add Officer" to appoint members.')}
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
              {/* Unit Type Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {tr('इकाई का प्रकार (Unit Type) *', 'یونٹ کی قسم *', 'Unit Type *')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormUnitType('block')}
                    className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formUnitType === 'block'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>{tr('ब्लॉक इकाई (Block Unit)', 'بلاک یونٹ', 'Block Unit')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormUnitType('city')}
                    className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formUnitType === 'city'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{tr('नगर / शहर इकाई (City Chapter)', 'شہری چیپٹر', 'City Chapter')}</span>
                  </button>
                </div>
              </div>

              {/* Unit Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('इकाई का आधिकारिक नाम *', 'یونٹ کا باضابطہ نام *', 'Unit Name *')}
                </label>
                <input
                  required
                  type="text"
                  placeholder={formUnitType === 'block' ? 'e.g. Baheri Block Executive Committee' : 'e.g. Bareilly City Ward 14 Committee'}
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
                    placeholder="e.g. Nawabganj Tehsil / Old City"
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

              {/* President Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('इकाई अध्यक्ष नाम *', 'صدر کا نام *', 'President Name *')}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Mohammad Rashid Khan"
                    value={formPresidentName}
                    onChange={(e) => setFormPresidentName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('अध्यक्ष मोबाइल नंबर', 'صدر فون *', 'President Phone')}
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98371 22410"
                    value={formPresidentPhone}
                    onChange={(e) => setFormPresidentPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Secretary Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('इकाई सचिव नाम *', 'سیکرٹری کا نام *', 'Secretary Name *')}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Zubair Ahmad Qureshi"
                    value={formSecretaryName}
                    onChange={(e) => setFormSecretaryName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('सचिव मोबाइल नंबर', 'سیکرٹری فون', 'Secretary Phone')}
                  </label>
                  <input
                    type="text"
                    placeholder="+91 94120 88712"
                    value={formSecretaryPhone}
                    onChange={(e) => setFormSecretaryPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Coordinator Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('इकाई समन्वयक / उपाध्यक्ष', 'کوآرڈینیٹر', 'Coordinator / VP')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Shakeel Farooqui"
                    value={formCoordinatorName}
                    onChange={(e) => setFormCoordinatorName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('समन्वयक मोबाइल', 'کوآرڈینیٹر فون', 'Coordinator Phone')}
                  </label>
                  <input
                    type="text"
                    placeholder="+91 99270 44102"
                    value={formCoordinatorPhone}
                    onChange={(e) => setFormCoordinatorPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Status & Volunteer count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('प्रारंभिक स्वयंसेवक संख्या', 'ابتدائی رضاکار', 'Initial Volunteers Count')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formVolunteers}
                    onChange={(e) => setFormVolunteers(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('इकाई स्थिति (Status)', 'حیثیت', 'Status')}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                  >
                    <option value="active">{tr('सक्रिय इकाई (Active Unit)', 'فعال یونٹ', 'Active Unit')}</option>
                    <option value="in_formation">{tr('गठन प्रक्रियाधीन (In Formation)', 'زیر تشکیل', 'In Formation')}</option>
                  </select>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('मुख्य दायित्व व कार्यक्षेत्र (Jurisdiction & Focus)', 'مقاصد و ذمہ داریاں', 'Jurisdiction & Focus')}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Village outreach, medical camp coordination, member enrollment..."
                  value={formObjectives}
                  onChange={(e) => setFormObjectives(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                >
                  {tr('रद्द करें', 'منسوخ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="mfct-btn-gold px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  {tr('इकाई गठित करें', 'یونٹ تشکیل دیں', 'Form Team Unit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Member Modal */}
      {selectedTeamForMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedTeamForMember(null)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {tr('नया पदाधिकारी नियुक्त करें', 'نیا عہدیدار شامل کریں', 'Appoint Office Bearer')}
            </h3>
            <p className="text-xs text-slate-500 mb-4 truncate">
              {selectedTeamForMember.unitName}
            </p>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
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
                  {tr('पदनाम / दायित्व *', 'عہدہ *', 'Designation / Role *')}
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Youth Coordinator / Relief Incharge"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeamForMember(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                >
                  {tr('रद्द करें', 'منسوخ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="mfct-btn-gold px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  {tr('नियुक्ति दर्ज करें', 'تقرر محفوظ کریں', 'Confirm Appointment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
