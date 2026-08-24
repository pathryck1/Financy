import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { GraphQLContext } from '../context.js';
import { requireAuth } from '../context.js';
import { badRequest, conflict, notFound } from '../../lib/errors.js';

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const LUCIDE_ICON = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const colorSchema = z
  .string()
  .trim()
  .regex(HEX_COLOR, 'A cor deve estar no formato hexadecimal, ex: #16A34A.');

const iconSchema = z
  .string()
  .trim()
  .max(40, 'O nome do icone e muito longo.')
  .regex(LUCIDE_ICON, 'O icone deve ser um nome valido do Lucide, ex: utensils.');

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Informe o nome da categoria.')
  .max(40, 'O nome deve ter no maximo 40 caracteres.');

const descriptionSchema = z
  .string()
  .trim()
  .max(120, 'A descricao deve ter no maximo 120 caracteres.')
  .nullable()
  .optional();

const createCategorySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  icon: iconSchema.optional(),
  color: colorSchema.optional(),
});

const updateCategorySchema = z
  .object({
    name: nameSchema.optional(),
    description: descriptionSchema,
    icon: iconSchema.optional(),
    color: colorSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
  });

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) throw badRequest(result.error.issues[0]?.message ?? 'Dados invalidos.');
  return result.data;
}

export const categoryInclude = {
  _count: { select: { transactions: true } },
} satisfies Prisma.CategoryInclude;

/** Busca a categoria garantindo que ela pertence ao usuario autenticado. */
async function findOwnedCategory(context: GraphQLContext, userId: string, id: string) {
  const category = await context.prisma.category.findFirst({
    where: { id, userId },
    include: categoryInclude,
  });
  if (!category) throw notFound('Categoria nao encontrada.');
  return category;
}

export const categoryResolvers = {
  Query: {
    categories: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      return context.prisma.category.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
        include: categoryInclude,
      });
    },

    category: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      return findOwnedCategory(context, userId, args.id);
    },
  },

  Mutation: {
    createCategory: async (_parent: unknown, args: { input: unknown }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const data = parse(createCategorySchema, args.input);

      const duplicated = await context.prisma.category.findFirst({ where: { userId, name: data.name } });
      if (duplicated) throw conflict('Voce ja tem uma categoria com esse nome.');

      return context.prisma.category.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          icon: data.icon ?? 'tag',
          color: data.color ?? '#16A34A',
          userId,
        },
        include: categoryInclude,
      });
    },

    updateCategory: async (_parent: unknown, args: { id: string; input: unknown }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const data = parse(updateCategorySchema, args.input);

      await findOwnedCategory(context, userId, args.id);

      if (data.name) {
        const duplicated = await context.prisma.category.findFirst({ where: { userId, name: data.name } });
        if (duplicated && duplicated.id !== args.id) throw conflict('Voce ja tem uma categoria com esse nome.');
      }

      return context.prisma.category.update({
        where: { id: args.id },
        data,
        include: categoryInclude,
      });
    },

    deleteCategory: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const category = await findOwnedCategory(context, userId, args.id);

      // as transacoes sao preservadas e ficam sem categoria (onDelete: SetNull)
      await context.prisma.category.delete({ where: { id: args.id } });
      return category;
    },
  },

  Category: {
    transactionsCount: (parent: { _count?: { transactions: number } }) => parent._count?.transactions ?? 0,

    transactionsTotal: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
      const result = await context.prisma.transaction.aggregate({
        where: { categoryId: parent.id },
        _sum: { amount: true },
      });
      return Math.round((result._sum.amount ?? 0) * 100) / 100;
    },
  },
};
