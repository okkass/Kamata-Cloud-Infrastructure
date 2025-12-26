import { deleteResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualMachineService } from "@@/server/service/VirtualMachineService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getVirtualMachineService(permission);

  const { id } = event.context.params as { id: string };
  return deleteResource(id, service.delete);
});
