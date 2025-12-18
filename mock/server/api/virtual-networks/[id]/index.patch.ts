export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  // 実際の更新ロジックはモックなので省略し、成功レスポンスを返す
  // 必要であれば、ここでバリデーションやログ出力を行う
  console.log(`[Mock] PATCH /api/virtual-networks/${id}`, body);

  return {
    id: id,
    ...body,
    updatedAt: new Date().toISOString(),
  };
});
