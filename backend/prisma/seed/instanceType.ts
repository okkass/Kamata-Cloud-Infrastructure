import { getPrismaClient } from "./seed.js";

export const createInitialInstanceTypes = async () => {
  const prisma = getPrismaClient();

  const instanceTypes = [
    {
      name: "Tiny",
      cpuCore: 1,
      memorySizeMb: 1024,
    },
    {
      name: "Small",
      cpuCore: 2,
      memorySizeMb: 2048,
    },
    {
      name: "Medium",
      cpuCore: 4,
      memorySizeMb: 4096,
    },
  ];

  try {
    const createInstanceTypePromises = instanceTypes.map((type) => {
      return prisma.instanceType.create({
        data: {
          name: type.name,
          cpuCore: type.cpuCore,
          memorySizeMb: type.memorySizeMb,
        },
      });
    });
    await Promise.all(createInstanceTypePromises);
  } catch (error) {
    console.error("Error creating instance types:", error);
  }
};

export const deleteAllInstanceTypes = async () => {
  const prisma = getPrismaClient();
  try {
    await prisma.instanceType.deleteMany({});
  } catch (error) {
    console.error("Error deleting instance types:", error);
  }
};
