import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

/** Gera no máximo 5 números, com reticências quando a lista é longa. */
function pageNumbers(current: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, '...', totalPages];
  if (current >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', current, '...', totalPages];
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-3.5">
      <p className="text-sm text-gray-500">
        <span className="font-medium text-gray-800">
          {from} a {to}
        </span>
        <span className="mx-1.5 text-gray-300">|</span>
        {total} {total === 1 ? 'resultado' : 'resultados'}
      </p>

      <nav className="flex items-center gap-1.5" aria-label="Paginação">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>

        {pageNumbers(page, totalPages).map((item, index) =>
          item === '...' ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                item === page
                  ? 'border-brand bg-brand text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100',
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </nav>
    </div>
  );
}
