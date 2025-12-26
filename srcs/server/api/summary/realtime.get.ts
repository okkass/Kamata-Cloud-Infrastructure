import type { SummaryResponse } from "@@/shared/types";

function generateRandomUsage(total: number) {
  const used = Math.random() * total;
  return {
    used: parseFloat(used.toFixed(1)),
    total: total,
  };
}

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const isAdmin = query.admin === "1";
  let response: SummaryResponse;

  if (isAdmin) {
    response = {
      clusterSummary: {
        totalCpu: 16,
        usedCpu: generateRandomUsage(16).used,
        totalMemory: 32768 * 1024 ** 2,
        usedMemory: generateRandomUsage(32768 * 1024 ** 2).used,
        totalStorage: 2000 * 1024 ** 3,
        usedStorage: generateRandomUsage(2000 * 1024 ** 3).used,
      },
    };
  } else {
    // 一般ユーザー用のデータ
    response = {
      clusterSummary: {
        totalCpu: 8,
        usedCpu: generateRandomUsage(8).used,
        totalMemory: 8192 * 1024 ** 2,
        usedMemory: generateRandomUsage(8192 * 1024 ** 2).used,
        totalStorage: 500 * 1024 ** 3,
        usedStorage: generateRandomUsage(500 * 1024 ** 3).used,
      },
    };
  }
  return response;
});
