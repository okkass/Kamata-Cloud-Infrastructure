import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id || !validate(id)) {
    createError({ statusCode: 400, statusMessage: "Invalid ID" });
  }
  const body = await readBody(event);
  console.log(`Received delete for image ID ${id}:`, body);
  return { message: `Image with ID ${id} deleted successfully`, data: body };
});
