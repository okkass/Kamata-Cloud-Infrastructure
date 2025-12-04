import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const { id, subnetId } = event.context.params as {
    id: string;
    subnetId: string;
  };

  if (!validate(id) || !validate(subnetId)) {
    throw createError({ statusCode: 400, message: "Invalid UUID format" });
  }

  // Mock data matching the VM response schema
  const mock: Record<string, Array<any>> = {
    // example subnet id -> list of VMs
    "effdf1f8-3be5-4cae-819a-5832fc053b1b": [
      {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "vm-web-01",
        status: "running",
        node: {
          id: "node-1",
          name: "node-1",
          ipAddress: "192.168.3.19",
          status: "active",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        securityGroups: [
          {
            id: "sg-11111111-1111-1111-1111-111111111111",
            name: "default",
            description: "デフォルトのセキュリティグループ",
            createdAt: new Date().toISOString(),
          },
        ],
        storages: [
          {
            id: "st-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            name: "root-disk",
            size: 40 * 1024 * 1024 * 1024, // 40 GiB
            type: "ssd",
            createdAt: new Date().toISOString(),
          },
        ],
        networkInterfaces: [
          {
            id: "nic-11111111-2222-3333-4444-555555555555",
            name: "eth0",
            macAddress: "fa:16:3e:ab:cd:01",
            ipAddress: "10.0.1.10",
            networkId: subnetId,
            createdAt: new Date().toISOString(),
          },
        ],
        cpuUtilization: 0.18,
        memoryUtilization: 0.42,
        storageUtilization: 0.12,
        cpuCore: 2,
        memorySize: 4 * 1024 * 1024 * 1024, // 4 GiB
      },

      {
        id: "b2c3d4e5-f6a7-8901-bcde-0123456789ab",
        name: "vm-db-01",
        status: "stopped",
        node: {
          id: "node-2",
          name: "node-2",
          ipAddress: "192.168.3.20",
          status: "active",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        securityGroups: [
          {
            id: "sg-22222222-2222-2222-2222-222222222222",
            name: "db",
            description: "DB用セキュリティグループ",
            createdAt: new Date().toISOString(),
          },
        ],
        storages: [
          {
            id: "st-bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            name: "db-data",
            size: 200 * 1024 * 1024 * 1024, // 200 GiB
            type: "hdd",
            createdAt: new Date().toISOString(),
          },
        ],
        networkInterfaces: [
          {
            id: "nic-66666666-7777-8888-9999-000000000000",
            name: "eth0",
            macAddress: "fa:16:3e:ab:cd:02",
            ipAddress: "10.0.1.11",
            networkId: subnetId,
            createdAt: new Date().toISOString(),
          },
        ],
        cpuUtilization: 0.02,
        memoryUtilization: 0.05,
        storageUtilization: 0.65,
        cpuCore: 4,
        memorySize: 16 * 1024 * 1024 * 1024, // 16 GiB
      },
    ],
    "6146ccd7-ddf8-42c3-9edf-66ce6f7a2c4b": [
      {
        id: "c3d4e5f6-a7b8-9012-cdef-1234567890ab",
        name: "vm-app-01",
        status: "running",
        node: {
          id: "node-3",
          name: "node-3",
          ipAddress: "192.168.3.96",
          status: "active",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        securityGroups: [
          {
            id: "sg-33333333-3333-3333-3333-333333333333",
            name: "app",
            description: "アプリケーション用セキュリティグループ",
            createdAt: new Date().toISOString(),
          },
        ],
        storages: [
          {
            id: "st-cccccccc-cccc-cccc-cccc-cccccccccccc",
            name: "app-disk",
            size: 100 * 1024 * 1024 * 1024, // 100 GiB
            type: "ssd",
            createdAt: new Date().toISOString(),
          },
        ],
        networkInterfaces: [
          {
            id: "nic-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            name: "eth0",
            macAddress: "fa:16:3e:ab:cd:03",
            ipAddress: "10.0.1.19",
            networkId: subnetId,
            createdAt: new Date().toISOString(),
          },
        ],
        cpuUtilization: 0.35,
        memoryUtilization: 0.55,
        storageUtilization: 0.25,
        cpuCore: 2,
        memorySize: 8 * 1024 * 1024 * 1024, // 8 GiB
      },
    ],
  };

  // Return mock list for the requested subnet
  return mock[subnetId] ?? [];
});
