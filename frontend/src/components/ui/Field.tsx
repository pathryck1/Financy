import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldWrapperProps {
  label?: string;
  helper?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

/**
 * Estrutura do input no style guide: label em cima, campo, helper embaixo.
 * No estado de erro a label fica vermelha junto com a borda e o ícone.
 */
export function FieldWrapper({ label, helper, error, htmlFor, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn('text-sm font-medium', error ? 'text-danger' : 'text-gray-800')}
        >
          {label}
        </label>
      )}
      {children}
      {(error || helper) && (
        <p className={cn('text-xs', error ? 'text-danger' : 'text-gray-500')}>{error ?? helper}</p>
      )}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: ReactNode;
  error?: string;
  icon?: LucideIcon;
  /** Conteúdo fixo antes do valor, ex: o "R$" do campo de valor */
  prefix?: string;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helper, error, icon: Icon, prefix, trailing, className, id, disabled, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldWrapper label={label} helper={helper} error={error} htmlFor={inputId}>
      <div
        className={cn(
          'flex h-11 items-center gap-2 rounded-lg border bg-white px-3 transition-colors',
          'focus-within:border-gray-800 focus-within:ring-2 focus-within:ring-brand/15',
          error ? 'border-danger focus-within:border-danger' : 'border-gray-300',
          disabled && 'bg-gray-100 opacity-70',
          className,
        )}
      >
        {Icon && (
          <Icon
            className={cn('size-4 shrink-0', error ? 'text-danger' : 'text-gray-400')}
            aria-hidden
          />
        )}
        {prefix && <span className="shrink-0 text-sm text-gray-500">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
          {...props}
        />
        {trailing}
      </div>
    </FieldWrapper>
  );
});
