// Testmodus: Seite läuft ohne Backend (z.B. GitHub Pages).
// Aktiv, wenn beim Bauen VITE_STATIC_DEMO=true gesetzt ist.
export const DEMO = import.meta.env.VITE_STATIC_DEMO === 'true';

export const DEMO_TEXT = 'Ist im Testzustand nicht sichtbar. Wird erst angezeigt, wenn die Seite Online ist.';

// Interne Links mit Unterpfad (z.B. /silent-script/autoren auf GitHub Pages)
export const url = (p) => import.meta.env.BASE_URL.replace(/\/$/, '') + p;
