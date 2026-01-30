import { getPrismaClient } from "./seed.js";

export const createInitialNodes = async () => {
  const prisma = getPrismaClient();

  const nodes = [
    {
      name: "Node 1",
      ipAddress: "10.0.0.1",
      isAdmin: true,
    },
    {
      name: "Node 2",
      ipAddress: "10.0.0.2",
      isAdmin: false,
    },
    {
      name: "Node 3",
      ipAddress: "10.0.0.3",
      isAdmin: false,
    },
  ];
  try {
    const createNodePromises = nodes.map((node) => {
      return prisma.node.create({
        data: {
          name: node.name,
          ipAddress: node.ipAddress,
          isAdmin: node.isAdmin,
        },
      });
    });
    await Promise.all(createNodePromises);
  } catch (error) {
    console.error("Error creating nodes:", error);
  }
};

export const deleteAllNodes = async () => {
  const prisma = getPrismaClient();
  try {
    await prisma.node.deleteMany({});
  } catch (error) {
    console.error("Error deleting nodes:", error);
  }
};
