import { deleteResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSecurityGroupService } from "@@/server/service/SecurityGroupService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getSecurityGroupService(permission);
  const { id } = event.context.params as { id: string };

  return deleteResource(id, service.delete);
});
