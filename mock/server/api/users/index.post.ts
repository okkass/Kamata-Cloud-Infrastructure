import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getUserService } from "@/service/UserService";
import { createUserSchema } from "@/zodSchemas";
import { UserCreateRequest } from "@app/shared/types";

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
