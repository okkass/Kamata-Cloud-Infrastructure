import { z } from "zod";
import { looseUuidSchema } from "./common";

export const createImageSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  storagePoolId: looseUuidSchema,
});

export const updateImageSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const partialUpdateImageSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const deleteImageSchema = z.object({
  imageId: looseUuidSchema,
});
