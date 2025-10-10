import { validate } from "uuid";

export default defineEventHandler((event) => {
  const id = event.context.params?.id;

  // IDの形式をチェック
  if (!id || !validate(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid ID format",
    });
  }

  // 各VMの詳細データをIDをキーにして保持
  const mockDb = {
    // --- 1. 既存データをベースにした「フル構成」のVM ---
    "8874840c-fe85-4eb9-985f-a856eee1faa2": {
      id: "8874840c-fe85-4eb9-985f-a856eee1faa2",
      name: "vm-01 (フル構成)",
      instanceType: {
        id: "2b03254f-5485-4286-8baa-77ebee3aea9b",
        name: "t2.standard",
        cpuCores: 4,
        memorySize: 4 * 1024 * 1024 * 1024, // 4 GB
      },
      status: "running",
      node: {
        id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
        name: "Node 2",
      },
      securityGroups: [
        {
          id: "399f4fd6-8335-46f7-bd80-4e53eb0fbe9b",
          name: "default",
        },
      ],
      attachedStorages: [
        {
          storage: {
            id: "storage-os-01",
            name: "vm-01-os",
            size: 50 * 1024 * 1024 * 1024, // 50GB
            pool: "532ca711-42e0-449c-bd1c-51af16f333b6",
          },
          path: "/dev/sda", // OSディスク
        },
        {
          storage: {
            id: "storage-data-01",
            name: "vm-01-data",
            size: 100 * 1024 * 1024 * 1024, // 100GB
            pool: "93061a02-e35d-4055-8bcd-a0002440fb89",
          },
          path: "/dev/sdb", // データディスク
        },
      ],
      attachedNics: [
        {
          id: "nic-01",
          subnetId: "9653a4bb-3c60-4950-abf0-2702023696c2",
        },
      ],
    },
    // --- 2. ストレージやSGが空の「最小構成」VM ---
    "671d6880-b0f5-4fcb-827d-aae17536888c": {
      id: "671d6880-b0f5-4fcb-827d-aae17536888c",
      name: "vm-02 (最小構成)",
      instanceType: {
        id: "7b6fb312-8c89-44d2-a417-4665a4a9be83",
        name: "t2.micro",
        cpuCores: 1,
        memorySize: 1 * 1024 * 1024 * 1024, // 1 GB
      },
      status: "stopped",
      node: {
        id: "d898bae4-0a05-48aa-846e-aca5bbfd72c6",
        name: "Node 1",
      },
      securityGroups: [], // SGなし
      attachedStorages: [], // ストレージなし
      attachedNics: [], // NICなし
    },
    // --- 3. 複数のSGを持つVM ---
    "11223344-5566-7788-99aa-bbccddeeff00": {
      id: "11223344-5566-7788-99aa-bbccddeeff00",
      name: "vm-03 (複数SG)",
      instanceType: {
        id: "2b03254f-5485-4286-8baa-77ebee3aea9b",
        name: "t2.standard",
        cpuCores: 8,
        memorySize: 16 * 1024 * 1024 * 1024, // 16 GB
      },
      status: "error",
      node: {
        id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
        name: "Node 2",
      },
      securityGroups: [
        {
          id: "399f4fd6-8335-46f7-bd80-4e53eb0fbe9b",
          name: "default",
        },
        {
          id: "5381dc40-e9ec-4e77-b738-3447d1e8212f",
          name: "ssh-only",
        },
      ],
      attachedStorages: [
        {
          storage: {
            id: "storage-os-04",
            name: "vm-04-os",
            size: 80 * 1024 * 1024 * 1024, // 80GB
            pool: "93061a02-e35d-4055-8bcd-a0002440fb89",
          },
          path: "/dev/sda",
        },
      ],
      attachedNics: [
        {
          id: "nic-04",
          subnetId: "f29a1d76-f506-4a3b-bb3b-7acf35d1c2cd",
        },
      ],
    },
  };

  const vmData = mockDb[id as keyof typeof mockDb];

  if (!vmData) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  return vmData;
});
