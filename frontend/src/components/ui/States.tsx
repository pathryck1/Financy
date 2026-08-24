import { Loader2, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-20 text-gray-400', className)}>
      <Loader2 className="size-6 animate-spin" aria-hidden />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-3 inline-flex size-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-gray-800">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-danger/30 bg-danger/8 px-4 py-3', className)} role="alert">
      <p className="text-sm text-danger">{message}</p>
    </div>
  );
}

/** Avatar circular com as iniciais, como o "CT" do header. */
export function Avatar({
  initials,
  size = 'md',
  className,
}: {
  initials: string;
  size?: 'md' | 'lg';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-700',
        size === 'md' ? 'size-9 text-xs' : 'size-16 text-lg',
        className,
      )}
    >
      {initials}
    </span>
  );
}
