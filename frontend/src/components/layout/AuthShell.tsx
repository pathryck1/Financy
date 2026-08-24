import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';

/** Moldura das telas de acesso: logo no topo e o card centralizado. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-10">
      <Logo className="mb-8" markClassName="size-7" />

      <div className="card w-full max-w-[360px] p-6">
        <div className="mb-5 text-center">
          <h1 className="text-lg font-bold text-gray-800">{title}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Divisor com a palavra "ou" no meio, como no Figma. */
export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-500">ou</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
