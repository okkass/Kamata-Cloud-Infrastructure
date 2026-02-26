import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const createSnapshotSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  targetVmId: looseUuidSchema
});
const updateSnapshotSchema = z.object({
  name: z.string(),
  description: z.string()
});
const partialUpdateSnapshotSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});
z.object({
  snapshotId: looseUuidSchema
});

export { createSnapshotSchema as c, partialUpdateSnapshotSchema as p, updateSnapshotSchema as u };
//# sourceMappingURL=snapshot.mjs.map
