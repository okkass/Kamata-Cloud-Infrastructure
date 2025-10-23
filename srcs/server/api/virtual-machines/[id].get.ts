import { validate } from "uuid";
import { VirtualMachineDTO } from "~~/shared/types";

export default defineEventHandler((event) => {
  const id = event.context.params?.id;
  let vm: VirtualMachineDTO | undefined; // 見つからない可能性があるので undefined も許容

  // IDの形式をチェック
  if (!id || !validate(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid ID format",
    });
  }

  // ★★★ ここからモックデータを更新 ★★★
  // 各VMの詳細データをIDをキーにして保持
  const mockDb: Array<VirtualMachineDTO> = [
    {
      id: "8874840c-fe85-4eb9-985f-a856eee1faa2",
      name: "vm-01 (フル構成)",
      instanceType: {
        id: "2b03254f-5485-4286-8baa-77ebee3aea9b",
        name: "t2.standard",
        createdAt: new Date().toISOString(),
        cpuCore: 4, // ★ cpuCores -> cpuCore に変更（合わせる）
        memorySize: 4 * 1024 * 1024 * 1024, // 4 GB
      },
      status: "running",
      node: {
        id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
        name: "Node 2",
        ipAddress: "10.10.10.10",
        status: "active",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      securityGroups: [
        {
          id: "399f4fd6-8335-46f7-bd80-4e53eb0fbe9b",
          name: "default",
          createdAt: new Date().toISOString(),
        },
      ],
      attachedStorages: [
        {
          storage: {
            id: "rgedfghjk67890-6b02-4c99-bb05-cf8487411d1f",
            name: "vm-01-os",
            size: 50 * 1024 * 1024 * 1024, // 50GB
            pool: "532ca711-42e0-449c-bd1c-51af16f333b6",
          },
          path: "/dev/sda", // OSディスク
        },
        {
          storage: {
            id: "je3634-2345-4abc-89de-abcdef123456",
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
    {
      id: "671d6880-b0f5-4fcb-827d-aae17536888c",
      name: "vm-02 ", // ★ 末尾のスペースを削除
      instanceType: {
        id: "2b03254f-5485-4286-8baa-77ebee3aea9b",
        name: "t2.standard",
        createdAt: new Date().toISOString(),
        cpuCore: 2, // ★ cpuCores -> cpuCore
        memorySize: 2 * 1024 * 1024 * 1024, // 2 GB
      },
      status: "stopped",
      node: {
        id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
        name: "Node 2",
        ipAddress: "10.10.10.10",
        status: "active",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      securityGroups: [],
      attachedStorages: [
        {
          storage: {
            id: "hres25634-2345-4abc-89de-abcdef123456",
            name: "vm-02-os",
            size: 20 * 1024 * 1024 * 1024, // 20GB
            pool: "532ca711-42e0-449c-bd1c-51af16f333b6",
          },
          path: "/dev/sda", // OSディスク
        },
      ],
      attachedNics: [],
    },
    {
      id: "11223344-5566-7788-99aa-bbccddeeff00",
      name: "vm-03 (最小構成)",
      instanceType: {
        id: "7b6fb312-8c89-44d2-a417-4665a4a9be83",
        name: "t2.micro",
        cpuCore: 1, // ★ cpuCores -> cpuCore
        memorySize: 1 * 1024 * 1024 * 1024,
        createdAt: new Date().toISOString(),
      },
      status: "running",
      node: {
        id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
        name: "Node 2",
        ipAddress: "10.10.10.10",
        status: "active",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      securityGroups: [],
      attachedStorages: [],
      // ★ attachedNics がなかったので追加
      attachedNics: [],
    },
    {
      id: "42dfwer56-7890-abcd-efgh-ijklmnopqrst",
      name: "vm-04 (複数SG)",
      instanceType: {
        id: "2b03254f-5485-4286-8baa-77ebee3aea9b",
        createdAt: new Date().toISOString(),
        name: "t2.standard",
        cpuCore: 8, // ★ cpuCores -> cpuCore
        memorySize: 16 * 1024 * 1024 * 1024,
      },
      status: "error",
      node: {
        id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
        name: "Node 2",
        ipAddress: "10.10.10.10",
        status: "active",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      // ★ securityGroups がなかったので追加 (空配列)
      securityGroups: [],
      attachedStorages: [],
      // ★ attachedNics がなかったので追加
      attachedNics: [],
    },
    {
      id: "1rr3wgfe56-7890-abcd-efgh-ijklmnopqrst",
      name: "vm-05(テスト用)",
      cpuCore: 2,
      memorySize: 2 * 1024 * 1024 * 1024,
      status: "pending",
      node: {
        id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
        name: "Node 2",
        ipAddress: "10.10.10.10",
        status: "active",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      securityGroups: [],
      attachedStorages: [
        {
          storage: {
            id: "dgefghjk67890-6b02-4c99-bb05-cf8487411d1f",
            name: "vm-05-os",
            size: 30 * 1024 * 1024 * 1024, // 30GB
            pool: "532ca711-42e0-449c-bd1c-51af16f333b6",
          },
          path: "/dev/sda", // OSディスク
        },
      ],
      attachedNics: [
        {
          id: "dddddd-dddd-dddd-dddd-dddddddddddd",
          subnetId: "9653a4bb-3c60-4950-abf0-2702023696c2",
        },
      ],
    },
  ];

  // IDに基づいてVMデータを取得
  vm = mockDb.find((item) => item.id === id);

  // 該当するVMが見つからない場合は404エラーを返す
  if (!vm) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found",
    });
  }
  return vm;
});
