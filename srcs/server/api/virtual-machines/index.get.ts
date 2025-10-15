import { VirtualMachineDTO } from "~~/shared/types";

export default defineEventHandler((event) => {
  const mock1: Array<VirtualMachineDTO> = [];
  const mock2: Array<VirtualMachineDTO> = [
    {
      id: "68eecf22-4eb2-4522-9b00-5940f150cd4e",
      name: "web-server",
      status: "running",
      createdAt: new Date().toISOString(),
      node: {
        id: "2cd60316-dbfe-4c94-bb24-6664efcc0645",
        name: "Node 1",
        ipAddress: "192.168.1.100",
        status: "active",
        isAdmin: true,
        createdAt: "2024-01-01T12:00:00Z",
      },
      securityGroups: [
        {
          id: "402e9dee-46de-4a44-b380-834edf24328a",
          name: "web-server-sg",
          rules: [
            {
              id: "e2aee93e-8ac6-4ffa-a132-4d13b934bedc",
              name: "Allow HTTP",
              ruleType: "inbound",
              port: 80,
              protocol: "tcp",
              targetIp: "0,0,0,0/0",
              createdAt: new Date().toISOString(),
            },
            {
              id: "88a34c4d-a9c0-4856-8a1f-36af011e2d7c",
              name: "Allow SSH",
              ruleType: "inbound",
              port: 22,
              protocol: "tcp",
              targetIp: "0,0,0,0/0",
              createdAt: new Date().toISOString(),
            },
            {
              id: "8b796a42-78c0-468e-9fbd-f7f237095ef9",
              name: "Allow All Outbound",
              ruleType: "outbound",
              port: null,
              protocol: "any",
              targetIp: "0,0,0,0/0",
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      attachedStorages: [
        {
          storage: {
            id: "299ee1b9-de55-4513-9aa0-62c82ce9fc17",
            name: "web-server-disk",
            size: 20 * 1024 * 1024 * 1024, // 20GB
            pool: "7e0485cf-be53-41be-a57b-d047437395ee",
          },
          path: "/dev/sda",
        },
      ],
      instanceType: {
        id: "f0e4ab04-e811-439b-9336-fa482e175b1b",
        name: "small",
        createdAt: "2025-10-10T12:00:00Z",
        cpuCore: 1,
        memorySize: 1 * 1024 * 1024 * 1024, // 1GB
      },
    },
  ];
  return mock2;
});
