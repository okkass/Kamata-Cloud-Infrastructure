export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  console.log(`[Mock] PATCH /api/instance-types/${id}`, body);

  // 受け取ったIDとボディをマージして返す(成功シミュレーション)
  return { id, ...body };
});
