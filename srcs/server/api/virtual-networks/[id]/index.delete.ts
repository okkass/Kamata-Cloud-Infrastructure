import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id || !validate(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  }
  console.log(`Received delete for ID ${id}`);
  return { message: `ID ${id} deleted successfully` };
});
