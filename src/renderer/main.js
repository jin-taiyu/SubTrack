import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(router);

app.mount("#app");

window.addEventListener("resize", () => {
  window.electronAPI.on("window-resized", () => {
    // Handle window resize if needed
  });
});
