import { deleteResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getImageService } from "@@/server/service/ImageService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getImageService(permission);
  const { id } = event.context.params as { id: string };

  return deleteResource(id, service.delete);
});
