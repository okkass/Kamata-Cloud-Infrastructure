import { getPrismaClient } from "./seed";
import { Prisma } from "@@/generated/client";

export const createInitialSGs = async (users: Prisma.UserGetPayload<{}>[]) => {
  const prisma = getPrismaClient();

  const securityGroups = [
    {
      name: "Default SG",
      description: "Default security group",
      rules: [
        {
          name: "Allow ALL Outbound",
          roleType: "outbound" as const,
          port: 65536, // all ports
          protocol: "any" as const,
          targetIp: "0.0.0.0/0",
          action: "allow" as const,
        },
      ],
    },
    {
      name: "Web-SG",
      description: "Security group for web servers",
      rules: [
        {
          name: "Allow HTTP Inbound",
          roleType: "inbound" as const,
          port: 80,
          protocol: "tcp" as const,
          targetIp: "0.0.0.0/0",
          action: "allow" as const,
        },
        {
          name: "Allow HTTPS Inbound",
          roleType: "inbound" as const,
          port: 443,
          protocol: "tcp" as const,
          targetIp: "0.0.0.0/0",
          action: "allow" as const,
        },
      ],
    },
  ];

  try {
    const createSGPromisses: Array<Promise<any>> = [];
    users.forEach((user) => {
      securityGroups.forEach((sg) => {
        createSGPromisses.push(
          prisma.securityGroup.create({
            data: {
              name: sg.name,
              description: sg.description,
              user: {
                connect: { id: user.id },
              },
              rules: {
                create: sg.rules.map((rule) => ({
                  name: rule.name,
                  roleType: rule.roleType,
                  port: rule.port,
                  protocol: rule.protocol,
                  targetIp: rule.targetIp,
                  action: rule.action,
                })),
              },
            },
          }),
        );
      });
    });
    await Promise.all(createSGPromisses);
  } catch (error) {
    console.error("Error creating security groups:", error);
  }
};

export const deleteAllSGs = async () => {
  const prisma = getPrismaClient();
  try {
    await prisma.securityGroup.deleteMany({});
  } catch (error) {
    console.error("Error deleting security groups:", error);
  }
};
