import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const createStorageSchema = z.object({
  name: z.string(),
  size: z.number(),
  poolId: looseUuidSchema,
  backupId: looseUuidSchema.optional()
});
const updateStorageSchema = z.object({
  name: z.string()
});
const partialUpdateStorageSchema = z.object({
  name: z.string().optional()
});
z.object({
  storageId: looseUuidSchema
});
const createVmSecurityGroupSchema = z.object({
  securityGroupId: looseUuidSchema
});
z.object({
  securityGroupId: looseUuidSchema
});
const specWithInstanceType = z.object({
  instanceTypeId: looseUuidSchema
});
const specWithCustomSpec = z.object({
  cpu: z.number(),
  memory: z.number()
});
const createVirtualMachineSchema = z.object({
  publicKey: z.string(),
  nodeId: looseUuidSchema,
  imageId: looseUuidSchema,
  middlewareId: looseUuidSchema.optional().nullable(),
  subnetIds: z.array(looseUuidSchema),
  storages: z.array(createStorageSchema),
  securityGroupIds: z.array(looseUuidSchema),
  name: z.string(),
  spec: z.union([specWithInstanceType, specWithCustomSpec])
});
const updateVirtualMachineSchema = z.object({
  name: z.string(),
  spec: z.union([specWithInstanceType, specWithCustomSpec])
});
const partialUpdateVirtualMachineSchema = z.object({
  name: z.string().optional(),
  spec: z.union([specWithInstanceType, specWithCustomSpec]).optional()
});
z.object({
  virtualMachineId: looseUuidSchema
});
const createNetworkInterfaceSchema = z.object({
  virtualMachineId: looseUuidSchema,
  subnetId: looseUuidSchema
});
const updateNetworkInterfaceSchema = z.object({
  name: z.string(),
  subnetId: looseUuidSchema
});
const partialUpdateNetworkInterfaceSchema = z.object({
  name: z.string().optional(),
  subnetId: looseUuidSchema.optional()
});
z.object({
  networkInterfaceId: looseUuidSchema
});

export { partialUpdateNetworkInterfaceSchema as a, updateNetworkInterfaceSchema as b, createNetworkInterfaceSchema as c, createVmSecurityGroupSchema as d, partialUpdateStorageSchema as e, updateStorageSchema as f, createStorageSchema as g, createVirtualMachineSchema as h, partialUpdateVirtualMachineSchema as p, updateVirtualMachineSchema as u };
//# sourceMappingURL=virtualMachine.mjs.map
