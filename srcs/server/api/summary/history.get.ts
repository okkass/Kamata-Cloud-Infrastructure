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

function generateNetworkHourlyData() {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    // 24時間分 (1時間ごと)
    const timestamp = now - i * 3600 * 1000 + 9 * 3600 * 1000; // JST調整
    const value = Math.random() * 1000; // 0から1000のランダムな使用率
    data.push({ timestamp, value: parseFloat(value.toFixed(1)) });
  }
  return data;
}

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const isAdmin = query.admin === "1";
  let response: SummaryHistoryResponse;
  if (isAdmin) {
    response = {
      data: [
        {
          id: "pve01",
          name: "Node 1",
          totalCpu: 16,
          totalMemory: 32 * 1024 ** 3,
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
          networkHistory: generateNetworkHourlyData(),
        },
        {
          id: "pve02",
          name: "Node 2",
          totalCpu: 40,
          totalMemory: 64 * 1024 ** 3,
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
          networkHistory: generateNetworkHourlyData(),
        },
      ],
    };
  } else {
    // 一般ユーザー用のデータ
    response = {
      data: [
        {
          id: "vm101",
          name: "VM 101",
          totalCpu: 4,
          totalMemory: 8 * 1024 ** 3,
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
          networkHistory: generateNetworkHourlyData(),
        },
        {
          id: "vm102",
          name: "VM 102",
          totalCpu: 4,
          totalMemory: 8 * 1024 ** 3,
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
          networkHistory: generateNetworkHourlyData(),
        },
      ],
    };
  }
  return response;
});
