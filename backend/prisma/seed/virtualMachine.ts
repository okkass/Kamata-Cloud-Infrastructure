import { getPrismaClient } from "./seed.js";
import { Prisma } from "@@/generated/client";

export const createInitialVMs = async (users: Prisma.UserGetPayload<{}>[]) => {
  const prisma = getPrismaClient();

  try {
    const nodes = await prisma.node.findMany();
    const images = await prisma.image.findMany();

    const subnets = await prisma.subnet.findMany();
    const storagePools = await prisma.storagePool.findMany();
    const securityGroups = await prisma.securityGroup.findMany();

    const vms = [
      {
        name: "VM 1",
        cpu: 2,
        memoryMb: 4 * 1024, // 4 GB
      },
      {
        name: "VM 2",
        cpu: 4,
        memoryMb: 8 * 1024, // 8 GB
      },
      {
        name: "VM 3",
        cpu: 8,
        memoryMb: 16 * 1024, // 16 GB
      },
    ];

    for (const user of users) {
      for (const vm of vms) {
        const storage = await prisma.virtualStorage.create({
          data: {
            name: `${vm.name} OS Disk`,
            sizeMb: 20 * 1024, // 20 GB
            storagePoolId: storagePools[0].id,
          },
        });
        await prisma.virtualMachine.create({
          data: {
            name: vm.name,
            cpu: vm.cpu,
            memoryMb: vm.memoryMb,
            userId: user.id,
            nodeId: nodes[0].id,
            imageId: images[0].id,
            networkInterfaces: {
              create: {
                name: `${vm.name} NIC`,
                subnetId: subnets[0].id,
                ipAddress: "10.0.0.10",
                macAddress: "02:42:ac:11:00:02",
              },
            },
            attachedStorages: {
              create: {
                virtualStorageId: storage.id,
                path: "/dev/sda",
              },
            },
            securityGroups: {
              create: {
                securityGroupId: securityGroups[0].id,
              },
            },
          },
        });
      }
    }
  } catch (error) {
    console.error("Error creating initial VMs:", error);
  }
};

export const deleteAllVMs = async () => {
  const prisma = getPrismaClient();
  try {
    await prisma.virtualMachine.deleteMany({});
  } catch (error) {
    console.error("Error deleting all VMs:", error);
  }
};
