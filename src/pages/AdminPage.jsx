import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Lock, Trash2, FileText, Users as UsersIcon, Mail, Copy, Send, CheckCircle2, Ban, RotateCcw } from 'lucide-react';
import { DEMO, DEMO_TEXT } from '../config';
import {
  PortalHeader, FieldChips, Meta, Badge, APP_STATUS, ORDER_STATUS, Empty, ErrorText,
  inputCls, btnDark, btnLight, card, kicker, fmtDateTime, fullName,
} from '../portal/ui';
import { fieldLabel, workTypeLabel } from '../data/fields';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = 'ss_admin_token';
const err = (e) => e?.response?.data?.detail || 'Fehler';

const Login = ({ onLogin }) => {
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (DEMO) { setMsg(DEMO_TEXT); return; }
    setBusy(true); setMsg('');
    try {
      const { data } = await axios.post(`${API}/auth/admin/login`, { password: pw });
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch { setMsg('Falsches Passwort'); }
    finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED] px-6">
      <form onSubmit={submit} className={`${card} w-full max-w-sm p-10`}>
        <Lock className="w-6 h-6 text-[#C1613E] mb-4" />
        <h1 className="font-serif text-3xl text-[#14110F] mb-2">Admin Login</h1>
        <p className="text-sm text-[#14110F]/60 mb-6">Silent Script Dashboard</p>
        <input autoFocus type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Passwort" className={`${inputCls} mb-6`} />
        <div className="mb-4"><ErrorText>{msg}</ErrorText></div>
        <button disabled={busy} className={`${btnDark} w-full`}>{busy ? 'Anmelden …' : 'Anmelden'}</button>
      </form>
    </div>
  );
};

const CopyLink = ({ href }) => {
  const [done, setDone] = useState(false);
  const full = href.startsWith('http') ? href : window.location.origin + href;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-[#14110F]/50">Link für den Kunden:</span>
      <a href={full} target="_blank" rel="noreferrer" className="font-mono text-[#C1613E] underline break-all">{full}</a>
      <button type="button" onClick={() => { navigator.clipboard?.writeText(full); setDone(true); setTimeout(() => setDone(false), 2000); }}
        className="inline-flex items-center gap-1 text-[#14110F]/60 hover:text-[#C1613E]"><Copy className="w-3.5 h-3.5" />{done ? 'Kopiert' : 'Kopieren'}</button>
    </div>
  );
};

// ---------------------------------------------------------------------

const OrderCard = ({ o, c, reload }) => {
  const [fee, setFee] = useState(o.fee || '');
  const [feeFinal, setFeeFinal] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => setFee(o.fee || ''), [o.fee]);

  const run = async (fn) => {
    setMsg('');
    try { await fn(); await reload(); } catch (e) { setMsg(err(e)); }
  };
  const patch = (body) => run(() => c.patch(`/admin/orders/${o.id}`, body));
  const apps = o.applications;
  const openApps = apps.filter((a) => a.status === 'applied');

  return (
    <article className={`${card} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className={`${kicker} text-[#C1613E]`}>{fieldLabel(o.field)} · {workTypeLabel(o.work_type)}</div>
          <div className="font-serif text-2xl text-[#14110F] mt-1">{o.topic}</div>
          <div className="text-xs text-[#14110F]/50 mt-1"><span className="font-mono">{o.code}</span> · eingegangen {fmtDateTime(o.created_at)}</div>
        </div>
        <Badge status={o.status} map={ORDER_STATUS} />
      </div>

      <div className="grid md:grid-cols-5 gap-4 mb-4">
        <Meta label="Kunde">{o.name}</Meta>
        <Meta label="E-Mail"><a className="text-[#C1613E]" href={`mailto:${o.email}`}>{o.email}</a></Meta>
        <Meta label="Umfang">{o.pages} Seiten</Meta>
        <Meta label="Frist">{o.deadline}</Meta>
        <Meta label="Autor:in">{o.author ? `${o.author.display_name} (${o.author.alias})` : ''}</Meta>
      </div>
      {o.message && <p className="text-sm text-[#14110F]/70 italic mb-4">„{o.message}“</p>}

      <div className="flex flex-wrap items-end gap-3 mb-2">
        <label className="w-44"><span className={`${kicker} text-[#14110F]/50`}>Honorar Autor:in</span>
          <input value={fee} onChange={(e) => setFee(e.target.value)} placeholder="z.B. 1.200 €" className={inputCls} /></label>
        {fee !== (o.fee || '') && <button onClick={() => patch({ fee })} className={btnLight}>Speichern</button>}
        {o.status === 'in_progress' && (
          <>
            <label className="w-44 ml-auto"><span className={`${kicker} text-[#14110F]/50`}>Endhonorar (optional)</span>
              <input value={feeFinal} onChange={(e) => setFeeFinal(e.target.value)} placeholder={o.fee || ''} className={inputCls} /></label>
            <button onClick={() => patch({ status: 'completed', fee_final: feeFinal })} className={btnDark}><CheckCircle2 className="w-4 h-4" /> Als abgeschlossen markieren</button>
          </>
        )}
      </div>
      <ErrorText>{msg}</ErrorText>

      <div className="mt-5 pt-5 border-t border-[#14110F]/10">
        <div className={`${kicker} text-[#14110F]/50 mb-3`}>Bewerbungen ({apps.length}){o.status === 'open' && openApps.length > 0 ? ' – wählen Sie eine Person, die dem Kunden vorgestellt wird' : ''}</div>
        {apps.length === 0 && <p className="text-sm text-[#14110F]/50">Noch keine Bewerbungen.</p>}
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="p-4 bg-[#F7F3ED] rounded-sm border border-[#14110F]/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-serif text-lg text-[#14110F]">{a.author ? fullName(a.author) : 'Gelöschtes Konto'} <span className="font-mono text-xs text-[#14110F]/50">{a.author?.alias}</span></div>
                  <div className="text-sm text-[#14110F]/65">{a.author?.qualification}{a.author?.affiliations ? ` · lehrt/prüft an: ${a.author.affiliations}` : ''}</div>
                  {a.note && <p className="text-sm text-[#14110F]/75 italic mt-1">„{a.note}“</p>}
                </div>
                <Badge status={a.status} map={APP_STATUS} />
              </div>
              {a.status === 'meeting' && (
                <div className="text-xs text-[#14110F]/60 mt-2">
                  Entscheidung Autor:in: <strong>{a.author_decision ? (a.author_decision === 'yes' ? 'Ja' : 'Nein') : 'offen'}</strong> · Kunde: <strong>{a.customer_decision ? (a.customer_decision === 'yes' ? 'Ja' : 'Nein') : 'offen'}</strong>
                </div>
              )}
              {a.status === 'applied' && o.status === 'open' && (
                <button onClick={() => run(() => c.post(`/admin/applications/${a.id}/propose`))} className={`${btnDark} mt-3`}><Send className="w-4 h-4" /> Dem Kunden vorstellen</button>
              )}
              {['proposed', 'meeting'].includes(a.status) && a.confirm_url && <div className="mt-3"><CopyLink href={a.confirm_url} /></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-sm">
        {['open', 'proposed', 'meeting', 'in_progress'].includes(o.status) && (
          <button onClick={() => window.confirm('Auftrag stornieren?') && patch({ status: 'cancelled' })} className="text-[#14110F]/50 hover:text-red-700 inline-flex items-center gap-1"><Ban className="w-4 h-4" /> Stornieren</button>
        )}
        {o.status === 'cancelled' && (
          <button onClick={() => patch({ status: 'open' })} className="text-[#14110F]/50 hover:text-[#C1613E] inline-flex items-center gap-1"><RotateCcw className="w-4 h-4" /> Wieder öffnen</button>
        )}
        <button onClick={() => window.confirm('Auftrag endgültig löschen?') && run(() => c.delete(`/admin/orders/${o.id}`))} className="text-[#14110F]/50 hover:text-red-700 inline-flex items-center gap-1"><Trash2 className="w-4 h-4" /> Löschen</button>
      </div>
    </article>
  );
};

const AUTHOR_STATUS = {
  pending: { label: 'Wartet auf Freischaltung', tone: 'accent' },
  active: { label: 'Aktiv', tone: 'green' },
  blocked: { label: 'Gesperrt', tone: 'muted' },
};

const AuthorCard = ({ a, c, reload }) => {
  const [msg, setMsg] = useState('');
  const run = async (fn) => { setMsg(''); try { await fn(); await reload(); } catch (e) { setMsg(err(e)); } };
  const setStatus = (status) => run(() => c.patch(`/admin/authors/${a.id}`, { status }));
  return (
    <article className={`${card} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-serif text-xl text-[#14110F]">{fullName(a)} <span className="font-mono text-xs text-[#14110F]/50">{a.alias}</span></div>
          <a href={`mailto:${a.email}`} className="text-sm text-[#C1613E]">{a.email}</a>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge status={a.status} map={AUTHOR_STATUS} />
          <span className="text-xs text-[#14110F]/50">{a.available ? '● verfügbar' : '○ nicht verfügbar'}{!a.available && a.notify_when_unavailable ? ' · will informiert werden' : ''}</span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-3">
        <Meta label="Qualifikation">{a.qualification}</Meta>
        <Meta label="Lehrt / prüft an">{a.affiliations}</Meta>
        <Meta label="Schwerpunkte">{a.keywords}</Meta>
        <Meta label="Registriert">{fmtDateTime(a.created_at)}</Meta>
      </div>
      {a.bio && <p className="text-sm text-[#14110F]/70 italic mb-3">„{a.bio}“</p>}
      <FieldChips fields={a.fields} />
      <ErrorText>{msg}</ErrorText>
      <div className="mt-4 flex flex-wrap gap-3">
        {a.status !== 'active' && <button onClick={() => setStatus('active')} className={btnDark}><CheckCircle2 className="w-4 h-4" /> Freischalten</button>}
        {a.status === 'active' && <button onClick={() => setStatus('blocked')} className={btnLight}><Ban className="w-4 h-4" /> Sperren</button>}
        <button onClick={() => window.confirm(`${a.display_name} endgültig löschen?`) && run(() => c.delete(`/admin/authors/${a.id}`))} className="text-sm text-[#14110F]/50 hover:text-red-700 inline-flex items-center gap-1"><Trash2 className="w-4 h-4" /> Löschen</button>
      </div>
    </article>
  );
};

const ORDER_FILTERS = [
  ['active', 'Aktiv', (o) => ['open', 'proposed', 'meeting', 'in_progress'].includes(o.status)],
  ['completed', 'Abgeschlossen', (o) => o.status === 'completed'],
  ['cancelled', 'Storniert', (o) => o.status === 'cancelled'],
  ['all', 'Alle', () => true],
];

const Dashboard = ({ token, onLogout }) => {
  const c = useMemo(() => axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } }), [token]);
  const [data, setData] = useState({ orders: [], authors: [], inquiries: [] });
  const [tab, setTab] = useState('orders');
  const [filter, setFilter] = useState('active');

  const load = useCallback(async () => {
    try { setData((await c.get('/admin/overview')).data); }
    catch (e) { if (e?.response?.status === 401) onLogout(); }
  }, [c, onLogout]);
  useEffect(() => { load(); document.title = 'Admin — Silent Script'; }, [load]);

  const pendingAuthors = data.authors.filter((a) => a.status === 'pending').length;
  const shownOrders = data.orders.filter(ORDER_FILTERS.find((f) => f[0] === filter)[2]);
  const authorsSorted = [...data.authors].sort((x, y) => (x.status === 'pending' ? -1 : 0) - (y.status === 'pending' ? -1 : 0));

  const tabBtn = (id, label, count, Icon, highlight) => (
    <button onClick={() => setTab(id)} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors ${tab === id ? 'bg-[#14110F] text-[#F7F3ED]' : 'text-[#14110F] border border-[#14110F]/20 hover:border-[#14110F]'}`}>
      <Icon className="w-4 h-4" /> {label} <span className={highlight ? 'text-[#C1613E] font-medium' : 'opacity-60'}>({count})</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      <PortalHeader area="Admin" onRefresh={load} onLogout={onLogout} />
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {tabBtn('orders', 'Aufträge', data.orders.filter(ORDER_FILTERS[0][2]).length, FileText)}
          {tabBtn('authors', pendingAuthors ? `Autor:innen · ${pendingAuthors} neu` : 'Autor:innen', data.authors.length, UsersIcon, pendingAuthors > 0)}
          {tabBtn('inquiries', 'Kontaktanfragen', data.inquiries.length, Mail)}
        </div>

        {tab === 'orders' && (
          <>
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              {ORDER_FILTERS.map(([id, label, fn]) => (
                <button key={id} onClick={() => setFilter(id)} className={filter === id ? 'text-[#C1613E] underline' : 'text-[#14110F]/60 hover:text-[#14110F]'}>
                  {label} ({data.orders.filter(fn).length})
                </button>
              ))}
            </div>
            <p className="text-sm text-[#14110F]/55 mb-6 max-w-3xl">
              Neue Anfragen werden automatisch veröffentlicht. Passende Autor:innen werden benachrichtigt und können sich bewerben.
              Stellen Sie dem Kunden eine Person vor – er prüft das Profil auf Interessenkonflikte, bevor die Kontaktdaten freigegeben werden.
            </p>
            <div className="space-y-4">
              {shownOrders.length === 0 ? <Empty>Keine Aufträge in dieser Ansicht.</Empty>
                : shownOrders.map((o) => <OrderCard key={o.id} o={o} c={c} reload={load} />)}
            </div>
          </>
        )}

        {tab === 'authors' && (
          <div className="grid lg:grid-cols-2 gap-4">
            {authorsSorted.length === 0 ? <Empty>Noch keine Registrierungen.</Empty>
              : authorsSorted.map((a) => <AuthorCard key={a.id} a={a} c={c} reload={load} />)}
          </div>
        )}

        {tab === 'inquiries' && (
          data.inquiries.length === 0 ? <Empty>Keine Kontaktanfragen.</Empty> : (
            <div className="overflow-x-auto border border-[#14110F]/10 rounded-sm">
              <table className="w-full text-sm">
                <thead className="bg-[#F0EAE0]">
                  <tr>{['Datum', 'Name', 'E-Mail', 'Betreff', 'Nachricht', ''].map((h) => <th key={h} className={`text-left px-4 py-3 font-medium text-[#14110F]/70 ${kicker}`}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {data.inquiries.map((q) => (
                    <tr key={q.id} className="border-t border-[#14110F]/10 hover:bg-[#F0EAE0]">
                      <td className="px-4 py-3 text-[#14110F]/60 whitespace-nowrap">{fmtDateTime(q.created_at)}</td>
                      <td className="px-4 py-3 font-medium">{q.name}</td>
                      <td className="px-4 py-3"><a className="text-[#C1613E] hover:underline" href={`mailto:${q.email}`}>{q.email}</a></td>
                      <td className="px-4 py-3">{q.subject}</td>
                      <td className="px-4 py-3 max-w-[420px] text-[#14110F]/70">{q.message}</td>
                      <td className="px-4 py-3"><button onClick={async () => { if (window.confirm('Löschen?')) { await c.delete(`/admin/inquiries/${q.id}`); load(); } }} className="text-[#14110F]/50 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); }, []);
  if (!token || DEMO) return <Login onLogin={setToken} />;
  return <Dashboard token={token} onLogout={logout} />;
};

export default AdminPage;
