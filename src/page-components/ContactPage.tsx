'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { submitContactMessage } from '../services/contactService';
import { MembershipBanner } from '../components/MembershipBanner';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { isHindi } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitContactMessage({ name, phone, message });
      setSubmitted(true);
    } catch {
      setError(isHindi ? 'संदेश भेजने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">{isHindi ? 'MFCT से संपर्क करें' : 'Get in Touch with MFCT'}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isHindi ? 'स्थानीय समुदाय शुरू करने या किसी कारण को सत्यापित करने के बारे में प्रश्न हैं? हमारी टीम 24/7 उपलब्ध है।' : 'Have questions about starting a local community or verifying a cause? Our team is available 24/7.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">{isHindi ? 'हमें सीधा संदेश भेजें' : 'Send Us a Direct Message'}</h2>

          {submitted ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">{isHindi ? 'संदेश सफलतापूर्वक भेजा गया!' : 'Message Sent Successfully!'}</h3>
              <p className="text-xs text-slate-600">
                {isHindi ? 'हमारी सहायता टीम आपसे' : 'Our support team will contact you at'} <span className="font-bold">{phone}</span> {isHindi ? 'पर 2 घंटे के भीतर संपर्क करेगी।' : 'within 2 hours.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              {error && (
                <p className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded-xl border border-red-200">{error}</p>
              )}


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">{isHindi ? 'आपका पूरा नाम' : 'Your Full Name'}</label>
                  <input
                    type="text"
                    required
                    placeholder={isHindi ? 'उदा. अनन्या दास' : 'e.g. Ananya Das'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">{isHindi ? 'मोबाइल नंबर' : 'Mobile Number'}</label>
                  <input
                    type="number"
                    required
                    placeholder={isHindi ? 'उदा. 1234567890' : 'e.g. 1234567890'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">{isHindi ? 'हम आपकी कैसे मदद कर सकते हैं?' : 'How can we help you?'}</label>
                <textarea
                  rows={4}
                  required
                  placeholder={isHindi ? 'सदस्यता, ज़कात अनुपालन, या नया समुदाय शुरू करने के बारे में पूछें...' : 'Ask about membership, Zakat compliance, or start a new community...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Send className="w-4 h-4" /> {isHindi ? 'संदेश भेजें' : 'Send Message'}</>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-extrabold text-lg text-white">{isHindi ? 'आपातकालीन सहायता संपर्क' : 'Emergency Support Contacts'}</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">{isHindi ? '24/7 टोल-फ्री हॉटलाइन' : '24/7 Toll-Free Hotline'}</span>
                  <span className="font-bold text-white text-sm">+91 1800 200 SEVA (7382)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">{isHindi ? 'आधिकारिक सहायता ईमेल' : 'Official Support Email'}</span>
                  <span className="font-bold text-white text-sm">support@sevasangam.org</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950 border border-emerald-500/30">
                <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-emerald-300 text-[10px] block uppercase font-bold">{isHindi ? 'तत्काल व्हाट्सएप डेस्क' : 'Instant WhatsApp Desk'}</span>
                  <span className="font-bold text-white text-sm">+91 98100 12345</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" /> {isHindi ? 'राष्ट्रीय मुख्यालय' : 'National Headquarters'}
            </div>
            <p className="text-slate-600 leading-relaxed">
              MFCT Community Foundation<br />
              Plot 42, Central Secretariat Institutional Area<br />
              New Delhi - 110001, India
            </p>
          </div>
        </div>
      </div>

      <MembershipBanner />
    </div>
  );
};
