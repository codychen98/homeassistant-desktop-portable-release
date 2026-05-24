//const Store = require('electron-store');
import Store from 'electron-store';

const store = new Store({
  defaults: {
    automaticSwitching: true,
    autoReconnect: true,
    detachedMode: false,
    disableHover: false,
    showOnStartup: false,
    stayOnTop: false,
    fullScreen: false,
    shortcutEnabled: true,
    shortcutFullscreenEnabled: false,
    userShortcut: "CommandOrControl+Alt+X",
    userTrayIcon: "IconWin.png",
    forceScaling: false,
    highDPIMode: false,
    allInstances: [],
  },
});

export default store;