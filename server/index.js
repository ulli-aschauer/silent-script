// Silent Script Backend – stellt die /api-Routen bereit, die das Frontend aufruft.
import fs from 'node:fs';
import path from 'node:path';

const envFile = path.resolve(import.meta.dirname, '..', '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const { default: express } = await import('express');
const { store, now } = await import('./store.js');
const auth = await import('./auth.js');
const mail = await import('./mail.js');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

// Render (und andere Hoster) geben den Port über PORT vor.
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 8001);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Liest ein Textfeld, kürzt es und prüft Pflichtfelder.
const str = (body, key, { required = false, max = 500 } = {}) => {
  const v = body?.[key] == null ? '' : String(body[key]).trim();
  if (required && !v) throw new Error(`Feld "${key}" fehlt`);
  if (v.length > max) throw new Error(`Feld "${key}" ist zu lang`);
  return v;
};
const lang = (body) => (body?.lang === 'en' ? 'en' : 'de');

// Fehler in Handlern als 400 mit {detail} an das Frontend geben.
const route = (fn) => (req, res) => {
  try { fn(req, res); }
  catch (e) { res.status(400).json({ detail: e.message }); }
};

const api = express.Router();

// Für die Statusprüfung des Hosters
api.get('/health', (req, res) => res.json({ ok: true }));

// ---------- Öffentlich: Formulare ----------
api.post('/quotes', route((req, res) => {
  const b = req.body;
  const email = str(b, 'email', { required: true, max: 200 });
  if (!EMAIL_RE.test(email)) throw new Error('Ungültige E-Mail-Adresse');
  const pages = Number(b.pages);
  if (!Number.isFinite(pages) || pages <= 0 || pages > 10000) throw new Error('Ungültige Seitenzahl');
  const row = store.insert('quotes', {
    name: str(b, 'name', { required: true, max: 200 }),
    email,
    field: str(b, 'field', { required: true, max: 200 }),
    pages: Math.round(pages),
    deadline: str(b, 'deadline', { required: true, max: 100 }),
    message: str(b, 'message', { max: 5000 }),
    lang: lang(b),
  });
  res.status(201).json({ id: row.id });
  mail.notifyQuote(row);
}));

api.post('/inquiries', route((req, res) => {
  const b = req.body;
  const email = str(b, 'email', { required: true, max: 200 });
  if (!EMAIL_RE.test(email)) throw new Error('Ungültige E-Mail-Adresse');
  const row = store.insert('inquiries', {
    name: str(b, 'name', { required: true, max: 200 }),
    email,
    subject: str(b, 'subject', { max: 300 }),
    message: str(b, 'message', { required: true, max: 5000 }),
    lang: lang(b),
  });
  res.status(201).json({ id: row.id });
  mail.notifyInquiry(row);
}));

// ---------- Logins ----------
api.post('/auth/admin/login', auth.loginLimiter, (req, res) => {
  if (!auth.checkAdminPassword(String(req.body?.password || ''))) {
    return res.status(401).json({ detail: 'Falsches Passwort' });
  }
  res.json({ token: auth.createToken({ role: 'admin' }) });
});

api.post('/auth/author/login', auth.loginLimiter, (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const a = store.find('authors', (x) => x.username === username);
  if (!a || !auth.verifyPassword(String(req.body?.password || ''), a.password_hash)) {
    return res.status(401).json({ detail: 'Falsche Zugangsdaten' });
  }
  res.json({ token: auth.createToken({ role: 'author', sub: a.id }), username: a.username });
});

// ---------- Admin ----------
const publicAuthor = ({ password_hash, ...a }) => a;

api.get('/admin/quotes', auth.requireAdmin, (req, res) => res.json(store.list('quotes')));
api.get('/admin/inquiries', auth.requireAdmin, (req, res) => res.json(store.list('inquiries')));
api.get('/admin/authors', auth.requireAdmin, (req, res) => res.json(store.list('authors').map(publicAuthor)));
api.get('/admin/assignments', auth.requireAdmin, (req, res) => res.json(store.list('assignments')));

api.post('/admin/authors', auth.requireAdmin, route((req, res) => {
  const b = req.body;
  const username = str(b, 'username', { required: true, max: 60 }).toLowerCase();
  if (!/^[a-z0-9._-]{3,60}$/.test(username)) throw new Error('Username: 3–60 Zeichen, nur a–z, 0–9, . _ -');
  const password = String(b?.password || '');
  if (password.length < 8) throw new Error('Passwort muss mindestens 8 Zeichen haben');
  if (store.find('authors', (a) => a.username === username)) throw new Error('Username ist bereits vergeben');
  const row = store.insert('authors', {
    username,
    display_name: str(b, 'display_name', { required: true, max: 200 }),
    field: str(b, 'field', { max: 200 }),
    password_hash: auth.hashPassword(password),
  });
  res.status(201).json(publicAuthor(row));
}));

api.delete('/admin/authors/:id', auth.requireAdmin, (req, res) => {
  if (!store.remove('authors', req.params.id)) return res.status(404).json({ detail: 'Nicht gefunden' });
  res.json({ ok: true });
});

api.post('/admin/assignments', auth.requireAdmin, route((req, res) => {
  const b = req.body;
  let assigned_to = b?.assigned_to ? String(b.assigned_to).toLowerCase() : null;
  if (assigned_to && !store.find('authors', (a) => a.username === assigned_to)) throw new Error('Autor existiert nicht');
  const row = store.insert('assignments', {
    field: str(b, 'field', { required: true, max: 200 }),
    scope: str(b, 'scope', { required: true, max: 200 }),
    deadline: str(b, 'deadline', { required: true, max: 100 }),
    fee: str(b, 'fee', { required: true, max: 100 }),
    note: str(b, 'note', { max: 2000 }),
    assigned_to,
    status: 'open',
    taken_by: null,
    taken_at: null,
  });
  res.status(201).json(row);
}));

api.delete('/admin/assignments/:id', auth.requireAdmin, (req, res) => {
  if (!store.remove('assignments', req.params.id)) return res.status(404).json({ detail: 'Nicht gefunden' });
  res.json({ ok: true });
});

// ---------- Autor:innen ----------
// Sichtbar: offene Aufträge (für alle oder gezielt für mich) und meine übernommenen.
const visibleFor = (username) => (a) =>
  (a.status === 'open' && (!a.assigned_to || a.assigned_to === username)) || a.taken_by === username;

api.get('/author/assignments', auth.requireAuthor, (req, res) => {
  res.json(store.list('assignments').filter(visibleFor(req.author.username)));
});

api.post('/author/assignments/:id/take', auth.requireAuthor, (req, res) => {
  const me = req.author.username;
  const a = store.find('assignments', (x) => x.id === req.params.id);
  if (!a || !visibleFor(me)(a)) return res.status(404).json({ detail: 'Auftrag nicht gefunden' });
  if (a.status !== 'open') return res.status(409).json({ detail: 'Dieser Auftrag wurde bereits übernommen' });
  res.json(store.update('assignments', a.id, { status: 'taken', taken_by: me, taken_at: now() }));
});

api.use((req, res) => res.status(404).json({ detail: 'Unbekannte API-Route' }));
app.use('/api', api);

// ---------- Produktion: fertiges Frontend aus dist/ ausliefern ----------
const dist = path.resolve(import.meta.dirname, '..', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

if (!process.env.ADMIN_PASSWORD) {
  console.warn('WARNUNG: ADMIN_PASSWORD ist nicht gesetzt – Admin-Login ist deaktiviert. Bitte in .env eintragen.');
}

app.listen(PORT, () => console.log(`Silent Script Backend läuft auf Port ${PORT}`));
