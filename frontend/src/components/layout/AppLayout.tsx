import { NavLink, Outlet } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Avatar, PageLoader } from '@/components/ui/States';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transacoes', label: 'Transações', end: false },
  { to: '/categorias', label: 'Categorias', end: false },
];

function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-6 px-4 sm:px-6">
        <NavLink to="/" aria-label="Financy - ir para o dashboard">
          <Logo />
        </NavLink>

        <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-2 py-1.5 text-sm transition-colors',
                  isActive ? 'font-semibold text-brand' : 'text-gray-600 hover:text-gray-800',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/conta"
          aria-label="Minha conta"
          className="rounded-full transition-opacity hover:opacity-80"
        >
          <Avatar initials={user?.initials ?? '--'} />
        </NavLink>
      </div>
    </header>
  );
}

export function AppLayout() {
  const { initializing } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8">
        {initializing ? <PageLoader /> : <Outlet />}
      </main>
    </div>
  );
}
