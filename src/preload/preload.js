const { contextBridge, ipcRenderer } = require("electron");

const validChannels = {
  send: [
    "add-subscription",
    "update-subscription",
    "delete-subscription",
    "schedule-reminder",
    "cancel-reminder",
    "window-resized",
    "window-minimize",
    "window-maximize",
    "window-close",
  ],
  receive: [
    "notification-permission-granted",
    "subscription-added",
    "subscription-updated",
    "subscription-deleted",
    "reminder-scheduled",
    "reminder-cancelled",
  ],
};

const api = {
  getSubscriptions: () => ipcRenderer.invoke("get-subscriptions"),
  addSubscription: (subscription) =>
    ipcRenderer.invoke("add-subscription", subscription),
  updateSubscription: (id, data) =>
    ipcRenderer.invoke("update-subscription", { id, data }),
  deleteSubscription: (id) => ipcRenderer.invoke("delete-subscription", id),

  requestNotificationPermission: () =>
    ipcRenderer.invoke("request-notification-permission"),
  scheduleReminder: (id, options) =>
    ipcRenderer.invoke("schedule-reminder", { id, options }),
  cancelReminder: (id) => ipcRenderer.invoke("cancel-reminder", id),

  on: (channel, callback) => {
    if (validChannels.receive.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  off: (channel, callback) => {
    if (validChannels.receive.includes(channel)) {
      ipcRenderer.off(channel, callback);
    }
  },

  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),
};

contextBridge.exposeInMainWorld("electronAPI", api);

process.once("loaded", () => {
  delete window.require;
  delete window.exports;
  delete window.module;

  Object.freeze(Object.prototype);
  Object.freeze(Array.prototype);

  window.eval = global.eval = function () {
    throw new Error("eval() is disabled for security reasons");
  };
});
