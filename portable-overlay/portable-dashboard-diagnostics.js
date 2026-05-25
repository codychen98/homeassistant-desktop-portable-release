import logger from "electron-log";

/**
 * Portable fork: log window focus and page visibility while on the HA dashboard
 * to diagnose stale motion clips vs browser. Separate file for upstream merges.
 */

const DIAG = "HA-DIAG";

const CONSOLE_KEYWORDS = [
  "visibility",
  "websocket",
  "disconnect",
  "reconnect",
  "frigate",
  "advanced-camera",
  "connection lost",
  "connection closed",
];

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

function pageUrlForLog(pageUrl) {
  try {
    const url = new URL(pageUrl);
    return `${url.origin}${url.pathname}`;
  } catch {
    return pageUrl;
  }
}

async function snapshotRendererState(webContents) {
  try {
    return await webContents.executeJavaScript(
      `(() => ({
        visibilityState: document.visibilityState,
        hidden: document.hidden,
        hasFocus: document.hasFocus(),
      }))()`,
      true
    );
  } catch (error) {
    return { error: String(error) };
  }
}

function windowState(mainWindow) {
  return {
    focused: mainWindow.isFocused(),
    visible: mainWindow.isVisible(),
    minimized: mainWindow.isMinimized(),
  };
}

export function registerPortableDashboardDiagnostics(mainWindow, getAllInstances) {
  logger.info(`${DIAG} dashboard diagnostics enabled`);

  const instances = () => (typeof getAllInstances === "function" ? getAllInstances() : []);

  const logIfHaDashboard = async (event, includeRenderer = false) => {
    const pageUrl = mainWindow.webContents.getURL();
    if (!isConfiguredInstanceUrl(pageUrl, instances())) {
      return;
    }

    logger.info(`${DIAG} window.${event}`, {
      ...windowState(mainWindow),
      page: pageUrlForLog(pageUrl),
    });

    if (includeRenderer) {
      const renderer = await snapshotRendererState(mainWindow.webContents);
      logger.info(`${DIAG} renderer.${event}`, renderer);
    }
  };

  mainWindow.on("focus", () => logIfHaDashboard("focus", true));
  mainWindow.on("blur", () => logIfHaDashboard("blur", true));
  mainWindow.on("show", () => logIfHaDashboard("show", false));
  mainWindow.on("hide", () => logIfHaDashboard("hide", false));

  mainWindow.webContents.on("did-finish-load", () => {
    const pageUrl = mainWindow.webContents.getURL();
    if (!isConfiguredInstanceUrl(pageUrl, instances())) {
      return;
    }
    logger.info(`${DIAG} page.loaded`, {
      ...windowState(mainWindow),
      page: pageUrlForLog(pageUrl),
    });
  });

  mainWindow.webContents.on("console-message", (_event, level, message, _line, sourceId) => {
    const text = String(message);
    const lower = text.toLowerCase();
    if (!CONSOLE_KEYWORDS.some((keyword) => lower.includes(keyword))) {
      return;
    }

    const pageUrl = mainWindow.webContents.getURL();
    if (!isConfiguredInstanceUrl(pageUrl, instances())) {
      return;
    }

    logger.info(`${DIAG} console`, {
      level,
      source: sourceId,
      message: text.length > 500 ? `${text.slice(0, 500)}…` : text,
    });
  });
}
