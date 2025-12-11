import { z } from "zod";
import { getUserById } from "@/services/userService";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.uuid();