export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = getRouterParam(event, "id");

  console.log(`[Mock] VM Patch (${id}):`, body);

  return {
    id: id,
    ...body,
    status: "updated",
  };
});
