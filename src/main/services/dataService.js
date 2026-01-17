const fs = require("fs").promises;
const path = require("path");
const { app } = require("electron");

class DataService {
  constructor() {
    this.dataDir = path.join(app.getPath("userData"), "data");
    this.subscriptionsFile = path.join(this.dataDir, "subscriptions.json");
    this.notificationSettingsFile = path.join(
      this.dataDir,
      "notificationSettings.json"
    );
    this.appSettingsFile = path.join(this.dataDir, "appSettings.json");
    this.backupDir = path.join(this.dataDir, "backups");
  }

  async initialize() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.backupDir, { recursive: true });
      await this.ensureFileExists(this.subscriptionsFile, []);
      await this.ensureFileExists(this.notificationSettingsFile, {
        enabled: true,
        defaultReminderDays: 3,
        defaultReminderTime: "09:00",
      });
      await this.ensureFileExists(this.appSettingsFile, {
        theme: "system",
        currency: "USD",
        firstRun: true,
      });
    } catch (error) {
      console.error("Failed to initialize data service:", error);
      throw error;
    }
  }

  async ensureFileExists(filePath, defaultValue) {
    try {
      await fs.access(filePath);
      // Validate that the file contains valid JSON
      const content = await fs.readFile(filePath, "utf8");
      JSON.parse(content);
    } catch (error) {
      // File doesn't exist or is corrupted, create with defaults
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
    }
  }

  async createBackup(filePath) {
    try {
      const fileName = path.basename(filePath, ".json");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(
        this.backupDir,
        `${fileName}_${timestamp}.json`
      );

      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      if (exists) {
        await fs.copyFile(filePath, backupPath);
      }

      // Clean up old backups (keep last 5)
      await this.cleanupOldBackups(fileName);
    } catch (error) {
      console.warn("Failed to create backup:", error);
      // Don't throw - backup failure shouldn't prevent operations
    }
  }

  async cleanupOldBackups(fileName) {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter((f) => f.startsWith(fileName) && f.endsWith(".json"))
        .sort()
        .reverse();

      // Remove backups beyond the 5 most recent
      for (const backup of backups.slice(5)) {
        await fs.unlink(path.join(this.backupDir, backup));
      }
    } catch (error) {
      console.warn("Failed to cleanup old backups:", error);
    }
  }

  async readDataFile() {
    try {
      const data = await fs.readFile(this.subscriptionsFile, "utf8");
      const parsed = JSON.parse(data);

      // Validate data structure
      if (!Array.isArray(parsed)) {
        console.error("Subscriptions data is not an array, resetting to empty");
        return [];
      }

      return parsed;
    } catch (error) {
      if (error.code === "ENOENT") {
        // File doesn't exist, return empty array
        return [];
      }
      if (error instanceof SyntaxError) {
        // JSON parsing failed - corrupted file
        console.error("Corrupted subscriptions file, returning empty array");
        // Try to recover from backup
        const recovered = await this.recoverFromBackup("subscriptions");
        return recovered ?? [];
      }
      console.error("Error reading subscriptions file:", error);
      throw error;
    }
  }

  async recoverFromBackup(fileName) {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter((f) => f.startsWith(fileName) && f.endsWith(".json"))
        .sort()
        .reverse();

      for (const backup of backups) {
        try {
          const content = await fs.readFile(
            path.join(this.backupDir, backup),
            "utf8"
          );
          const data = JSON.parse(content);
          console.log(`Recovered data from backup: ${backup}`);
          return data;
        } catch {
          continue; // Try next backup
        }
      }
    } catch (error) {
      console.error("Failed to recover from backup:", error);
    }
    return null;
  }

  async writeDataFile(data) {
    try {
      // Create backup before writing
      await this.createBackup(this.subscriptionsFile);

      // Validate data before writing
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
      }

      await fs.writeFile(
        this.subscriptionsFile,
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.error("Error writing subscriptions file:", error);
      throw error;
    }
  }

  async readNotificationSettings() {
    try {
      const data = await fs.readFile(this.notificationSettingsFile, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT" || error instanceof SyntaxError) {
        const defaults = {
          enabled: true,
          defaultReminderDays: 3,
          defaultReminderTime: "09:00",
        };
        await this.writeNotificationSettings(defaults);
        return defaults;
      }
      console.error("Error reading notification settings:", error);
      throw error;
    }
  }

  async writeNotificationSettings(settings) {
    try {
      await this.createBackup(this.notificationSettingsFile);
      await fs.writeFile(
        this.notificationSettingsFile,
        JSON.stringify(settings, null, 2)
      );
    } catch (error) {
      console.error("Error writing notification settings:", error);
      throw error;
    }
  }

  async readAppSettings() {
    try {
      const data = await fs.readFile(this.appSettingsFile, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT" || error instanceof SyntaxError) {
        const defaults = {
          theme: "system",
          currency: "USD",
          firstRun: true,
        };
        await this.writeAppSettings(defaults);
        return defaults;
      }
      console.error("Error reading app settings:", error);
      throw error;
    }
  }

  async writeAppSettings(settings) {
    try {
      await this.createBackup(this.appSettingsFile);
      await fs.writeFile(
        this.appSettingsFile,
        JSON.stringify(settings, null, 2)
      );
    } catch (error) {
      console.error("Error writing app settings:", error);
      throw error;
    }
  }
}

module.exports = DataService;

