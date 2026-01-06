import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getImageService } from "@@/server/service/ImageService";
import { ImagePutRequest } from "@@/shared/types";
import { updateImageSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getImageService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as ImagePutRequest,
    updateImageSchema,
    service.update
  );
});
