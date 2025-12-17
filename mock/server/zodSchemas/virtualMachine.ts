import { z } from "zod";

export const createStorageSchema = z.object({
  name: z.string(),
  size: z.number(),
  poolId: z.uuid(),
  backupId: z.uuid().optional(),
});

export const updateStorageSchema = z.object({
  name: z.string(),
});

export const partialUpdateStorageSchema = z.object({
  name: z.string().optional(),
});

export const deleteStorageSchema = z.object({
  storageId: z.uuid(),
});

export const createVmSecurityGroupSchema = z.object({
  securityGroupId: z.uuid(),
});

export const deleteVmSecurityGroupSchema = z.object({
  securityGroupId: z.uuid(),
});

const specWithInstanceType = z.object({
  instanceTypeId: z.uuid(),
});
const specWithCustomSpec = z.object({
  cpu: z.number(),
  memory: z.number(),
});

export const createVirtualMachineSchema = z.object({
  publicKey: z.string(),
  nodeId: z.uuid(),
  imageId: z.uuid(),
  middlewareId: z.uuid(),
  storages: z.array(createStorageSchema),
  securityGroupIds: z.array(z.uuid()),
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
  virtualMachineId: z.uuid(),
});

export const createNetworkInterfaceSchema = z.object({
  virtualMachineId: z.uuid(),
  subnetId: z.uuid(),
});

export const updateNetworkInterfaceSchema = z.object({
  virtualMachineId: z.uuid(),
  subnetId: z.uuid(),
});

export const partialUpdateNetworkInterfaceSchema = z.object({
  virtualMachineId: z.uuid().optional(),
  subnetId: z.uuid().optional(),
});

export const deleteNetworkInterfaceSchema = z.object({
  networkInterfaceId: z.uuid(),
});
