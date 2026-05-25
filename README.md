# Home Assistant Desktop (Windows portable)

Windows **portable** fork of [DustyArmstrong/homeassistant-desktop](https://github.com/DustyArmstrong/homeassistant-desktop). No installer — extract, run, and copy the whole folder anywhere.

**[Download latest release](https://github.com/codychen98/homeassistant-desktop-portable-release/releases/latest)** (x64 zip)

## How this differs from upstream

| | Upstream | This fork |
|---|----------|-----------|
| Install | Installer (`.exe`) | Portable zip |
| App data | `%APPDATA%` | `data/` folder next to the `.exe` |
| Auto-start at login | Optional | Removed |
| In-app update prompts | Yes | Removed |
| Show window on startup | No | Optional (tray menu) |
| Close button (**X**) | Hides to tray | Optional: quit app (tray menu) |
| Refresh page | Not available | **F5** reloads the dashboard when the window is focused |
| Dashboard updates while unfocused | Browser-dependent | HA page keeps updating when another app is active (reduced background throttling) |
| Dashboard diagnostics | Not available | `HA-DIAG` lines in `data/logs/main.log` on focus/blur (visibility, WebSocket-related console) |
| Builds | Windows, macOS, Linux | Windows x64 portable only |

Everything else matches upstream (tray, global shortcut, Bonjour discovery, multiple HA instances, reconnect, etc.).

## Data layout

```
YourFolder/
  Home Assistant Desktop.exe
  data/              ← settings and cache (created on first run)
```

Back up or move the entire folder to keep your configuration.

## Updates

When [upstream](https://github.com/DustyArmstrong/homeassistant-desktop/releases) publishes a new release, this repo syncs automatically (twice daily) and publishes a matching portable zip on [Releases](https://github.com/codychen98/homeassistant-desktop-portable-release/releases).

Fork-only fixes between upstream versions use tags like `v1.6.10-portable.2`.

## Credit

Based on [homeassistant-desktop](https://github.com/DustyArmstrong/homeassistant-desktop) (Apache-2.0). See [LICENSE.md](LICENSE.md).

Maintainer notes: [README-PORTABLE.md](README-PORTABLE.md)
