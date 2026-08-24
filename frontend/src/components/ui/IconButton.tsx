import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** `danger` é o botão de deletar (vermelho), `neutral` o de editar */
  tone?: 'neutral' | 'danger';
  /** Obrigatório: o botão só tem ícone, precisa de nome acessível */
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, tone = 'neutral', label, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'danger'
          ? 'text-danger hover:border-danger/40 hover:bg-danger/8'
          : 'text-gray-600 hover:border-gray-300 hover:bg-gray-100',
        className,
      )}
      {...props}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
});
