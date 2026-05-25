import logger from "electron-log";

/**
 * Portable fork: F5 reloads the connected Home Assistant dashboard when the
 * main window is focused. Kept in a separate file so upstream app.js merges
 * only need a single import + register call in portable-overlay/app.js.
 */

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

export function registerPortableF5Refresh(mainWindow, getAllInstances) {
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown" || input.key !== "F5") {
      return;
    }

    if (!mainWindow.isFocused()) {
      return;
    }

    const instances = typeof getAllInstances === "function" ? getAllInstances() : [];
    const pageUrl = mainWindow.webContents.getURL();

    if (!isConfiguredInstanceUrl(pageUrl, instances)) {
      return;
    }

    event.preventDefault();
    logger.info("Dashboard refresh (F5)");
    mainWindow.webContents.reload();
  });
}
