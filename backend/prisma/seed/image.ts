import { getPrismaClient } from "./seed.js";

export const createInitialImages = async () => {
  const prisma = getPrismaClient();

  const pools = await prisma.storagePool.findMany();

  if (pools.length === 0) {
    console.error(
      "No storage pools found to create images. Please seed storage pools first.",
    );
    return;
  }

  const images = [
    {
      name: "Test Image 1",
      description: "This is a test image 1",
      sizeMb: 2048, // 2 GB
      ownPoolId: pools[0].id,
    },
    {
      name: "Test Image 2",
      description: "This is a test image 2",
      sizeMb: 4096, // 4 GB
      ownPoolId: pools[0].id,
    },
  ];

  try {
    await prisma.image.createMany({
      data: images,
    });
    console.log("Initial images created successfully.");
  } catch (error) {
    console.error("Error creating initial images:", error);
  }
};

export const deleteAllImages = async () => {
  const prisma = getPrismaClient();
  try {
    await prisma.image.deleteMany({});
    console.log("All images deleted successfully.");
  } catch (error) {
    console.error("Error deleting images:", error);
  }
};
