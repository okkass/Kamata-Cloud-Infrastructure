export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  console.log(`[Mock] POST /api/virtual-networks/${id}/subnets/bulk`, body);

  // Bulk更新の結果をシミュレート
  // create, remove, patch の各操作が成功したと仮定

  return {
    success: true,
    message: "Bulk update successful",
    details: {
      created: body.create?.length || 0,
      removed: body.remove?.length || 0,
      updated: body.patch?.length || 0,
    },
  };
});
