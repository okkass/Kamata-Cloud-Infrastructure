import { deleteResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSnapshotService } from "@/service/SnapshotService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getSnapshotService(permission);
  const { id } = event.context.params as { id: string };

  return deleteResource(id, service.delete);
});
