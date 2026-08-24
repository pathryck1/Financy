# Financy

Aplicação full stack de gerenciamento de finanças pessoais: autenticação, transações e
categorias, com cada usuário enxergando e gerenciando apenas os próprios dados.

```
financy/
├── backend/    API GraphQL (Apollo Server + Prisma + SQLite)
├── frontend/   Aplicação React (Vite + Apollo Client + Tailwind)
└── design/     Exports do layout do Figma usados como referência
```

## Rodando localmente

Pré-requisito: **Node.js 20+**.

### 1. Back-end

```bash
cd backend
npm install
cp .env.example .env      # no Windows: copy .env.example .env
npm run setup             # migration + Prisma Client
npm run db:seed           # opcional, mas recomendado
npm run dev
```

API em **http://localhost:4000/graphql**

### 2. Front-end

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env      # no Windows: copy .env.example .env
npm run dev
```

Aplicação em **http://localhost:5173**

### Conta de demonstração

O seed cria um usuário com as 8 categorias e 36 transações do layout:

```
e-mail: conta@teste.com
senha:  financy123
```

## Funcionalidades

| Requisito                                                   | Back-end | Front-end |
| ----------------------------------------------------------- | :------: | :-------: |
| Criar conta e fazer login                                    | ✅ | ✅ |
| Ver e gerenciar apenas os próprios dados                     | ✅ | ✅ |
| Criar transação                                              | ✅ | ✅ |
| Editar transação                                             | ✅ | ✅ |
| Deletar transação                                            | ✅ | ✅ |
| Listar todas as transações                                   | ✅ | ✅ |
| Criar categoria                                              | ✅ | ✅ |
| Editar categoria                                             | ✅ | ✅ |
| Deletar categoria                                            | ✅ | ✅ |
| Listar todas as categorias                                   | ✅ | ✅ |

Requisitos não funcionais: **TypeScript**, **GraphQL**, **Prisma**, **SQLite** no back-end;
**TypeScript**, **React**, **Vite sem framework**, **GraphQL** no front-end. CORS habilitado
e `.env.example` nos dois projetos.

## Decisões que valem uma nota

- **`Transaction.type` é `String` no Prisma, não enum** — o provider SQLite não suporta enums
  nativos. O valor é validado pelo enum `TransactionType` do GraphQL e por Zod nos resolvers.
- **Deletar uma categoria não apaga as transações** (`onDelete: SetNull`): elas ficam sem
  categoria. Apagar histórico financeiro junto com um rótulo seria destrutivo demais.
- **Isolamento por usuário** é feito com `findFirst({ where: { id, userId } })` em vez de
  `findUnique({ where: { id } })`. Acessar o recurso de outra pessoa devolve `NOT_FOUND`,
  sem vazar a existência do registro.
- **`transactions` devolve `TransactionPage` (`items` + `total`)** porque a tela de
  Transações tem paginação com o rodapé "1 a 10 | 36 resultados".
- **`Category` tem `icon` e `color`** porque o modal do layout traz um seletor de ícone
  (Lucide) e as 7 cores do style guide.
- **Apollo Server 5** — a v4 chegou ao fim de vida em janeiro/2026.
- **Prisma fixado no 6.x** — o Prisma 7 removeu `url = env("DATABASE_URL")` do schema e passou
  a exigir `prisma.config.ts` com driver adapter, o que quebraria o formato de `.env.example`
  pedido no enunciado.

Cada projeto tem seu próprio README com o detalhamento: [`backend/README.md`](./backend/README.md)
e [`frontend/README.md`](./frontend/README.md).

## Layout

O design veio do Figma ([Financy Community](https://www.figma.com/community)). Os tokens
(cores, tipografia, ícones) foram extraídos da aba **Style Guide** e estão documentados no
README do front-end. Os exports usados como referência ficam em `design/`.
