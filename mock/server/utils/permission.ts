import type { H3Event } from "h3";
import type { UserPermissions } from "@/types";

export const getPermissionFromEvent = (event: H3Event): UserPermissions => {
  const permission = event.context.user;
  if (!permission) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }
  return permission as UserPermissions;
};
