import { getPrismaClient } from "./seed.js";

export const createInitialMiddleware = async () => {
  const prisma = getPrismaClient();
  const middlewares = [
    {
      name: "Apache",
    },
    {
      name: "Nginx",
    },
    {
      name: "Lighttpd",
    },
  ];
  try {
    const res = await prisma.middleware.createMany({
      data: middlewares,
    });
  } catch (error) {
    console.error("Error creating middleware:", error);
  }
};

export const deleteAllMiddleware = async () => {
  const prisma = getPrismaClient();
  try {
    await prisma.middleware.deleteMany({});
  } catch (error) {
    console.error("Error deleting middleware:", error);
  }
};
