import type { UserPermissions } from "@/types";
import { verifyToken } from "@/utils/jwt";
import { getUserService } from "@/service/UserService";

export default defineEventHandler(async (event) => {
  // /login、/refresh エンドポイントは認証不要
  const publicPaths = [
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/logout",
  ];
  if (publicPaths.includes(event.node.req.url || "")) {
    return;
  }

  // ヘッダからJWTを取得
  const authHeader = getHeader(event, "Authorization") || "";
  if (!authHeader) {
    setHeader(event, "www-authenticate", 'Bearer realm="example"');
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "");
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    setHeader(event, "www-authenticate", 'Bearer realm="example"');
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const userService = getUserService();
  const result = await userService.getById(payload.userId);
  if (!result.success) {
    setHeader(event, "www-authenticate", 'Bearer realm="example"');
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const permission: UserPermissions = {
    id: result.data.id,
    isAdmin: result.data.isAdmin,
    isImageAdmin: result.data.isImageAdmin,
    isInstanceTypeAdmin: result.data.isInstanceTypeAdmin,
    isVirtualMachineAdmin: result.data.isVirtualMachineAdmin,
    isNetworkAdmin: result.data.isNetworkAdmin,
    isSecurityGroupAdmin: result.data.isSecurityGroupAdmin,
    isNodeAdmin: result.data.isNodeAdmin,
  };
  event.context.user = permission;
});
