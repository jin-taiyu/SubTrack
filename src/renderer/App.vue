<template>
  <div class="app-container">
    <header class="app-header">
      <div class="title-bar">
        <h1>SubTrack</h1>
        <button class="add-btn" @click="navigateToNewSubscription">
          + Add Subscription
        </button>
        <div class="window-controls">
          <button class="window-btn minimize-btn" @click="minimizeWindow">－</button>
          <button class="window-btn maximize-btn" @click="maximizeWindow">
            <span v-if="!isMaximized">◻︎</span>
            <span v-else>▣</span>
          </button>
          <button class="window-btn close-btn" @click="closeWindow">×</button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isMaximized = ref(false);

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
</script>

<style>
:root {
  --primary-color: #2c3e50;
  --secondary-color: #34495e;
  --accent-color: #42b983;
  --danger-color: #dc3545;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
  color: var(--primary-color);
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  display: flex;
  flex-direction: column;
  background: var(--primary-color);
  color: white;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

.title-bar {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  position: relative;
  height: 40px;
  padding-left: 80px;
}

@media screen and (-webkit-app-region: drag) {
  .title-bar {
    padding-left: 80px;
  }
}

.title-bar h1 {
  margin: 0;
  font-size: 1.5rem;
}

.add-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  -webkit-app-region: no-drag;
  margin-left: auto;
  margin-right: 0.5rem;
}

.add-btn:hover {
  background: #3aa876;
}

.window-controls {
  display: flex;
  -webkit-app-region: no-drag;
  height: 100%;
}

.window-btn {
  background: transparent;
  color: white;
  border: none;
  margin: 0;
  padding: 0;
  cursor: pointer;
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.window-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.window-btn.close-btn:hover {
  background: #c0392b;
}

.app-main {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
