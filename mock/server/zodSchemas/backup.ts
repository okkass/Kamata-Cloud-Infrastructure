import { z } from "zod";

export const backupCreateSchema = z.object({
  targetVirtualMachineId: z.uuid(),
  targetStorageId: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
});

export const backupUpdateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const backupPartialUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const backupDeleteSchema = z.object({
  backupId: z.uuid(),
});
