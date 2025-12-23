import { deleteSecurityGroup } from "@/services/securityGroupService";
import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id || !validate(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  }
  const success = deleteSecurityGroup(id);
  if (!success) {
    throw createError({
      statusCode: 404,
      statusMessage: "Security group not found",
    });
  }
  return { message: `Security group with ID ${id} deleted successfully` };
});
