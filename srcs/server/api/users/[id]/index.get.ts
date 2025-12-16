import { validate as validateUuid } from "uuid";
import { defineEventHandler, createError } from "h3";
import type { UserResponse } from "~~/shared/types";

// モックユーザ一覧（必要に応じて追加してOK）
const users: UserResponse[] = [
  {
    id: "a575c9ea-96fb-4ed3-9d92-d93712d0e2cc",
    name: "Alice",
    email: "sample@example.com",
    createdAt: new Date().toISOString(),
    isAdmin: true,
    lastLoginAt: new Date().toISOString(),
    isImageAdmin: true,
    isInstanceTypeAdmin: true,
    isPhysicalNodeAdmin: true,
  },
  {
    id: "ff09658a-6b02-4c99-bb05-cf8487411d1f",
    name: "Bob",
    email: "sample@example.com",
    createdAt: new Date().toISOString(),
    isAdmin: false,
    lastLoginAt: new Date().toISOString(),
    maxCpuCore: 32,
    maxMemorySize: 32 * 1024 * 1024 * 1024, // 32GB
    maxStorageSize: 512 * 1024 * 1024 * 1024, // 512GB
    isImageAdmin: false,
    isInstanceTypeAdmin: false,
    isPhysicalNodeAdmin: false,
  },
];

export default defineEventHandler((event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required",
    });
  }

  if (!validateUuid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid UUID format",
    });
  }

  const user = users.find((u) => u.id === id);

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return user;
});
