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
    stopNode: () => {
      ipcRenderer.send("stopNode");
    },
    restartNode: () => {
      ipcRenderer.send("restartNode");
    }
  }
);