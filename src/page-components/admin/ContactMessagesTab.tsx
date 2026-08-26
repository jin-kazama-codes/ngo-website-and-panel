'use client';

import React, { useState, useEffect } from 'react';
import { ContactMessage } from '../../types';
import { getContactMessages } from '../../services/contactService';
import { MessageSquare, Calendar, Mail, Phone, User, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';

const MessageRow: React.FC<{ msg: ContactMessage }> = ({ msg }) => {
  const { language } = useLanguage();
  const displayName = useDynamicTranslatedText(msg.name, language);
  const displayMessage = useDynamicTranslatedText(msg.message, language);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs md:text-sm">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {displayName}
          </span>
          {msg.email && (
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {msg.email}
            </span>
          )}
          {msg.phone && (
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {msg.phone}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {displayMessage}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span className="text-slate-900 dark:text-slate-300 font-medium flex items-center gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {new Date(msg.created_at).toLocaleDateString()}
          </span>
          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </td>
    </tr>
  );
};

export const ContactMessagesTab: React.FC = () => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContactMessages()
      .then((data) => setMessages(data))
      .catch((error) => console.error('Failed to fetch contact messages:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div>
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4"><div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                  <th className="px-6 py-4"><div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                  <th className="px-6 py-4"><div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {tr('संपर्क संदेश', 'رابطہ پیغامات', 'Contact Messages')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {tr(
                'वेबसाइट संपर्क फ़ॉर्म के माध्यम से भेजी गई पूछताछ देखें और प्रबंधित करें।',
                'ویب سائٹ کے رابطہ فارم کے ذریعے بھیجی گئی پوچھ گچھ دیکھیں اور ان کا انتظام کریں۔',
                'View and manage inquiries sent through the website contact form.'
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            {tr('कुल संदेश:', 'کل پیغامات:', 'Total Messages:')} {messages.length}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {tr('कोई संदेश नहीं मिला', 'کوئی پیغام نہیں ملا', 'No messages found')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {tr(
                'वर्तमान में प्रदर्शित करने के लिए कोई संपर्क संदेश नहीं है।',
                'فی الحال دکھانے کے لیے کوئی رابطہ پیغام نہیں ہے۔',
                'There are currently no contact messages to display.'
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 min-w-[200px]">{tr('प्रेषक विवरण', 'بھیجنے والے کی تفصیلات', 'Sender Details')}</th>
                  <th className="px-6 py-4 min-w-[300px]">{tr('संदेश', 'پیغام', 'Message')}</th>
                  <th className="px-6 py-4 min-w-[150px]">{tr('प्राप्ति तिथि', 'موصول ہونے کی تاریخ', 'Date Received')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {messages.map((msg) => (
                  <MessageRow key={msg.id} msg={msg} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
