import { z } from "zod";
import { looseUuidSchema } from "./common";

export const addNodeSchema = z.object({
  ipAddress: z.ipv4(),
  rootPassword: z.string(),
  name: z.string().optional(),
  isAdmin: z.boolean().optional(),
});

export const updateNodeSchema = z.object({
  name: z.string(),
  isAdmin: z.boolean(),
});

export const partialUpdateNodeSchema = z.object({
  name: z.string().optional(),
  isAdmin: z.boolean().optional(),
});

export const deleteNodeSchema = z.object({
  nodeId: looseUuidSchema,
});
