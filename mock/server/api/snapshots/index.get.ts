import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSnapshotService } from "@/service/SnapshotService";

export default defineEventHandler((event) => {
  const { scope } = getQuery(event) as { scope?: string };
  if (scope !== undefined && scope !== "all" && scope !== "mine") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid scope parameter",
    });
  }
  const permission = getPermissionFromEvent(event);
  const service = getSnapshotService(permission);

  return getResourceList(service.list);
});
