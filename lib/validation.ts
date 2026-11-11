import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Минимум 3 символа")
  .max(24, "Максимум 24 символа")
  .regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _");

export const passwordSchema = z
  .string()
  .min(6, "Минимум 6 символов")
  .max(72, "Слишком длинный пароль");

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9-]+$/, "slug: латиница, цифры, дефис");

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/[а-яё]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
