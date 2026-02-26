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

function generateRandomUsage(total) {
  const used = Math.random() * total;
  return {
    used: parseFloat(used.toFixed(1)),
    total
  };
}
const realtime_get = defineEventHandler((event) => {
  const query = getQuery(event);
  const isAdmin = query.admin === "1";
  let response;
  if (isAdmin) {
    response = {
      clusterSummary: {
        totalCpu: 16,
        usedCpu: generateRandomUsage(16).used,
        totalMemory: 32768 * 1024 ** 2,
        usedMemory: generateRandomUsage(32768 * 1024 ** 2).used,
        totalStorage: 2e3 * 1024 ** 3,
        usedStorage: generateRandomUsage(2e3 * 1024 ** 3).used
      }
    };
  } else {
    response = {
      clusterSummary: {
        totalCpu: 8,
        usedCpu: generateRandomUsage(8).used,
        totalMemory: 8192 * 1024 ** 2,
        usedMemory: generateRandomUsage(8192 * 1024 ** 2).used,
        totalStorage: 500 * 1024 ** 3,
        usedStorage: generateRandomUsage(500 * 1024 ** 3).used
      }
    };
  }
  return response;
});

export { realtime_get as default };
//# sourceMappingURL=realtime.get.mjs.map
