import type { PrismaClient } from '@prisma/client';
import type { Request } from 'express';
import { prisma } from '../lib/prisma.js';
import { extractToken, verifyToken } from '../lib/auth.js';
import { unauthenticated } from '../lib/errors.js';

export interface GraphQLContext {
  prisma: PrismaClient;
  userId: string | null;
}

export async function createContext({ req }: { req: Request }): Promise<GraphQLContext> {
  const token = extractToken(req.headers.authorization);
  const userId = token ? verifyToken(token) : null;

  return { prisma, userId };
}

/**
 * Garante que a requisicao esta autenticada e devolve o id do usuario.
 * Toda query/mutation protegida passa por aqui - e o que garante que o
 * usuario so enxerga os proprios dados.
 */
export function requireAuth(context: GraphQLContext): string {
  if (!context.userId) throw unauthenticated();
  return context.userId;
}
