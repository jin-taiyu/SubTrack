<template>
  <div class="form-page">
    <div class="form-container">
      <div class="form-header">
        <button type="button" class="back-btn" @click="handleCancel" aria-label="Go back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="form-header__text">
          <h2>{{ isEditing ? 'Edit Subscription' : 'New Subscription' }}</h2>
          <p>{{ isEditing ? 'Update details and keep billing dates accurate.' : 'Add your plan details to track upcoming charges.' }}</p>
        </div>
      </div>

      <form id="subscription-form" @submit.prevent="handleSubmit" novalidate :aria-busy="isLoading ? 'true' : 'false'">
        <p class="form-hint">Fields marked <span class="label-required">*</span> are required.</p>

        <fieldset class="form-fields" :disabled="isLoading">
          <div class="form-section">
            <h3 class="form-section__title">Basics</h3>
            <div class="form-group" :class="{ 'has-error': errors.name }">
              <label for="name">
                <span class="label-text">Subscription Name</span>
                <span class="label-required">*</span>
              </label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                placeholder="e.g. Netflix, Spotify"
                autocomplete="organization"
                :aria-invalid="errors.name ? 'true' : 'false'"
                :aria-describedby="errors.name ? 'name-error' : null"
                @blur="validateField('name')"
              />
              <span v-if="errors.name" id="name-error" class="error-message">{{ errors.name }}</span>
            </div>

            <div class="form-group" :class="{ 'has-error': errors.platform }">
              <label for="platform">
                <span class="label-text">Platform</span>
                <span class="label-required">*</span>
              </label>
              <input
                type="text"
                id="platform"
                v-model="formData.platform"
                placeholder="e.g. Streaming, Music, Software"
                autocomplete="organization-title"
                :aria-invalid="errors.platform ? 'true' : 'false'"
                :aria-describedby="errors.platform ? 'platform-error' : null"
                @blur="validateField('platform')"
              />
              <span v-if="errors.platform" id="platform-error" class="error-message">{{ errors.platform }}</span>
            </div>
          </div>

          <div class="form-section">
            <h3 class="form-section__title">Billing</h3>
            <div class="form-row">
              <div class="form-group" :class="{ 'has-error': errors.price }">
                <label for="price">
                  <span class="label-text">Price</span>
                  <span class="label-required">*</span>
                </label>
                <div class="input-with-prefix">
                  <span class="input-prefix">{{ getCurrencySymbol(formData.currency) }}</span>
                  <input
                    type="number"
                    id="price"
                    v-model="formData.price"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    placeholder="0.00"
                    :aria-invalid="errors.price ? 'true' : 'false'"
                    :aria-describedby="errors.price ? 'price-error' : null"
                    @blur="validateField('price')"
                  />
                </div>
                <span v-if="errors.price" id="price-error" class="error-message">{{ errors.price }}</span>
              </div>

              <div class="form-group">
                <label for="currency">
                  <span class="label-text">Currency</span>
                </label>
                <select id="currency" v-model="formData.currency">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CNY">CNY (¥)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="period">
                  <span class="label-text">Billing Period</span>
                </label>
                <select id="period" v-model="formData.period">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div class="form-group" :class="{ 'has-error': errors.nextPaymentDate }">
                <label for="nextPaymentDate">
                  <span class="label-text">Next Payment Date</span>
                  <span class="label-required">*</span>
                </label>
                <input
                  type="date"
                  id="nextPaymentDate"
                  v-model="formData.nextPaymentDate"
                  :aria-invalid="errors.nextPaymentDate ? 'true' : 'false'"
                  :aria-describedby="errors.nextPaymentDate ? 'payment-date-error' : null"
                  @blur="validateField('nextPaymentDate')"
                />
                <span v-if="errors.nextPaymentDate" id="payment-date-error" class="error-message">{{ errors.nextPaymentDate }}</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="form-section__title">Payment Method</h3>
            <div class="form-group">
              <label for="paymentMethod">
                <span class="label-text">Payment Method</span>
              </label>
              <input
                type="text"
                id="paymentMethod"
                v-model="formData.paymentMethod"
                placeholder="e.g. Visa **** 1234"
                autocomplete="cc-name"
              />
            </div>
          </div>
        </fieldset>

        <div v-if="errorMessage" class="form-error-banner" role="alert">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn--secondary" @click="handleCancel" :disabled="isLoading">
            Cancel
          </button>
          <button type="submit" class="btn btn--primary" :disabled="isLoading">
            <LoadingSpinner v-if="isLoading" inline :size="16" />
            <span>{{ isLoading ? 'Saving...' : (isEditing ? 'Update Subscription' : 'Add Subscription') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';
import { useSubscriptionStore } from '../stores/subscriptions';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  subscriptionId: {
    type: String,
    default: null
  }
});

const router = useRouter();
const route = useRoute();
const subscriptionStore = useSubscriptionStore();

const emit = defineEmits(['show-toast']);

const defaultSubscription = {
  name: '',
  platform: '',
  price: '',
  currency: 'USD',
  period: 'monthly',
  nextPaymentDate: dayjs().format('YYYY-MM-DD'),
  paymentMethod: ''
};

const formData = ref({ ...defaultSubscription });
const errors = ref({});
const errorMessage = ref('');
const isLoading = ref(false);

const isEditing = computed(() => !!props.subscriptionId);

onMounted(async () => {
  const queryDate = Array.isArray(route.query.date) ? route.query.date[0] : route.query.date;
  if (queryDate) {
    formData.value.nextPaymentDate = queryDate;
  }

  if (props.subscriptionId) {
    if (subscriptionStore.subscriptions.length === 0) {
      await subscriptionStore.loadSubscriptions();
    }

    const sub = subscriptionStore.getSubscriptionById(props.subscriptionId);
    if (sub) {
      formData.value = {
        name: sub.name || '',
        platform: sub.platform || '',
        price: sub.price || '',
        currency: sub.currency || 'USD',
        period: sub.period || 'monthly',
        nextPaymentDate: sub.nextPaymentDate ? dayjs(sub.nextPaymentDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        paymentMethod: sub.paymentMethod || ''
      };
    } else {
      emit('show-toast', 'Subscription not found', 'error');
      router.push({ name: 'Home' });
    }
  }
});

function getCurrencySymbol(currency) {
  const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥' };
  return symbols[currency] || '$';
}

function validateField(field) {
  errors.value[field] = '';

  switch (field) {
    case 'name':
      if (!formData.value.name.trim()) {
        errors.value.name = 'Subscription name is required';
      }
      break;
    case 'platform':
      if (!formData.value.platform.trim()) {
        errors.value.platform = 'Platform is required';
      }
      break;
    case 'price': {
      const price = parseFloat(formData.value.price);
      if (isNaN(price) || price < 0) {
        errors.value.price = 'Please enter a valid price';
      }
      break;
    }
    case 'nextPaymentDate':
      if (!formData.value.nextPaymentDate) {
        errors.value.nextPaymentDate = 'Payment date is required';
      }
      break;
  }
}

function validateForm() {
  validateField('name');
  validateField('platform');
  validateField('price');
  validateField('nextPaymentDate');

  return Object.values(errors.value).every((value) => !value);
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    const subscriptionData = {
      ...formData.value,
      price: parseFloat(formData.value.price)
    };

    if (isEditing.value && props.subscriptionId) {
      await window.electronAPI.updateSubscription(
        props.subscriptionId,
        subscriptionData
      );
      emit('show-toast', 'Subscription updated successfully', 'success');
    } else {
      await window.electronAPI.addSubscription(subscriptionData);
      emit('show-toast', 'Subscription added successfully', 'success');
    }

    await subscriptionStore.loadSubscriptions();
    router.push({ name: 'Home' });
  } catch (error) {
    errorMessage.value = error.message || 'Failed to save subscription';
    emit('show-toast', errorMessage.value, 'error');
  } finally {
    isLoading.value = false;
  }
}

function handleCancel() {
  router.push({ name: 'Home' });
}
</script>

<style scoped>
.form-page {
  min-height: 100%;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: var(--bg-secondary, #f9fafb);
}

.form-container {
  width: 100%;
  max-width: 560px;
  background: var(--bg-primary, #ffffff);
  border-radius: var(--radius-lg, 16px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  border: 1px solid var(--border-color, #e5e7eb);
  overflow: hidden;
}

.form-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-tertiary, #f3f4f6);
}

.form-header__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 10px);
  color: var(--text-secondary, #4b5563);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--bg-secondary, #f9fafb);
  color: var(--text-primary, #111827);
}

.back-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.3);
}

.form-header h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary, #111827);
}

.form-header p {
  margin: 0;
  font-size: 13px;
  color: var(--text-tertiary, #6b7280);
}

form {
  padding: 22px 24px 24px;
}

.form-hint {
  margin: 0 0 14px;
  font-size: 12px;
  color: var(--text-tertiary, #6b7280);
}

.form-fields {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}

.form-fields:disabled {
  opacity: 0.8;
}

.form-section {
  margin-bottom: 24px;
}

.form-section:last-of-type {
  margin-bottom: 14px;
}

.form-section__title {
  margin: 0 0 10px;
  color: var(--text-tertiary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 11px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #4b5563);
}

.label-required {
  color: var(--danger, #ef4444);
}

.form-group input,
.form-group select {
  width: 100%;
  min-height: 44px;
  padding: 11px 14px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 10px);
  font-size: 14px;
  color: var(--text-primary, #111827);
  background: var(--bg-primary, #ffffff);
  transition: all 0.2s ease;
}

.form-group input::placeholder {
  color: var(--text-tertiary, #9ca3af);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-500, #8b5cf6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.form-group.has-error input,
.form-group.has-error select {
  border-color: var(--danger, #ef4444);
}

.form-group.has-error input:focus,
.form-group.has-error select:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.error-message {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--danger, #ef4444);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 14px;
  color: var(--text-tertiary, #9ca3af);
  font-size: 14px;
  pointer-events: none;
}

.input-with-prefix input {
  padding-left: 32px;
}

.form-error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md, 10px);
  color: var(--danger, #ef4444);
  font-size: 14px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-md, 10px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 140px;
  min-height: 44px;
}

.btn:disabled {
  opacity: 0.62;
  cursor: not-allowed;
}

.btn--secondary {
  background: var(--bg-tertiary, #f3f4f6);
  color: var(--text-secondary, #4b5563);
  border: 1px solid var(--border-color, #e5e7eb);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--bg-secondary, #e5e7eb);
}

.btn--primary {
  background: var(--gradient-primary, linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%));
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.32);
}

.btn--primary:focus-visible {
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.36), 0 6px 14px rgba(139, 92, 246, 0.35);
}

@media (prefers-color-scheme: dark) {
  .form-container {
    background: #1f2937;
    border-color: #374151;
  }

  .form-header {
    background: #111827;
    border-color: #374151;
  }

  .back-btn {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }

  .back-btn:hover {
    background: #4b5563;
    color: #f3f4f6;
  }

  .form-header h2 {
    color: #f3f4f6;
  }

  .form-header p,
  .form-hint,
  .form-section__title {
    color: #9ca3af;
  }

  .label-text {
    color: #d1d5db;
  }

  .form-group input,
  .form-group select {
    background: #111827;
    border-color: #374151;
    color: #f3f4f6;
  }

  .form-group input::placeholder {
    color: #6b7280;
  }

  .form-actions {
    border-color: #374151;
  }

  .btn--secondary {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }

  .btn--secondary:hover:not(:disabled) {
    background: #4b5563;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .back-btn {
    transition: none;
  }

  .btn--primary:hover:not(:disabled),
  .btn--primary:active:not(:disabled) {
    transform: none;
  }
}

@media (max-width: 640px) {
  .form-page {
    padding: 14px;
  }

  .form-header {
    padding: 16px;
  }

  form {
    padding: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
