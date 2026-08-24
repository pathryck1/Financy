import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Lock, Mail, User } from 'lucide-react';
import { AuthShell, OrDivider } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/States';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/errors';

const schema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo.'),
  email: z.string().min(1, 'Informe seu e-mail.').email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

type FormValues = z.infer<typeof schema>;

export function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await signUp(values);
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível criar a conta.'));
    }
  }

  return (
    <AuthShell title="Criar conta" subtitle="Comece a controlar suas finanças ainda hoje">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {formError && <ErrorState message={formError} />}

        <Input
          label="Nome completo"
          autoComplete="name"
          placeholder="Seu nome completo"
          icon={User}
          error={errors.name?.message}
          {...register('name')}
        />

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
          autoComplete="new-password"
          placeholder="Digite sua senha"
          icon={Lock}
          helper="A senha deve ter no mínimo 8 caracteres"
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

        <Button type="submit" fullWidth loading={isSubmitting}>
          Cadastrar
        </Button>
      </form>

      <OrDivider />

      <p className="text-center text-sm text-gray-600">Já tem uma conta?</p>
      <Button variant="secondary" fullWidth icon={LogIn} className="mt-3" onClick={() => navigate('/')}>
        Fazer login
      </Button>
    </AuthShell>
  );
}
