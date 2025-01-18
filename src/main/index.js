const { app, ipcMain, BrowserWindow } = require("electron");
const WindowManager = require("./windowManager");
const DataService = require("./services/dataService");
const NotificationService = require("./services/notificationService");
const { initializeIpcHandlers } = require("./ipcHandlers");

class MainProcess {
  constructor() {
    this.dataService = new DataService();
    this.notificationService = new NotificationService(this.dataService);
    this.windowManager = WindowManager;
  }

  async initialize() {
    try {
      await this.dataService.initialize();
      await this.notificationService.initialize();

      initializeIpcHandlers({
        dataService: this.dataService,
        notificationService: this.notificationService,
      });

      app.whenReady().then(() => {
        WindowManager.createMainWindow();

        // macOS specific behavior
        app.on("activate", () => {
          if (BrowserWindow.getAllWindows().length === 0) {
            WindowManager.createMainWindow();
          }
        });
      });

      app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
          app.quit();
        }
      });

      app.on("before-quit", () => {
        this.cleanup();
      });

      ipcMain.on("window-minimize", () => {
        const window = BrowserWindow.getFocusedWindow();
        if (window) window.minimize();
      });

      ipcMain.on("window-maximize", () => {
        const window = BrowserWindow.getFocusedWindow();
        if (window) {
          if (window.isMaximized()) {
            window.unmaximize();
          } else {
            window.maximize();
          }
        }
      });

      ipcMain.on("window-close", () => {
        const window = BrowserWindow.getFocusedWindow();
        if (window) window.close();
      });
    } catch (error) {
      console.error("Failed to initialize main process:", error);
      process.exit(1);
    }
  }

  cleanup() {
    this.notificationService.cleanup();
    this.windowManager.cleanup();
  }
}

const mainProcess = new MainProcess();
mainProcess.initialize();

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  app.quit();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  app.quit();
});
