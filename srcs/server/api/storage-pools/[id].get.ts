import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  if (!validate(id)) {
    createError({ statusCode: 400, message: "Invalid UUID format" });
  }
  let mock: Array<StoragePoolDTO> = [
    {
      id: "532ca711-42e0-449c-bd1c-51af16f333b6",
      name: "node1-SSD",
      type: "local",
      createdAt: new Date().toISOString(),
      totalSize: 512 * 1024 * 1_024 * 1_024,
      usedSize: 200 * 1024 * 1_024 * 1_024,
    },
    {
      id: "93061a02-e35d-4055-8bcd-a0002440fb89",
      name: "node1-nfs",
      type: "network",
      createdAt: new Date().toISOString(),
      totalSize: 512 * 1024 * 1_024 * 1_024,
      usedSize: 200 * 1024 * 1_024 * 1_024,
    },
  ];
  const pool = mock.find((p) => p.id === id);
  if (!pool) {
    createError({ statusCode: 404, message: "Storage pool not found" });
  }
  return pool;
});
