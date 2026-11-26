// Kleine Helfer für Eingabeprüfung und Fehlerbehandlung.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class InputError extends Error {}

// Liest ein Textfeld, kürzt Leerzeichen und prüft Pflichtfeld/Länge.
export const str = (body, key, { required = false, max = 500, label = key } = {}) => {
  const v = body?.[key] == null ? '' : String(body[key]).trim();
  if (required && !v) throw new InputError(`Bitte „${label}“ ausfüllen`);
  if (v.length > max) throw new InputError(`„${label}“ ist zu lang (max. ${max} Zeichen)`);
  return v;
};

export const email = (body, key = 'email') => {
  const v = str(body, key, { required: true, max: 200, label: 'E-Mail' }).toLowerCase();
  if (!EMAIL_RE.test(v)) throw new InputError('Ungültige E-Mail-Adresse');
  return v;
};

export const oneOf = (value, allowed, label) => {
  if (!allowed.includes(value)) throw new InputError(`Ungültige Auswahl: ${label}`);
  return value;
};

export const lang = (body) => (body?.lang === 'en' ? 'en' : 'de');

// Handler-Wrapper: Eingabefehler → 400, alles andere → 500.
export const route = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    if (e instanceof InputError) return res.status(400).json({ detail: e.message });
    console.error(e);
    res.status(500).json({ detail: 'Interner Fehler' });
  }
};

export const fail = (res, status, detail) => res.status(status).json({ detail });

// Name mit Titel, z.B. "Dr. Maria Beispiel"
export const fullName = (a) => [a?.title, a?.display_name].filter(Boolean).join(' ');
