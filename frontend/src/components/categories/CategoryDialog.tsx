import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Field';
import { FieldWrapper } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/States';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  paletteFor,
} from '@/lib/categoryTheme';
import {
  CREATE_CATEGORY,
  REFETCHABLE_QUERIES,
  UPDATE_CATEGORY,
  type Category,
} from '@/graphql/operations';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o título da categoria.').max(40, 'No máximo 40 caracteres.'),
  description: z.string().trim().max(120, 'No máximo 120 caracteres.').optional(),
  icon: z.string().min(1),
  color: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

const EMPTY: FormValues = {
  name: '',
  description: '',
  icon: DEFAULT_CATEGORY_ICON,
  color: DEFAULT_CATEGORY_COLOR,
};

/** Grade de ícones do modal, igual à do Figma. */
function IconPicker({
  value,
  color,
  onChange,
}: {
  value: string;
  color: string;
  onChange: (icon: string) => void;
}) {
  const palette = paletteFor(color);

  return (
    <div className="grid grid-cols-8 gap-1.5">
      {CATEGORY_ICONS.map(({ name, Icon }) => {
        const isActive = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            aria-label={name}
            aria-pressed={isActive}
            className={cn(
              'inline-flex aspect-square items-center justify-center rounded-lg border transition-colors',
              isActive ? 'border-transparent' : 'border-gray-200 text-gray-500 hover:bg-gray-100',
            )}
            style={isActive ? { backgroundColor: palette.light, color: palette.dark } : undefined}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

/** As 7 cores do style guide. */
function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((entry) => {
        const isActive = value.toUpperCase() === entry.base;
        return (
          <button
            key={entry.name}
            type="button"
            onClick={() => onChange(entry.base)}
            aria-label={`Cor ${entry.name}`}
            aria-pressed={isActive}
            className={cn(
              'inline-flex h-8 w-11 items-center justify-center rounded-md transition-transform',
              isActive && 'ring-2 ring-gray-800 ring-offset-2',
            )}
            style={{ backgroundColor: entry.base }}
          >
            {isActive && <Check className="size-4 text-white" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const isEditing = Boolean(category);
  const [formError, setFormError] = useState<string | null>(null);

  const [createCategory] = useMutation(CREATE_CATEGORY, { refetchQueries: REFETCHABLE_QUERIES });
  const [updateCategory] = useMutation(UPDATE_CATEGORY, { refetchQueries: REFETCHABLE_QUERIES });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const selectedColor = watch('color');

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    reset(
      category
        ? {
            name: category.name,
            description: category.description ?? '',
            icon: category.icon,
            color: paletteFor(category.color).base,
          }
        : EMPTY,
    );
  }, [open, category, reset]);

  async function onSubmit(values: FormValues) {
    setFormError(null);
    const input = {
      name: values.name,
      description: values.description?.trim() ? values.description.trim() : null,
      icon: values.icon,
      color: values.color,
    };

    try {
      if (category) {
        await updateCategory({ variables: { id: category.id, input } });
      } else {
        await createCategory({ variables: { input } });
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
      title={isEditing ? 'Editar categoria' : 'Nova categoria'}
      description="Organize suas transações com categorias"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {formError && <ErrorState message={formError} />}

        <Input
          label="Título"
          placeholder="Ex. Alimentação"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Descrição"
          placeholder="Descrição da categoria"
          helper="Opcional"
          error={errors.description?.message}
          {...register('description')}
        />

        <FieldWrapper label="Ícone">
          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <IconPicker value={field.value} color={selectedColor} onChange={field.onChange} />
            )}
          />
        </FieldWrapper>

        <FieldWrapper label="Cor">
          <Controller
            control={control}
            name="color"
            render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} />}
          />
        </FieldWrapper>

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-1">
          Salvar
        </Button>
      </form>
    </Dialog>
  );
}
