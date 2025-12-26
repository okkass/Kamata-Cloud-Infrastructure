import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSnapshotService } from "@/service/SnapshotService";
import { updateSnapshotSchema } from "@/zodSchemas/snapshot";
import { SnapshotPutRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getSnapshotService(permission);
  const { id } = event.context.params as { id: string };
  return updateResource(
    id,
    body as SnapshotPutRequest,
    updateSnapshotSchema,
    service.update
  );
});
