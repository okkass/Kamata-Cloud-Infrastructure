import { StoragePoolResponse } from "~~/shared/types";

export default defineEventHandler(() => {
  const storagePools: Array<StoragePoolResponse> = [
    {
      id: "424e0305-9d0e-4c37-bd6e-06da5bb7fc52",
      name: "Node1 Pool 1",
      node: {
        id: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
        name: "Node1",
      },
      createdAt: new Date().toISOString(),
      totalSize: 500 * 1024 * 1024 * 1024, // 500 GB
      usedSize: 200 * 1024 * 1024 * 1024, // 200 GB
      hasNetworkAccess: true,
    },
    {
      id: "9513c756-cbe0-4c73-9f5f-0992c12a14c9",
      name: "Node2 Pool 1",
      node: {
        id: "d1f5e8c3-3b6a-4f4a-8f4e-2c3e4b5a6d7e",
        name: "Node2",
      },
      createdAt: new Date().toISOString(),
      totalSize: 1000 * 1024 * 1024 * 1024, // 1 TB
      usedSize: 450 * 1024 * 1024 * 1024, // 450 GB
      hasNetworkAccess: false,
    },
  ];

  return storagePools;
});
