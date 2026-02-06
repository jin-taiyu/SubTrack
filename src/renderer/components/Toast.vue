<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" :class="['toast', `toast--${type}`]" role="status" aria-live="polite" aria-atomic="true">
        <div class="toast__icon">
          <svg v-if="type === 'success'" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="4 10.5 8 14.5 16 6.5"/>
          </svg>
          <svg v-else-if="type === 'error'" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="14" y2="14"/>
            <line x1="14" y1="6" x2="6" y2="14"/>
          </svg>
          <svg v-else-if="type === 'warning'" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M10 3.5 17 16.5H3L10 3.5Z"/>
            <line x1="10" y1="8" x2="10" y2="11.3"/>
            <circle cx="10" cy="14" r="0.8" fill="currentColor"/>
          </svg>
          <svg v-else viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="10" cy="10" r="7"/>
            <line x1="10" y1="9" x2="10" y2="13"/>
            <circle cx="10" cy="6.5" r="0.9" fill="currentColor"/>
          </svg>
        </div>
        <div class="toast__content">
          <p class="toast__message">{{ message }}</p>
        </div>
        <button type="button" class="toast__close" @click="close" aria-label="Close notification">
          <svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <line x1="5" y1="5" x2="15" y2="15"/>
            <line x1="15" y1="5" x2="5" y2="15"/>
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const visible = ref(props.show);
let timer = null;

watch(() => props.show, (newVal) => {
  visible.value = newVal;
  if (newVal && props.duration > 0) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      close();
    }, props.duration);
  }
});

function close() {
  visible.value = false;
  emit('close');
}

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10000;
  max-width: min(420px, calc(100vw - 24px));
  width: fit-content;
  animation: slideIn 0.3s ease-out;
  border: 1px solid rgba(209, 213, 219, 0.55);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast--success {
  border-left: 4px solid #10b981;
}

.toast--success .toast__icon {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.toast--error {
  border-left: 4px solid #ef4444;
}

.toast--error .toast__icon {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.toast--warning {
  border-left: 4px solid #f59e0b;
}

.toast--warning .toast__icon {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.toast--info {
  border-left: 4px solid #3b82f6;
}

.toast--info .toast__icon {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.toast__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 14px;
  flex-shrink: 0;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__message {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.45;
  word-break: break-word;
}

.toast__close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast__close:hover {
  color: #6b7280;
  background: rgba(0, 0, 0, 0.05);
}

.toast__close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.35);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .toast {
    background: rgba(31, 41, 55, 0.95);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
    border-color: rgba(75, 85, 99, 0.65);
  }

  .toast__message {
    color: #f3f4f6;
  }

  .toast__close {
    color: #9ca3af;
  }

  .toast__close:hover {
    color: #d1d5db;
    background: rgba(255, 255, 255, 0.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: none;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.01ms linear;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}

@media (max-width: 640px) {
  .toast {
    right: 12px;
    left: 12px;
    bottom: 12px;
    max-width: none;
  }
}
</style>
