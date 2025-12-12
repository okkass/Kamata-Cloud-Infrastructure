import { z } from "zod";

export const backupCreateSchema = z.object({
  targetStorageId: z.uuid(),
  targetVirtualMachineId: z.uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1024).optional(),
});

export const backupPutSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1024).optional(),
});

export const backupPatchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1024).optional(),
});
