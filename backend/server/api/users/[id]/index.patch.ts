import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getUserService } from "@/service/UserService";
import { UserPatchRequest } from "@app/shared/types";
import { partialUpdateUserSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getUserService(permission);
  const { id } = event.context.params as { id: string };
  return updateResource(
    id,
    body as UserPatchRequest,
    partialUpdateUserSchema,
    service.update
  );
});
