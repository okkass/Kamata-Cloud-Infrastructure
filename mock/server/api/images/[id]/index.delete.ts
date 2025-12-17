import { deleteResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getImageService } from "@/service/ImageService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getImageService(permission);
  const { id } = event.context.params as { id: string };

  return deleteResource(id, service.delete);
});
