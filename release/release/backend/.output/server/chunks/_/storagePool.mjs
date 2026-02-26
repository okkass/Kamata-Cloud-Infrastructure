import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const createStoragePoolSchema = z.object({
  nodeId: looseUuidSchema,
  devicePath: z.string(),
  name: z.string(),
  hasNetworkAccess: z.boolean()
});
const updateStoragePoolSchema = z.object({
  name: z.string().optional(),
  hasNetworkAccess: z.boolean()
});
const partialUpdateStoragePoolSchema = z.object({
  name: z.string().optional(),
  hasNetworkAccess: z.boolean().optional()
});
z.object({
  storagePoolId: looseUuidSchema
});

export { createStoragePoolSchema as c, partialUpdateStoragePoolSchema as p, updateStoragePoolSchema as u };
//# sourceMappingURL=storagePool.mjs.map
