import { ref } from "vue";

/**
 * 共通ポーリングユーティリティ。
 * callback を指定間隔で実行し、実行時刻を `lastUpdatedTime` に記録します。
 */
export const createPolling = (
  callback: () => Promise<void> | void,
  defaultIntervalMs = 3000
) => {
  const lastUpdatedTime = ref<Date>(new Date());
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stopPolling = () => {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
  };

  const runOnce = async () => {
    await callback();
    lastUpdatedTime.value = new Date();
  };

  const startPolling = (intervalMs: number = defaultIntervalMs) => {
    if (intervalId) return; // 二重起動防止
    intervalId = setInterval(() => {
      void runOnce();
    }, intervalMs);
  };

  return {
    startPolling,
    stopPolling,
    runOnce,
    lastUpdatedTime,
  } as const;
};
