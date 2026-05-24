# Home Assistant Desktop (Windows portable fork)

Portable Windows builds of [DustyArmstrong/homeassistant-desktop](https://github.com/DustyArmstrong/homeassistant-desktop). Extract a zip, run the exe, and keep all app data in a `data` folder beside the executable (not `%APPDATA%`).

This fork removes auto-start at login and in-app update checks.

## GitHub fork (manual step)

Creating the repo on GitHub must be done in your account (the agent cannot fork for you without your credentials):

1. Open https://github.com/DustyArmstrong/homeassistant-desktop and click **Fork**.
2. On this machine, from `homeassistant-desktop-portable`:

```bash
git remote rename origin upstream
git remote add origin https://github.com/codychen98/homeassistant-desktop-portable-release.git
git push -u origin master
```

Or push to a new empty repo if you prefer a different name.

## Build locally (optional)

Requires Node.js. On low-spec hosts, prefer CI instead of local `electron-builder` runs.

```bash
npm ci
npm run build-win-portable
```

Output: `dist/win-unpacked/` and a zip after CI archives it.

## CI release

Push a version tag to trigger a portable zip on GitHub Releases:

```bash
git tag v1.6.10
git push origin v1.6.10
```

Or run **Release Windows Portable** from the Actions tab (`workflow_dispatch`).

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

## Syncing upstream

When [upstream releases](https://github.com/DustyArmstrong/homeassistant-desktop/releases) a new version:

```bash
git fetch upstream
git merge upstream/master   # or rebase; resolve conflicts if any
# bump package.json version if needed
git tag vX.Y.Z
git push origin master --tags
```

Portable-specific changes live in `portable-paths.js`, `app.js` (menu/startup), and `.github/workflows/release-windows-portable.yml`.
