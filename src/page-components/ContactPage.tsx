'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { submitContactMessage } from '../services/contactService';
import { MembershipBanner } from '../components/MembershipBanner';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
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
      setError(t('contact.send_error', 'Failed to send message. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">{t('contact.page_title', 'Contact MFCT')}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('contact.page_desc', 'Questions about starting a local community or verifying a cause? Our team is available 24/7.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">{t('contact.form_title', 'Send Us a Message Directly')}</h2>

          {submitted ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">{t('contact.success_title', 'Message sent successfully!')}</h3>
              <p className="text-xs text-slate-600">
                {t('contact.success_desc', 'Our support team will contact you at')} <span className="font-bold">{phone}</span> {t('contact.success_within', 'within 2 hours.')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              {error && (
                <p className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded-xl border border-red-200">{error}</p>
              )}


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">{t('contact.name_label', 'Your Full Name')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('contact.name_placeholder', 'e.g. Mohammad Tariq')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">{t('contact.phone_label', 'Mobile Number')}</label>
                  <input
                    type="number"
                    required
                    placeholder={t('contact.phone_placeholder', 'e.g. 1234567890')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">{t('contact.message_label', 'How can we help you?')}</label>
                <textarea
                  rows={4}
                  required
                  placeholder={t('contact.message_placeholder', 'Ask about membership, Zakat compliance, or starting a new community...')}
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
                  <><Send className="w-4 h-4" /> {t('contact.send_btn', 'Send Message')}</>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-extrabold text-lg text-white">{t('contact.emergency_title', 'Emergency Support Contacts')}</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  {/* <span className="text-slate-400 text-[10px] block uppercase">{t('contact.helpline_label', '24/7 Helpline')}</span> */}
                  <span className="font-bold text-white text-sm">+91 82180 17226</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950 border border-emerald-500/30">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  {/* <span className="text-emerald-300 text-[10px] block uppercase font-bold">{t('contact.whatsapp_label', 'Instant WhatsApp Desk')}</span> */}
                  <span className="font-bold text-white text-sm">+91 97569 19430</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">{t('contact.email_label', 'Official Support Email')}</span>
                  <span className="font-bold text-white text-sm">info@mfcttrust.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" /> {t('contact.hq_label', 'Headquarters')}
            </div>
            <p className="text-slate-600 leading-relaxed">
              Village Pipariya, Post Bilwa<br />
              Distt. Bareilly<br />
              Uttar Pradesh - 243202, India
            </p>
          </div>
        </div>
      </div>

      <MembershipBanner />
    </div>
  );
};
