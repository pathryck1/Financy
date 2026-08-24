import { DateTimeResolver } from 'graphql-scalars';
import { userResolvers } from './user.js';
import { categoryResolvers } from './category.js';
import { transactionResolvers } from './transaction.js';

export const resolvers = {
  DateTime: DateTimeResolver,

  Query: {
    ...userResolvers.Query,
    ...categoryResolvers.Query,
    ...transactionResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...transactionResolvers.Mutation,
  },

  User: userResolvers.User,
  Category: categoryResolvers.Category,
};
