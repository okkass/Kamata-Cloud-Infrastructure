import { z } from "zod";

export const createInstanceTypeSchema = z.object({
    name: z.string(),
    cpuCore: z.number(),
    memorySize: z.number(),
});

export const updateInstanceTypeSchema = z.object({
    name: z.string(),
    cpuCore: z.number(),
    memorySize: z.number(),
});

export const partialUpdateInstanceTypeSchema = z.object({
    name: z.string().optional(),
    cpuCore: z.number().optional(),
    memorySize: z.number().optional(),
});

export const deleteInstanceTypeSchema = z.object({
    instanceTypeId: z.uuid(),
});

