import { z } from "zod";
import { looseUuidSchema } from "./common";

export const createSnapshotSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  targetVmId: looseUuidSchema,
});

export const updateSnapshotSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const partialUpdateSnapshotSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const deleteSnapshotSchema = z.object({
  snapshotId: looseUuidSchema,
});
