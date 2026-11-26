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
Das Autorenportal und die Kundenbestätigung zeigen dort eine Testansicht mit Beispieldaten.

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

| Adresse                  | Zweck                                                                 |
|--------------------------|-----------------------------------------------------------------------|
| `/`                      | Website mit Angebotsformular                                          |
| `/kontakt`               | Kontaktformular                                                       |
| `/autoren`               | Autorenportal: Registrierung, passende Aufträge, Bewerbungen, Verdienst, Historie, Verfügbarkeit |
| `/admin`                 | Team: Aufträge, Bewerbungen, Freischaltung der Autor:innen, Kontaktanfragen |
| `/bestaetigung/<link>`   | Für Kund:innen: Autor:in prüfen und nach dem Erstgespräch entscheiden |

## Ablauf eines Auftrags

1. **Kunde stellt Anfrage** (Startseite). Sie wird sofort als offener Auftrag veröffentlicht.
2. **Passende Autor:innen werden per E-Mail informiert**: gleicher Fachbereich, freigeschaltet, und
   „verfügbar“ oder „trotzdem informieren“ eingeschaltet. Kundendaten sind dabei nicht sichtbar.
3. **Autor:innen bewerben sich** im Portal.
4. **Team stellt eine Person vor** (Admin → „Dem Kunden vorstellen“). Der Kunde erhält Name,
   Qualifikation und Hochschulen der Person und prüft, ob z.B. ein:e Prüfer:in dabei ist.
5. **Kunde bestätigt** → erst jetzt sieht die Autor:in Name und E-Mail des Kunden. Erstgespräch.
6. **Beide entscheiden**: sagen beide zu, ist der Auftrag „in Arbeit“. Sagt eine Seite ab, ist er wieder offen.
7. **Team schließt ab** → erscheint in Historie und Verdienst der Autor:in.

Neue Registrierungen müssen im Admin-Bereich freigeschaltet werden.
Ohne E-Mail-Versand zeigt der Admin-Bereich den Link für den Kunden zum manuellen Weitergeben an.

## Gestaltung (CSS)

Die Seite nutzt die übernommene `src/index.css`. Fehlende Tailwind-Klassen ergänzt
`npm run css:extra` automatisch in `src/extra.css` (läuft auch bei `npm run build`).
Nach Änderungen an Klassen im Entwicklungsmodus einmal `npm run css:extra` ausführen.

## E-Mail-Benachrichtigung

E-Mails gehen an das Team (`NOTIFY_TO`: neue Anfragen, Registrierungen, Erstgespräche), an passende
Autor:innen (neue Aufträge, Freischaltung, Ergebnis) und an Kund:innen (Autor:in prüfen, Entscheidung).
Antworten auf Team-Mails zu Anfragen gehen direkt an die anfragende Person.
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

Ohne `SMTP_HOST` werden keine E-Mails versendet. Alles funktioniert trotzdem über Portal und Admin-Bereich.
Fällt der Mailserver aus, wird die Anfrage trotzdem gespeichert. Der Fehler steht dann im Backend-Log.

## Daten

Alle Daten liegen in `server/data/db.json`. Den Ordner regelmäßig sichern.
`server/data/secret.key` signiert die Logins: Wird er gelöscht, müssen sich alle neu anmelden.
Passwörter der Autor:innen werden nur als Hash (scrypt) gespeichert.
