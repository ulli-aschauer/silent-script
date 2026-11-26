// E-Mail-Benachrichtigung an das Team bei neuen Anfragen (SMTP über nodemailer).
import nodemailer from 'nodemailer';

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, MAIL_FROM, NOTIFY_TO, SITE_URL,
} = process.env;

const enabled = Boolean(SMTP_HOST && NOTIFY_TO);

const port = Number(SMTP_PORT || 587);
const transport = enabled
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      // 465 = direktes TLS; 587/25 = STARTTLS
      secure: SMTP_SECURE ? SMTP_SECURE === 'true' : port === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      // Kein Nachladen von Dateien/URLs in Nachrichten
      disableFileAccess: true,
      disableUrlAccess: true,
    })
  : null;

if (enabled) {
  transport.verify()
    .then(() => console.log(`E-Mail-Benachrichtigung aktiv → ${NOTIFY_TO}`))
    .catch((e) => console.warn(`WARNUNG: SMTP-Verbindung fehlgeschlagen (${e.message}). Anfragen werden trotzdem gespeichert.`));
} else {
  console.log('Hinweis: E-Mail-Benachrichtigung aus (SMTP_HOST und NOTIFY_TO in .env setzen).');
}

const oneLine = (s) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// rows: [[Bezeichnung, Wert], ...]
const render = (title, rows) => {
  const text = `${title}\n\n${rows.map(([k, v]) => `${k}: ${v || '—'}`).join('\n')}\n`;
  const html = `
<div style="font-family:Georgia,serif;color:#14110F;background:#F7F3ED;padding:24px">
  <div style="font-size:22px;margin-bottom:4px">Silent Script<span style="color:#C1613E">.</span></div>
  <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C1613E;margin-bottom:16px">${esc(title)}</div>
  <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;background:#F0EAE0;width:100%;max-width:600px">
    ${rows.map(([k, v]) => `<tr>
      <td style="padding:8px 12px;color:#14110F99;vertical-align:top;white-space:nowrap">${esc(k)}</td>
      <td style="padding:8px 12px;white-space:pre-wrap">${esc(v) || '—'}</td></tr>`).join('')}
  </table>
  ${SITE_URL ? `<p style="font-family:Arial,sans-serif;font-size:13px;margin-top:16px"><a href="${esc(SITE_URL.replace(/\/$/, ''))}/admin" style="color:#C1613E">Im Admin-Dashboard öffnen</a></p>` : ''}
  <p style="font-family:Arial,sans-serif;font-size:12px;color:#14110F80;margin-top:16px">Antworten auf diese E-Mail gehen direkt an die anfragende Person.</p>
</div>`;
  return { text, html };
};

// Versand läuft im Hintergrund; ein Fehler verhindert nie das Speichern der Anfrage.
const send = (subject, replyTo, title, rows) => {
  if (!enabled) return;
  const { text, html } = render(title, rows);
  transport.sendMail({
    from: MAIL_FROM || SMTP_USER || NOTIFY_TO,
    to: NOTIFY_TO,
    replyTo: { name: oneLine(replyTo.name), address: replyTo.email },
    subject: oneLine(subject),
    text,
    html,
  }).catch((e) => console.error(`E-Mail-Versand fehlgeschlagen: ${e.message}`));
};

export const notifyQuote = (q) => send(
  `Neue Angebotsanfrage: ${q.field} (${q.pages} S.) – ${q.name}`,
  q,
  'Neue Angebotsanfrage',
  [['Name', oneLine(q.name)], ['E-Mail', q.email], ['Fachbereich', q.field], ['Seiten', String(q.pages)],
    ['Frist', q.deadline], ['Details', q.message], ['Sprache', q.lang.toUpperCase()]],
);

export const notifyInquiry = (i) => send(
  `Neue Kontaktanfrage: ${i.subject || 'ohne Betreff'} – ${i.name}`,
  i,
  'Neue Kontaktanfrage',
  [['Name', oneLine(i.name)], ['E-Mail', i.email], ['Betreff', i.subject], ['Nachricht', i.message], ['Sprache', i.lang.toUpperCase()]],
);
