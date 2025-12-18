import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getSecurityGroupService(permission);

  return getResourceList(service.list);
});
