import { useState } from 'react';
import type { LoginState } from '../types/concessionaria-login.types';
import { authenticate } from '../services/concessionaria-login.service';
import { ApiError } from '../../../shared/api/client';

/**
 * Gerencia estado e lógica do formulário de login da concessionária.
 */
export function useConcessionariaLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [state, setState]       = useState<LoginState>({
    loading:       false,
    error:         null,
    usernameError: false,
    passwordError: false,
  });

  const clearErrors = () =>
    setState((prev) => ({ ...prev, error: null, usernameError: false, passwordError: false }));

  const handleLogin = async () => {
    clearErrors();

    if (!username || !password) {
      setState((prev) => ({
        ...prev,
        usernameError: !username,
        passwordError: !password,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    try {
      await authenticate({ username, password });
    } catch (err) {
      // Credencial errada de verdade (401) destaca os campos. Um 400 na
      // rota de login só pode ser email/senha em formato inválido (ex.:
      // senha menor que o mínimo exigido) — pra quem está logando isso é a
      // mesma coisa que "errei a senha", não um erro genérico do sistema.
      // Rate-limit ou falha de rede não é culpa do que a pessoa digitou,
      // então os campos ficam sem destaque e a senha não é apagada.
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        setState({ loading: false, error: 'Usuário ou senha incorretos.', usernameError: true, passwordError: true });
        setPassword('');
      } else if (err instanceof ApiError && err.status === 429) {
        setState({ loading: false, error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.', usernameError: false, passwordError: false });
      } else if (err instanceof ApiError) {
        setState({ loading: false, error: 'Não foi possível entrar agora. Tente novamente em instantes.', usernameError: false, passwordError: false });
      } else {
        setState({ loading: false, error: 'Sem conexão com o servidor. Verifique sua internet.', usernameError: false, passwordError: false });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return {
    username, setUsername,
    password, setPassword,
    showPass, setShowPass,
    state, handleLogin, handleKeyDown, clearErrors,
  };
}
