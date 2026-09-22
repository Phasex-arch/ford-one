export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginState {
  loading: boolean;
  /** null = sem erro; caso contrário, a mensagem real a mostrar — nunca
   * mais um "usuário ou senha incorretos" fixo pra qualquer falha (ver
   * auditoria, portal público: rate-limit e falha de rede tinham a mesma
   * mensagem de credencial errada). */
  error: string | null;
  usernameError: boolean;
  passwordError: boolean;
}
