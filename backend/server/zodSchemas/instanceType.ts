import { z } from "zod";
import { looseUuidSchema } from "./common";

export const createInstanceTypeSchema = z.object({
  name: z.string(),
  cpuCore: z.int().min(1).max(1099511627776),
  memorySize: z.int().min(1).max(1099511627776),
});

export const updateInstanceTypeSchema = z.object({
  name: z.string(),
  cpuCore: z.int().min(1).max(1099511627776),
  memorySize: z.int().min(1).max(1099511627776),
});

export const partialUpdateInstanceTypeSchema = z.object({
  name: z.string().optional(),
  cpuCore: z.int().min(1).max(1099511627776).optional(),
  memorySize: z.int().min(1).max(1099511627776).optional(),
});

export const deleteInstanceTypeSchema = z.object({
  instanceTypeId: looseUuidSchema,
});
