import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id || !validate(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  }

  const body = await readBody(event);

  // TODO: Implement actual DB operations using Prisma for partial update
  console.log(`Received PATCH update for Instance Type ${id}:`, body);

  return { message: `Instance Type ${id} updated successfully`, data: body };
});
