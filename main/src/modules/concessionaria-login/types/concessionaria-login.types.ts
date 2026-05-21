export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginState {
  loading: boolean;
  error: boolean;
  usernameError: boolean;
  passwordError: boolean;
}
