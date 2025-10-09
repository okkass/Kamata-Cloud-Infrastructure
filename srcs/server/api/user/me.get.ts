import { verifyToken, KCIJWTPayload } from "../../utils/jwt";
import { randomUUID } from "crypto";

export default defineEventHandler(async (event) => {
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
