import { PrismaClient } from "@@/generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { createInitialUsers, deleteAllUsers } from "./user.js";
import { createInitialNodes, deleteAllNodes } from "./node.js";
import {
  createInitialStoragePools,
  deleteAllStoragePools,
} from "./storagePool.js";
import {
  createInitialInstanceTypes,
  deleteAllInstanceTypes,
} from "./instanceType.js";
import { createInitialImages, deleteAllImages } from "./image.js";
import { createInitialSGs, deleteAllSGs } from "./securityGroup.js";

let prisma: PrismaClient | null = null;

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
};

export const disconnectPrismaClient = async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};

async function main() {
  getPrismaClient();

  if (!prisma) {
    throw new Error("Prisma client is not initialized.");
  }

  console.log("Seeding test data...");
  await deleteAllUsers();
  await createInitialUsers();
  const users = await prisma.user.findMany();
  console.log(`Created ${users.length} users:`);

  users.forEach((user) => {
    console.log(`- ${user.email}`);
  });

  // Seed Nodes
  await deleteAllNodes();
  await createInitialNodes();
  const allNodes = await prisma.node.findMany();
  console.log(`Created ${allNodes.length} nodes:`);

  allNodes.forEach((node) => {
    console.log(`- ${node.name} (${node.ipAddress})`);
  });

  // Seed Storage Pools
  await deleteAllStoragePools();
  await createInitialStoragePools();

  const allStoragePools = await prisma.storagePool.findMany();
  console.log(`Created ${allStoragePools.length} storage pools:`);

  allStoragePools.forEach((pool) => {
    console.log(
      `- ${pool.name} (Total Size: ${pool.totalSizeMb}MB, Available Size: ${pool.availableSizeMb}MB)`,
    );
  });

  // Seed Instance Types
  await deleteAllInstanceTypes();
  await createInitialInstanceTypes();

  const allInstanceTypes = await prisma.instanceType.findMany();
  console.log(`Created ${allInstanceTypes.length} instance types:`);

  allInstanceTypes.forEach((type) => {
    console.log(
      `- ${type.name} (CPU: ${type.cpuCore}, Memory: ${type.memorySizeMb}MB)`,
    );
  });

  // Seed Images
  await deleteAllImages();
  await createInitialImages();
  const allImages = await prisma.image.findMany();
  console.log(`Created ${allImages.length} images:`);

  allImages.forEach((image) => {
    console.log(`- ${image.name} (Size: ${image.sizeMb}MB)`);
  });

  // Seed Security Groups
  await deleteAllSGs();
  await createInitialSGs(users);
  const allSGs = await prisma.securityGroup.findMany();
  console.log(`Created ${allSGs.length} security groups:`);

  allSGs.forEach((sg) => {
    console.log(`- ${sg.name} (Description: ${sg.description})`);
  });

  console.log("Seeding test data finished.");
}

// スクリプトの実行とエラーハンドリング
main()
  .catch(async (e) => {
    console.error(e);
    await disconnectPrismaClient();
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrismaClient();
  });
