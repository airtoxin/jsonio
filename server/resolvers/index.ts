import { Resolvers } from "../models.gen";
import { randomUUID } from "crypto";
import { GraphQLYogaError } from "@graphql-yoga/node";

export const resolvers: Resolvers = {
  Query: {
    me: async (parent, args, { dataSources }) => {
      return dataSources.account.getAccount();
    },
    tokens: async (parent, args, { dataSources }) => {
      const account = dataSources.account.getAccount();
      if (account == null) return [];

      return dataSources.prisma.token.findMany({
        where: {
          createdBy: account.emailHash,
        },
        orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
      });
    },
  },
  Mutation: {
    login: async (parent, args, { dataSources }) => {
      const account = dataSources.account.getAccount();
      return account != null;
    },
    createToken: async (parent, args, { dataSources }) => {
      const account = dataSources.account.getAccount();
      if (account == null) throw new GraphQLYogaError(`Authentication failed`);
      const count = await dataSources.prisma.token.count({
        where: { createdBy: account.emailHash },
      });
      if (count >= 3) throw new GraphQLYogaError(`Token creation limit`);

      return dataSources.prisma.token.create({
        data: {
          id: randomUUID(),
          createdBy: account.emailHash,
        },
      });
    },
    deleteToken: async (parent, { id }, { dataSources }) => {
      const account = dataSources.account.getAccount();
      if (account == null) throw new GraphQLYogaError(`Authentication failed`);
      const result = await dataSources.prisma.token.deleteMany({
        where: {
          id,
          createdBy: account.emailHash,
        },
      });
      return result.count === 1;
    },
  },
};
