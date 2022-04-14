import { z } from "zod";

export const stringToInt = (refine?: (int: number) => boolean) =>
  z
    .string()
    .nonempty()
    .refine((s) => {
      const matched = s.match(/^[1-9][0-9]*$/);
      if (!matched) return false;
      const int = Number.parseInt(s, 10);
      return !Number.isNaN(int) && (refine?.(int) ?? true);
    })
    .transform((s) => Number.parseInt(s, 10));
