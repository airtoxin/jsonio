import { z } from "zod";

export type Account = z.TypeOf<typeof AccountSchema>;
export const AccountSchema = z.object({
  email: z.string(),
  name: z.string(),
  picture: z.string().optional(),
});
