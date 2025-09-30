import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!validate(id)) {
    createError({
      statusCode: 400,
      statusMessage: "Invalid UUID format",
    });
  }

  // Mock data for demonstration purposes
  const nodes = [
    {
      id: "d898bae4-0a05-48aa-846e-aca5bbfd72c6",
      name: "Node 1",
      ipAddress: "10.45.45.45",
      status: "active",
      isAdmin: true,
      createdAt: new Date().toISOString(),
      cpuUtilization: 0.55, // 0 to 1
      memoryUtilization: 0.7, // 0 to 1
      storageUtilization: 0.6, // 0 to 1
    },
    {
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
  ];
  const node = nodes.find((n) => n.id === id);
  if (!node) {
    createError({
      statusCode: 404,
      statusMessage: "Physical node not found",
    });
  }
  return node;
});
