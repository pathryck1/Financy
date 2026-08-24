import type { ReactNode } from 'react';

/** Título + subtítulo à esquerda e a ação principal à direita. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * Card de estatística. O Figma usa duas montagens:
 * - `label-top`  (dashboard):  ícone + rótulo em cima, valor embaixo
 * - `value-top`  (categorias): ícone + valor na mesma linha, rótulo embaixo
 */
export function StatCard({
  icon,
  label,
  value,
  layout = 'label-top',
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  layout?: 'label-top' | 'value-top';
}) {
  if (layout === 'value-top') {
    return (
      <div className="card px-5 py-4">
        <div className="flex items-center gap-2.5">
          {icon}
          <p className="truncate text-[1.75rem] font-bold leading-tight text-gray-800">{value}</p>
        </div>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      </div>
    );
  }

  return (
    <div className="card px-5 py-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      </div>
      <p className="mt-2 text-[1.75rem] font-bold leading-tight text-gray-800">{value}</p>
    </div>
  );
}
