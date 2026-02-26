import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const addNodeSchema = z.object({
  ipAddress: z.ipv4(),
  rootPassword: z.string(),
  name: z.string().optional(),
  isAdmin: z.boolean().optional()
});
const updateNodeSchema = z.object({
  name: z.string(),
  isAdmin: z.boolean()
});
const partialUpdateNodeSchema = z.object({
  name: z.string().optional(),
  isAdmin: z.boolean().optional()
});
z.object({
  nodeId: looseUuidSchema
});

export { addNodeSchema as a, partialUpdateNodeSchema as p, updateNodeSchema as u };
//# sourceMappingURL=node.mjs.map
