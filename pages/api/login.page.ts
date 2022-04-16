import { NextApiHandler } from "next";
import { OAuth2Client } from "google-auth-library";
import { GoogleOauthClientId } from "./constants";
import { AccountSchema } from "../../models/Account";

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

  client
    .verifyIdToken({
      idToken,
      audience: GoogleOauthClientId,
    })
    .then((ticket) => {
      const payload = ticket.getPayload();
      if (!payload) {
        res.status(401).end();
      } else {
        const result = AccountSchema.safeParse(payload);
        if (!result.success) return res.status(401).end();
        res.json(result.data);
      }
    })
    .catch(() => {
      res.status(401).end();
    });
};

export default handler;
