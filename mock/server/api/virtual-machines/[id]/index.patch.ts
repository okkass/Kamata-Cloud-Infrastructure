export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = getRouterParam(event, "id");

  return {
    id: id,
    ...body,
    status: "updated",
  };
});
