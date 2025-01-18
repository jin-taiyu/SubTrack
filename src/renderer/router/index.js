import { createRouter, createWebHashHistory } from 'vue-router';
import CalendarView from '../components/CalendarView.vue';
import SubscriptionDetailsModal from '../components/SubscriptionDetailsModal.vue';
import SubscriptionForm from '../components/SubscriptionForm.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: CalendarView
  },
  {
    path: '/subscription/:id',
    name: 'SubscriptionDetails',
    component: SubscriptionDetailsModal,
    props: route => ({ subscriptionId: route.params.id })
  },
  {
    path: '/new-subscription',
    name: 'NewSubscription',
    component: SubscriptionForm
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
