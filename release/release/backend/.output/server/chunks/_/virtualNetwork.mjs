import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const createSubnetSchema = z.object({
  name: z.string(),
  cidr: z.cidrv4()
});
const createVirtualNetworkSchema = z.object({
  name: z.string(),
  cidr: z.cidrv4(),
  initialSubnets: z.array(createSubnetSchema).min(1)
});
const updateVirtualNetworkSchema = z.object({
  name: z.string()
});
const partialUpdateVirtualNetworkSchema = z.object({
  name: z.string().optional()
});
z.object({
  virtualNetworkId: looseUuidSchema
});
const updateSubnetSchema = z.object({
  name: z.string(),
  cidr: z.cidrv4()
});
const partialUpdateSubnetSchema = z.object({
  name: z.string().optional(),
  cidr: z.cidrv4().optional()
});
z.object({
  networkId: looseUuidSchema,
  subnetId: looseUuidSchema
});

export { partialUpdateSubnetSchema as a, updateSubnetSchema as b, createSubnetSchema as c, createVirtualNetworkSchema as d, partialUpdateVirtualNetworkSchema as p, updateVirtualNetworkSchema as u };
//# sourceMappingURL=virtualNetwork.mjs.map
