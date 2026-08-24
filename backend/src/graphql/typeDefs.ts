export const typeDefs = /* GraphQL */ `
  scalar DateTime

  enum TransactionType {
    INCOME
    EXPENSE
  }

  enum SortOrder {
    asc
    desc
  }

  type User {
    id: ID!
    name: String!
    email: String!
    avatarUrl: String
    "Iniciais do nome, usadas no avatar do header"
    initials: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    "Nome do icone no Lucide, ex: utensils"
    icon: String!
    "Cor hexadecimal do style guide, ex: #2563EB"
    color: String!
    "Quantidade de transacoes vinculadas a esta categoria"
    transactionsCount: Int!
    "Soma dos valores das transacoes desta categoria"
    transactionsTotal: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Transaction {
    id: ID!
    title: String!
    description: String
    amount: Float!
    type: TransactionType!
    date: DateTime!
    category: Category
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  "Pagina de transacoes - total serve para o rodape '1 a 10 | 27 resultados'"
  type TransactionPage {
    items: [Transaction!]!
    total: Int!
  }

  "Totais consolidados das transacoes do usuario"
  type Summary {
    income: Float!
    expense: Float!
    balance: Float!
    transactionsCount: Int!
    categoriesCount: Int!
    "Categoria com mais transacoes no periodo"
    mostUsedCategory: Category
  }

  input SignUpInput {
    name: String!
    email: String!
    password: String!
    avatarUrl: String
  }

  input SignInInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String
    avatarUrl: String
  }

  input CreateCategoryInput {
    name: String!
    description: String
    icon: String
    color: String
  }

  input UpdateCategoryInput {
    name: String
    description: String
    icon: String
    color: String
  }

  input CreateTransactionInput {
    title: String!
    description: String
    amount: Float!
    type: TransactionType!
    date: DateTime!
    categoryId: ID
  }

  input UpdateTransactionInput {
    title: String
    description: String
    amount: Float
    type: TransactionType
    date: DateTime
    categoryId: ID
  }

  input TransactionFilters {
    type: TransactionType
    categoryId: ID
    "Busca por titulo ou descricao"
    search: String
    startDate: DateTime
    endDate: DateTime
  }

  type Query {
    "Usuario autenticado no momento"
    me: User!

    categories: [Category!]!
    category(id: ID!): Category!

    transactions(filters: TransactionFilters, orderBy: SortOrder = desc, limit: Int, offset: Int): TransactionPage!
    transaction(id: ID!): Transaction!

    summary(filters: TransactionFilters): Summary!
  }

  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!

    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Category!

    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Transaction!
  }
`;
