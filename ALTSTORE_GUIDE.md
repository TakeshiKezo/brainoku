# Brainoku per AltStore aufs iPhone bringen (ohne App Store, ohne Mac)

Du baust unter Windows ein **unsigned .ipa** über GitHub Actions (kostenloser macOS-Cloud-Runner) und installierst es per AltStore auf dein iPhone — **ohne App-Store, ohne 99 €/Jahr Apple-Developer-Account, ohne Mac**.

⚠️ **Begrenzung mit kostenloser Apple-ID**: App läuft 7 Tage, danach muss AltServer auf dem PC neu signieren (geschieht automatisch, wenn iPhone und PC im selben WLAN sind). Maximal 3 selbst-installierte Apps gleichzeitig.

---

## Übersicht der Schritte
1. Code auf GitHub pushen
2. GitHub Actions baut die .ipa (~10 Min, vollautomatisch)
3. AltServer auf Windows installieren
4. AltStore aufs iPhone schieben
5. .ipa in AltStore importieren → fertig

---

## Schritt 1: Code auf GitHub pushen

```bash
cd D:\Projekte\sudoku
git init
git add .
git commit -m "init brainoku"
```

Auf https://github.com → New Repository → Name z.B. `brainoku` → **Public** (für freie GitHub-Actions-Minuten) oder **Private** (begrenztes Free-Kontingent: 2000 Min/Monat, reicht trotzdem locker).

```bash
git remote add origin https://github.com/<dein-user>/brainoku.git
git push -u origin main
```

## Schritt 2: iOS-.ipa in der Cloud bauen

1. Auf GitHub: dein Repo → Tab **Actions**
2. Links: Workflow „Build iOS .ipa (unsigned, für AltStore)" wählen
3. Rechts: Button **Run workflow** → Run workflow
4. ~10 Minuten warten (macOS-Runner spinnt hoch, baut Pods, archiviert, packt)
5. Erfolgreicher Run → unten **Artifacts** → **Brainoku-unsigned-ipa** herunterladen
6. ZIP entpacken → `Brainoku-unsigned.ipa`

> **Falls der Build fehlschlägt**: meistens an CocoaPods-Update. Workflow nochmal triggern. Wenn's immer noch hängt — Log im Actions-Tab anschauen, sag mir die Fehlermeldung.

## Schritt 3: AltServer auf Windows einrichten

1. **iCloud für Windows** (nicht aus Microsoft Store, sondern direkt von Apple):
   https://support.apple.com/de-de/HT204283 → installieren, mit Apple-ID einloggen.
2. **iTunes für Windows** (auch direkt von Apple, NICHT Microsoft Store):
   https://www.apple.com/itunes/download/win64 → installieren.
3. **AltServer**:
   https://altstore.io → "AltServer for Windows" herunterladen → entpacken → `AltServer.exe` doppelklicken.
   Es erscheint ein kleines Diamant-Icon im System-Tray (rechts unten neben der Uhr).

## Schritt 4: AltStore aufs iPhone installieren

1. iPhone via **USB-Kabel** an PC. In iTunes „Diesem Computer vertrauen" tippen.
2. AltServer-Tray-Icon → Rechtsklick → **Install AltStore** → dein iPhone wählen.
3. Apple-ID + Passwort eingeben (wird nur lokal an dein iPhone weitergegeben, nicht an Apple gesendet — das ist der ganze Trick).
4. Auf dem iPhone: **Einstellungen → Allgemein → VPN & Geräteverwaltung → Entwickler-App → deine Apple-ID → „Vertrauen"**.
5. AltStore-Icon erscheint auf dem Home-Screen.

## Schritt 5: Brainoku.ipa installieren

1. `Brainoku-unsigned.ipa` aufs iPhone bringen — am einfachsten:
   - **AirDrop** vom Mac (falls du einen hast)
   - **iCloud Drive** (Datei rüberziehen, am iPhone in „Dateien" öffnen)
   - **Telegram an dich selbst** (Datei senden, am iPhone Datei runterladen)
2. AltStore-App auf dem iPhone öffnen → Tab **My Apps** → **+** oben rechts → die `.ipa`-Datei auswählen.
3. App wird signiert (~30 Sek). „Installing..." → fertig.
4. Brainoku-Icon erscheint auf dem Home-Screen, beim ersten Start einmal in Einstellungen vertrauen (siehe Schritt 4 für die Apple-ID).

---

## Tägliche Realität: 7-Tage-Re-Signing

- Mit kostenloser Apple-ID **läuft die App 7 Tage**, dann ist sie nicht mehr startbar.
- **AltServer signiert automatisch neu**, wenn dein iPhone und der PC mit AltServer im **gleichen WLAN** sind und AltServer läuft (Tray-Icon).
- Du siehst das in AltStore → My Apps → die Restdauer pro App.
- Lange offline (z.B. Urlaub ohne PC): App kann temporär ungültig werden, kommt nach Re-Sign zu Hause wieder.

## Bezahltes Apple-Developer-Konto (99 €/Jahr) — Alternative

Falls du den 7-Tage-Zwang nicht magst: Apple Developer-Konto kaufen → in AltStore unter Settings deine bezahlte Apple-ID hinterlegen → Apps signieren mit Provisioning für **1 Jahr Laufzeit** (statt 7 Tage). Aber wenn du eh Apple Developer hast, kannst du gleich richtig in den App-Store releasen.

## SideStore — modernere Alternative zu AltStore

Aktiver gepflegter Fork: https://sidestore.io/

- Kein PC im selben WLAN nötig (re-signiert via VPN-Trick)
- Sonst sehr ähnlicher Workflow
- Gleiche `.ipa` funktioniert

Falls AltStore-Re-Signing dich nervt → SideStore ist häufig stabiler.

---

## Troubleshooting

**„Failed to register iOS device"** beim AltServer-Setup
→ iPhone muss bei iCloud + iTunes als „bekanntes Gerät" registriert sein. iTunes öffnen, Gerät erscheint links → einmal synchronisieren oder zumindest „erkennen".

**„Could not find App.xcworkspace"** im Build
→ Bedeutet `npx cap add ios` hat den iOS-Folder nicht erzeugt. Lokal testen:
```bash
npm install
npm run cap:add:ios
```
Falls das klappt → `ios/`-Folder committen + pushen, dann den Workflow nochmal laufen lassen.

**Kostenlose Apple-ID akzeptiert keine 2FA**
→ App-spezifisches Passwort generieren auf https://appleid.apple.com → das verwenden.

**App stürzt direkt nach Start ab**
→ Meistens iOS-spezifische API, die nicht da ist (z.B. WebKit-Beschränkung). Logs via macOS Console oder Xcode-Console anschauen. Bei Bedarf melden.

**„App not Available — needs to be re-signed"** nach 7 Tagen
→ AltServer auf PC starten, iPhone ins gleiche WLAN, in AltStore „Refresh All" tippen.
