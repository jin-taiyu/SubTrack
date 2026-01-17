<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" :class="['toast', `toast--${type}`]" role="alert">
        <div class="toast__icon">
          <span v-if="type === 'success'">✓</span>
          <span v-else-if="type === 'error'">✕</span>
          <span v-else-if="type === 'warning'">⚠</span>
          <span v-else>ℹ</span>
        </div>
        <div class="toast__content">
          <p class="toast__message">{{ message }}</p>
        </div>
        <button class="toast__close" @click="close" aria-label="Close">×</button>
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
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10000;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
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
  font-weight: 600;
  flex-shrink: 0;
}

.toast__content {
  flex: 1;
}

.toast__message {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
}

.toast__close {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast__close:hover {
  color: #6b7280;
  background: rgba(0, 0, 0, 0.05);
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
</style>
