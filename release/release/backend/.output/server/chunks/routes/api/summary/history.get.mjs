import { d as defineEventHandler, g as getQuery } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'jose';
import '@prisma/client/runtime/client';
import '@prisma/adapter-mariadb';
import 'argon2';

function generateHourlyData() {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const timestamp = now - i * 3600 * 1e3 + 9 * 3600 * 1e3;
    const value = Math.random() * 0.7 + 0.1;
    data.push({ timestamp, value: parseFloat(value.toFixed(2)) });
  }
  return data;
}
function generateNetworkHourlyData() {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const timestamp = now - i * 3600 * 1e3 + 9 * 3600 * 1e3;
    const value = Math.random() * 1e3;
    data.push({ timestamp, value: parseFloat(value.toFixed(1)) });
  }
  return data;
}
const history_get = defineEventHandler((event) => {
  const query = getQuery(event);
  const isAdmin = query.admin === "1";
  let response;
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
          networkINHistory: generateNetworkHourlyData(),
          networkOUTHistory: generateNetworkHourlyData()
        },
        {
          id: "pve02",
          name: "Node 2",
          totalCpu: 40,
          totalMemory: 64 * 1024 ** 3,
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
          networkINHistory: generateNetworkHourlyData(),
          networkOUTHistory: generateNetworkHourlyData()
        }
      ]
    };
  } else {
    response = {
      data: [
        {
          id: "vm101",
          name: "VM 101",
          totalCpu: 4,
          totalMemory: 8 * 1024 ** 3,
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
          networkINHistory: generateNetworkHourlyData(),
          networkOUTHistory: generateNetworkHourlyData()
        },
        {
          id: "vm102",
          name: "VM 102",
          totalCpu: 4,
          totalMemory: 8 * 1024 ** 3,
          cpuHistory: generateHourlyData(),
          memHistory: generateHourlyData(),
          networkINHistory: generateNetworkHourlyData(),
          networkOUTHistory: generateNetworkHourlyData()
        }
      ]
    };
  }
  return response;
});

export { history_get as default };
//# sourceMappingURL=history.get.mjs.map
