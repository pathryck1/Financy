import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { clearToken, getToken } from './authToken';

const uri = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000/graphql';

const httpLink = new HttpLink({ uri });

const authLink = new SetContextLink((prevContext) => {
  const token = getToken();
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

/** Token expirado/invalido: derruba a sessao e volta para o login. */
const errorLink = new ErrorLink(({ error }) => {
  const unauthenticated =
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((graphQLError) => graphQLError.extensions?.code === 'UNAUTHENTICATED');

  if (unauthenticated && getToken()) {
    clearToken();
    window.location.assign('/');
  }
});

export const apolloClient = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // filtros e paginacao viram caches separados
          transactions: { keyArgs: ['filters', 'orderBy', 'limit', 'offset'] },
          summary: { keyArgs: ['filters'] },
        },
      },
    },
  }),
});
