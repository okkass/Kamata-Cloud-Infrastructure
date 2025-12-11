import { getUsers } from "@/services/userService";

export default defineEventHandler(async (event) => {
  return getUsers();
});