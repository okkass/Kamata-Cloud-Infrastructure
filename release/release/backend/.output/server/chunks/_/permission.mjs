import { c as createError } from '../nitro/nitro.mjs';

const getPermissionFromEvent = (event) => {
  const permission = event.context.user;
  if (!permission) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  return permission;
};

export { getPermissionFromEvent as g };
//# sourceMappingURL=permission.mjs.map
