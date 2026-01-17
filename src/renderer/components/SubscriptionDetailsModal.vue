<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <LoadingSpinner v-if="loading" message="Loading details..." />

      <div v-else-if="!subscription" class="modal-error">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2>Subscription Not Found</h2>
        <p>The subscription you're looking for doesn't exist or has been deleted.</p>
        <button class="btn btn--primary" @click="closeModal">Go Back</button>
      </div>

      <template v-else>
        <div class="modal-header">
          <div class="header-content">
            <div class="subscription-icon" :style="{ background: getStatusGradient(subscriptionStatus) }">
              {{ subscription.name?.charAt(0).toUpperCase() }}
            </div>
            <div class="header-info">
              <h2>{{ subscription.name }}</h2>
              <span class="platform-badge">{{ subscription.platform }}</span>
            </div>
          </div>
          <button class="close-btn" @click="closeModal" aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="price-display">
            <span class="price-amount">{{ formatPrice(subscription.price, subscription.currency) }}</span>
            <span class="price-period">/ {{ subscription.period }}</span>
          </div>

          <div class="status-banner" :class="'status--' + subscriptionStatus.toLowerCase().replace(' ', '-')">
            <span class="status-dot"></span>
            <span class="status-text">{{ subscriptionStatus }}</span>
            <span class="status-date">{{ formatNextPayment(subscription.nextPaymentDate) }}</span>
          </div>

          <div class="details-section">
            <h3>Details</h3>
            <div class="details-grid">
              <div class="detail-item">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <div class="detail-content">
                  <span class="detail-label">Next Payment</span>
                  <span class="detail-value">{{ formatDate(subscription.nextPaymentDate) }}</span>
                </div>
              </div>

              <div class="detail-item">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <div class="detail-content">
                  <span class="detail-label">Payment Method</span>
                  <span class="detail-value">{{ subscription.paymentMethod || 'Not specified' }}</span>
                </div>
              </div>

              <div class="detail-item">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <div class="detail-content">
                  <span class="detail-label">Billing Cycle</span>
                  <span class="detail-value">{{ formatPeriod(subscription.period) }}</span>
                </div>
              </div>

              <div class="detail-item">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <div class="detail-content">
                  <span class="detail-label">Yearly Cost</span>
                  <span class="detail-value">{{ formatPrice(getYearlyCost(), subscription.currency) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn--secondary" @click="handleEdit">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button class="btn btn--danger" @click="handleDelete" :disabled="isDeleting">
              <LoadingSpinner v-if="isDeleting" />
              <template v-else>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Delete
              </template>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="showDeleteConfirm = false">
        <div class="confirm-modal">
          <div class="confirm-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3>Delete Subscription?</h3>
          <p>Are you sure you want to delete <strong>{{ subscription?.name }}</strong>? This action cannot be undone.</p>
          <div class="confirm-actions">
            <button class="btn btn--secondary" @click="showDeleteConfirm = false">Cancel</button>
            <button class="btn btn--danger" @click="confirmDelete" :disabled="isDeleting">
              <LoadingSpinner v-if="isDeleting" />
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSubscriptionStore } from '../stores/subscriptions';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import LoadingSpinner from './LoadingSpinner.vue';

dayjs.extend(relativeTime);

const router = useRouter();
const subscriptionStore = useSubscriptionStore();

const props = defineProps({
  subscriptionId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['show-toast']);

const loading = ref(true);
const isDeleting = ref(false);
const showDeleteConfirm = ref(false);

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

function getStatusGradient(status) {
  switch (status) {
    case 'Active': return 'linear-gradient(135deg, #10b981, #059669)';
    case 'Upcoming': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    case 'Due Soon': return 'linear-gradient(135deg, #f59e0b, #d97706)';
    case 'Expired': return 'linear-gradient(135deg, #ef4444, #dc2626)';
    default: return 'linear-gradient(135deg, #6366f1, #4f46e5)';
  }
}

function formatPrice(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount || 0);
}

function formatDate(date) {
  return dayjs(date).format('MMMM D, YYYY');
}

function formatNextPayment(date) {
  const diff = dayjs(date).diff(dayjs(), 'days');
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `In ${diff} days`;
}

function formatPeriod(period) {
  return period?.charAt(0).toUpperCase() + period?.slice(1) || 'Monthly';
}

function getYearlyCost() {
  if (!subscription.value) return 0;
  const { price, period } = subscription.value;
  switch (period) {
    case 'monthly': return price * 12;
    case 'quarterly': return price * 4;
    case 'yearly': return price;
    default: return price * 12;
  }
}

function closeModal() {
  router.back();
}

function handleEdit() {
  router.push({
    name: 'EditSubscription',
    params: { id: subscription.value.id }
  });
}

function handleDelete() {
  showDeleteConfirm.value = true;
}

async function confirmDelete() {
  if (!subscription.value) return;

  try {
    isDeleting.value = true;
    const name = subscription.value.name;
    const id = subscription.value.id;

    router.back();
    await subscriptionStore.deleteSubscription(id);
    emit('show-toast', `"${name}" has been deleted`, 'success');
  } catch (error) {
    emit('show-toast', error.message || 'Failed to delete subscription', 'error');
  } finally {
    isDeleting.value = false;
    showDeleteConfirm.value = false;
  }
}

onMounted(async () => {
  try {
    if (subscriptionStore.subscriptions.length === 0) {
      await subscriptionStore.loadSubscriptions();
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-content {
  background: var(--bg-primary, white);
  border-radius: var(--radius-xl, 24px);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color, #e5e7eb);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.subscription-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-info h2 {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #111827);
}

.platform-badge {
  display: inline-block;
  padding: 4px 10px;
  background: var(--bg-tertiary, #f3f4f6);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary, #4b5563);
}

.close-btn {
  background: var(--bg-tertiary, #f3f4f6);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md, 10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary, #6b7280);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-secondary, #e5e7eb);
  color: var(--text-primary, #111827);
}

.modal-body {
  padding: 24px;
}

.price-display {
  text-align: center;
  padding: 20px 0;
}

.price-amount {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  letter-spacing: -1px;
}

.price-period {
  font-size: 16px;
  color: var(--text-tertiary, #6b7280);
  font-weight: 500;
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: var(--radius-md, 10px);
  margin-bottom: 24px;
}

.status--active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status--upcoming {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.status--due-soon {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status--expired {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-text {
  font-weight: 600;
  font-size: 14px;
}

.status-date {
  margin-left: auto;
  font-size: 13px;
  opacity: 0.8;
}

.details-section h3 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-tertiary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 10px);
}

.detail-item svg {
  color: var(--primary-500, #8b5cf6);
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: var(--text-tertiary, #6b7280);
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: var(--radius-md, 10px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--secondary {
  background: var(--bg-tertiary, #f3f4f6);
  color: var(--text-secondary, #4b5563);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--bg-secondary, #e5e7eb);
}

.btn--primary {
  background: var(--gradient-primary, linear-gradient(135deg, #6366f1, #8b5cf6));
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn--danger:hover:not(:disabled) {
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* Error State */
.modal-error {
  padding: 48px 32px;
  text-align: center;
}

.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  color: #ef4444;
  margin-bottom: 20px;
}

.modal-error h2 {
  margin: 0 0 10px;
  font-size: 20px;
  color: var(--text-primary, #111827);
}

.modal-error p {
  margin: 0 0 24px;
  color: var(--text-tertiary, #6b7280);
  font-size: 14px;
}

/* Confirm Modal */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.confirm-modal {
  background: var(--bg-primary, white);
  border-radius: var(--radius-lg, 16px);
  padding: 32px;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.confirm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 50%;
  color: #f59e0b;
  margin-bottom: 20px;
}

.confirm-modal h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: var(--text-primary, #111827);
}

.confirm-modal p {
  margin: 0 0 24px;
  color: var(--text-tertiary, #6b7280);
  font-size: 14px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.confirm-actions .btn {
  flex: 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .modal-content {
    background: #1f2937;
    border-color: #374151;
  }

  .modal-header {
    border-color: #374151;
  }

  .header-info h2 {
    color: #f3f4f6;
  }

  .platform-badge {
    background: #374151;
    color: #d1d5db;
  }

  .close-btn {
    background: #374151;
    color: #9ca3af;
  }

  .close-btn:hover {
    background: #4b5563;
    color: #f3f4f6;
  }

  .price-amount {
    color: #f3f4f6;
  }

  .detail-item {
    background: #111827;
  }

  .detail-value {
    color: #f3f4f6;
  }

  .btn--secondary {
    background: #374151;
    color: #d1d5db;
  }

  .btn--secondary:hover:not(:disabled) {
    background: #4b5563;
  }

  .confirm-modal {
    background: #1f2937;
  }

  .confirm-modal h3 {
    color: #f3f4f6;
  }

  .modal-error h2 {
    color: #f3f4f6;
  }
}

/* Responsive */
@media (max-width: 540px) {
  .modal-overlay {
    padding: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
