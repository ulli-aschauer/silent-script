import React, { useState } from 'react';
import axios from 'axios';
import { useLang } from '../i18n/LanguageContext';
import SectionKicker from './SectionKicker';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Contact = () => {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [state, setState] = useState('idle'); // idle | sending | ok | err

  const submit = async (e) => {
    e.preventDefault();
    setState('sending');
    try {
      await axios.post(`${API}/inquiries`, { ...form, lang });
      setState('ok');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setState('idle'), 6000);
    } catch (err) {
      console.error(err);
      setState('err');
      setTimeout(() => setState('idle'), 5000);
    }
  };

  const inputCls = 'w-full bg-transparent border-b border-[#14110F]/25 py-4 text-[#14110F] placeholder-[#14110F]/40 focus:outline-none focus:border-[#C1613E] transition-colors';

  return (
    <section id="contact" className="py-24 md:py-32 bg-[#F7F3ED]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <SectionKicker text={t.contact.kicker} />
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] text-[#14110F] mb-6">
              {t.contact.title}
            </h2>
            <p className="text-lg text-[#14110F]/75 leading-relaxed max-w-md">{t.contact.lead}</p>
            <div className="mt-10 space-y-4 text-[#14110F]/70">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#C1613E] mb-1">Email</div>
                <div className="font-serif text-xl">kontakt@silent-script.com</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#C1613E] mb-1">Web</div>
                <div className="font-serif text-xl">www.silent-script.com</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <form onSubmit={submit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder={t.contact.f.name} className={inputCls} />
                <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder={t.contact.f.email} className={inputCls} />
              </div>
              <input required value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder={t.contact.f.subject} className={inputCls} />
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} placeholder={t.contact.f.message} className={inputCls + ' resize-none'} />
              <div className="flex items-center justify-between flex-wrap gap-4">
                <button type="submit" disabled={state === 'sending'} className="group inline-flex items-center gap-3 bg-[#14110F] text-[#F7F3ED] px-8 py-4 rounded-full text-sm tracking-wide hover:bg-[#C1613E] transition-colors disabled:opacity-60">
                  {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  {state === 'sending' ? t.contact.f.sending : t.contact.f.send}
                </button>
                {state === 'ok' && (
                  <div className="flex items-center gap-2 text-[#6B7A3E]">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">{t.contact.f.ok}</span>
                  </div>
                )}
                {state === 'err' && <div className="text-sm text-red-700">{t.contact.f.err}</div>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
