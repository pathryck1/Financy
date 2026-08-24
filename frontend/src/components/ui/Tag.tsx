import { CircleArrowDown, CircleArrowUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconFor, paletteFor } from '@/lib/categoryTheme';
import type { TransactionType } from '@/graphql/operations';

/** Badge da categoria: fundo no tom `light` e texto no tom `dark` do style guide. */
export function CategoryTag({ name, color, className }: { name: string; color: string; className?: string }) {
  const palette = paletteFor(color);

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', className)}
      style={{ backgroundColor: palette.light, color: palette.dark }}
    >
      {name}
    </span>
  );
}

/** Quadrado arredondado com o ícone da categoria, usado nas listas e nos cards. */
export function CategoryIcon({
  icon,
  color,
  size = 'md',
}: {
  icon?: string | null;
  color: string;
  size?: 'md' | 'lg';
}) {
  const palette = paletteFor(color);
  const Icon: LucideIcon = iconFor(icon);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg',
        size === 'md' ? 'size-9' : 'size-10',
      )}
      style={{ backgroundColor: palette.light, color: palette.dark }}
    >
      <Icon className={size === 'md' ? 'size-4.5' : 'size-5'} aria-hidden />
    </span>
  );
}

/** "Entrada" / "Saída" com a seta circular, como na coluna Tipo da tabela. */
export function TypeBadge({ type, className }: { type: TransactionType; className?: string }) {
  const isIncome = type === 'INCOME';
  const Icon = isIncome ? CircleArrowUp : CircleArrowDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium',
        isIncome ? 'text-success' : 'text-danger',
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
      {isIncome ? 'Entrada' : 'Saída'}
    </span>
  );
}
