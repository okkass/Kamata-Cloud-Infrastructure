import { z } from "zod";

export const snapshotCreateSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    targetVmId: z.uuid(),
});

export const snapshotUpdateSchema = z.object({
    name: z.string(),
    description: z.string(),
});

export const snapshotPartialUpdateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
});

export const snapshotDeleteSchema = z.object({
    snapshotId: z.uuid(),
});