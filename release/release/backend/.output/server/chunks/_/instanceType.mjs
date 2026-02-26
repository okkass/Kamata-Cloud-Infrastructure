import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const createInstanceTypeSchema = z.object({
  name: z.string(),
  cpuCore: z.int().min(1).max(1099511627776),
  memorySize: z.int().min(1).max(1099511627776)
});
const updateInstanceTypeSchema = z.object({
  name: z.string(),
  cpuCore: z.int().min(1).max(1099511627776),
  memorySize: z.int().min(1).max(1099511627776)
});
const partialUpdateInstanceTypeSchema = z.object({
  name: z.string().optional(),
  cpuCore: z.int().min(1).max(1099511627776).optional(),
  memorySize: z.int().min(1).max(1099511627776).optional()
});
z.object({
  instanceTypeId: looseUuidSchema
});

export { createInstanceTypeSchema as c, partialUpdateInstanceTypeSchema as p, updateInstanceTypeSchema as u };
//# sourceMappingURL=instanceType.mjs.map
