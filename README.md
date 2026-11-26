# Silent Script

Website (React + Vite) mit eigenem Backend (Node + Express).

## Einrichten

```powershell
npm install
copy .env.example .env   # dann ADMIN_PASSWORD in .env setzen
```

## Entwicklung (zwei Terminals)

```powershell
npm run server   # Backend auf http://localhost:8001
npm run dev      # Website auf http://localhost:3000 (leitet /api ans Backend weiter)
```

## Produktion (ein Server)

```powershell
npm run build
npm start        # Website + API auf http://localhost:8001
```

## Testversion auf GitHub Pages (kostenlos, ohne Backend)

Adresse: https://ulli-aschauer.github.io/silent-script/

Bei jedem Push auf `main` baut GitHub die Seite im **Testmodus** und veröffentlicht sie
(`.github/workflows/pages.yml`). Im Testmodus speichern Formulare und Logins nichts.
Stattdessen erscheint: „Ist im Testzustand nicht sichtbar. Wird erst angezeigt, wenn die Seite Online ist.“

Einmalig in GitHub einrichten: **Settings → Pages → Source: GitHub Actions**.

Eigene Domain für die Testversion: In `pages.yml` `VITE_BASE` auf `/` setzen,
dann unter **Settings → Pages → Custom domain** die Domain eintragen und beim Domain-Anbieter
die angezeigten DNS-Einträge setzen.

## Online stellen mit Backend (Render.com)

Die Datei `render.yaml` beschreibt alles: Build, Start, Datenspeicher (1 GB) und Einstellungen.

1. Code auf GitHub hochladen (privates Repository).
2. Auf render.com: **New → Blueprint** → das Repository auswählen.
3. Werte eintragen, die Render abfragt:
   - `ADMIN_PASSWORD`: sicheres Passwort für `/admin`
   - `SITE_URL`: z.B. `https://silent-script.onrender.com`
   - SMTP-Felder: vorerst leer lassen
4. **Apply**. Nach ein paar Minuten ist die Seite unter `https://<name>.onrender.com` erreichbar.

Jeder neue Push auf `main` wird automatisch veröffentlicht.

### Später auf die eigene Domain umstellen

Am Code ändert sich nichts, die Seite funktioniert unter jeder Domain.

1. Render → Service → **Settings → Custom Domains** → Domain eintragen (z.B. `www.silent-script.com`).
2. Beim Domain-Anbieter die DNS-Einträge setzen, die Render anzeigt (meist ein CNAME auf `<name>.onrender.com`).
3. Render erstellt das HTTPS-Zertifikat automatisch.
4. In Render die Umgebungsvariable `SITE_URL` auf die neue Domain ändern.

## Bereiche

| Adresse    | Zweck                                                               |
|------------|---------------------------------------------------------------------|
| `/`        | Website mit Angebots- und Kontaktformular                           |
| `/admin`   | Dashboard: Anfragen ansehen, Autor:innen und Aufträge verwalten     |
| `/autoren` | Login für Autor:innen: offene Aufträge ansehen und übernehmen        |

## E-Mail-Benachrichtigung

Bei jeder neuen Angebots- oder Kontaktanfrage geht eine E-Mail an `NOTIFY_TO`.
Wer auf diese E-Mail antwortet, schreibt direkt an die anfragende Person.
Dafür in `.env` die SMTP-Zugangsdaten Ihres E-Mail-Anbieters eintragen und das Backend neu starten:

| Variable    | Beispiel                     |
|-------------|------------------------------|
| `SMTP_HOST` | `smtp.ihr-anbieter.de`       |
| `SMTP_PORT` | `587` (oder `465`)           |
| `SMTP_USER` | `kontakt@silent-script.com`  |
| `SMTP_PASS` | Passwort bzw. App-Passwort   |
| `MAIL_FROM` | `kontakt@silent-script.com`  |
| `NOTIFY_TO` | `team@silent-script.com`     |
| `SITE_URL`  | `https://www.silent-script.com` |

Ohne `SMTP_HOST` und `NOTIFY_TO` werden keine E-Mails versendet. Die Anfragen landen trotzdem im Dashboard.
Fällt der Mailserver aus, wird die Anfrage trotzdem gespeichert. Der Fehler steht dann im Backend-Log.

## Daten

Alle Daten liegen in `server/data/db.json`. Den Ordner regelmäßig sichern.
`server/data/secret.key` signiert die Logins: Wird er gelöscht, müssen sich alle neu anmelden.
Passwörter der Autor:innen werden nur als Hash (scrypt) gespeichert.
