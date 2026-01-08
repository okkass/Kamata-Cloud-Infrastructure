import { refreshSchema } from "@/zodSchemas";
import { getAuthService } from "@/service/AuthService";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parseResult = refreshSchema.safeParse(body);

  if (!parseResult.success) {
    console.error("Invalid logout request body:", parseResult.error);
    return {
      status: 400,
      error: "Invalid request body",
    };
  }
  const { refreshToken } = parseResult.data;

  const authService = getAuthService();
  const result = await authService.logout(refreshToken);

  if (!result.success) {
    console.error("Logout failed:", result.error);
    return {
      status: 500,
      error: "Logout failed",
    };
  }

  setResponseStatus(event, 204);
  return;
});
