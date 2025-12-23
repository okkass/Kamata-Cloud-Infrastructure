export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = getRouterParam(event, "id");

  console.log(
    `[Mock] VM Patch Success (${id}):`,
    JSON.stringify(body, null, 2)
  );

  return {
    id: id,
    ...body,
    status: "updated",
  };
});
