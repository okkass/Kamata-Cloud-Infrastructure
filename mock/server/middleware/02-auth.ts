import type { UserPermissions } from "@/types";

export default defineEventHandler((event) => {
  // /api/authは認証不要
  if (getRequestURL(event).pathname.startsWith("/api/auth")) {
    return;
  }

  // Authorizationヘッダで簡易的に認証
  const authHeader = getHeader(event, "authorization");
  if (!authHeader) {
    setHeader(event, "www-authenticate", 'Bearer realm="example"');
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "");
  if (token !== "mock-token") {
    setHeader(event, "www-authenticate", 'Bearer error="invalid_token"');
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const permission: UserPermissions = {
    id: "8f8ec727-09dc-43ba-ae67-92fe9019a523",
    isAdmin: true,
    isImageAdmin: true,
    isInstanceTypeAdmin: true,
    isNetworkAdmin: true,
    isNodeAdmin: true,
    isSecurityGroupAdmin: true,
    isVirtualMachineAdmin: true,
  };

  event.context.user = permission;
});
