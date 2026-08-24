import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/ui/States';
import { useAuth } from '@/hooks/useAuth';
import { Account } from '@/pages/Account';
import { Categories } from '@/pages/Categories';
import { Dashboard } from '@/pages/Dashboard';
import { SignIn } from '@/pages/SignIn';
import { SignUp } from '@/pages/SignUp';
import { Transactions } from '@/pages/Transactions';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <PageLoader />
    </div>
  );
}

/**
 * Regra da raiz definida no desafio: `/` mostra o login quando deslogado
 * e o dashboard quando logado. As demais rotas privadas voltam para `/`.
 */
function ProtectedLayout() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;

  if (!isAuthenticated) {
    return location.pathname === '/' ? <SignIn /> : <Navigate to="/" replace />;
  }

  return <AppLayout />;
}

/** Cadastro só faz sentido para quem ainda não entrou. */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route
        path="/cadastro"
        element={
          <GuestOnly>
            <SignUp />
          </GuestOnly>
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transacoes" element={<Transactions />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/conta" element={<Account />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
