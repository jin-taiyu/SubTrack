<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div v-if="!subscription" class="modal-error">
        <h2>Error</h2>
        <p>Subscription not found</p>
        <button class="btn" @click="closeModal">Close</button>
      </div>

      <template v-else>
        <div class="modal-header">
          <h2>{{ subscription.name }}</h2>
          <button class="close-btn" @click="closeModal">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <div class="details-grid">
            <div class="detail-item">
              <label>Platform:</label>
              <span>{{ subscription.platform }}</span>
            </div>
            <div class="detail-item">
              <label>Price:</label>
              <span>{{ formatPrice(subscription.price, subscription.currency) }}</span>
            </div>
            <div class="detail-item">
              <label>Billing Period:</label>
              <span>{{ formatPeriod(subscription.period) }}</span>
            </div>
            <div class="detail-item">
              <label>Next Payment:</label>
              <span>{{ formatDate(subscription.nextPaymentDate) }}</span>
            </div>
            <div class="detail-item">
              <label>Payment Method:</label>
              <span>{{ subscription.paymentMethod }}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span :class="statusClass">{{ subscriptionStatus }}</span>
            </div>
          </div>

          <div class="payment-history" v-if="paymentHistory.length > 0">
            <h3>Payment History</h3>
            <ul>
              <li v-for="payment in paymentHistory" :key="payment.date">
                {{ formatDate(payment.date) }} - {{ formatPrice(payment.amount, payment.currency) }}
              </li>
            </ul>
          </div>

          <div class="modal-actions">
            <button class="btn edit-btn" @click="handleEdit">
              Edit Subscription
            </button>
            <button class="btn delete-btn" @click="handleDelete">
              Delete Subscription
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSubscriptionStore } from '../stores/subscriptions';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

const router = useRouter();

const props = defineProps({
  subscriptionId: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    required: false,
    default: true
  }
});

const subscriptionStore = useSubscriptionStore();

const subscription = computed(() =>
  subscriptionStore.getSubscriptionById(props.subscriptionId)
);

const subscriptionStatus = computed(() => {
  if (!subscription.value) return '';

  const daysUntil = dayjs(subscription.value.nextPaymentDate).diff(dayjs(), 'days');

  if (daysUntil < 0) return 'Expired';
  if (daysUntil <= 3) return 'Due Soon';
  if (daysUntil <= 7) return 'Upcoming';
  return 'Active';
});

const statusClass = computed(() => {
  if (!subscription.value) return {};

  return {
    'status-active': subscriptionStatus.value === 'Active',
    'status-upcoming': subscriptionStatus.value === 'Upcoming',
    'status-due-soon': subscriptionStatus.value === 'Due Soon',
    'status-expired': subscriptionStatus.value === 'Expired'
  };
});

const paymentHistory = computed(() => {
  if (!subscription.value) return [];
  return subscriptionStore.getPaymentHistory(props.subscriptionId);
});

function formatPrice(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY');
}

function formatPeriod(period) {
  return period.charAt(0).toUpperCase() + period.slice(1);
}

function closeModal() {
  router.back();
}

function handleEdit() {
  router.push({
    name: 'NewSubscription',
    query: { edit: 'true' },
    state: { subscription: subscription.value }
  });
}

async function handleDelete() {
  if (confirm('Are you sure you want to delete this subscription?')) {
    const subscriptionId = subscription.value.id;
    router.back();
    await subscriptionStore.deleteSubscription(subscriptionId);
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

.modal-body {
  padding: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-weight: 500;
  color: #666;
}

.detail-item span {
  font-size: 1rem;
}

.payment-history {
  margin-top: 1.5rem;
}

.payment-history h3 {
  margin: 0 0 1rem 0;
}

.payment-history ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.payment-history li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  flex: 1;
}

.edit-btn {
  background: #2c3e50;
  color: white;
}

.edit-btn:hover {
  background: #34495e;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.status-active {
  color: #28a745;
}

.status-upcoming {
  color: #17a2b8;
}

.status-due-soon {
  color: #ffc107;
}

.status-expired {
  color: #dc3545;
}

.modal-error {
  padding: 2rem;
  text-align: center;
}

.modal-error h2 {
  color: #dc3545;
  margin: 0 0 1rem;
}

.modal-error p {
  margin: 0 0 1.5rem;
  color: #666;
}

.modal-error .btn {
  max-width: 200px;
  margin: 0 auto;
}
</style>
