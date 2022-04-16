import { GoogleOauthClientId } from "../pages/api/constants";
import { Account, AccountSchema } from "../models/Account";
import { OAuth2Client } from "google-auth-library";
import { ApplicationError } from "./errors";

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

    const result = AccountSchema.safeParse(payload);
    if (!result.success)
      return new InvalidPayloadFormatError(result.error.toString());

    return result.data;
  }
}

export const authService = new AuthService();

export class IdVerificationError extends ApplicationError {}
export class PayloadNotFoundError extends ApplicationError {}
export class InvalidPayloadFormatError extends ApplicationError {}
