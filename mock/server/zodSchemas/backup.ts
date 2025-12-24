import { z } from "zod";
import { looseUuidSchema } from "./common";

export const backupCreateSchema = z.object({
  targetVirtualMachineId: looseUuidSchema,
  targetStorageId: looseUuidSchema,
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
  backupId: looseUuidSchema,
});
