import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSnapshotService } from "@/service/SnapshotService";
import { SnapshotCreateRequest } from "@app/shared/types";
import { createSnapshotSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getSnapshotService(permission);
  const { id } = event.context.params as { id: string };

  return createResource(
    body as SnapshotCreateRequest,
    createSnapshotSchema,
    service.restore(id)
  );
});
