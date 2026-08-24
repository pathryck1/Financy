import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'conta@teste.com';
const DEMO_PASSWORD = 'financy123';

/** Categorias iguais as do layout do Figma, com as cores do style guide. */
const CATEGORIES = [
  { name: 'Alimentação', description: 'Restaurantes, delivery e refeições', icon: 'utensils', color: '#2563EB' },
  { name: 'Entretenimento', description: 'Cinema, jogos e lazer', icon: 'ticket', color: '#DB2777' },
  { name: 'Investimento', description: 'Aplicações e retornos financeiros', icon: 'piggy-bank', color: '#16A34A' },
  { name: 'Mercado', description: 'Compras de supermercado e mantimentos', icon: 'shopping-cart', color: '#EA580C' },
  { name: 'Salário', description: 'Renda mensal e bonificações', icon: 'briefcase', color: '#16A34A' },
  { name: 'Saúde', description: 'Medicamentos, consultas e exames', icon: 'heart-pulse', color: '#DC2626' },
  { name: 'Transporte', description: 'Gasolina, transporte público e viagens', icon: 'car', color: '#9333EA' },
  { name: 'Utilidades', description: 'Energia, água, internet e telefone', icon: 'receipt', color: '#CA8A04' },
];

type Seed = { title: string; amount: number; type: 'INCOME' | 'EXPENSE'; category: string; daysAgo: number };

const TRANSACTIONS: Seed[] = [
  // Salário (3) - entradas
  { title: 'Pagamento de Salário', amount: 4250, type: 'INCOME', category: 'Salário', daysAgo: 1 },
  { title: 'Freelance', amount: 2500, type: 'INCOME', category: 'Salário', daysAgo: 9 },
  { title: 'Bonificação trimestral', amount: 1200, type: 'INCOME', category: 'Salário', daysAgo: 34 },

  // Investimento (1) - entrada
  { title: 'Retorno de Investimento', amount: 340.25, type: 'INCOME', category: 'Investimento', daysAgo: 7 },

  // Alimentação (12)
  { title: 'Jantar no Restaurante', amount: 89.5, type: 'EXPENSE', category: 'Alimentação', daysAgo: 3 },
  { title: 'Almoço no trabalho', amount: 34.9, type: 'EXPENSE', category: 'Alimentação', daysAgo: 4 },
  { title: 'Delivery de pizza', amount: 72.8, type: 'EXPENSE', category: 'Alimentação', daysAgo: 6 },
  { title: 'Padaria', amount: 28.4, type: 'EXPENSE', category: 'Alimentação', daysAgo: 8 },
  { title: 'Café da manhã', amount: 19.9, type: 'EXPENSE', category: 'Alimentação', daysAgo: 11 },
  { title: 'Almoço de domingo', amount: 118.6, type: 'EXPENSE', category: 'Alimentação', daysAgo: 13 },
  { title: 'Lanche da tarde', amount: 23.5, type: 'EXPENSE', category: 'Alimentação', daysAgo: 16 },
  { title: 'Delivery de sushi', amount: 96.7, type: 'EXPENSE', category: 'Alimentação', daysAgo: 19 },
  { title: 'Restaurante japonês', amount: 145.3, type: 'EXPENSE', category: 'Alimentação', daysAgo: 23 },
  { title: 'Cafeteria', amount: 31.2, type: 'EXPENSE', category: 'Alimentação', daysAgo: 27 },
  { title: 'Hamburgueria', amount: 67.4, type: 'EXPENSE', category: 'Alimentação', daysAgo: 31 },
  { title: 'Feira orgânica', amount: 54.1, type: 'EXPENSE', category: 'Alimentação', daysAgo: 36 },

  // Transporte (8)
  { title: 'Posto de Gasolina', amount: 100, type: 'EXPENSE', category: 'Transporte', daysAgo: 4 },
  { title: 'Uber para o aeroporto', amount: 78.9, type: 'EXPENSE', category: 'Transporte', daysAgo: 10 },
  { title: 'Recarga do bilhete único', amount: 50, type: 'EXPENSE', category: 'Transporte', daysAgo: 14 },
  { title: 'Estacionamento', amount: 32, type: 'EXPENSE', category: 'Transporte', daysAgo: 18 },
  { title: 'Posto de Gasolina', amount: 180.5, type: 'EXPENSE', category: 'Transporte', daysAgo: 22 },
  { title: 'Revisão do carro', amount: 420, type: 'EXPENSE', category: 'Transporte', daysAgo: 29 },
  { title: 'Pedágio', amount: 27.6, type: 'EXPENSE', category: 'Transporte', daysAgo: 33 },
  { title: 'Corrida de aplicativo', amount: 41.3, type: 'EXPENSE', category: 'Transporte', daysAgo: 38 },

  // Utilidades (7)
  { title: 'Aluguel', amount: 1700, type: 'EXPENSE', category: 'Utilidades', daysAgo: 7 },
  { title: 'Conta de luz', amount: 189.9, type: 'EXPENSE', category: 'Utilidades', daysAgo: 12 },
  { title: 'Internet fibra', amount: 129.9, type: 'EXPENSE', category: 'Utilidades', daysAgo: 15 },
  { title: 'Conta de água', amount: 87.4, type: 'EXPENSE', category: 'Utilidades', daysAgo: 20 },
  { title: 'Plano de celular', amount: 69.9, type: 'EXPENSE', category: 'Utilidades', daysAgo: 25 },
  { title: 'Gás encanado', amount: 58.3, type: 'EXPENSE', category: 'Utilidades', daysAgo: 30 },
  { title: 'Condomínio', amount: 640, type: 'EXPENSE', category: 'Utilidades', daysAgo: 37 },

  // Mercado (3)
  { title: 'Compras no Mercado', amount: 156.8, type: 'EXPENSE', category: 'Mercado', daysAgo: 5 },
  { title: 'Compras Jantar', amount: 150, type: 'EXPENSE', category: 'Mercado', daysAgo: 11 },
  { title: 'Compra do mês', amount: 398.75, type: 'EXPENSE', category: 'Mercado', daysAgo: 26 },

  // Entretenimento (2)
  { title: 'Cinema', amount: 88, type: 'EXPENSE', category: 'Entretenimento', daysAgo: 17 },
  { title: 'Assinatura de streaming', amount: 55.9, type: 'EXPENSE', category: 'Entretenimento', daysAgo: 24 },

  // Saúde fica com 0 transações de proposito - o layout mostra esse estado
];

/** Data relativa a hoje, para o seed nunca ficar "velho". */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      name: 'Conta teste',
      email: DEMO_EMAIL,
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
    },
  });

  // limpa os dados de demonstracao para o seed ser idempotente
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });

  await prisma.category.createMany({
    data: CATEGORIES.map((category) => ({ ...category, userId: user.id })),
  });

  const categories = await prisma.category.findMany({ where: { userId: user.id } });
  const byName = new Map(categories.map((category) => [category.name, category.id]));

  await prisma.transaction.createMany({
    data: TRANSACTIONS.map((transaction) => ({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      date: daysAgo(transaction.daysAgo),
      categoryId: byName.get(transaction.category) ?? null,
      userId: user.id,
    })),
  });

  console.log('Seed concluido.');
  console.log(`  login: ${DEMO_EMAIL}`);
  console.log(`  senha: ${DEMO_PASSWORD}`);
  console.log(`  ${categories.length} categorias e ${TRANSACTIONS.length} transacoes criadas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
