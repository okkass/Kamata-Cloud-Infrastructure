import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getInstanceTypeService } from "@/service/InstanceTypeService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getInstanceTypeService(permission);

  return getResourceList(service.list);
});
