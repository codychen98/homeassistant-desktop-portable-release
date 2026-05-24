# Home Assistant Desktop (Windows portable fork)

Portable Windows builds of [DustyArmstrong/homeassistant-desktop](https://github.com/DustyArmstrong/homeassistant-desktop). Extract a zip, run the exe, and keep all app data in a `data` folder beside the executable (not `%APPDATA%`).

This fork removes auto-start at login and in-app update checks. Optional **Show Window on Startup** is in the tray menu (right-click the tray icon).

## Automatic upstream sync

**Sync upstream release** runs twice daily (08:00 and 20:00 UTC) and on manual dispatch. When [upstream publishes a new release](https://github.com/DustyArmstrong/homeassistant-desktop/releases) that your fork has not built yet, it will:

1. Merge `DustyArmstrong/homeassistant-desktop` `master`
2. Re-apply portable customizations from `portable-overlay/`
3. Push `master`, create tag `vX.Y.Z`, and trigger **Release Windows Portable**

No action needed on your fork unless sync fails (a GitHub issue is opened automatically).

## Manual release (optional)

```bash
git tag v1.6.10
git push origin v1.6.10
```

Or run **Release Windows Portable** from the Actions tab.

## Build locally (optional)

Requires Node.js. On low-spec hosts, prefer CI instead of local `electron-builder` runs.

```bash
npm ci
npm run build-win-portable
```

## Data layout after extract

```
Home-Assistant-Desktop-v1.6.10-win-x64-portable/
  Home Assistant Desktop.exe
  data/                  # created on first run
    userData/            # settings (electron-store), cache
    appData/
    sessionData/
    logs/
  ... (other Electron runtime files)
```

Back up or move the whole extracted folder to keep your Home Assistant URL and preferences.

## Maintaining portable customizations

Fork-specific files live in `portable-overlay/` and are copied on every upstream sync. If upstream changes `app.js` in ways you want, merge those edits into `portable-overlay/app.js` manually, then commit.

Portable-specific runtime files: `portable-paths.js`, `app.js` (menu/startup), `config.js`, and `.github/workflows/`.
