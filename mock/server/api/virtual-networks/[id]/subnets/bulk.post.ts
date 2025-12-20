export default defineEventHandler(async (event) => {
  // const id = getRouterParam(event, "id");
  const body = await readBody(event);

  console.log(
    `Bulk subnet operation for virtual network ID ${event.context.params?.id}:`,
    body
  );

  return { success: true, processed: body };
});
