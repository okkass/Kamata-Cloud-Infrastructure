import { randomUUID } from "node:crypto";
import type { UserDTO } from "../../../shared/types/index";

export default defineEventHandler(async (event) => {
  const user1 = {
    id: randomUUID(),
    name: "Alice",
    email: "sample@example.com",
    createdAt: new Date().toISOString(),
    isAdmin: true,
    lastLoginAt: new Date().toISOString(),
  };
  const user2 = {
    id: randomUUID(),
    name: "Bob",
    email: "sample@example.com",
    createdAt: new Date().toISOString(),
    isAdmin: true,
    lastLoginAt: new Date().toISOString(),
  };
  const users: UserDTO[] = [user1, user2];
  return users;
});
