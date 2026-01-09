import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getUserService } from "@/service/UserService";
import { UserPutRequest } from "@app/shared/types";
import { updateUserSchema } from "@/zodSchemas";

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
