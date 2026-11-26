// Passwort-Hashing (scrypt) und signierte Tokens (HMAC-SHA256), nur mit Node-Bordmitteln.
import crypto from 'node:crypto';
import { getSecret, store } from './store.js';

const SECRET = getSecret();
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 Stunden

export const hashPassword = (pw) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (pw, stored) => {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(pw, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, 'hex'));
};

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};
export const checkAdminPassword = (pw) => !!process.env.ADMIN_PASSWORD && safeEqual(pw, process.env.ADMIN_PASSWORD);

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

export const createToken = (payload) => {
  const body = b64(JSON.stringify({ ...payload, exp: Date.now() + TOKEN_TTL_MS }));
  return `${body}.${sign(body)}`;
};

const readToken = (req) => {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!m) return null;
  const [body, sig] = m[1].split('.');
  if (!body || !sig || !safeEqual(sig, sign(body))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
};

const unauthorized = (res) => res.status(401).json({ detail: 'Nicht angemeldet' });

export const requireAdmin = (req, res, next) => {
  const p = readToken(req);
  if (!p || p.role !== 'admin') return unauthorized(res);
  next();
};

export const requireAuthor = (req, res, next) => {
  const p = readToken(req);
  if (!p || p.role !== 'author') return unauthorized(res);
  // Gelöschte Autor:innen verlieren sofort den Zugang.
  const author = store.find('authors', (a) => a.id === p.sub);
  if (!author) return unauthorized(res);
  req.author = author;
  next();
};

// Einfache Bremse gegen Passwort-Raten: max. 10 Fehlversuche pro IP in 15 Minuten.
const attempts = new Map();
export const loginLimiter = (req, res, next) => {
  const key = req.ip;
  const t = Date.now();
  const list = (attempts.get(key) || []).filter((x) => t - x < 15 * 60 * 1000);
  attempts.set(key, list);
  if (list.length >= 10) return res.status(429).json({ detail: 'Zu viele Versuche. Bitte später erneut.' });
  res.on('finish', () => { if (res.statusCode === 401) list.push(Date.now()); });
  next();
};
