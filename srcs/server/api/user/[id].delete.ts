import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id || !validate(id)) {
    createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }
  console.log(`Deleting user with ID: ${id}`);
  return { message: `User ${id} deleted` };
});
