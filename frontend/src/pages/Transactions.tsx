import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Pencil, Plus, Receipt, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Field';
import { IconButton } from '@/components/ui/IconButton';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { CategoryIcon, CategoryTag, TypeBadge } from '@/components/ui/Tag';
import { EmptyState, ErrorState, PageLoader } from '@/components/ui/States';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import {
  CATEGORIES,
  DELETE_TRANSACTION,
  REFETCHABLE_QUERIES,
  TRANSACTIONS,
  type Category,
  type Transaction,
  type TransactionType,
} from '@/graphql/operations';
import { formatCurrency, formatMonthLabel, formatShortDate, monthRange } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';

const PAGE_SIZE = 10;

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'INCOME', label: 'Entrada' },
  { value: 'EXPENSE', label: 'Saída' },
];

/** Últimos 12 meses + "Todos os períodos", para o filtro de período. */
function buildPeriodOptions() {
  const options = [{ value: 'ALL', label: 'Todos os períodos' }];
  const now = new Date();

  for (let index = 0; index < 12; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    options.push({
      value: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatMonthLabel(date.getFullYear(), date.getMonth()),
    });
  }

  return options;
}

export function Transactions() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [categoryId, setCategoryId] = useState('ALL');
  const [period, setPeriod] = useState('ALL');
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const periodOptions = useMemo(buildPeriodOptions, []);

  const filters = useMemo(() => {
    const range =
      period === 'ALL'
        ? {}
        : (() => {
            const [year, month] = period.split('-').map(Number);
            return monthRange(year!, month!);
          })();

    return {
      search: search.trim() || null,
      type: type === 'ALL' ? null : (type as TransactionType),
      categoryId: categoryId === 'ALL' ? null : categoryId,
      ...range,
    };
  }, [search, type, categoryId, period]);

  const { data: categoriesData } = useQuery<{ categories: Category[] }>(CATEGORIES);

  const { data, loading, error } = useQuery<{ transactions: { total: number; items: Transaction[] } }>(
    TRANSACTIONS,
    { variables: { filters, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE } },
  );

  const [deleteTransaction, { loading: deletingLoading }] = useMutation(DELETE_TRANSACTION, {
    refetchQueries: REFETCHABLE_QUERIES,
  });

  const categories = categoriesData?.categories ?? [];
  const total = data?.transactions.total ?? 0;
  const items = data?.transactions.items ?? [];

  /** Qualquer mudança de filtro precisa voltar para a primeira página. */
  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteTransaction({ variables: { id: deleting.id } });
    setDeleting(null);
    // se a última linha da página foi removida, volta uma página
    if (items.length === 1 && page > 1) setPage(page - 1);
  }

  return (
    <>
      <PageHeader
        title="Transações"
        subtitle="Gerencie todas as suas transações financeiras"
        action={
          <Button icon={Plus} onClick={openNew}>
            Nova transação
          </Button>
        }
      />

      {/* Filtros */}
      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Buscar"
          placeholder="Buscar por descrição"
          icon={Search}
          value={search}
          onChange={(event) => updateFilter(setSearch)(event.target.value)}
        />
        <Select label="Tipo" value={type} onChange={updateFilter(setType)} options={TYPE_OPTIONS} />
        <Select
          label="Categoria"
          value={categoryId}
          onChange={updateFilter(setCategoryId)}
          options={[
            { value: 'ALL', label: 'Todas' },
            ...categories.map((category) => ({
              value: category.id,
              label: category.name,
              color: category.color,
            })),
          ]}
        />
        <Select
          label="Período"
          value={period}
          onChange={updateFilter(setPeriod)}
          options={periodOptions}
        />
      </div>

      {/* Tabela */}
      <section className="card overflow-hidden">
        {error ? (
          <ErrorState message={getErrorMessage(error)} className="m-4" />
        ) : loading && !data ? (
          <PageLoader />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Nenhuma transação encontrada"
            description="Ajuste os filtros ou registre uma nova transação."
            action={
              <Button size="sm" icon={Plus} onClick={openNew}>
                Nova transação
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3.5 text-left font-medium">Descrição</th>
                    <th className="px-3 py-3.5 text-left font-medium">Data</th>
                    <th className="px-3 py-3.5 text-left font-medium">Categoria</th>
                    <th className="px-3 py-3.5 text-left font-medium">Tipo</th>
                    <th className="px-3 py-3.5 text-right font-medium">Valor</th>
                    <th className="px-5 py-3.5 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-200 last:border-b-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <CategoryIcon
                            icon={transaction.category?.icon}
                            color={transaction.category?.color ?? '#6B7280'}
                          />
                          <span className="font-medium text-gray-800">{transaction.title}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                        {formatShortDate(transaction.date)}
                      </td>
                      <td className="px-3 py-3">
                        {transaction.category ? (
                          <CategoryTag
                            name={transaction.category.name}
                            color={transaction.category.color}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Sem categoria</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <TypeBadge type={transaction.type} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-gray-800">
                        {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton
                            icon={Trash2}
                            tone="danger"
                            label={`Excluir ${transaction.title}`}
                            onClick={() => setDeleting(transaction)}
                          />
                          <IconButton
                            icon={Pencil}
                            label={`Editar ${transaction.title}`}
                            onClick={() => openEdit(transaction)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </section>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        transaction={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir transação"
        message={`A transação "${deleting?.title}" será removida permanentemente. Essa ação não pode ser desfeita.`}
        loading={deletingLoading}
        onConfirm={confirmDelete}
      />
    </>
  );
}
