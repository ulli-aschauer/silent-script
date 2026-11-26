// E-Mail-Versand (SMTP über nodemailer). Ohne SMTP-Einstellungen wird nichts verschickt,
// alle Abläufe funktionieren trotzdem – das Team sieht alles im Admin-Bereich.
import nodemailer from 'nodemailer';
import { fullName } from './util.js';

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, MAIL_FROM, NOTIFY_TO,
} = process.env;
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');

export const mailEnabled = Boolean(SMTP_HOST);

const port = Number(SMTP_PORT || 587);
const transport = mailEnabled
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: SMTP_SECURE ? SMTP_SECURE === 'true' : port === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      disableFileAccess: true,
      disableUrlAccess: true,
    })
  : null;

if (mailEnabled) {
  transport.verify()
    .then(() => console.log(`E-Mail-Versand aktiv${NOTIFY_TO ? ` (Team: ${NOTIFY_TO})` : ''}`))
    .catch((e) => console.warn(`WARNUNG: SMTP-Verbindung fehlgeschlagen (${e.message}).`));
} else {
  console.log('Hinweis: E-Mail-Versand aus (SMTP_HOST in .env setzen).');
}

export const siteLink = (p) => (SITE_URL ? SITE_URL + p : p);

const oneLine = (s) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// intro: Einleitungssatz, rows: [[Bezeichnung, Wert]], link: {href, label}
const render = ({ title, intro, rows = [], link, outro }) => {
  const text = [
    title, '', intro || '', '',
    ...rows.map(([k, v]) => `${k}: ${v || '—'}`), '',
    link ? `${link.label}: ${link.href}` : '',
    outro || '',
    '', '— Silent Script',
  ].join('\n');
  const html = `
<div style="font-family:Georgia,serif;color:#14110F;background:#F7F3ED;padding:24px">
  <div style="font-size:22px;margin-bottom:4px">Silent Script<span style="color:#C1613E">.</span></div>
  <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C1613E;margin-bottom:16px">${esc(title)}</div>
  ${intro ? `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;max-width:600px">${esc(intro)}</p>` : ''}
  ${rows.length ? `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;background:#F0EAE0;width:100%;max-width:600px">
    ${rows.map(([k, v]) => `<tr>
      <td style="padding:8px 12px;color:#14110F99;vertical-align:top;white-space:nowrap">${esc(k)}</td>
      <td style="padding:8px 12px;white-space:pre-wrap">${esc(v) || '—'}</td></tr>`).join('')}
  </table>` : ''}
  ${link ? `<p style="margin-top:20px"><a href="${esc(link.href)}" style="display:inline-block;background:#14110F;color:#F7F3ED;padding:12px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:14px;text-decoration:none">${esc(link.label)}</a></p>` : ''}
  ${outro ? `<p style="font-family:Arial,sans-serif;font-size:12px;color:#14110F99;margin-top:16px;max-width:600px">${esc(outro)}</p>` : ''}
</div>`;
  return { text, html };
};

// Versand im Hintergrund; Fehler werden nur protokolliert.
const send = (to, subject, content, replyTo) => {
  if (!mailEnabled || !to) return;
  const { text, html } = render(content);
  transport.sendMail({
    from: MAIL_FROM || SMTP_USER || NOTIFY_TO,
    to,
    replyTo: replyTo ? { name: oneLine(replyTo.name), address: replyTo.email } : undefined,
    subject: oneLine(subject),
    text,
    html,
  }).catch((e) => console.error(`E-Mail an ${to} fehlgeschlagen: ${e.message}`));
};

const orderRows = (o, labels) => [
  ['Auftrag', o.code], ['Fachbereich', labels.field(o.field)], ['Art der Arbeit', labels.work(o.work_type)],
  ['Thema', o.topic], ['Seiten', String(o.pages)], ['Frist', o.deadline], ['Honorar', o.fee || 'nach Absprache'],
];

export const mail = {
  // An das Team
  teamNewOrder: (o, labels) => send(NOTIFY_TO, `Neue Anfrage ${o.code}: ${o.topic} – ${o.name}`, {
    title: 'Neue Angebotsanfrage',
    intro: 'Die Anfrage wurde automatisch als offener Auftrag veröffentlicht und passende Autor:innen wurden benachrichtigt.',
    rows: [['Name', oneLine(o.name)], ['E-Mail', o.email], ...orderRows(o, labels), ['Details', o.message]],
    link: { href: siteLink('/admin'), label: 'Im Admin-Bereich öffnen' },
    outro: 'Antworten auf diese E-Mail gehen direkt an die anfragende Person.',
  }, { name: o.name, email: o.email }),

  teamInquiry: (i) => send(NOTIFY_TO, `Neue Kontaktanfrage: ${i.subject || 'ohne Betreff'} – ${i.name}`, {
    title: 'Neue Kontaktanfrage',
    rows: [['Name', oneLine(i.name)], ['E-Mail', i.email], ['Betreff', i.subject], ['Nachricht', i.message]],
    link: { href: siteLink('/admin'), label: 'Im Admin-Bereich öffnen' },
    outro: 'Antworten auf diese E-Mail gehen direkt an die anfragende Person.',
  }, { name: i.name, email: i.email }),

  teamRegistration: (a) => send(NOTIFY_TO, `Neue Autoren-Registrierung: ${fullName(a)}`, {
    title: 'Neue Registrierung',
    intro: 'Eine neue Person hat sich als Autor:in registriert und wartet auf Freischaltung.',
    rows: [['Name', fullName(a)], ['E-Mail', a.email], ['Qualifikation', a.qualification]],
    link: { href: siteLink('/admin'), label: 'Prüfen und freischalten' },
  }),

  teamMeeting: (o, a) => send(NOTIFY_TO, `Kunde hat bestätigt: ${o.code} – Erstgespräch mit ${fullName(a)}`, {
    title: 'Erstgespräch kann stattfinden',
    intro: `Der Kunde hat ${fullName(a)} bestätigt (kein Interessenkonflikt). Kontaktdaten wurden an die Autorin / den Autor freigegeben.`,
    rows: [['Auftrag', o.code], ['Kunde', `${oneLine(o.name)} <${o.email}>`], ['Autor:in', `${fullName(a)} <${a.email}>`]],
  }),

  teamMatch: (o, a, matched) => send(NOTIFY_TO, `${matched ? 'Zusammenarbeit vereinbart' : 'Kein Match'}: ${o.code}`, {
    title: matched ? 'Zusammenarbeit vereinbart' : 'Kein Match nach Erstgespräch',
    intro: matched
      ? `${fullName(a)} übernimmt den Auftrag. Beide Seiten haben zugestimmt.`
      : 'Mindestens eine Seite hat abgesagt. Der Auftrag ist wieder offen für Bewerbungen.',
    rows: [['Auftrag', o.code], ['Autor:in', fullName(a)]],
  }),

  // An Autor:innen
  authorNewOrder: (a, o, labels) => send(a.email, `Neuer Auftrag in Ihrem Fachbereich: ${labels.work(o.work_type)} – ${o.topic}`, {
    title: 'Neuer passender Auftrag',
    intro: `Hallo ${fullName(a)}, ein neuer Auftrag passt zu Ihrem Fachbereich. Entscheiden Sie selbst, ob Sie sich mit dem Thema auskennen – die Kundendaten bleiben bis zum Erstgespräch anonym.`,
    rows: orderRows(o, labels),
    link: { href: siteLink('/autoren'), label: 'Auftrag ansehen und bewerben' },
    outro: 'Sie erhalten diese E-Mail, weil Sie im Autorenportal Benachrichtigungen aktiviert haben. Sie können das dort jederzeit ändern.',
  }),

  authorApproved: (a) => send(a.email, 'Ihr Autorenkonto ist freigeschaltet', {
    title: 'Willkommen bei Silent Script',
    intro: `Hallo ${fullName(a)}, Ihr Konto wurde freigeschaltet. Sie sehen ab sofort offene Aufträge in Ihren Fachbereichen.`,
    link: { href: siteLink('/autoren'), label: 'Zum Autorenportal' },
  }),

  authorMeeting: (a, o) => send(a.email, `Erstgespräch freigegeben: Auftrag ${o.code}`, {
    title: 'Der Kunde hat Sie bestätigt',
    intro: 'Der Kunde hat Ihr Profil geprüft und möchte ein unverbindliches Erstgespräch. Bitte nehmen Sie Kontakt auf. Danach entscheiden Sie beide, ob Sie zusammenpassen.',
    rows: [['Auftrag', o.code], ['Thema', o.topic], ['Kunde', oneLine(o.name)], ['E-Mail', o.email]],
    link: { href: siteLink('/autoren'), label: 'Im Portal ansehen' },
  }),

  authorResult: (a, o, matched) => send(a.email, matched ? `Zusammenarbeit vereinbart: ${o.code}` : `Kein Match: ${o.code}`, {
    title: matched ? 'Es passt!' : 'Leider kein Match',
    intro: matched
      ? 'Sie und der Kunde haben zugestimmt. Der Auftrag erscheint jetzt unter „Laufende Aufträge“.'
      : 'Nach dem Erstgespräch kommt keine Zusammenarbeit zustande. Danke für Ihre Zeit.',
    rows: [['Auftrag', o.code], ['Thema', o.topic]],
    link: { href: siteLink('/autoren'), label: 'Zum Autorenportal' },
  }),

  // An Kund:innen
  customerProposal: (o, a, confirmUrl) => send(o.email, `Ihre Anfrage ${o.code}: Bitte Autor:in prüfen`, {
    title: 'Wir haben eine passende Person gefunden',
    intro: `Guten Tag ${oneLine(o.name)}, für Ihre Arbeit „${o.topic}“ hat sich eine passende Person beworben. Bitte prüfen Sie, bevor wir ein Erstgespräch vereinbaren, ob Sie diese Person kennen – zum Beispiel, ob sie Ihre Prüferin oder Ihr Betreuer ist.`,
    rows: [['Name', fullName(a)], ['Qualifikation', a.qualification], ['Hochschulen', a.affiliations]],
    link: { href: confirmUrl, label: 'Profil ansehen und bestätigen' },
  }),

  customerMeetingNext: (o, confirmUrl) => send(o.email, `Ihre Anfrage ${o.code}: Wie war das Erstgespräch?`, {
    title: 'Ihre Entscheidung nach dem Erstgespräch',
    intro: 'Die Autorin / der Autor meldet sich bei Ihnen für ein unverbindliches Erstgespräch. Danach teilen Sie uns über den Link mit, ob Sie zusammenarbeiten möchten.',
    link: { href: confirmUrl, label: 'Entscheidung mitteilen' },
  }),
};
