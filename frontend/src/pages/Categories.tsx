import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { ArrowUpDown, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { PageHeader, StatCard } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconButton } from '@/components/ui/IconButton';
import { CategoryIcon, CategoryTag } from '@/components/ui/Tag';
import { EmptyState, ErrorState, PageLoader } from '@/components/ui/States';
import { CategoryDialog } from '@/components/categories/CategoryDialog';
import {
  CATEGORIES,
  DELETE_CATEGORY,
  REFETCHABLE_QUERIES,
  type Category,
  type Summary,
} from '@/graphql/operations';
import { iconFor } from '@/lib/categoryTheme';
import { getErrorMessage } from '@/lib/errors';

interface CategoriesData {
  categories: Category[];
  summary: Pick<Summary, 'transactionsCount' | 'categoriesCount' | 'mostUsedCategory'>;
}

export function Categories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const { data, loading, error } = useQuery<CategoriesData>(CATEGORIES);
  const [deleteCategory, { loading: deletingLoading }] = useMutation(DELETE_CATEGORY, {
    refetchQueries: REFETCHABLE_QUERIES,
  });

  const categories = data?.categories ?? [];
  const mostUsed = data?.summary.mostUsedCategory;
  const MostUsedIcon = iconFor(mostUsed?.icon);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteCategory({ variables: { id: deleting.id } });
    setDeleting(null);
  }

  return (
    <>
      <PageHeader
        title="Categorias"
        subtitle="Organize suas transações por categorias"
        action={
          <Button icon={Plus} onClick={openNew}>
            Nova categoria
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Tag className="size-5 text-gray-700" aria-hidden />}
          label="Total de categorias"
          value={data?.summary.categoriesCount ?? 0}
          layout="value-top"
        />
        <StatCard
          icon={<ArrowUpDown className="size-5 text-cat-purple" aria-hidden />}
          label="Total de transações"
          value={data?.summary.transactionsCount ?? 0}
          layout="value-top"
        />
        <StatCard
          icon={
            <MostUsedIcon
              className="size-5"
              style={{ color: mostUsed?.color ?? 'var(--color-gray-500)' }}
              aria-hidden
            />
          }
          label="Categoria mais utilizada"
          value={mostUsed?.name ?? '—'}
          layout="value-top"
        />
      </div>

      <div className="mt-4">
        {error ? (
          <ErrorState message={getErrorMessage(error)} />
        ) : loading && !data ? (
          <PageLoader />
        ) : categories.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Tag}
              title="Nenhuma categoria ainda"
              description="Crie categorias para classificar suas receitas e despesas."
              action={
                <Button size="sm" icon={Plus} onClick={openNew}>
                  Nova categoria
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.id} className="card flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <CategoryIcon icon={category.icon} color={category.color} size="lg" />
                  <div className="flex gap-2">
                    <IconButton
                      icon={Trash2}
                      tone="danger"
                      label={`Excluir ${category.name}`}
                      onClick={() => setDeleting(category)}
                    />
                    <IconButton
                      icon={Pencil}
                      label={`Editar ${category.name}`}
                      onClick={() => openEdit(category)}
                    />
                  </div>
                </div>

                <h2 className="mt-3 font-semibold text-gray-800">{category.name}</h2>
                {category.description && (
                  <p className="mt-0.5 text-sm text-gray-500">{category.description}</p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <CategoryTag name={category.name} color={category.color} />
                  <span className="whitespace-nowrap text-sm text-gray-500">
                    {category.transactionsCount} {category.transactionsCount === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir categoria"
        message={
          deleting?.transactionsCount
            ? `"${deleting.name}" tem ${deleting.transactionsCount} ${
                deleting.transactionsCount === 1 ? 'transação' : 'transações'
              }. Elas serão mantidas, mas ficarão sem categoria.`
            : `A categoria "${deleting?.name}" será removida permanentemente.`
        }
        loading={deletingLoading}
        onConfirm={confirmDelete}
      />
    </>
  );
}
