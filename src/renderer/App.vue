<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <header class="app-header">
      <div class="title-bar">
        <div class="logo-section">
          <div class="logo-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="3"/>
              <line x1="8" y1="2.5" x2="8" y2="6"/>
              <line x1="16" y1="2.5" x2="16" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <circle cx="8" cy="14.5" r="1"/>
              <circle cx="12" cy="14.5" r="1"/>
              <circle cx="16" cy="14.5" r="1"/>
            </svg>
          </div>
          <h1>SubTrack</h1>
        </div>
        <button type="button" class="add-btn" @click="navigateToNewSubscription">
          <span class="add-btn__icon">+</span>
          <span class="add-btn__text">Add Subscription</span>
        </button>
        <div class="window-controls">
          <button type="button" class="window-btn minimize-btn" @click="minimizeWindow" title="Minimize" aria-label="Minimize window">
            <svg viewBox="0 0 12 12" width="12" height="12">
              <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <button type="button" class="window-btn maximize-btn" @click="maximizeWindow" title="Maximize" aria-label="Maximize window">
            <svg v-if="!isMaximized" viewBox="0 0 12 12" width="12" height="12">
              <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.5" rx="1"/>
            </svg>
            <svg v-else viewBox="0 0 12 12" width="12" height="12">
              <rect x="3" y="3" width="6" height="6" fill="none" stroke="currentColor" stroke-width="1.5" rx="1"/>
            </svg>
          </button>
          <button type="button" class="window-btn close-btn" @click="closeWindow" title="Close" aria-label="Close window">
            <svg viewBox="0 0 12 12" width="12" height="12">
              <line x1="3" y1="3" x2="9" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="9" y1="3" x2="3" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" @show-toast="showToast" />
        </transition>
      </router-view>
    </main>

    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Toast from './components/Toast.vue';

const router = useRouter();
const isMaximized = ref(false);
const isDarkMode = ref(false);

const toast = ref({
  show: false,
  message: '',
  type: 'info'
});

function showToast(message, type = 'info') {
  toast.value = { show: true, message, type };
}

function navigateToNewSubscription() {
  router.push({ name: 'NewSubscription' });
}

function minimizeWindow() {
  window.electronAPI.minimizeWindow();
}

function maximizeWindow() {
  window.electronAPI.maximizeWindow();
  isMaximized.value = !isMaximized.value;
}

function closeWindow() {
  window.electronAPI.closeWindow();
}

// Detect system dark mode preference
function updateDarkMode(e) {
  isDarkMode.value = e.matches;
}

onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  isDarkMode.value = mediaQuery.matches;
  mediaQuery.addEventListener('change', updateDarkMode);
});

onUnmounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.removeEventListener('change', updateDarkMode);
});

// Expose showToast globally via provide/inject if needed
</script>

<style>
/* Import Google Font - must be first */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Modern Design System */
:root {
  /* Primary Colors */
  --primary-50: #f5f3ff;
  --primary-100: #ede9fe;
  --primary-200: #ddd6fe;
  --primary-300: #c4b5fd;
  --primary-400: #a78bfa;
  --primary-500: #8b5cf6;
  --primary-600: #7c3aed;
  --primary-700: #6d28d9;
  --primary-800: #5b21b6;
  --primary-900: #4c1d95;

  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  --gradient-header: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  --gradient-card: linear-gradient(145deg, #ffffff 0%, #f9fafb 100%);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
  --transition-slow: 0.4s ease;
  --focus-ring: 0 0 0 3px rgba(167, 139, 250, 0.38);
  --focus-ring-strong: 0 0 0 4px rgba(167, 139, 250, 0.45);

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

  /* Theme Colors (Light) */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-tertiary: #6b7280;
  --border-color: #e5e7eb;
}

/* Dark Mode Variables */
.dark-mode {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  --border-color: #374151;
  --gradient-header: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  --gradient-card: linear-gradient(145deg, #1f2937 0%, #111827 100%);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  line-height: 1.55;
  color: var(--text-primary);
  background: var(--bg-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button,
input,
select {
  font: inherit;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-secondary);
  overflow: hidden;
}

.app-header {
  background: var(--gradient-header);
  color: white;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  position: relative;
  z-index: 100;
}

.app-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.app-header::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(420px 90px at 25% -40%, rgba(139, 92, 246, 0.38), transparent 68%),
    radial-gradient(350px 80px at 75% -30%, rgba(99, 102, 241, 0.28), transparent 72%);
  opacity: 0.85;
}

.title-bar {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 56px;
  padding-left: 80px;
  position: relative;
  z-index: 1;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f5f3ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.title-bar h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 24px rgba(139, 92, 246, 0.35);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all var(--transition-fast);
  -webkit-app-region: no-drag;
  margin-left: auto;
  margin-right: 12px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.32);
  min-height: 36px;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.add-btn:active {
  transform: translateY(0);
}

.add-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-strong), 0 4px 12px rgba(139, 92, 246, 0.35);
}

.add-btn__icon {
  font-size: 16px;
  font-weight: 700;
}

.window-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.window-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.window-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.window-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.window-btn.close-btn:hover {
  background: #ef4444;
  color: white;
}

.app-main {
  flex: 1;
  overflow: auto;
  position: relative;
  background: var(--bg-secondary);
}

/* Custom Scrollbar */
.app-main::-webkit-scrollbar {
  width: 8px;
}

.app-main::-webkit-scrollbar-track {
  background: transparent;
}

.app-main::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 4px;
}

.dark-mode .app-main::-webkit-scrollbar-thumb {
  background: var(--gray-600);
}

.app-main::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}

/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Modal Base Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
}

/* Responsive */
@media (max-width: 640px) {
  .title-bar {
    padding-left: 16px;
    height: 52px;
  }

  .add-btn__text {
    display: none;
  }

  .add-btn {
    padding: 8px 12px;
    min-width: 42px;
    margin-right: 8px;
  }

  .window-controls {
    gap: 6px;
  }

  .window-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
