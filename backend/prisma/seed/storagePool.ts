import { getPrismaClient } from "./seed";

export const createInitialStoragePools = async () => {
  const prisma = getPrismaClient();

  const nodes = await prisma.node.findMany();
  if (nodes.length < 2) {
    console.error(
      "Not enough nodes to create storage pools. Please seed nodes first.",
    );
    return;
  }

  const storagePools = [
    {
      name: "Storage Pool 1",
      hasNetworkAccess: true,
      totalSizeMb: 500 * 1024, // 500 GB
      availableSizeMb: 500 * 1024,
      nodeId: nodes[0].id,
    },
    {
      name: "Storage Pool 2",
      hasNetworkAccess: false,
      totalSizeMb: 1000 * 1024, // 1 TB
      availableSizeMb: 1000 * 1024,
      nodeId: nodes[1].id,
    },
  ];
  try {
    const createStoragePoolPromises = storagePools.map((pool) => {
      return prisma.storagePool.create({
        data: {
          name: pool.name,
          hasNetworkAccess: pool.hasNetworkAccess,
          totalSizeMb: pool.totalSizeMb,
          availableSizeMb: pool.availableSizeMb,
          node: {
            connect: { id: pool.nodeId },
          },
        },
      });
    });
    await Promise.all(createStoragePoolPromises);
  } catch (error) {
    console.error("Error creating storage pools:", error);
  }
};

export const deleteAllStoragePools = async () => {
  const prisma = getPrismaClient();
  try {
    await prisma.storagePool.deleteMany({});
  } catch (error) {
    console.error("Error deleting storage pools:", error);
  }
};
