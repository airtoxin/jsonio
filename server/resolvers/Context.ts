import { YogaInitialContext } from "@graphql-yoga/common/types";
import { PrismaClient } from "@prisma/client";
import { AccountDataSource } from "../dataSources/AccountDataSource";

export type Context = Readonly<YogaInitialContext> & {
  readonly dataSources: {
    readonly prisma: PrismaClient;
    readonly account: AccountDataSource;
  };
};
