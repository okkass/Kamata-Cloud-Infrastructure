import { ref } from 'vue';

const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = () => {
  console.error(intervalError);
};
const createPolling = (callback, defaultIntervalMs = 3e3) => {
  const lastUpdatedTime = ref(/* @__PURE__ */ new Date());
  let intervalId = null;
  const stopPolling = () => {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
  };
  const runOnce = async () => {
    await callback();
    lastUpdatedTime.value = /* @__PURE__ */ new Date();
  };
  const startPolling = (intervalMs = defaultIntervalMs) => {
    if (intervalId) return;
    intervalId = setInterval();
  };
  return {
    startPolling,
    stopPolling,
    runOnce,
    lastUpdatedTime
  };
};

export { createPolling as c };
//# sourceMappingURL=polling-9ov9NMoc.mjs.map
