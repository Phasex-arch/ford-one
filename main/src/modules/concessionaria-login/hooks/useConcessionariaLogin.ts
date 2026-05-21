import { useState } from 'react';
import type { LoginState } from '../types/concessionaria-login.types';
import { authenticate } from '../services/concessionaria-login.service';

/**
 * Gerencia estado e lógica do formulário de login da concessionária.
 */
export function useConcessionariaLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [state, setState]       = useState<LoginState>({
    loading:       false,
    error:         false,
    usernameError: false,
    passwordError: false,
  });

  const clearErrors = () =>
    setState((prev) => ({ ...prev, error: false, usernameError: false, passwordError: false }));

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
    const ok = await authenticate({ username, password });

    if (!ok) {
      setState({ loading: false, error: true, usernameError: true, passwordError: true });
      setPassword('');
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
