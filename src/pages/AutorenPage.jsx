import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Lock, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = 'ss_author_token';
const USER_KEY = 'ss_author_user';

const Login = ({ onLogin }) => {
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const { data } = await axios.post(`${API}/auth/author/login`, f);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, data.username || '');
      onLogin(data.token, data.username);
    } catch { setErr('Falsche Zugangsdaten'); }
    finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED] px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-[#F0EAE0] p-10 rounded-sm border border-[#14110F]/10">
        <Lock className="w-6 h-6 text-[#C1613E] mb-4" />
        <h1 className="font-serif text-3xl text-[#14110F] mb-2">Autoren-Bereich</h1>
        <p className="text-sm text-[#14110F]/60 mb-6">Silent Script — Offene Aufträge</p>
        <input required value={f.username} onChange={(e) => setF({...f, username: e.target.value})} placeholder="Username" className="w-full bg-transparent border-b border-[#14110F]/25 py-3 mb-4 focus:outline-none focus:border-[#C1613E]" />
        <input required type="password" value={f.password} onChange={(e) => setF({...f, password: e.target.value})} placeholder="Passwort" className="w-full bg-transparent border-b border-[#14110F]/25 py-3 mb-6 focus:outline-none focus:border-[#C1613E]" />
        {err && <div className="text-sm text-red-700 mb-4">{err}</div>}
        <button disabled={busy} className="w-full bg-[#14110F] text-[#F7F3ED] py-3 rounded-full text-sm hover:bg-[#C1613E] transition-colors disabled:opacity-60">{busy ? 'Anmelden ...' : 'Anmelden'}</button>
        <p className="mt-6 text-xs text-[#14110F]/50 text-center">Zugang nur für registrierte Autor:innen. Zugänge werden vom Team vergeben.</p>
      </form>
    </div>
  );
};

const fmt = (d) => d ? new Date(d).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '';

const Dash = ({ token, username, onLogout }) => {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(null);
  const c = axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });

  const load = useCallback(async () => {
    try { const { data } = await c.get('/author/assignments'); setItems(data); }
    catch (e) { if (e?.response?.status === 401) onLogout(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const take = async (id) => {
    setBusy(id);
    try { await c.post(`/author/assignments/${id}/take`); load(); }
    catch (e) { alert(e?.response?.data?.detail || 'Fehler'); }
    finally { setBusy(null); }
  };

  const open = items.filter((i) => i.status === 'open');
  const mine = items.filter((i) => i.taken_by === username);

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      <header className="border-b border-[#14110F]/10 sticky top-0 z-10 bg-[#F7F3ED]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl text-[#14110F]">Silent Script<span className="text-[#C1613E]">.</span></span>
            <span className="text-xs uppercase tracking-widest text-[#14110F]/50">Autoren</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#14110F]/60">{username}</span>
            <button onClick={load} className="text-sm text-[#14110F]/70 hover:text-[#C1613E] flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={onLogout} className="text-sm text-[#14110F]/70 hover:text-[#C1613E] flex items-center gap-1.5"><LogOut className="w-4 h-4" /> Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <h1 className="font-serif text-4xl text-[#14110F] mb-2">Offene Aufträge</h1>
        <p className="text-[#14110F]/60 mb-10">Wählen Sie einen Auftrag aus, der zu Ihrem Fachbereich passt.</p>

        {open.length === 0 && <div className="p-8 bg-[#F0EAE0] rounded-sm text-center text-[#14110F]/60">Aktuell keine offenen Aufträge — bitte später erneut vorbeischauen.</div>}

        <div className="grid md:grid-cols-2 gap-4">
          {open.map((a) => (
            <article key={a.id} className="p-6 bg-[#F0EAE0] rounded-sm border border-[#14110F]/10 hover:border-[#14110F] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#C1613E]">{a.field}</div>
                  <div className="font-serif text-xl text-[#14110F] mt-1">{a.scope}</div>
                </div>
                <div className="text-xs text-[#14110F]/50">{fmt(a.created_at)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><div className="text-[10px] uppercase tracking-widest text-[#14110F]/50">Frist</div><div>{a.deadline}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-[#14110F]/50">Honorar</div><div>{a.fee}</div></div>
              </div>
              {a.note && <p className="text-sm text-[#14110F]/70 mb-4 italic">„{a.note}“</p>}
              <button onClick={() => take(a.id)} disabled={busy === a.id} className="w-full bg-[#14110F] text-[#F7F3ED] py-3 rounded-full text-sm hover:bg-[#C1613E] transition-colors disabled:opacity-60">
                {busy === a.id ? 'Wird angenommen ...' : 'Auftrag übernehmen'}
              </button>
            </article>
          ))}
        </div>

        {mine.length > 0 && (
          <>
            <h2 className="font-serif text-3xl text-[#14110F] mt-16 mb-6">Meine übernommenen Aufträge</h2>
            <div className="space-y-3">
              {mine.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-[#F0EAE0] rounded-sm border border-[#14110F]/10">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-[#6B7A3E]" />
                    <div>
                      <div className="font-medium">{a.field} — {a.scope}</div>
                      <div className="text-sm text-[#14110F]/60">Frist: {a.deadline} · Honorar: {a.fee}</div>
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-[#C1613E]">{a.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const AutorenPage = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState(() => localStorage.getItem(USER_KEY) || '');
  const logout = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(null); setUsername(''); };
  const onLogin = (tk, un) => { setToken(tk); setUsername(un); };
  if (!token) return <Login onLogin={onLogin} />;
  return <Dash token={token} username={username} onLogout={logout} />;
};

export default AutorenPage;
