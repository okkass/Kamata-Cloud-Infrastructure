import { z } from "zod";
import { looseUuidSchema } from "./common";

export const createStorageSchema = z.object({
  name: z.string(),
  size: z.number(),
  poolId: looseUuidSchema,
  backupId: looseUuidSchema.optional(),
});

export const updateStorageSchema = z.object({
  name: z.string(),
});

export const partialUpdateStorageSchema = z.object({
  name: z.string().optional(),
});

export const deleteStorageSchema = z.object({
  storageId: looseUuidSchema,
});

export const createVmSecurityGroupSchema = z.object({
  securityGroupId: looseUuidSchema,
});

export const deleteVmSecurityGroupSchema = z.object({
  securityGroupId: looseUuidSchema,
});

const specWithInstanceType = z.object({
  instanceTypeId: looseUuidSchema,
});
const specWithCustomSpec = z.object({
  cpu: z.number(),
  memory: z.number(),
});

export const createVirtualMachineSchema = z.object({
  publicKey: z.string(),
  nodeId: looseUuidSchema,
  imageId: looseUuidSchema,
  middlewareId: looseUuidSchema.optional().nullable(),
  subnetIds: z.array(looseUuidSchema),
  storages: z.array(createStorageSchema),
  securityGroupIds: z.array(looseUuidSchema),
  name: z.string(),
  spec: z.union([specWithInstanceType, specWithCustomSpec]),
});

export const updateVirtualMachineSchema = z.object({
  name: z.string(),
  spec: z.union([specWithInstanceType, specWithCustomSpec]),
});

export const partialUpdateVirtualMachineSchema = z.object({
  name: z.string().optional(),
  spec: z.union([specWithInstanceType, specWithCustomSpec]).optional(),
});

export const deleteVirtualMachineSchema = z.object({
  virtualMachineId: looseUuidSchema,
});

export const createNetworkInterfaceSchema = z.object({
  virtualMachineId: looseUuidSchema,
  subnetId: looseUuidSchema,
});

export const updateNetworkInterfaceSchema = z.object({
  name: z.string(),
  subnetId: looseUuidSchema,
});

export const partialUpdateNetworkInterfaceSchema = z.object({
  name: z.string().optional(),
  subnetId: looseUuidSchema.optional(),
});

export const deleteNetworkInterfaceSchema = z.object({
  networkInterfaceId: looseUuidSchema,
});
