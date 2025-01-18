import { defineStore } from "pinia";

export const useSubscriptionStore = defineStore("subscriptions", {
  state: () => ({
    subscriptions: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadSubscriptions() {
      this.loading = true;
      this.error = null;
      try {
        const list = await window.electronAPI.getSubscriptions();
        this.subscriptions = list || [];
      } catch (error) {
        console.error("Failed to load subscriptions:", error);
        this.error = error.message;
        this.subscriptions = [];
      } finally {
        this.loading = false;
      }
    },
    getSubscriptionById(id) {
      return this.subscriptions.find((sub) => sub.id === id);
    },
    getPaymentHistory(id) {
      return [];
    },
    async deleteSubscription(id) {
      try {
        await window.electronAPI.deleteSubscription(id);
        this.subscriptions = this.subscriptions.filter((sub) => sub.id !== id);
      } catch (error) {
        console.error("Failed to delete subscription:", error);
        throw error;
      }
    },
  },
});
