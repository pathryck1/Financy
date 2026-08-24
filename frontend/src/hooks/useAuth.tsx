import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { ME, SIGN_IN, SIGN_UP, type User } from '@/graphql/operations';
import { clearToken, getToken, setToken } from '@/lib/authToken';

interface SignUpArgs {
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  /** true enquanto a sessao guardada esta sendo revalidada no /me */
  initializing: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (args: SignUpArgs) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [token, setTokenState] = useState<string | null>(() => getToken());

  // so consulta o /me quando existe token guardado
  const { data, loading } = useQuery<{ me: User }>(ME, { skip: !token });

  const [runSignIn] = useMutation<{ signIn: { token: string; user: User } }>(SIGN_IN);
  const [runSignUp] = useMutation<{ signUp: { token: string; user: User } }>(SIGN_UP);

  /** Guarda o token e ja semeia o cache com o usuario que a mutation devolveu. */
  const startSession = useCallback(
    (nextToken: string, user: User) => {
      setToken(nextToken);
      client.writeQuery({ query: ME, data: { me: user } });
      setTokenState(nextToken);
    },
    [client],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await runSignIn({ variables: { input: { email, password } } });
      const payload = result.data?.signIn;
      if (!payload) throw new Error('Não foi possível entrar.');
      startSession(payload.token, payload.user);
    },
    [runSignIn, startSession],
  );

  const signUp = useCallback(
    async ({ name, email, password }: SignUpArgs) => {
      const result = await runSignUp({ variables: { input: { name, email, password } } });
      const payload = result.data?.signUp;
      if (!payload) throw new Error('Não foi possível criar a conta.');
      startSession(payload.token, payload.user);
    },
    [runSignUp, startSession],
  );

  const signOut = useCallback(() => {
    clearToken();
    setTokenState(null);
    void client.clearStore();
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: token ? (data?.me ?? null) : null,
      initializing: Boolean(token) && loading && !data,
      isAuthenticated: Boolean(token),
      signIn,
      signUp,
      signOut,
    }),
    [token, data, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return context;
}
