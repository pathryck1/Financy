const STORAGE_KEY = 'financy:token';

/**
 * O token fica no localStorage para a sessao sobreviver a um refresh.
 * O Apollo le daqui a cada requisicao, entao nao precisa recriar o client no login.
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* modo privado / storage bloqueado: a sessao vale so para esta aba */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignora */
  }
}
