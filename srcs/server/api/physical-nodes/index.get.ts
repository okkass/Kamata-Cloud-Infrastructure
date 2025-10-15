import { PhysicalNodeDTO } from "~~/shared/types";

export default defineEventHandler(() => {
  const mock1: Array<PhysicalNodeDTO> = [
    {
      id: "d898bae4-0a05-48aa-846e-aca5bbfd72c6",
      name: "Node 1",
      ipAddress: "192.168.1.100",
      status: "active",
      isAdmin: true,
      createdAt: new Date().toISOString(),
      cpuUtilization: 0.55, // 0 to 1
      memoryUtilization: 0.7, // 0 to 1
      storageUtilization: 0.6, // 0 to 1
    },
  ];
  const mock2: Array<PhysicalNodeDTO> = [
    {
      id: "d898bae4-0a05-48aa-846e-aca5bbfd72c6",
      name: "Node 1",
      ipAddress: "192.168.1.100",
      status: "active",
      isAdmin: true,
      createdAt: new Date().toISOString(),
      cpuUtilization: 0.55, // 0 to 1
      memoryUtilization: 0.7, // 0 to 1
      storageUtilization: 0.6, // 0 to 1
    },
    {
      id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
      name: "Node 2",
      ipAddress: "192.168.1.101",
      status: "active",
      isAdmin: false,
      createdAt: new Date().toISOString(),
      cpuUtilization: 0.55, // 0 to 1
      memoryUtilization: 0.7, // 0 to 1
      storageUtilization: 0.6, // 0 to 1
    },
  ];
  return mock2;
});
