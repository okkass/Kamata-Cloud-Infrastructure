import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getUserService } from "@@/server/service/UserService";
import { createUserSchema } from "@@/server/zodSchemas";
import { UserCreateRequest } from "@@/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getUserService(permission);

  setResponseStatus(event, 201);
  return createResource(
    body as UserCreateRequest,
    createUserSchema,
    service.create
  );
});
