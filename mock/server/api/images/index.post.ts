import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getImageService } from "@/service/ImageService";
import { ImageCreateRequest } from "@app/shared/types";
import { createImageSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getImageService(permission);

  return createResource(
    body as ImageCreateRequest,
    createImageSchema,
    service.create
  );
});
