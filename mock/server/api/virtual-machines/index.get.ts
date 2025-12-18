import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getVirtualMachineService(permission);

  return getResourceList(service.list);
});
