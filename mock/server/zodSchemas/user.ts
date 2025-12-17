import { z } from "zod";

export const createUserSchema = z.object({
    password: z.string(),
    name: z.string(),
    email: z.email(),
    maxCpuCore: z.number().nullable(),
    maxMemorySize: z.number().nullable(),
    maxStorageSize: z.number().nullable(),
    isAdmin: z.boolean(),
    isImageAdmin: z.boolean().optional(),
    isInstanceTypeAdmin: z.boolean().optional(),
    isVirtualMachineAdmin: z.boolean().optional(),
    isNetworkAdmin: z.boolean().optional(),
    isSecurityGroupAdmin: z.boolean().optional(),
    isNodeAdmin: z.boolean().optional(),
});

export const updateUserSchema = z.object({
    name: z.string(),
    email: z.email(),
    maxCpuCore: z.number().nullable().optional(),
    maxMemorySize: z.number().nullable().optional(),
    maxStorageSize: z.number().nullable().optional(),
    isAdmin: z.boolean(),
    isImageAdmin: z.boolean(),
    isInstanceTypeAdmin: z.boolean(),
    isVirtualMachineAdmin: z.boolean(),
    isNetworkAdmin: z.boolean(),
    isSecurityGroupAdmin: z.boolean(),
    isNodeAdmin: z.boolean(),
});

export const partialUpdateUserSchema = z.object({
    name: z.string().optional(),
    email: z.email().optional(),
    maxCpuCore: z.number().nullable().optional(),
    maxMemorySize: z.number().nullable().optional(),
    maxStorageSize: z.number().nullable().optional(),
    isAdmin: z.boolean().optional(),
    isImageAdmin: z.boolean().optional(),
    isInstanceTypeAdmin: z.boolean().optional(),
    isVirtualMachineAdmin: z.boolean().optional(),
    isNetworkAdmin: z.boolean().optional(),
    isSecurityGroupAdmin: z.boolean().optional(),
    isNodeAdmin: z.boolean().optional(),
});

export const deleteUserSchema = z.object({
    userId: z.uuid(),
});


export const updateUserPasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
});

