// PutのMock

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const body = await readBody(event);
  console.log(`Received storage pool update request for ID ${id}:`, body);
  return {
    id: id,
    name: body.name,
    nodeId: body.nodeId,
    createdAt: new Date().toISOString(),
    totalSize: body.totalSize ?? 500 * 1024 * 1024 * 1024, // 500 GB
    usedSize: body.usedSize ?? 100 * 1024 * 1024 * 1024, // 100 GB
    hasNetworkAccess: body.hasNetworkAccess,
  };
});
