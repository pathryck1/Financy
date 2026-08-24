import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FieldWrapper } from './Field';

export interface SelectOption {
  value: string;
  label: string;
  /** Bolinha colorida à esquerda da opção, usada no select de categoria */
  color?: string;
}

interface SelectProps {
  label?: string;
  helper?: ReactNode;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  helper,
  error,
  placeholder = 'Selecione',
  value,
  onChange,
  options,
  icon: Icon,
  disabled,
  className,
}: SelectProps) {
  const id = useId();

  return (
    <FieldWrapper label={label} helper={helper} error={error} htmlFor={id}>
      <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={id}
          className={cn(
            'flex h-11 w-full items-center gap-2 rounded-lg border bg-white px-3 text-sm transition-colors',
            'data-[state=open]:border-gray-800 focus-visible:border-gray-800',
            'data-[placeholder]:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100',
            error ? 'border-danger' : 'border-gray-300',
            className,
          )}
        >
          {Icon && <Icon className="size-4 shrink-0 text-gray-400" aria-hidden />}
          <span className="flex-1 truncate text-left">
            <RadixSelect.Value placeholder={placeholder} />
          </span>
          <RadixSelect.Icon>
            <ChevronDown className="size-4 text-gray-500" aria-hidden />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-800 outline-none data-[highlighted]:bg-gray-100"
                >
                  {option.color && (
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: option.color }}
                      aria-hidden
                    />
                  )}
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="ml-auto">
                    <Check className="size-4 text-brand" aria-hidden />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </FieldWrapper>
  );
}
