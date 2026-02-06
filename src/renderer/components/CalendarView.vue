<template>
  <div class="calendar-view">
    <LoadingSpinner v-if="loading" message="Loading subscriptions..." />

    <EmptyState
      v-else-if="!loading && subscriptions.length === 0"
      title="No Subscriptions Yet"
      description="Start tracking your subscriptions by adding your first one. Stay on top of your recurring payments!"
      actionText="Add Your First Subscription"
      @action="navigateToNewSubscription"
    />

    <div v-else class="calendar-container">
      <section class="calendar-overview" aria-label="Subscription overview">
        <article class="overview-card">
          <p class="overview-card__label">Active Plans</p>
          <p class="overview-card__value">{{ activeSubscriptions }}</p>
        </article>
        <article class="overview-card overview-card--warning">
          <p class="overview-card__label">Due In 7 Days</p>
          <p class="overview-card__value">{{ dueSoonSubscriptions }}</p>
        </article>
        <article class="overview-card overview-card--accent">
          <p class="overview-card__label">Monthly Estimate</p>
          <p class="overview-card__value">{{ formatCurrency(monthlyEstimate) }}</p>
        </article>
      </section>

      <div v-if="error" class="calendar-error" role="alert">
        <div class="calendar-error__content">
          <h2>Could not refresh all subscriptions</h2>
          <p>{{ error }}</p>
        </div>
        <button type="button" class="calendar-error__action" @click="loadCalendarData">
          Retry
        </button>
      </div>

      <div class="calendar-legend" aria-label="Status legend">
        <div class="legend-item">
          <span class="legend-dot legend-dot--active"></span>
          <span>Active</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot legend-dot--upcoming"></span>
          <span>Upcoming</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot legend-dot--due"></span>
          <span>Due Soon</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot legend-dot--paid"></span>
          <span>Paid</span>
        </div>
      </div>

      <FullCalendar ref="calendar" :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { ref, computed, onMounted, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useSubscriptionStore } from '../stores/subscriptions';
import { useRouter } from 'vue-router';
import LoadingSpinner from './LoadingSpinner.vue';
import EmptyState from './EmptyState.vue';

const subscriptionStore = useSubscriptionStore();
const router = useRouter();
const calendar = ref(null);
const loading = ref(true);
const error = ref(null);

const emit = defineEmits(['show-toast']);
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek'
  },
  editable: false,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  events: [],
  eventClick: handleEventClick,
  dateClick: handleDateClick,
  eventContent: renderEventContent,
  height: 'auto',
  aspectRatio: 1.5
});

const subscriptions = computed(() => subscriptionStore.subscriptions);
const activeSubscriptions = computed(() =>
  subscriptions.value.filter((subscription) => {
    const status = getSubscriptionStatus(subscription);
    return status === 'Active' || status === 'Upcoming' || status === 'Due Soon';
  }).length
);
const dueSoonSubscriptions = computed(() =>
  subscriptions.value.filter((subscription) => {
    const status = getSubscriptionStatus(subscription);
    return status === 'Upcoming' || status === 'Due Soon';
  }).length
);
const monthlyEstimate = computed(() =>
  subscriptions.value.reduce((total, subscription) => {
    const price = Number(subscription.price) || 0;
    switch (subscription.period) {
      case 'yearly':
        return total + price / 12;
      case 'quarterly':
        return total + price / 3;
      default:
        return total + price;
    }
  }, 0)
);

function getEventColor(status) {
  switch (status) {
    case 'Active':
      return '#10b981';
    case 'Upcoming':
      return '#3b82f6';
    case 'Due Soon':
      return '#f59e0b';
    case 'Expired':
      return '#ef4444';
    case 'Paid':
      return '#94a3b8';
    default:
      return '#6366f1';
  }
}

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function handleEventClick(info) {
  // Extract the actual subscription ID (remove date suffix)
  const subscriptionId = info.event.extendedProps.subscriptionId || info.event.id.split('-')[0];
  router.push({
    name: 'SubscriptionDetails',
    params: { id: subscriptionId }
  });
}

function handleDateClick(info) {
  router.push({
    name: 'NewSubscription',
    query: { date: info.dateStr }
  });
}

function navigateToNewSubscription() {
  router.push({ name: 'NewSubscription' });
}

function renderEventContent(info) {
  const currencySymbol = getCurrencySymbol(info.event.extendedProps.currency);
  return {
    html: `
      <div class="fc-event-custom">
        <div class="fc-event-title">${escapeHtml(info.event.title)}</div>
        <div class="fc-event-price">${currencySymbol}${info.event.extendedProps.price}</div>
      </div>
    `
  };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getCurrencySymbol(currency) {
  const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥' };
  return symbols[currency] || currency + ' ';
}

function updateCalendarEvents() {
  const events = [];
  const today = dayjs();
  const calendarStart = today.subtract(2, 'month').startOf('month');
  const calendarEnd = today.add(12, 'month').endOf('month');

  subscriptions.value.forEach(sub => {
    if (!sub.nextPaymentDate) return;

    // Calculate the interval based on billing period
    let intervalMonths;
    switch (sub.period) {
      case 'monthly': intervalMonths = 1; break;
      case 'quarterly': intervalMonths = 3; break;
      case 'yearly': intervalMonths = 12; break;
      default: intervalMonths = 1;
    }

    // Generate events from past to future
    let paymentDate = dayjs(sub.nextPaymentDate);

    // Go back in time to find earlier occurrences
    while (paymentDate.isAfter(calendarStart)) {
      paymentDate = paymentDate.subtract(intervalMonths, 'month');
    }
    paymentDate = paymentDate.add(intervalMonths, 'month');

    // Generate all occurrences within the calendar range
    while (paymentDate.isBefore(calendarEnd)) {
      const eventDate = paymentDate.format('YYYY-MM-DD');
      const isPast = paymentDate.isBefore(today, 'day');
      const daysUntil = paymentDate.diff(today, 'days');

      let status;
      if (isPast) {
        status = 'Paid';
      } else if (daysUntil <= 3) {
        status = 'Due Soon';
      } else if (daysUntil <= 7) {
        status = 'Upcoming';
      } else {
        status = 'Active';
      }

      events.push({
        id: `${sub.id}-${eventDate}`,
        title: sub.name,
        start: eventDate,
        allDay: true,
        backgroundColor: getEventColor(status),
        borderColor: 'transparent',
        extendedProps: {
          subscriptionId: sub.id,
          price: sub.price?.toFixed(2) || '0.00',
          currency: sub.currency || 'USD',
          status: status
        }
      });

      paymentDate = paymentDate.add(intervalMonths, 'month');
    }
  });

  calendarOptions.value.events = events;
}

function getSubscriptionStatus(subscription) {
  if (!subscription.nextPaymentDate) return 'Active';
  const daysUntil = dayjs(subscription.nextPaymentDate).diff(dayjs(), 'days');

  if (daysUntil < 0) return 'Expired';
  if (daysUntil <= 3) return 'Due Soon';
  if (daysUntil <= 7) return 'Upcoming';
  return 'Active';
}

onMounted(async () => {
  await loadCalendarData();
});

async function loadCalendarData() {
  try {
    loading.value = true;
    error.value = null;
    await subscriptionStore.loadSubscriptions();
    updateCalendarEvents();
  } catch (e) {
    error.value = e?.message || 'A temporary error occurred while loading data.';
    emit('show-toast', 'Failed to load subscriptions', 'error');
  } finally {
    loading.value = false;
  }
}

watch(subscriptions, () => {
  updateCalendarEvents();
}, { deep: true });
</script>

<style scoped>
.calendar-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-container {
  flex: 1;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100%;
  overflow: visible;
}

.calendar-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.overview-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 243, 255, 0.9) 100%);
  border: 1px solid rgba(199, 210, 254, 0.55);
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 8px 20px rgba(31, 41, 55, 0.06);
}

.overview-card--warning {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(145deg, #fffbeb 0%, #fff7ed 100%);
}

.overview-card--accent {
  border-color: rgba(139, 92, 246, 0.35);
  background: linear-gradient(145deg, #eef2ff 0%, #f5f3ff 100%);
}

.overview-card__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary, #6b7280);
}

.overview-card__value {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 700;
  color: var(--text-primary, #111827);
}

.calendar-error {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.28);
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}

.calendar-error__content h2 {
  font-size: 14px;
  margin: 0 0 2px;
  font-weight: 700;
}

.calendar-error__content p {
  margin: 0;
  font-size: 12px;
}

.calendar-error__action {
  border: none;
  border-radius: 10px;
  padding: 9px 14px;
  background: #dc2626;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 6px 14px rgba(239, 68, 68, 0.2);
}

.calendar-error__action:hover {
  transform: translateY(-1px);
}

.calendar-error__action:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
}

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #4b5563);
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot--active {
  background: #10b981;
}

.legend-dot--upcoming {
  background: #3b82f6;
}

.legend-dot--due {
  background: #f59e0b;
}

.legend-dot--paid {
  background: #94a3b8;
}

/* FullCalendar Theme Customization */
:deep(.fc) {
  --fc-border-color: var(--border-color, #e5e7eb);
  --fc-button-bg-color: var(--primary-600, #7c3aed);
  --fc-button-border-color: var(--primary-600, #7c3aed);
  --fc-button-hover-bg-color: var(--primary-700, #6d28d9);
  --fc-button-hover-border-color: var(--primary-700, #6d28d9);
  --fc-button-active-bg-color: var(--primary-800, #5b21b6);
  --fc-button-active-border-color: var(--primary-800, #5b21b6);
  --fc-today-bg-color: rgba(139, 92, 246, 0.08);
  font-family: var(--font-family, inherit);
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: var(--text-primary, #111827);
  line-height: 1.25 !important;
}

:deep(.fc-button) {
  border-radius: 8px !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  padding: 8px 14px !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.15) !important;
}

:deep(.fc-button:focus) {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3) !important;
}

:deep(.fc-button-group > .fc-button) {
  border-radius: 0 !important;
}

:deep(.fc-button-group > .fc-button:first-child) {
  border-radius: 8px 0 0 8px !important;
}

:deep(.fc-button-group > .fc-button:last-child) {
  border-radius: 0 8px 8px 0 !important;
}

:deep(.fc-daygrid-day) {
  transition: background-color 0.2s ease;
}

:deep(.fc-daygrid-day:hover) {
  background-color: rgba(139, 92, 246, 0.04);
}

:deep(.fc-daygrid-day-number) {
  font-weight: 500;
  color: var(--text-secondary, #4b5563);
  padding: 8px !important;
}

:deep(.fc-col-header-cell-cushion) {
  font-weight: 600;
  color: var(--text-tertiary, #6b7280);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

:deep(.fc-event) {
  border-radius: 6px !important;
  padding: 4px 8px !important;
  margin: 2px 4px !important;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border: none !important;
}

:deep(.fc-event:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.fc-event-custom) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
}

:deep(.fc-event-title) {
  font-weight: 600;
  font-size: 12px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.fc-event-price) {
  font-size: 11px;
  opacity: 0.9;
  font-weight: 500;
}

:deep(.fc-daygrid-event) {
  white-space: normal !important;
}

:deep(.fc-scrollgrid) {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e5e7eb) !important;
  background: var(--bg-primary, white);
  box-shadow: 0 14px 26px -22px rgba(15, 23, 42, 0.45);
}

:deep(.fc-scrollgrid td:last-of-type) {
  border-right: none !important;
}

:deep(.fc-scrollgrid tr:last-of-type td) {
  border-bottom: none !important;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .overview-card {
    background: linear-gradient(145deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%);
    border-color: rgba(75, 85, 99, 0.7);
  }

  .overview-card--warning {
    background: linear-gradient(145deg, rgba(120, 53, 15, 0.26) 0%, rgba(69, 26, 3, 0.32) 100%);
    border-color: rgba(245, 158, 11, 0.35);
  }

  .overview-card--accent {
    background: linear-gradient(145deg, rgba(55, 48, 163, 0.32) 0%, rgba(76, 29, 149, 0.3) 100%);
    border-color: rgba(139, 92, 246, 0.45);
  }

  .overview-card__label {
    color: #9ca3af;
  }

  .overview-card__value {
    color: #f9fafb;
  }

  .calendar-legend .legend-item {
    background: #1f2937;
    border-color: #374151;
    color: #d1d5db;
  }

  .calendar-error {
    border-color: rgba(248, 113, 113, 0.4);
    background: rgba(127, 29, 29, 0.35);
    color: #fecaca;
  }

  .calendar-error__action {
    box-shadow: none;
  }

  :deep(.fc-toolbar-title) {
    color: #f9fafb;
  }

  :deep(.fc-daygrid-day-number) {
    color: #d1d5db;
  }

  :deep(.fc-col-header-cell-cushion) {
    color: #9ca3af;
  }

  :deep(.fc-scrollgrid) {
    background: #1f2937;
    border-color: #374151 !important;
  }

  :deep(.fc) {
    --fc-border-color: #374151;
    --fc-today-bg-color: rgba(139, 92, 246, 0.15);
  }

  :deep(.fc-daygrid-day:hover) {
    background-color: rgba(139, 92, 246, 0.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.fc-event) {
    transition: none;
  }

  :deep(.fc-event:hover) {
    transform: none;
  }
}

@media (max-width: 900px) {
  .calendar-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :deep(.fc .fc-toolbar.fc-header-toolbar) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 12px !important;
  }

  :deep(.fc .fc-toolbar-chunk) {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  :deep(.fc .fc-toolbar-chunk:nth-child(2)) {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .calendar-container {
    padding: 14px;
    gap: 10px;
  }

  .calendar-overview {
    grid-template-columns: 1fr;
  }

  .calendar-error {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-error__action {
    width: 100%;
  }

  :deep(.fc-toolbar-title) {
    font-size: 1.05rem !important;
    text-align: center;
  }

  :deep(.fc .fc-toolbar-chunk) {
    justify-content: center;
  }

  :deep(.fc .fc-button-group) {
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  :deep(.fc .fc-button) {
    min-height: 36px;
    padding: 7px 11px !important;
    font-size: 12px !important;
  }

  :deep(.fc-daygrid-day-number) {
    padding: 6px !important;
    font-size: 12px;
  }

  :deep(.fc-event) {
    margin: 2px !important;
    padding: 3px 6px !important;
  }
}
</style>
