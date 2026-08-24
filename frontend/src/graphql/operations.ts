import { gql } from '@apollo/client';

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  transactionsCount: number;
  transactionsTotal: number;
}

export interface Transaction {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  type: TransactionType;
  date: string;
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null;
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
  transactionsCount: number;
  categoriesCount: number;
  mostUsedCategory: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null;
}

export interface TransactionFilters {
  type?: TransactionType | null;
  categoryId?: string | null;
  search?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

/* ------------------------------------------------------------------ */
/* Fragments                                                           */
/* ------------------------------------------------------------------ */

const CATEGORY_FIELDS = gql`
  fragment CategoryFields on Category {
    id
    name
    description
    icon
    color
    transactionsCount
    transactionsTotal
  }
`;

const TRANSACTION_FIELDS = gql`
  fragment TransactionFields on Transaction {
    id
    title
    description
    amount
    type
    date
    category {
      id
      name
      icon
      color
    }
  }
`;

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    avatarUrl
    initials
  }
`;

/* ------------------------------------------------------------------ */
/* Autenticacao                                                        */
/* ------------------------------------------------------------------ */

export const ME = gql`
  ${USER_FIELDS}
  query Me {
    me {
      ...UserFields
    }
  }
`;

export const SIGN_IN = gql`
  ${USER_FIELDS}
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      token
      user {
        ...UserFields
      }
    }
  }
`;

export const SIGN_UP = gql`
  ${USER_FIELDS}
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      user {
        ...UserFields
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  ${USER_FIELDS}
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
`;

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export const DASHBOARD = gql`
  ${TRANSACTION_FIELDS}
  ${CATEGORY_FIELDS}
  query Dashboard($monthFilters: TransactionFilters) {
    summary {
      balance
    }
    monthSummary: summary(filters: $monthFilters) {
      income
      expense
    }
    recentTransactions: transactions(limit: 5, orderBy: desc) {
      total
      items {
        ...TransactionFields
      }
    }
    categories {
      ...CategoryFields
    }
  }
`;

/* ------------------------------------------------------------------ */
/* Categorias                                                          */
/* ------------------------------------------------------------------ */

export const CATEGORIES = gql`
  ${CATEGORY_FIELDS}
  query Categories {
    categories {
      ...CategoryFields
    }
    summary {
      transactionsCount
      categoriesCount
      mostUsedCategory {
        id
        name
        icon
        color
      }
    }
  }
`;

export const CREATE_CATEGORY = gql`
  ${CATEGORY_FIELDS}
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      ...CategoryFields
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  ${CATEGORY_FIELDS}
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      ...CategoryFields
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      id
    }
  }
`;

/* ------------------------------------------------------------------ */
/* Transacoes                                                          */
/* ------------------------------------------------------------------ */

export const TRANSACTIONS = gql`
  ${TRANSACTION_FIELDS}
  query Transactions($filters: TransactionFilters, $limit: Int, $offset: Int) {
    transactions(filters: $filters, limit: $limit, offset: $offset, orderBy: desc) {
      total
      items {
        ...TransactionFields
      }
    }
  }
`;

export const CREATE_TRANSACTION = gql`
  ${TRANSACTION_FIELDS}
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      ...TransactionFields
    }
  }
`;

export const UPDATE_TRANSACTION = gql`
  ${TRANSACTION_FIELDS}
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      ...TransactionFields
    }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id) {
      id
    }
  }
`;

/** Toda mutacao invalida essas queries - mantem os totais sempre coerentes. */
export const REFETCHABLE_QUERIES = ['Dashboard', 'Categories', 'Transactions'];
