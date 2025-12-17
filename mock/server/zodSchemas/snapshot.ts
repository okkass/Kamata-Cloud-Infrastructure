import { z } from "zod";

export const createSnapshotSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  targetVmId: z.uuid(),
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
  snapshotId: z.uuid(),
});
