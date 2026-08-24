import { z } from 'zod';
import type { GraphQLContext } from '../context.js';
import { requireAuth } from '../context.js';
import { comparePassword, hashPassword, signToken } from '../../lib/auth.js';
import { badRequest, conflict, notFound } from '../../lib/errors.js';

const signUpSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter ao menos 2 caracteres.'),
  email: z.string().trim().toLowerCase().email('Informe um e-mail valido.'),
  password: z.string().min(8, 'A senha deve ter no minimo 8 caracteres.'),
  avatarUrl: z.string().trim().url('Informe uma URL valida para o avatar.').optional().nullable(),
});

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('Informe um e-mail valido.'),
  password: z.string().min(1, 'Informe a senha.'),
});

// o e-mail nao pode ser alterado (regra do layout, tela "Conta")
const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'O nome deve ter ao menos 2 caracteres.').optional(),
    avatarUrl: z.string().trim().url('Informe uma URL valida para o avatar.').nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Informe ao menos um campo para atualizar.',
  });

/** "Conta teste" -> "CT". Usado no avatar do header. */
function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) throw badRequest(result.error.issues[0]?.message ?? 'Dados invalidos.');
  return result.data;
}

export const userResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const user = await context.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw notFound('Usuario nao encontrado.');
      return user;
    },
  },

  Mutation: {
    signUp: async (_parent: unknown, args: { input: unknown }, context: GraphQLContext) => {
      const data = parse(signUpSchema, args.input);

      const existing = await context.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw conflict('Ja existe uma conta com esse e-mail.');

      const user = await context.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: await hashPassword(data.password),
          avatarUrl: data.avatarUrl ?? null,
        },
      });

      return { token: signToken(user.id), user };
    },

    signIn: async (_parent: unknown, args: { input: unknown }, context: GraphQLContext) => {
      const data = parse(signInSchema, args.input);

      const user = await context.prisma.user.findUnique({ where: { email: data.email } });
      // mensagem generica de proposito: nao revela se o e-mail existe
      if (!user) throw badRequest('E-mail ou senha invalidos.');

      const valid = await comparePassword(data.password, user.password);
      if (!valid) throw badRequest('E-mail ou senha invalidos.');

      return { token: signToken(user.id), user };
    },

    updateProfile: async (_parent: unknown, args: { input: unknown }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const data = parse(updateProfileSchema, args.input);

      return context.prisma.user.update({ where: { id: userId }, data });
    },
  },

  User: {
    initials: (parent: { name: string }) => buildInitials(parent.name),
  },
};
