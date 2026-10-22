'use client';
import React, { useEffect, useState } from 'react';
import { User, Donation } from '../types';
import { Award, BadgeCheck, Building2, Check, CheckCircle2, Copy, Download, Lock, MapPin, Printer, QrCode, RotateCw, ShieldCheck, X, } from 'lucide-react';
import { getUserById } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';
import { translateCampaignTitle, translateCategory, translateCity } from '../lib/translateEntity';
import { useDynamicTranslatedText } from '../lib/autoTranslate';
interface MembershipCardModalProps {
  user: User;
  onClose: () => void;
}
// ─── Golden Smart Card EMV Chip Vector ─────────────────────────────────────────
const EmvChip: React.FC<{
  className?: string;
}> = ({ className = 'w-10 h-8' }) => (<div className={`${className} relative rounded-md overflow-hidden shadow-inner flex items-center justify-center shrink-0`} style={{
  background: 'linear-gradient(135deg, #fcebb1 0%, #d4af37 40%, #aa8012 70%, #f6de8c 100%)',
  border: '1px solid #997300',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.4)',
}}>

  <svg viewBox="0 0 44 32" className="w-full h-full p-0.5 opacity-80" fill="none" stroke="#7a5c00" strokeWidth="1.2">

    <rect x="1" y="1" width="42" height="30" rx="3" strokeWidth="1.5" />

    <path d="M1 11 H16 V21 H1" />

    <path d="M43 11 H28 V21 H43" />

    <path d="M16 1 V11" />

    <path d="M28 1 V11" />

    <path d="M16 21 V31" />

    <path d="M28 21 V31" />

    <circle cx="22" cy="16" r="4.5" fill="#e6c86e" fillOpacity="0.5" stroke="#7a5c00" strokeWidth="1" />

  </svg>

</div>);
// ─── Holographic Security Seal ────────────────────────────────────────────────
const HologramSeal: React.FC<{
  className?: string;
}> = ({ className = 'w-12 h-12' }) => (<div className={`${className} relative rounded-full p-[1.5px] shrink-0 shadow-lg select-none`} style={{
  background: 'linear-gradient(135deg, #ffd700, #ff80bf, #00d2ff, #7000ff, #ffd700)',
  backgroundSize: '300% 300%',
  boxShadow: '0 0 12px rgba(200, 168, 75, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.6)',
}}>

  <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative overflow-hidden" style={{
    background: 'radial-gradient(circle, #1a4330 0%, #0c2016 100%)',
    border: '1px solid rgba(255, 215, 0, 0.7)',
  }}>

    <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{
      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)',
      animation: 'shimmer 2.5s infinite',
    }} />

    <ShieldCheck className="w-5 h-5 text-amber-300 drop-shadow" />

    <span className="text-[7px] font-black uppercase tracking-tighter text-amber-200 leading-none mt-0.5">

      MFCT SECURE

    </span>

  </div>

</div>);
// ─── Code 128 Realistic Barcode Vector ────────────────────────────────────────
const BarcodeVector: React.FC<{
  code: string;
}> = ({ code }) => (<div className="bg-white/95 rounded-md px-3 py-1.5 shadow-sm text-center">

  <div className="flex items-center justify-center gap-[2px] h-8 overflow-hidden">

    {[1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 1, 4, 1, 2, 3, 2, 1, 1, 3, 2, 1, 4].map((w, i) => (<span key={i} className="inline-block h-full bg-slate-900" style={{ width: `${w * 1.3}px`, opacity: i % 7 === 0 ? 0.35 : 1 }} />))}

  </div>

  <span className="block font-mono text-[10px] tracking-[0.25em] font-bold text-slate-800 mt-0.5">

    *{code || 'MFCT-VERIFIED'}*

  </span>

</div>);
export const MembershipCardModal: React.FC<MembershipCardModalProps> = ({ user: initialUser, onClose }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi')
      return hi;
    if (language === 'ur')
      return ur;
    return en;
  };
  const [user, setUser] = useState<User>(initialUser);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const displayUserName = useDynamicTranslatedText(user.name, language) || user.name;
  const displayCommunity = useDynamicTranslatedText(user.communityName, language) || user.communityName;
  const displayCity = useDynamicTranslatedText(user.city, language) || translateCity(user.city, language);
  // ─── Professional Role Title Formatting ──────────────────────────────────────
  const formatRoleTitle = (rawRole: string, distRole?: string, lang: string = 'en') => {
    const raw = (distRole || rawRole || 'member').trim();
    const key = raw.toLowerCase().replace(/\s+/g, '_');
    const roleMap: Record<string, {
      en: string;
      hi: string;
      ur: string;
    }> = {
      super_admin: { en: 'Chief Executive / Super Admin', hi: 'मुख्य संरक्षक / सुपर एडमिन', ur: 'اعلیٰ منتظم' },
      executive_admin: { en: 'Executive Administrator', hi: 'कार्यकारी प्रशासक', ur: 'ایگزیکٹو ایڈمن' },
      community_admin: { en: 'Community Administrator', hi: 'सामुदायिक प्रशासक', ur: 'کمیونٹی ایڈمنسٹریٹر' },
      district_president: { en: 'District President', hi: 'जिला अध्यक्ष', ur: 'ضلعی صدر' },
      district_coordinator: { en: 'District Coordinator', hi: 'जिला समन्वयक', ur: 'ضلعی کوآرڈینیٹر' },
      district_gen_secretary: { en: 'District General Secretary', hi: 'जिला महासचिव', ur: 'ضلعی جنرل سیکرٹری' },
      district_general_secretary: { en: 'District General Secretary', hi: 'जिला महासचिव', ur: 'ضلعی جنرل سیکرٹری' },
      district_secretary: { en: 'District Secretary', hi: 'जिला सचिव', ur: 'ضلعی سیکرٹری' },
      district_finance_coord: { en: 'District Finance Coordinator', hi: 'जिला वित्त समन्वयक', ur: 'ضلعی فنانس کوآرڈینیٹر' },
      district_finance_coordinator: { en: 'District Finance Coordinator', hi: 'जिला वित्त समन्वयक', ur: 'ضلعی فنانس کوآرڈینیٹر' },
      member: { en: 'Verified Member', hi: 'सत्यापित सदस्य', ur: 'تصدیق شدہ ممبر' },
      volunteer: { en: 'Social Field Volunteer', hi: 'सामाजिक स्वयंसेवक', ur: 'فیلڈ رضاکار' },
      donor: { en: 'Patron Donor', hi: 'संरक्षक दानदाता', ur: 'معاون ڈونر' },
    };
    if (roleMap[key]) {
      return lang === 'hi' ? roleMap[key].hi : lang === 'ur' ? roleMap[key].ur : roleMap[key].en;
    }
    // Clean fallback: capitalize and remove underscores
    return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };
  const roleTitle = formatRoleTitle(user.role, user.districtRole || (user as any).district_role, language);
  const districtOrChapter = user.district || user.communityName?.replace(/community/i, '').trim() || user.city || 'Bareilly';
  useEffect(() => {
    let isMounted = true;
    getUserById(initialUser.id)
      .then((realUser) => {
        if (isMounted && realUser) {
          setUser(realUser);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted)
          setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [initialUser.id]);
  const handleCopyId = () => {
    if (user.membershipId) {
      navigator.clipboard.writeText(user.membershipId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const handlePrint = () => {
    window.print();
  };
  // ─── High-Resolution PNG Canvas Generator ─────────────────────────────────────
  const handleDownloadPNG = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const scale = 2; // High-DPI retina sharpness
      const width = 640 * scale;
      const height = 404 * scale;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx)
        return;
      ctx.scale(scale, scale);
      const cw = 640;
      const ch = 404;
      // Rounded Card Background Clip
      const radius = 24;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(cw - radius, 0);
      ctx.quadraticCurveTo(cw, 0, cw, radius);
      ctx.lineTo(cw, ch - radius);
      ctx.quadraticCurveTo(cw, ch, cw - radius, ch);
      ctx.lineTo(radius, ch);
      ctx.quadraticCurveTo(0, ch, 0, ch - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();
      // Deep Metallic Green Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, cw, ch);
      bgGrad.addColorStop(0, '#092115');
      bgGrad.addColorStop(0.5, '#123825');
      bgGrad.addColorStop(1, '#06170e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, cw, ch);
      // Gold Glow Accents
      const glowGrad = ctx.createRadialGradient(cw - 80, 60, 10, cw - 80, 60, 260);
      glowGrad.addColorStop(0, 'rgba(200, 168, 75, 0.25)');
      glowGrad.addColorStop(1, 'rgba(200, 168, 75, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, cw, ch);
      // Security Guilloche / Pattern Lines
      ctx.strokeStyle = 'rgba(200, 168, 75, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < cw; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.bezierCurveTo(i + 40, 120, i - 40, 280, i + 20, ch);
        ctx.stroke();
      }
      // Outer Gold Foil Border
      ctx.strokeStyle = '#c8a84b';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, cw - 8, ch - 8);
      // Inner Fine Glass Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, cw - 16, ch - 16);
      // Header Section
      ctx.fillStyle = '#fcebb1';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MOHAMMAD FAEEM CHARITABLE TRUST', 80, 38);
      ctx.fillStyle = 'rgba(200, 168, 75, 0.9)';
      ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('GOVT. REGD. TRUST • NITI AAYOG NGO DARPAN • SECTION 8 COMPLIANT', 80, 53);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('● ACTIVE DIGITAL CREDENTIAL', cw - 190, 36);
      // Header Divider Line
      const divGrad = ctx.createLinearGradient(20, 68, cw - 20, 68);
      divGrad.addColorStop(0, 'rgba(200, 168, 75, 0.1)');
      divGrad.addColorStop(0.5, 'rgba(200, 168, 75, 0.8)');
      divGrad.addColorStop(1, 'rgba(200, 168, 75, 0.1)');
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, 68);
      ctx.lineTo(cw - 20, 68);
      ctx.stroke();
      // EMV Chip Representation
      const chipX = 28;
      const chipY = 82;
      const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + 44, chipY + 32);
      chipGrad.addColorStop(0, '#fcebb1');
      chipGrad.addColorStop(0.5, '#d4af37');
      chipGrad.addColorStop(1, '#997300');
      ctx.fillStyle = chipGrad;
      ctx.fillRect(chipX, chipY, 44, 32);
      ctx.strokeStyle = '#5c4500';
      ctx.lineWidth = 1;
      ctx.strokeRect(chipX, chipY, 44, 32);
      // Member Avatar Area
      const photoX = 28;
      const photoY = 126;
      const photoW = 100;
      const photoH = 118;
      ctx.fillStyle = '#0f291c';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.strokeStyle = '#c8a84b';
      ctx.lineWidth = 2;
      ctx.strokeRect(photoX, photoY, photoW, photoH);
      // Photo Fallback / Monogram
      ctx.fillStyle = '#e6c86e';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((user.name || 'M').charAt(0).toUpperCase(), photoX + photoW / 2, photoY + 72);
      ctx.textAlign = 'left';
      // "VERIFIED" banner on photo
      ctx.fillStyle = '#10b981';
      ctx.fillRect(photoX + 2, photoY + photoH - 22, photoW - 4, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ VERIFIED', photoX + photoW / 2, photoY + photoH - 10);
      ctx.textAlign = 'left';
      // Member Details Column
      const detailsX = 146;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(displayUserName, detailsX, 116);
      // Role Pill Background
      ctx.fillStyle = 'rgba(200, 168, 75, 0.18)';
      ctx.strokeStyle = 'rgba(200, 168, 75, 0.5)';
      ctx.lineWidth = 1;
      const roleText = `🛡️ ${roleTitle} • ${districtOrChapter}`;
      ctx.strokeRect(detailsX, 128, 300, 24);
      ctx.fillRect(detailsX, 128, 300, 24);
      ctx.fillStyle = '#fcebb1';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(roleText, detailsX + 10, 144);
      // Location & Community
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`🏛️ Community: ${displayCommunity || 'Central Community'}`, detailsX, 175);
      ctx.fillText(`📍 Region: ${displayCity || 'Bareilly'}, ${user.state || 'Uttar Pradesh'}`, detailsX, 195);
      ctx.fillText(`📞 Contact: ${user.phone ? user.phone.replace(/(\d{5})(\d{5})/, '$1-XXXXX') : '+91-XXXXX-XXXXX'}`, detailsX, 215);
      // Bottom Data Matrix Bar
      const btmY = 270;
      ctx.fillStyle = 'rgba(10, 30, 20, 0.85)';
      ctx.fillRect(16, btmY, cw - 32, 114);
      ctx.strokeStyle = 'rgba(200, 168, 75, 0.35)';
      ctx.strokeRect(16, btmY, cw - 32, 114);
      // Col 1: Member ID
      ctx.fillStyle = 'rgba(200, 168, 75, 0.7)';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('OFFICIAL MEMBER ID', 32, btmY + 28);
      ctx.fillStyle = '#ffd978';
      ctx.font = 'bold 17px monospace';
      ctx.fillText(user.membershipId || 'MFCT-00000', 32, btmY + 52);
      // Col 2: Member Since
      ctx.fillStyle = 'rgba(200, 168, 75, 0.7)';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ISSUED / JOIN DATE', 210, btmY + 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(user.joinDate || 'Active', 210, btmY + 50);
      // Col 3: Validity
      ctx.fillStyle = 'rgba(200, 168, 75, 0.7)';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CARD STATUS & VALIDITY', 360, btmY + 28);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('LIFETIME / ACTIVE', 360, btmY + 50);
      // QR Code Box (Simulated on canvas)
      const qrBoxX = cw - 120;
      const qrBoxY = btmY + 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrBoxX, qrBoxY, 90, 90);
      ctx.strokeStyle = '#c8a84b';
      ctx.strokeRect(qrBoxX, qrBoxY, 90, 90);
      ctx.fillStyle = '#092115';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MFCT-QR', qrBoxX + 45, qrBoxY + 45);
      ctx.fillText('SCAN VERIFY', qrBoxX + 45, qrBoxY + 60);
      ctx.textAlign = 'left';
      // Convert to PNG and download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `MFCT-Membership-Card-${user.membershipId || 'Card'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    catch (e) {
      console.error('Download error:', e);
    }
    finally {
      setDownloading(false);
    }
  };
  return (<>

    {/* ─── PRINT ONLY STYLESHEET ────────────────────────────────────────────── */}

    <style>{`

        @media print {

          body * {

            visibility: hidden !important;

          }

          #mfct-printable-id-card,

          #mfct-printable-id-card * {

            visibility: visible !important;

          }

          #mfct-printable-id-card {

            position: absolute !important;

            left: 0 !important;

            top: 0 !important;

            width: 100% !important;

            margin: 0 !important;

            padding: 20px !important;

            background: white !important;

            display: block !important;

            -webkit-print-color-adjust: exact !important;

            print-color-adjust: exact !important;

          }

          .no-print {

            display: none !important;

          }

        }

      `}</style>

    {/* ─── MODAL OVERLAY ────────────────────────────────────────────────────── */}

    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-[100] animate-fade-in overflow-y-auto no-print">

      <div className="rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all my-auto" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #faf7f0 100%)',
        border: '1.5px solid var(--mfct-border)',
        boxShadow: '0 25px 60px -15px rgba(10, 35, 20, 0.4)',
      }}>

        {/* Close Button */}

        <button onClick={onClose} className="cursor-pointer absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-20" style={{ color: 'var(--mfct-text-muted)' }} title={tr('बंद करें', 'بند کریں', 'Close')}>

          <X className="w-5 h-5" />

        </button>

        {/* Modal Header */}

        <div className="text-center mb-5">

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold mb-2 shadow-sm" style={{
            background: 'linear-gradient(135deg, rgba(200,168,75,0.2) 0%, rgba(200,168,75,0.08) 100%)',
            color: 'var(--mfct-dark-green)',
            border: '1px solid rgba(200,168,75,0.4)',
          }}>

            <Award className="w-3.5 h-3.5 text-amber-600" />

            <span>{tr('मान्यता प्राप्त डिजिटल एनजीओ कार्ड', 'تصدیق شدہ ڈیجیٹل کارڈ', 'Official Verified NGO Credential')}</span>

          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--mfct-dark-green)' }}>

            {tr('आधिकारिक डिजिटल सदस्यता पहचान पत्र', 'سرکاری ڈیجیٹل ممبرشپ شناختی کارڈ', 'Digital Membership Identity Card')}

          </h3>

          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--mfct-text-muted)' }}>

            {tr('मोहम्मद फईम चैरिटेबल ट्रस्ट (MFCT) • केंद्रीय पहचान प्रणाली', 'محمد فہیم چیریٹیبل ٹرسٹ • مرکزی شناختی نظام', 'Mohammad Faeem Charitable Trust (MFCT) • Central Identification')}

          </p>

        </div>

        {/* Card View Switcher Tabs */}

        <div className="flex items-center justify-between mb-4 px-1">

          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-300/60 shadow-inner text-xs font-semibold">

            <button type="button" onClick={() => setIsFlipped(false)} className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${!isFlipped
              ? 'bg-white text-emerald-950 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'}`}>

              <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />

              {tr('कार्ड का सामने (Front)', 'سامنے کا حصہ', 'Card Front')}

            </button>

            <button type="button" onClick={() => setIsFlipped(true)} className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${isFlipped
              ? 'bg-white text-emerald-950 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'}`}>

              <Lock className="w-3.5 h-3.5 text-amber-600" />

              {tr('कार्ड का पीछे (Back)', 'پیچھے کا حصہ', 'Card Back')}

            </button>

          </div>

          <button type="button" onClick={() => setIsFlipped(!isFlipped)} className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition-colors">

            <RotateCw className="w-3.5 h-3.5 text-amber-600" />

            <span>{tr('पलटें (Flip)', 'پلٹیں', 'Flip 3D')}</span>

          </button>

        </div>

        {/* ─── 3D FLIPPABLE ID CARD CONTAINER ─────────────────────────────────── */}

        <div className="w-full relative select-none cursor-pointer" style={{ perspective: '1200px' }} onClick={() => setIsFlipped(!isFlipped)} title={tr('कार्ड पलटने के लिए क्लिक करें', 'کارڈ پلٹنے کے لیے کلک کریں', 'Click to flip card')}>

          <div className="relative w-full rounded-2xl transition-transform duration-700 ease-out" style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '320px',
          }}>

            {/* ─────────────────────────────────────────────────────────────

            FRONT SIDE OF CARD

        ───────────────────────────────────────────────────────────── */}

            <div className="w-full rounded-2xl p-5 text-white shadow-2xl relative overflow-hidden" style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(145deg, #071e13 0%, #113824 55%, #05160d 100%)',
              border: '2px solid rgba(200, 168, 75, 0.65)',
              boxShadow: '0 12px 35px -5px rgba(7, 30, 19, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}>

              {/* Guilloche Security Pattern Background */}

              <div className="absolute inset-0 pointer-events-none opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #c8a84b 1px, transparent 1px), radial-gradient(circle at 0 0, #c8a84b 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }} />

              {/* MFCT Trust Logo Watermark in background */}

              <img src="/mfct-logo.png" alt="" aria-hidden="true" className="absolute -right-8 -bottom-8 w-60 h-60 opacity-[0.06] pointer-events-none filter blur-[0.5px]" />

              {/* Loading state indicator */}

              {loading && (<div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-30">

                <div className="w-7 h-7 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />

              </div>)}

              {/* ── CARD HEADER ── */}

              <div className="flex items-center justify-between pb-3.5 mb-3.5 relative z-10 border-b border-amber-400/25">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-full p-[1.5px] shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #ffd700, #c8a84b, #997828)' }}>

                    <img src="/mfct-logo.png" alt="MFCT" className="w-full h-full rounded-full object-cover bg-emerald-950" />

                  </div>

                  <div>

                    <h4 className="font-black text-sm sm:text-base tracking-wide text-amber-200 leading-tight drop-shadow-sm uppercase">

                      MFCT Foundation

                    </h4>

                    <p className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold text-amber-300/80">

                      {tr('सार्वजनिक चैरिटेबल ट्रस्ट', 'پبلک چیریٹیبل ٹرسٹ', 'Mohammad Faeem Charitable Trust')}

                    </p>

                    <p className="text-[8px] font-medium text-slate-300/70 tracking-tight">

                      Regd. Trust • NITI Aayog NGO Darpan

                    </p>

                  </div>

                </div>

                <HologramSeal className="w-11 h-11" />

              </div>

              {/* ── CARD BODY: Photo + EMV Chip + Credentials ── */}

              <div className="flex items-start gap-4 mb-4 relative z-10">

                {/* Portrait Column */}

                <div className="flex flex-col items-center shrink-0">

                  <div className="w-20 h-24 rounded-xl p-[2px] shadow-lg relative overflow-hidden" style={{
                    background: 'linear-gradient(135deg, #ffd700, #c8a84b 50%, #7a5c00 100%)',
                  }}>

                    {user.avatar ? (<img src={user.avatar} alt={displayUserName} className="w-full h-full rounded-[10px] object-cover bg-emerald-950" />) : (<div className="w-full h-full rounded-[10px] bg-gradient-to-br from-emerald-900 to-emerald-950 flex flex-col items-center justify-center text-amber-200 font-bold text-2xl">

                      {(user.name || 'M').charAt(0).toUpperCase()}

                    </div>)}

                    {/* Photo Verified Ribbon */}

                    <div className="absolute bottom-0 inset-x-0 bg-emerald-600/95 py-0.5 text-center text-[8px] font-bold tracking-wider uppercase text-white shadow-sm">

                      ✓ VERIFIED

                    </div>

                  </div>

                </div>

                {/* Member Details Column */}

                <div className="flex-1 min-w-0 pt-0.5">

                  <div className="flex items-center justify-between gap-2">

                    <EmvChip className="w-9 h-7" />

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">

                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                      ACTIVE

                    </span>

                  </div>

                  <h5 className="font-black text-lg sm:text-xl text-white tracking-tight truncate drop-shadow-sm mt-1.5">

                    {displayUserName}

                  </h5>

                  {/* Role Designation Badge (Fixed formatting) */}

                  <div className="mt-1">

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight shadow-sm" style={{
                      background: 'linear-gradient(135deg, rgba(200,168,75,0.25) 0%, rgba(200,168,75,0.12) 100%)',
                      color: '#fef08a',
                      border: '1px solid rgba(200,168,75,0.45)',
                    }}>

                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />

                      <span className="truncate">{roleTitle}</span>

                    </span>

                  </div>

                  {/* Community / Jurisdiction */}

                  <p className="text-xs flex items-center gap-1.5 mt-1 text-amber-200/90 font-medium truncate">

                    <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />

                    <span className="truncate">

                      {displayCommunity || tr('केंद्रीय समुदाय', 'مرکزی کمیونٹی', 'Central Community')}

                    </span>

                  </p>

                  <p className="text-[11px] flex items-center gap-1 mt-0.5 text-slate-300/80 font-medium truncate">

                    <MapPin className="w-3 h-3 text-amber-400/80 shrink-0" />

                    <span className="truncate">

                      {displayCity || 'Bareilly'}, {user.state || 'Uttar Pradesh'}

                    </span>

                  </p>

                </div>

              </div>

              {/* ── CARD FOOTER: ID + Date + QR ── */}

              <div className="pt-3 flex items-center justify-between text-xs relative z-10 border-t border-amber-400/20" style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.25) 100%)',
              }}>

                <div>

                  <span className="text-[9px] uppercase block tracking-widest font-bold text-amber-400/70">

                    {tr('सदस्य आईडी', 'ممبر آئی ڈی', 'Member ID')}

                  </span>

                  <span className="font-mono font-black text-sm tracking-wider text-amber-300 drop-shadow">

                    {user.membershipId || 'MFCT-00000'}

                  </span>

                </div>

                <div>

                  <span className="text-[9px] uppercase block tracking-widest font-bold text-amber-400/70">

                    {tr('जारी तिथि', 'شمولیت', 'Member Since')}

                  </span>

                  <span className="font-bold text-xs text-slate-200">

                    {user.joinDate || 'N/A'}

                  </span>

                </div>

                <div>

                  <span className="text-[9px] uppercase block tracking-widest font-bold text-amber-400/70">

                    {tr('वैधता', 'معیاد', 'Validity')}

                  </span>

                  <span className="font-bold text-xs text-emerald-300">

                    LIFETIME

                  </span>

                </div>

                <div className="bg-white p-1 rounded-lg shadow-md border border-amber-400/40">

                  <QrCode className="w-8 h-8 text-emerald-950" />

                </div>

              </div>

            </div>

            {/* ─────────────────────────────────────────────────────────────

            BACK SIDE OF CARD (Rotated 180deg)

        ───────────────────────────────────────────────────────────── */}

            <div className="w-full rounded-2xl p-5 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between" style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(145deg, #071e13 0%, #113824 55%, #05160d 100%)',
              border: '2px solid rgba(200, 168, 75, 0.65)',
              boxShadow: '0 12px 35px -5px rgba(7, 30, 19, 0.6)',
            }}>

              {/* Magnetic Stripe */}

              <div className="-mx-5 -mt-5 mb-4 bg-gradient-to-r from-slate-950 via-slate-900 to-black h-10 shadow-inner flex items-center px-4 border-b border-amber-400/30">

                <span className="text-[9px] font-mono tracking-widest text-slate-500">

                  MFCT-SECURE-ENCODED-IDENTITY-MAGNETIC-TRACK

                </span>

              </div>

              {/* Back Content Grid */}

              <div className="space-y-2.5 relative z-10 flex-1">

                {/* Barcode representation */}

                <BarcodeVector code={user.membershipId || 'MFCT-00000'} />

                {/* Terms / Instructions */}

                <div className="p-2.5 rounded-xl text-[9px] leading-relaxed space-y-1" style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(200, 168, 75, 0.2)',
                  color: 'rgba(255, 255, 255, 0.75)',
                }}>

                  <p className="font-bold text-amber-200">

                    {tr('महत्वपूर्ण निर्देश एवं शर्तें:', 'اہم ہدایات و شرائط:', 'TERMS & VERIFICATION CONDITIONS:')}

                  </p>

                  <p>

                    1. {tr('यह कार्ड मोहम्मद फईम चैरिटेबल ट्रस्ट की आधिकारिक संपत्ति है।', 'یہ کارڈ محمد فہیم چیریٹیبل ٹرسٹ کی ملکیت ہے۔', 'This credential remains the property of Mohammad Faeem Charitable Trust.')}

                  </p>

                  <p>

                    2. {tr('कार्ड खोने पर तुरंत हेल्पलाइन 98765-43210 या निकटतम कार्यालय में सूचित करें।', 'کھو جانے کی صورت میں فوری ہیلپ لائن پر مطلع کریں۔', 'If found, please return to MFCT Head Office or report to helpline.')}

                  </p>

                </div>

                {/* Signature & Seal Row */}

                <div className="flex items-center justify-between pt-1">

                  <div>

                    <p className="text-[8px] text-amber-400/80 uppercase font-semibold">

                      {tr('केंद्रीय हेल्पलाइन', 'مرکزی ہیلپ لائن', 'Central Helpline')}

                    </p>

                    <p className="text-[11px] font-mono font-bold text-white">+91 98765 43210</p>

                    <p className="text-[9px] text-slate-300">www.mfct.org</p>

                  </div>

                  <div className="text-right">

                    {/* Authorized Signature graphic */}

                    <div className="font-serif italic font-bold text-sm text-amber-200 tracking-wider">

                      Mohammad Faeem

                    </div>

                    <div className="w-28 h-[1px] bg-amber-400/50 my-0.5 ml-auto" />

                    <p className="text-[8px] uppercase tracking-wider text-slate-300 font-bold">

                      {tr('अधिकृत हस्ताक्षरकर्ता / ट्रस्टी', 'مجاز دستخط کنندہ / ٹرسٹی', 'Authorized Signatory / Trustee')}

                    </p>

                  </div>

                </div>

              </div>

              {/* Footer Micro-stamp */}

              <div className="pt-2 text-[8px] text-center text-amber-200/60 border-t border-amber-400/15 uppercase tracking-wider font-mono">

                Trust Act Reg: MFCT/UP/2024 • 80G & 12A Certified • NGO Darpan: UP/2024/0412891

              </div>

            </div>

          </div>

        </div>

        <p className="text-[11px] text-center mt-2.5 text-slate-500 font-medium">

          💡 {tr('कार्ड को पलटने के लिए उस पर क्लिक करें अथवा "Flip 3D" बटन दबाएं', 'کارڈ پر کلک کر کے یا فلپ بٹن دبا کر دونوں رخ دیکھیں', 'Click on the card or use "Flip 3D" to toggle between Front and Back')}

        </p>

        {/* ─── ACTION BUTTONS ─────────────────────────────────────────────────── */}

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">

          <button type="button" onClick={handleDownloadPNG} disabled={downloading} className="mfct-btn-gold cursor-pointer py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50">

            <Download className="w-4 h-4" />

            <span>{downloading ? tr('तैयार हो रहा है...', 'ڈاؤن لوڈ ہو رہا ہے...', 'Generating PNG...') : tr('कार्ड डाउनलोड (PNG)', 'کارڈ ڈاؤن لوڈ', 'Download PNG')}</span>

          </button>

          <button type="button" onClick={handlePrint} className="cursor-pointer py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm" style={{
            background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #102e20 100%)',
            color: '#fef08a',
            border: '1px solid var(--mfct-gold)',
          }}>

            <Printer className="w-4 h-4 text-amber-300" />

            <span>{tr('प्रिंट करें (Print ID)', 'پرنٹ کریں', 'Print ID Card')}</span>

          </button>

          <button type="button" onClick={handleCopyId} className="cursor-pointer py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors border" style={{
            background: 'var(--mfct-warm-bg-2)',
            color: 'var(--mfct-dark-green)',
            borderColor: 'var(--mfct-border)',
          }}>

            {copied ? (<>

              <Check className="w-4 h-4 text-emerald-600" />

              <span className="text-emerald-700">{tr('कॉपी हो गया!', 'کاپی ہو گیا!', 'Copied ID!')}</span>

            </>) : (<>

              <Copy className="w-4 h-4 text-amber-700" />

              <span>{tr('आईडी कॉपी करें', 'آئی ڈی کاپی کریں', 'Copy ID')}</span>

            </>)}

          </button>

        </div>

        <div className="mt-3 flex justify-center">

          <button type="button" onClick={onClose} className="cursor-pointer text-xs font-semibold px-4 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">

            {tr('बंद करें (Close)', 'بند کریں', 'Close Modal')}

          </button>

        </div>

      </div>

    </div>

    {/* ─── PRINT-ONLY DEDICATED LAYOUT (CR80 Standard Lamination Sheet) ───────── */}

    <div id="mfct-printable-id-card" style={{ display: 'none' }}>

      <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>

        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #1a3c2c', paddingBottom: '12px' }}>

          <h1 style={{ fontSize: '20px', color: '#1a3c2c', margin: '0 0 4px 0', fontWeight: 'bold' }}>

            MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)

          </h1>

          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>

            Govt. Registered Public Charitable Trust | NITI Aayog NGO Darpan | Section 8 / Trust Act

          </p>

          <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>

            Official Membership Identity Card • Print & Cut Guide for Standard CR80 Wallet Badge

          </p>

        </div>

        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>

          {/* Front Card Print Box */}

          <div style={{
            width: '340px',
            height: '215px',
            border: '2px dashed #999',
            padding: '4px',
            borderRadius: '12px',
          }}>

            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #092115 0%, #123825 100%)',
              borderRadius: '10px',
              color: 'white',
              padding: '12px',
              boxSizing: 'border-box',
              border: '1.5px solid #c8a84b',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                  <img src="/mfct-logo.png" style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="" />

                  <div>

                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffd700' }}>MFCT FOUNDATION</div>

                    <div style={{ fontSize: '7px', color: '#ccc' }}>MOHAMMAD FAEEM CHARITABLE TRUST</div>

                  </div>

                </div>

                <div style={{ fontSize: '7px', color: '#34d399', fontWeight: 'bold', border: '1px solid #34d399', padding: '2px 4px', borderRadius: '4px' }}>

                  ACTIVE ID

                </div>

              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '6px 0' }}>

                <div style={{ width: '56px', height: '66px', border: '1px solid #ffd700', borderRadius: '6px', overflow: 'hidden', background: '#0a1d13' }}>

                  {user.avatar ? (<img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />) : (<div style={{ textAlign: 'center', lineHeight: '66px', fontSize: '24px', color: '#ffd700' }}>

                    {(user.name || 'M').charAt(0)}

                  </div>)}

                </div>

                <div style={{ flex: 1, minWidth: 0 }}>

                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{displayUserName}</div>

                  <div style={{ fontSize: '9px', color: '#ffd700', fontWeight: 'bold' }}>{roleTitle} • {districtOrChapter}</div>

                  <div style={{ fontSize: '8px', color: '#ddd' }}>{displayCommunity || 'Central Community'}</div>

                  <div style={{ fontSize: '8px', color: '#aaa' }}>{displayCity || 'Bareilly'}, {user.state || 'UP'}</div>

                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(200,168,75,0.4)', paddingTop: '4px' }}>

                <div>

                  <div style={{ fontSize: '6.5px', color: '#c8a84b' }}>MEMBER ID</div>

                  <div style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffd700' }}>{user.membershipId}</div>

                </div>

                <div>

                  <div style={{ fontSize: '6.5px', color: '#c8a84b' }}>SINCE</div>

                  <div style={{ fontSize: '8px', color: '#fff' }}>{user.joinDate || '2026'}</div>

                </div>

                <div>

                  <div style={{ fontSize: '6.5px', color: '#c8a84b' }}>VALIDITY</div>

                  <div style={{ fontSize: '8px', color: '#34d399', fontWeight: 'bold' }}>LIFETIME</div>

                </div>

              </div>

            </div>

          </div>

          {/* Back Card Print Box */}

          <div style={{
            width: '340px',
            height: '215px',
            border: '2px dashed #999',
            padding: '4px',
            borderRadius: '12px',
          }}>

            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #092115 0%, #123825 100%)',
              borderRadius: '10px',
              color: 'white',
              padding: '12px',
              boxSizing: 'border-box',
              border: '1.5px solid #c8a84b',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>

              <div style={{ background: '#000', height: '18px', margin: '-12px -12px 6px -12px', borderRadius: '8px 8px 0 0' }} />

              <div style={{ fontSize: '8px', color: '#ddd', lineHeight: '1.3' }}>

                <div style={{ fontWeight: 'bold', color: '#ffd700', marginBottom: '2px' }}>OFFICIAL MFCT IDENTITY CARD</div>

                <div>• This card is non-transferable property of Mohammad Faeem Charitable Trust.</div>

                <div>• For authentication, scan the QR code or verify on www.mfct.org.</div>

                <div>• In case of emergency or if found, contact: +91 98765 43210.</div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(200,168,75,0.4)', paddingTop: '4px' }}>

                <div>

                  <div style={{ fontSize: '7px', color: '#aaa' }}>Head Office: Rampur / Bareilly, UP</div>

                  <div style={{ fontSize: '7px', color: '#aaa' }}>Trust Reg: MFCT/UP/2024 • 80G Certified</div>

                </div>

                <div style={{ textAlign: 'right' }}>

                  <div style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '11px', color: '#ffd700' }}>Mohammad Faeem</div>

                  <div style={{ fontSize: '7px', color: '#ddd', borderTop: '1px solid #ffd700', paddingTop: '1px' }}>Authorized Signatory</div>

                </div>

              </div>

            </div>

          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '10px', color: '#666' }}>

          ✂️ Cut along dashed lines to obtain front and back badges. Fold or laminate back-to-back.

        </div>

      </div>

    </div>

  </>);
};

interface ReceiptModalProps {
  donation: Donation;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ donation, onClose }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi')
      return hi;
    if (language === 'ur')
      return ur;
    return en;
  };
  const dynamicDonorName = useDynamicTranslatedText(donation.donorName, language);
  const dynamicCampaignTitle = useDynamicTranslatedText(donation.campaignTitle, language);
  const displayCategory = translateCategory(donation.category, language);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #mfct-printable-receipt,
          #mfct-printable-receipt * {
            visibility: visible !important;
          }
          #mfct-printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            border: 1px solid #d1fae5 !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .receipt-no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="mfct-printable-receipt"
        className="rounded-3xl max-w-xl w-full p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]"
        style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-text-dark)' }}
      >
        <button
          onClick={onClose}
          className="receipt-no-print cursor-pointer absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          style={{ color: 'var(--mfct-text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Header */}
        <div className="flex items-center justify-between pb-5 mb-6" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
          <div className="flex items-center gap-3">
            <img src="/mfct-logo.png" alt="MFCT" className="w-10 h-10 rounded-full object-cover shadow-md border border-[var(--mfct-gold)]" />
            <div>
              <h3 className="font-bold text-xl leading-tight" style={{ color: 'var(--mfct-dark-green)' }}>MFCT Foundation</h3>
              <p className="text-xs" style={{ color: 'var(--mfct-text-muted)' }}>
                {tr('सेक्शन 8 पंजीकृत एनजीओ | 80G कर छूट', 'رجسٹرڈ این جی او | 80G ٹیکس چھوٹ', 'Regd NGO under Section 8 | 80G Tax Exempted')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}>
              {tr('आधिकारिक रसीद', 'سرکاری رسید', 'OFFICIAL RECEIPT')}
            </span>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--mfct-text-muted)' }}>{donation.receiptNumber}</p>
          </div>
        </div>

        {/* Donation Summary Table */}
        <div className="rounded-2xl p-5 mb-6 text-sm space-y-3" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('दानदाता का नाम:', 'عطیہ دہندہ:', 'Donor Name:')}</span>
            <span className="font-semibold" style={{ color: 'var(--mfct-dark-green)' }}>{dynamicDonorName || donation.donorName}</span>
          </div>

          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('अभियान / कारण:', 'فلاحی مہم:', 'Campaign / Cause:')}</span>
            <span className="font-semibold text-right max-w-[280px]" style={{ color: 'var(--mfct-dark-green)' }}>
              {dynamicCampaignTitle || translateCampaignTitle(donation.campaignTitle, language)}
            </span>
          </div>

          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('दान की श्रेणी:', 'کیٹیگری:', 'Donation Category:')}</span>
            <span className="inline-block px-2 py-0.5 rounded font-medium text-xs" style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}>
              {displayCategory}
            </span>
          </div>

          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('भुगतान माध्यम:', 'طریقہ ادائیگی:', 'Payment Method:')}</span>
            <span className="font-semibold text-xs inline-flex items-center gap-1.5" style={{ color: 'var(--mfct-dark-green)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {donation.paymentMethod || (donation as any).payment_method || 'UPI'}
            </span>
          </div>

          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('लेनदेन आईडी:', 'ٹرانزیکشن نمبر:', 'Transaction ID:')}</span>
            <span className="font-mono text-xs" style={{ color: 'var(--mfct-text-muted)' }}>{donation.transactionId}</span>
          </div>

          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('बैंक यूटीआर संख्या:', 'بینک UTR نمبر:', 'Bank UTR Number:')}</span>
            <span className="font-mono text-xs" style={{ color: 'var(--mfct-text-muted)' }}>{donation.utrNumber}</span>
          </div>

          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('भुगतान तिथि:', 'تاریخ:', 'Payment Date:')}</span>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{donation.date}</span>
          </div>

          <div className="flex justify-between pt-2 text-base">
            <span className="font-bold" style={{ color: 'var(--mfct-dark-green)' }}>{tr('कुल दान राशि:', 'کل عطیہ رقم:', 'Total Donated Amount:')}</span>
            <span className="font-bold text-xl" style={{ color: 'var(--mfct-dark-green)' }}>₹{donation.amountINR.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Verification Stamp */}
        <div className="flex items-center justify-between p-4 rounded-2xl mb-6" style={{ background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.3)' }}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--mfct-gold)' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--mfct-dark-green)' }}>
                {tr('ऑडिट एवं सत्यापन पूर्ण', 'آڈٹ اور تصدیق مکمل', 'Audit & Verification Complete')}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--mfct-text-muted)' }}>
                {tr('कार्यकारी टीम व बैंक एस्क्रो द्वारा सत्यापित', 'ایگزیکٹو ٹیم و بینک اسکرو سے تصدیق شدہ', 'Verified by Executive Team & Bank Escrow')}
              </p>
            </div>
          </div>
          <div className="text-right text-[10px]" style={{ color: 'var(--mfct-text-muted)' }}>
            <span className="font-serif italic font-bold text-xs block" style={{ color: 'var(--mfct-dark-green)' }}>MFCT Audit Seal</span>
            <span>{tr('डिजिटल रूप से हस्ताक्षरित', 'ڈیجیٹل تصدیق شدہ', 'Digitally Signed')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 receipt-no-print">
          <button onClick={() => window.print()} className="mfct-btn-gold cursor-pointer flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> {tr('रसीद डाउनलोड / प्रिंट करें (PDF)', 'پی ڈی ایف رسید ڈاؤن لوڈ کریں', 'Download PDF Receipt')}
          </button>
          <button onClick={onClose} className="cursor-pointer py-3 px-5 rounded-xl font-bold text-xs transition-colors" style={{ background: 'var(--mfct-warm-bg-2)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-border)' }}>
            {tr('बंद करें', 'بند کریں', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
