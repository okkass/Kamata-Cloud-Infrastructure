// patchのMock

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const body = await readBody(event);
  console.log(`Received storage pool patch request for ID ${id}:`, body);
  return {
    id: id,
    name: body.name ?? "Patched Storage Pool",
    nodeId: body.nodeId ?? "5bb36d79-d20b-4e00-bc30-ae26e510b787",
    createdAt: new Date().toISOString(),
    totalSize: body.totalSize ?? 500 * 1024 * 1024 * 1024, // 500 GB
    usedSize: body.usedSize ?? 150 * 1024 * 1024 * 1024, // 150 GB
    hasNetworkAccess: body.hasNetworkAccess ?? true,
  };
});