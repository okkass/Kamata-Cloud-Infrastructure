import { z } from "zod";
import { looseUuidSchema } from "./common";

export const createStoragePoolSchema = z.object({
  nodeId: looseUuidSchema,
  devicePath: z.string(),
  name: z.string(),
  hasNetworkAccess: z.boolean(),
});

export const updateStoragePoolSchema = z.object({
  name: z.string().optional(),
  hasNetworkAccess: z.boolean(),
});

export const partialUpdateStoragePoolSchema = z.object({
  name: z.string().optional(),
  hasNetworkAccess: z.boolean().optional(),
});

export const deleteStoragePoolSchema = z.object({
  storagePoolId: looseUuidSchema,
});
