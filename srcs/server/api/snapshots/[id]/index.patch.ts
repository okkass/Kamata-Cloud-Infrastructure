import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSnapshotService } from "@@/server/service/SnapshotService";
import { partialUpdateSnapshotSchema } from "@@/server/zodSchemas";
import { SnapshotPatchRequest } from "@@/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getSnapshotService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as SnapshotPatchRequest,
    partialUpdateSnapshotSchema,
    service.update
  );
});
