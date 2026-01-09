import { authSchema } from "@/zodSchemas";
import { getAuthService } from "@/service/AuthService";

export default defineEventHandler(async (event) => {
  // bodyをパース
  const body = await readBody(event);
  const parseResult = authSchema.safeParse(body);
  if (!parseResult.success) {
    console.error("Invalid login request:", parseResult.error);
    throw createError({ statusCode: 400, statusMessage: "Bad Request" });
  }
  const req = parseResult.data;

  const authService = getAuthService();
  const result = await authService.login(req);
  if (!result.success) {
    if (result.error?.reason === "Unauthorized") {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    } else {
      console.error("Login failed:", result.error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      });
    }
  }
  return result.data;
});
