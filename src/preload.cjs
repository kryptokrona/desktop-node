// preload.cjs

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    sendSync: (channel, data) => {
      ipcRenderer.sendSync(channel, data);
    },
    receive: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    startNode: () => {
      ipcRenderer.send("startNode");
    },
    // 2026-10-05: expose completion promises for node lifecycle commands.
    stopNode: () => {
      return ipcRenderer.invoke("stopNode");
    },
    restartNode: () => {
      return ipcRenderer.invoke("restartNode");
    }
  }
);