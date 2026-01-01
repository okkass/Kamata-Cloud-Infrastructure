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

  const users = await prisma.user.findMany();
  console.log(`Created ${users.length} users:`);

  users.forEach((user) => {
    console.log(`- ${user.email}`);
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
