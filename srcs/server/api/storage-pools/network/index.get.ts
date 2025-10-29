export default defineEventHandler(() => {
  const storagePools: Array<NetworkStoragePoolDTO> = [
    {
      id: "532ca711-42e0-449c-bd1c-51af16f333b6",
      name: "node1-SSD",
      createdAt: new Date().toISOString(),
      totalSize: 512 * 1024 * 1_024 * 1_024,
      usedSize: 200 * 1024 * 1_024 * 1_024,
      localStoragePoolId: "2087cdd8-a104-4e4d-aaf8-3d38065cfa8f",
    },
    {
      id: "93061a02-e35d-4055-8bcd-a0002440fb89",
      name: "node1-nfs",
      createdAt: new Date().toISOString(),
      totalSize: 512 * 1024 * 1_024 * 1_024,
      usedSize: 200 * 1024 * 1_024 * 1_024,
      localStoragePoolId: "2087cdd8-a104-4e4d-aaf8-3d38065cfa8f",
    },
  ];
  return storagePools;
});
