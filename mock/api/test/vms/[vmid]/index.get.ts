const testData: any = {
  id: "vm-12345",
  name: "Test VM",
  cpuCore: 4,
  memorySize: 8192,
  attachedNics: [
    { id: "nic-1", name: "NIC 1", ipAddress: "192.168.1.10" },
    { id: "nic-2", name: "NIC 2", ipAddress: "192.168.1.11" },
  ],
  attachedStorages: [
    { id: "storage-1", name: "Storage 1", size: 100 },
    { id: "storage-2", name: "Storage 2", size: 200 },
  ],
};

export default defineEventHandler(() => {
  return testData;
});
