export default defineEventHandler((event) => {
  return [
    {
      id: "f0e4ab04-e811-439b-9336-fa482e175b1b",
      name: "small",
      createdAt: "2025-10-10T12:00:00Z",
      cpuCore: 1,
      memorySize: 1 * 1024 * 1024 * 1024, // 1GB
    },
    {
      id: "7b6fb312-8c89-44d2-a417-4665a4a9be83",
      name: "t2.micro",
      createdAt: new Date().toISOString(),
      cpuCores: 1,
      memorySize: 1 * 1024 * 1024 * 1024, // 1 GB
      storageSize: 64 * 1024 * 1024 * 1024, // 64 GB
    },
    {
      id: "2b03254f-5485-4286-8baa-77ebee3aea9b",
      name: "t2.standard",
      createdAt: new Date().toISOString(),
      cpuCores: 4,
      memorySize: 4 * 1024 * 1024 * 1024, // 4 GB
      storageSize: 64 * 1024 * 1024 * 1024, // 64 GB
    },
  ];
});
