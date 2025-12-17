import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id || !validate(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  }
  const body = await readBody(event);
  console.log(`Received PATCH for VM ID ${id}:`, body);

  return {
    id,
    ...body,
    updatedAt: new Date().toISOString(),
  };
});
