import { LocalStoragePoolDTO } from "~~/shared/types";

export default defineEventHandler(() => {
  const storagePools: Array<LocalStoragePoolDTO> = [
    {
      id: "532ca711-42e0-449c-bd1c-51af16f333b6",
      name: "node1-SSD",
      createdAt: new Date().toISOString(),
      totalSize: 512 * 1024 * 1_024 * 1_024,
      usedSize: 200 * 1024 * 1_024 * 1_024,
      nodeId: "c53bf525-96b2-47f9-940e-6a84001afb61",
      devFile: "/dev/sda1",
    },
    {
      id: "93061a02-e35d-4055-8bcd-a0002440fb89",
      name: "node1-nfs",
      createdAt: new Date().toISOString(),
      totalSize: 512 * 1024 * 1_024 * 1_024,
      usedSize: 200 * 1024 * 1_024 * 1_024,
      nodeId: "c53bf525-96b2-47f9-940e-6a84001afb61",
      devFile: "/dev/sda1",
    },
  ];
  return storagePools;
});
