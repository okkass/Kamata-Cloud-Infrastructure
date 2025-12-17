import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getImageService } from "@/service/ImageService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getImageService(permission);
  return getResourceList(service.list);
});
