import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-gray-800/40 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=open]:fade-in" />
        <RadixDialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl focus:outline-none"
          aria-describedby={description ? undefined : undefined}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <RadixDialog.Title className="text-base font-semibold text-gray-800">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="mt-0.5 text-sm text-gray-500">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              aria-label="Fechar"
            >
              <X className="size-4" aria-hidden />
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
