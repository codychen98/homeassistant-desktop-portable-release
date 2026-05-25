import { app } from "electron";
import logger from "electron-log";

/**
 * Portable fork: keep the Home Assistant renderer updating when another app has
 * focus (e.g. Firefox). Separate from portable-f5-refresh.js for upstream merges.
 */

let commandLineApplied = false;

function isConfiguredInstanceUrl(pageUrl, instances) {
  if (!pageUrl || pageUrl.startsWith("file:") || !Array.isArray(instances) || instances.length === 0) {
    return false;
  }

  let pageOrigin;
  try {
    pageOrigin = new URL(pageUrl).origin;
  } catch {
    return false;
  }

  return instances.some((instanceUrl) => {
    try {
      return new URL(instanceUrl).origin === pageOrigin;
    } catch {
      return false;
    }
  });
}

/** Call once at startup, before app.whenReady(). */
export function applyPortableBackgroundPolicy() {
  if (commandLineApplied) {
    return;
  }
  commandLineApplied = true;
  app.commandLine.appendSwitch("disable-background-timer-throttling");
  logger.info("Portable: background timer throttling disabled (command line)");
}

/** Merge into BrowserWindow webPreferences in createMainWindow. */
export const portableWebPreferences = {
  backgroundThrottling: false,
};

export function registerPortableBackgroundUpdates(mainWindow, getAllInstances) {
  const disableThrottling = () => {
    try {
      mainWindow.webContents.setBackgroundThrottling(false);
    } catch (error) {
      logger.error(`Portable background updates: ${error}`);
    }
  };

  disableThrottling();

  mainWindow.on("show", disableThrottling);
  mainWindow.on("focus", disableThrottling);

  mainWindow.webContents.on("did-finish-load", () => {
    const instances = typeof getAllInstances === "function" ? getAllInstances() : [];
    const pageUrl = mainWindow.webContents.getURL();

    if (!isConfiguredInstanceUrl(pageUrl, instances)) {
      return;
    }

    disableThrottling();
    logger.info("Portable: background throttling disabled for HA dashboard");
  });
}
