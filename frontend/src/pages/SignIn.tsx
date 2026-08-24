import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react';
import { AuthShell, OrDivider } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/States';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/errors';

const schema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

type FormValues = z.infer<typeof schema>;

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryNote, setShowRecoveryNote] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await signIn(values.email, values.password);
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível entrar.'));
    }
  }

  return (
    <AuthShell title="Fazer login" subtitle="Entre na sua conta para continuar">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {formError && <ErrorState message={formError} />}

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="mail@exemplo.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Digite sua senha"
          icon={Lock}
          error={errors.password?.message}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              className="size-3.5 rounded border-gray-300 accent-brand"
            />
            Lembrar-me
          </label>
          <button
            type="button"
            onClick={() => setShowRecoveryNote(true)}
            className="text-sm font-medium text-brand hover:underline"
          >
            Recuperar senha
          </button>
        </div>

        {showRecoveryNote && (
          <p className="-mt-1 text-xs text-gray-500">
            A recuperação de senha está no layout, mas não faz parte das funcionalidades pedidas no
            desafio — por isso ainda não tem um fluxo implementado.
          </p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Entrar
        </Button>
      </form>

      <OrDivider />

      <p className="text-center text-sm text-gray-600">Ainda não tem uma conta?</p>
      <Button
        variant="secondary"
        fullWidth
        icon={UserPlus}
        className="mt-3"
        onClick={() => navigate('/cadastro')}
      >
        Criar conta
      </Button>
    </AuthShell>
  );
}
