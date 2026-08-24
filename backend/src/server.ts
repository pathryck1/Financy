import http from 'node:http';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';

import { corsOrigins, env } from './config/env.js';
import { createContext, type GraphQLContext } from './graphql/context.js';
import { resolvers } from './graphql/resolvers/index.js';
import { typeDefs } from './graphql/typeDefs.js';
import { prisma } from './lib/prisma.js';

async function main() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    // o Apollo Landing Page continua disponivel em desenvolvimento
    introspection: env.NODE_ENV !== 'production',
  });

  await server.start();

  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: createContext,
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: env.PORT }, resolve));

  console.log(`\n  Financy API pronta em http://localhost:${env.PORT}/graphql\n`);
}

async function shutdown(signal: string) {
  console.log(`\n${signal} recebido, encerrando...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

main().catch(async (error) => {
  console.error('Falha ao iniciar o servidor:', error);
  await prisma.$disconnect();
  process.exit(1);
});
