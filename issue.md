Here is a concise summary of the issue.

What you want
On the Cameras dashboard, the motion clip thumbnails under the live feed should appear as new clips are recorded, the same way they do in Firefox on the same Home Assistant URL. The live WebRTC stream should stay running and not blink or reload.

What actually happens in the desktop app
New clips show up in Firefox, but the app thumbnail row stays behind until you restart the app or press F5.
After you play a clip, you often cannot return to live without a restart/F5 (menu is hidden).
This happens even when you switch to Firefox with the app still open (Detached Mode does not fix it).
What we ruled out
Frigate → HA is not the main cause. Same HA URL in Firefox updates thumbnails in real time.
Not “window hidden.” HA-DIAG showed on blur: window still visible, visibilityState: 'visible', hidden: false, hasFocus: false.
Background throttling flags (backgroundThrottling: false, timer throttling off) did not fix it.
Keeping the HA tab “active” on motion did not help, which matches the visibility logs.
What is likely going on
The Home Assistant page inside Electron is not applying Advanced Camera Card / Frigate event/thumbnail updates the way a normal browser does when the window is unfocused (and possibly even when focused). Live video (RTC) can still run; the clip strip is a separate UI path and gets stuck until a full page reload.

Console differences (app vs Firefox): AbortError: Transition was skipped and HA logging failures in Electron — possible extra clues, not proven as the cause. WebSocket Messages was never fully confirmed (whether HA events keep arriving while Firefox is focused).

What we tried in the app
Change	Result
F5 reload when focused
Works as a workaround; same as restart for this symptom
Disable Electron background throttling
Did not make thumbnails live
Diagnostics (HA-DIAG)
Confirmed not classic page-hidden
10s full page reload
Would refresh clips, but interrupts live — you don’t want that
Soft card nudge when focused, reload when unfocused
Still not “thumbnails only”; you want refresh whether focused or not, without touching live
Constraint
The desktop app cannot surgically refresh only the thumbnail carousel. That lives inside Advanced Camera Card. A full reload() always tears down WebRTC. A YAML in-place re-render (view.render_entities / Frigate triggers with trigger: update) is the realistic way to refresh clips without restarting live — if the card still receives events.

Bottom line
Issue: Electron HA frontend + Advanced Camera Card does not keep the live-view clip strip in sync like Firefox, especially when another app is focused. Workaround: F5/restart. Desired fix: real-time thumbnails, live stream uninterrupted.


is below a possible reason and a solution?

## Problem

When Home Assistant records new Frigate motion event thumbnails, the app keeps showing stale thumbnails until F5 is pressed manually. Opening the same Home Assistant URL in a regular browser auto-updates the thumbnails without any manual intervention.

## Suspected root cause

Electron's HTTP disk cache serves stale image bytes for Frigate/camera thumbnail URLs (e.g. `/api/frigate/...`, `/api/camera_proxy/...`). Browsers revalidate these requests (and HA's service worker handles cache-busting), but the Electron `net` stack returns cached bytes for the same URLs until a reload bypasses the cache.

Note: background throttling is not the cause — it's already handled by `portable-background-updates.js`.

## Proposed fix

Add a new portable-fork module `portable-thumbnail-nocache.js` (at repo root and in `portable-overlay/`, following the pattern of `portable-f5-refresh.js` and friends) that forces no-cache on thumbnail image requests:

```javascript
import logger from "electron-log";

/**
 * Portable fork: bypass Electron's HTTP cache for Frigate/camera thumbnails so
 * new motion event thumbnails show without a manual F5.
 */

const THUMBNAIL_PATTERNS = [
  "/api/frigate/",          // frigate integration proxy (thumbnails, snapshots)
  "/api/camera_proxy",      // HA camera stills
  "/api/media_player_proxy",
  "thumbnail",              // catch-all for event thumbnails
];

export function registerPortableThumbnailNoCache(mainWindow) {
  const ses = mainWindow.webContents.session;

  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    const url = details.url.toLowerCase();
    if (details.resourceType === "image" && THUMBNAIL_PATTERNS.some((p) => url.includes(p))) {
      details.requestHeaders["Cache-Control"] = "no-cache";
      details.requestHeaders["Pragma"] = "no-cache";
    }
    callback({ requestHeaders: details.requestHeaders });
  });

  logger.info("Portable: thumbnail cache bypass registered");
}
```

Then in both `app.js` and `portable-overlay/app.js`, add the import `import { registerPortableThumbnailNoCache } from "./portable-thumbnail-nocache.js";` and call it next to the existing register calls in `createMainWindow`:

```javascript
registerPortableF5Refresh(mainWindow, () => config.get("allInstances") ?? []);
registerPortableBackgroundUpdates(mainWindow, () => config.get("allInstances") ?? []);
registerPortableDashboardDiagnostics(mainWindow, () => config.get("allInstances") ?? []);
registerPortableThumbnailNoCache(mainWindow);
```

If `HA-DIAG` logs show `visibilityState: "hidden"` while the window is visible, a synthetic `visibilitychange` dispatch on window focus may also be needed as a fallback, since some Frigate card versions only refresh their gallery on visibility changes.