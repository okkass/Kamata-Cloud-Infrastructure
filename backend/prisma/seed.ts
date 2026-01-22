import { PrismaClient } from "@@/generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as argon2 from "argon2";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding test data started...");
  const hash = await argon2.hash("my-strong-password");

  const permissions = [
    {
      name: "all-admin",
      email: "all.admin@example.test",
      isAdmin: true,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isVirtualMachineAdmin: false,
      isNetworkAdmin: false,
      isSecurityGroupAdmin: false,
      isNodeAdmin: false,
    },
    {
      name: "image-admin",
      email: "image.admin@example.test",
      isAdmin: false,
      isImageAdmin: true,
      isInstanceTypeAdmin: false,
      isVirtualMachineAdmin: false,
      isNetworkAdmin: false,
      isSecurityGroupAdmin: false,
      isNodeAdmin: false,
    },
    {
      name: "instance-type-admin",
      email: "instance.type.admin@example.test",
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: true,
      isVirtualMachineAdmin: false,
      isNetworkAdmin: false,
      isSecurityGroupAdmin: false,
      isNodeAdmin: false,
    },
    {
      name: "virtual-machine-admin",
      email: "virtual.machine.admin@example.test",
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isVirtualMachineAdmin: true,
      isNetworkAdmin: false,
      isSecurityGroupAdmin: false,
      isNodeAdmin: false,
    },
    {
      name: "network-admin",
      email: "network.admin@example.test",
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isVirtualMachineAdmin: false,
      isNetworkAdmin: true,
      isSecurityGroupAdmin: false,
      isNodeAdmin: false,
    },
    {
      name: "security-group-admin",
      email: "security.group.admin@example.test",
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isVirtualMachineAdmin: false,
      isNetworkAdmin: false,
      isSecurityGroupAdmin: true,
      isNodeAdmin: false,
    },
    {
      name: "node-admin",
      email: "node.admin@example.test",
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isVirtualMachineAdmin: false,
      isNetworkAdmin: false,
      isSecurityGroupAdmin: false,
      isNodeAdmin: true,
    },
    {
      name: "normal user",
      email: "normal.user@example.test",
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isVirtualMachineAdmin: false,
      isNetworkAdmin: false,
      isSecurityGroupAdmin: false,
      isNodeAdmin: false,
    },
  ];
  try {
    const createUserPromises = permissions.map((perm) => {
      return prisma.user.create({
        data: {
          name: perm.name,
          email: perm.email,
          cpuLimitCores: 0,
          memoryLimitMb: 0,
          storageLimitGb: 0,
          credentials: {
            create: {
              hashedPassword: hash,
            },
          },
          permission: {
            create: {
              isAdmin: perm.isAdmin,
              isImageAdmin: perm.isImageAdmin,
              isInstanceTypeAdmin: perm.isInstanceTypeAdmin,
              isVirtualMachineAdmin: perm.isVirtualMachineAdmin,
              isNetworkAdmin: perm.isNetworkAdmin,
              isSecurityGroupAdmin: perm.isSecurityGroupAdmin,
              isNodeAdmin: perm.isNodeAdmin,
            },
          },
        },
        include: {
          credentials: true,
          permission: true,
        },
      });
    });
    await Promise.all(createUserPromises);
  } catch (error) {
    console.error("Error creating users:", error);
  }

  const users = await prisma.user.findMany();
  console.log(`Created ${users.length} users:`);

  users.forEach((user) => {
    console.log(`- ${user.email}`);
  });

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

  const allNodes = await prisma.node.findMany();
  console.log(`Created ${allNodes.length} nodes:`);

  allNodes.forEach((node) => {
    console.log(`- ${node.name} (${node.ipAddress})`);
  });

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

  const allInstanceTypes = await prisma.instanceType.findMany();
  console.log(`Created ${allInstanceTypes.length} instance types:`);

  allInstanceTypes.forEach((type) => {
    console.log(
      `- ${type.name} (CPU: ${type.cpuCore}, Memory: ${type.memorySizeMb}MB)`,
    );
  });

  console.log("Seeding test data finished.");
}

// スクリプトの実行とエラーハンドリング
main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
