# isukato.com — komplette Mini-Site

Drop-in für **isukato.com** — Hosting empfohlen über Vercel.

## Inhalt

| Datei | Wird URL |
|-------|----------|
| `index.html` | `https://isukato.com/` (Homepage mit Apps-Übersicht) |
| `apps/brainoku.html` | `https://isukato.com/apps/brainoku` (Brainoku-Detail) |
| `datenschutz.html` | `https://isukato.com/datenschutz` |
| `impressum.html` | `https://isukato.com/impressum` |
| `agb.html` | `https://isukato.com/agb` |
| `vercel.json` | Routing-Config für Clean-URLs |

Bei künftigen Apps einfach eine neue Datei in `apps/` anlegen (z.B. `apps/meine-app.html`) und auf der Homepage in der `.app-grid` als `<a class="app-card" href="/apps/meine-app">…</a>` verlinken.

## Vor dem Hochladen ausfüllen

In den Legal-Files ersetzen:
- `[Anschrift einfügen]` / `[Straße + Hausnummer]` / `[PLZ + Ort]` → deine Adresse
- `[Bundesland einfügen]` → Bundesland für Datenschutzbehörde
- E-Mail `hallo@isukato.com` einrichten oder durch deine echte ersetzen

In `apps/brainoku.html`:
- `https://brainoku.vercel.app` → durch deine echte Brainoku-Deploy-URL ersetzen (oder lassen)

## Hosting auf Vercel (empfohlen, kostenlos)

```bash
cd legal-pages
git init
git add .
git commit -m "init isukato site"
gh repo create isukato --public --source=. --push
```

Dann auf vercel.com → New Project → das Repo importieren → Custom Domain `isukato.com` einrichten.

`vercel.json` sorgt automatisch für:
- `/datenschutz` (statt `/datenschutz.html`)
- `/impressum`
- `/agb`
- `/apps/brainoku`
- Redirect `/privacy → /datenschutz`, `/terms → /agb`, `/imprint → /impressum` für englische Direktanfragen

## Was die Apps damit machen

Brainoku Sudoku verlinkt aus dem Auth-Screen-Legal und den Settings auf:
- `isukato.com/datenschutz`
- `isukato.com/impressum`
- `isukato.com/agb`

Künftige Apps machen das genauso — alles auf einer zentralen Domain, einmal pflegen, überall gültig.
