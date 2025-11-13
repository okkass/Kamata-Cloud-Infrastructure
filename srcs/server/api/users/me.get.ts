import { UserDTO } from "~~/shared/types";
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

  const user1: UserDTO = {
    id: "ff09658a-6b02-4c99-bb05-cf8487411d1f",
    name: "Bob",
    email: "sample@example.com",
    createdAt: new Date().toISOString(),
    isAdmin: false,
    lastLoginAt: new Date().toISOString(),
    maxCpuCore: 32,
    maxMemorySize: 32 * 1024 * 1024 * 1024, // 32GB
    maxStorageSize: 512 * 1024 * 1024 * 1024, // 512GB
  };
  return user1;
});
