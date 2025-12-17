export default defineEventHandler(async (event) => {
  // const id = getRouterParam(event, "id");
  const body = await readBody(event);

  // body は { create: [], delete: [], patch: [] } の形
  // 正常終了を返す
  return { success: true, processed: body };
});
