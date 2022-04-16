import { NextApiHandler } from "next";
import { OAuth2Client } from "google-auth-library";
import { GoogleOauthClientId } from "./constants";
import { AccountSchema } from "../../models/Account";
import {
  authService,
  IdVerificationError,
  InvalidPayloadFormatError,
  PayloadNotFoundError,
} from "../../server/AuthService";

const client = new OAuth2Client({
  clientId: GoogleOauthClientId,
});

export const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end() as unknown as void;
  if (
    req.headers.authorization == null ||
    !req.headers.authorization.startsWith("Bearer: ")
  )
    return res.status(401).end as unknown as void;
  const idToken = req.headers.authorization.slice("Bearer: ".length);

  const account = await authService.getAccount(idToken);
  if (account instanceof IdVerificationError)
    return res.status(401).end() as unknown as void;
  if (account instanceof PayloadNotFoundError)
    return res.status(500) as unknown as void;
  if (account instanceof InvalidPayloadFormatError)
    return res.status(401).end() as unknown as void;

  const ticket = await client.verifyIdToken({
    idToken,
    audience: GoogleOauthClientId,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    res.status(401).end();
  } else {
    const result = AccountSchema.safeParse(payload);
    if (!result.success) return res.status(401).end() as unknown as void;
    res.json(result.data);
  }
};

export default handler;
