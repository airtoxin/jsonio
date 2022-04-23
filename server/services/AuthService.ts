import { GoogleOauthClientId } from "@/pages/api/constants";
import { Account } from "@/models/Account";
import { OAuth2Client } from "google-auth-library";
import { ApplicationError } from "../errors";
import { createHmac } from "crypto";
import { ApplicationSecret } from "../constants";
import { z } from "zod";

export class AuthService {
  constructor(
    private client = new OAuth2Client({
      clientId: GoogleOauthClientId,
    })
  ) {}

  public async getAccount(
    idToken: string
  ): Promise<
    | Account
    | IdVerificationError
    | PayloadNotFoundError
    | InvalidPayloadFormatError
  > {
    const ticket = await this.client
      .verifyIdToken({
        idToken,
        audience: GoogleOauthClientId,
      })
      .catch(
        (error) => new IdVerificationError(`Invalid idToken: ${idToken}`, error)
      );
    if (ticket instanceof IdVerificationError) return ticket;

    const payload = ticket.getPayload();
    if (!payload) return new PayloadNotFoundError();

    const result = PayloadSchema.safeParse(payload);
    if (!result.success)
      return new InvalidPayloadFormatError(result.error.toString());
    const emailHash = createHmac("sha256", ApplicationSecret)
      .update(result.data.email)
      .digest("hex");

    return {
      emailHash,
      name: result.data.name,
      picture: result.data.picture,
    };
  }
}

const PayloadSchema = z.object({
  email: z.string(),
  name: z.string(),
  picture: z.string().optional(),
});

export const authService = new AuthService();

export class IdVerificationError extends ApplicationError {}
export class PayloadNotFoundError extends ApplicationError {}
export class InvalidPayloadFormatError extends ApplicationError {}
