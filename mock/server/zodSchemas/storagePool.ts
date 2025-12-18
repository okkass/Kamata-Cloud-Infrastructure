import { z } from "zod";

export const createStoragePoolSchema = z.object({
    nodeId: z.uuid(),
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
    storagePoolId: z.uuid(),
});
