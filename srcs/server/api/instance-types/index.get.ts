import { getResourceList } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getInstanceTypeService } from "@@/server/service/InstanceTypeService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getInstanceTypeService(permission);

  return getResourceList(service.list);
});
