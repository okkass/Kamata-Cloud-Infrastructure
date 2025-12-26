import { deleteResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getSecurityGroupService(permission);
  const { id } = event.context.params as { id: string };

  return deleteResource(id, service.delete);
});
