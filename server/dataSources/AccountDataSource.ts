import { Account } from "../../models/Account";
import {
  IdVerificationError,
  InvalidPayloadFormatError,
  PayloadNotFoundError,
} from "../AuthService";
import { ApplicationError } from "../errors";

export class AccountDataSource {
  constructor(
    private maybeAccount:
      | Account
      | IdVerificationError
      | PayloadNotFoundError
      | InvalidPayloadFormatError
      | null
  ) {}

  getAccount(): Account | null {
    return this.maybeAccount instanceof ApplicationError
      ? null
      : this.maybeAccount;
  }

  getError():
    | IdVerificationError
    | PayloadNotFoundError
    | InvalidPayloadFormatError
    | null {
    return this.maybeAccount instanceof ApplicationError
      ? this.maybeAccount
      : null;
  }
}
