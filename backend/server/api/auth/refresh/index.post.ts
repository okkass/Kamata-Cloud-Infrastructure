import { refreshSchema } from "@/zodSchemas";
import { getAuthService } from "@/service/AuthService";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parseResult = refreshSchema.safeParse(body);

  if (!parseResult.success) {
    console.error("Invalid refresh request:", parseResult.error);
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  const req = parseResult.data;

  const authService = getAuthService();
  const result = await authService.refresh(req);

  if (!result.success) {
    if (result.error?.reason === "Unauthorized") {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    } else {
      console.error("Token refresh failed:", result.error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      });
    }
  }

  return result.data;
});
