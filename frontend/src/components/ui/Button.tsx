import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark disabled:bg-brand/40 disabled:text-white/80',
  secondary:
    'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-white',
  ghost: 'bg-transparent text-brand hover:bg-brand/8 disabled:text-gray-400',
  danger: 'bg-danger text-white hover:brightness-95 disabled:bg-danger/40',
};

const SIZES: Record<Size, string> = {
  md: 'h-11 px-4 text-sm gap-2',
  sm: 'h-9 px-3 text-sm gap-1.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, icon: Icon, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="size-4" aria-hidden />
      )}
      {children}
    </button>
  );
});
