import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { GraphQLContext } from '../context.js';
import { requireAuth } from '../context.js';
import { badRequest, notFound } from '../../lib/errors.js';

const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);

const amountSchema = z
  .number()
  .finite('Informe um valor valido.')
  .positive('O valor deve ser maior que zero.')
  .transform((value) => Math.round(value * 100) / 100);

const createTransactionSchema = z.object({
  title: z.string().trim().min(1, 'Informe o titulo da transacao.').max(60, 'O titulo deve ter no maximo 60 caracteres.'),
  description: z.string().trim().max(255, 'A descricao deve ter no maximo 255 caracteres.').nullable().optional(),
  amount: amountSchema,
  type: transactionTypeSchema,
  date: z.coerce.date(),
  categoryId: z.string().trim().min(1).nullable().optional(),
});

const updateTransactionSchema = z
  .object({
    title: z.string().trim().min(1, 'Informe o titulo da transacao.').max(60, 'O titulo deve ter no maximo 60 caracteres.').optional(),
    description: z.string().trim().max(255, 'A descricao deve ter no maximo 255 caracteres.').nullable().optional(),
    amount: amountSchema.optional(),
    type: transactionTypeSchema.optional(),
    date: z.coerce.date().optional(),
    categoryId: z.string().trim().min(1).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
  });

// `nullish` e proposital: em GraphQL um filtro "Todos" chega como null explicito,
// nao como campo ausente.
const filtersSchema = z
  .object({
    type: transactionTypeSchema.nullish(),
    categoryId: z.string().trim().min(1).nullish(),
    search: z.string().trim().min(1).nullish(),
    startDate: z.coerce.date().nullish(),
    endDate: z.coerce.date().nullish(),
  })
  .nullish();

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) throw badRequest(result.error.issues[0]?.message ?? 'Dados invalidos.');
  return result.data;
}

type Filters = NonNullable<NonNullable<z.infer<typeof filtersSchema>>>;

/** Monta o filtro do Prisma sempre travado no usuario autenticado. */
function buildWhere(userId: string, filters?: Filters | null): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };
  if (!filters) return where;

  if (filters.type) where.type = filters.type;
  if (filters.categoryId) where.categoryId = filters.categoryId;

  if (filters.startDate || filters.endDate) {
    where.date = {
      ...(filters.startDate ? { gte: filters.startDate } : {}),
      ...(filters.endDate ? { lte: filters.endDate } : {}),
    };
  }

  if (filters.search) {
    where.OR = [{ title: { contains: filters.search } }, { description: { contains: filters.search } }];
  }

  return where;
}

/** Valida que a categoria informada existe e pertence ao usuario. */
async function assertCategoryOwnership(context: GraphQLContext, userId: string, categoryId?: string | null) {
  if (!categoryId) return;
  const category = await context.prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw notFound('Categoria nao encontrada.');
}

const transactionInclude = {
  category: { include: { _count: { select: { transactions: true } } } },
} satisfies Prisma.TransactionInclude;

async function findOwnedTransaction(context: GraphQLContext, userId: string, id: string) {
  const transaction = await context.prisma.transaction.findFirst({
    where: { id, userId },
    include: transactionInclude,
  });
  if (!transaction) throw notFound('Transacao nao encontrada.');
  return transaction;
}

export const transactionResolvers = {
  Query: {
    transactions: async (
      _parent: unknown,
      args: { filters?: unknown; orderBy?: 'asc' | 'desc'; limit?: number | null; offset?: number | null },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      const filters = parse(filtersSchema, args.filters);
      const orderBy = args.orderBy ?? 'desc';
      const where = buildWhere(userId, filters);

      const [items, total] = await Promise.all([
        context.prisma.transaction.findMany({
          where,
          orderBy: [{ date: orderBy }, { createdAt: orderBy }],
          take: args.limit ?? undefined,
          skip: args.offset ?? undefined,
          include: transactionInclude,
        }),
        context.prisma.transaction.count({ where }),
      ]);

      return { items, total };
    },

    transaction: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      return findOwnedTransaction(context, userId, args.id);
    },

    summary: async (_parent: unknown, args: { filters?: unknown }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const filters = parse(filtersSchema, args.filters);

      const where = buildWhere(userId, filters);

      const [grouped, categoriesCount, byCategory] = await Promise.all([
        context.prisma.transaction.groupBy({
          by: ['type'],
          where,
          _sum: { amount: true },
          _count: { _all: true },
        }),
        context.prisma.category.count({ where: { userId } }),
        context.prisma.transaction.groupBy({
          by: ['categoryId'],
          where: { ...where, categoryId: { not: null } },
          _count: { _all: true },
          orderBy: { _count: { categoryId: 'desc' } },
          take: 1,
        }),
      ]);

      const income = grouped.find((row) => row.type === 'INCOME')?._sum.amount ?? 0;
      const expense = grouped.find((row) => row.type === 'EXPENSE')?._sum.amount ?? 0;
      const transactionsCount = grouped.reduce((total, row) => total + row._count._all, 0);

      const mostUsedCategoryId = byCategory[0]?.categoryId ?? null;
      const mostUsedCategory = mostUsedCategoryId
        ? await context.prisma.category.findFirst({
            where: { id: mostUsedCategoryId, userId },
            include: { _count: { select: { transactions: true } } },
          })
        : null;

      return {
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
        balance: Math.round((income - expense) * 100) / 100,
        transactionsCount,
        categoriesCount,
        mostUsedCategory,
      };
    },
  },

  Mutation: {
    createTransaction: async (_parent: unknown, args: { input: unknown }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const data = parse(createTransactionSchema, args.input);

      await assertCategoryOwnership(context, userId, data.categoryId);

      return context.prisma.transaction.create({
        data: {
          title: data.title,
          description: data.description ?? null,
          amount: data.amount,
          type: data.type,
          date: data.date,
          categoryId: data.categoryId ?? null,
          userId,
        },
        include: transactionInclude,
      });
    },

    updateTransaction: async (_parent: unknown, args: { id: string; input: unknown }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const data = parse(updateTransactionSchema, args.input);

      await findOwnedTransaction(context, userId, args.id);
      if (data.categoryId !== undefined) await assertCategoryOwnership(context, userId, data.categoryId);

      return context.prisma.transaction.update({
        where: { id: args.id },
        data,
        include: transactionInclude,
      });
    },

    deleteTransaction: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const transaction = await findOwnedTransaction(context, userId, args.id);

      await context.prisma.transaction.delete({ where: { id: args.id } });
      return transaction;
    },
  },
};
