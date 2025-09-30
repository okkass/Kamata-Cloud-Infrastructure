export default defineEventHandler(() => {
  return [
    {
      id: "8874840c-fe85-4eb9-985f-a856eee1faa2",
      name: "vm-01",
      instanceType: {
        id: "2b03254f-5485-4286-8baa-77ebee3aea9b",
        name: "t2.standard",
        createdAt: new Date().toISOString(),
        cpuCores: 4,
        memorySize: 4 * 1024 * 1024 * 1024, // 4 GB
        storageSize: 64 * 1024 * 1024 * 1024, // 64 GB
      },
      status: "running",
      node: {
        id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
        name: "Node 2",
        ipAddress: "10.19.19.19",
        status: "active",
        isAdmin: false,
        createdAt: new Date().toISOString(),
        cpuUtilization: 0.55, // 0 to 1
        memoryUtilization: 0.7, // 0 to 1
        storageUtilization: 0.6, // 0 to 1
      },
      createdAt: new Date().toISOString(),
      securityGroups: [
        {
          id: "399f4fd6-8335-46f7-bd80-4e53eb0fbe9b",
          name: "default",
          description: "Default security group",
          rules: [
            {
              id: "11365b65-bea5-4d02-b7d0-1057fded5b81",
              name: "Allow HTTP",
              ruleType: "inbound",
              port: 80,
              protocol: "tcp",
              targetIP: "0.0.0.0/0",
              action: "allow",
              createdAt: new Date().toISOString(),
            },
            {
              id: "6ae22fa7-bc84-4b14-ac67-ff45fa1fd846",
              name: "Allow all",
              ruleType: "outbound",
              protocol: "any",
              targetIP: "0.0.0.0/0",
              action: "allow",
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      attachedStorages: [],
      attachedNics: [],
      cpuUtilization: 0.3, // 0 to 1
      memoryUtilization: 0.4, // 0 to 1
      storageUtilization: 0.2, // 0 to 1
    },
    {
      id: "671d6880-b0f5-4fcb-827d-aae17536888c",
      name: "vm-02",
      instanceType: {
        id: "2b03254f-5485-4286-8baa-77ebee3aea9b",
        name: "t2.standard",
        createdAt: new Date().toISOString(),
        cpuCores: 4,
        memorySize: 4 * 1024 * 1024 * 1024, // 4 GB
        storageSize: 64 * 1024 * 1024 * 1024, // 64 GB
      },
      status: "running",
      node: {
        id: "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39",
        name: "Node 2",
        ipAddress: "10.19.19.19",
        status: "active",
        isAdmin: false,
        createdAt: new Date().toISOString(),
        cpuUtilization: 0.55, // 0 to 1
        memoryUtilization: 0.7, // 0 to 1
        storageUtilization: 0.6, // 0 to 1
      },
      createdAt: new Date().toISOString(),
      securityGroups: [
        {
          id: "399f4fd6-8335-46f7-bd80-4e53eb0fbe9b",
          name: "default",
          description: "Default security group",
          rules: [
            {
              id: "11365b65-bea5-4d02-b7d0-1057fded5b81",
              name: "Allow HTTP",
              ruleType: "inbound",
              port: 80,
              protocol: "tcp",
              targetIP: "0.0.0.0/0",
              action: "allow",
              createdAt: new Date().toISOString(),
            },
            {
              id: "6ae22fa7-bc84-4b14-ac67-ff45fa1fd846",
              name: "Allow all",
              ruleType: "outbound",
              protocol: "any",
              targetIP: "0.0.0.0/0",
              action: "allow",
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      attachedStorages: [],
      attachedNics: [],
      cpuUtilization: 0.3, // 0 to 1
      memoryUtilization: 0.4, // 0 to 1
      storageUtilization: 0.2, // 0 to 1
    },
  ];
});
