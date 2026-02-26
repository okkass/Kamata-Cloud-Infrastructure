import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const createImageSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  storagePoolId: looseUuidSchema
});
const updateImageSchema = z.object({
  name: z.string(),
  description: z.string().optional()
});
const partialUpdateImageSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});
z.object({
  imageId: looseUuidSchema
});

export { createImageSchema as c, partialUpdateImageSchema as p, updateImageSchema as u };
//# sourceMappingURL=image.mjs.map
