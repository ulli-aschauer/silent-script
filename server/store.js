// Einfacher Datenspeicher: eine JSON-Datei, atomar geschrieben.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = process.env.DATA_DIR || path.resolve(import.meta.dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const empty = () => ({ quotes: [], inquiries: [], authors: [], assignments: [] });

fs.mkdirSync(DATA_DIR, { recursive: true });

let db = empty();
if (fs.existsSync(DB_FILE)) {
  db = { ...empty(), ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) };
}

const save = () => {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
};

export const newId = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

const byNewest = (a, b) => (a.created_at < b.created_at ? 1 : -1);

export const store = {
  list: (coll) => [...db[coll]].sort(byNewest),
  find: (coll, pred) => db[coll].find(pred),
  insert: (coll, item) => {
    const row = { id: newId(), created_at: now(), ...item };
    db[coll].push(row);
    save();
    return row;
  },
  update: (coll, id, patch) => {
    const row = db[coll].find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, patch);
    save();
    return row;
  },
  remove: (coll, id) => {
    const before = db[coll].length;
    db[coll] = db[coll].filter((r) => r.id !== id);
    if (db[coll].length !== before) save();
    return db[coll].length !== before;
  },
};

// Geheimer Schlüssel für Login-Tokens: aus .env oder einmalig erzeugt und gespeichert.
export const getSecret = () => {
  if (process.env.TOKEN_SECRET) return process.env.TOKEN_SECRET;
  const f = path.join(DATA_DIR, 'secret.key');
  if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(48).toString('hex'));
  return fs.readFileSync(f, 'utf8').trim();
};
