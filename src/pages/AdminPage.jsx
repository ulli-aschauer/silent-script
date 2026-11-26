import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Lock, LogOut, Trash2, Plus, RefreshCw, FileText, Users as UsersIcon, Briefcase, Mail } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = 'ss_admin_token';

const api = (token) => axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });

const Login = ({ onLogin }) => {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const { data } = await axios.post(`${API}/auth/admin/login`, { password: pw });
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (e) { setErr('Falsches Passwort'); }
    finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED] px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-[#F0EAE0] p-10 rounded-sm border border-[#14110F]/10">
        <Lock className="w-6 h-6 text-[#C1613E] mb-4" />
        <h1 className="font-serif text-3xl text-[#14110F] mb-2">Admin Login</h1>
        <p className="text-sm text-[#14110F]/60 mb-6">Silent Script Dashboard</p>
        <input autoFocus type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Passwort" className="w-full bg-transparent border-b border-[#14110F]/25 py-3 mb-6 focus:outline-none focus:border-[#C1613E]" />
        {err && <div className="text-sm text-red-700 mb-4">{err}</div>}
        <button disabled={busy} className="w-full bg-[#14110F] text-[#F7F3ED] py-3 rounded-full text-sm hover:bg-[#C1613E] transition-colors disabled:opacity-60">{busy ? 'Anmelden ...' : 'Anmelden'}</button>
      </form>
    </div>
  );
};

const Table = ({ cols, rows, empty }) => (
  <div className="overflow-x-auto border border-[#14110F]/10 rounded-sm">
    <table className="w-full text-sm">
      <thead className="bg-[#F0EAE0]">
        <tr>{cols.map((c) => <th key={c} className="text-left px-4 py-3 font-medium text-[#14110F]/70 uppercase text-[10px] tracking-widest">{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={cols.length} className="text-center py-10 text-[#14110F]/50">{empty}</td></tr>
        ) : rows}
      </tbody>
    </table>
  </div>
);

const fmt = (d) => d ? new Date(d).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '';

const Dashboard = ({ token, onLogout }) => {
  const [tab, setTab] = useState('quotes');
  const [quotes, setQuotes] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const c = api(token);

  const load = useCallback(async () => {
    try {
      const [q, i, a, ag] = await Promise.all([c.get('/admin/quotes'), c.get('/admin/inquiries'), c.get('/admin/authors'), c.get('/admin/assignments')]);
      setQuotes(q.data); setInquiries(i.data); setAuthors(a.data); setAssignments(ag.data);
    } catch (e) { if (e?.response?.status === 401) onLogout(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  useEffect(() => { load(); }, [load]);

  // Author create
  const [lastCred, setLastCred] = useState(null);
  const [na, setNa] = useState({ username: '', display_name: '', field: '', password: '' });
  const createAuthor = async (e) => {
    e.preventDefault();
    try {
      await c.post('/admin/authors', na);
      setLastCred({ username: na.username, password: na.password, display_name: na.display_name });
      setNa({ username: '', display_name: '', field: '', password: '' });
      load();
    }
    catch (e) { alert(e?.response?.data?.detail || 'Fehler'); }
  };
  const delAuthor = async (id) => { if (window.confirm('Autor löschen?')) { await c.delete(`/admin/authors/${id}`); load(); } };

  // Assignment create
  const [nAs, setNAs] = useState({ field: '', scope: '', deadline: '', fee: '', note: '', assigned_to: null });
  const createAssignment = async (e) => {
    e.preventDefault();
    try { await c.post('/admin/assignments', nAs); setNAs({ field: '', scope: '', deadline: '', fee: '', note: '', assigned_to: null }); load(); }
    catch (e) { alert(e?.response?.data?.detail || 'Fehler'); }
  };
  const delAssignment = async (id) => { if (window.confirm('Auftrag löschen?')) { await c.delete(`/admin/assignments/${id}`); load(); } };

  const tabBtn = (id, label, count) => (
    <button onClick={() => setTab(id)} className={`px-4 py-2 rounded-full text-sm transition-colors ${tab === id ? 'bg-[#14110F] text-[#F7F3ED]' : 'bg-transparent text-[#14110F] border border-[#14110F]/20 hover:border-[#14110F]'}`}>
      {label} <span className="opacity-60">({count})</span>
    </button>
  );

  const inputCls = 'bg-transparent border-b border-[#14110F]/25 py-2 text-sm focus:outline-none focus:border-[#C1613E]';

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      <header className="border-b border-[#14110F]/10 bg-[#F7F3ED] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl text-[#14110F]">Silent Script<span className="text-[#C1613E]">.</span></span>
            <span className="text-xs uppercase tracking-widest text-[#14110F]/50">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="text-sm text-[#14110F]/70 hover:text-[#C1613E] flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Aktualisieren</button>
            <button onClick={onLogout} className="text-sm text-[#14110F]/70 hover:text-[#C1613E] flex items-center gap-1.5"><LogOut className="w-4 h-4" /> Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {tabBtn('quotes', <span className="inline-flex items-center gap-1.5"><FileText className="w-4 h-4" /> Angebotsanfragen</span>, quotes.length)}
          {tabBtn('inquiries', <span className="inline-flex items-center gap-1.5"><Mail className="w-4 h-4" /> Kontaktanfragen</span>, inquiries.length)}
          {tabBtn('assignments', <span className="inline-flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> Aufträge</span>, assignments.length)}
          {tabBtn('authors', <span className="inline-flex items-center gap-1.5"><UsersIcon className="w-4 h-4" /> Autoren</span>, authors.length)}
        </div>

        {tab === 'quotes' && (
          <Table cols={['Datum', 'Name', 'E-Mail', 'Fachbereich', 'Seiten', 'Frist', 'Details', 'Sprache']} empty="Noch keine Anfragen" rows={quotes.map((q) => (
            <tr key={q.id} className="border-t border-[#14110F]/10 hover:bg-[#F0EAE0]">
              <td className="px-4 py-3 text-[#14110F]/60 whitespace-nowrap">{fmt(q.created_at)}</td>
              <td className="px-4 py-3 font-medium">{q.name}</td>
              <td className="px-4 py-3"><a className="text-[#C1613E] hover:underline" href={`mailto:${q.email}`}>{q.email}</a></td>
              <td className="px-4 py-3">{q.field}</td>
              <td className="px-4 py-3">{q.pages}</td>
              <td className="px-4 py-3">{q.deadline}</td>
              <td className="px-4 py-3 max-w-[280px] text-[#14110F]/70">{q.message || '—'}</td>
              <td className="px-4 py-3 uppercase text-xs">{q.lang}</td>
            </tr>
          ))} />
        )}

        {tab === 'inquiries' && (
          <Table cols={['Datum', 'Name', 'E-Mail', 'Betreff', 'Nachricht', 'Sprache']} empty="Keine Kontaktanfragen" rows={inquiries.map((q) => (
            <tr key={q.id} className="border-t border-[#14110F]/10 hover:bg-[#F0EAE0]">
              <td className="px-4 py-3 text-[#14110F]/60 whitespace-nowrap">{fmt(q.created_at)}</td>
              <td className="px-4 py-3 font-medium">{q.name}</td>
              <td className="px-4 py-3"><a className="text-[#C1613E] hover:underline" href={`mailto:${q.email}`}>{q.email}</a></td>
              <td className="px-4 py-3">{q.subject}</td>
              <td className="px-4 py-3 max-w-[360px] text-[#14110F]/70">{q.message}</td>
              <td className="px-4 py-3 uppercase text-xs">{q.lang}</td>
            </tr>
          ))} />
        )}

        {tab === 'assignments' && (
          <div className="space-y-6">
            <form onSubmit={createAssignment} className="bg-[#F0EAE0] p-6 rounded-sm border border-[#14110F]/10">
              <div className="font-serif text-xl mb-4">Neuen Auftrag anlegen</div>
              <div className="grid md:grid-cols-6 gap-4">
                <input required value={nAs.field} onChange={(e) => setNAs({...nAs, field: e.target.value})} placeholder="Fachbereich" className={inputCls} />
                <input required value={nAs.scope} onChange={(e) => setNAs({...nAs, scope: e.target.value})} placeholder="Umfang (z.B. 80 S.)" className={inputCls} />
                <input required value={nAs.deadline} onChange={(e) => setNAs({...nAs, deadline: e.target.value})} placeholder="Frist" className={inputCls} />
                <input required value={nAs.fee} onChange={(e) => setNAs({...nAs, fee: e.target.value})} placeholder="Honorar-Vorschlag" className={inputCls} />
                <input value={nAs.note} onChange={(e) => setNAs({...nAs, note: e.target.value})} placeholder="Bemerkung" className={inputCls} />
                <select value={nAs.assigned_to || ''} onChange={(e) => setNAs({...nAs, assigned_to: e.target.value || null})} className={inputCls}>
                  <option value="">— Autor zuweisen (optional) —</option>
                  {authors.map((a) => <option key={a.id} value={a.username}>{a.display_name} ({a.username})</option>)}
                </select>
              </div>
              <button className="mt-4 inline-flex items-center gap-2 bg-[#14110F] text-[#F7F3ED] px-5 py-2 rounded-full text-sm hover:bg-[#C1613E] transition-colors"><Plus className="w-4 h-4" /> Auftrag anlegen</button>
            </form>
            <Table cols={['Datum', 'Fachbereich', 'Umfang', 'Frist', 'Honorar', 'Bemerkung', 'Status', 'Zugewiesen an', 'Übernommen von', '']} empty="Noch keine Aufträge" rows={assignments.map((a) => (
              <tr key={a.id} className="border-t border-[#14110F]/10">
                <td className="px-4 py-3 text-[#14110F]/60 whitespace-nowrap">{fmt(a.created_at)}</td>
                <td className="px-4 py-3">{a.field}</td>
                <td className="px-4 py-3">{a.scope}</td>
                <td className="px-4 py-3">{a.deadline}</td>
                <td className="px-4 py-3">{a.fee}</td>
                <td className="px-4 py-3 max-w-[240px] text-[#14110F]/70">{a.note || '—'}</td>
                <td className="px-4 py-3"><span className={`text-xs uppercase px-2 py-1 rounded-full ${a.status === 'open' ? 'bg-[#6B7A3E]/15 text-[#6B7A3E]' : a.status === 'taken' ? 'bg-[#C1613E]/15 text-[#C1613E]' : 'bg-[#14110F]/10 text-[#14110F]/60'}`}>{a.status}</span></td>
                <td className="px-4 py-3">{a.assigned_to ? <span className="font-mono text-xs">{a.assigned_to}</span> : <span className="text-[#14110F]/40">—</span>}</td>
                <td className="px-4 py-3">{a.taken_by ? <span className="font-mono text-xs">{a.taken_by}</span> : <span className="text-[#14110F]/40">—</span>}</td>
                <td className="px-4 py-3"><button onClick={() => delAssignment(a.id)} className="text-[#14110F]/50 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))} />
          </div>
        )}

        {tab === 'authors' && (
          <div className="space-y-6">
            {lastCred && (
              <div className="p-6 bg-[#6B7A3E]/10 border border-[#6B7A3E]/30 rounded-sm">
                <div className="text-xs uppercase tracking-widest text-[#6B7A3E] mb-2">Zugang erstellt — bitte diese Daten sicher an den Autor weitergeben</div>
                <div className="font-serif text-lg text-[#14110F] mb-3">{lastCred.display_name}</div>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-[#14110F]/50">Login-URL:</span> <a className="text-[#C1613E] underline" href="/autoren" target="_blank" rel="noreferrer">/autoren</a></div>
                  <div><span className="text-[#14110F]/50">Username:</span> <span className="font-mono">{lastCred.username}</span></div>
                  <div><span className="text-[#14110F]/50">Passwort:</span> <span className="font-mono">{lastCred.password}</span></div>
                </div>
                <button onClick={() => setLastCred(null)} className="mt-4 text-xs text-[#14110F]/60 hover:text-[#C1613E]">Ausblenden</button>
              </div>
            )}
            <form onSubmit={createAuthor} className="bg-[#F0EAE0] p-6 rounded-sm border border-[#14110F]/10">
              <div className="font-serif text-xl mb-4">Neuen Autor anlegen</div>
              <div className="grid md:grid-cols-4 gap-4">
                <input required value={na.username} onChange={(e) => setNa({...na, username: e.target.value})} placeholder="Username" className={inputCls} />
                <input required value={na.display_name} onChange={(e) => setNa({...na, display_name: e.target.value})} placeholder="Anzeigename" className={inputCls} />
                <input value={na.field} onChange={(e) => setNa({...na, field: e.target.value})} placeholder="Fachbereich" className={inputCls} />
                <input required type="password" value={na.password} onChange={(e) => setNa({...na, password: e.target.value})} placeholder="Passwort" className={inputCls} />
              </div>
              <button className="mt-4 inline-flex items-center gap-2 bg-[#14110F] text-[#F7F3ED] px-5 py-2 rounded-full text-sm hover:bg-[#C1613E] transition-colors"><Plus className="w-4 h-4" /> Autor anlegen</button>
            </form>
            <Table cols={['Datum', 'Username', 'Name', 'Fachbereich', '']} empty="Noch keine Autoren" rows={authors.map((a) => (
              <tr key={a.id} className="border-t border-[#14110F]/10">
                <td className="px-4 py-3 text-[#14110F]/60 whitespace-nowrap">{fmt(a.created_at)}</td>
                <td className="px-4 py-3 font-mono text-sm">{a.username}</td>
                <td className="px-4 py-3">{a.display_name}</td>
                <td className="px-4 py-3">{a.field || '—'}</td>
                <td className="px-4 py-3"><button onClick={() => delAuthor(a.id)} className="text-[#14110F]/50 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))} />
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(null); };
  if (!token) return <Login onLogin={setToken} />;
  return <Dashboard token={token} onLogout={logout} />;
};

export default AdminPage;
