const { ipcMain, BrowserWindow } = require("electron");
const { v4: uuid } = require("uuid");
const { format } = require("date-fns");

const initializeIpcHandlers = ({ dataService, notificationService }) => {
  ipcMain.handle("get-subscriptions", async () => {
    return await dataService.readDataFile();
  });

  ipcMain.handle("add-subscription", async (event, subscription) => {
    const subscriptions = await dataService.readDataFile();
    const newSubscription = {
      id: uuid(),
      ...subscription,
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
  });

  ipcMain.handle("update-subscription", async (event, updatedSubscription) => {
    const { id, data } = updatedSubscription;
    const index = subscriptions.findIndex((sub) => sub.id === id);

    if (index === -1) {
      throw new Error("Subscription not found");
    }

    const updatedSub = {
      ...subscriptions[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    subscriptions[index] = updatedSub;
    await dataService.writeDataFile(subscriptions);

    if (updatedSubscription.reminderSettings) {
      notificationService.cancelReminder(updatedSubscription.id);
      if (updatedSubscription.reminderSettings.enabled) {
        notificationService.scheduleReminder(
          updatedSubscription.id,
          updatedSubscription.reminderSettings
        );
      }
    }

    return updatedSub;
  });

  ipcMain.handle("delete-subscription", async (event, subscriptionId) => {
    const subscriptions = await dataService.readDataFile();
    const filteredSubscriptions = subscriptions.filter(
      (sub) => sub.id !== subscriptionId
    );
    await dataService.writeDataFile(filteredSubscriptions);

    notificationService.cancelReminder(subscriptionId);
  });

  ipcMain.handle(
    "get-calendar-events",
    async (event, { startDate, endDate }) => {
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
    }
  );

  ipcMain.handle("get-notification-settings", async () => {
    return await dataService.readNotificationSettings();
  });

  ipcMain.handle("update-notification-settings", async (event, settings) => {
    await dataService.writeNotificationSettings(settings);
  });

  ipcMain.handle("get-app-settings", async () => {
    return await dataService.readAppSettings();
  });

  ipcMain.handle("update-app-settings", async (event, settings) => {
    await dataService.writeAppSettings(settings);
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
    notificationService.showNotification(
      "Test Notification",
      "This is a test notification from SubTrack"
    );
  });
};

module.exports = { initializeIpcHandlers };
