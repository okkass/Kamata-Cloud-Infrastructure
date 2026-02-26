import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const createUserSchema = z.object({
  password: z.string().min(8),
  name: z.string(),
  email: z.email(),
  maxCpuCore: z.int().nullable(),
  maxMemorySize: z.int().nullable(),
  maxStorageSize: z.int().nullable(),
  isAdmin: z.boolean(),
  isImageAdmin: z.boolean().optional(),
  isInstanceTypeAdmin: z.boolean().optional(),
  isVirtualMachineAdmin: z.boolean().optional(),
  isNetworkAdmin: z.boolean().optional(),
  isSecurityGroupAdmin: z.boolean().optional(),
  isNodeAdmin: z.boolean().optional()
});
const updateUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  maxCpuCore: z.int().nullable(),
  maxMemorySize: z.int().nullable(),
  maxStorageSize: z.int().nullable(),
  isAdmin: z.boolean(),
  isImageAdmin: z.boolean(),
  isInstanceTypeAdmin: z.boolean(),
  isVirtualMachineAdmin: z.boolean(),
  isNetworkAdmin: z.boolean(),
  isSecurityGroupAdmin: z.boolean(),
  isNodeAdmin: z.boolean()
});
const partialUpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  maxCpuCore: z.int().nullable().optional(),
  maxMemorySize: z.int().nullable().optional(),
  maxStorageSize: z.int().nullable().optional(),
  isAdmin: z.boolean().optional(),
  isImageAdmin: z.boolean().optional(),
  isInstanceTypeAdmin: z.boolean().optional(),
  isVirtualMachineAdmin: z.boolean().optional(),
  isNetworkAdmin: z.boolean().optional(),
  isSecurityGroupAdmin: z.boolean().optional(),
  isNodeAdmin: z.boolean().optional()
});
z.object({
  userId: looseUuidSchema
});
z.object({
  currentPassword: z.string(),
  newPassword: z.string()
});

export { createUserSchema as c, partialUpdateUserSchema as p, updateUserSchema as u };
//# sourceMappingURL=user.mjs.map
