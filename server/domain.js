// Geschäftslogik: Matching, Sichtbarkeit (Anonymität) und Ablauf eines Auftrags.
//
// Ablauf:
//   Kunde stellt Anfrage  → Auftrag "open", passende Autor:innen werden benachrichtigt
//   Autor:in bewirbt sich → Bewerbung "applied"
//   Team wählt Bewerbung  → "proposed": Kunde erhält Profil (Name!) und prüft Interessenkonflikt
//   Kunde bestätigt       → "meeting": Autor:in sieht Kundenkontakt, Erstgespräch
//   Beide sagen zu        → "matched", Auftrag "in_progress"
//   Team schließt ab      → Auftrag "completed" (erscheint in Historie und Verdienst)
import { store, now, newToken } from './store.js';
import { mail, siteLink } from './mail.js';
import { fieldLabel, workTypeLabel } from '../src/data/fields.js';
import { fullName } from './util.js';

export const labels = { field: (k) => fieldLabel(k), work: (k) => workTypeLabel(k) };

// Bewerbungsstatus, die eine Bewerbung "aktiv" machen (Auftrag ist dann für andere blockiert)
const ACTIVE_APP = ['proposed', 'meeting'];
// Ab diesen Status darf die Autor:in die Kundendaten sehen
const CONTACT_VISIBLE = ['meeting', 'matched'];

// ---------- Ansichten ----------

// Was Autor:innen von einem Auftrag sehen dürfen: keine Kundendaten.
export const orderForAuthor = (o) => ({
  id: o.id, code: o.code, field: o.field, work_type: o.work_type, topic: o.topic,
  pages: o.pages, deadline: o.deadline, message: o.message, fee: o.fee, fee_final: o.fee_final,
  status: o.status, created_at: o.created_at, completed_at: o.completed_at,
});

// Öffentliches Profil, das der Kunde vor dem Erstgespräch sieht.
export const authorForCustomer = (a) => ({
  display_name: fullName(a), qualification: a.qualification,
  affiliations: a.affiliations, bio: a.bio, fields: a.fields,
});

// Eigenes Profil (für das Autorenportal)
export const authorSelf = ({ password_hash, ...a }) => a;

// Für das Team (Admin)
export const authorForAdmin = ({ password_hash, ...a }) => a;

// ---------- Matching ----------

export const matchesAuthor = (a, o) => a.status === 'active' && (a.fields || []).includes(o.field);

export const notifyMatchingAuthors = (o) => {
  const recipients = store.list('authors', (a) => matchesAuthor(a, o) && (a.available || a.notify_when_unavailable));
  for (const a of recipients) mail.authorNewOrder(a, o, labels);
  return recipients.length;
};

// ---------- Autoren-Dashboard ----------

const feeNumber = (fee) => {
  const m = String(fee || '').replace(/\./g, '').replace(',', '.').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
};

export const dashboardFor = (a) => {
  const myApps = store.list('applications', (x) => x.author_id === a.id);
  const appliedOrderIds = new Set(myApps.map((x) => x.order_id));

  const openOrders = a.status === 'active'
    ? store.list('orders', (o) => o.status === 'open' && matchesAuthor(a, o) && !appliedOrderIds.has(o.id)).map(orderForAuthor)
    : [];

  const applications = myApps
    .filter((x) => !['matched'].includes(x.status))
    .map((x) => {
      const o = store.get('orders', x.order_id);
      if (!o) return null;
      return {
        id: x.id, status: x.status, note: x.note, created_at: x.created_at,
        author_decision: x.author_decision, customer_decision: x.customer_decision,
        order: orderForAuthor(o),
        customer: CONTACT_VISIBLE.includes(x.status) ? { name: o.name, email: o.email } : null,
      };
    })
    .filter(Boolean);

  const mine = store.list('orders', (o) => o.author_id === a.id);
  const withContact = (o) => ({ ...orderForAuthor(o), customer: { name: o.name, email: o.email } });
  const current = mine.filter((o) => o.status === 'in_progress').map(withContact);
  const history = mine.filter((o) => o.status === 'completed')
    .sort((x, y) => (x.completed_at < y.completed_at ? 1 : -1))
    .map(orderForAuthor);

  const earnings = {
    total: history.reduce((s, o) => s + feeNumber(o.fee_final || o.fee), 0),
    pending: current.reduce((s, o) => s + feeNumber(o.fee), 0),
    completed: history.length,
  };

  return { me: authorSelf(a), openOrders, applications, current, history, earnings };
};

// ---------- Übergänge ----------

export class FlowError extends Error {
  constructor(message, status = 409) { super(message); this.status = status; }
}

export const apply = (a, orderId, note) => {
  if (a.status !== 'active') throw new FlowError('Ihr Konto ist noch nicht freigeschaltet', 403);
  const o = store.get('orders', orderId);
  if (!o || !matchesAuthor(a, o)) throw new FlowError('Auftrag nicht gefunden', 404);
  if (o.status !== 'open') throw new FlowError('Für diesen Auftrag sind keine Bewerbungen mehr möglich');
  if (store.find('applications', (x) => x.order_id === o.id && x.author_id === a.id)) {
    throw new FlowError('Sie haben sich bereits beworben');
  }
  return store.insert('applications', { order_id: o.id, author_id: a.id, note, status: 'applied', author_decision: null, customer_decision: null, token: null });
};

export const withdraw = (a, appId) => {
  const x = store.get('applications', appId);
  if (!x || x.author_id !== a.id) throw new FlowError('Bewerbung nicht gefunden', 404);
  if (x.status !== 'applied') throw new FlowError('Diese Bewerbung kann nicht mehr zurückgezogen werden');
  return store.update('applications', x.id, { status: 'withdrawn' });
};

// Team schlägt dem Kunden eine Bewerbung vor → Kunde erhält Profil zur Prüfung.
export const propose = (appId) => {
  const x = store.get('applications', appId);
  if (!x || x.status !== 'applied') throw new FlowError('Bewerbung nicht gefunden oder nicht mehr offen', 404);
  const o = store.get('orders', x.order_id);
  const a = store.get('authors', x.author_id);
  if (!o || !a) throw new FlowError('Auftrag oder Autor:in existiert nicht mehr', 404);
  if (o.status !== 'open') throw new FlowError('Für diesen Auftrag läuft bereits ein Vorschlag');
  const token = newToken();
  store.update('applications', x.id, { status: 'proposed', token, proposed_at: now() });
  store.update('orders', o.id, { status: 'proposed' });
  const confirmUrl = siteLink(`/bestaetigung/${token}`);
  mail.customerProposal(o, a, confirmUrl);
  return { confirmUrl };
};

const reopen = (o) => store.update('orders', o.id, { status: 'open' });

// Kunde: Interessenkonflikt-Prüfung (vor dem Erstgespräch)
export const customerCheck = (token, accept) => {
  const x = store.find('applications', (r) => r.token && r.token === token);
  if (!x || x.status !== 'proposed') throw new FlowError('Dieser Link ist nicht mehr gültig', 404);
  const o = store.get('orders', x.order_id);
  const a = store.get('authors', x.author_id);
  if (!accept) {
    store.update('applications', x.id, { status: 'declined_by_customer' });
    reopen(o);
    return;
  }
  store.update('applications', x.id, { status: 'meeting', meeting_at: now() });
  store.update('orders', o.id, { status: 'meeting' });
  mail.authorMeeting(a, o);
  mail.teamMeeting(o, a);
  mail.customerMeetingNext(o, siteLink(`/bestaetigung/${token}`));
};

// Entscheidung nach dem Erstgespräch (Autor:in oder Kunde)
const resolve = (x) => {
  const o = store.get('orders', x.order_id);
  const a = store.get('authors', x.author_id);
  if (x.author_decision === 'no' || x.customer_decision === 'no') {
    store.update('applications', x.id, { status: 'no_match' });
    reopen(o);
    if (a) mail.authorResult(a, o, false);
    mail.teamMatch(o, a || { display_name: '—' }, false);
  } else if (x.author_decision === 'yes' && x.customer_decision === 'yes') {
    store.update('applications', x.id, { status: 'matched' });
    store.update('orders', o.id, { status: 'in_progress', author_id: x.author_id, started_at: now() });
    // Andere offene Bewerbungen auf diesen Auftrag schließen
    for (const other of store.list('applications', (r) => r.order_id === o.id && r.id !== x.id && r.status === 'applied')) {
      store.update('applications', other.id, { status: 'not_selected' });
    }
    mail.authorResult(a, o, true);
    mail.teamMatch(o, a, true);
  }
};

export const authorDecision = (a, appId, yes) => {
  const x = store.get('applications', appId);
  if (!x || x.author_id !== a.id) throw new FlowError('Bewerbung nicht gefunden', 404);
  if (x.status !== 'meeting') throw new FlowError('Eine Entscheidung ist erst nach Freigabe des Erstgesprächs möglich');
  resolve(store.update('applications', x.id, { author_decision: yes ? 'yes' : 'no' }));
};

export const customerDecision = (token, yes) => {
  const x = store.find('applications', (r) => r.token && r.token === token);
  if (!x || x.status !== 'meeting') throw new FlowError('Dieser Link ist nicht mehr gültig', 404);
  resolve(store.update('applications', x.id, { customer_decision: yes ? 'yes' : 'no' }));
};

// Was der Kunde über den Bestätigungslink sieht
export const confirmView = (token) => {
  const x = store.find('applications', (r) => r.token && r.token === token);
  if (!x) throw new FlowError('Dieser Link ist nicht gültig', 404);
  const o = store.get('orders', x.order_id);
  const a = store.get('authors', x.author_id);
  if (!o || !a) throw new FlowError('Dieser Link ist nicht mehr gültig', 404);
  const phase = x.status === 'proposed' ? 'check'
    : x.status === 'meeting' ? (x.customer_decision ? 'waiting' : 'decide')
    : x.status === 'matched' ? 'matched'
    : 'closed';
  return {
    phase,
    order: { code: o.code, topic: o.topic, work_type: o.work_type, field: o.field },
    author: authorForCustomer(a),
  };
};

export { ACTIVE_APP };
