import { z } from "zod";

export const ApplicationSecret = z
  .string()
  .nonempty()
  .parse(process.env.APPLICATION_SECRET);
