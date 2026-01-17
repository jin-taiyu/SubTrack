<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="M12 14l-2 2 2 2"></path>
        <path d="M12 14l2 2-2 2"></path>
      </svg>
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p class="empty-state__description">{{ description }}</p>
    <button v-if="actionText" class="empty-state__action" @click="$emit('action')">
      <span class="empty-state__action-icon">+</span>
      {{ actionText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'No Subscriptions Yet'
  },
  description: {
    type: String,
    default: 'Start tracking your subscriptions by adding your first one.'
  },
  actionText: {
    type: String,
    default: 'Add Subscription'
  }
});

defineEmits(['action']);
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  min-height: 400px;
}

.empty-state__icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-radius: 24px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.empty-state__icon svg {
  width: 40px;
  height: 40px;
  color: #7c3aed;
}

.empty-state__title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.empty-state__description {
  margin: 0 0 24px;
  font-size: 14px;
  color: #6b7280;
  max-width: 300px;
  line-height: 1.6;
}

.empty-state__action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.empty-state__action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.empty-state__action:active {
  transform: translateY(0);
}

.empty-state__action-icon {
  font-size: 18px;
  font-weight: 700;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .empty-state__icon {
    background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%);
  }

  .empty-state__icon svg {
    color: #a78bfa;
  }

  .empty-state__title {
    color: #f3f4f6;
  }

  .empty-state__description {
    color: #9ca3af;
  }
}
</style>
