const { Notification } = require("electron");
const nodeNotifier = require("node-notifier");
const path = require("path");
const { app } = require("electron");
const cron = require("node-cron");
const { format } = require("date-fns");

class NotificationService {
  constructor(dataService) {
    this.dataService = dataService;
    this.scheduledJobs = new Map();
    this.iconPath = path.join(__dirname, "../../assets/icons/icon.png");
  }

  async initialize() {
    const subscriptions = await this.dataService.readDataFile();
    subscriptions.forEach((sub) => {
      if (sub.reminderSettings?.enabled) {
        this.scheduleReminder(sub.id, sub.reminderSettings);
      }
    });
  }

  scheduleReminder(subscriptionId, reminderSettings) {
    this.cancelReminder(subscriptionId);

    const { daysBefore, time } = reminderSettings;
    const [hours, minutes] = time.split(":").map(Number);

    const schedule = `${minutes} ${hours} * * *`;

    const job = cron.schedule(schedule, async () => {
      const subscriptions = await this.dataService.readDataFile();
      const subscription = subscriptions.find(
        (sub) => sub.id === subscriptionId
      );

      if (subscription) {
        const daysUntil = this.daysUntilPayment(subscription.nextPaymentDate);

        if (daysUntil <= daysBefore) {
          this.showNotification(
            `Subscription Reminder: ${subscription.name}`,
            `Your ${subscription.name} subscription will renew in ${daysUntil} days`
          );
        }
      }
    });

    this.scheduledJobs.set(subscriptionId, job);
  }

  cancelReminder(subscriptionId) {
    const job = this.scheduledJobs.get(subscriptionId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(subscriptionId);
    }
  }

  daysUntilPayment(paymentDate) {
    const now = new Date();
    const payment = new Date(paymentDate);
    const timeDiff = payment - now;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  showNotification(title, body) {
    if (Notification.isSupported()) {
      new Notification({
        title,
        body,
        icon: this.iconPath,
      }).show();
    } else {
      nodeNotifier.notify({
        title,
        message: body,
        icon: this.iconPath,
        sound: true,
      });
    }
  }

  cleanup() {
    this.scheduledJobs.forEach((job) => job.stop());
    this.scheduledJobs.clear();
  }
}

module.exports = NotificationService;
