import { z } from "zod";

export const authSchema = z.object({
  email: z.email().max(256),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(44).max(44),
});
