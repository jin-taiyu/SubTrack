const fs = require("fs").promises;
const path = require("path");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");
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
    this.encryptionKey = null;
  }

  async initialize() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
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
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultValue));
    }
  }

  async readDataFile() {
    try {
      const data = await fs.readFile(this.subscriptionsFile, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading subscriptions file:", error);
      throw error;
    }
  }

  async writeDataFile(data) {
    try {
      await fs.writeFile(this.subscriptionsFile, JSON.stringify(data, null, 2));
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
      console.error("Error reading notification settings:", error);
      throw error;
    }
  }

  async writeNotificationSettings(settings) {
    try {
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
      console.error("Error reading app settings:", error);
      throw error;
    }
  }

  async writeAppSettings(settings) {
    try {
      await fs.writeFile(
        this.appSettingsFile,
        JSON.stringify(settings, null, 2)
      );
    } catch (error) {
      console.error("Error writing app settings:", error);
      throw error;
    }
  }

  async setEncryptionKey(key) {
    this.encryptionKey = crypto
      .createHash("sha256")
      .update(key)
      .digest("base64")
      .substr(0, 32);
  }

  async encryptData(data) {
    if (!this.encryptionKey) return data;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.encryptionKey),
      iv
    );
    let encrypted = cipher.update(JSON.stringify(data));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
  }

  async decryptData(encrypted) {
    if (!this.encryptionKey) return encrypted;

    const iv = Buffer.from(encrypted.iv, "hex");
    const encryptedText = Buffer.from(encrypted.encryptedData, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(this.encryptionKey),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  }
}

module.exports = DataService;
