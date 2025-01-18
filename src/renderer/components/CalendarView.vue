<template>
  <div class="calendar-container">
    <FullCalendar ref="calendar" :options="calendarOptions" />
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

const subscriptionStore = useSubscriptionStore();
const router = useRouter();
const calendar = ref(null);

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
  eventContent: renderEventContent
});

const subscriptions = computed(() => subscriptionStore.subscriptions);

function getEventColor(status) {
  switch (status) {
    case 'Active':
      return '#28a745';
    case 'Upcoming':
      return '#17a2b8';
    case 'Due Soon':
      return '#ffc107';
    case 'Expired':
      return '#dc3545';
    default:
      return '#2c3e50';
  }
}

function handleEventClick(info) {
  router.push({
    name: 'SubscriptionDetails',
    params: { id: info.event.id }
  });
}

function handleDateClick(info) {
  router.push({
    name: 'NewSubscription',
    query: { date: info.dateStr }
  });
}

function renderEventContent(info) {
  return {
    html: `
      <div class="fc-event-content">
        <div class="fc-event-title">${info.event.title}</div>
        <div class="fc-event-price">${info.event.extendedProps.price}</div>
      </div>
    `
  };
}

function updateCalendarEvents() {
  calendarOptions.value.events = subscriptions.value.map(sub => ({
    id: sub.id,
    title: sub.name,
    start: sub.nextPaymentDate,
    allDay: true,
    backgroundColor: getEventColor(getSubscriptionStatus(sub)),
    borderColor: getEventColor(getSubscriptionStatus(sub)),
    extendedProps: {
      price: `${sub.currency} ${sub.price.toFixed(2)}`,
      status: getSubscriptionStatus(sub)
    }
  }));
}

function getSubscriptionStatus(subscription) {
  const daysUntil = dayjs(subscription.nextPaymentDate).diff(dayjs(), 'days');

  if (daysUntil < 0) return 'Expired';
  if (daysUntil <= 3) return 'Due Soon';
  if (daysUntil <= 7) return 'Upcoming';
  return 'Active';
}

onMounted(async () => {
  await subscriptionStore.loadSubscriptions();
  updateCalendarEvents();
});

watch(subscriptions, () => {
  updateCalendarEvents();
}, { deep: true });
</script>

<style scoped>
.calendar-container {
  height: calc(100vh - 100px);
  padding: 1rem;
}

:deep(.fc-event) {
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 4px;
  margin: 1px 0;
}

:deep(.fc-event-content) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.fc-event-title) {
  font-weight: 500;
  font-size: 0.9rem;
}

:deep(.fc-event-price) {
  font-size: 0.8rem;
  opacity: 0.8;
}

:deep(.fc-daygrid-event) {
  white-space: normal;
}
</style>
