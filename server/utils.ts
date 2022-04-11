import { z } from "zod";

export const stringToInt = (refine?: (int: number) => boolean) =>
  z
    .string()
    .nonempty()
    .refine((s) => {
      const int = Number.parseInt(s, 10);
      return !Number.isNaN(int) && (refine?.(int) ?? true);
    })
    .transform((s) => Number.parseInt(s, 10));
