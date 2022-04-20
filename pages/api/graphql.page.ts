import { typeDefs } from "../../schema";
import { resolvers } from "../../server/resolvers";
import { createServer } from "@graphql-yoga/node";
import { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../server/services/AuthService";
import { prisma } from "../../server/dataSources/prisma";
import { Context } from "../../server/resolvers/Context";
import { AccountDataSource } from "../../server/dataSources/AccountDataSource";

const server = createServer<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema: { typeDefs, resolvers },
  context: async (initialContext): Promise<Context> => {
    const authorization = initialContext.request.headers.get("authorization");
    const account = authorization?.startsWith("Bearer: ")
      ? await authService
          .getAccount(authorization.slice("Bearer: ".length))
          .catch((error) => {
            console.error(error);
            return null;
          })
      : null;
    return {
      ...initialContext,
      dataSources: {
        prisma,
        account: new AccountDataSource(account),
      },
    };
  },
});

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default server;
