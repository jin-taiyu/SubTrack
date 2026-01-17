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
  try {
    loading.value = true;
    error.value = null;
    await subscriptionStore.loadSubscriptions();
    updateCalendarEvents();
  } catch (e) {
    error.value = e.message;
    emit('show-toast', 'Failed to load subscriptions', 'error');
  } finally {
    loading.value = false;
  }
});

watch(subscriptions, () => {
  updateCalendarEvents();
}, { deep: true });
</script>

<style scoped>
.calendar-view {
  height: calc(100vh - 52px);
  display: flex;
  flex-direction: column;
}

.calendar-container {
  flex: 1;
  padding: 24px;
  overflow: auto;
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
}

:deep(.fc-scrollgrid td:last-of-type) {
  border-right: none !important;
}

:deep(.fc-scrollgrid tr:last-of-type td) {
  border-bottom: none !important;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
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
</style>
