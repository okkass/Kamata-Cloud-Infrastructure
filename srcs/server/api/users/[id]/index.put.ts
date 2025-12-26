import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getUserService } from "@@/server/service/UserService";
import { UserPutRequest } from "@@/shared/types";
import { updateUserSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getUserService(permission);
  const { id } = event.context.params as { id: string };
  return updateResource(
    id,
    body as UserPutRequest,
    updateUserSchema,
    service.update
  );
});
