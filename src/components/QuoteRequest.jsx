import React, { useState } from 'react';
import axios from 'axios';
import { useLang } from '../i18n/LanguageContext';
import SectionKicker from './SectionKicker';
import { Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QuoteRequest = ({ prefill }) => {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ name: '', email: '', field: '', pages: '', deadline: '', message: '' });
  const [state, setState] = useState('idle');

  React.useEffect(() => { if (prefill) setForm((f) => ({ ...f, field: prefill })); }, [prefill]);

  const de = lang === 'de';
  const L = {
    kicker: de ? 'Angebot|Unverbindlich. Individuell. In 24 h.' : 'Quote|Non-binding. Individual. In 24 h.',
    title: de ? 'Jetzt unverbindliches Angebot anfordern' : 'Request a non-binding quote',
    lead: de ? 'Füllen Sie die vier Felder aus — wir melden uns innerhalb von 24 Stunden mit einem individuellen Angebot und dem passenden Fachautor.' : 'Fill in the four fields — we reply within 24 hours with an individual quote and the matching expert author.',
    name: de ? 'Ihr Name' : 'Your name',
    email: 'E-Mail',
    field: de ? 'Fachbereich (z.B. Steuerrecht)' : 'Field (e.g. tax law)',
    pages: de ? 'Seitenzahl (ca.)' : 'Pages (approx.)',
    deadline: de ? 'Abgabefrist (z.B. 15.11.2025)' : 'Deadline (e.g. 15/11/2025)',
    message: de ? 'Weitere Details (optional)' : 'Additional details (optional)',
    send: de ? 'Angebot anfordern' : 'Request quote',
    sending: de ? 'Wird gesendet ...' : 'Sending ...',
    ok_title: de ? 'Danke, Ihre Anfrage ist eingegangen.' : 'Thank you, your request has been received.',
    ok_body: de ? 'Wir melden uns innerhalb von 24 Stunden mit einem individuellen Angebot. Diskret — per E-Mail.' : 'We will reply within 24 hours with an individual offer. Discreetly — by email.',
    err: de ? 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.' : 'Something went wrong. Please try again.'
  };

  const submit = async (e) => {
    e.preventDefault();
    setState('sending');
    try {
      await axios.post(`${API}/quotes`, {
        name: form.name,
        email: form.email,
        field: form.field,
        pages: Number(form.pages),
        deadline: form.deadline,
        message: form.message,
        lang
      });
      setState('ok');
      setForm({ name: '', email: '', field: '', pages: '', deadline: '', message: '' });
    } catch (err) {
      console.error(err);
      setState('err');
      setTimeout(() => setState('idle'), 5000);
    }
  };

  const cls = 'w-full bg-transparent border-b border-[#14110F]/25 py-4 text-[#14110F] placeholder-[#14110F]/40 focus:outline-none focus:border-[#C1613E] transition-colors';

  return (
    <section id="angebot" className="py-24 md:py-32 bg-[#F0EAE0] relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <SectionKicker text={L.kicker} />
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] text-[#14110F] mb-6">{L.title}</h2>
            <p className="text-lg text-[#14110F]/75 leading-relaxed max-w-md">{L.lead}</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-[#14110F]/70">
              <Sparkles className="w-4 h-4 text-[#C1613E]" />
              <span>{de ? '380 promovierte Autor:innen — 47 Fachbereiche' : '380 doctoral authors — 47 disciplines'}</span>
            </div>
          </div>
          <div className="lg:col-span-7">
            {state === 'ok' ? (
              <div className="bg-[#F7F3ED] p-10 md:p-14 rounded-sm border border-[#14110F]/10 text-center">
                <CheckCircle2 className="w-14 h-14 text-[#6B7A3E] mx-auto mb-4" />
                <h3 className="font-serif text-3xl text-[#14110F] mb-3">{L.ok_title}</h3>
                <p className="text-[#14110F]/70 leading-relaxed max-w-lg mx-auto">{L.ok_body}</p>
                <button onClick={() => setState('idle')} className="mt-8 text-sm underline text-[#C1613E]">{de ? 'Neue Anfrage senden' : 'Send another request'}</button>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-[#F7F3ED] p-8 md:p-12 rounded-sm border border-[#14110F]/10 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder={L.name} className={cls} />
                  <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder={L.email} className={cls} />
                </div>
                <input required value={form.field} onChange={(e) => setForm({...form, field: e.target.value})} placeholder={L.field} className={cls} />
                <div className="grid md:grid-cols-2 gap-6">
                  <input required type="number" min="1" max="2000" value={form.pages} onChange={(e) => setForm({...form, pages: e.target.value})} placeholder={L.pages} className={cls} />
                  <input required value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} placeholder={L.deadline} className={cls} />
                </div>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} placeholder={L.message} className={cls + ' resize-none'} />
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                  <button type="submit" disabled={state === 'sending'} className="group inline-flex items-center gap-3 bg-[#14110F] text-[#F7F3ED] px-8 py-4 rounded-full text-sm tracking-wide hover:bg-[#C1613E] transition-colors disabled:opacity-60">
                    {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    {state === 'sending' ? L.sending : L.send}
                  </button>
                  {state === 'err' && <div className="text-sm text-red-700">{L.err}</div>}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteRequest;
