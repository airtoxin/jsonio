import gql from "graphql-tag";

export const typeDefs = gql`
  scalar Date

  type Account {
    emailHash: ID!
    name: String!
    picture: String
  }

  type Token {
    id: ID!
    createdAt: Date!
    createdBy: String!
    lastUsedAt: Date
  }

  type Query {
    me: Account
    tokens: [Token!]!
  }

  type Mutation {
    login: Boolean!
    createToken: Token!
  }
`;
