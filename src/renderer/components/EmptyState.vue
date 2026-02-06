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
    <div class="empty-state__body">
      <h3 class="empty-state__title">{{ title }}</h3>
      <p class="empty-state__description">{{ description }}</p>

      <ul class="empty-state__tips" aria-label="Getting started tips">
        <li>Track monthly, quarterly, and yearly services in one timeline</li>
        <li>Open any date on the calendar to prefill a new payment</li>
      </ul>

      <button v-if="actionText" type="button" class="empty-state__action" @click="$emit('action')">
        <span class="empty-state__action-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="10" y1="4" x2="10" y2="16"/>
            <line x1="4" y1="10" x2="16" y2="10"/>
          </svg>
        </span>
        {{ actionText }}
      </button>
    </div>
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
  align-items: center;
  gap: 20px;
  max-width: 620px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 24px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.94) 0%, rgba(243, 244, 246, 0.88) 100%);
  box-shadow: 0 24px 40px -30px rgba(15, 23, 42, 0.35);
}

.empty-state__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 420px;
}

.empty-state__icon {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-radius: 24px;
  border: 1px solid rgba(139, 92, 246, 0.25);
  box-shadow: 0 12px 20px -14px rgba(99, 102, 241, 0.6);
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
  width: 42px;
  height: 42px;
  color: #7c3aed;
}

.empty-state__title {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary, #1f2937);
}

.empty-state__description {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  max-width: 340px;
  line-height: 1.6;
}

.empty-state__tips {
  margin: 0 0 24px;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
  width: 100%;
}

.empty-state__tips li {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.18);
  color: var(--text-secondary, #4b5563);
  font-size: 12px;
  font-weight: 500;
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
  min-height: 44px;
}

.empty-state__action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.empty-state__action:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.35), 0 6px 20px rgba(99, 102, 241, 0.35);
}

.empty-state__action:active {
  transform: translateY(0);
}

.empty-state__action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .empty-state {
    background: linear-gradient(145deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%);
    border-color: #374151;
  }

  .empty-state__icon {
    background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%);
    border-color: rgba(167, 139, 250, 0.28);
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

  .empty-state__tips li {
    background: rgba(76, 29, 149, 0.35);
    border-color: rgba(139, 92, 246, 0.4);
    color: #e5e7eb;
  }
}

@media (prefers-reduced-motion: reduce) {
  .empty-state__icon {
    animation: none;
  }
}

@media (max-width: 640px) {
  .empty-state {
    margin: 14px;
    padding: 20px 16px;
    border-radius: 18px;
  }
}
</style>
