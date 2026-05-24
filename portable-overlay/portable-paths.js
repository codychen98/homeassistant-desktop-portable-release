import { app } from "electron";
import path from "path";

/**
 * Windows portable: store profile data next to the extracted app (not %APPDATA%).
 * Import this module before config.js so electron-store uses the redirected paths.
 */
function applyPortablePaths() {
  if (process.platform !== "win32") {
    return;
  }

  const installDir = path.dirname(app.getPath("exe"));
  const dataRoot = path.join(installDir, "data");

  app.setPath("userData", path.join(dataRoot, "userData"));
  app.setPath("appData", path.join(dataRoot, "appData"));
  app.setPath("sessionData", path.join(dataRoot, "sessionData"));
  app.setPath("logs", path.join(dataRoot, "logs"));
}

applyPortablePaths();
