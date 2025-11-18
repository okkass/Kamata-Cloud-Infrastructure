import { UserResponse } from "~~/shared/types";
import { verifyToken, KCIJWTPayload } from "../../utils/jwt";
import { randomUUID } from "crypto";

export default defineEventHandler(async (event) => {
  const ret: UserResponse = {
    id: randomUUID(),
    name: "Sample User",
    email: "sample@example.com",
    createdAt: new Date().toISOString(),
    isAdmin: false,
    lastLoginAt: new Date().toISOString(),
    isImageAdmin: false,
    isInstanceTypeAdmin: false,
    isPhysicalNodeAdmin: false,
  };
  return ret;
});
