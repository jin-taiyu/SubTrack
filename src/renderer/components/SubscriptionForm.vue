<template>
  <div class="form-container">
    <form id="subscription-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Subscription Name</label>
        <input type="text" id="name" v-model="formData.name" required placeholder="e.g. Netflix" />
      </div>

      <div class="form-group">
        <label for="platform">Platform</label>
        <input type="text" id="platform" v-model="formData.platform" required placeholder="e.g. Netflix, Spotify" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="price">Price</label>
          <input type="number" id="price" v-model="formData.price" required min="0" step="0.01" />
        </div>

        <div class="form-group">
          <label for="currency">Currency</label>
          <select id="currency" v-model="formData.currency" required>
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
          <label for="period">Billing Period</label>
          <select id="period" v-model="formData.period" required>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div class="form-group">
          <label for="nextPaymentDate">Next Payment Date</label>
          <input type="date" id="nextPaymentDate" v-model="formData.nextPaymentDate" required />
        </div>
      </div>

      <div class="form-group">
        <label for="paymentMethod">Payment Method</label>
        <input type="text" id="paymentMethod" v-model="formData.paymentMethod" required
          placeholder="e.g. Visa **** 1234" />
      </div>
    </form>
    <div class="form-actions">
      <button class="btn cancel-btn" @click="handleCancel">Cancel</button>
      <button class="btn submit-btn" form="subscription-form" type="submit">{{ submitButtonText }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { useSubscriptionStore } from '../stores/subscriptions';

const router = useRouter();
const subscriptionStore = useSubscriptionStore();

import { useRoute } from 'vue-router';
const route = useRoute();

const defaultSubscription = {
  name: '',
  platform: '',
  price: 0,
  currency: 'USD',
  period: 'monthly',
  nextPaymentDate: dayjs().format('YYYY-MM-DD'),
  paymentMethod: ''
};

const initialSubscription = computed(() => {
  if (route.query.edit === 'true' && route.state?.subscription) {
    return route.state.subscription;
  }
  return defaultSubscription;
});

const formData = ref({ ...initialSubscription.value });
const isEditing = computed(() => route.query.edit === 'true');

watch(
  () => route.state?.subscription,
  (newSubscription) => {
    if (newSubscription) {
      formData.value = { ...newSubscription };
    }
  }
);

const submitButtonText = computed(() => isEditing.value ? 'Update Subscription' : 'Add Subscription');
const isLoading = ref(false);
const errorMessage = ref('');

async function handleSubmit() {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    const subscriptionData = {
      ...formData.value,
      price: parseFloat(formData.value.price)
    };

    if (isEditing.value) {
      await window.electronAPI.updateSubscription(
        initialSubscription.value.id,
        subscriptionData
      );
    } else {
      const createdSub = await window.electronAPI.addSubscription(subscriptionData);
      await subscriptionStore.loadSubscriptions();
    }

    router.push({ name: 'Home' });
  } catch (error) {
    errorMessage.value = error.message || 'Failed to save subscription';
  } finally {
    isLoading.value = false;
  }
}

function handleCancel() {
  router.push({ name: 'Home' });
}
</script>

<style scoped>
.form-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
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
}

.cancel-btn {
  background: #f8f9fa;
  color: #2c3e50;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.submit-btn {
  background: #2c3e50;
  color: white;
}

.submit-btn:hover {
  background: #34495e;
}
</style>
