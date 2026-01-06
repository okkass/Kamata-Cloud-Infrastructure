import { z } from "zod";
import { looseUuidSchema } from "./common";

export const createSubnetSchema = z.object({
  name: z.string(),
  cidr: z.cidrv4(),
});

export const createVirtualNetworkSchema = z.object({
  name: z.string(),
  cidr: z.cidrv4(),
  initialSubnets: z.array(createSubnetSchema).min(1),
});

export const updateVirtualNetworkSchema = z.object({
  name: z.string(),
});

export const partialUpdateVirtualNetworkSchema = z.object({
  name: z.string().optional(),
});

export const deleteVirtualNetworkSchema = z.object({
  virtualNetworkId: looseUuidSchema,
});

export const updateSubnetSchema = z.object({
  name: z.string(),
  cidr: z.cidrv4(),
});

export const partialUpdateSubnetSchema = z.object({
  name: z.string().optional(),
  cidr: z.cidrv4().optional(),
});

export const deleteSubnetSchema = z.object({
  networkId: looseUuidSchema,
  subnetId: looseUuidSchema,
});
