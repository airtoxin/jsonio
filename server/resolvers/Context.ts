import { YogaInitialContext } from "@graphql-yoga/common/types";
import { Account } from "../models.gen";
import { PrismaClient } from "@prisma/client";

export type Context = Readonly<YogaInitialContext> & {
  readonly account: Account | null;
  readonly dataSources: {
    readonly prisma: PrismaClient;
  };
};
