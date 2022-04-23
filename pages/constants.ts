import { z } from "zod";

const protocol = z
  .string()
  .nonempty()
  .parse(process.env.NEXT_PUBLIC_APPLICATION_SERVER_PROTOCOL);
const host = z
  .string()
  .nonempty()
  .parse(
    process.env.NEXT_PUBLIC_VERCEL_URL ||
      process.env.NEXT_PUBLIC_APPLICATION_SERVER_HOST
  );
export const ApplicationServerUrl = `${protocol}://${host}`;

export const GoogleOauthClientId = z
  .string()
  .nonempty()
  .parse(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID);
