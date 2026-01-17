<template>
  <div class="loading-spinner" :class="{ 'loading-spinner--fullscreen': fullscreen }">
    <div class="spinner">
      <div class="spinner__ring"></div>
      <div class="spinner__ring"></div>
      <div class="spinner__ring"></div>
    </div>
    <p v-if="message" class="loading-spinner__message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}

.loading-spinner--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner__ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner__ring:nth-child(1) {
  border-top-color: #6366f1;
  animation-delay: -0.45s;
}

.spinner__ring:nth-child(2) {
  border-top-color: #8b5cf6;
  animation-delay: -0.3s;
}

.spinner__ring:nth-child(3) {
  border-top-color: #a78bfa;
  animation-delay: -0.15s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-spinner__message {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loading-spinner--fullscreen {
    background: rgba(17, 24, 39, 0.85);
  }

  .loading-spinner__message {
    color: #9ca3af;
  }
}
</style>
