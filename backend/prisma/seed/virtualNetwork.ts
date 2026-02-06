import { getPrismaClient } from "./seed.js";
import { Prisma } from "@@/generated/client";

export const createInitialVNs = async (users: Prisma.UserGetPayload<{}>[]) => {
  const prisma = getPrismaClient();

  const virtualNetworks = [
    {
      name: "NW 1",
      cidr: "10.0.0.0/16",
      subnets: [
        {
          name: "Subnet 1",
          cidr: "10.0.1.0/24",
        },
        {
          name: "Subnet 2",
          cidr: "10.0.2.0/24",
        },
      ],
    },
    {
      name: "NW 2",
      cidr: "10.1.0.0/16",
      subnets: [
        {
          name: "Subnet 1",
          cidr: "10.1.1.0/24",
        },
        {
          name: "Subnet 2",
          cidr: "10.1.2.0/24",
        },
      ],
    },
  ];
  try {
    const createVNPromises: Array<Promise<any>> = [];
    users.forEach((user) => {
      virtualNetworks.forEach((vn) => {
        createVNPromises.push(
          prisma.virtualNetwork.create({
            data: {
              name: vn.name,
              cidr: vn.cidr,
              user: {
                connect: { id: user.id },
              },
              subnets: {
                create: vn.subnets.map((subnet) => ({
                  name: subnet.name,
                  cidr: subnet.cidr,
                })),
              },
            },
          }),
        );
      });
    });
    await Promise.all(createVNPromises);
    console.log("Initial virtual networks created successfully.");
  } catch (error) {
    console.error("Error creating virtual networks:", error);
  }
};

export const deleteAllVNs = async () => {
  const prisma = getPrismaClient();
  try {
    await prisma.virtualNetwork.deleteMany({});
  } catch (error) {
    console.error("Error deleting virtual networks:", error);
  }
};
