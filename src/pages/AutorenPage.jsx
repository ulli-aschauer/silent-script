import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Lock, Send, CheckCircle2, Mail, User, ShieldCheck, Briefcase, Clock, History, Inbox } from 'lucide-react';
import { DEMO } from '../config';
import { authorApi, TOKEN_KEY, errorText } from '../portal/api';
import {
  PortalHeader, Brand, DemoBanner, Toggle, FieldPicker, Stat, OrderHead, OrderFacts, Meta,
  Badge, APP_STATUS, Empty, ErrorText, inputCls, btnDark, btnLight, card, kicker, euro, fmtDate, fullName,
} from '../portal/ui';
import { fieldLabel, workTypeLabel } from '../data/fields';

// =====================================================================
// Anmeldung & Registrierung
// =====================================================================

const STEPS = [
  ['Registrieren', 'Profil mit Fachbereichen anlegen. Unser Team prüft und schaltet frei.'],
  ['Passende Aufträge', 'Sie sehen offene Aufträge in Ihren Fachbereichen – auf Wunsch auch per E-Mail.'],
  ['Bewerben', 'Sie entscheiden selbst, ob Sie sich mit dem Thema auskennen.'],
  ['Erstgespräch', 'Der Kunde prüft vorab Ihr Profil (z.B. dass Sie nicht sein Prüfer sind). Danach lernen Sie sich kennen.'],
];

const Login = ({ onDone, switchTo }) => {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { onDone(await authorApi.login(f.email, f.password)); }
    catch (e2) { setErr(errorText(e2, 'Anmeldung fehlgeschlagen')); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className={`${card} w-full max-w-md p-10`}>
      <Lock className="w-6 h-6 text-[#C1613E] mb-4" />
      <h1 className="font-serif text-3xl text-[#14110F] mb-2">Autoren-Login</h1>
      <p className="text-sm text-[#14110F]/60 mb-6">Melden Sie sich mit Ihrer E-Mail-Adresse an.</p>
      <input required type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="E-Mail" className={`${inputCls} mb-4`} />
      <input required type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="Passwort" className={`${inputCls} mb-6`} />
      <div className="mb-4"><ErrorText>{err}</ErrorText></div>
      <button disabled={busy} className={`${btnDark} w-full`}>{busy ? 'Anmelden …' : 'Anmelden'}</button>
      <p className="mt-6 text-sm text-[#14110F]/60 text-center">
        Noch kein Konto? <button type="button" onClick={switchTo} className="text-[#C1613E] underline">Jetzt registrieren</button>
      </p>
    </form>
  );
};

const Register = ({ onDone, switchTo }) => {
  const [f, setF] = useState({
    display_name: '', title: '', email: '', password: '', qualification: '',
    fields: [], keywords: '', affiliations: '', bio: '', confirm: false,
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (f.fields.length === 0) { setErr('Bitte mindestens einen Fachbereich wählen.'); return; }
    setBusy(true); setErr('');
    try { onDone(await authorApi.register(f)); }
    catch (e2) { setErr(errorText(e2, 'Registrierung fehlgeschlagen')); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className={`${card} w-full p-8 md:p-10 space-y-6`}>
      <div>
        <User className="w-6 h-6 text-[#C1613E] mb-4" />
        <h1 className="font-serif text-3xl text-[#14110F] mb-2">Als Autor:in registrieren</h1>
        <p className="text-sm text-[#14110F]/60">Nach der Prüfung durch unser Team sehen Sie passende Aufträge.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <input value={f.title} onChange={set('title')} placeholder="Titel (z.B. Dr.)" className={inputCls} />
        <input required value={f.display_name} onChange={set('display_name')} placeholder="Vor- und Nachname" className={`${inputCls} md:col-span-2`} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <input required type="email" autoComplete="email" value={f.email} onChange={set('email')} placeholder="E-Mail" className={inputCls} />
        <input required type="password" autoComplete="new-password" minLength={8} value={f.password} onChange={set('password')} placeholder="Passwort (mind. 8 Zeichen)" className={inputCls} />
      </div>
      <input required value={f.qualification} onChange={set('qualification')} placeholder="Höchster Abschluss / Qualifikation (z.B. Promotion in BWL)" className={inputCls} />

      <div>
        <div className={`${kicker} text-[#14110F]/60 mb-3`}>Ihre Fachbereiche *</div>
        <FieldPicker value={f.fields} onChange={(fields) => setF({ ...f, fields })} />
      </div>
      <input value={f.keywords} onChange={set('keywords')} placeholder="Schwerpunkte / Stichworte (z.B. Digitalisierung, KI, Steuerrecht)" className={inputCls} />
      <div>
        <input value={f.affiliations} onChange={set('affiliations')} placeholder="Hochschulen, an denen Sie lehren oder prüfen" className={inputCls} />
        <p className="text-xs text-[#14110F]/50 mt-2">Wird dem Kunden vor dem Erstgespräch gezeigt, damit z.B. ausgeschlossen ist, dass Sie sein:e Prüfer:in sind.</p>
      </div>
      <textarea rows={3} value={f.bio} onChange={set('bio')} placeholder="Kurzprofil (optional)" className={`${inputCls} resize-none`} />

      <label className="flex items-start gap-3 text-sm text-[#14110F]/75 cursor-pointer">
        <input type="checkbox" required checked={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.checked })} className="mt-1" />
        Ich bestätige, dass meine Angaben wahrheitsgemäß sind, und behandle alle Auftragsdaten vertraulich.
      </label>

      <ErrorText>{err}</ErrorText>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button disabled={busy} className={btnDark}>{busy ? 'Wird gesendet …' : 'Registrieren'}</button>
        <button type="button" onClick={switchTo} className="text-sm text-[#14110F]/60 hover:text-[#C1613E]">Bereits registriert? Anmelden</button>
      </div>
    </form>
  );
};

const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      {DEMO && <DemoBanner />}
      <header className="max-w-[1400px] mx-auto px-6 py-6"><Brand area="Autorenportal" /></header>
      <div className="max-w-[1400px] mx-auto px-6 pb-20 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 lg:pt-10">
          <div className={`${kicker} text-[#C1613E] mb-3`}>Für Autor:innen</div>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight text-[#14110F] mb-6">Aufträge, die zu Ihnen passen.</h2>
          <p className="text-lg text-[#14110F]/70 leading-relaxed mb-10">Sie entscheiden, woran Sie arbeiten – und wann. Kundendaten bleiben bis zum Erstgespräch anonym.</p>
          {DEMO && <p className="mb-8 text-sm text-[#C1613E]">Testansicht: Geben Sie beliebige Daten ein, um das Portal mit Beispieldaten anzusehen.</p>}
          <ol className="space-y-6">
            {STEPS.map(([h, p], i) => (
              <li key={h} className="flex gap-4">
                <span className="font-serif text-2xl text-[#C1613E] w-8 shrink-0">0{i + 1}</span>
                <div>
                  <div className="font-serif text-lg text-[#14110F]">{h}</div>
                  <div className="text-sm text-[#14110F]/65 leading-relaxed">{p}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-7 flex justify-center">
          {mode === 'login'
            ? <Login onDone={onLogin} switchTo={() => setMode('register')} />
            : <Register onDone={onLogin} switchTo={() => setMode('login')} />}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// Dashboard
// =====================================================================

const OpenOrders = ({ items, pending, onApply }) => {
  const [openId, setOpenId] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (pending) {
    return (
      <Empty>
        <ShieldCheck className="w-8 h-8 mx-auto mb-3 text-[#C1613E]" />
        <div className="font-serif text-xl text-[#14110F] mb-1">Ihr Konto wird geprüft</div>
        Sobald unser Team Sie freigeschaltet hat, sehen Sie hier passende Aufträge. Sie erhalten dann eine E-Mail.
      </Empty>
    );
  }
  if (items.length === 0) return <Empty>Aktuell keine offenen Aufträge in Ihren Fachbereichen. Wir benachrichtigen Sie, sobald etwas Passendes eingeht.</Empty>;

  const submit = async (id) => {
    setBusy(true); setErr('');
    try { await onApply(id, note); setOpenId(null); setNote(''); }
    catch (e) { setErr(errorText(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((o) => (
        <article key={o.id} className={`${card} p-6 hover:border-[#14110F] transition-colors`}>
          <OrderHead o={o} right={<div className="text-xs text-[#14110F]/50 mt-1">{fmtDate(o.created_at)}</div>} />
          <OrderFacts o={o} />
          {o.message && <p className="text-sm text-[#14110F]/70 mb-4 italic">„{o.message}“</p>}
          {openId === o.id ? (
            <div className="space-y-3">
              <textarea autoFocus rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Kurz: Warum passen Sie zu diesem Thema? (für unser Team)" className={`${inputCls} resize-none`} />
              <ErrorText>{err}</ErrorText>
              <div className="flex gap-3">
                <button onClick={() => submit(o.id)} disabled={busy} className={btnDark}><Send className="w-4 h-4" /> {busy ? 'Wird gesendet …' : 'Bewerbung senden'}</button>
                <button onClick={() => { setOpenId(null); setErr(''); }} className={btnLight}>Abbrechen</button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setOpenId(o.id); setNote(''); setErr(''); }} className={`${btnDark} w-full`}>Auf diesen Auftrag bewerben</button>
          )}
        </article>
      ))}
    </div>
  );
};

const PIPELINE = ['applied', 'proposed', 'meeting'];
const Steps = ({ status }) => {
  const idx = PIPELINE.indexOf(status);
  const labels = ['Beworben', 'Kunde prüft Profil', 'Erstgespräch'];
  return (
    <div className="flex items-center gap-2 mb-4">
      {labels.map((l, i) => (
        <React.Fragment key={l}>
          <span className={`text-[11px] ${i <= idx ? 'text-[#14110F]' : 'text-[#14110F]/35'}`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${i < idx ? 'bg-[#6B7A3E]' : i === idx ? 'bg-[#C1613E]' : 'bg-[#14110F]/15'}`} />{l}
          </span>
          {i < labels.length - 1 && <span className="flex-1 h-px bg-[#14110F]/15" />}
        </React.Fragment>
      ))}
    </div>
  );
};

const Applications = ({ items, onWithdraw, onDecide }) => {
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState('');
  if (items.length === 0) return <Empty>Sie haben sich noch auf keinen Auftrag beworben.</Empty>;
  const act = async (id, fn) => {
    setBusy(id); setErr('');
    try { await fn(); } catch (e) { setErr(errorText(e)); } finally { setBusy(null); }
  };
  const active = items.filter((a) => PIPELINE.includes(a.status));
  const closed = items.filter((a) => !PIPELINE.includes(a.status));
  return (
    <div className="space-y-4">
      <ErrorText>{err}</ErrorText>
      {active.map((a) => (
        <article key={a.id} className={`${card} p-6`}>
          <OrderHead o={a.order} right={<div className="mt-2"><Badge status={a.status} map={APP_STATUS} /></div>} />
          <Steps status={a.status} />
          <OrderFacts o={a.order} />
          {a.status === 'applied' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-[#14110F]/60">Unser Team prüft die Bewerbungen und stellt dem Kunden eine passende Person vor.</span>
              <button disabled={busy === a.id} onClick={() => act(a.id, () => onWithdraw(a.id))} className={btnLight}>Zurückziehen</button>
            </div>
          )}
          {a.status === 'proposed' && (
            <p className="text-sm text-[#14110F]/70">Der Kunde sieht gerade Ihr Profil und prüft, ob ein Interessenkonflikt besteht (z.B. Prüfer:in). Danach erhalten Sie die Kontaktdaten.</p>
          )}
          {a.status === 'meeting' && (
            <div className="space-y-4">
              <div className="p-4 rounded-sm bg-[#F7F3ED] border border-[#6B7A3E]/30">
                <div className={`${kicker} text-[#6B7A3E] mb-2`}>Kontakt für das Erstgespräch</div>
                <div className="font-serif text-lg text-[#14110F]">{a.customer?.name}</div>
                <a href={`mailto:${a.customer?.email}`} className="text-sm text-[#C1613E] inline-flex items-center gap-1.5"><Mail className="w-4 h-4" />{a.customer?.email}</a>
              </div>
              {a.author_decision ? (
                <p className="text-sm text-[#14110F]/70">Ihre Entscheidung: <strong>{a.author_decision === 'yes' ? 'Zusammenarbeit zugesagt' : 'abgesagt'}</strong>. {a.customer_decision ? '' : 'Wir warten noch auf die Entscheidung des Kunden.'}</p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-[#14110F]/70 mr-2">Nach dem Gespräch: Passt es?</span>
                  <button disabled={busy === a.id} onClick={() => act(a.id, () => onDecide(a.id, 'yes'))} className={btnDark}><CheckCircle2 className="w-4 h-4" /> Zusammenarbeit zusagen</button>
                  <button disabled={busy === a.id} onClick={() => act(a.id, () => onDecide(a.id, 'no'))} className={btnLight}>Passt nicht</button>
                </div>
              )}
            </div>
          )}
        </article>
      ))}
      {closed.length > 0 && (
        <div>
          <div className={`${kicker} text-[#14110F]/50 mt-8 mb-3`}>Abgeschlossene Bewerbungen</div>
          <div className="space-y-2">
            {closed.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#14110F]/10">
                <div className="text-sm"><span className="font-mono text-xs text-[#14110F]/50 mr-3">{a.order.code}</span>{a.order.topic}</div>
                <Badge status={a.status} map={APP_STATUS} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Current = ({ items }) => {
  if (items.length === 0) return <Empty>Keine laufenden Aufträge.</Empty>;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((o) => (
        <article key={o.id} className={`${card} p-6`}>
          <OrderHead o={o} />
          <OrderFacts o={o} />
          <div className="pt-4 border-t border-[#14110F]/10 flex flex-wrap items-center justify-between gap-2">
            <Meta label="Kunde">{o.customer?.name}</Meta>
            <a href={`mailto:${o.customer?.email}`} className="text-sm text-[#C1613E] inline-flex items-center gap-1.5"><Mail className="w-4 h-4" />{o.customer?.email}</a>
          </div>
        </article>
      ))}
    </div>
  );
};

const HistoryTable = ({ items }) => {
  if (items.length === 0) return <Empty>Noch keine abgeschlossenen Arbeiten.</Empty>;
  return (
    <div className="overflow-x-auto border border-[#14110F]/10 rounded-sm">
      <table className="w-full text-sm">
        <thead className="bg-[#F0EAE0]">
          <tr>{['Abgeschlossen', 'Auftrag', 'Fachbereich', 'Art', 'Thema', 'Seiten', 'Honorar'].map((c) => (
            <th key={c} className={`text-left px-4 py-3 font-medium text-[#14110F]/70 ${kicker}`}>{c}</th>
          ))}</tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id} className="border-t border-[#14110F]/10">
              <td className="px-4 py-3 text-[#14110F]/60 whitespace-nowrap">{fmtDate(o.completed_at)}</td>
              <td className="px-4 py-3 font-mono text-xs">{o.code}</td>
              <td className="px-4 py-3">{fieldLabel(o.field)}</td>
              <td className="px-4 py-3">{workTypeLabel(o.work_type)}</td>
              <td className="px-4 py-3 max-w-[320px]">{o.topic}</td>
              <td className="px-4 py-3">{o.pages}</td>
              <td className="px-4 py-3 whitespace-nowrap">{o.fee_final || o.fee || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Profile = ({ me, onSave }) => {
  const [f, setF] = useState(me);
  const [state, setState] = useState('');
  useEffect(() => setF(me), [me]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setState('saving');
    try {
      await onSave({ display_name: f.display_name, title: f.title, qualification: f.qualification, fields: f.fields, keywords: f.keywords, affiliations: f.affiliations, bio: f.bio });
      setState('ok'); setTimeout(() => setState(''), 3000);
    } catch (e2) { setState(errorText(e2)); }
  };
  return (
    <form onSubmit={save} className={`${card} p-8 space-y-6 max-w-3xl`}>
      <div className="grid md:grid-cols-3 gap-6">
        <label><span className={`${kicker} text-[#14110F]/50`}>Titel</span><input value={f.title || ''} onChange={set('title')} className={inputCls} /></label>
        <label className="md:col-span-2"><span className={`${kicker} text-[#14110F]/50`}>Name</span><input required value={f.display_name} onChange={set('display_name')} className={inputCls} /></label>
      </div>
      <label className="block"><span className={`${kicker} text-[#14110F]/50`}>Qualifikation</span><input required value={f.qualification} onChange={set('qualification')} className={inputCls} /></label>
      <div>
        <div className={`${kicker} text-[#14110F]/50 mb-3`}>Fachbereiche (bestimmen, welche Aufträge Sie sehen)</div>
        <FieldPicker value={f.fields || []} onChange={(fields) => setF({ ...f, fields })} />
      </div>
      <label className="block"><span className={`${kicker} text-[#14110F]/50`}>Schwerpunkte / Stichworte</span><input value={f.keywords || ''} onChange={set('keywords')} className={inputCls} /></label>
      <label className="block"><span className={`${kicker} text-[#14110F]/50`}>Hochschulen, an denen Sie lehren oder prüfen</span><input value={f.affiliations || ''} onChange={set('affiliations')} className={inputCls} /></label>
      <label className="block"><span className={`${kicker} text-[#14110F]/50`}>Kurzprofil</span><textarea rows={3} value={f.bio || ''} onChange={set('bio')} className={`${inputCls} resize-none`} /></label>
      <p className="text-xs text-[#14110F]/50">Name, Qualifikation, Hochschulen und Kurzprofil sieht nur der Kunde, dem wir Sie vorstellen – vor dem Erstgespräch, damit Interessenkonflikte ausgeschlossen werden können.</p>
      <div className="flex items-center gap-4">
        <button disabled={state === 'saving'} className={btnDark}>{state === 'saving' ? 'Speichern …' : 'Profil speichern'}</button>
        {state === 'ok' && <span className="text-sm text-[#6B7A3E]">Gespeichert.</span>}
        {state && !['ok', 'saving'].includes(state) && <ErrorText>{state}</ErrorText>}
      </div>
    </form>
  );
};

const Dashboard = ({ token, onLogout }) => {
  const api = useMemo(() => authorApi.forToken(token), [token]);
  const [d, setD] = useState(null);
  const [tab, setTab] = useState('open');
  const [settingsErr, setSettingsErr] = useState('');

  const handle = useCallback(async (p) => {
    try { setD(await p); }
    catch (e) { if (e?.response?.status === 401) onLogout(); throw e; }
  }, [onLogout]);
  const load = useCallback(() => handle(api.dashboard()).catch(() => {}), [api, handle]);
  useEffect(() => { load(); }, [load]);

  if (!d) return <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center text-[#14110F]/50">Wird geladen …</div>;

  const { me, earnings } = d;
  const pending = me.status !== 'active';
  const activeApps = d.applications.filter((a) => PIPELINE.includes(a.status)).length;

  const setSetting = async (patch) => {
    setSettingsErr('');
    try { await handle(api.updateMe(patch)); } catch (e) { setSettingsErr(errorText(e)); }
  };

  const tabs = [
    ['open', 'Offene Aufträge', d.openOrders.length, Inbox],
    ['apps', 'Bewerbungen', activeApps, Send],
    ['current', 'Laufend', d.current.length, Clock],
    ['history', 'Historie', d.history.length, History],
    ['profile', 'Profil', null, User],
  ];

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      {DEMO && <DemoBanner />}
      <PortalHeader area="Autorenportal" onRefresh={load} onLogout={onLogout}
        right={<span className="text-sm text-[#14110F]/60 hidden md:inline">{fullName(me)}</span>} />

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-7">
            <div className={`${kicker} text-[#C1613E] mb-2`}>Autorenportal</div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#14110F] leading-tight">Willkommen, {fullName(me)}.</h1>
            <p className="text-[#14110F]/60 mt-3">
              Ihre anonyme Kennung: <span className="font-mono text-[#14110F]">{me.alias}</span>
              <span className="mx-2">·</span>
              <FieldInline fields={me.fields} />
            </p>
          </div>
          <div className={`lg:col-span-5 ${card} p-6 space-y-5`}>
            <div className="flex items-center justify-between">
              <div className={`${kicker} text-[#14110F]/50`}>Ihr Status</div>
              <span className={`text-xs px-2.5 py-1 rounded-full ${me.available ? 'bg-[#6B7A3E]/15 text-[#6B7A3E]' : 'bg-[#14110F]/10 text-[#14110F]/60'}`}>
                {me.available ? '● Verfügbar' : '○ Nicht verfügbar'}
              </span>
            </div>
            <Toggle checked={me.available} onChange={(v) => setSetting({ available: v })}
              label="Ich bin verfügbar für neue Aufträge"
              hint="Wenn verfügbar, informieren wir Sie per E-Mail über passende neue Aufträge." />
            <Toggle checked={me.available || me.notify_when_unavailable} disabled={me.available}
              onChange={(v) => setSetting({ notify_when_unavailable: v })}
              label="Trotzdem über neue Aufträge informieren"
              hint="Gilt, wenn Sie nicht verfügbar sind – z.B. um besonders passende Themen nicht zu verpassen." />
            <ErrorText>{settingsErr}</ErrorText>
          </div>
        </div>

        {pending && (
          <div className="mb-8 p-5 rounded-sm border border-[#C1613E]/30 bg-[#C1613E]/5 text-sm text-[#14110F]/80 flex gap-3 items-start">
            <ShieldCheck className="w-5 h-5 text-[#C1613E] shrink-0" />
            {me.status === 'pending'
              ? 'Ihre Registrierung ist eingegangen und wird von unserem Team geprüft. Bis zur Freischaltung können Sie Ihr Profil vervollständigen.'
              : 'Ihr Konto ist derzeit nicht aktiv. Bitte wenden Sie sich an unser Team.'}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Stat label="Verdienst gesamt" value={euro(earnings.total)} accent />
          <Stat label="Laufende Aufträge (Honorar)" value={euro(earnings.pending)} />
          <Stat label="Abgeschlossene Arbeiten" value={earnings.completed} />
          <Stat label="Aktive Bewerbungen" value={activeApps} />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(([id, label, count, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors ${tab === id ? 'bg-[#14110F] text-[#F7F3ED]' : 'text-[#14110F] border border-[#14110F]/20 hover:border-[#14110F]'}`}>
              <Icon className="w-4 h-4" /> {label}{count != null && <span className="opacity-60">({count})</span>}
            </button>
          ))}
        </div>

        {tab === 'open' && <OpenOrders items={d.openOrders} pending={pending} onApply={(id, note) => handle(api.apply(id, note))} />}
        {tab === 'apps' && <Applications items={d.applications} onWithdraw={(id) => handle(api.withdraw(id))} onDecide={(id, v) => handle(api.decide(id, v))} />}
        {tab === 'current' && <Current items={d.current} />}
        {tab === 'history' && <HistoryTable items={d.history} />}
        {tab === 'profile' && <Profile me={me} onSave={(p) => handle(api.updateMe(p))} />}
      </main>
    </div>
  );
};

const FieldInline = ({ fields = [] }) => (
  <span className="inline-flex items-center gap-1.5 align-middle"><Briefcase className="w-4 h-4" />{fields.map((k) => fieldLabel(k)).join(', ')}</span>
);

// =====================================================================

const AutorenPage = () => {
  const [token, setToken] = useState(() => (DEMO ? null : localStorage.getItem(TOKEN_KEY)));
  const login = (t) => { if (!DEMO) localStorage.setItem(TOKEN_KEY, t); setToken(t); window.scrollTo(0, 0); };
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); }, []);
  useEffect(() => { document.title = 'Autorenportal — Silent Script'; }, []);
  if (!token) return <AuthScreen onLogin={login} />;
  return <Dashboard token={token} onLogout={logout} />;
};

export default AutorenPage;
