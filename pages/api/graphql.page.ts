import { typeDefs } from "../../schema";
import { resolvers } from "../../server/resolvers";
import { createServer } from "@graphql-yoga/node";
import { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../server/AuthService";
import { prisma } from "../../server/prisma";

const server = createServer<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema: { typeDefs, resolvers },
  context: async (initialContext) => {
    const authorization = initialContext.request.headers.get("authorization");
    const account = authorization?.startsWith("Bearer: ")
      ? await authService
          .getAccount(authorization.slice("Bearer: ".length))
          .catch(() => null)
      : null;
    return {
      ...initialContext,
      account,
      dataSources: {
        prisma,
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
