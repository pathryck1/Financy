import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { ChevronRight, CircleArrowDown, CircleArrowUp, Plus, Receipt, Wallet } from 'lucide-react';
import { StatCard } from '@/components/layout/PageHeader';
import { CategoryIcon, CategoryTag } from '@/components/ui/Tag';
import { EmptyState, ErrorState, PageLoader } from '@/components/ui/States';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { DASHBOARD, type Category, type Summary, type Transaction } from '@/graphql/operations';
import { formatCurrency, formatShortDate, monthRange } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';

interface DashboardData {
  summary: Pick<Summary, 'balance'>;
  monthSummary: Pick<Summary, 'income' | 'expense'>;
  recentTransactions: { total: number; items: Transaction[] };
  categories: Category[];
}

export function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);

  // "do mês" nos cards = mês corrente
  const monthFilters = useMemo(() => {
    const now = new Date();
    return monthRange(now.getFullYear(), now.getMonth());
  }, []);

  const { data, loading, error } = useQuery<DashboardData>(DASHBOARD, {
    variables: { monthFilters },
  });

  if (loading && !data) return <PageLoader />;
  if (error) return <ErrorState message={getErrorMessage(error)} />;

  const categoriesWithUse = (data?.categories ?? []).filter((category) => category.transactionsCount > 0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Wallet className="size-4 text-cat-purple" aria-hidden />}
          label="Saldo total"
          value={formatCurrency(data?.summary.balance ?? 0)}
        />
        <StatCard
          icon={<CircleArrowUp className="size-4 text-success" aria-hidden />}
          label="Receitas do mês"
          value={formatCurrency(data?.monthSummary.income ?? 0)}
        />
        <StatCard
          icon={<CircleArrowDown className="size-4 text-danger" aria-hidden />}
          label="Despesas do mês"
          value={formatCurrency(data?.monthSummary.expense ?? 0)}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Transações recentes */}
        <section className="card lg:col-span-2">
          <header className="flex items-center justify-between px-5 py-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Transações recentes
            </h2>
            <Link
              to="/transacoes"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              Ver todas
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </header>

          {data?.recentTransactions.items.length ? (
            <ul>
              {data.recentTransactions.items.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center gap-3 border-t border-gray-200 px-5 py-3.5"
                >
                  <CategoryIcon
                    icon={transaction.category?.icon}
                    color={transaction.category?.color ?? '#6B7280'}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{transaction.title}</p>
                    <p className="text-xs text-gray-500">{formatShortDate(transaction.date)}</p>
                  </div>

                  {transaction.category && (
                    <CategoryTag
                      name={transaction.category.name}
                      color={transaction.category.color}
                      className="hidden sm:inline-flex"
                    />
                  )}

                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-sm font-semibold text-gray-800">
                      {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </span>
                    {transaction.type === 'INCOME' ? (
                      <CircleArrowUp className="size-4 shrink-0 text-success" aria-hidden />
                    ) : (
                      <CircleArrowDown className="size-4 shrink-0 text-danger" aria-hidden />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-t border-gray-200">
              <EmptyState
                icon={Receipt}
                title="Nenhuma transação ainda"
                description="Registre sua primeira despesa ou receita para acompanhar seu saldo."
              />
            </div>
          )}

          <footer className="border-t border-gray-200">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-medium text-brand transition-colors hover:bg-brand/5"
            >
              <Plus className="size-4" aria-hidden />
              Nova transação
            </button>
          </footer>
        </section>

        {/* Resumo por categoria */}
        <section className="card h-fit">
          <header className="flex items-center justify-between px-5 py-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">Categorias</h2>
            <Link
              to="/categorias"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              Gerenciar
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </header>

          {categoriesWithUse.length ? (
            <ul className="px-5 pb-4">
              {categoriesWithUse.map((category) => (
                <li key={category.id} className="flex items-center gap-3 py-2">
                  <CategoryTag name={category.name} color={category.color} />
                  <span className="ml-auto whitespace-nowrap text-xs text-gray-500">
                    {category.transactionsCount} {category.transactionsCount === 1 ? 'item' : 'itens'}
                  </span>
                  <span className="w-24 whitespace-nowrap text-right text-sm font-semibold text-gray-800">
                    {formatCurrency(category.transactionsTotal)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Receipt}
              title="Sem categorias em uso"
              description="Crie categorias para organizar suas transações."
              action={
                <Link
                  to="/categorias"
                  className="inline-flex h-9 items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100"
                >
                  Gerenciar categorias
                </Link>
              }
            />
          )}
        </section>
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={data?.categories ?? []}
      />
    </>
  );
}
