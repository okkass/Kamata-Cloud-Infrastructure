import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const backupCreateSchema = z.object({
  targetVirtualMachineId: looseUuidSchema,
  targetStorageId: looseUuidSchema,
  name: z.string(),
  description: z.string().optional()
});
const backupUpdateSchema = z.object({
  name: z.string(),
  description: z.string().optional()
});
const backupPartialUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});
z.object({
  backupId: looseUuidSchema
});

export { backupUpdateSchema as a, backupPartialUpdateSchema as b, backupCreateSchema as c };
//# sourceMappingURL=backup.mjs.map
