const { BrowserWindow, screen } = require("electron");
const path = require("path");
const Store = require("electron-store");

const windowStateStore = new Store({
  name: "window-state",
});

class WindowManager {
  static createMainWindow() {
    const defaultWidth = 800;
    const defaultHeight = 700;

    const savedState = windowStateStore.get("mainWindow", {
      width: defaultWidth,
      height: defaultHeight,
      x: undefined,
      y: undefined,
    });

    const { width, height, x, y } = this.ensureWindowWithinBounds(savedState);

    const mainWindow = new BrowserWindow({
      width,
      height,
      x,
      y,
      minWidth: 800,
      minHeight: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "../preload/preload.js"),
      },
      titleBarStyle: "hiddenInset",
      frame: false,
      backgroundColor: "#ffffff",
      icon: path.join(__dirname, "../../assets/icons/icon.png"),
    });

    // Load the app
    if (process.env.NODE_ENV === "development") {
      mainWindow.loadURL("http://localhost:5173");
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
    }

    mainWindow.on("close", () => {
      windowStateStore.set("mainWindow", {
        width: mainWindow.getBounds().width,
        height: mainWindow.getBounds().height,
        x: mainWindow.getBounds().x,
        y: mainWindow.getBounds().y,
      });
    });

    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
    });

    mainWindow.on("closed", () => {
      this.mainWindow = null;
    });

    this.mainWindow = mainWindow;

    return mainWindow;
  }

  static ensureWindowWithinBounds(state) {
    const { width, height, x, y } = state;
    const displays = screen.getAllDisplays();

    if (x === undefined || y === undefined) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const x = Math.round((primaryDisplay.workAreaSize.width - width) / 2);
      const y = Math.round((primaryDisplay.workAreaSize.height - height) / 2);
      return { width, height, x, y };
    }

    const isWithinBounds = displays.some((display) => {
      return (
        x >= display.bounds.x &&
        y >= display.bounds.y &&
        x + width <= display.bounds.x + display.bounds.width &&
        y + height <= display.bounds.y + display.bounds.height
      );
    });

    if (!isWithinBounds) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const x = Math.round((primaryDisplay.workAreaSize.width - width) / 2);
      const y = Math.round((primaryDisplay.workAreaSize.height - height) / 2);
      return { width, height, x, y };
    }

    return state;
  }

  static showMainWindow() {
    if (!this.mainWindow) {
      this.mainWindow = this.createMainWindow();
    } else if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }
    this.mainWindow.focus();
  }

  static cleanup() {
    if (this.mainWindow) {
      this.mainWindow.destroy();
      this.mainWindow = null;
    }
  }
}

module.exports = WindowManager;
