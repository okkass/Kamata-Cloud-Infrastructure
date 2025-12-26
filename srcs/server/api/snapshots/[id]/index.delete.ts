import { deleteResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSnapshotService } from "@@/server/service/SnapshotService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getSnapshotService(permission);
  const { id } = event.context.params as { id: string };

  return deleteResource(id, service.delete);
});
