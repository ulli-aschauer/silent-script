// Silent Script Backend – stellt die /api-Routen bereit, die das Frontend aufruft.
import fs from 'node:fs';
import path from 'node:path';

const envFile = path.resolve(import.meta.dirname, '..', '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

// Erst nach dem Laden der .env importieren (Module lesen process.env beim Start).
const { default: express } = await import('express');
const { store } = await import('./store.js');
const auth = await import('./auth.js');
const { mail, siteLink } = await import('./mail.js');
const domain = await import('./domain.js');
const u = await import('./util.js');
const { FIELD_KEYS, WORK_TYPE_KEYS } = await import('../src/data/fields.js');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

// Render (und andere Hoster) geben den Port über PORT vor.
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 8001);

const api = express.Router();
const { route } = u;

// Ablauf-Fehler (z.B. "bereits beworben") mit passendem Status melden
const flow = (fn) => route(async (req, res) => {
  try { await fn(req, res); }
  catch (e) {
    if (e instanceof domain.FlowError) return u.fail(res, e.status, e.message);
    throw e;
  }
});

// Für die Statusprüfung des Hosters
api.get('/health', (req, res) => res.json({ ok: true }));

// =====================================================================
// Öffentlich
// =====================================================================

// Angebotsanfrage = neuer Auftrag. Wird sofort veröffentlicht, passende Autor:innen werden benachrichtigt.
api.post('/orders', route((req, res) => {
  const b = req.body;
  const pages = Number(b.pages);
  if (!Number.isFinite(pages) || pages <= 0 || pages > 10000) throw new u.InputError('Ungültige Seitenzahl');
  const fields = {
    name: u.str(b, 'name', { required: true, max: 200, label: 'Name' }),
    email: u.email(b),
    field: u.oneOf(b.field, FIELD_KEYS, 'Fachbereich'),
    work_type: u.oneOf(b.work_type, WORK_TYPE_KEYS, 'Art der Arbeit'),
    topic: u.str(b, 'topic', { required: true, max: 300, label: 'Thema' }),
    pages: Math.round(pages),
    deadline: u.str(b, 'deadline', { required: true, max: 100, label: 'Abgabefrist' }),
    message: u.str(b, 'message', { max: 5000, label: 'Details' }),
    lang: u.lang(b),
  };
  const order = store.insert('orders', {
    code: `SS-${store.nextSeq('orderSeq')}`, ...fields, fee: null, status: 'open', author_id: null,
  });
  mail.teamNewOrder(order, domain.labels);
  domain.notifyMatchingAuthors(order);
  res.status(201).json({ code: order.code });
}));

api.post('/inquiries', route((req, res) => {
  const b = req.body;
  const row = store.insert('inquiries', {
    name: u.str(b, 'name', { required: true, max: 200, label: 'Name' }),
    email: u.email(b),
    subject: u.str(b, 'subject', { max: 300, label: 'Betreff' }),
    message: u.str(b, 'message', { required: true, max: 5000, label: 'Nachricht' }),
    lang: u.lang(b),
  });
  mail.teamInquiry(row);
  res.status(201).json({ id: row.id });
}));

// Kunde: Autor:in prüfen bzw. nach dem Erstgespräch entscheiden
api.get('/confirm/:token', flow((req, res) => res.json(domain.confirmView(req.params.token))));
api.post('/confirm/:token', flow((req, res) => {
  const { action } = req.body || {};
  if (action === 'accept' || action === 'decline') domain.customerCheck(req.params.token, action === 'accept');
  else if (action === 'yes' || action === 'no') domain.customerDecision(req.params.token, action === 'yes');
  else throw new u.InputError('Unbekannte Aktion');
  res.json(domain.confirmView(req.params.token));
}));

// =====================================================================
// Autor:innen
// =====================================================================

const authorProfile = (b, { partial = false } = {}) => {
  const out = {};
  const set = (key, fn) => { if (!partial || key in b) out[key] = fn(); };
  set('display_name', () => u.str(b, 'display_name', { required: true, max: 120, label: 'Name' }));
  set('title', () => u.str(b, 'title', { max: 60, label: 'Titel' }));
  set('qualification', () => u.str(b, 'qualification', { required: true, max: 300, label: 'Qualifikation' }));
  set('fields', () => {
    const f = Array.isArray(b.fields) ? [...new Set(b.fields)] : [];
    if (f.length === 0) throw new u.InputError('Bitte mindestens einen Fachbereich wählen');
    f.forEach((k) => u.oneOf(k, FIELD_KEYS, 'Fachbereich'));
    return f;
  });
  set('keywords', () => u.str(b, 'keywords', { max: 500, label: 'Schwerpunkte' }));
  set('affiliations', () => u.str(b, 'affiliations', { max: 500, label: 'Hochschulen' }));
  set('bio', () => u.str(b, 'bio', { max: 2000, label: 'Kurzprofil' }));
  set('available', () => Boolean(b.available));
  set('notify_when_unavailable', () => Boolean(b.notify_when_unavailable));
  return out;
};

api.post('/author/register', auth.loginLimiter, route((req, res) => {
  const b = req.body || {};
  const email = u.email(b);
  const password = String(b.password || '');
  if (password.length < 8) throw new u.InputError('Das Passwort muss mindestens 8 Zeichen haben');
  if (!b.confirm) throw new u.InputError('Bitte bestätigen Sie die Richtigkeit Ihrer Angaben');
  if (store.find('authors', (a) => a.email === email)) throw new u.InputError('Für diese E-Mail-Adresse gibt es bereits ein Konto');
  const a = store.insert('authors', {
    ...authorProfile(b),
    email,
    alias: `A-${store.nextSeq('authorSeq')}`,
    password_hash: auth.hashPassword(password),
    status: 'pending',
    available: true,
    notify_when_unavailable: false,
  });
  mail.teamRegistration(a);
  res.status(201).json({ token: auth.createToken({ role: 'author', sub: a.id }) });
}));

api.post('/author/login', auth.loginLimiter, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const a = store.find('authors', (x) => x.email === email);
  if (!a || !auth.verifyPassword(String(req.body?.password || ''), a.password_hash)) {
    return u.fail(res, 401, 'E-Mail oder Passwort falsch');
  }
  if (a.status === 'blocked') return u.fail(res, 401, 'Dieses Konto ist gesperrt');
  res.json({ token: auth.createToken({ role: 'author', sub: a.id }) });
});

api.get('/author/dashboard', auth.requireAuthor, (req, res) => res.json(domain.dashboardFor(req.author)));

api.patch('/author/me', auth.requireAuthor, route((req, res) => {
  store.update('authors', req.author.id, authorProfile(req.body || {}, { partial: true }));
  res.json(domain.dashboardFor(store.get('authors', req.author.id)));
}));

api.post('/author/orders/:id/apply', auth.requireAuthor, flow((req, res) => {
  domain.apply(req.author, req.params.id, u.str(req.body, 'note', { max: 2000, label: 'Nachricht' }));
  res.status(201).json(domain.dashboardFor(req.author));
}));

api.post('/author/applications/:id/withdraw', auth.requireAuthor, flow((req, res) => {
  domain.withdraw(req.author, req.params.id);
  res.json(domain.dashboardFor(req.author));
}));

api.post('/author/applications/:id/decision', auth.requireAuthor, flow((req, res) => {
  const d = req.body?.decision;
  if (d !== 'yes' && d !== 'no') throw new u.InputError('Unbekannte Entscheidung');
  domain.authorDecision(req.author, req.params.id, d === 'yes');
  res.json(domain.dashboardFor(req.author));
}));

// =====================================================================
// Team (Admin)
// =====================================================================

api.post('/auth/admin/login', auth.loginLimiter, (req, res) => {
  if (!auth.checkAdminPassword(String(req.body?.password || ''))) return u.fail(res, 401, 'Falsches Passwort');
  res.json({ token: auth.createToken({ role: 'admin' }) });
});

const admin = express.Router();
admin.use(auth.requireAdmin);

admin.get('/overview', (req, res) => {
  const authors = store.list('authors');
  const byId = Object.fromEntries(authors.map((a) => [a.id, a]));
  const apps = store.list('applications');
  const orders = store.list('orders').map((o) => ({
    ...o,
    author: o.author_id && byId[o.author_id] ? { alias: byId[o.author_id].alias, display_name: byId[o.author_id].display_name } : null,
    applications: apps.filter((x) => x.order_id === o.id).map(({ token, ...x }) => ({
      ...x,
      confirm_url: token ? siteLink(`/bestaetigung/${token}`) : null,
      author: byId[x.author_id] ? domain.authorForAdmin(byId[x.author_id]) : null,
    })),
  }));
  res.json({ orders, authors: authors.map(domain.authorForAdmin), inquiries: store.list('inquiries') });
});

admin.patch('/orders/:id', route((req, res) => {
  const o = store.get('orders', req.params.id);
  if (!o) return u.fail(res, 404, 'Nicht gefunden');
  const patch = {};
  if ('fee' in req.body) patch.fee = u.str(req.body, 'fee', { max: 100, label: 'Honorar' }) || null;
  if ('status' in req.body) {
    const s = req.body.status;
    if (s === 'completed') {
      if (o.status !== 'in_progress') throw new u.InputError('Nur laufende Aufträge können abgeschlossen werden');
      patch.status = 'completed';
      patch.completed_at = new Date().toISOString();
      patch.fee_final = u.str(req.body, 'fee_final', { max: 100, label: 'Endhonorar' }) || o.fee;
    } else if (s === 'cancelled') {
      patch.status = 'cancelled';
    } else if (s === 'open' && o.status === 'cancelled') {
      patch.status = 'open';
    } else {
      throw new u.InputError('Dieser Statuswechsel ist nicht möglich');
    }
  }
  res.json(store.update('orders', o.id, patch));
}));

admin.delete('/orders/:id', (req, res) => {
  if (!store.remove('orders', req.params.id)) return u.fail(res, 404, 'Nicht gefunden');
  for (const x of store.list('applications', (r) => r.order_id === req.params.id)) store.remove('applications', x.id);
  res.json({ ok: true });
});

// Kunden das Profil einer Bewerbung zur Prüfung schicken. Gibt den Link zurück (falls keine E-Mail eingerichtet ist).
admin.post('/applications/:id/propose', flow((req, res) => res.json(domain.propose(req.params.id))));

admin.patch('/authors/:id', route((req, res) => {
  const a = store.get('authors', req.params.id);
  if (!a) return u.fail(res, 404, 'Nicht gefunden');
  const s = req.body?.status;
  if (!['active', 'blocked', 'pending'].includes(s)) throw new u.InputError('Ungültiger Status');
  const updated = store.update('authors', a.id, { status: s });
  if (s === 'active' && a.status === 'pending') mail.authorApproved(updated);
  res.json(domain.authorForAdmin(updated));
}));

admin.delete('/authors/:id', (req, res) => {
  if (!store.remove('authors', req.params.id)) return u.fail(res, 404, 'Nicht gefunden');
  res.json({ ok: true });
});

admin.delete('/inquiries/:id', (req, res) => {
  if (!store.remove('inquiries', req.params.id)) return u.fail(res, 404, 'Nicht gefunden');
  res.json({ ok: true });
});

api.use('/admin', admin);
api.use((req, res) => u.fail(res, 404, 'Unbekannte API-Route'));
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
