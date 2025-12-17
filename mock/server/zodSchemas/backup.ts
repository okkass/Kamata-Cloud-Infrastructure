import { z } from "zod";

export const BackupCreateSchema = z.object({
  targetVirtualMachineId: z.uuid(),
  targetStorageId: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
});

export const BackupPutSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});
