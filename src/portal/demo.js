// Testansicht (GitHub Pages): Beispieldaten im Browser, nichts wird gespeichert oder gesendet.
const days = (n) => new Date(Date.now() - n * 86400000).toISOString();

const initial = () => ({
  me: {
    id: 'demo', alias: 'A-1042', email: 'autorin@beispiel.de', status: 'active',
    display_name: 'Maria Beispiel', title: 'Dr.', qualification: 'Promotion in Wirtschaftsinformatik, 9 Jahre Lehrerfahrung',
    fields: ['info', 'wiwi'], keywords: 'Digitalisierung, KI, Geschäftsmodelle, quantitative Methoden',
    affiliations: 'Hochschule Musterstadt (Lehrauftrag)', bio: 'Schwerpunkt auf empirischen Arbeiten mit Umfragen und Regressionsanalysen.',
    available: true, notify_when_unavailable: false, created_at: days(400),
  },
  openOrders: [
    { id: 'o1', code: 'SS-1087', field: 'info', work_type: 'bachelor', topic: 'Einsatz von KI im Kundenservice mittelständischer Unternehmen', pages: 45, deadline: '15.03.2027', message: 'Empirischer Teil mit Experteninterviews gewünscht.', fee: '1.100 €', status: 'open', created_at: days(1) },
    { id: 'o2', code: 'SS-1085', field: 'wiwi', work_type: 'master', topic: 'Plattformökonomie und Netzwerkeffekte im B2B-Handel', pages: 80, deadline: '30.04.2027', message: '', fee: null, status: 'open', created_at: days(2) },
    { id: 'o3', code: 'SS-1081', field: 'info', work_type: 'hausarbeit', topic: 'Datenschutz bei Sprachassistenten – ein Überblick', pages: 15, deadline: '20.02.2027', message: 'Zitierweise APA.', fee: '380 €', status: 'open', created_at: days(4) },
  ],
  applications: [
    { id: 'a1', status: 'applied', note: 'Ich habe zu Digitalisierung im Mittelstand promoviert.', created_at: days(3), author_decision: null, customer_decision: null,
      order: { id: 'o9', code: 'SS-1079', field: 'wiwi', work_type: 'bachelor', topic: 'Digitale Transformation im Handwerk', pages: 40, deadline: '01.03.2027', fee: '950 €', status: 'open' }, customer: null },
    { id: 'a2', status: 'meeting', note: 'Gerne – ich kenne die Methodik sehr gut.', created_at: days(6), author_decision: null, customer_decision: 'yes',
      order: { id: 'o8', code: 'SS-1074', field: 'info', work_type: 'master', topic: 'Machine Learning zur Absatzprognose', pages: 70, deadline: '15.04.2027', fee: '2.400 €', status: 'meeting' },
      customer: { name: 'Max Muster (Beispiel)', email: 'max@beispiel.de' } },
  ],
  current: [
    { id: 'o7', code: 'SS-1066', field: 'info', work_type: 'bachelor', topic: 'Cloud-Migration in Kommunalverwaltungen', pages: 50, deadline: '10.02.2027', fee: '1.250 €', status: 'in_progress', created_at: days(20),
      customer: { name: 'Lena Beispiel', email: 'lena@beispiel.de' } },
  ],
  history: [
    { id: 'h1', code: 'SS-1041', field: 'wiwi', work_type: 'master', topic: 'Nachhaltigkeitsberichte im DAX', pages: 85, fee_final: '2.600 €', completed_at: days(35) },
    { id: 'h2', code: 'SS-1027', field: 'info', work_type: 'bachelor', topic: 'Agile Methoden in Behörden', pages: 42, fee_final: '1.050 €', completed_at: days(80) },
    { id: 'h3', code: 'SS-1012', field: 'info', work_type: 'hausarbeit', topic: 'Blockchain in der Lieferkette', pages: 18, fee_final: '420 €', completed_at: days(130) },
  ],
});

const num = (fee) => Number(String(fee || '').replace(/\./g, '').replace(',', '.').match(/\d+(\.\d+)?/)?.[0] || 0);

let state = initial();
const snapshot = () => {
  const s = JSON.parse(JSON.stringify(state));
  s.earnings = {
    total: s.history.reduce((t, o) => t + num(o.fee_final), 0),
    pending: s.current.reduce((t, o) => t + num(o.fee), 0),
    completed: s.history.length,
  };
  return s;
};
const delay = (v) => new Promise((r) => setTimeout(() => r(v), 250));

export const demoApi = {
  register: () => delay('demo-token'),
  login: () => delay('demo-token'),
  forToken: () => ({
    dashboard: () => delay(snapshot()),
    updateMe: (patch) => { Object.assign(state.me, patch); return delay(snapshot()); },
    apply: (orderId, note) => {
      const o = state.openOrders.find((x) => x.id === orderId);
      state.openOrders = state.openOrders.filter((x) => x.id !== orderId);
      state.applications.unshift({ id: `a${Date.now()}`, status: 'applied', note, created_at: new Date().toISOString(), author_decision: null, customer_decision: null, order: o, customer: null });
      return delay(snapshot());
    },
    withdraw: (appId) => {
      const a = state.applications.find((x) => x.id === appId);
      if (a) a.status = 'withdrawn';
      return delay(snapshot());
    },
    decide: (appId, decision) => {
      const a = state.applications.find((x) => x.id === appId);
      if (a) {
        a.author_decision = decision;
        if (decision === 'no') a.status = 'no_match';
        else if (a.customer_decision === 'yes') {
          state.applications = state.applications.filter((x) => x.id !== appId);
          state.current.unshift({ ...a.order, status: 'in_progress', customer: a.customer });
        }
      }
      return delay(snapshot());
    },
  }),
  reset: () => { state = initial(); },
};
