import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import { DEMO } from '../config';
import { Brand, DemoBanner, FieldChips, Meta, btnDark, btnLight, card, kicker, ErrorText } from '../portal/ui';
import { fieldLabel, workTypeLabel } from '../data/fields';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Beispiel für die Testansicht
const DEMO_VIEW = {
  phase: 'check',
  order: { code: 'SS-1074', topic: 'Machine Learning zur Absatzprognose', work_type: 'master', field: 'info' },
  author: {
    display_name: 'Dr. Maria Beispiel', qualification: 'Promotion in Wirtschaftsinformatik, 9 Jahre Lehrerfahrung',
    affiliations: 'Hochschule Musterstadt (Lehrauftrag)', bio: 'Schwerpunkt auf empirischen Arbeiten mit Umfragen und Regressionsanalysen.', fields: ['info', 'wiwi'],
  },
};

const Shell = ({ children }) => (
  <div className="min-h-screen bg-[#F7F3ED]">
    {DEMO && <DemoBanner />}
    <header className="max-w-3xl mx-auto px-6 py-6"><Brand /></header>
    <main className="max-w-3xl mx-auto px-6 pb-20">{children}</main>
  </div>
);

const Done = ({ icon: Icon, tone, title, text }) => (
  <div className={`${card} p-10 text-center`}>
    <Icon className={`w-12 h-12 mx-auto mb-4 ${tone}`} />
    <h2 className="font-serif text-3xl text-[#14110F] mb-3">{title}</h2>
    <p className="text-[#14110F]/70 leading-relaxed max-w-lg mx-auto">{text}</p>
  </div>
);

const BestaetigungPage = () => {
  const { token } = useParams();
  const [view, setView] = useState(DEMO ? DEMO_VIEW : null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (DEMO) return;
    try { setView((await axios.get(`${API}/confirm/${token}`)).data); }
    catch (e) { setErr(e?.response?.data?.detail || 'Dieser Link ist nicht gültig.'); }
  }, [token]);
  useEffect(() => { load(); document.title = 'Ihre Anfrage — Silent Script'; }, [load]);

  const act = async (action) => {
    setBusy(true); setErr('');
    try {
      if (DEMO) {
        const next = { accept: 'decide', decline: 'closed', yes: 'matched', no: 'closed' }[action];
        setView({ ...view, phase: next });
      } else {
        setView((await axios.post(`${API}/confirm/${token}`, { action })).data);
      }
    } catch (e) { setErr(e?.response?.data?.detail || 'Etwas ist schiefgelaufen.'); }
    finally { setBusy(false); }
  };

  if (!view) return <Shell>{err ? <Done icon={XCircle} tone="text-[#14110F]/40" title="Link ungültig" text={err} /> : <p className="text-[#14110F]/50">Wird geladen …</p>}</Shell>;

  const { order, author, phase } = view;

  return (
    <Shell>
      <div className={`${kicker} text-[#C1613E] mb-2`}>Ihre Anfrage {order.code}</div>
      <h1 className="font-serif text-4xl text-[#14110F] leading-tight mb-2">{order.topic}</h1>
      <p className="text-[#14110F]/60 mb-10">{workTypeLabel(order.work_type)} · {fieldLabel(order.field)}</p>

      {phase === 'check' && (
        <>
          <p className="text-lg text-[#14110F]/75 leading-relaxed mb-6">
            Für Ihre Arbeit hat sich eine passende Person beworben. <strong>Bitte prüfen Sie, ob Sie diese Person kennen</strong> –
            insbesondere, ob sie Ihr:e Prüfer:in, Betreuer:in oder an Ihrer Hochschule an Ihrer Bewertung beteiligt ist.
          </p>
          <div className={`${card} p-8 mb-8`}>
            <div className={`${kicker} text-[#14110F]/50 mb-2`}>Vorgeschlagene Autor:in</div>
            <div className="font-serif text-3xl text-[#14110F] mb-4">{author.display_name}</div>
            <div className="grid md:grid-cols-2 gap-5 mb-5">
              <Meta label="Qualifikation">{author.qualification}</Meta>
              <Meta label="Lehrt / prüft an">{author.affiliations}</Meta>
            </div>
            {author.bio && <p className="text-sm text-[#14110F]/70 italic mb-5">„{author.bio}“</p>}
            <FieldChips fields={author.fields} />
          </div>
          <ErrorText>{err}</ErrorText>
          <div className="flex flex-wrap gap-3 mt-4">
            <button disabled={busy} onClick={() => act('accept')} className={btnDark}><ShieldCheck className="w-4 h-4" /> Kein Konflikt – Erstgespräch vereinbaren</button>
            <button disabled={busy} onClick={() => act('decline')} className={btnLight}>Ich kenne diese Person / passt nicht</button>
          </div>
          <p className="text-xs text-[#14110F]/50 mt-6">Die Autor:in erhält Ihren Namen und Ihre E-Mail-Adresse erst nach Ihrer Bestätigung.</p>
        </>
      )}

      {phase === 'decide' && (
        <>
          <Done icon={MessageCircle} tone="text-[#C1613E]" title="Danke – das Erstgespräch kann stattfinden"
            text={`${author.display_name} meldet sich per E-Mail bei Ihnen. Lernen Sie sich unverbindlich kennen. Danach teilen Sie uns hier mit, ob Sie zusammenarbeiten möchten.`} />
          <ErrorText>{err}</ErrorText>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button disabled={busy} onClick={() => act('yes')} className={btnDark}><CheckCircle2 className="w-4 h-4" /> Ja, wir möchten zusammenarbeiten</button>
            <button disabled={busy} onClick={() => act('no')} className={btnLight}>Nein, passt nicht</button>
          </div>
        </>
      )}

      {phase === 'waiting' && <Done icon={CheckCircle2} tone="text-[#6B7A3E]" title="Danke für Ihre Rückmeldung" text="Wir warten noch auf die Entscheidung der Autor:in und melden uns bei Ihnen." />}
      {phase === 'matched' && <Done icon={CheckCircle2} tone="text-[#6B7A3E]" title="Es passt!" text={`Sie arbeiten mit ${author.display_name} zusammen. Wir melden uns mit den nächsten Schritten.`} />}
      {phase === 'closed' && <Done icon={XCircle} tone="text-[#14110F]/40" title="Danke für Ihre Rückmeldung" text="Wir suchen eine andere passende Person für Ihre Arbeit und melden uns bei Ihnen." />}
    </Shell>
  );
};

export default BestaetigungPage;
