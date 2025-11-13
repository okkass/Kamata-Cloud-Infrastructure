export default defineEventHandler(() => {
  const storagePools: Array<StoragePoolDTO> = [
    {
      id: "424e0305-9d0e-4c37-bd6e-06da5bb7fc52",
      name: "Node1 Pool 1",
      nodeId: "5bb36d79-d20b-4e00-bc30-ae26e510b787",
      createdAt: new Date().toISOString(),
      totalSize: 500 * 1024 * 1024 * 1024, // 500 GB
      usedSize: 200 * 1024 * 1024 * 1024, // 200 GB
      hasNetworkAccess: true,
    },
    {
      id: "9513c756-cbe0-4c73-9f5f-0992c12a14c9",
      name: "Node2 Pool 1",
      nodeId: "4f3f6cf0-c9a4-4e8a-9577-cacae3b8a120",
      createdAt: new Date().toISOString(),
      totalSize: 1000 * 1024 * 1024 * 1024, // 1 TB
      usedSize: 450 * 1024 * 1024 * 1024, // 450 GB
      hasNetworkAccess: false,
    },
  ];

  return storagePools;
});
