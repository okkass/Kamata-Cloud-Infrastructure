import { validate } from "uuid";
import { UserResponse } from "~~/shared/types";

export default defineEventHandler((event) => {
  let user: UserDTO | undefined;
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Error",
    });
  } else if (!validate(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid format",
    });
  } else {
    const users: Array<UserResponse> = [
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
    user = users.find((u) => u.id === id);
  }
  return user;
});
