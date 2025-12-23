import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualNetworkService } from "@/service/VirtualNetworkService";

export default defineEventHandler((event) => {
  const { scope } = getQuery(event) as { scope?: string };
  if (scope && scope !== "all" && scope !== "mine") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid scope parameter",
    });
  }
  const permission = getPermissionFromEvent(event);
  const service = getVirtualNetworkService(permission);

  return getResourceList(service.list);
});
