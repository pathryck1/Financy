import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { FieldWrapper } from '@/components/ui/Field';
import { fromDisplayDate, maskDisplayDate, toDisplayDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface DateInputProps {
  label?: string;
  error?: string;
  /** Valor no formato curto ISO ("2025-11-30"); vazio enquanto a data digitada nao esta completa */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * Campo de data em dd/mm/aaaa. O input[type=date] nativo exibe a data no locale
 * do navegador (mm/dd/yyyy em ingles), entao a digitacao acontece num campo de
 * texto com mascara e o calendario do navegador fica atras do botao, aberto via
 * showPicker(). Para fora o componente continua falando ISO curto, igual ao nativo.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
  { label, error, value, onChange, onBlur, name, disabled, id },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const pickerRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(() => toDisplayDate(value));

  // sincroniza quando o valor muda por fora (abrir o modal, trocar de transacao),
  // preservando o que esta sendo digitado enquanto ainda nao forma uma data valida
  useEffect(() => {
    setText((current) => (fromDisplayDate(current) === value ? current : toDisplayDate(value)));
  }, [value]);

  function handleType(raw: string) {
    const masked = maskDisplayDate(raw);
    setText(masked);
    onChange(fromDisplayDate(masked));
  }

  function handlePick(picked: string) {
    setText(toDisplayDate(picked));
    onChange(picked);
  }

  return (
    <FieldWrapper label={label} error={error} htmlFor={inputId}>
      <div
        className={cn(
          'relative flex h-11 items-center gap-2 rounded-lg border bg-white px-3 transition-colors',
          'focus-within:border-gray-800 focus-within:ring-2 focus-within:ring-brand/15',
          error ? 'border-danger focus-within:border-danger' : 'border-gray-300',
          disabled && 'bg-gray-100 opacity-70',
        )}
      >
        <input
          ref={ref}
          id={inputId}
          name={name}
          value={text}
          onChange={(event) => handleType(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/aaaa"
          aria-describedby={`${inputId}-formato`}
          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
        <span id={`${inputId}-formato`} className="sr-only">
          Formato dia, mês e ano com quatro dígitos
        </span>

        {/* ancora do calendario nativo: invisivel, mas posicionada para o popup abrir junto ao botao */}
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden
          value={value}
          onChange={(event) => handlePick(event.target.value)}
          className="pointer-events-none absolute bottom-0 right-3 size-px opacity-0"
        />
        <button
          type="button"
          onClick={() => pickerRef.current?.showPicker()}
          disabled={disabled}
          aria-label="Abrir calendário"
          className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed"
        >
          <CalendarDays className="size-4" aria-hidden />
        </button>
      </div>
    </FieldWrapper>
  );
});
