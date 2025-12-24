import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getImageService } from "@/service/ImageService";
import { ImagePutRequest } from "@app/shared/types";
import { updateImageSchema } from "@/zodSchemas";

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
