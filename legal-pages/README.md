# Legal Pages für isukato.com

Generische Legal-Pages für **alle Apps** von Nico Heidrich.

## Inhalt

- `datenschutz.html` → soll unter `https://isukato.com/datenschutz` erreichbar sein
- `impressum.html` → `https://isukato.com/impressum`
- `agb.html` → `https://isukato.com/agb`

## Vor dem Veröffentlichen ausfüllen

In allen drei Dateien sind Platzhalter, die du noch ersetzen musst:

| Platzhalter | Wo? | Was rein? |
|-------------|-----|-----------|
| `[Anschrift einfügen]` | Datenschutz | Vollständige Adresse |
| `[Straße + Hausnummer einfügen]` | Impressum | Straße + Nummer |
| `[PLZ + Ort einfügen]` | Impressum | Postleitzahl und Ort |
| `[Bundesland einfügen]` | Datenschutz | Dein Bundesland (für die Datenschutzbehörde) |

Außerdem: die E-Mail `hallo@isukato.com` musst du einrichten (oder durch deine echte Mail ersetzen).

## Hosting

Drei einfache Wege:

**1. Vercel** (empfohlen, kostenlos)
- Lade `legal-pages/` als eigenes Repo auf GitHub hoch
- Verbinde mit Vercel
- Custom Domain `isukato.com` eintragen
- Vercel serviert die HTML-Files unter den Routes automatisch

**2. GitHub Pages**
- Repo auf GitHub Pages aktivieren
- Custom Domain konfigurieren

**3. Klassisches Webhosting**
- Per FTP hochladen, fertig

## URL-Schema

Empfehlung: `https://isukato.com/datenschutz` (ohne `.html`-Endung). Das geht bei Vercel automatisch via `vercel.json`:

```json
{
  "cleanUrls": true
}
```

## Was die Apps damit machen

Alle Apps (Brainoku Sudoku, künftige) verlinken auf:
- `/datenschutz` → Settings → Datenschutz, Auth-Screen-Legal
- `/impressum` → Settings → Impressum
- `/agb` → Auth-Screen-Legal

Beim Linkklick öffnet sich isukato.com im externen Browser/Safari (`target="_blank"`), nicht inline in der App.
