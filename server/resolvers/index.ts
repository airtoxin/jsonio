import { Resolvers } from "../models.gen";
import { randomUUID } from "crypto";
import { GraphQLYogaError } from "@graphql-yoga/node";

export const resolvers: Resolvers = {
  Query: {
    me: async (parent, args, { dataSources }) => {
      return dataSources.account.getAccount();
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
      return dataSources.prisma.token.create({
        data: {
          id: randomUUID(),
          createdBy: account.email,
        },
      });
    },
  },
};
