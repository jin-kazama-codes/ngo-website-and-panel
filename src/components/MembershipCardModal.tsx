'use client';

import React, { useState, useEffect } from 'react';
import { User, Donation } from '../types';
import { ShieldCheck, Download, CheckCircle2, QrCode, X, Sparkles, Building2 } from 'lucide-react';
import { getUserById } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';
import { translateCampaignTitle } from '../lib/translateEntity';

interface MembershipCardModalProps {
  user: User;
  onClose: () => void;
}

export const MembershipCardModal: React.FC<MembershipCardModalProps> = ({ user: initialUser, onClose }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [user, setUser] = useState<User>(initialUser);
  const [loading, setLoading] = useState(true);

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
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [initialUser.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div
        className="rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
        style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)' }}
      >
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          style={{ color: 'var(--mfct-text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2"
            style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} />
            {tr('मान्यता प्राप्त डिजिटल एनजीओ कार्ड', 'تصدیق شدہ این جی او کارڈ', 'Recognized Digital NGO Card')}
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--mfct-dark-green)', fontFamily: 'Playfair Display, serif' }}>
            {tr('डिजिटल सदस्यता कार्ड', 'ڈیجیٹل ممبرشپ کارڈ', 'Digital Membership Card')}
          </h3>
          <p className="text-sm" style={{ color: 'var(--mfct-text-muted)' }}>
            {tr('आधिकारिक MFCT समुदाय पहचान पत्र', 'سرکاری MFCT کمیونٹی شناختی کارڈ', 'Official MFCT Community ID')}
          </p>
        </div>

        {/* Digital Card Preview */}
        <div
          className="p-6 rounded-2xl text-white shadow-xl relative overflow-hidden transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0d2017 100%)',
            border: '2px solid rgba(200,168,75,0.4)',
            boxShadow: 'var(--shadow-gold)'
          }}
        >
          {loading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Card Gold Accent */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.15)' }}></div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <img
                src="/mfct-logo.jpeg"
                alt="MFCT"
                className="w-9 h-9 rounded-full object-cover shadow-md border border-[var(--mfct-gold)]"
              />
              <div>
                <h4 className="font-bold text-base tracking-tight text-white leading-none">MFCT</h4>
                <span className="text-[10px] tracking-wider uppercase font-medium" style={{ color: 'rgba(200,168,75,0.8)' }}>
                  {tr('सामुदायिक नेटवर्क', 'کمیونٹی نیٹ ورک', 'Community Network')}
                </span>
              </div>
            </div>

            {user.isPremium ? (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                style={{ background: 'rgba(200,168,75,0.2)', color: 'var(--mfct-gold)', border: '1px solid var(--mfct-gold)' }}
              >
                <Sparkles className="w-3 h-3" /> {tr('प्रीमियम गोल्ड सदस्य', 'پریمیم گولڈ ممبر', 'Premium Gold Member')}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold)', border: '1px solid rgba(200,168,75,0.3)' }}
              >
                <CheckCircle2 className="w-3 h-3" /> {tr('सत्यापित सदस्य', 'تصدیق شدہ ممبر', 'Verified Member')}
              </span>
            )}
          </div>

          <div className="flex items-start gap-4 mb-6 relative z-10">
            <img
              src={user.avatar || 'https://via.placeholder.com/150'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-md"
              style={{ border: '2px solid var(--mfct-gold)' }}
            />
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-lg text-white truncate">{user.name}</h5>
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'rgba(200,168,75,0.85)' }}>
                <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                <span className="truncate">{user.communityName || tr('अनिर्धारित समुदाय', 'نامعلوم کمیونٹی', 'Unassigned Community')}</span>
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{user.city || 'Bareilly'}, {user.state || 'Uttar Pradesh'}</p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs relative z-10" style={{ borderTop: '1px solid rgba(200,168,75,0.25)' }}>
            <div>
              <span className="text-[10px] uppercase block tracking-wider" style={{ color: 'rgba(200,168,75,0.6)' }}>
                {tr('सदस्य आईडी', 'ممبر شناختی نمبر', 'Member ID')}
              </span>
              <span className="font-mono font-bold" style={{ color: 'var(--mfct-gold)' }}>{user.membershipId}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase block tracking-wider" style={{ color: 'rgba(200,168,75,0.6)' }}>
                {tr('सदस्यता तिथि', 'شمولیت کی تاریخ', 'Member Since')}
              </span>
              <span className="font-semibold text-slate-200">{user.joinDate || 'N/A'}</span>
            </div>
            <div className="bg-white p-1 rounded-lg">
              <QrCode className="w-8 h-8" style={{ color: 'var(--mfct-dark-green)' }} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="mfct-btn-gold cursor-pointer flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> {tr('कार्ड डाउनलोड / प्रिंट करें', 'کارڈ ڈاؤن لوڈ / پرنٹ کریں', 'Download / Print ID')}
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer py-3 px-5 rounded-xl font-bold text-xs transition-colors"
            style={{ background: 'var(--mfct-warm-bg-2)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-border)' }}
          >
            {tr('बंद करें', 'بند کریں', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReceiptModalProps {
  donation: Donation;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ donation, onClose }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div
        className="rounded-3xl max-w-xl w-full p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]"
        style={{ background: 'var(--mfct-white)', border: '1px solid var(--mfct-border)', color: 'var(--mfct-text-dark)' }}
      >
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          style={{ color: 'var(--mfct-text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Header */}
        <div className="flex items-center justify-between pb-5 mb-6" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
          <div className="flex items-center gap-3">
            <img
              src="/mfct-logo.jpeg"
              alt="MFCT"
              className="w-10 h-10 rounded-full object-cover shadow-md border border-[var(--mfct-gold)]"
            />
            <div>
              <h3 className="font-bold text-xl leading-tight" style={{ color: 'var(--mfct-dark-green)', fontFamily: 'Playfair Display, serif' }}>MFCT Foundation</h3>
              <p className="text-xs" style={{ color: 'var(--mfct-text-muted)' }}>
                {tr('सेक्शन 8 पंजीकृत एनजीओ | 80G कर छूट', 'رجسٹرڈ این جی او | 80G ٹیکس چھوٹ', 'Regd NGO under Section 8 | 80G Tax Exempted')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className="inline-block px-2.5 py-1 rounded-md text-xs font-bold"
              style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}
            >
              {tr('आधिकारिक रसीद', 'سرکاری رسید', 'OFFICIAL RECEIPT')}
            </span>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--mfct-text-muted)' }}>{donation.receiptNumber}</p>
          </div>
        </div>

        {/* Donation Summary Table */}
        <div className="rounded-2xl p-5 mb-6 text-sm space-y-3" style={{ background: 'var(--mfct-warm-bg)', border: '1px solid var(--mfct-border)' }}>
          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('दानदाता का नाम:', 'عطیہ دہندہ:', 'Donor Name:')}</span>
            <span className="font-semibold" style={{ color: 'var(--mfct-dark-green)' }}>{donation.donorName}</span>
          </div>
          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('अभियान / कारण:', 'فلاحی مہم:', 'Campaign / Cause:')}</span>
            <span className="font-semibold text-right max-w-[280px]" style={{ color: 'var(--mfct-dark-green)' }}>
              {translateCampaignTitle(donation.campaignTitle, language)}
            </span>
          </div>
          <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--mfct-border)' }}>
            <span style={{ color: 'var(--mfct-text-muted)' }}>{tr('दान की श्रेणी:', 'کیٹیگری:', 'Donation Category:')}</span>
            <span
              className="inline-block px-2 py-0.5 rounded font-medium text-xs"
              style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-dark-green)', border: '1px solid rgba(200,168,75,0.3)' }}
            >
              {donation.category}
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
        <div
          className="flex items-center justify-between p-4 rounded-2xl mb-6"
          style={{ background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.3)' }}
        >
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="mfct-btn-gold cursor-pointer flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> {tr('रसीद डाउनलोड / प्रिंट करें (PDF)', 'پی ڈی ایف رسید ڈاؤن لوڈ کریں', 'Download PDF Receipt')}
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer py-3 px-5 rounded-xl font-bold text-xs transition-colors"
            style={{ background: 'var(--mfct-warm-bg-2)', color: 'var(--mfct-dark-green)', border: '1px solid var(--mfct-border)' }}
          >
            {tr('बंद करें', 'بند کریں', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
