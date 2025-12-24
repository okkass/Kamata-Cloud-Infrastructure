import type { UserPermissions } from "@@/server/types";

export default defineEventHandler((event) => {
  const pathName = getRequestURL(event).pathname;
  console.log(`Auth Middleware: ${pathName}`);
  // /api/_nuxt_iconは認証不要
  if (pathName.startsWith("/api/_nuxt_icon")) {
    return;
  }
  // pathが/apiなら
  if (pathName.startsWith("/api")) {
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
  }
});
