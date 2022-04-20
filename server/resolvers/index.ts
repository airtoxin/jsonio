import { Resolvers } from "../models.gen";
import { randomUUID } from "crypto";
import { GraphQLYogaError } from "@graphql-yoga/node";

export const resolvers: Resolvers = {
  Query: {
    me: async (parent, args, context) => {
      return context.account;
    },
  },
  Mutation: {
    login: async (parent, args, context) => {
      return context.account != null;
    },
    createToken: async (parent, args, context) => {
      if (context.account == null)
        throw new GraphQLYogaError(`Authentication failed`);
      return context.dataSources.prisma.token.create({
        data: {
          id: randomUUID(),
          createdBy: context.account.email,
        },
      });
    },
  },
};
