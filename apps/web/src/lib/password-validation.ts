import { z } from "zod";

export const PASSWORD_REQUIREMENTS =
  "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 digit";

export const passwordSchema = z
  .string()
  .min(8, PASSWORD_REQUIREMENTS)
  .regex(/[A-Z]/, PASSWORD_REQUIREMENTS)
  .regex(/[a-z]/, PASSWORD_REQUIREMENTS)
  .regex(/[0-9]/, PASSWORD_REQUIREMENTS);
