export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID is required" });
  }
  const body = await readBody(event);

  console.log(
    `Bulk subnet operation for virtual network ID ${event.context.params?.id}:`,
    body
  );

  return { success: true, processed: body };
});
