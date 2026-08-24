import { cn } from '@/lib/utils';

/**
 * Marca do Financy: duas moedas sobrepostas + o wordmark.
 * O símbolo é redesenhado em SVG para ficar nítido em qualquer tamanho.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn('size-6 text-brand', className)} aria-hidden>
      {/* moeda maior, com o "1" no centro */}
      <circle cx="9.2" cy="9.2" r="6" stroke="currentColor" strokeWidth="2.1" />
      <path
        d="M8.2 7.1h1.1v4.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* moeda menor, sobreposta na diagonal */}
      <circle cx="15.4" cy="15.4" r="5.1" stroke="currentColor" strokeWidth="2.1" />
      <path
        d="M14.6 13.4h1.5v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-brand', className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-lg font-bold uppercase leading-none tracking-tight">
        Financy
      </span>
    </span>
  );
}
