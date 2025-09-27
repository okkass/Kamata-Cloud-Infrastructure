import { verifyToken, KCIJWTPayload } from "../../utils/jwt";
import { randomUUID } from "crypto";

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, "access_token");
  if (!accessToken) {
    event.res.statusCode = 401;
    return { message: "Unauthorized" };
  }

  const payload = await verifyToken(accessToken);
  if (!payload) {
    event.res.statusCode = 401;
    return { message: "Invalid or expired token" };
  }

  const user1 = {
    id: randomUUID(),
    name: "Alice",
    email: "sample@example.com",
    createdAt: new Date().toISOString(),
    isAdmin: false,
    lastLoginAt: new Date().toISOString(),
  };
  return user1;
});
