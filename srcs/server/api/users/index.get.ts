import { randomUUID } from "node:crypto";
import type { UserDTO } from "../../../shared/types/index";

export default defineEventHandler(async (event) => {
  const users: Array<UserDTO> = [
    {
      id: "a575c9ea-96fb-4ed3-9d92-d93712d0e2cc",
      name: "Alice",
      email: "sample@example.com",
      createdAt: new Date().toISOString(),
      isAdmin: true,
      lastLoginAt: new Date().toISOString(),
    },
    {
      id: "ff09658a-6b02-4c99-bb05-cf8487411d1f",
      name: "Bob",
      email: "sample@example.com",
      createdAt: new Date().toISOString(),
      isAdmin: true,
      lastLoginAt: new Date().toISOString(),
    },
  ];
  return users;
});
