import { CombinedGraphQLErrors } from '@apollo/client/errors';

/**
 * Extrai a mensagem que o backend mandou, sem o prefixo técnico do Apollo.
 * Se for falha de rede, devolve algo acionável em vez de "Failed to fetch".
 */
export function getErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (!error) return fallback;

  if (CombinedGraphQLErrors.is(error)) {
    return error.errors[0]?.message ?? fallback;
  }

  if (error instanceof Error) {
    if (error.message === 'Failed to fetch' || error.name === 'ServerParseError') {
      return 'Não foi possível falar com o servidor. Confira se a API está rodando.';
    }
    return error.message;
  }

  return fallback;
}
