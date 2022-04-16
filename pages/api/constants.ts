import { z } from "zod";

export const GoogleOauthClientId = z
  .string()
  .nonempty()
  .parse(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID);
