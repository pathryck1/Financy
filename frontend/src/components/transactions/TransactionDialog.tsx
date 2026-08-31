import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { CircleArrowDown, CircleArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DateInput } from '@/components/ui/DateInput';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { ErrorState } from '@/components/ui/States';
import {
  CREATE_TRANSACTION,
  REFETCHABLE_QUERIES,
  UPDATE_TRANSACTION,
  type Category,
  type Transaction,
  type TransactionType,
} from '@/graphql/operations';
import { fromDateInputValue, parseCurrencyInput, toDateInputValue } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  title: z.string().trim().min(1, 'Informe a descrição.').max(60, 'No máximo 60 caracteres.'),
  date: z.string().min(1, 'Informe uma data válida no formato dd/mm/aaaa.'),
  amount: z
    .string()
    .min(1, 'Informe o valor.')
    .refine((value) => {
      const parsed = parseCurrencyInput(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, 'O valor deve ser maior que zero.'),
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Pick<Category, 'id' | 'name' | 'color'>[];
  /** Quando presente, o modal entra em modo de edição */
  transaction?: Transaction | null;
}

const EMPTY: FormValues = {
  type: 'EXPENSE',
  title: '',
  date: '',
  amount: '',
  categoryId: '',
};

/** Alternador Despesa / Receita do topo do modal. */
function TypeToggle({ value, onChange }: { value: TransactionType; onChange: (type: TransactionType) => void }) {
  const options = [
    { value: 'EXPENSE' as const, label: 'Despesa', Icon: CircleArrowDown, active: 'border-danger text-danger' },
    { value: 'INCOME' as const, label: 'Receita', Icon: CircleArrowUp, active: 'border-success text-success' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-1">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-colors',
              isActive ? cn('bg-white', option.active) : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <option.Icon className="size-4" aria-hidden />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function TransactionDialog({ open, onOpenChange, categories, transaction }: TransactionDialogProps) {
  const isEditing = Boolean(transaction);
  const [formError, setFormError] = useState<string | null>(null);

  const [createTransaction] = useMutation(CREATE_TRANSACTION, { refetchQueries: REFETCHABLE_QUERIES });
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION, { refetchQueries: REFETCHABLE_QUERIES });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  // recarrega o formulário sempre que o modal abre (novo ou edição)
  useEffect(() => {
    if (!open) return;
    setFormError(null);
    reset(
      transaction
        ? {
            type: transaction.type,
            title: transaction.title,
            date: toDateInputValue(transaction.date),
            amount: String(transaction.amount).replace('.', ','),
            categoryId: transaction.category?.id ?? '',
          }
        : { ...EMPTY, date: toDateInputValue(new Date().toISOString()) },
    );
  }, [open, transaction, reset]);

  async function onSubmit(values: FormValues) {
    setFormError(null);
    const input = {
      title: values.title,
      amount: parseCurrencyInput(values.amount),
      type: values.type,
      date: fromDateInputValue(values.date),
      categoryId: values.categoryId || null,
    };

    try {
      if (transaction) {
        await updateTransaction({ variables: { id: transaction.id, input } });
      } else {
        await createTransaction({ variables: { input } });
      }
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar transação' : 'Nova transação'}
      description="Registre sua despesa ou receita"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {formError && <ErrorState message={formError} />}

        <Controller
          control={control}
          name="type"
          render={({ field }) => <TypeToggle value={field.value} onChange={field.onChange} />}
        />

        <Input
          label="Descrição"
          placeholder="Ex. Almoço no restaurante"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <DateInput
                label="Data"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.date?.message}
              />
            )}
          />
          <Input
            label="Valor"
            inputMode="decimal"
            placeholder="0,00"
            prefix="R$"
            error={errors.amount?.message}
            {...register('amount')}
          />
        </div>

        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              label="Categoria"
              placeholder="Selecione"
              value={field.value || undefined}
              onChange={field.onChange}
              error={errors.categoryId?.message}
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
                color: category.color,
              }))}
            />
          )}
        />

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-1">
          Salvar
        </Button>
      </form>
    </Dialog>
  );
}
