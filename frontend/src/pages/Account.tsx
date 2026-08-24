import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { LogOut, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Avatar, ErrorState, PageLoader } from '@/components/ui/States';
import { UPDATE_PROFILE } from '@/graphql/operations';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/errors';

const schema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo.'),
});

type FormValues = z.infer<typeof schema>;

export function Account() {
  const { user, signOut } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '' } });

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  if (!user) return <PageLoader />;

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setSaved(false);
    try {
      await updateProfile({ variables: { input: { name: values.name } } });
      reset({ name: values.name });
      setSaved(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-[420px]">
      <div className="card p-6">
        <div className="flex flex-col items-center border-b border-gray-200 pb-5">
          <Avatar initials={user.initials} size="lg" />
          <h1 className="mt-3 font-semibold text-gray-800">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4" noValidate>
          {formError && <ErrorState message={formError} />}
          {saved && (
            <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success" role="status">
              Alterações salvas com sucesso.
            </p>
          )}

          <Input
            label="Nome completo"
            icon={User}
            placeholder="Seu nome completo"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="E-mail"
            icon={Mail}
            value={user.email}
            readOnly
            disabled
            helper="O e-mail não pode ser alterado"
          />

          <Button type="submit" fullWidth loading={isSubmitting} disabled={!isDirty}>
            Salvar alterações
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            icon={LogOut}
            className="text-danger hover:bg-danger/8"
            onClick={signOut}
          >
            Sair da conta
          </Button>
        </form>
      </div>
    </div>
  );
}
