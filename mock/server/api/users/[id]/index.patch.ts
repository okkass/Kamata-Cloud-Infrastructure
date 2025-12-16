import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id || !validate(id)) {
    createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }
  const body = await readBody(event);
  console.log(`Updating user ${id} with data:`, body);
  return { message: `User ${id} updated`, user: body };
});
