import { z } from "zod";

export const createInstanceTypeSchema = z.object({
  name: z.string(),
  cpuCore: z.int(),
  memorySize: z.int(),
});

export const updateInstanceTypeSchema = z.object({
  name: z.string(),
  cpuCore: z.int(),
  memorySize: z.int(),
});

export const partialUpdateInstanceTypeSchema = z.object({
  name: z.string().optional(),
  cpuCore: z.int().optional(),
  memorySize: z.int().optional(),
});

export const deleteInstanceTypeSchema = z.object({
  instanceTypeId: z.uuid(),
});
