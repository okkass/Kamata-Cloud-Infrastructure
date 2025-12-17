// ストレージプール作成のMockAPI

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Received storage pool creation request:", body);
  return {
    id: "gred4h76-1234-4c37-bd6e-06da5bb7fc52",
    name: body.name,
    nodeId: body.nodeId,
    createdAt: new Date().toISOString(),
    totalSize: 1000 * 1024 * 1024 * 1024, // 1 TB
    usedSize: 0,
    hasNetworkAccess: body.hasNetworkAccess,
  };
});
