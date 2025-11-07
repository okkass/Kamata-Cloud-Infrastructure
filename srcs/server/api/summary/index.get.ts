/**
 * 過去24時間分の時系列データを生成するヘルパー関数
 * （実際にはバックエンドがPrometheusやInfluxDBにクエリしてこのデータを生成する）
 */
function generateHourlyData() {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    // 24時間分 (1時間ごと)
    const timestamp = now - i * 3600 * 1000 + 9 * 3600 * 1000; // JST調整
    const value = Math.random() * 0.7 + 0.1; // 10%から80%のランダムな使用率
    data.push({ timestamp, value: parseFloat(value.toFixed(2)) });
  }
  return data;
}

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
      data: [
        {
          id: "pve01",
          name: "Node 1",
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
        },
        {
          id: "pve02",
          name: "Node 2",
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
        },
      ],
      clusterSummary: {
        totalCpu: 16,
        usedCpu: generateRandomUsage(16).used,
        totalMemory: 32768,
        usedMemory: generateRandomUsage(32768).used,
        totalStorage: 2000,
        usedStorage: generateRandomUsage(2000).used,
      },
    };
  } else {
    // 一般ユーザー用のデータ
    response = {
      data: [
        {
          id: "vm101",
          name: "My Web Server",
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
        },
        {
          id: "vm102",
          name: "My Database",
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
        },
      ],
      clusterSummary: {
        totalCpu: 8,
        usedCpu: generateRandomUsage(8).used,
        totalMemory: 8192,
        usedMemory: generateRandomUsage(8192).used,
        totalStorage: 500,
        usedStorage: generateRandomUsage(500).used,
      },
    };
  }
  return response;
});
