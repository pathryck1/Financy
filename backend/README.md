# Financy — Back-end

API GraphQL para gerenciamento de finanças pessoais: autenticação, categorias e transações,
com isolamento total de dados por usuário.

## Stack

| Camada        | Tecnologia                      |
| ------------- | ------------------------------- |
| Linguagem     | TypeScript                      |
| Servidor HTTP | Express 5                       |
| API           | Apollo Server 5 (GraphQL, SDL)  |
| ORM           | Prisma 6                        |
| Banco         | SQLite                          |
| Auth          | JWT (`jsonwebtoken`) + `bcryptjs` |
| Validação     | Zod                             |

## Como rodar

```bash
cd backend
npm install
cp .env.example .env      # no Windows: copy .env.example .env
npm run setup             # roda a migration e gera o Prisma Client
npm run db:seed           # opcional: popula com dados de exemplo
npm run dev
```

A API sobe em **http://localhost:4000/graphql** (Apollo Sandbox disponível no navegador).
Health check em `http://localhost:4000/health`.

Usuário criado pelo seed: **conta@teste.com** / **financy123**
(8 categorias e 36 transações, espelhando os dados do layout do Figma)

### Scripts

| Script                 | O que faz                                         |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Sobe a API em modo watch (`tsx`)                  |
| `npm run build`        | Compila para `dist/`                              |
| `npm start`            | Roda a versão compilada                           |
| `npm run setup`        | `prisma migrate dev` + `prisma generate`          |
| `npm run db:seed`      | Popula o banco com dados de exemplo               |
| `npm run prisma:studio`| Abre o Prisma Studio                              |

## Variáveis de ambiente

| Variável         | Obrigatória | Padrão        | Descrição                                          |
| ---------------- | ----------- | ------------- | -------------------------------------------------- |
| `JWT_SECRET`     | ✅          | —             | Segredo usado para assinar os tokens JWT           |
| `DATABASE_URL`   | ✅          | —             | Conexão do SQLite, ex: `file:./dev.db`             |
| `PORT`           | ❌          | `4000`        | Porta da API                                       |
| `JWT_EXPIRES_IN` | ❌          | `7d`          | Validade do token                                  |
| `CORS_ORIGIN`    | ❌          | libera todas  | Origens permitidas, separadas por vírgula          |
| `NODE_ENV`       | ❌          | `development` | `development` \| `test` \| `production`            |

As variáveis são validadas com Zod na subida do servidor — se faltar alguma obrigatória,
o processo aborta com uma mensagem explicando o que está faltando.

## Modelagem

```
User 1 ──── N Category      (onDelete: Cascade)
User 1 ──── N Transaction   (onDelete: Cascade)
Category 1 ─ N Transaction  (onDelete: SetNull)
```

Decisões relevantes:

- **`Transaction.type` é `String`, não enum**: o provider SQLite do Prisma não suporta enums
  nativos. O valor é validado pelo enum `TransactionType` do GraphQL e por Zod nos resolvers.
- **`categoryId` é nullable com `onDelete: SetNull`**: apagar uma categoria não apaga o
  histórico financeiro — as transações apenas ficam sem categoria.
- **`@@unique([userId, name])` em `Category`**: cada usuário não repete nomes de categoria,
  mas dois usuários diferentes podem ter "Alimentação".
- **`Category.icon` e `Category.color`**: o modal de categoria do layout tem seletor de ícone
  e de cor. `icon` guarda o nome do ícone no [Lucide](https://lucide.dev) (ex: `utensils`) e
  `color` um hexadecimal do style guide (ex: `#2563EB`).

## Autenticação e isolamento de dados

O token JWT vai no header `Authorization: Bearer <token>`. O contexto do Apollo decodifica
o token e expõe `userId`; **toda** query e mutation protegida chama `requireAuth(context)` e
filtra as consultas do Prisma por `userId`. Buscas por id usam `findFirst({ where: { id, userId } })`
em vez de `findUnique({ where: { id } })` — assim, tentar acessar o recurso de outro usuário
retorna `NOT_FOUND` em vez de vazar a existência do registro.

## Schema GraphQL

### Queries

| Query                                                | Descrição                                   |
| ---------------------------------------------------- | ------------------------------------------- |
| `me`                                                 | Usuário autenticado                         |
| `categories`                                         | Lista as categorias do usuário              |
| `category(id)`                                       | Busca uma categoria                         |
| `transactions(filters, orderBy, limit, offset)`      | Lista paginada (`items` + `total`)          |
| `transaction(id)`                                    | Busca uma transação                         |
| `summary(filters)`                                   | Totais, contagens e categoria mais usada    |

### Mutations

| Mutation                        | Descrição                     |
| ------------------------------- | ----------------------------- |
| `signUp(input)`                 | Cria a conta e já devolve o token |
| `signIn(input)`                 | Login                         |
| `updateProfile(input)`          | Atualiza nome e avatar        |
| `createCategory(input)`         | Cria categoria                |
| `updateCategory(id, input)`     | Edita categoria               |
| `deleteCategory(id)`            | Remove categoria              |
| `createTransaction(input)`      | Cria transação                |
| `updateTransaction(id, input)`  | Edita transação               |
| `deleteTransaction(id)`         | Remove transação              |

### Filtros de transação

`TransactionFilters` aceita `type`, `categoryId`, `search` (título ou descrição),
`startDate` e `endDate`. Os mesmos filtros valem para `summary`.

## Códigos de erro

Os erros seguem `extensions.code` do GraphQL, com status HTTP correspondente:

| Código             | HTTP | Quando acontece                                  |
| ------------------ | ---- | ------------------------------------------------ |
| `UNAUTHENTICATED`  | 401  | Sem token, token inválido ou expirado            |
| `BAD_USER_INPUT`   | 400  | Falha de validação (Zod) ou credenciais inválidas |
| `NOT_FOUND`        | 404  | Registro inexistente ou de outro usuário         |
| `CONFLICT`         | 409  | E-mail já cadastrado, categoria duplicada        |

## Exemplo rápido

```graphql
mutation {
  signIn(input: { email: "conta@teste.com", password: "financy123" }) {
    token
    user { id name email }
  }
}
```

Com o token em mãos (`Authorization: Bearer <token>`):

```graphql
query {
  summary {
    income
    expense
    balance
    transactionsCount
    categoriesCount
    mostUsedCategory { name }
  }
  transactions(filters: { type: EXPENSE }, limit: 10, offset: 0) {
    total
    items {
      id
      title
      amount
      date
      category { name color icon }
    }
  }
}
```

> `transactions` devolve `TransactionPage` (`items` + `total`) porque a tela de Transações
> tem paginação com o rodapé "1 a 10 | 36 resultados".

## CORS

Habilitado via middleware `cors` no Express. Sem `CORS_ORIGIN` definido, todas as origens
são liberadas (conveniente em desenvolvimento). Em produção, defina a lista de origens.
