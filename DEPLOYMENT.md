# Brainoku Sudoku — Deployment-Anleitung

## Voraussetzungen
- Node.js installiert (für Vercel CLI optional)
- GitHub-Account (kostenlos)
- Vercel-Account (kostenlos, mit GitHub verbinden)
- Supabase-Account (kostenlos)
- Google Cloud Console (kostenlos, für Google-Login)
- Facebook for Developers (kostenlos, für Facebook-Login)
- Apple Developer Program (99 €/Jahr, NUR wenn du Apple Sign-In willst)

---

## 1. Supabase einrichten (~10 Min)

1. Auf https://supabase.com einloggen → **New Project**.
2. Name z.B. `brainoku`, Region `Frankfurt (eu-central-1)`, Passwort speichern.
3. Warten bis das Projekt fertig ist (~2 Min).
4. Links: **SQL Editor** → **New Query** → den Inhalt von `supabase-schema.sql` einfügen → **Run**.
5. Links: **Settings** → **API** → Werte kopieren:
   - `Project URL` → das ist dein `SUPABASE_URL`
   - `anon public` Key → das ist dein `SUPABASE_ANON_KEY`

### Auth-Provider freischalten

Links: **Authentication** → **Providers**:

**Google** (kostenlos):
1. https://console.cloud.google.com/ → **Neues Projekt** anlegen.
2. **APIs & Services** → **OAuth-Zustimmungsbildschirm** → "Extern" → ausfüllen (App-Name "Brainoku", Support-Mail, Logo optional, Domain leer lassen).
3. **APIs & Services** → **Anmeldedaten** → **OAuth 2.0-Client-ID erstellen** → "Webanwendung":
   - **Autorisierte JavaScript-Quellen**: deine Vercel-URL (z.B. `https://brainoku.vercel.app`)
   - **Autorisierte Weiterleitungs-URIs**: `https://<dein-supabase-projekt>.supabase.co/auth/v1/callback`
4. `Client ID` und `Client Secret` in Supabase → Authentication → Providers → Google eintragen → speichern.

**Facebook** (kostenlos):
1. https://developers.facebook.com/ → **Meine Apps** → **App erstellen** → "Konsumenten" → Brainoku.
2. **Facebook Login** → **Web** hinzufügen.
3. **Einstellungen → Grundlegend**: App-ID + App-Secret kopieren.
4. **Facebook Login → Einstellungen**: Valid OAuth Redirect URIs:
   `https://<dein-supabase-projekt>.supabase.co/auth/v1/callback`
5. In Supabase → Providers → Facebook: ID + Secret eintragen.

**Apple** (99 €/Jahr Apple Developer):
1. https://developer.apple.com/ → **Certificates, IDs & Profiles** → **Identifiers** → "+" → **Services IDs** → `de.brainoku.signin` (oder ähnlich).
2. "Sign in with Apple" aktivieren → konfigurieren → Domain + Return-URL `https://<dein-supabase-projekt>.supabase.co/auth/v1/callback`.
3. **Keys** → "+" → "Sign in with Apple" Key generieren → `.p8`-Datei herunterladen.
4. In Supabase → Providers → Apple: Services-ID, Team-ID, Key-ID + Inhalt des .p8-Files eintragen.

**Email** (sofort einsatzbereit):
- Schon out-of-the-box aktiv. Magic-Link-Mails kommen über den kostenlosen Supabase-SMTP (begrenzt auf 30/h, für Production später eigenen SMTP-Provider wie Resend einrichten).

---

## 2. Code mit Supabase verbinden

In `index.html` nach `// Trage deine Supabase-Keys ein` die zwei Konstanten füllen:

```js
const SUPABASE_URL      = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...';
```

Solange beide leer sind läuft der App im **Demo-Modus** — die Provider-Buttons erzeugen lokale Mock-Accounts. Sobald die Keys drin sind: echte OAuth-Flows.

---

## 3. Vercel deployen (~5 Min)

### Option A: Per Git (empfohlen für Updates)
1. `git init` im Projektordner, `git add .`, `git commit -m "init"`.
2. Repo auf GitHub erstellen, pushen.
3. https://vercel.com → **Add New** → **Project** → GitHub-Repo wählen → **Deploy**.
4. Fertig — du bekommst eine URL wie `https://brainoku.vercel.app`.

### Option B: Per CLI (Direkt-Deploy)
```bash
npm i -g vercel
cd D:\Projekte\sudoku
vercel
# Fragen: Set up and deploy → Y, Project name → brainoku, Directory → ./
vercel --prod   # für Production-URL
```

### Custom Domain (optional)
Vercel → Project → **Settings** → **Domains** → eigene Domain hinzufügen (z.B. `brainoku.de`). DNS-Records bei deinem Registrar setzen, fertig in 5 Min.

---

## 4. Auf dem Handy zum Home-Screen hinzufügen

**iOS Safari**:
1. URL öffnen
2. Teilen-Button (Pfeil hoch) → **Zum Home-Bildschirm**
3. App-Icon erscheint, Tap startet im Vollbildmodus

**Android Chrome**:
1. URL öffnen
2. Drei-Punkte-Menü → **App installieren** (oder Banner unten erscheint automatisch)
3. App-Icon erscheint im App-Drawer

---

## 5. Was läuft bereits ohne Supabase?
- Komplettes Spiel inkl. Streak, Level, Achievements, Coins, Themes, Shop
- Lokales Speichern via `localStorage`
- PWA-Installation auf Home-Screen
- Auth im Demo-Modus (Provider-Buttons erzeugen lokale Mock-Accounts)

## 6. Was geht NUR mit Supabase?
- Echte Account-Erstellung mit Google/Apple/Facebook/Email
- Cloud-Sync zwischen Geräten (muss noch implementiert werden — siehe TODO)
- Persistenz nach Browser-Cache-Clear

## TODO für vollen Cloud-Sync (späterer Schritt)
- `state` periodisch an `user_state.data` (jsonb) senden via `supabase.from('user_state').upsert(...)`
- Beim Login `user_state` laden und mit lokalem State mergen (newest-wins per Feld)
- Realtime-Subscription für Multi-Device-Sync
