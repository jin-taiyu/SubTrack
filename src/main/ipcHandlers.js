const { ipcMain, BrowserWindow } = require("electron");
const { v4: uuid } = require("uuid");

// Input sanitization to prevent XSS
function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Validate subscription data
function validateSubscription(data) {
  const errors = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    errors.push("Name is required");
  }
  if (!data.platform || typeof data.platform !== "string") {
    errors.push("Platform is required");
  }
  if (typeof data.price !== "number" || data.price < 0 || isNaN(data.price)) {
    errors.push("Price must be a non-negative number");
  }
  if (!["USD", "EUR", "GBP", "JPY", "CNY"].includes(data.currency)) {
    errors.push("Invalid currency");
  }
  if (!["monthly", "quarterly", "yearly"].includes(data.period)) {
    errors.push("Invalid billing period");
  }
  if (!data.nextPaymentDate || isNaN(Date.parse(data.nextPaymentDate))) {
    errors.push("Valid next payment date is required");
  }

  return errors;
}

// Sanitize subscription object
function sanitizeSubscription(sub) {
  return {
    ...sub,
    name: sanitizeString(sub.name),
    platform: sanitizeString(sub.platform),
    paymentMethod: sanitizeString(sub.paymentMethod || ""),
  };
}

const initializeIpcHandlers = ({ dataService, notificationService }) => {
  ipcMain.handle("get-subscriptions", async () => {
    try {
      return await dataService.readDataFile();
    } catch (error) {
      console.error("Failed to get subscriptions:", error);
      throw new Error("Failed to load subscriptions");
    }
  });

  ipcMain.handle("add-subscription", async (event, subscription) => {
    try {
      // Validate input
      const validationErrors = validateSubscription(subscription);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      const subscriptions = await dataService.readDataFile();

      // Sanitize and create new subscription
      const sanitizedData = sanitizeSubscription(subscription);
      const newSubscription = {
        id: uuid(),
        ...sanitizedData,
        price: parseFloat(subscription.price),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      subscriptions.push(newSubscription);
      await dataService.writeDataFile(subscriptions);

      if (subscription.reminderSettings?.enabled) {
        notificationService.scheduleReminder(
          newSubscription.id,
          subscription.reminderSettings
        );
      }

      return newSubscription;
    } catch (error) {
      console.error("Failed to add subscription:", error);
      throw error;
    }
  });

  ipcMain.handle("update-subscription", async (event, updatedSubscription) => {
    try {
      const { id, data } = updatedSubscription;

      if (!id || typeof id !== "string") {
        throw new Error("Invalid subscription ID");
      }

      // Read current subscriptions - FIX: was using undefined variable
      const subscriptions = await dataService.readDataFile();
      const index = subscriptions.findIndex((sub) => sub.id === id);

      if (index === -1) {
        throw new Error("Subscription not found");
      }

      // Validate update data
      const mergedData = { ...subscriptions[index], ...data };
      const validationErrors = validateSubscription(mergedData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      // Sanitize and update
      const sanitizedData = sanitizeSubscription(data);
      const updatedSub = {
        ...subscriptions[index],
        ...sanitizedData,
        price: parseFloat(data.price ?? subscriptions[index].price),
        id,
        updatedAt: new Date().toISOString(),
      };

      subscriptions[index] = updatedSub;
      await dataService.writeDataFile(subscriptions);

      if (data.reminderSettings) {
        notificationService.cancelReminder(id);
        if (data.reminderSettings.enabled) {
          notificationService.scheduleReminder(id, data.reminderSettings);
        }
      }

      return updatedSub;
    } catch (error) {
      console.error("Failed to update subscription:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-subscription", async (event, subscriptionId) => {
    try {
      if (!subscriptionId || typeof subscriptionId !== "string") {
        throw new Error("Invalid subscription ID");
      }

      const subscriptions = await dataService.readDataFile();
      const exists = subscriptions.some((sub) => sub.id === subscriptionId);

      if (!exists) {
        throw new Error("Subscription not found");
      }

      const filteredSubscriptions = subscriptions.filter(
        (sub) => sub.id !== subscriptionId
      );
      await dataService.writeDataFile(filteredSubscriptions);
      notificationService.cancelReminder(subscriptionId);

      return { success: true };
    } catch (error) {
      console.error("Failed to delete subscription:", error);
      throw error;
    }
  });

  ipcMain.handle(
    "get-calendar-events",
    async (event, { startDate, endDate }) => {
      try {
        const subscriptions = await dataService.readDataFile();
        return subscriptions
          .filter((sub) => {
            const paymentDate = new Date(sub.nextPaymentDate);
            return paymentDate >= startDate && paymentDate <= endDate;
          })
          .map((sub) => ({
            id: sub.id,
            title: sub.name,
            start: sub.nextPaymentDate,
            end: sub.nextPaymentDate,
            color: sub.color,
            extendedProps: {
              platform: sub.platform,
              price: sub.price,
              period: sub.period,
            },
          }));
      } catch (error) {
        console.error("Failed to get calendar events:", error);
        throw new Error("Failed to load calendar events");
      }
    }
  );

  ipcMain.handle("get-notification-settings", async () => {
    try {
      return await dataService.readNotificationSettings();
    } catch (error) {
      console.error("Failed to get notification settings:", error);
      throw new Error("Failed to load notification settings");
    }
  });

  ipcMain.handle("update-notification-settings", async (event, settings) => {
    try {
      await dataService.writeNotificationSettings(settings);
      return { success: true };
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      throw error;
    }
  });

  ipcMain.handle("get-app-settings", async () => {
    try {
      return await dataService.readAppSettings();
    } catch (error) {
      console.error("Failed to get app settings:", error);
      throw new Error("Failed to load app settings");
    }
  });

  ipcMain.handle("update-app-settings", async (event, settings) => {
    try {
      await dataService.writeAppSettings(settings);
      return { success: true };
    } catch (error) {
      console.error("Failed to update app settings:", error);
      throw error;
    }
  });

  ipcMain.handle("window-resized", async () => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      const [width, height] = mainWindow.getSize();
      return { width, height };
    }
    return null;
  });

  ipcMain.handle("trigger-test-notification", async () => {
    try {
      notificationService.showNotification(
        "Test Notification",
        "This is a test notification from SubTrack"
      );
      return { success: true };
    } catch (error) {
      console.error("Failed to trigger test notification:", error);
      throw error;
    }
  });
};

module.exports = { initializeIpcHandlers };
